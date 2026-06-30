const userModel = require("../models/user.model.js");
const sessionModel = require("../models/session.model.js");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config/config.js");
const { sendEmail } = require("../services/email.service.js");
const { generateOtp, getOtpHtml } = require("../utils/utils.js");
const otpModel = require("../models/otp.model.js");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);


async function register(req, res) {
    const { username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            message: "Invalid email format"
        });
    }

    const isAlreadyRegistered = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    if (isAlreadyRegistered) {
        return res.status(409).json({
            message: " Username or email already exits"
        })
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");  // byheart this

    const role = req.body.role || "user";

    const otp = generateOtp();
    const html = getOtpHtml(otp);

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await otpModel.create({
        email,
        username,
        password: hashedPassword,
        role,
        otpHash
    })

     await sendEmail(email, "OTP Verification", `Your OTP code is  ${otp}`, html)

    res.status(201).json({
        message: "OTP sent successfully. Please verify your email to complete registration.",
        email: email
    })

}

async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    if(!user.verified){
        return res.status(401).json({
            message: "Email not verified"
        })
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const isPasswordValid = hashedPassword == user.password;

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const refreshToken = jwt.sign({
        id: user._id,
        role: user.role
    }, config.JWT_SECRET,
        {
            expiresIn: "7d"

        }
    )

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })

    const accessToken = jwt.sign({
        id: user._id,
        role: user.role,
        sessionId: session._id
    }, config.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    )

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.cookie("token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000 // 15 mins
    })

    res.status(200).json({
        message: "Logged in successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        },
        accessToken,
    })
}

async function getMe(req, res) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "token not found"
        })
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById(decoded.id)

    res.status(200).json({
        message: "user fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        }
    })
}

async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if (!session) {
        return res.status(401).json({
            message: "Invalid refresh token"
        })
    }

    const accessToken = jwt.sign({
        id: decoded.id,
        role: decoded.role
    }, config.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    )

    const newRefreshToken = jwt.sign({
        id: decoded.id,
        role: decoded.role
    }, config.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.cookie("token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000 // 15 mins
    })

    res.status(200).json({
        message: "Access token refreshed successfully",
        accessToken
    })
}

async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh token not found"
        })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");


    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    })

    if (!session) {
        return res.status(400).json({
            message: "Invalid refresh token"
        })
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken")
    res.clearCookie("token")

    res.status(200).json({
        message: "Logged  out successfully"
    })
}

async function logoutAll(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    await sessionModel.updateMany({
        user: decoded.id,
        revoked: false
    }, {
        revoked: true
    })

    res.status(200).json({
        message: "Logged out from all devices successfully"
    })
}

async function verifyEmail(req,res){
    const {otp , email} = req.body

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpDoc = await otpModel.findOne({
        email, 
        otpHash
    })

    if(!otpDoc){
        return res.status(400).json({
            message: "Invalid OTP"
        })
    }

    const user = await userModel.create({
        username: otpDoc.username,
        email: otpDoc.email,
        password: otpDoc.password,
        role: otpDoc.role,
        verified: true
    })

    await otpModel.deleteMany({
        email: otpDoc.email
    })

    return res.status(200).json({
        message: "Email verified successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            verified: user.verified
        }
    })
}

async function googleLogin(req, res) {
    const { credential } = req.body;
    
    if (!credential) {
        return res.status(400).json({ message: "Google credential is required" });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: config.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await userModel.findOne({ email });

        if (!user) {
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = crypto.createHash("sha256").update(randomPassword).digest("hex");
            
            let baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            let username = baseUsername;
            let counter = 1;
            while (await userModel.findOne({ username })) {
                username = baseUsername + counter;
                counter++;
            }

            user = await userModel.create({
                username,
                email,
                password: hashedPassword,
                verified: true
            });
        } else if (!user.verified) {
             user.verified = true;
             await user.save();
        }

        const refreshToken = jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, { expiresIn: "7d" });
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });

        const accessToken = jwt.sign({ id: user._id, role: user.role, sessionId: session._id }, config.JWT_SECRET, { expiresIn: "15m" });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000
        });

        res.status(200).json({
            message: "Logged in with Google successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                verified: user.verified
            },
            accessToken,
        });
    } catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({ message: "Invalid Google token" });
    }
}

module.exports = {
    register,
    login,
    googleLogin,
    getMe,
    refreshToken,
    logout,
    logoutAll,
    verifyEmail
};