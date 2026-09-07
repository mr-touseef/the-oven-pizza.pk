import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { Deal } from "@/lib/types";
import DealsSection from "@/components/DealsSection";

export const metadata: Metadata = {
  title: "Deals & Offers | The Oven Pizza",
  description: "Happy Student Deals at The Oven Pizza — five combos priced for the daytime crowd, dine in or call ahead.",
};

export const revalidate = 300;

async function getDeals(): Promise<Deal[]> {
  try {
    return await prisma.deal.findMany({
      where: { isActive: true, priceRs: { gt: 0 } },
      orderBy: { displayOrder: "asc" },
    });
  } catch (error) {
    console.error("Failed to load deals from the database:", error);
    return [];
  }
}

export default async function DealsPage() {
  const deals = await getDeals();
  return <DealsSection deals={deals} />;
}
