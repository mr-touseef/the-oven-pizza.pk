import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const runtime = "nodejs";

// Returns only the orders placed for the logged-in branch — a branch admin
// can never see another branch's orders, since the query is always scoped
// to session.branch.id from the verified session cookie (never a client-
// supplied branchId).
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { branchId: session.branch.id },
    orderBy: { createdAt: "desc" },
    include: { lines: true },
    take: 200,
  });

  return NextResponse.json({ branch: session.branch, orders });
}
