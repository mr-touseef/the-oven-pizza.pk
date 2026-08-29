// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendOTPEmail(
  email: string,
  otp: string,
  branchName: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"The Oven Pizza" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Password Reset Code - ${branchName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your admin password for <strong>${branchName}</strong>.</p>
          
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 12px; color: #666;">Your One-Time Password</p>
            <h1 style="margin: 10px 0; font-size: 48px; letter-spacing: 8px; color: #333;">${otp}</h1>
            <p style="margin: 10px 0; font-size: 12px; color: #999;">Valid for 15 minutes only</p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            ?? <strong>Never share this code</strong> with anyone.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}