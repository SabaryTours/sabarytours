import type { Metadata } from "next";
import PrivacyPage from "../pages/PrivacyPage";

export const metadata: Metadata = {
  title: "Privacy Policy & Terms | Sabary Tours",
  description:
    "Privacy policy and terms and conditions for Sabary Tours — how we collect, use, and protect your data; payments; cookies; and your rights.",
  openGraph: {
    title: "Privacy Policy & Terms | Sabary Tours",
    description:
      "Privacy policy and terms for Sabary Tours, including data use, payments, cookies, and your rights.",
  },
};

export default function Privacy() {
  return <PrivacyPage />;
}
