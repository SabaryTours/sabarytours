import Hero from "../components/Hero";
import WhyTravel from "../components/WhyTravel";
import Packages from "../components/Packages";
import WhatsHappening from "../components/WhatsHappening";
import Blog from "../components/Blog";
import Testimonial from "../components/Testimonial";
import Partners from "../components/Partners";
import Footer from "../components/Footer";
import { getHeroImages, getHappenings, getTripOutlineForYear } from "../lib/api";
import YearAtAGlance from "../components/YearAtAGlance";

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
      <WhatsHappening events={happenings} />
      <WhyTravel />
      <YearAtAGlance year={new Date().getFullYear()} items={tripOutlineYear} />
      <Blog />
      <Testimonial />
      <Partners />
      <Footer />
    </div>
  );
}

