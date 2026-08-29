"use client";

import { useMemo, useState } from "react";
import type { MenuCategoryWithItems } from "@/lib/types";
import MenuItemRow from "./MenuItemRow";

export default function MenuSearch({ categories }: { categories: MenuCategoryWithItems[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches: { item: MenuCategoryWithItems["items"][number]; categoryName: string }[] = [];
    for (const category of categories) {
      for (const item of category.items) {
        const nameMatch = item.name.toLowerCase().includes(q);
        const descMatch = item.description?.toLowerCase().includes(q) ?? false;
        if (nameMatch || descMatch) {
          matches.push({ item, categoryName: category.name });
        }
      }
    }
    return matches;
  }, [query, categories]);

  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-xl">
        <label htmlFor="menu-search" className="sr-only">
          Search the menu
        </label>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-oven-crust/40"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="menu-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for pizza, shawarma, coffee..."
            className="w-full rounded-full border border-oven-teal/20 bg-white py-3 pl-11 pr-4 text-oven-crust shadow-sm placeholder:text-oven-crust/40 focus:border-oven-flame-light focus:outline-none"
          />
        </div>
      </div>

      {query.trim() ? (
        <div className="mt-8">
          <p className="mb-4 text-center text-sm text-oven-crust/60">
            {results.length === 0
              ? `No items found for "${query}"`
              : `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`}
          </p>
          {results.length > 0 ? (
            <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
              {results.map(({ item, categoryName }) => (
                <MenuItemRow key={item.id} item={item} categoryName={categoryName} />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}