import { Metadata } from "next";
import PackagesPage from "../pages/PackagesPage";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Tour Packages in Ghana | Sabary Tours",
  description: "Browse our extensive collection of Ghana tour packages. From coastal escapes to historical journeys, find your perfect African adventure.",
  openGraph: {
    title: "Tour Packages in Ghana | Sabary Tours",
    description: "Browse our extensive collection of Ghana tour packages. From coastal escapes to historical journeys, find your perfect African adventure.",
    images: [{ url: "/assets/logo.svg" }],
  },
};

interface PackagesRouteProps {
  searchParams?: Promise<{
    q?: string;
    date?: string;
  }>;
}

export default async function Packages({ searchParams }: PackagesRouteProps) {
  const resolved = (await searchParams) || {};
  return <PackagesPage searchQuery={resolved.q || ""} searchDate={resolved.date || ""} />;
}

