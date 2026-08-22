import type { Deal } from "@/lib/types";
import SectionHeading from "./SectionHeading";
import DealCard from "./DealCard";

export default function DealsSection({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) return null;

  return (
    <section id="deals" aria-labelledby="deals-heading" className="scroll-mt-24 py-16 sm:py-24">
      <div className="container-page">
        <div className="flex flex-col items-center gap-3 text-center">
          <SectionHeading
            id="deals-heading"
            eyebrow="10 AM – 5 PM"
            title="Happy Student Deals"
            tagline="Five combos priced for the daytime crowd — dine in or call ahead."
          />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal, i) => (
            <DealCard key={deal.id} deal={deal} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
