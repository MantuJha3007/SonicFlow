const { Router } = require("express");
const authController = require("../controllers/auth.controller.js");

const authRouter = Router();

/**
 * POST /api/auth/register
 */

authRouter.post("/register", authController.register);

/**
 * Post /api/auth/login
 */

authRouter.post("/login", authController.login);

/**
 * POST /api/auth/google-login
 */
authRouter.post("/google-login", authController.googleLogin);

/**
 * GET /api/auth/get-me
 */

authRouter.get("/get-me", authController.getMe)

/**
 *  GET /api/auth/refresh-token
 */

authRouter.get("/refresh-token",authController.refreshToken)

/**
 * GET /api/auth/logout
 */

authRouter.get("/logout", authController.logout)

/**
 * GET /api/auth/logout-all
 */

authRouter.get("/logout-all", authController.logoutAll)

/**
 * GET /api/auth/verify-email
 */
authRouter.post("/verify-email", authController.verifyEmail)


module.exports = authRouter;