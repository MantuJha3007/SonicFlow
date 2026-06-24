function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpHtml(otp) {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Your OTP Verification Code</h2>
            <p>Please use the following OTP to verify your account.</p>
            <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px; border-radius: 5px;">${otp}</h1>
            <p>This OTP is valid for a short period of time.</p>
        </div>
    `;
}

module.exports = {
    generateOtp,
    getOtpHtml
};
