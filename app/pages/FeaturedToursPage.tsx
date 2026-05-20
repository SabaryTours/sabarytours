import Footer from "../components/Footer";
import FeaturedTours from "../components/FeaturedTours";

export default function FeaturedToursPage() {
  return (
    <main className="min-h-screen bg-white font-sans">
      <FeaturedTours showHeader />
      <Footer />
    </main>
  );
}
