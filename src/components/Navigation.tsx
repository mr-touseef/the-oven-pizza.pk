import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 border-b border-oven-cream/10 bg-oven-charcoal/95 backdrop-blur-md py-4">
      <div className="container-page flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          <span className="text-oven-flame">O</span>
          <span className="text-white"> The Oven </span>
          <span className="text-oven-crust">Pizza</span>
        </Link>

        <div className="flex items-center gap-8 text-oven-cream">
          <Link href="#pizzas" className="text-sm hover:text-oven-crust">Pizzas</Link>
          <Link href="#burgers" className="text-sm hover:text-oven-crust">Burgers</Link>
          <Link href="#shawarma" className="text-sm hover:text-oven-crust">Shawarma</Link>
          <Link href="#drinks" className="text-sm hover:text-oven-crust">Drinks</Link>
          <Link href="#deals" className="text-sm hover:text-oven-crust">Deals</Link>
          <Link href="#contact" className="text-sm hover:text-oven-crust">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-xl">🛒</Link>
          <Link href="tel:03001234567" className="rounded-full bg-flame-gradient px-6 py-2 text-sm font-semibold text-oven-charcoal">Call</Link>
        </div>
      </div>
    </nav>
  );
}
