import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { MenuCategoryWithItems, Deal } from "@/lib/types";
import Hero from "@/components/Hero";
import MenuSearch from "@/components/MenuSearch";
import MenuCategoryTabs from "@/components/MenuCategoryTabs";
import DealsSection from "@/components/DealsSection";
import BranchesSection from "@/components/BranchesSection";
import ContactSection from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "Menu – Pizzas, Burgers, Shawarma, Drinks & Deals",
  description:
    "Browse the full menu at The Oven Pizza: stone-baked pizzas, burgers, shawarma, wings, coffee, drinks, and the Happy Student Deals, across all branches.",
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

export default async function HomePage() {
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
              We could not reach the menu database just now. If you are setting this
              project up for the first time, run{" "}
              <code className="rounded bg-oven-charcoal/60 px-1.5 py-0.5 font-mono text-sm">
                npx prisma migrate deploy
              </code>{" "}
              and{" "}
              <code className="rounded bg-oven-charcoal/60 px-1.5 py-0.5 font-mono text-sm">
                npm run db:seed
              </code>{" "}
              against your{" "}
              <code className="rounded bg-oven-charcoal/60 px-1.5 py-0.5 font-mono text-sm">
                DATABASE_URL
              </code>
              , then refresh. Otherwise, please call us directly – see the Contact section below.
            </p>
          </div>
        </div>
      ) : null}

      <MenuCategoryTabs categories={categories} />

      <DealsSection deals={deals} />

      <BranchesSection />

      <ContactSection />
    </>
  );
}

