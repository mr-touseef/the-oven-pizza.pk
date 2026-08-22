"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CartIcon from "./CartIcon";

const LINKS = [
  { href: "/#pizzas", label: "Pizzas" },
  { href: "/#burgers", label: "Burgers" },
  { href: "/#shawarma", label: "Shawarma" },
  { href: "/#drinks", label: "Drinks" },
  { href: "/#deals", label: "Deals" },
  { href: "/#branches", label: "Branches" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        scrolled ? "bg-oven-char/90 backdrop-blur-md shadow-card" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="container-page flex h-16 items-center justify-between sm:h-20"
      >
        <Link
          href="/#top"
          className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-oven-cream sm:text-2xl"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-flame-gradient text-base font-bold text-oven-charcoal sm:h-10 sm:w-10"
            aria-hidden="true"
          >
            O
          </span>
          The Oven <span className="text-oven-flame-light">Pizza</span>
        </Link>

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-oven-cream/80 transition-colors hover:text-oven-flame-light"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <CartIcon />
          <a
            href={`tel:${(process.env.NEXT_PUBLIC_RESTAURANT_PHONE_PRIMARY || "0304-1114303").replace(/-/g, "")}`}
            className="rounded-full bg-flame-gradient px-5 py-2.5 text-sm font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.03] focus-visible:scale-[1.03]"
          >
            Call to Order
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CartIcon />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-oven-cream/20 text-oven-cream"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`overflow-hidden bg-oven-char/95 backdrop-blur-md transition-[max-height] duration-300 lg:hidden ${
          open ? "max-h-[28rem]" : "max-h-0"
        }`}
      >
        <ul className="container-page flex flex-col gap-1 py-3">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium text-oven-cream/90 hover:bg-oven-cream/5"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <a
              href={`tel:${(process.env.NEXT_PUBLIC_RESTAURANT_PHONE_PRIMARY || "0304-1114303").replace(/-/g, "")}`}
              className="block rounded-full bg-flame-gradient px-4 py-3 text-center text-sm font-semibold text-oven-charcoal"
            >
              Call to Order
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
