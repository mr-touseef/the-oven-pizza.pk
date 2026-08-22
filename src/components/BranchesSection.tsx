import { getBranches } from "@/lib/branches";
import SectionHeading from "./SectionHeading";
import BranchCard from "./BranchCard";

export default async function BranchesSection() {
  const branches = await getBranches();

  return (
    <section id="branches" aria-labelledby="branches-heading" className="scroll-mt-24 bg-oven-teal-dark/40 py-16 sm:py-24">
      <div className="container-page">
        <SectionHeading
          id="branches-heading"
          eyebrow="Find us"
          title="Our Branches"
          tagline="Three locations across the region — tap Get Directions for turn-by-turn navigation to any branch."
        />

        {branches.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        ) : (
          <div
            role="alert"
            className="mx-auto mt-12 max-w-lg rounded-xl2 border border-oven-flame/30 bg-oven-flame/10 p-6 text-center text-oven-cream/80"
          >
            Branch details are temporarily unavailable — please call us directly, or run{" "}
            <code className="rounded bg-oven-charcoal/60 px-1.5 py-0.5 font-mono text-sm">
              npm run db:seed
            </code>{" "}
            if you&apos;re setting this project up for the first time.
          </div>
        )}
      </div>
    </section>
  );
}
