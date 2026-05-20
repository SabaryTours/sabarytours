import { Metadata } from "next";
import FeaturedToursPage from "../pages/FeaturedToursPage";

export const metadata: Metadata = {
  title: "Featured Tours | Sabary Tours",
  description:
    "Book our most popular 5-star Ghana experiences — quadbike adventures, Cape Coast & Kakum, and Accra city tours.",
};

export default function FeaturedToursRoute() {
  return <FeaturedToursPage />;
}
