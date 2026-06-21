import Link from "next/link";
import { getFeaturedTours } from "../lib/api";
import { MAX_FEATURED_TOURS } from "../lib/featuredTours";
import HomeFeaturedToursSlider from "./HomeFeaturedToursSlider";

export default async function HomePopularExperiences() {
  const tours = await getFeaturedTours(MAX_FEATURED_TOURS);
  if (tours.length === 0) return null;

  return (
    <section
      id="popular-experiences"
      className="w-full px-4 sm:px-6 md:px-12 py-10 md:py-12 bg-white scroll-mt-24"
      aria-labelledby="popular-experiences-heading"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <h2
            id="popular-experiences-heading"
            className="text-2xl sm:text-3xl text-[#222] uppercase leading-tight"
            style={{ fontFamily: "var(--font-unlimited-pie)" }}
          >
            Popular{" "}
            <span
              className="text-[#ff5e00]"
              style={{ textShadow: "1px 1px 0px #551f00" }}
            >
              experiences
            </span>
          </h2>
          <p className="mt-3 text-gray-600 text-sm sm:text-base font-sans leading-relaxed">
            Quad biking, batik workshops, and our other guest favorites — book in a few clicks.
          </p>
        </div>

        <HomeFeaturedToursSlider tours={tours} />

        <p className="text-center mt-8">
          <Link
            href="/featured-tours"
            className="text-sm font-bold text-[#0060cc] hover:text-[#ff5e00] transition-colors font-sans"
          >
            View all tours →
          </Link>
        </p>
      </div>
    </section>
  );
}
