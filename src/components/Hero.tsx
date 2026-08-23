export default function Hero() {
  const phonePrimary = process.env.NEXT_PUBLIC_RESTAURANT_PHONE_PRIMARY || "0304-1114303";
  const phoneSecondary = process.env.NEXT_PUBLIC_RESTAURANT_PHONE_SECONDARY || "0300-1580250";
  return (
    <section id="top" className="relative flex min-h-[92vh] items-center pt-16 sm:pt-20">
      <div className="container-page py-16 sm:py-24">
        <div className="max-w-3xl animate-rise">
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] text-oven-cream sm:text-6xl md:text-7xl">
            Fired fresh.
            <br />
            <span className="text-oven-flame-light">Served hot.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-oven-cream/75 sm:text-xl">
            Stone-baked pizza, flame-grilled burgers, char-rolled shawarma and hand-shaken drinks — made to order at The Oven, with free home delivery across Chichawatni, Mian Channu and Sahiwal.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#pizzas" className="rounded-full bg-flame-gradient px-7 py-3.5 text-center text-base font-semibold text-oven-charcoal shadow-ember transition-transform hover:scale-[1.02] focus-visible:scale-[1.02]">See the Menu</a>
            <a href="#contact" className="rounded-full border border-oven-cream/25 bg-oven-cream/5 px-7 py-3.5 text-center text-base font-semibold text-oven-cream backdrop-blur-sm transition-colors hover:bg-oven-cream/10">Order or Reserve</a>
          </div>
        </div>
      </div>
    </section>
  );
}