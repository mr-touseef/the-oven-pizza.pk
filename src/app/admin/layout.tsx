import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Branch Admin — The Oven Pizza",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-oven-charcoal text-oven-cream">{children}</div>;
}
