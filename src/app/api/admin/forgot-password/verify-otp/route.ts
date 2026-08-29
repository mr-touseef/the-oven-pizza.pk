// src/app/api/admin/forgot-password/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isOTPExpired } from '@/lib/otp';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, otp, newPassword } = body;

    if (!email || !username || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, branch username, OTP, and new password required' },
        { status: 400 }
      );
    }

    // Rate limit: 5 attempts per 15 minutes per IP
    const ip = getClientIp(request);
    if (!checkRateLimit(`forgot-password-verify:${ip}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Try again later.' },
        { status: 429 }
      );
    }

    const branch = await prisma.branch.findFirst({
      where: { adminUsername: username, isActive: true },
    });

    if (!branch) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Find OTP record
    const otpRecord = await prisma.adminOTP.findFirst({
      where: {
        branchId: branch.id,
        contact: email,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'No OTP found. Request a new one.' },
        { status: 400 }
      );
    }

    // Check if expired
    if (isOTPExpired(otpRecord.expiresAt)) {
      await prisma.adminOTP.delete({ where: { id: otpRecord.id } });
      return NextResponse.json(
        { error: 'OTP expired. Request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      await prisma.adminOTP.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });

      if (otpRecord.attempts + 1 >= otpRecord.maxAttempts) {
        await prisma.adminOTP.delete({ where: { id: otpRecord.id } });
        return NextResponse.json(
          { error: 'Too many failed attempts. Request a new OTP.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // OTP valid! Update password
    const passwordHash = await hashPassword(newPassword);
    await prisma.branch.update({
      where: { id: branch.id },
      data: { passwordHash },
    });

    // Delete used OTP
    await prisma.adminOTP.delete({ where: { id: otpRecord.id } });

    return NextResponse.json(
      { success: true, message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
