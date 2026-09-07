import type { Metadata } from "next";
import BranchesSection from "@/components/BranchesSection";

export const metadata: Metadata = {
  title: "Our Branches | The Oven Pizza",
  description: "Find The Oven Pizza branches in Mian Channu, Sahiwal, and Chichawatni with directions and contact numbers.",
};

export default function BranchesPage() {
  return <BranchesSection />;
}
