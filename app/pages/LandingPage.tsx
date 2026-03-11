import Hero from "../components/Hero";
import WhyTravel from "../components/WhyTravel";
import Packages from "../components/Packages";
import WhatsHappening from "../components/WhatsHappening";
import Blog from "../components/Blog";
import Testimonial from "../components/Testimonial";
import Partners from "../components/Partners";
import Footer from "../components/Footer";
import { getHeroImages, getHappenings } from "../lib/api";

export default async function LandingPage() {
  const images = await getHeroImages(true);
  const imageUrls = images.map((img) => img.image_url);
  const happenings = await getHappenings();

  return (
    <div className="min-h-screen bg-white">
      <Hero initialImages={imageUrls} />
      <WhyTravel />
      <Packages />
      <WhatsHappening events={happenings} />
      <Blog />
      <Testimonial />
      <Partners />
      <Footer />
    </div>
  );
}

