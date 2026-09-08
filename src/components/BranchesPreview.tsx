"use client";
import { useEffect, useState } from "react";
import type { Branch } from "@prisma/client";
import BranchCard from "./BranchCard";

export default function BranchesPreview({ branches }: { branches: Branch[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (branches.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % branches.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [branches.length]);

  if (branches.length === 0) return null;

  return (
    <section className="bg-oven-teal-dark py-16 sm:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Find us</span>
          <h2 className="mt-4 text-3xl font-semibold text-oven-cream sm:text-4xl md:text-5xl">
            Our Branches
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <BranchCard branch={branches[activeIndex] ?? branches[0]!} />
        </div>

        {branches.length > 1 ? (
          <div className="mt-6 flex justify-center gap-2">
            {branches.map((branch, i) => (
              <button
                key={branch.id}
                type="button"
                aria-label={`Show ${branch.name}`}
                onClick={() => setActiveIndex(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === activeIndex ? "w-6 bg-oven-flame-light" : "w-2.5 bg-oven-cream/30"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

