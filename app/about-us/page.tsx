import { Metadata } from "next";
import AboutPage from "../pages/AboutPage";

export const metadata: Metadata = {
  title: "About Sabary Tours | Experience Ghana",
  description: "Learn more about Sabary Tours, your premier travel partner in Ghana. We offer expertly crafted tours designed to create memories that last a lifetime.",
  openGraph: {
    title: "About Sabary Tours | Experience Ghana",
    description: "Learn more about Sabary Tours, your premier travel partner in Ghana. We offer expertly crafted tours designed to create memories that last a lifetime.",
    images: [{ url: "/assets/about-us.png" }],
  },
};

export default function About() {
  return <AboutPage />;
}

