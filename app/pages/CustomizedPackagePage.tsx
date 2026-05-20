import Footer from "../components/Footer";
import CustomizedPackageForm from "../components/CustomizedPackageForm";

export default function CustomizedPackagePage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative pt-24 pb-12 bg-gradient-to-br from-[#0060cc] to-[#004a9e] text-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 text-center max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-wide text-white/80 mb-2">
            Plan your Ghana trip
          </p>
          <h1
            className="text-3xl md:text-5xl uppercase font-bold mb-4"
            style={{ fontFamily: "var(--font-unlimited-pie)" }}
          >
            Customized experience
          </h1>
          <p className="text-white/90 font-sans text-base leading-relaxed">
            Tell us who&apos;s traveling, what you love, and how you want to feel —
            we&apos;ll design a tailored Ghana itinerary just for you.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 md:px-12 py-12 max-w-3xl">
        <CustomizedPackageForm />
      </section>
      <Footer />
    </div>
  );
}
