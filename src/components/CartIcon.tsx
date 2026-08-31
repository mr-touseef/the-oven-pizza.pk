"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
export default function CartIcon({ className }: { className?: string }) {
  const { itemCount } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={`View cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
      className={
        className ||
        "relative flex h-10 w-10 items-center justify-center rounded-full bg-flame-gradient text-oven-charcoal shadow-ember transition-transform hover:scale-[1.03] focus-visible:scale-[1.03]"
      }
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-1.5 3H18M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {itemCount > 0 ? (
        <span
          className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-flame-gradient px-1 text-[0.65rem] font-bold text-oven-charcoal"
          aria-hidden="true"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
