import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-oven-charcoal px-6 text-center text-oven-cream">
      <span className="section-eyebrow">404</span>
      <h1 className="mt-6 font-display text-4xl font-semibold sm:text-5xl">
        This page fell out of the oven.
      </h1>
      <p className="mt-4 max-w-md text-oven-cream/70">
        We couldn&apos;t find what you were looking for. It may have been moved,
        or the link might be off by a slice.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-flame-gradient px-7 py-3.5 text-base font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.02]"
      >
        Back to the menu
      </Link>
    </div>
  );
}
