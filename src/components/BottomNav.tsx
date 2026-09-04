'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, ShoppingCart, MapPin } from 'lucide-react';

export default function BottomNav() {
  const cartCount = 0;
  const pathname = usePathname();
  const router = useRouter();

  const activeClass = 'text-oven-flame';
  const inactiveClass = 'text-oven-cream/70';

  const handleSearchClick = () => {
    if (pathname === '/menu') {
      document.getElementById('menu-search')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('menu-search')?.focus();
    } else {
      router.push('/menu#menu-search');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden flex items-center justify-around border-t border-oven-flame/20 bg-oven-charcoal py-2.5 shadow-[0_-2px_8px_rgba(0,0,0,0.3)]">
      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 text-[11px] ${pathname === '/' ? activeClass : inactiveClass}`}
      >
        <Home size={20} />
        Home
      </Link>

      <button
        onClick={handleSearchClick}
        className={`flex flex-col items-center gap-0.5 text-[11px] ${pathname === '/menu' ? activeClass : inactiveClass}`}
      >
        <Search size={20} />
        Search
      </button>

      <Link
        href="/cart"
        className={`relative flex flex-col items-center gap-0.5 text-[11px] ${pathname === '/cart' ? activeClass : inactiveClass}`}
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
        href="/branches"
        className={`flex flex-col items-center gap-0.5 text-[11px] ${pathname === '/branches' ? activeClass : inactiveClass}`}
      >
        <MapPin size={20} />
        Branches
      </Link>
    </nav>
  );
}