import User from "../models/User.js";
import DoctorProfile from "../models/DoctorProfile.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../config/emailService.js";

// ── Helper: generate 6-digit OTP ─────────────────────────────────────────────
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// ── SIGNUP ────────────────────────────────────────────────────────────────────
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "patient",
      isVerified: false,
      profileCompleted: false,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send OTP via EmailJS (fire and forget — don't block response)
    sendOtpEmail(email, name, otp).catch(err =>
      console.error("EmailJS OTP send error:", err.message)
    );

    res.status(201).json({
      msg: "Account created! Please verify your email with the OTP sent.",
      userId: user._id,
      email,
      role: user.role,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ── VERIFY OTP ────────────────────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found." });

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ msg: "No OTP found. Please request a new one." });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ msg: "OTP has expired. Please request a new one." });
    }

    if (user.otp !== String(otp)) {
      return res.status(400).json({ msg: "Invalid OTP. Please try again." });
    }

    // Mark verified and clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Issue JWT immediately so user is logged in after verify
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      msg: "Email verified successfully!",
      token,
      role: user.role,
      userId: user._id,
      profileCompleted: user.profileCompleted,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ── RESEND OTP ────────────────────────────────────────────────────────────────
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found." });

    if (user.isVerified) {
      return res.status(400).json({ msg: "Account is already verified." });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    sendOtpEmail(email, user.name, otp).catch(err =>
      console.error("EmailJS resend error:", err.message)
    );

    res.status(200).json({ msg: "New OTP sent to your email." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ── VERIFY EMAIL (legacy token link — kept for old links) ─────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ msg: "Invalid or expired verification token." });
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();
    res.status(200).json({ msg: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

    // If not verified — resend OTP and prompt user to verify
    if (!user.isVerified) {
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiry = Date.now() + 10 * 60 * 1000;
      await user.save();
      sendOtpEmail(email, user.name, otp).catch(err =>
        console.error("EmailJS login OTP error:", err.message)
      );
      return res.status(401).json({
        msg: "Email not verified.",
        needsVerification: true,
        email,
        role: user.role,
      });
    }

    // Role guard — prevent cross-role login
    if (expectedRole) {
      const allowedRoles = expectedRole === "doctor" ? ["doctor", "admin"] : ["patient"];
      if (!allowedRoles.includes(user.role)) {
        const correctPortal = expectedRole === "doctor" ? "Patient" : "Physiotherapist";
        return res.status(403).json({
          msg: `This is not a ${expectedRole === "doctor" ? "Physiotherapist" : "Patient"} account. Please use the ${correctPortal} login instead.`
        });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      role: user.role,
      userId: user._id,
      profileCompleted: user.profileCompleted,
      msg: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ── GET USER ──────────────────────────────────────────────────────────────────
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ── COMPLETE PROFILE (Onboarding) ─────────────────────────────────────────────
export const completeProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const {
      profilePhoto, phone, city,
      dateOfBirth, gender, bloodGroup,
      currentCondition, existingConditions, pastSurgeries,
      emergencyContactName, emergencyContactNumber,
      bio, experience, specialization, licenceNumber, hospitalName,
      fees, availableDays, availableTimeStart, availableTimeEnd, languages
    } = req.body;

    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;

    if (user.role === "patient") {
      if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
      if (gender !== undefined) user.gender = gender;
      if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
      if (currentCondition !== undefined) user.currentCondition = currentCondition;
      if (existingConditions !== undefined) user.existingConditions = existingConditions;
      if (pastSurgeries !== undefined) user.pastSurgeries = pastSurgeries;
      if (emergencyContactName !== undefined) user.emergencyContactName = emergencyContactName;
      if (emergencyContactNumber !== undefined) user.emergencyContactNumber = emergencyContactNumber;
    }

    if (user.role === "doctor") {
      let profile = await DoctorProfile.findOne({ user: id });
      if (!profile) profile = new DoctorProfile({ user: id });
      if (bio !== undefined) profile.bio = bio;
      if (experience !== undefined) profile.experience = experience;
      if (specialization !== undefined) profile.specialization = specialization;
      if (licenceNumber !== undefined) profile.licenceNumber = licenceNumber;
      if (hospitalName !== undefined) profile.hospitalName = hospitalName;
      if (fees !== undefined) profile.fees = fees;
      if (availableDays !== undefined) profile.availableDays = availableDays;
      if (availableTimeStart !== undefined) profile.availableTimeStart = availableTimeStart;
      if (availableTimeEnd !== undefined) profile.availableTimeEnd = availableTimeEnd;
      if (languages !== undefined) profile.languages = languages;
      profile.isAvailable = true;
      await profile.save();
    }

    user.profileCompleted = true;
    await user.save();

    res.status(200).json({ msg: "Profile completed successfully", user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    console.error("Complete profile error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "No account found with that email." });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    sendOtpEmail(email, user.name, otp).catch(err =>
      console.error("EmailJS forgot-password OTP error:", err.message)
    );

    res.status(200).json({ msg: "OTP sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found." });

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ msg: "No OTP found. Please request a new one." });
    }
    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ msg: "OTP expired. Please request a new one." });
    }
    if (user.otp !== String(otp)) {
      return res.status(400).json({ msg: "Invalid OTP." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;
    user.isVerified = true; // ensure verified after reset
    await user.save();

    res.status(200).json({ msg: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};