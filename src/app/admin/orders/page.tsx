import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrdersDashboard from "./OrdersDashboard";

export const metadata: Metadata = {
  title: "Orders — Branch Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  // Scoped to this branch only — a branch admin never sees another
  // branch's orders, by construction of this query.
  const orders = await prisma.order.findMany({
    where: { branchId: session.branch.id },
    orderBy: { createdAt: "desc" },
    include: { lines: true },
    take: 200,
  });

  return <OrdersDashboard branch={session.branch} initialOrders={orders} />;
}
