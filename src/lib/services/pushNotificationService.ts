import webpush from 'web-push';
import { prisma } from '@/lib/prisma';
import { PushSubscriberRole } from '@prisma/client';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@theovenpizza.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendOrderStatusNotification(
  orderId: string,
  branchId: string,
  status: string,
  orderNumber?: string
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { branchId, role: PushSubscriberRole.CUSTOMER },
    });

    if (subscriptions.length === 0) {
      console.log(`[Push] No subscriptions found for branch ${branchId}`);
      return { sent: 0, failed: 0 };
    }

    const statusMessages: Record<string, { title: string; body: string }> = {
      PENDING: {
        title: 'Order Received',
        body: `Order #${orderNumber} received. We'"'"'re preparing it!`,
      },
      PREPARING: {
        title: 'Order Being Prepared',
        body: `Order #${orderNumber} is being prepared.`,
      },
      READY: {
        title: '🎉 Order Ready',
        body: `Order #${orderNumber} is ready for pickup!`,
      },
      OUT_FOR_DELIVERY: {
        title: '🚗 Out for Delivery',
        body: `Order #${orderNumber} is on its way to you!`,
      },
      DELIVERED: {
        title: '✅ Order Delivered',
        body: `Order #${orderNumber} has been delivered. Enjoy!`,
      },
      CANCELLED: {
        title: '❌ Order Cancelled',
        body: `Order #${orderNumber} has been cancelled.`,
      },
    };

    const message = statusMessages[status] || {
      title: 'Order Update',
      body: `Order #${orderNumber} status: ${status}`,
    };

    const payload = JSON.stringify({
      title: message.title,
      body: message.body,
      orderId,
      branchId,
      tag: `order-${orderId}`,
      requireInteraction: status === 'READY',
      url: `/orders/${orderId}`,
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
        sent++;
        console.log(`[Push] Notification sent to subscription ${sub.id}`);
      } catch (error: any) {
        failed++;
        console.error(`[Push] Failed to send to ${sub.endpoint}:`, error.message);

        if (error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
          console.log(`[Push] Deleted invalid subscription ${sub.id}`);
        }
      }
    }

    console.log(
      `[Push] Notifications sent: ${sent}/${subscriptions.length} (${failed} failed)`
    );

    return { sent, failed };
  } catch (error) {
    console.error('[Push] Error sending order notification:', error);
    throw error;
  }
}

export async function sendBroadcastNotification(
  branchId: string,
  title: string,
  body: string,
  url?: string
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { branchId },
    });

    if (subscriptions.length === 0) {
      console.log(`[Push] No subscriptions found for branch ${branchId}`);
      return { sent: 0, failed: 0 };
    }

    const payload = JSON.stringify({
      title,
      body,
      branchId,
      url: url || '/',
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
        sent++;
      } catch (error: any) {
        failed++;
        if (error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        }
      }
    }

    return { sent, failed };
  } catch (error) {
    console.error('[Push] Error sending broadcast notification:', error);
    throw error;
  }
}


export async function sendNewOrderNotification(
  orderId: string,
  branchId: string,
  customerName: string,
  total: number
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { branchId, role: PushSubscriberRole.ADMIN },
    });

    if (subscriptions.length === 0) {
      console.log(`[Push] No admin subscriptions found for branch ${branchId}`);
      return { sent: 0, failed: 0 };
    }

    const payload = JSON.stringify({
      title: '?? New Order',
      body: `${customerName} placed an order � Rs ${total}`,
      orderId,
      branchId,
      tag: `new-order-${orderId}`,
      requireInteraction: true,
      url: `/admin/orders`,
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
        sent++;
      } catch (error: any) {
        failed++;
        console.error(`[Push] Failed to send new-order push to ${sub.endpoint}:`, error.message);
        if (error.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
      }
    }

    console.log(`[Push] New-order notifications sent: ${sent}/${subscriptions.length} (${failed} failed)`);
    return { sent, failed };
  } catch (error) {
    console.error('[Push] Error sending new-order notification:', error);
    throw error;
  }
}
