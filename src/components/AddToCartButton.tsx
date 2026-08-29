"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { AddToCartInput } from "@/lib/types";
import ConfirmDialog from "./ConfirmDialog";

export default function AddToCartButton({
  item,
  label,
  className,
}: {
  item: AddToCartInput;
  /** Text shown on the button itself, e.g. "Medium — Rs 899" or "Add to Cart — Rs 399" */
  label: string;
  className?: string;
}) {
  const { addItem } = useCart();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  function handleConfirm() {
    addItem(item, quantity);
    setConfirmOpen(false);
    setJustAdded(true);
    setQuantity(1);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  const confirmTitle = item.sizeLabel
    ? `Add ${quantity} × ${item.name} (${item.sizeLabel}) to cart?`
    : `Add ${quantity} × ${item.name} to cart?`;

  return (
    <>
      <div className="inline-flex w-full items-center gap-1.5">
        <div className="inline-flex items-center overflow-hidden rounded-xl2 border border-oven-teal/20 bg-white/70">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label={`Decrease quantity for ${item.name}`}
            className="px-2 py-1.5 text-xs text-oven-crust/70 transition-colors hover:bg-oven-teal/10 disabled:opacity-30"
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className="min-w-[1.2rem] px-0.5 text-center font-mono text-xs text-oven-crust">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            aria-label={`Increase quantity for ${item.name}`}
            className="px-2 py-1.5 text-xs text-oven-crust/70 transition-colors hover:bg-oven-teal/10 disabled:opacity-30"
            disabled={quantity >= 20}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className={
            className ||
            "inline-flex items-center gap-2 flex-1 rounded-xl2 border border-oven-flame/30 bg-oven-flame/10 px-2.5 py-1.5 font-mono text-[0.7rem] font-medium leading-tight text-oven-crust shadow-[0_4px_20px_rgba(255,140,60,0.25)] transition-all hover:-translate-y-0.5 hover:border-oven-flame-light hover:bg-oven-flame/20 hover:shadow-[0_6px_24px_rgba(255,140,60,0.4)]"
          }
          aria-label={confirmTitle}
        >
          {justAdded ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Added
            </>
          ) : (
            label
          )}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        confirmLabel="Yes, add it"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}