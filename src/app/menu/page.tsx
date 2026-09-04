import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { MenuCategoryWithItems, Deal } from "@/lib/types";
import MenuSearch from "@/components/MenuSearch";
import MenuCategoryTabs from "@/components/MenuCategoryTabs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theovenpizza.store";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Browse the full menu at The Oven Pizza: stone-baked pizzas, burgers, shawarma, wings, coffee, drinks, and deals, across all branches.",
  alternates: {
    canonical: `${siteUrl}/menu`,
  },
  openGraph: {
    title: "Menu | The Oven Pizza",
    description: "Stone-baked pizzas, burgers, shawarma, wings, coffee, drinks and deals.",
    url: `${siteUrl}/menu`,
  },
};

export const revalidate = 300;

async function getMenuData(): Promise<{
  categories: MenuCategoryWithItems[];
  deals: Deal[];
  dbUnavailable: boolean;
}> {
  try {
    const [categories, deals] = await Promise.all([
      prisma.menuCategory.findMany({
        orderBy: { displayOrder: "asc" },
        include: {
          items: {
            orderBy: { displayOrder: "asc" },
            include: { prices: { orderBy: { displayOrder: "asc" } } },
          },
        },
      }),
      prisma.deal.findMany({
        where: { isActive: true, priceRs: { gt: 0 } },
        orderBy: { displayOrder: "asc" },
      }),
    ]);
    return { categories, deals, dbUnavailable: false };
  } catch (error) {
    console.error("Failed to load menu data from the database:", error);
    return { categories: [], deals: [], dbUnavailable: true };
  }
}

export default async function MenuPage() {
  const { categories, deals, dbUnavailable } = await getMenuData();

  return (
    <>
      <MenuSearch categories={categories} />
      {dbUnavailable ? (
        <div className="container-page py-16">
          <div
            role="alert"
            className="rounded-xl2 border border-oven-flame/30 bg-oven-flame/10 p-6 text-center text-oven-cream"
          >
            <p className="font-display text-xl text-oven-flame-light">Menu is warming up</p>
            <p className="mt-2 text-oven-cream/80">
              We could not reach the menu database just now. Please call us directly, or try
              again shortly.
            </p>
          </div>
        </div>
      ) : null}
      <MenuCategoryTabs categories={categories} deals={deals} />
    </>
  );
}