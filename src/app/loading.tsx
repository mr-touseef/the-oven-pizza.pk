export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading The Oven Pizza"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-oven-charcoal"
    >
      <span
        className="h-10 w-10 animate-spin rounded-full border-4 border-oven-cream/15 border-t-oven-flame"
        aria-hidden="true"
      />
      <p className="font-display text-lg text-oven-cream/70">Firing up the oven…</p>
    </div>
  );
}
