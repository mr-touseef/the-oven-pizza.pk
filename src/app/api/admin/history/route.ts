import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const now = new Date();
  const since = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      branchId: session.branch.id,
      createdAt: { gte: since },
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      total: true,
      customerName: true,
    },
  });

  const accepted = orders.filter((o) => ["CONFIRMED", "PREPARING", "COMPLETED"].includes(o.status)).length;
  const rejected = orders.filter((o) => o.status === "CANCELLED").length;
  const pending = orders.filter((o) => o.status === "PENDING").length;

  return NextResponse.json({
    since: since.toISOString(),
    total: orders.length,
    accepted,
    rejected,
    pending,
    orders,
  });
}
