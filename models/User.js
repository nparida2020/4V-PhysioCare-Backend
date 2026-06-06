import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["patient", "doctor", "user", "admin"], default: "patient" },
  enrolledPrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Program" }],
  // Google OAuth fields
  googleId: { type: String, default: null },
  authProvider: { type: String, enum: ["local", "google"], default: "local" },
  // Two‑factor authentication fields
  twoFactorCode: { type: String, default: null },
  twoFactorExpiry: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  verificationTokenExpiry: { type: Date, default: null },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: null }
});

export default mongoose.model("User", userSchema);