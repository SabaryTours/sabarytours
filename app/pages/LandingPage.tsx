import Hero from "../components/Hero";
import WhyTravel from "../components/WhyTravel";
import Packages from "../components/Packages";
import WhatsHappening from "../components/WhatsHappening";
import Blog from "../components/Blog";
import Testimonial from "../components/Testimonial";
import Partners from "../components/Partners";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <WhyTravel />
      <Packages />
      <WhatsHappening />
      <Blog />
      <Testimonial />
      <Partners />
      <Footer />
    </div>
  );
}

