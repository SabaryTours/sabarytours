import { Metadata } from "next";
import FeaturedToursPage from "../pages/FeaturedToursPage";

export const metadata: Metadata = {
  title: "All Tours | Sabary Tours",
  description:
    "Browse every published Sabary Tours experience across Ghana and book your next adventure.",
};

export default function FeaturedToursRoute() {
  return <FeaturedToursPage />;
}
