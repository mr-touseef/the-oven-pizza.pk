// src/app/api/admin/forgot-password/request-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, getOTPExpiryTime } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, branchId } = body;

    if (!email || !branchId) {
      return NextResponse.json(
        { error: 'Email and branch ID required' },
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

    // Check if email is whitelisted
    const whitelisted = await prisma.whitelist.findFirst({
      where: { type: 'email', value: email },
    });

    if (!whitelisted) {
      return NextResponse.json(
        { success: true, message: 'If email is registered, you will receive an OTP.' },
        { status: 200 }
      );
    }

    // Get branch
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime();

    // Store OTP in database
    await prisma.adminOTP.create({
      data: {
        branchId,
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
