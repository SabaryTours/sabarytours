import Hero from "../components/Hero";
import WhyTravel from "../components/WhyTravel";
import Packages from "../components/Packages";
import WhatsHappening from "../components/WhatsHappening";
import Blog from "../components/Blog";
import Testimonial from "../components/Testimonial";
import ElfsightReviews from "../components/ElfsightReviews";
import Partners from "../components/Partners";
import Footer from "../components/Footer";
import { getHeroImages, getHappenings, getTripOutlineForYear } from "../lib/api";
import YearAtAGlance from "../components/YearAtAGlance";
import CustomizedPackageSection from "../components/CustomizedPackageSection";

export default async function LandingPage() {
  const images = await getHeroImages(true);
  const imageUrls = Array.from(
    new Set(images.map((img) => img.image_url).filter(Boolean))
  );
  const [happenings, tripOutlineYear] = await Promise.all([
    getHappenings(),
    getTripOutlineForYear(new Date().getFullYear()),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Hero initialImages={imageUrls} />
      
      <Packages />
      {happenings.length > 0 && <WhatsHappening events={happenings} />}
      <WhyTravel />
      <CustomizedPackageSection />
      <YearAtAGlance year={new Date().getFullYear()} items={tripOutlineYear} />
      <Blog />
      {/* <Testimonial /> */}
      <section className="py-16 md:py-20 bg-[#fafafa]">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <ElfsightReviews title="Reviews from our travelers" />
        </div>
      </section>
      <Partners />
      <Footer />
    </div>
  );
}

