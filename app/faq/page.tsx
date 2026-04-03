import type { Metadata } from "next";
import FaqPage from "../pages/FaqPage";

export const metadata: Metadata = {
  title: "FAQs | Sabary Tours",
  description:
    "Frequently asked questions about booking tours in Ghana, payments, pickups, cancellations, and travel support with Sabary Tours.",
  openGraph: {
    title: "FAQs | Sabary Tours",
    description:
      "Answers about booking, deposits, tours, payments, and travel support with Sabary Tours in Ghana.",
  },
};

export default function Faq() {
  return <FaqPage />;
}
