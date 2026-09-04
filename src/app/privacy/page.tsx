import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theovenpizza.store";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How The Oven Pizza collects, uses, and protects your personal information.",
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-3xl text-oven-cream/90">
        <h1 className="font-display text-3xl font-semibold text-oven-cream sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-oven-cream/60">Last updated: September 2026</p>

        <div className="mt-8 space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-oven-cream">1. Information We Collect</h2>
            <p className="mt-2">
              When you place an order or contact us through this website, we collect the
              information you provide directly, which may include your name, phone number,
              email address, and delivery address. We also collect basic order details such as
              items ordered, order total, and order type (delivery, pickup, or dine-in).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oven-cream">2. How We Use Your Information</h2>
            <p className="mt-2">We use the information you provide to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Process and deliver your order</li>
              <li>Contact you regarding your order or an inquiry you submitted</li>
              <li>Improve our menu, service, and website</li>
              <li>Send order status notifications, where enabled</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oven-cream">3. Website Analytics</h2>
            <p className="mt-2">
              We use Google Analytics to understand how visitors use our website, such as which
              pages are viewed and how visitors found us. This data is anonymized and aggregated
              by Google, and does not include personal information you have not chosen to
              provide elsewhere. You can learn more about how Google handles this data at the
              official Google Privacy Policy page (policies.google.com/privacy).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oven-cream">4. Data Storage &amp; Security</h2>
            <p className="mt-2">
              Order and contact information is stored securely in our database and is only
              accessible to authorized staff managing orders for the relevant branch. We do not
              sell or rent your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oven-cream">5. Your Choices</h2>
            <p className="mt-2">
              You may contact us at any time to ask what information we hold about you, or to
              request that it be corrected or deleted, subject to any records we are required to
              keep for order history or legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-oven-cream">6. Contact Us</h2>
            <p className="mt-2">
              If you have questions about this Privacy Policy, please contact us at
              muhammadtouseefhaider1@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}