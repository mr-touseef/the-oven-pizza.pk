import type { Deal } from "@/lib/types";
import { formatRs } from "@/lib/types";
import AddToCartButton from "./AddToCartButton";

export default function DealCard({ deal, index }: { deal: Deal; index: number }) {
  return (
    <div className="group relative overflow-hidden rounded-xl2 border border-oven-flame/25 bg-white p-6 shadow-card transition-transform hover:-translate-y-1 hover:shadow-card-hover sm:p-7">
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-flame-gradient opacity-20 blur-2xl transition-opacity group-hover:opacity-30"
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-4">
        <span className="section-eyebrow">Deal {index}</span>
        <p className="font-mono text-2xl font-bold text-oven-flame-light sm:text-3xl">
          {formatRs(deal.priceRs)}
        </p>
      </div>
      <h3 className="mt-4 font-display text-xl text-oven-cream sm:text-2xl">{deal.title}</h3>
      <p className="mt-2 text-sm text-oven-cream/70">{deal.description}</p>

      {deal.includedItems.length > 0 ? (
        <ul className="mt-4 space-y-1.5 border-t border-oven-cream/10 pt-4">
          {deal.includedItems.map((line) => (
            <li key={line} className="flex items-start gap-2 text-sm text-oven-cream/80">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="mt-0.5 shrink-0 text-oven-flame-light"
                aria-hidden="true"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {line}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {deal.activeWindow ? (
          <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-oven-crust/80">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {deal.activeWindow}
          </p>
        ) : (
          <span />
        )}
        <AddToCartButton
          item={{
            kind: "deal",
            itemId: deal.id,
            name: deal.title,
            categoryName: "Happy Student Deals",
            unitPrice: deal.priceRs,
          }}
          label={`Add to Cart — ${formatRs(deal.priceRs)}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-flame-gradient px-4 py-2 font-mono text-sm font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.03]"
        />
      </div>
    </div>
  );
}
