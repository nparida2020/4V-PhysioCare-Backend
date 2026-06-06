import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Transporter configuration - using environment variables or fallback to test account
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "test@example.com", // update with real credentials
    pass: process.env.SMTP_PASS || "testpassword",
  },
});

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"PhysioCare Security" <${process.env.SMTP_USER || 'security@physiocare.com'}>`,
    to: email,
    subject: "Verify Your Email - PhysioCare",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Welcome to PhysioCare!</h2>
        <p>Thank you for signing up. To start using your account, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 12px; color: #64748b;">${verificationLink}</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const send2FAEmail = async (email, code) => {
  const mailOptions = {
    from: `"PhysioCare Security" <${process.env.SMTP_USER || 'security@physiocare.com'}>`,
    to: email,
    subject: "Your 2FA Verification Code - PhysioCare",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563eb; text-align: center;">Security Verification</h2>
        <p>Your two-factor authentication (2FA) code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <h1 style="letter-spacing: 5px; font-size: 36px; color: #1e3a8a; background: #f1f5f9; padding: 20px; border-radius: 8px; display: inline-block;">${code}</h1>
        </div>
        <p>This code will expire in 10 minutes. Do not share this code with anyone.</p>
        <p style="font-size: 14px; color: #64748b;">If you didn't request this code, please contact our support team immediately.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; 2026 PhysioCare. All rights reserved.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
