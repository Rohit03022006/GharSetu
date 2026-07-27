import { prisma } from '../lib/prisma.js';
import { hashPassword, comparePassword } from '../services/password.service.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/jwt.service.js';
import { generateOTP, hashOTP, verifyOTP, sendOTPEmail, sendPasswordResetOTPEmail } from '../services/otp.service.js';
import { registerSchema, loginSchema, refreshTokenSchema, verifyOTPSchema, resendOTPSchema, forgotPasswordSchema, resetPasswordWithOTPSchema } from '../validators/auth.validators.js';

export const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          ...(validatedData.phone ? [{ phone: validatedData.phone }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: { code: 'USER_EXISTS', message: 'User with this email or phone already exists.' } });
    }

    const passwordHash = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        phone: validatedData.phone,
        passwordHash,
        name: validatedData.name,
        role: validatedData.role,
        verificationStatus: 'UNVERIFIED',
      }
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Generate and send OTP for Email Verification
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    await prisma.oTPVerification.create({
      data: {
        email: user.email,
        otpHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins expiry
      }
    });

    await sendOTPEmail(user.email, otp);

    return res.status(201).json({
      message: 'Registration successful. Verification OTP sent to email.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        verificationStatus: user.verificationStatus,
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Register error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Registration failed.' } });
  }
};

export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: { code: 'ACCOUNT_SUSPENDED', message: 'Account is suspended.' } });
    }

    const isValidPassword = await comparePassword(validatedData.password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Login error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Login failed.' } });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    const decoded = verifyRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token invalid or expired.' } });
    }

    // Refresh Token Rotation: Delete old token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newAccessToken = generateAccessToken(storedToken.user);
    const newRefreshToken = generateRefreshToken(storedToken.user);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return res.status(401).json({ error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token.' } });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    return res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Logout failed.' } });
  }
};

export const googleCallbackHandler = async (req, res) => {
  try {
    const user = req.user;
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        verificationStatus: user.verificationStatus,
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'OAuth Callback failed.' } });
  }
};

export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = verifyOTPSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    const latestOTP = await prisma.oTPVerification.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestOTP || latestOTP.expiresAt < new Date()) {
      return res.status(400).json({ error: { code: 'OTP_EXPIRED', message: 'OTP has expired or is invalid.' } });
    }

    const isValid = await verifyOTP(otp, latestOTP.otpHash);
    if (!isValid) {
      return res.status(400).json({ error: { code: 'INVALID_OTP', message: 'Invalid OTP entered.' } });
    }

    // Determine verificationStatus: BUYER becomes VERIFIED upon OTP match; BROKER/BUILDER moves to PENDING for admin review
    const nextVerificationStatus = user.role === 'BUYER' ? 'VERIFIED' : 'PENDING';

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationStatus: nextVerificationStatus
      }
    });

    await prisma.oTPVerification.deleteMany({ where: { email } });

    return res.json({
      message: 'Email address verified successfully.',
      isEmailVerified: true,
      verificationStatus: nextVerificationStatus
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'OTP verification failed.' } });
  }
};

export const resendEmailOTP = async (req, res) => {
  try {
    const { email } = resendOTPSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    // Delete existing pending OTPs
    await prisma.oTPVerification.deleteMany({ where: { email } });

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    await prisma.oTPVerification.create({
      data: {
        email,
        otpHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    await sendOTPEmail(email, otp);

    return res.json({ message: 'New OTP sent to email address.' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to resend OTP.' } });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 generic message to prevent email enumeration
      return res.json({ message: 'If the email exists in our system, a password reset OTP has been sent.' });
    }

    // Delete existing pending PASSWORD_RESET OTPs for this email
    await prisma.oTPVerification.deleteMany({
      where: { email, type: 'PASSWORD_RESET' }
    });

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    await prisma.oTPVerification.create({
      data: {
        email,
        otpHash,
        type: 'PASSWORD_RESET',
        userId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes TTL
      }
    });

    await sendPasswordResetOTPEmail(email, otp);

    return res.json({ message: 'If the email exists in our system, a password reset OTP has been sent.' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Forgot password request failed.' } });
  }
};

export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = resetPasswordWithOTPSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found.' } });
    }

    const latestOTP = await prisma.oTPVerification.findFirst({
      where: { email, type: 'PASSWORD_RESET' },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestOTP || latestOTP.expiresAt < new Date()) {
      return res.status(400).json({ error: { code: 'OTP_EXPIRED', message: 'Password reset OTP has expired or is invalid.' } });
    }

    const isValid = await verifyOTP(otp, latestOTP.otpHash);
    if (!isValid) {
      return res.status(400).json({ error: { code: 'INVALID_OTP', message: 'Invalid OTP entered.' } });
    }

    const newPasswordHash = await hashPassword(newPassword);

    // Update user password and invalidate all active refresh tokens for security
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.oTPVerification.deleteMany({ where: { email, type: 'PASSWORD_RESET' } });

    return res.json({ message: 'Password reset successfully. Please login with your new password.' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Reset password error:', error);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Password reset failed.' } });
  }
};
