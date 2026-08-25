import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PushSubscriberRole } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();

    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    const branchId = req.nextUrl.searchParams.get('branchId') || subscription.branchId;
    const roleParam = req.nextUrl.searchParams.get('role') || subscription.role;
    const role: PushSubscriberRole =
      roleParam === 'ADMIN' ? PushSubscriberRole.ADMIN : PushSubscriberRole.CUSTOMER;

    if (!branchId) {
      return NextResponse.json(
        { error: 'branchId is required' },
        { status: 400 }
      );
    }

    const storedSubscription = await prisma.pushSubscription.upsert({
      where: {
        endpoint: subscription.endpoint,
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        role,
      },
      create: {
        branchId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        role,
      },
    });

    console.log('[Push] Subscription stored:', storedSubscription.id, 'role:', role);

    return NextResponse.json(
      {
        success: true,
        message: 'Subscribed to push notifications',
        vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Push] Subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to push notifications' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      return NextResponse.json(
        { error: 'VAPID public key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({ vapidPublicKey });
  } catch (error) {
    console.error('[Push] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve VAPID public key' },
      { status: 500 }
    );
  }
}