'use client';
import Link from 'next/link';
import { Home, Search, ShoppingCart, MapPin } from 'lucide-react';

export default function BottomNav() {
  const cartCount = 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden flex items-center justify-around border-t border-oven-flame/20 bg-oven-charcoal py-2.5 shadow-[0_-2px_8px_rgba(0,0,0,0.3)]">
      <Link
        href="/"
        className="flex flex-col items-center gap-0.5 text-[11px] text-oven-flame"
      >
        <Home size={20} />
        Home
      </Link>

      <button
        onClick={() => { document.getElementById('menu-search')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); document.getElementById('menu-search')?.focus(); }}
        className="flex flex-col items-center gap-0.5 text-[11px] text-oven-cream/70"
      >
        <Search size={20} />
        Search
      </button>

      <Link
        href="/cart"
        className="relative flex flex-col items-center gap-0.5 text-[11px] text-oven-cream/70"
      >
        <ShoppingCart size={20} />
        Cart
        {cartCount > 0 && (
          <span className="absolute -top-1 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-oven-flame text-[9px] font-semibold text-oven-charcoal">
            {cartCount}
          </span>
        )}
      </Link>

      <Link
        href="/#branches"
        className="flex flex-col items-center gap-0.5 text-[11px] text-oven-cream/70"
      >
        <MapPin size={20} />
        Branches
      </Link>
    </nav>
  );
}
