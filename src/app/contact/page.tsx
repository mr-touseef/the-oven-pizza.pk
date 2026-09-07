import type { Metadata } from "next";
import ContactSection from "@/components/ContactSection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theovenpizza.store";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with The Oven Pizza. Call any branch directly, or send us a message and we'll ring you back.",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: "Contact Us | The Oven Pizza",
    description: "Call any branch directly, or send us a message and we'll ring you back.",
    url: `${siteUrl}/contact`,
  },
};

export default function ContactPage() {
  return <ContactSection />;
}