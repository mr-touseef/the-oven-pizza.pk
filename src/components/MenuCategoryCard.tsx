import type { MenuCategoryWithItems } from "@/lib/types";
import MenuItemRow from "./MenuItemRow";

export default function MenuCategoryCard({ 
  category, 
  isAllTab = false 
}: { 
  category: MenuCategoryWithItems;
  isAllTab?: boolean;
}) {
  return (
    <div>
      {!isAllTab ? (
        <div className="mb-6 flex flex-col items-center gap-1 text-center">
          <div className="flex w-full max-w-md items-center gap-4">
            <span className="h-px flex-1 bg-oven-flame-light/30" aria-hidden="true" />
            <h3 className="whitespace-nowrap font-display text-2xl text-oven-crust sm:text-3xl">
              {category.name}
            </h3>
            <span className="h-px flex-1 bg-oven-flame-light/30" aria-hidden="true" />
          </div>
          {category.tagline ? (
            <p className="text-sm text-oven-cream/60 sm:text-base">{category.tagline}</p>
          ) : null}
        </div>
      ) : null}
      <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {category.items.map((item, index) => (
          <MenuItemRow key={item.id} item={item} categoryName={category.name} index={index} />
        ))}
      </ul>
    </div>
  );
}
