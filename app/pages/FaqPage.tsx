import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "../components/Footer";
import { IconChat, IconMail, IconPhone } from "../components/legal/LegalIcons";

function FaqBlock({ question, children }: { question: string; children: ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
      <h3 className="text-base font-bold text-gray-900 font-sans">{question}</h3>
      <div className="mt-3 text-[15px] text-gray-600 font-sans leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function FaqPage() {
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
          <section id="booking-reservations" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 font-sans border-l-4 border-[#0060cc] pl-3 mb-6">
              Booking &amp; reservations
            </h2>
            <div className="space-y-8">
              <FaqBlock question="How do I book a tour?">
                <p>
                  You can book directly through our website by selecting your preferred tour, choosing a date, and
                  making payment (deposit or full payment).
                </p>
              </FaqBlock>
              <FaqBlock question="Can I reserve a tour and pay later?">
                <p>
                  Yes. You can pay a deposit to secure your booking and pay the remaining balance later (usually 48
                  hours before the tour).
                </p>
              </FaqBlock>
              <FaqBlock question="How will I know my booking is confirmed?">
                <p>
                  You will receive confirmation via email or WhatsApp with your booking details and reference number.
                </p>
              </FaqBlock>
            </div>
          </section>

          <section id="first-time-visitors" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 font-sans border-l-4 border-[#0060cc] pl-3 mb-6">
              First-time visitors &amp; travel support
            </h2>
            <div className="space-y-8">
              <FaqBlock question="What if I’m visiting Ghana for the first time?">
                <p>No problem at all. We regularly host first-time visitors and provide guidance before your tour, including meeting points, timing, and preparation tips.</p>
                <p>
                  We also run a dedicated Ghana travel blog covering destinations, travel tips, culture, and travel
                  preparation guidance to help you plan confidently. You can explore it anytime to learn more about
                  Ghana before your trip — visit our{" "}
                  <Link href="/blog" className="text-[#0060cc] font-semibold hover:underline">
                    travel blog
                  </Link>
                  .
                </p>
              </FaqBlock>
            </div>
          </section>

          <section id="tour-experience" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 font-sans border-l-4 border-[#0060cc] pl-3 mb-6">
              Tour experience
            </h2>
            <div className="space-y-8">
              <FaqBlock question="Do you offer pickup as part of your packages?">
                <p>
                  Yes. Complimentary pickup and drop-off on the day of the tour are included for most packages, at no
                  extra cost. Pickup details will be confirmed after booking.
                </p>
              </FaqBlock>
              <FaqBlock question="Do you offer airport pickup services?">
                <p>Yes. We offer:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Car rental packages</li>
                  <li>Tour packages that include airport pickup and drop-off</li>
                  <li>Multi-day packages with full transport coordination</li>
                </ul>
              </FaqBlock>
              <FaqBlock question="Do you offer multi-day tours?">
                <p>
                  Yes, we do. Multi-day tours are often more economical and allow you to experience multiple
                  destinations comfortably without rushing.
                </p>
              </FaqBlock>
              <FaqBlock question="Can I customize my tour experience?">
                <p>Yes. We can tailor tours based on your interests, schedule, group type, and comfort level.</p>
              </FaqBlock>
            </div>
          </section>

          <section id="suitability-accessibility" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 font-sans border-l-4 border-[#0060cc] pl-3 mb-6">
              Suitability &amp; accessibility
            </h2>
            <div className="space-y-8">
              <FaqBlock question="Are your tours suitable for families and beginners?">
                <p>
                  Yes. We offer a variety of packages, making our tours ideal for different travel styles and comfort
                  levels. Whether you want a relaxed hangout experience or an adventure-filled tour, we have options
                  designed to suit you.
                </p>
              </FaqBlock>
              <FaqBlock question="Are your tours safe for guests using wheelchairs?">
                <p>
                  Yes, depending on the tour. Some adventure tours may not be suitable due to terrain and activity
                  level. However, many city tours and relaxed experiences are accessible, and our guides are always
                  available to assist. Please inform us in advance so we can recommend the best options for you.
                </p>
              </FaqBlock>
            </div>
          </section>

          <section id="payments-flexibility" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 font-sans border-l-4 border-[#0060cc] pl-3 mb-6">
              Payments &amp; flexibility
            </h2>
            <div className="space-y-8">
              <FaqBlock question="What payment methods do you accept?">
                <p>We accept card payments (Mastercard, Visa, debit cards) and Mobile Money.</p>
              </FaqBlock>
              <FaqBlock question="Can I pay in Ghana Cedis or US Dollars?">
                <p>
                  Yes. Prices may be displayed in GHS or USD, and you can pay in your selected currency.
                </p>
              </FaqBlock>
              <FaqBlock question="Can I pay in installments?">
                <p>
                  Yes. You can secure your booking with a deposit and pay the remaining balance later, based on the
                  agreed payment timeline.
                </p>
              </FaqBlock>
              <FaqBlock question="Are there any hidden fees?">
                <p>
                  No. All major costs are clearly outlined. Optional extras, if any, are always communicated in
                  advance.
                </p>
              </FaqBlock>
            </div>
          </section>

          <section id="cancellations-refunds" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 font-sans border-l-4 border-[#0060cc] pl-3 mb-6">
              Cancellations &amp; refunds
            </h2>
            <div className="space-y-8">
              <FaqBlock question="Are last-minute cancellations refundable?">
                <p>
                  Cancellations made less than 3 days before the tour date are generally non-refundable. However, in
                  cases of genuine emergencies (such as accidents, medical emergencies, or serious unforeseen
                  circumstances beyond your control), we may review the situation and consider a refund or rescheduling
                  option.
                </p>
                <p>
                  If non-refundable third-party bookings (apartments, hotels, transport, activities) have already been
                  made on your behalf, those costs will be deducted from any refund. Supporting documentation may be
                  required.
                </p>
              </FaqBlock>
            </div>
          </section>

          <section id="trust-safety" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 font-sans border-l-4 border-[#0060cc] pl-3 mb-6">
              Trust, safety &amp; reputation
            </h2>
            <div className="space-y-8">
              <FaqBlock question="How do I know I can trust your company?">
                <p>
                  We focus on transparent communication, verified bookings, real customer experiences, and professional
                  tour coordination to ensure quality service. We also have genuine customer reviews available on
                  platforms such as Google and Tripadvisor.
                </p>
              </FaqBlock>
              <FaqBlock question="Is it safe to book and pay online?">
                <p>Yes. Payments are processed securely, and we do not store card details on our servers.</p>
              </FaqBlock>
            </div>
          </section>

          <section id="media-content" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 font-sans border-l-4 border-[#0060cc] pl-3 mb-6">
              Media &amp; content
            </h2>
            <div className="space-y-8">
              <FaqBlock question="Will my photos or videos be used by Sabary Tours?">
                <p>
                  Photos, videos, or reviews shared during tours may be used for marketing. If you prefer not to, simply
                  inform us.
                </p>
              </FaqBlock>
            </div>
          </section>

          <section id="support-contact" className="scroll-mt-24">
            <h2 className="text-lg font-bold text-gray-900 font-sans border-l-4 border-[#0060cc] pl-3 mb-6">
              Support &amp; communication
            </h2>
            <FaqBlock question="How can I contact you?">
              <p className="font-medium text-gray-800">You can reach us via:</p>
              <ul className="space-y-4 not-prose">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#0060cc]" aria-hidden>
                    <IconMail className="w-5 h-5" />
                  </span>
                  <span>
                    <a
                      href="mailto:info@sabarytours.com"
                      className="text-[#0060cc] font-semibold hover:underline"
                    >
                      info@sabarytours.com
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#0060cc]" aria-hidden>
                    <IconPhone className="w-5 h-5" />
                  </span>
                  <span>
                    WhatsApp:{" "}
                    <a
                      href="https://wa.me/233576093838"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0060cc] font-semibold hover:underline"
                    >
                      +233 576 093 838
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#0060cc]" aria-hidden>
                    <IconChat className="w-5 h-5" />
                  </span>
                  <span>
                    <strong className="text-gray-900">Live chat</strong> — Use the live chat button on our website. Our
                    team is usually available to respond quickly during business hours.
                  </span>
                </li>
              </ul>
            </FaqBlock>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
