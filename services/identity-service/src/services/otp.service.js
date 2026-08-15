import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const OTP_TTL_MINUTES = 10;

/**
 * Generate 6-digit numeric OTP
 */
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP for secure DB storage
 */
export const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

/**
 * Verify OTP against hash
 */
export const verifyOTP = async (otp, hash) => {
  return await bcrypt.compare(otp, hash);
};

/**
 * Send OTP Email via Nodemailer (Console fallback in dev if SMTP missing)
 */
export const sendOTPEmail = async (email, otp) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"GharSetu Verification" <${smtpUser}>`,
      to: email,
      subject: 'GharSetu - Email Verification OTP',
      text: `Your OTP for GharSetu email verification is: ${otp}. It will expire in ${OTP_TTL_MINUTES} minutes.`,
      html: `<h3>GharSetu Email Verification</h3><p>Your OTP is: <strong>${otp}</strong></p><p>This OTP will expire in ${OTP_TTL_MINUTES} minutes.</p>`,
    });
  } else {
    console.log(`\n==============================================`);
    console.log(`[DEV OTP EMAIL MOCK] To: ${email} | OTP: ${otp}`);
    console.log(`==============================================\n`);
  }
};

/**
 * Send Password Reset OTP Email via Nodemailer
 */
export const sendPasswordResetOTPEmail = async (email, otp) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"GharSetu Security" <${smtpUser}>`,
      to: email,
      subject: 'GharSetu - Password Reset OTP',
      text: `Your OTP for resetting your GharSetu account password is: ${otp}. It will expire in ${OTP_TTL_MINUTES} minutes.`,
      html: `<h3>GharSetu Password Reset Request</h3><p>Your password reset OTP is: <strong>${otp}</strong></p><p>If you did not request a password reset, please ignore this email.</p><p>This OTP will expire in ${OTP_TTL_MINUTES} minutes.</p>`,
    });
  } else {
    console.log(`\n==============================================`);
    console.log(`[DEV RESET OTP EMAIL MOCK] To: ${email} | OTP: ${otp}`);
    console.log(`==============================================\n`);
  }
};
