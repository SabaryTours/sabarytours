"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft01Icon, Clock01Icon, UserGroupIcon, Tick02Icon, Cancel01Icon, StarIcon, CheckmarkBadge01Icon, InformationCircleIcon, Location01Icon } from "hugeicons-react";
import { Tour } from "../data/packages";
import Footer from "../components/Footer";
import StarRating from "../components/StarRating";
import TourGrid from "../components/TourGrid";
import SafeHTML from "../components/SafeHTML";
import TourComments from "../components/TourComments";

interface TourDetailPageProps {
  tour: Tour;
  categoryTitle: string;
  similarTours?: Tour[];
}

export default function TourDetailPage({ tour, categoryTitle, similarTours = [] }: TourDetailPageProps) {
  const router = useRouter();
  const [showAllGallery, setShowAllGallery] = useState(false);

  const displayImages = [tour.image, ...(tour.gallery || [])].filter(Boolean);
  const heroImages = displayImages.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header & Title Section */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 pt-8 pb-6">
        <button
          onClick={() => window.history.back()}
          className="text-[#666] hover:text-[#222] text-[14px] font-sans mb-4 inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft01Icon className="w-4 h-4" />
          Back to packages
        </button>

        <div className="flex flex-col gap-2">
          <h1 
            className="text-[28px] sm:text-[36px] md:text-[42px] text-gray-900 font-bold leading-tight uppercase"
            style={{ fontFamily: 'var(--font-unlimited-pie)' }}
          >
            {tour.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 font-sans">
            {tour.rating && (
              <div className="flex items-center gap-1">
                <StarRating rating={tour.rating} reviewCount={tour.reviewCount} size="sm" />
              </div>
            )}
            {tour.location && (
              <div className="flex items-center gap-1 font-medium">
                <Location01Icon size={16} className="text-[#ff5e00]" />
                {tour.location}
              </div>
            )}
            {tour.trustBadges?.includes('best-seller') && (
              <div className="flex items-center gap-1 text-[#ff5e00] font-medium bg-orange-50 px-2 py-0.5 rounded">
                <CheckmarkBadge01Icon size={16} />
                Best Seller
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Visual Gallery Showcase */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[350px] sm:h-[450px] md:h-[500px] rounded-2xl overflow-hidden relative group">
          {/* Main Large Image */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 h-full relative cursor-pointer" onClick={() => setShowAllGallery(true)}>
            <Image
              src={heroImages[0]}
              alt={tour.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              unoptimized
            />
          </div>
          
          {/* Secondary Images (Desktop Only) */}
          <div className="hidden md:flex flex-col gap-2 col-span-1 lg:col-span-1 h-full">
            {heroImages[1] && (
              <div className="relative h-1/2 w-full cursor-pointer" onClick={() => setShowAllGallery(true)}>
                <Image
                  src={heroImages[1]}
                  alt={`${tour.title} gallery`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              </div>
            )}
            {heroImages[2] && (
              <div className="relative h-1/2 w-full cursor-pointer" onClick={() => setShowAllGallery(true)}>
                <Image
                  src={heroImages[2]}
                  alt={`${tour.title} gallery`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                {displayImages.length > 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
                    <span className="text-white font-semibold font-sans">
                      +{displayImages.length - 3} Photos
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Mobile View all button */}
          <button 
            onClick={() => setShowAllGallery(true)}
            className="md:hidden absolute bottom-4 right-4 bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold shadow-md"
          >
            See all photos
          </button>
        </div>
      </div>

      {/* 3. 2-Column Main Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 flex flex-col lg:flex-row gap-12 pb-16">
        
        {/* LEFT COLUMN: Content */}
        <div className="w-full lg:w-[65%] space-y-12">
          
          {/* At a Glance */}
          <section>
            <h2 className="text-2xl font-bold font-sans text-gray-900 mb-6 uppercase" style={{ fontFamily: 'var(--font-unlimited-pie)'}}>
              At a Glance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex flex-col gap-1">
                <Clock01Icon size={24} className="text-[#ff5e00] mb-1" />
                <span className="text-xs text-gray-500 font-sans font-medium uppercase">Duration</span>
                <span className="text-sm text-gray-900 font-medium font-sans">{tour.duration || 'Not specified'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <Location01Icon size={24} className="text-[#ff5e00] mb-1" />
                <span className="text-xs text-gray-500 font-sans font-medium uppercase">Location</span>
                <span className="text-sm text-gray-900 font-medium font-sans">{tour.location || 'Various'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <UserGroupIcon size={24} className="text-[#ff5e00] mb-1" />
                <span className="text-xs text-gray-500 font-sans font-medium uppercase">Format</span>
                <span className="text-sm text-gray-900 font-medium font-sans">Private / Group</span>
              </div>
              <div className="flex flex-col gap-1">
                <Tick02Icon size={24} className="text-green-600 mb-1" />
                <span className="text-xs text-gray-500 font-sans font-medium uppercase">Cancellation</span>
                <span className="text-sm text-gray-900 font-medium font-sans">{tour.freeCancellation ? 'Free Cancellation' : 'Standard'}</span>
              </div>
            </div>
          </section>

          {/* Description */}
          {tour.description && (
            <section>
              <h2 className="text-2xl font-bold font-sans text-gray-900 mb-6 uppercase" style={{ fontFamily: 'var(--font-unlimited-pie)'}}>
                About this tour
              </h2>
              <div className="prose max-w-none text-gray-600 font-sans text-base leading-relaxed">
                <SafeHTML html={tour.description} />
              </div>
            </section>
          )}

          {/* Included / Excluded (Side by side on desktop) */}
          {(tour.whatsIncluded && tour.whatsIncluded.length > 0) && (
            <section className="bg-white border text-black border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold font-sans text-gray-900 mb-6 uppercase" style={{ fontFamily: 'var(--font-unlimited-pie)'}}>
                What&apos;s Included
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {tour.whatsIncluded.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700 font-sans">
                    <Tick02Icon size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Day-by-Day Itinerary Timeline */}
          {tour.itinerary && tour.itinerary.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold font-sans text-gray-900 mb-8 uppercase" style={{ fontFamily: 'var(--font-unlimited-pie)'}}>
                Itinerary Highlights
              </h2>
              <div className="relative pl-6 md:pl-8 space-y-8 border-l-2 border-orange-100 ml-4">
                {tour.itinerary.map((item, index) => (
                  <div key={index} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[35px] md:-left-[43px] top-1 w-6 h-6 md:w-8 md:h-8 bg-white border-2 border-[#ff5e00] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-[#ff5e00] rounded-full"></div>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[#ff5e00] font-bold font-sans text-sm tracking-wide uppercase">
                          {item.time}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 font-sans mb-2">
                        {item.activity}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 font-sans leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Map Section */}
          <section>
            <h2 className="text-2xl font-bold font-sans text-gray-900 mb-6 uppercase flex items-center gap-2" style={{ fontFamily: 'var(--font-unlimited-pie)'}}>
              <Location01Icon /> Tour Location
            </h2>
            <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 relative shadow-inner">
              {tour.map_url ? (
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={tour.map_url}
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Location01Icon size={48} className="mb-2 opacity-50" />
                  <p className="font-sans font-medium">Map view not available for this location</p>
                </div>
              )}
            </div>
          </section>

          {/* FAQs */}
          {tour.faq && tour.faq.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold font-sans text-gray-900 mb-6 uppercase" style={{ fontFamily: 'var(--font-unlimited-pie)'}}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {tour.faq.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-gray-900 font-bold font-sans text-lg mb-2">
                      {item.question}
                    </h3>
                    <p className="text-gray-600 font-sans leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Sticky Booking Sidebar */}
        <div className="w-full lg:w-[35%] relative">
          <div className="sticky top-28 bg-white border border-gray-200 text-black shadow-2xl rounded-2xl p-6 flex flex-col gap-6 transform transition-all hover:-translate-y-1">
            
            {/* Price block */}
            <div>
              <p className="text-sm text-gray-500 font-sans font-medium uppercase tracking-wider mb-1">Starting from</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold font-sans text-gray-900 leading-none">
                  {tour.price}
                </span>
                <span className="text-gray-500 font-sans text-sm pb-1">per person</span>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3 bg-orange-50 text-orange-800 p-3 rounded-lg border border-orange-100">
              <InformationCircleIcon size={20} className="flex-shrink-0" />
              <p className="text-sm font-sans font-medium">
                Highly likely to sell out. Reserve your spot today!
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => router.push(`/booking?tour=${tour.slug}`)}
              className="w-full bg-[#ff5e00] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#e55500] hover:shadow-lg hover:shadow-orange-500/30 transition-all font-sans uppercase tracking-wide"
            >
              Book Now
            </button>

            {/* Trust Markers */}
            <ul className="space-y-3 mt-2">
              <li className="flex items-center gap-3 text-sm text-gray-600 font-sans">
                <Tick02Icon size={18} className="text-green-600" />
                Reserve now & pay later
              </li>
              {tour.freeCancellation && (
                <li className="flex items-center gap-3 text-sm text-gray-600 font-sans">
                  <Tick02Icon size={18} className="text-green-600" />
                  Free cancellation up to 24 hours in advance
                </li>
              )}
            </ul>

            <div className="border-t border-gray-100 pt-6 mt-2">
              <p className="text-xs text-gray-400 font-sans text-center">
                Secure checkout encrypted via standard SSL
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Comments / Reviews Section */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <TourComments tourSlug={tour.slug} />
      </div>

      {/* 5. Similar Tours Cross-Sell */}
      {similarTours.length > 0 && (
        <section className="w-full bg-gray-50 py-16 border-t border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 md:px-12">
            <h2 className="text-2xl font-bold font-sans text-gray-900 mb-8 uppercase" style={{ fontFamily: 'var(--font-unlimited-pie)'}}>
              You might also like
            </h2>
            <TourGrid tours={similarTours} categorySlug={tour.categorySlug} />
          </div>
        </section>
      )}

      {/* Gallery Modal */}
      {showAllGallery && (
        <div className="fixed inset-0 z-[200] bg-black bg-opacity-95 flex flex-col p-4 sm:p-8 overflow-y-auto">
          <button 
            onClick={() => setShowAllGallery(false)}
            className="self-end text-white p-2 hover:bg-white/10 rounded-full mb-4 sticky top-4 z-10 transition-colors"
          >
            <Cancel01Icon size={32} />
          </button>
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
            {displayImages.map((img, i) => (
              <div key={i} className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                <Image src={img} alt={`Gallery ${i}`} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar for Booking */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-sans uppercase font-medium">From</span>
            <span className="text-lg font-bold font-sans text-gray-900">{tour.price}</span>
          </div>
          <button
            onClick={() => router.push(`/booking?tour=${tour.slug}`)}
            className="flex-1 bg-[#ff5e00] text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-[#e55500] transition-colors font-sans uppercase tracking-wide text-center"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Add padding to footer to account for mobile sticky bar */}
      <div className="md:pb-0 pb-20">
        <Footer />
      </div>
    </div>
  );
}
