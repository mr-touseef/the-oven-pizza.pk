import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import BackgroundVideo from "@/components/BackgroundVideo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBranches } from "@/lib/branches";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theovenpizza.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Oven Pizza — Wood-Fired Pizza, Burgers & Shawarma in Chichawatni",
    template: "%s | The Oven Pizza",
  },
  description:
    "The Oven Pizza in Chichawatni serves stone-baked pizzas, flame-grilled burgers, shawarma, wings and hand-crafted drinks. Order online or call for free home delivery.",
  keywords: [
    "The Oven Pizza",
    "Chichawatni pizza",
    "pizza delivery Chichawatni",
    "burgers Chichawatni",
    "shawarma Chichawatni",
    "The Oven Mian Chichawatni",
  ],
  authors: [{ name: "The Oven Pizza" }],
  creator: "The Oven Pizza",
  applicationName: "The Oven Pizza",
  formatDetection: { telephone: true },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/favicon-32.png",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteUrl,
    siteName: "The Oven Pizza",
    title: "The Oven Pizza — Wood-Fired Pizza, Burgers & Shawarma in Chichawatni",
    description:
      "Stone-baked pizzas, flame-grilled burgers, shawarma, wings and hand-crafted drinks. Free home delivery in Chichawatni.",
    images: [
      {
        url: "/images/hero-food.webp",
        width: 1200,
        height: 1500,
        alt: "A wood-fired pizza, fries and fried chicken from The Oven Pizza",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Oven Pizza — Chichawatni",
    description:
      "Stone-baked pizzas, flame-grilled burgers, shawarma, wings and hand-crafted drinks. Free home delivery.",
    images: ["/images/hero-food.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#063E38",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branches = await getBranches();

  const restaurantJsonLd =
    branches.length > 0
      ? {
          "@context": "https://schema.org",
          "@graph": branches.map((branch) => ({
            "@type": "Restaurant",
            "@id": `${siteUrl}/#${branch.slug}`,
            name: branch.name,
            image: `${siteUrl}${branch.photoUrl}`,
            servesCuisine: ["Pizza", "Fast Food", "Shawarma", "Burgers"],
            priceRange: "Rs 100 – Rs 2500",
            telephone:
              branch.phone ||
              process.env.NEXT_PUBLIC_RESTAURANT_PHONE_PRIMARY ||
              "0304-1114303",
            address: {
              "@type": "PostalAddress",
              streetAddress: branch.address,
              addressCountry: "PK",
            },
            url: `${siteUrl}/#branches`,
          })),
        }
      : null;

  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-oven-charcoal font-body text-oven-cream antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('oven-theme')==='old'){document.documentElement.classList.add('theme-old');}}catch(e){}",
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-oven-flame focus:px-5 focus:py-3 focus:font-body focus:font-semibold focus:text-oven-charcoal"
        >
          Skip to main content
        </a>
        {restaurantJsonLd ? (
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
          />
        ) : null}
        <CartProvider>
          <BackgroundVideo />
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <BottomNav />
          <GoogleAnalytics />
        </CartProvider>
      </body>
    </html>
  );
}

