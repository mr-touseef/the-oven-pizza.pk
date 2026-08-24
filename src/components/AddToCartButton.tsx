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

  function handleConfirm() {
    addItem(item);
    setConfirmOpen(false);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  const confirmTitle = item.sizeLabel
    ? `Add ${item.name} (${item.sizeLabel}) to cart?`
    : `Add ${item.name} to cart?`;

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
                  className={
          className ||
          "inline-flex items-center gap-2 rounded-xl2 border border-oven-flame/30 bg-oven-flame/10 px-5 py-2.5 font-mono text-sm font-medium text-oven-crust shadow-[0_4px_20px_rgba(255,140,60,0.25)] transition-all hover:-translate-y-0.5 hover:border-oven-flame-light hover:bg-oven-flame/20 hover:shadow-[0_6px_24px_rgba(255,140,60,0.4)]"
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
