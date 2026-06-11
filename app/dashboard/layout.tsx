import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "../lib/seo/site";

export const metadata: Metadata = {
  title: "My Dashboard | Sabary Tours",
  robots: NO_INDEX_ROBOTS,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
