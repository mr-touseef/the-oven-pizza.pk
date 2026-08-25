import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

const ACCEPTED_STATUSES: OrderStatus[] = ["CONFIRMED", "PREPARING", "COMPLETED"];

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  if (!fromParam) {
    return NextResponse.json({ message: "Missing 'from' date." }, { status: 400 });
  }

  const from = new Date(`${fromParam}T00:00:00`);
  if (Number.isNaN(from.getTime())) {
    return NextResponse.json({ message: "Invalid 'from' date." }, { status: 400 });
  }

  let to: Date;
  if (toParam) {
    to = new Date(`${toParam}T23:59:59.999`);
    if (Number.isNaN(to.getTime())) {
      return NextResponse.json({ message: "Invalid 'to' date." }, { status: 400 });
    }
  } else {
    to = new Date();
  }

  if (from > to) {
    return NextResponse.json({ message: "'from' date must be before 'to' date." }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: {
      branchId: session.branch.id,
      status: { in: ACCEPTED_STATUSES },
      createdAt: { gte: from, lte: to },
    },
    select: { total: true },
  });

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;

  return NextResponse.json({
    from: from.toISOString(),
    to: to.toISOString(),
    totalSales,
    orderCount,
  });
}
