export default function SectionHeading({
  id,
  eyebrow,
  title,
  tagline,
  align = "center",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  tagline?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="section-eyebrow">{eyebrow}</span>
      <h2 id={id} className="mt-4 text-3xl font-semibold text-oven-cream sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {tagline ? (
        <p className="mt-3 text-base text-oven-cream/70 sm:text-lg">{tagline}</p>
      ) : null}
    </div>
  );
}
