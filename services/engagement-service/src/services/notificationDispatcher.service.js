import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

// Setup Nodemailer Transporter matching identity-service SMTP configuration
const createTransporter = () => {
  const isSecure = process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '587', 10) === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

/**
 * Send Async Email Notification (FR-NOTIF-02)
 * Fire and forget wrapper - failures will NEVER throw or block core transactions (FR-NOTIF-04)
 */
export const sendEmailNotification = async (toEmail, subject, text, html) => {
  try {
    if (!toEmail) return;
    
    transporter.sendMail({
      from: process.env.SMTP_FROM || `"GharSetu Platform" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      text,
      html: html || `<p>${text}</p>`
    }).then((info) => {
      logger.info(`[Email Service] Notification sent to ${toEmail}: ${info.messageId}`);
    }).catch((err) => {
      logger.warn(`[Email Service Failure] Failed to send email to ${toEmail} (Non-blocking): ${err.message}`);
    });
  } catch (error) {
    logger.warn(`[Email Service Exception] Could not initiate email (Non-blocking): ${error.message}`);
  }
};
