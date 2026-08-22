import type { MenuCategory, MenuItem, MenuItemPrice, Deal } from "@prisma/client";

export type MenuItemWithPrices = MenuItem & {
  prices: MenuItemPrice[];
};

export type MenuCategoryWithItems = MenuCategory & {
  items: MenuItemWithPrices[];
};

export type { Deal };

export const formatRs = (value: number): string =>
  `Rs ${value.toLocaleString("en-PK")}`;

// ── Cart ────────────────────────────────────────────────────────────────

export type CartLineKind = "menu" | "deal";

export interface CartLine {
  /** Stable composite key: `${kind}:${itemId}:${sizeLabel ?? "single"}` */
  lineId: string;
  kind: CartLineKind;
  itemId: string;
  name: string;
  /** Category/section name, shown on the receipt for context. */
  categoryName?: string;
  /** Size/price label, e.g. "Medium", "5 pc". Undefined for single-price items. */
  sizeLabel?: string;
  unitPrice: number;
  quantity: number;
}

export interface AddToCartInput {
  kind: CartLineKind;
  itemId: string;
  name: string;
  categoryName?: string;
  sizeLabel?: string;
  unitPrice: number;
}

export function buildLineId(input: Pick<AddToCartInput, "kind" | "itemId" | "sizeLabel">): string {
  return `${input.kind}:${input.itemId}:${input.sizeLabel ?? "single"}`;
}
