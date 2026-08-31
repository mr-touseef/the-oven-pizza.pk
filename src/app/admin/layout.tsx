import type { Metadata } from "next";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Branch Admin â€” The Oven Pizza",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div className="min-h-screen bg-oven-charcoal text-oven-cream">
      {session && (
        <nav className="flex items-center justify-between border-b border-oven-cream/10 bg-oven-teal-deep/40 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-oven-cream/80 hover:text-oven-crust"
            >
              Orders
            </Link>
            <Link
              href="/admin/menu"
              className="text-sm font-medium text-oven-cream/80 hover:text-oven-crust"
            >
              Menu Prices
            </Link>
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-flame-gradient px-5 py-2.5 text-sm font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.03] focus-visible:scale-[1.03]"
          >
            Browse Menu
          </Link>
        </nav>
      )}
      {children}
    </div>
  );
}


