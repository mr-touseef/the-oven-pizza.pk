import type { MenuCategoryWithItems } from "@/lib/types";
import SectionHeading from "./SectionHeading";
import MenuCategoryCard from "./MenuCategoryCard";

export default function MenuSection({
  id,
  eyebrow,
  title,
  tagline,
  categories,
  tone = "teal",
}: {
  id: string;
  eyebrow: string;
  title: string;
  tagline?: string;
  categories: MenuCategoryWithItems[];
  tone?: "teal" | "charcoal";
}) {
  if (categories.length === 0) return null;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-24 py-16 sm:py-24 ${
        tone === "teal" ? "bg-oven-teal-dark" : "bg-white"
      }`}
    >
      <div className="container-page">
        <SectionHeading id={`${id}-heading`} eyebrow={eyebrow} title={title} tagline={tagline} />
        <div className="mt-12 space-y-16">
          {categories.map((category) => (
            <MenuCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}