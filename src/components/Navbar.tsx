"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import CartIcon from "./CartIcon";
import ThemeToggle from "./ThemeToggle";
const LINKS = [
  { href: "/#branches", label: "Branches" },
  { href: "/#contact", label: "Contact" },
];
export default function Navbar() {
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
        scrolled ? "bg-oven-char/90 shadow-card" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="container-page flex h-16 items-center justify-between gap-3 sm:h-20"
      >
        <Link
          href="/#top"
          className="flex shrink-0 items-center gap-2 font-display text-xl font-semibold tracking-tight text-oven-cream sm:text-2xl"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-flame-gradient text-base font-bold text-oven-charcoal sm:h-10 sm:w-10"
            aria-hidden="true"
          >
            O
          </span>
          <span className="hidden sm:inline">
            The Oven <span className="text-oven-flame-light">Pizza</span>
          </span>
        </Link>
        <div className="scrollbar-none flex-1 overflow-x-auto">
          <ul className="flex items-center gap-5 whitespace-nowrap rounded-full bg-black/80 px-5 py-2.5 backdrop-blur-md lg:justify-center lg:gap-7">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm font-medium text-white/90 transition-colors hover:text-oven-flame-light">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <CartIcon />
        </div>
      </nav>
      <div className="flex justify-center pb-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
