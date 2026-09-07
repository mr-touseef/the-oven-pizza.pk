import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { MenuCategoryWithItems } from "@/lib/types";
import MenuSearch from "@/components/MenuSearch";
import FeaturedCarousel from "@/components/FeaturedCarousel";

export const metadata: Metadata = {
  title: "The Oven Pizza – Stone-Baked Pizza, Burgers, Shawarma & More",
  description:
    "The Oven Pizza serves stone-baked pizzas, burgers, shawarma, wings, coffee, and drinks across Mian Channu, Sahiwal, and Chichawatni.",
};

export const revalidate = 300;

async function getMenuData(): Promise<{
  categories: MenuCategoryWithItems[];
  dbUnavailable: boolean;
}> {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        items: {
          orderBy: { displayOrder: "asc" },
          include: { prices: { orderBy: { displayOrder: "asc" } } },
        },
      },
    });
    return { categories, dbUnavailable: false };
  } catch (error) {
    console.error("Failed to load menu data from the database:", error);
    return { categories: [], dbUnavailable: true };
  }
}

export default async function HomePage() {
  const { categories, dbUnavailable } = await getMenuData();

  const featuredItems = (() => {
    const picked: typeof categories[number]["items"] = [];
    let round = 0;
    while (picked.length < 8 && round < 5) {
      for (const cat of categories) {
        const item = cat.items[round];
        if (item && item.imageUrl && !picked.includes(item)) {
          picked.push(item);
        }
        if (picked.length >= 8) break;
      }
      round++;
    }
    return picked.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.prices[0]?.priceRs ?? 0,
      images: [item.imageUrl!, item.imageUrl!, item.imageUrl!] as [string, string, string],
    }));
  })();

  return (
    <>
      <MenuSearch categories={categories} />
      <FeaturedCarousel items={featuredItems} />

      {dbUnavailable ? (
        <div className="container-page py-16">
          <div
            role="alert"
            className="rounded-xl2 border border-oven-flame/30 bg-oven-flame/10 p-6 text-center text-oven-cream"
          >
            <p className="font-display text-xl text-oven-flame-light">Menu is warming up</p>
            <p className="mt-2 text-oven-cream/80">
              We could not reach the menu database just now. Please call us directly – see the Contact page.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
