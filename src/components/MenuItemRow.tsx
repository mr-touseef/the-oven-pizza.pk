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
       <li className="rounded-xl border border-oven-cream/10 bg-oven-charcoal/30 p-4">
      <div className="flex gap-3">
        {item.imageUrl ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-oven-cream/10 sm:h-20 sm:w-20">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="menu-row">
            <div className="flex items-baseline gap-2">
              <p className="font-display text-lg text-oven-cream sm:text-xl">{item.name}</p>
              {item.badge ? (
                <span className="rounded-full bg-oven-flame/15 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-oven-flame-light">
                  {item.badge}
                </span>
              ) : null}
            </div>
            {onlyPrice ? (
              <>
                <span className="menu-row__leader" aria-hidden="true" />
                <span className="whitespace-nowrap font-mono text-base text-oven-crust sm:text-lg">
                  {formatRs(onlyPrice.priceRs)}
                </span>
              </>
            ) : null}
          </div>

          {item.description ? (
            <p className="mt-1 text-sm text-oven-cream/60">{item.description}</p>
          ) : null}

          {onlyPrice ? (
            <div className="mt-2">
              <AddToCartButton
                item={{
                  kind: "menu",
                  itemId: item.id,
                  name: item.name,
                  categoryName,
                  unitPrice: onlyPrice.priceRs,
                }}
                label={`Add to Cart — ${formatRs(onlyPrice.priceRs)}`}
              />
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-3" role="group" aria-label={`Choose a size for ${item.name}`}>
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
