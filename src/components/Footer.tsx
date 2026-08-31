import NewsletterForm from "./NewsletterForm";
import Link from "next/link";
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-oven-cream/10 bg-oven-char py-10">
      <div className="container-page flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-display text-lg text-oven-cream">
            The Oven <span className="text-oven-flame-light">Pizza</span>
          </p>
          <nav aria-label="Footer" className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-oven-cream/60">
            <Link href="/#pizzas" className="hover:text-oven-flame-light">Pizzas</Link>
            <Link href="/#burgers" className="hover:text-oven-flame-light">Burgers</Link>
            <Link href="/#shawarma" className="hover:text-oven-flame-light">Shawarma</Link>
            <Link href="/#drinks" className="hover:text-oven-flame-light">Drinks</Link>
            <Link href="/#deals" className="hover:text-oven-flame-light">Deals</Link>
            <Link href="/#branches" className="hover:text-oven-flame-light">Branches</Link>
            <Link href="/cart" className="hover:text-oven-flame-light">Cart</Link>
            <Link href="/#contact" className="hover:text-oven-flame-light">Contact</Link>
          </nav>
        </div>
        <div className="w-full max-w-sm">
          <p className="font-display text-lg text-oven-crust">Stay tuned with us</p>
          <p className="mt-1 text-sm text-oven-cream/50">
            New flavours and deals, straight to your inbox.
          </p>
          <div className="mt-3">
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="container-page mt-8 border-t border-oven-cream/10 pt-6 text-xs text-oven-cream/40">
        © {year} The Oven Pizza. All rights reserved. · Founder: Muhammad Touseef Haider · 0310-7591425 ·{" "}
        <a href="mailto:muhammadtouseefhaider1@gmail.com" className="hover:text-oven-flame-light">
          muhammadtouseefhaider1@gmail.com
        </a>
      </div>
    </footer>
  );
}
