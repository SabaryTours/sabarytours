import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "../components/Footer";
import { IconCheckCircle, IconMail } from "../components/legal/LegalIcons";

function TocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <a href={href} className="text-[#0060cc] hover:underline text-sm font-sans">
        {children}
      </a>
    </li>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pt-2">
      <h2 className="text-lg font-bold text-gray-900 font-sans border-l-4 border-[#ff5e00] pl-3 mb-4">{title}</h2>
      <div className="text-[15px] text-gray-600 font-sans leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <div className="border-b border-gray-200/80 bg-white">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#ff5e00] font-sans mb-2">
            Legal
          </p>
          <h1 className="text-[28px] sm:text-[36px] font-bold text-gray-900 font-sans tracking-tight">
            Privacy policy &amp; terms
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-sans">Last updated: 14 February 2026</p>
          <p className="mt-4 text-gray-600 font-sans text-[15px] max-w-2xl">
            Welcome. Use the links below to jump directly to any section.
          </p>
        </div>
      </div>

      <main className="container mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-12 pb-20">
        <nav
          aria-label="Table of contents"
          className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm mb-10"
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-sans mb-4">Table of contents</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-[#0060cc] uppercase tracking-wide mb-2 font-sans">
                Privacy policy
              </h3>
              <ul className="space-y-2">
                <TocLink href="#pp-collect">Information we collect</TocLink>
                <TocLink href="#pp-use">How we use your information</TocLink>
                <TocLink href="#pp-media">Images, videos, and reviews</TocLink>
                <TocLink href="#pp-payments">Payments &amp; currency</TocLink>
                <TocLink href="#pp-cookies">Cookies &amp; third-party services</TocLink>
                <TocLink href="#pp-rights">Your rights</TocLink>
                <TocLink href="#pp-children">Children&apos;s privacy</TocLink>
                <TocLink href="#pp-storage">Data storage &amp; security</TocLink>
                <TocLink href="#pp-updates">Policy updates</TocLink>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#0060cc] uppercase tracking-wide mb-2 font-sans">
                Terms &amp; conditions
              </h3>
              <ul className="space-y-2">
                <TocLink href="#tc-personal">Personal information</TocLink>
                <TocLink href="#tc-media">Images, videos, and reviews</TocLink>
                <TocLink href="#tc-content">Website content</TocLink>
                <TocLink href="#tc-booking">Booking, payments, and currency</TocLink>
                <TocLink href="#tc-comments">User comments &amp; behavior</TocLink>
                <TocLink href="#tc-linking">Linking to our website</TocLink>
                <TocLink href="#tc-liability">Accuracy &amp; liability</TocLink>
                <TocLink href="#tc-changes">Changes to terms</TocLink>
              </ul>
            </div>
          </div>
        </nav>

        <article className="rounded-2xl border border-gray-200/80 bg-white p-6 sm:p-10 shadow-sm space-y-14">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-sans mb-8 pb-2 border-b border-gray-100">
              Privacy policy – Sabary Tours
            </h2>

            <Section id="pp-collect" title="1. Information we collect">
              <p>We may collect:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-gray-800">Personal information:</strong> Information you provide when
                  contacting us or booking tours, such as your name, email, phone number, and postal address.
                </li>
                <li>
                  <strong className="text-gray-800">Non-personal information:</strong> Automatically collected
                  information, such as IP address, browser type, pages visited, and date/time of access.
                </li>
              </ul>
            </Section>

            <Section id="pp-use" title="2. How we use your information">
              <p>We use your information to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Operate, maintain, and improve our website and services</li>
                <li>Communicate with you about bookings, updates, promotions, or special offers</li>
                <li>Personalize your experience and ensure website security</li>
              </ul>
            </Section>

            <Section id="pp-media" title="3. Images, videos, and reviews">
              <p>
                We may use photos, videos, or reviews shared by customers on our website, social media, or marketing
                materials. By using our services, you consent to this use. If you do not agree, please notify us before
                or after your visit via{" "}
                <a href="mailto:info@sabarytours.com" className="text-[#0060cc] font-semibold hover:underline">
                  info@sabarytours.com
                </a>
                , and we will remove your content from public use.
              </p>
            </Section>

            <Section id="pp-payments" title="4. Payments &amp; currency">
              <p>All payments are processed securely through trusted providers:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-gray-800">Paystack</strong> – accepts Mastercard, Visa, debit cards, and
                  other supported cards
                </li>
                <li>
                  <strong className="text-gray-800">Mobile Money</strong>
                </li>
              </ul>
              <p>
                <strong className="text-gray-800">Dual currency support:</strong> Prices may appear in GHS or USD
                depending on your selection. Payment must be made in the chosen currency at checkout. Exchange rate
                differences are the customer&apos;s responsibility. We do not store your payment details on our
                servers.
              </p>
            </Section>

            <Section id="pp-cookies" title="5. Cookies &amp; third-party services">
              <p>We may use cookies and third-party analytics tools to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Enhance your browsing experience</li>
                <li>Understand website usage</li>
              </ul>
              <p>You can manage or disable cookies via your browser settings.</p>
            </Section>

            <Section id="pp-rights" title="6. Your rights">
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal data</li>
              </ul>
              <p>
                These rights are subject to applicable laws, including the Ghana Data Protection Act, 2012 (Act 843)
                and, where relevant, GDPR/CCPA.
              </p>
              <p className="flex items-start gap-2 not-prose">
                <span className="text-[#0060cc] mt-0.5 shrink-0" aria-hidden>
                  <IconMail className="w-5 h-5" />
                </span>
                <span>
                  Contact:{" "}
                  <a href="mailto:info@sabarytours.com" className="text-[#0060cc] font-semibold hover:underline">
                    info@sabarytours.com
                  </a>
                </span>
              </p>
            </Section>

            <Section id="pp-children" title="7. Children&apos;s privacy">
              <p>
                Our services are not directed at children under 13, and we do not knowingly collect personal data from
                children.
              </p>
            </Section>

            <Section id="pp-storage" title="8. Data storage &amp; security">
              <p>
                We store your personal information, bookings, and media securely in our database (SQL-based system) to
                ensure confidentiality, integrity, and restricted access.
              </p>
            </Section>

            <Section id="pp-updates" title="9. Policy updates">
              <p>
                We may update this Privacy Policy from time to time. All updates will be posted on this page with the
                revised date.
              </p>
            </Section>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 font-sans mb-8 pb-2 border-b border-gray-100">
              Terms &amp; conditions – Sabary Tours
            </h2>

            <Section id="tc-personal" title="1. Personal information">
              <p>
                Your personal information is collected to provide our services and improve your experience. For
                details, see our{" "}
                <a href="#pp-collect" className="text-[#0060cc] font-semibold hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </Section>

            <Section id="tc-media" title="2. Images, videos, and reviews">
              <p>
                By participating in our tours or submitting content, you grant Sabary Tours a non-exclusive, worldwide,
                royalty-free license to use your images, videos, or reviews for marketing, website, and social media
                purposes. If you do not agree, please notify us at{" "}
                <a href="mailto:info@sabarytours.com" className="text-[#0060cc] font-semibold hover:underline">
                  info@sabarytours.com
                </a>
                , and we will remove your content.
              </p>
            </Section>

            <Section id="tc-content" title="3. Website content">
              <p>
                All content on this website, including text, images, and branding, belongs to Sabary Tours. Copying,
                reproducing, or reusing content without written permission is prohibited.
              </p>
            </Section>

            <Section id="tc-booking" title="4. Booking, payments, and currency">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Tour prices may be displayed in GHS or USD. Payment must be made in the selected currency at booking.
                  Exchange rate differences are the customer&apos;s responsibility.
                </li>
                <li>
                  Payments are processed securely via Paystack (Mastercard, Visa, debit cards) or Mobile Money.
                </li>
                <li>
                  Refunds, if applicable, will be issued in the same currency used for payment. Currency conversion rates
                  may apply.
                </li>
              </ul>
            </Section>

            <Section id="tc-comments" title="5. User comments &amp; behavior">
              <p>
                Comments and submissions must be lawful, respectful, and not misleading. We reserve the right to remove
                content that violates these rules.
              </p>
            </Section>

            <Section id="tc-linking" title="6. Linking to our website">
              <p>
                Linking is allowed provided it is not misleading or harmful to our brand. Requests can be sent to{" "}
                <a href="mailto:info@sabarytours.com" className="text-[#0060cc] font-semibold hover:underline">
                  info@sabarytours.com
                </a>
                .
              </p>
            </Section>

            <Section id="tc-liability" title="7. Accuracy &amp; liability">
              <p>
                While we strive for accuracy, Sabary Tours is not liable for errors, omissions, or losses resulting from
                use of this website.
              </p>
            </Section>

            <Section id="tc-changes" title="8. Changes to terms">
              <p>
                These Terms may be updated at any time. Continued use of the website constitutes acceptance of the
                latest version.
              </p>
              <p className="flex items-start gap-2 not-prose">
                <span className="text-[#0060cc] mt-0.5 shrink-0" aria-hidden>
                  <IconMail className="w-5 h-5" />
                </span>
                <span>
                  Contact:{" "}
                  <a href="mailto:info@sabarytours.com" className="text-[#0060cc] font-semibold hover:underline">
                    info@sabarytours.com
                  </a>
                </span>
              </p>
            </Section>
          </div>

          <div className="flex items-start gap-3 pt-4 border-t border-gray-100 text-gray-600 text-sm font-sans">
            <span className="text-green-600 shrink-0 mt-0.5" aria-hidden>
              <IconCheckCircle className="w-5 h-5" />
            </span>
            <p>
              For cancellation and refund scenarios in practice, you may also find helpful context in our{" "}
              <Link href="/faq#cancellations-refunds" className="text-[#0060cc] font-semibold hover:underline">
                FAQs
              </Link>
              .
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
