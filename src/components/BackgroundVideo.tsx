"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
/**
 * Full-viewport, fixed background image that displays behind homepage
 * content only. Other pages (cart, admin, menu, etc.) use a plain solid
 * background instead, since their content cards are not designed for a
 * busy backdrop.
 */
export default function BackgroundVideo() {
  const pathname = usePathname();
  if (pathname !== "/") {
    return null;
  }
  return (
    <div
      className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-oven-charcoal no-print"
      aria-hidden="true"
    >
      <Image
        src="/images/hero-food.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="h-full w-full object-cover"
      />
      {/* Dark overlay + brand tint so foreground text stays readable at every scroll position */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40" />
      <div className="absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />
    </div>
  );
}
