import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { MenuCategoryWithItems, Deal } from "@/lib/types";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import DealsSection from "@/components/DealsSection";
import BranchesSection from "@/components/BranchesSection";
import ContactSection from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "Menu — Pizzas, Burgers, Shawarma, Drinks & Deals",
  description:
    "Browse the full menu at The Oven Pizza: stone-baked pizzas, burgers, shawarma, wings, coffee, drinks, and the Happy Student Deals, across all branches.",
};

// Menu content changes infrequently — revalidate every 5 minutes so edits
// made directly in the database show up without a full redeploy.
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

function bySlug(categories: MenuCategoryWithItems[], slugs: string[]) {
  return slugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is MenuCategoryWithItems => Boolean(c));
}

export default async function HomePage() {
  const { categories, deals, dbUnavailable } = await getMenuData();

  const pizzaCategories = bySlug(categories, ["the-oven-royalties"]);
  const burgerCategories = bySlug(categories, ["burgers-and-more", "wraps-and-sandwiches"]);
  const shawarmaCategories = bySlug(categories, ["shawarma", "wings-and-sides"]);
  const drinkCategories = bySlug(categories, ["the-oven-coffees", "drinks-bar", "desserts"]);

  return (
    <>
      <Hero />

      {dbUnavailable ? (
        <div className="container-page py-16">
          <div
            role="alert"
            className="rounded-xl2 border border-oven-flame/30 bg-oven-flame/10 p-6 text-center text-oven-cream"
          >
            <p className="font-display text-xl text-oven-flame-light">Menu is warming up</p>
            <p className="mt-2 text-oven-cream/80">
              We couldn&apos;t reach the menu database just now. If you&apos;re setting this
              project up for the first time, run{" "}
              <code className="rounded bg-oven-charcoal/60 px-1.5 py-0.5 font-mono text-sm">
                npx prisma migrate deploy
              </code>{" "}
              and{" "}
              <code className="rounded bg-oven-charcoal/60 px-1.5 py-0.5 font-mono text-sm">
                npm run db:seed
              </code>{" "}
              against your <code className="rounded bg-oven-charcoal/60 px-1.5 py-0.5 font-mono text-sm">DATABASE_URL</code>, then
              refresh. Otherwise, please call us directly — see the Contact section below.
            </p>
          </div>
        </div>
      ) : null}

      <MenuSection
        id="pizzas"
        eyebrow="Stone-baked, made to order"
        title="Pizzas"
        tagline="From classic Chicken Tikka to the loaded Oven Special Stuff — every pie is baked fresh per order."
        categories={pizzaCategories}
      />

      <MenuSection
        id="burgers"
        eyebrow="Flame-grilled"
        title="Burgers & More"
        tagline="Juicy patties, toasted buns, and hand-rolled wraps and sandwiches."
        categories={burgerCategories}
      />

      <MenuSection
        id="shawarma"
        eyebrow="Char-rolled"
        title="Shawarma, Wings & Sides"
        tagline="Fresh-rolled shawarma, crispy wings, loaded fries and platters to share."
        categories={shawarmaCategories}
      />

      <MenuSection
        id="drinks"
        eyebrow="Drinks & More"
        title="Coffee, Drinks & Desserts"
        tagline="Brewed coffee, hand-shaken drinks, cold bottles and a scoop of something sweet."
        categories={drinkCategories}
      />

      <DealsSection deals={deals} />

      <BranchesSection />

      <ContactSection />
    </>
  );
}