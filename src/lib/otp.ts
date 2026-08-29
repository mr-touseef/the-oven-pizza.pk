// lib/otp.ts
import crypto from 'crypto';

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate OTP expiry time (15 minutes from now)
 */
export function getOTPExpiryTime(): Date {
  const now = new Date();
  return new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
}

/**
 * Check if OTP has expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}