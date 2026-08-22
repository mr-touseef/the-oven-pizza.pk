import Image from "next/image";
import type { Branch } from "@prisma/client";
import { getDirectionsUrl } from "@/lib/maps";

export default function BranchCard({ branch }: { branch: Branch }) {
  return (
    <div className="overflow-hidden rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/50 shadow-card transition-transform hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative h-44 w-full">
        <Image
          src={branch.photoUrl}
          alt={`${branch.name} storefront`}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-oven-teal-deep/90 via-transparent to-transparent" />
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl text-oven-crust">{branch.name}</h3>
        <p className="mt-2 text-sm text-oven-cream/70">{branch.address}</p>
        {branch.phone || branch.phone2 ? (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {branch.phone ? (
              <a
                href={`tel:${branch.phone.replace(/[\s-]/g, "")}`}
                className="font-mono text-sm text-oven-cream/80 hover:text-oven-flame-light"
              >
                {branch.phone}
              </a>
            ) : null}
            {branch.phone2 ? (
              <a
                href={`tel:${branch.phone2.replace(/[\s-]/g, "")}`}
                className="font-mono text-sm text-oven-cream/80 hover:text-oven-flame-light"
              >
                {branch.phone2}
              </a>
            ) : null}
          </div>
        ) : null}
        <a
          href={getDirectionsUrl(branch.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-flame-gradient px-5 py-2.5 text-sm font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.03]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          Get Directions
        </a>
      </div>
    </div>
  );
}
