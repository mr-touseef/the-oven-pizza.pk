"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-oven-charcoal px-6 text-center text-oven-cream">
      <span className="section-eyebrow">Something went wrong</span>
      <h1 className="mt-6 font-display text-4xl font-semibold sm:text-5xl">
        We hit a hot spot.
      </h1>
      <p className="mt-4 max-w-md text-oven-cream/70">
        An unexpected error stopped this page from loading. You can try again,
        or call us directly to place your order.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-flame-gradient px-7 py-3.5 text-base font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.02]"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-full border border-oven-cream/25 px-7 py-3.5 text-base font-semibold text-oven-cream hover:bg-oven-cream/10"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
