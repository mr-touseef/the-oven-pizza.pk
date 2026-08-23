import type { MenuCategoryWithItems } from "@/lib/types";
import MenuItemRow from "./MenuItemRow";

export default function MenuCategoryCard({ category }: { category: MenuCategoryWithItems }) {
  return (
    <div className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/40 p-6 shadow-card backdrop-blur-sm sm:p-8">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl text-oven-crust">{category.name}</h3>
      </div>
      {category.tagline ? (
        <p className="mb-4 text-sm text-oven-cream/60">{category.tagline}</p>
      ) : null}
            <ul className="space-y-3">
        {category.items.map((item) => (
          <MenuItemRow key={item.id} item={item} categoryName={category.name} />
        ))}
      </ul>
    </div>
  );
}
