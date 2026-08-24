import SectionHeading from "./SectionHeading";
import ContactForm from "./ContactForm";

const BRANCHES = [
  { name: "Mian Channu", phonePrimary: "0318-7739973", phoneSecondary: "0300-1520250", address: "Shaheed Rd, near Municipal Gym, Mian Channu, 60000" },
  { name: "Sahiwal", phonePrimary: "0304-1112302", phoneSecondary: "0325-0662266", address: "M4C7+Q9X, Girls College Rd, Fateh Sher Colony, Sahiwal" },
  { name: "Chichawatni", phonePrimary: "0300-1580250", phoneSecondary: "0300-1580250", address: "Kamboh Road Street Number 12, Block 12, Chichawatni, 57200" },
];

export default function ContactSection() {
  const phonePrimary = process.env.NEXT_PUBLIC_RESTAURANT_PHONE_PRIMARY || "0304-1114303";
  const phoneSecondary = process.env.NEXT_PUBLIC_RESTAURANT_PHONE_SECONDARY || "0300-1580250";
  const address = process.env.NEXT_PUBLIC_RESTAURANT_ADDRESS || "Zahid Iqbal Chowk, Chichawatni, Punjab, Pakistan";

  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-24 bg-oven-teal-dark/40 py-16 sm:py-24">
      <div className="container-page">
        <SectionHeading id="contact-heading" eyebrow="Order, reserve or ask" title="Order or Reserve a Table" tagline="Call us directly, or send a message and we'll ring you back." />
        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
                       <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {BRANCHES.map((branch) => (
                <div key={branch.name} className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/50 p-5 shadow-card">
                  <h4 className="font-display text-base text-oven-crust">{branch.name}</h4>
                  <a href={`tel:${branch.phonePrimary.replace(/-/g, "")}`} className="mt-1 block font-mono text-sm text-oven-cream hover:text-oven-flame-light">{branch.phonePrimary}</a>
                  <a href={`tel:${branch.phoneSecondary.replace(/-/g, "")}`} className="block font-mono text-sm text-oven-cream/70 hover:text-oven-flame-light">{branch.phoneSecondary}</a>
                  <p className="mt-2 text-sm text-oven-cream/70">{branch.address}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-xl2 border border-oven-cream/10 bg-oven-teal-deep/50 p-6 shadow-card sm:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}