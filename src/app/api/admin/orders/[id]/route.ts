import { NextResponse } from "next/server";
import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { sendOrderStatusNotification } from '@/lib/services/pushNotificationService';

export const runtime = "nodejs";

const validStatuses = new Set(Object.values(OrderStatus));

// Updates the status of a single order — scoped so a branch admin can only
// ever touch an order that belongs to their own branch (the `branchId`
// filter below, not just the order `id`, guards that).
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const { status } = (body ?? {}) as { status?: unknown };
  if (typeof status !== "string" || !validStatuses.has(status as OrderStatus)) {
    return NextResponse.json({ message: "Invalid status." }, { status: 400 });
  }

  try {
    const existingOrder = await prisma.order.findFirst({
      where: { id: params.id, branchId: session.branch.id },
      select: { status: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    const oldStatus = existingOrder.status;

    const result = await prisma.order.updateMany({
      where: { id: params.id, branchId: session.branch.id },
      data: { status: status as OrderStatus },
    });

    if (result.count === 0) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    if (oldStatus !== status) {
      sendOrderStatusNotification(
        params.id,
        session.branch.id,
        status
      ).catch((err) => console.error("Push notification failed:", err));
    }

    return NextResponse.json({ message: "Order updated." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error updating order:", error.code);
    } else {
      console.error("Unexpected error updating order:", error);
    }
    return NextResponse.json({ message: "Couldn't update the order." }, { status: 500 });
  }
}