"use client";
import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
/**
 * Full-viewport, fixed background video that plays behind homepage content
 * only. Other pages (cart, admin, menu, etc.) use a plain solid background
 * instead, since their content cards are not designed for a busy backdrop.
 *
 * Drop your own file at `public/videos/background.mp4` (and optionally an
 * additional `public/videos/background.webm`) to replace the placeholder.
 * Until a real video is present, or if it fails to load in the browser, this
 * falls back to a static image and finally to a plain dark gradient â€” so the
 * layout never breaks and text always stays readable.
 */
export default function BackgroundVideo() {
  const [videoFailed, setVideoFailed] = useState(false);
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
  }

  return (
    <div
      className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-oven-charcoal no-print"
      aria-hidden="true"
    >
      {!videoFailed ? (
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/images/hero-food.png"
          onError={() => setVideoFailed(true)}
        >
          <source src="/videos/background.webm" type="video/webm" />
          <source src="/videos/background.mp4" type="video/mp4" />
        </video>
      ) : (
        <Image
          src="/images/hero-food.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="h-full w-full object-cover"
        />
      )}
      {/* Dark overlay + brand tint so foreground text stays readable at every scroll position */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40" />
      <div className="absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />
    </div>
  );
}
