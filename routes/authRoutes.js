import express from "express";
import jwt from "jsonwebtoken";
import { signup, login, getUser, verifyEmail, completeProfile, verifyOtp, resendOtp, forgotPassword, resetPassword } from "../controllers/authController.js";
import passport from "../config/googleAuthConfig.js";

const router = express.Router();

// ── Email/password routes ─────────────────────────────────────────────────────
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email/:token", verifyEmail);   // legacy link support
router.patch("/:id/complete-profile", completeProfile);
router.get("/:id", getUser);


// ── Google OAuth ─────────────────────────────────────────────────────────────
// Initiate OAuth — role is carried via `state` param so the callback knows it
router.get(
  "/google/patient",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: "patient",
    session: false,
  })
);

router.get(
  "/google/doctor",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: "doctor",
    session: false,
  })
);

// Google callback — sign JWT and redirect back to the frontend
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";

      if (err) {
        return res.redirect(`${FRONTEND}/auth/google/error?msg=${encodeURIComponent("Server error during Google login.")}`);
      }

      if (!user) {
        // Wrong-role or other failure
        const msg = info?.message || "Google login failed.";
        const role = info?.role || "";
        return res.redirect(
          `${FRONTEND}/auth/google/error?msg=${encodeURIComponent(msg)}&role=${role}`
        );
      }

      // Sign JWT
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
      );

      // Redirect to frontend success handler
      res.redirect(
        `${FRONTEND}/auth/google/success?token=${token}&role=${user.role}&profileCompleted=${user.profileCompleted}`
      );
    })(req, res, next);
  }
);

export default router;