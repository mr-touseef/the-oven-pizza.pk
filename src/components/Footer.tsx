import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  const year = new Date().getFullYear();
  const phonePrimary = process.env.NEXT_PUBLIC_RESTAURANT_PHONE_PRIMARY || "0304-1114303";
  const phoneSecondary = process.env.NEXT_PUBLIC_RESTAURANT_PHONE_SECONDARY || "0300-1580250";

  return (
    <footer className="border-t border-oven-cream/10 bg-oven-char/80 py-10">
      <div className="container-page flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-display text-lg text-oven-cream">
            The Oven <span className="text-oven-flame-light">Pizza</span>
          </p>
          <p className="mt-1 text-sm text-oven-cream/50">
            Zahid Iqbal Chowk, Chichawatni · {phonePrimary} · {phoneSecondary}
          </p>
          <nav aria-label="Footer" className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-oven-cream/60">
            <a href="/#pizzas" className="hover:text-oven-flame-light">Pizzas</a>
            <a href="/#burgers" className="hover:text-oven-flame-light">Burgers</a>
            <a href="/#shawarma" className="hover:text-oven-flame-light">Shawarma</a>
            <a href="/#drinks" className="hover:text-oven-flame-light">Drinks</a>
            <a href="/#deals" className="hover:text-oven-flame-light">Deals</a>
            <a href="/#branches" className="hover:text-oven-flame-light">Branches</a>
            <a href="/cart" className="hover:text-oven-flame-light">Cart</a>
            <a href="/#contact" className="hover:text-oven-flame-light">Contact</a>
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
        © {year} The Oven Pizza. All rights reserved. · Founder: Muhammad Touseef Haider · 0310-7591425
      </div>
    </footer>
  );
}
