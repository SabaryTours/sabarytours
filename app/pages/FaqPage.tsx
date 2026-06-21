import Footer from "../components/Footer";
import type { FaqSectionGroup } from "../lib/faqs";

function FaqBlock({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
      <h3 className="text-base font-bold text-gray-900 font-sans">{question}</h3>
      <div
        className="faq-answer mt-3 text-[15px] text-gray-600 font-sans leading-relaxed space-y-3 [&_a]:text-[#0060cc] [&_a]:font-semibold [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_p+p]:mt-3 [&_strong]:text-gray-900"
        dangerouslySetInnerHTML={{ __html: answer }}
      />
    </div>
  );
}

interface FaqPageProps {
  sections: FaqSectionGroup[];
}

export default function FaqPage({ sections }: FaqPageProps) {
  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <div className="border-b border-gray-200/80 bg-white">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#ff5e00] font-sans mb-2">
            Help centre
          </p>
          <h1 className="text-[28px] sm:text-[36px] font-bold text-gray-900 font-sans tracking-tight">
            Frequently asked questions
          </h1>
          <p className="mt-3 text-gray-600 font-sans text-[15px] max-w-2xl">
            Quick answers about booking, tours, payments, and travel with Sabary Tours.
          </p>
        </div>
      </div>

      <main className="container mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-12 pb-20">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-10 shadow-sm space-y-12">
          {sections.length === 0 ? (
            <p className="text-gray-500 font-sans text-[15px]">
              FAQs are being updated. Please check back soon or contact us directly.
            </p>
          ) : (
            sections.map((section) => (
              <section key={section.slug} id={section.slug} className="scroll-mt-24">
                <h2 className="text-lg font-bold text-gray-900 font-sans border-l-4 border-[#0060cc] pl-3 mb-6">
                  {section.title}
                </h2>
                <div className="space-y-8">
                  {section.items.map((item) => (
                    <FaqBlock key={item.id} question={item.question} answer={item.answer} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
