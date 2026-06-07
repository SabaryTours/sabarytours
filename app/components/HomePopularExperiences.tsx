import Image from "next/image";
import Link from "next/link";
import { getFeaturedTours } from "../lib/api";
import { MAX_FEATURED_TOURS } from "../lib/featuredTours";

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {tours.map((tour) => (
            <article
              key={tour.href}
              className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                  src={tour.image || "/assets/placeholder-tour.jpg"}
                  alt={tour.title}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <span className="absolute top-3 left-3 rounded-full bg-[#ff5e00] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white font-sans shadow-sm">
                  Featured
                </span>
              </div>
              <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2 font-sans">
                <h3 className="text-base font-bold text-[#222] leading-snug line-clamp-2">
                  {tour.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">{tour.highlights}</p>
                <Link
                  href={tour.href}
                  className="mt-auto inline-flex justify-center items-center py-2.5 px-4 rounded-full bg-[#ff5e00] text-white text-sm font-bold hover:bg-[#e55500] transition-colors"
                >
                  Book now
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="text-center mt-8">
          <Link
            href="/featured-tours"
            className="text-sm font-bold text-[#0060cc] hover:text-[#ff5e00] transition-colors font-sans"
          >
            View all featured tours →
          </Link>
        </p>
      </div>
    </section>
  );
}
