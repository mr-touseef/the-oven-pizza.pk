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
    <li className="flex h-full flex-col items-center rounded-xl border border-oven-cream/10 bg-oven-charcoal/30 p-4 text-center">
      {item.imageUrl ? (
        <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg border border-oven-cream/10 bg-oven-charcoal/40">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 45vw, 220px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col items-center">
        <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
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

        <div className="mt-auto pt-3">
          {onlyPrice ? (
            <div className="flex items-center justify-center gap-2">
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
              className="flex flex-wrap justify-center gap-2"
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