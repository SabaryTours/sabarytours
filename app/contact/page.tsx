import { Metadata } from "next";
import { Suspense } from "react";
import ContactPage from "../pages/ContactPage";

export const metadata: Metadata = {
  title: "Contact Us | Sabary Tours Ghana",
  description: "Get in touch with Sabary Tours to plan your next Ghana adventure. Our team is ready to help you craft the perfect travel experience.",
};

export default function Contact() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white p-12 text-center text-gray-500 font-sans">Loading…</div>}>
      <ContactPage />
    </Suspense>
  );
}

