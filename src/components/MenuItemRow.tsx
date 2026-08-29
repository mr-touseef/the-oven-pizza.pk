"use client";

import Image from "next/image";
import type { MenuItemWithPrices } from "@/lib/types";
import { formatRs } from "@/lib/types";
import AddToCartButton from "./AddToCartButton";

const CARD_TINTS = [
  "bg-orange-50",
  "bg-green-50",
  "bg-pink-50",
  "bg-sky-50",
  "bg-yellow-50",
  "bg-purple-50",
];

export default function MenuItemRow({
  item,
  categoryName,
  index = 0,
}: {
  item: MenuItemWithPrices;
  categoryName?: string;
  index?: number;
}) {
  const onlyPrice = item.prices.length === 1 ? item.prices[0] : undefined;
  const tint = CARD_TINTS[index % CARD_TINTS.length];

  return (
    <li className={`overflow-hidden rounded-3xl border border-black/5 ${tint} shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover`}>
      {item.imageUrl ? (
        <div
          className={`relative h-24 w-full overflow-hidden sm:h-28 ${
            categoryName?.toLowerCase().includes("burger") ? "bg-black" : ""
          }`}
        >
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 640px) 320px, 100vw"
            className={
              categoryName?.toLowerCase().includes("burger")
                ? "object-contain"
                : "object-cover"
            }
          />
        </div>
      ) : null}

      <div className="p-2">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="font-display text-xs leading-snug text-oven-crust sm:text-sm">{item.name}</p>
          {item.badge ? (
            <span className="rounded-full bg-oven-flame/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-oven-flame">
              {item.badge}
            </span>
          ) : null}
        </div>

        {item.description ? (
          <p className="mt-1 line-clamp-1 text-xs text-oven-crust/60">{item.description}</p>
        ) : null}

        <div className="mt-2">
          {onlyPrice ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="whitespace-nowrap font-mono text-xs font-semibold text-oven-crust sm:text-sm">
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
              className="flex flex-col gap-1.5"
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
                  label={`${price.label} - ${formatRs(price.priceRs)}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}