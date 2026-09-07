import type { Metadata } from "next";
import ContactSection from "@/components/ContactSection";

export const metadata: Metadata = {
  title: "Contact Us | The Oven Pizza",
  description: "Call, message, or reserve a table at The Oven Pizza. Branch phone numbers and addresses for Mian Channu, Sahiwal, and Chichawatni.",
};

export default function ContactPage() {
  return <ContactSection />;
}
