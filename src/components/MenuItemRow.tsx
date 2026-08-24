"use client";

import Image from "next/image";
import type { MenuItemWithPrices } from "@/lib/types";
import { formatRs } from "@/lib/types";
import AddToCartButton from "./AddToCartButton";

export default function MenuItemRow({
  item,
  categoryName,
}: {
  item: MenuItemWithPrices;
  categoryName?: string;
}) {
  const onlyPrice = item.prices.length === 1 ? item.prices[0] : undefined;

  return (
             <li className="flex items-center gap-5 rounded-full border border-oven-cream/10 bg-oven-charcoal/30 py-4 pl-4 pr-6 transition-all duration-200 hover:border-oven-flame-light/40 hover:shadow-ember active:border-oven-flame-light/60 active:shadow-ember sm:pr-8">
            {item.imageUrl ? (
        <div className="relative -ml-4 h-28 w-28 shrink-0 drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] sm:-ml-6 sm:h-32 sm:w-32">
          <div className="relative h-full w-full overflow-hidden rounded-full border border-oven-cream/10 bg-oven-charcoal/40">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="font-display text-base leading-snug text-oven-cream sm:text-lg">{item.name}</p>
          {item.badge ? (
            <span className="rounded-full bg-oven-flame/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-oven-flame-light">
              {item.badge}
            </span>
          ) : null}
        </div>

        {item.description ? (
          <p className="mt-1 text-xs text-oven-cream/60 sm:text-sm">{item.description}</p>
        ) : null}

        <div className="mt-auto pt-2">
          {onlyPrice ? (
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap font-mono text-sm text-oven-crust sm:text-base">
                {formatRs(onlyPrice.priceRs)}
              </span>
              <AddToCartButton
                item={{
                  kind: "menu",
                  itemId: item.id,
                  name: item.name,
                  categoryName,
                  unitPrice: onlyPrice.priceRs,
                }}
                label="Add"
              />
            </div>
          ) : (
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label={`Choose a size for ${item.name}`}
            >
              {item.prices.map((price) => (
                <AddToCartButton
                  key={price.id}
                  item={{
                    kind: "menu",
                    itemId: item.id,
                    name: item.name,
                    categoryName,
                    sizeLabel: price.label,
                    unitPrice: price.priceRs,
                  }}
                  label={`${price.label} — ${formatRs(price.priceRs)}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}