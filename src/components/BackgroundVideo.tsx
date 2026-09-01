"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
/**
 * Full-viewport, fixed background image behind homepage content only.
 * Other pages (cart, admin, menu, etc.) use a plain solid background instead.
 *
 * NOTE: video background was removed — no real video file exists yet, so we
 * render the static hero image directly instead of attempting to load a
 * missing /videos/background.mp4 / .webm (which caused 404s, delayed LCP,
 * and blocked back/forward-cache restoration).
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
        src="/images/hero-food.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40" />
      <div className="absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />
    </div>
  );
}
