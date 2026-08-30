"use client";

import { useState, useMemo } from "react";
import type { MenuCategoryWithItems } from "@/lib/types";
import MenuCategoryCard from "./MenuCategoryCard";

type TabType = "all" | "pizza" | "burgers" | "shawarma" | "drinks" | "deals";

interface MenuCategoryTabsProps {
  categories: MenuCategoryWithItems[];
}

const TAB_CONFIG: Record<TabType, { label: string; slugs: string[] }> = {
  all: {
    label: "All",
    slugs: [
      "the-oven-royalties",
      "burgers-and-more",
      "wraps-and-sandwiches",
      "shawarma",
      "wings-and-sides",
      "the-oven-coffees",
      "drinks-bar",
      "desserts",
    ],
  },
  pizza: {
    label: "Pizza",
    slugs: ["the-oven-royalties"],
  },
  burgers: {
    label: "Burgers",
    slugs: ["burgers-and-more", "wraps-and-sandwiches"],
  },
  shawarma: {
    label: "Shawarma",
    slugs: ["shawarma", "wings-and-sides"],
  },
  drinks: {
    label: "Drinks",
    slugs: ["the-oven-coffees", "drinks-bar", "desserts"],
  },
  deals: {
    label: "Deals",
    slugs: [],
  },
};

export default function MenuCategoryTabs({ categories }: MenuCategoryTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Get random 2 items from array
  const getRandomItems = (items: any[], count: number = 2) => {
    if (items.length <= count) return items;
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const getVisibleCategories = useMemo(() => {
    return () => {
      const selectedSlugs = TAB_CONFIG[activeTab].slugs;
      let filtered = categories.filter((cat) => selectedSlugs.includes(cat.slug));

      // If "all" tab, limit to 2 random items per category
      if (activeTab === "all") {
        filtered = filtered.map((category) => ({
          ...category,
          items: getRandomItems(category.items, 2),
        }));
      }

      return filtered;
    };
  }, [activeTab, categories]);

  const visibleCategories = getVisibleCategories();

  return (
    <section className="scroll-mt-24 bg-white py-16 sm:py-24">
      {/* Dark green header with tabs */}
      <div className="bg-oven-teal-dark">
        <div className="container-page">
          <div className="py-6">
            <h2 className="mb-4 font-display text-2xl text-oven-cream sm:text-3xl">
              Browse our menu
            </h2>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TAB_CONFIG) as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 font-display text-sm font-medium transition-all sm:text-base ${
                    activeTab === tab
                      ? "bg-oven-teal-darker text-oven-cream"
                      : "bg-transparent text-oven-cream/70 hover:text-oven-cream"
                  }`}
                >
                  {TAB_CONFIG[tab].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu categories grid */}
      <div className="container-page py-16">
        {visibleCategories.length === 0 ? (
          <div
            role="alert"
            className="rounded-lg border border-oven-flame/30 bg-oven-flame/10 p-6 text-center text-oven-cream"
          >
            <p className="font-display text-lg text-oven-flame-light">
              No items in this category
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {visibleCategories.map((category) => (
              <MenuCategoryCard key={category.id} category={category} isAllTab={activeTab === "all"} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

