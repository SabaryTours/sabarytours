import Link from "next/link";
import Footer from "../components/Footer";
import type { FaqSectionGroup } from "../lib/faqs";

const SECTION_ACCENT = ["#ff5e00", "#0060cc", "#05A5DF", "#893300"] as const;

function FaqBlock({ question, answer }: { question: string; answer: string }) {
  return (
    <article className="rounded-xl border border-[#0060cc]/10 bg-white p-5 sm:p-6 shadow-sm">
      <h3 className="text-[15px] sm:text-base font-bold text-[#222] font-sans leading-snug">
        {question}
      </h3>
      <div
        className="faq-answer mt-3 text-[14px] sm:text-[15px] text-gray-600 font-sans leading-relaxed space-y-3 [&_a]:text-[#0060cc] [&_a]:font-semibold [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_p+p]:mt-3 [&_strong]:text-[#222]"
        dangerouslySetInnerHTML={{ __html: answer }}
      />
    </article>
  );
}

interface FaqPageProps {
  sections: FaqSectionGroup[];
}

export default function FaqPage({ sections }: FaqPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <section className="w-full px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-10">
        <div className="relative rounded-2xl overflow-hidden bg-[#0060cc]">
          <div
            className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: "url(/assets/pattern.svg)",
              backgroundRepeat: "repeat",
              backgroundSize: "auto",
            }}
          />

          <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-14 md:py-16">
            <div className="flex flex-col gap-5 items-center text-center max-w-3xl mx-auto">
              <div className="flex gap-[5px] items-center justify-center">
                <div className="h-5 w-[14px] relative shrink-0">
                  <svg viewBox="0 0 14 20" fill="none" className="w-full h-full" aria-hidden>
                    <path d="M7 0L0 4V18L7 22L14 18V4L7 0Z" fill="#ffffff" />
                  </svg>
                </div>
                <p className="text-white/90 text-[13px] sm:text-[14px] font-bold leading-[24px] font-sans">
                  Help centre
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-center leading-tight uppercase w-full px-2">
                <h1
                  className="text-[18px] sm:text-[22px] md:text-[28px] lg:text-[34px] text-white text-center"
                  style={{ fontFamily: "var(--font-unlimited-pie)", lineHeight: 1.1 }}
                >
                  Frequently asked
                </h1>
                <h1
                  className="text-[18px] sm:text-[22px] md:text-[28px] lg:text-[34px] text-[#ff5e00] text-center"
                  style={{
                    fontFamily: "var(--font-unlimited-pie)",
                    lineHeight: 1.1,
                    textShadow: "1px 1px 0px #331300",
                  }}
                >
                  questions
                </h1>
              </div>

              <p className="text-white/90 font-sans text-[14px] sm:text-[15px] leading-relaxed max-w-xl">
                Quick answers about booking, tours, payments, and travel with Sabary Tours.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="w-full px-4 sm:px-6 md:px-12 pb-10 sm:pb-14 md:pb-16">
        <div className="container mx-auto max-w-4xl">
          {sections.length > 1 ? (
            <nav
              aria-label="FAQ sections"
              className="mb-8 flex flex-wrap justify-center gap-2"
            >
              {sections.map((section, index) => (
                <a
                  key={section.slug}
                  href={`#${section.slug}`}
                  className="rounded-full px-3 py-1.5 text-xs font-bold font-sans transition-colors bg-blue-50 text-[#0060cc] hover:bg-[#ff5e00] hover:text-white"
                  style={
                    index % 2 === 1
                      ? { backgroundColor: "#fff0e8", color: "#ff5e00" }
                      : undefined
                  }
                >
                  {section.title}
                </a>
              ))}
            </nav>
          ) : null}

          <div className="relative rounded-2xl bg-blue-50 py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8">
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-20"
              style={{
                backgroundImage: "url(/assets/pattern.svg)",
                backgroundRepeat: "repeat",
                backgroundSize: "auto",
                mixBlendMode: "overlay",
              }}
            />

            <div className="relative z-10 space-y-10 sm:space-y-12">
              {sections.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#0060cc]/25 bg-white/80 px-6 py-12 text-center font-sans">
                  <p className="text-[#222] font-bold">FAQs are being updated.</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Please check back soon or{" "}
                    <Link href="/contact" className="text-[#0060cc] font-semibold hover:underline">
                      contact us
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                sections.map((section, index) => {
                  const accent = SECTION_ACCENT[index % SECTION_ACCENT.length];
                  return (
                    <section key={section.slug} id={section.slug} className="scroll-mt-28">
                      <div className="mb-5 sm:mb-6 text-center sm:text-left">
                        <h2
                          className="text-[18px] sm:text-[20px] md:text-[22px] font-bold uppercase text-[#222] inline-block border-l-4 pl-3"
                          style={{
                            fontFamily: "var(--font-unlimited-pie)",
                            borderColor: accent,
                            lineHeight: 1.2,
                          }}
                        >
                          {section.title}
                        </h2>
                      </div>
                      <div className="space-y-4">
                        {section.items.map((item) => (
                          <FaqBlock key={item.id} question={item.question} answer={item.answer} />
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-8 sm:mt-10 rounded-2xl overflow-hidden relative">
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage: "url(/assets/pattern.svg)",
                backgroundRepeat: "repeat",
                backgroundSize: "auto",
                mixBlendMode: "overlay",
              }}
            />
            <div
              className="relative z-10 px-6 py-8 sm:px-8 sm:py-10 text-center"
              style={{ backgroundColor: "#ff5e00" }}
            >
              <p
                className="text-white text-[18px] sm:text-[20px] uppercase font-bold mb-2"
                style={{ fontFamily: "var(--font-unlimited-pie)" }}
              >
                Still have questions?
              </p>
              <p className="text-white/90 text-sm font-sans mb-5 max-w-md mx-auto">
                Our team is happy to help with bookings, custom trips, or anything else about Ghana travel.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-[#ff5e00] text-sm font-bold font-sans hover:bg-blue-50 transition-colors"
                >
                  Contact us
                </Link>
                <a
                  href="https://wa.me/233576093838"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#0060cc] text-white text-sm font-bold font-sans hover:bg-[#004a9e] transition-colors"
                >
                  WhatsApp us
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
