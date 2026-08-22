import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MenuDashboard from "./MenuDashboard";

export const metadata: Metadata = {
  title: "Menu Prices — Branch Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const categories = await prisma.menuCategory.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      items: {
        orderBy: { displayOrder: "asc" },
        include: {
          prices: { orderBy: { displayOrder: "asc" } },
        },
      },
    },
  });

  return <MenuDashboard categories={categories} />;
}