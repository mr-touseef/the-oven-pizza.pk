import type { Metadata } from "next";
import BranchesSection from "@/components/BranchesSection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theovenpizza.store";

export const metadata: Metadata = {
  title: "Our Branches",
  description:
    "Find The Oven Pizza near you. Three branch locations with addresses, phone numbers, and directions.",
  alternates: {
    canonical: `${siteUrl}/branches`,
  },
  openGraph: {
    title: "Our Branches | The Oven Pizza",
    description: "Find The Oven Pizza near you. Addresses, phone numbers, and directions for all locations.",
    url: `${siteUrl}/branches`,
  },
};

export default function BranchesPage() {
  return <BranchesSection />;
}