import express from "express";
import jwt from "jsonwebtoken";
import { signup, login, getUser, verifyEmail, completeProfile } from "../controllers/authController.js";
import passport from "../config/googleAuthConfig.js";
import { sendVerificationEmail } from "../config/emailService.js";

const router = express.Router();

// ── Debug: test email sending on Render ─────────────────────────────────────
router.get("/test-email", async (req, res) => {
  try {
    const to = req.query.to || process.env.SMTP_USER;
    console.log("[test-email] Sending to:", to);
    console.log("[test-email] SMTP_HOST:", process.env.SMTP_HOST);
    console.log("[test-email] SMTP_USER:", process.env.SMTP_USER);
    console.log("[test-email] SMTP_PASS set:", !!process.env.SMTP_PASS);
    console.log("[test-email] FRONTEND_URL:", process.env.FRONTEND_URL);
    await sendVerificationEmail(to, "test-token-12345");
    res.json({ success: true, msg: `Test email sent to ${to}` });
  } catch (err) {
    console.error("[test-email] ERROR:", err);
    res.status(500).json({ success: false, error: err.message, code: err.code });
  }
});

// ── Existing email/password routes ──────────────────────────────────────────
router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
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