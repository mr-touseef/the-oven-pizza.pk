import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theovenpizza.store";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for ordering from and using The Oven Pizza website.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-oven-cream/90">
        <h1 className="font-display text-3xl font-semibold text-oven-cream sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-oven-cream/60">Last updated: September 2026</p>

        <div className="mt-8 space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-oven-cream">1. Orders</h2>
            <p className="mt-2">
              By placing an order through this website, you confirm that the delivery
              information and contact details provided are accurate. Orders are subject to
              acceptance and availability at the relevant branch. We reserve the right to
              refuse or cancel an order in cases of incorrect pricing, unavailable items, or
              suspected fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oven-cream">2. Pricing</h2>
            <p className="mt-2">
              All prices are listed in Pakistani Rupees (Rs) and are subject to change without
              prior notice. The price charged will be the price displayed at the time your
              order is placed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oven-cream">3. Delivery &amp; Pickup</h2>
            <p className="mt-2">
              Delivery times are estimates and may vary due to weather, traffic, order volume,
              or other factors outside our control. For pickup and dine-in orders, please arrive
              within a reasonable time of your order being confirmed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oven-cream">4. Payment</h2>
            <p className="mt-2">
              Accepted payment methods will be confirmed at checkout or upon delivery, depending
              on the branch. Any discounts applied are subject to the terms of that specific
              offer and may not be combined unless stated otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oven-cream">5. Cancellations</h2>
            <p className="mt-2">
              Once an order has been confirmed and preparation has started, cancellations may
              not be possible. Please contact the relevant branch directly as soon as possible
              if you need to change or cancel an order.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oven-cream">6. Website Use</h2>
            <p className="mt-2">
              This website and its content are provided for the purpose of browsing our menu
              and placing orders. You agree not to misuse the website, attempt unauthorized
              access to our systems, or use the site for any unlawful purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oven-cream">7. Changes to These Terms</h2>
            <p className="mt-2">
              We may update these Terms of Service from time to time. Continued use of the
              website or placing an order after changes are posted constitutes acceptance of
              the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oven-cream">8. Contact Us</h2>
            <p className="mt-2">
              If you have questions about these Terms of Service, please contact us at
              muhammadtouseefhaider1@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}