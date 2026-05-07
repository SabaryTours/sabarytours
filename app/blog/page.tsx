import { Metadata } from "next";
import BlogPage from "../pages/BlogPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Travel Blog & Ghana Guides | Sabary Tours",
  description: "Read the latest travel tips, destination guides, and stories about experiencing Ghana from the Sabary Tours blog.",
};

export default function Blog() {
  return <BlogPage />;
}


