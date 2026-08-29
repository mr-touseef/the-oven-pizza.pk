// src/app/api/admin/forgot-password/request-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, getOTPExpiryTime } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username } = body;

    if (!email || !username) {
      return NextResponse.json(
        { error: 'Email and branch username required' },
        { status: 400 }
      );
    }

    // Rate limit: 3 requests per 5 minutes per IP
    const ip = getClientIp(request);
    if (!checkRateLimit(`forgot-password-request:${ip}`, 3, 5 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      );
    }

    // Generic response used whenever we don't want to reveal whether the
    // email/username combination is valid (avoids account enumeration).
    const genericResponse = () =>
      NextResponse.json(
        { success: true, message: 'If your details are correct, you will receive an OTP by email.' },
        { status: 200 }
      );

    // Check if email is whitelisted
    const whitelisted = await prisma.whitelist.findFirst({
      where: { type: 'email', value: email },
    });

    if (!whitelisted) {
      return genericResponse();
    }

    // Resolve branch from its admin username (same value used to log in)
    const branch = await prisma.branch.findFirst({
      where: { adminUsername: username, isActive: true },
    });

    if (!branch) {
      return genericResponse();
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime();

    // Store OTP in database
    await prisma.adminOTP.create({
      data: {
        branchId: branch.id,
        contact: email,
        otp,
        expiresAt,
      },
    });

    // Send email
    const sent = await sendOTPEmail(email, otp, branch.name);
    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'OTP sent to email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
