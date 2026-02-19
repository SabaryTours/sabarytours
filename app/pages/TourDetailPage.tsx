"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft01Icon } from "hugeicons-react";
import { Tour, getSimilarTours } from "../data/packages";
import Footer from "../components/Footer";
import StarRating from "../components/StarRating";
import TourGrid from "../components/TourGrid";
import SafeHTML from "../components/SafeHTML";

interface TourDetailPageProps {
  tour: Tour;
  categoryTitle: string;
}

export default function TourDetailPage({ tour }: TourDetailPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("about");
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(0);
  const similarTours = getSimilarTours(tour, 3);

  // Auto-scroll gallery images
  useEffect(() => {
    if (tour.gallery && tour.gallery.length > 1) {
      const interval = setInterval(() => {
        setSelectedGalleryImage((prev) => (prev + 1) % tour.gallery!.length);
      }, 4000); // Change image every 4 seconds
      return () => clearInterval(interval);
    }
  }, [tour.gallery]);

  const tabs = [
    { id: "about", label: "About" },
    { id: "itinerary", label: "Itinerary" },
    { id: "price", label: "Price" },
    { id: "duration", label: "Duration" },
    { id: "gallery", label: "Gallery" },
    { id: "location", label: "Location" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-6">
            <button
              onClick={() => window.history.back()}
              className="text-[#666] hover:text-[#222] text-[14px] font-sans mb-4 inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft01Icon className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-3 mb-3">
              <h1 
                className="text-[28px] sm:text-[32px] md:text-[36px] text-[#ff5e00] font-normal uppercase leading-tight"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  textShadow: '1px 1px 0px #331300',
                }}
              >
                {tour.title}
              </h1>
              {tour.slug === "accra-explorer" && (
                <Image
                  src="/assets/feet.svg"
                  alt="Explorer"
                  width={32}
                  height={32}
                  className="mt-1"
                />
              )}
            </div>
            
            {/* Rating and Trust Badges */}
            <div className="flex items-center gap-4 mb-4">
              {tour.rating && (
                <StarRating rating={tour.rating} reviewCount={tour.reviewCount} size="md" />
              )}
              {tour.trustBadges && tour.trustBadges.length > 0 && (
                <div className="flex gap-2">
                  {tour.trustBadges.map((badge) => (
                    <span
                      key={badge}
                      className="px-2 py-1 rounded text-[11px] font-medium font-sans bg-gray-100 text-gray-600"
                    >
                      {badge === "popular" ? "Popular" : badge === "best-seller" ? "Best Seller" : "Verified"}
                    </span>
                  ))}
                </div>
              )}
              {tour.freeCancellation && (
                <span className="px-2 py-1 rounded text-[11px] font-medium font-sans bg-gray-100 text-gray-600">
                  Free Cancellation
                </span>
              )}
            </div>

            {tour.description && (
              <div className="text-[#666] text-[15px] sm:text-[16px] leading-[26px] font-sans max-w-3xl">
                <SafeHTML html={tour.description} />
              </div>
            )}
          </div>

          {/* Pills Navigation */}
          <div className="flex items-center flex-wrap gap-3 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-[14px] sm:text-[15px] font-medium font-sans transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#ff5e00] text-white shadow-md scale-105"
                    : "bg-gray-100 text-[#666] hover:bg-gray-200 hover:text-[#222]"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => router.push(`/booking?tour=${tour.slug}`)}
              className="ml-auto bg-[#ff5e00] text-white px-6 py-2.5 rounded-full font-semibold text-[14px] sm:text-[15px] hover:bg-[#e55500] hover:shadow-lg hover:scale-105 transition-all duration-200 font-sans whitespace-nowrap"
            >
              Book now
            </button>
          </div>
        </div>
      </div>

      {/* Main Image with Gallery */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 mb-10">
        <div className="container mx-auto max-w-5xl">
          <div className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={tour.gallery && tour.gallery.length > 0 ? tour.gallery[selectedGalleryImage] : tour.image}
              alt={tour.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          
          {/* Gallery Thumbnails */}
          {tour.gallery && tour.gallery.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {tour.gallery.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedGalleryImage(index)}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedGalleryImage === index ? "border-[#ff5e00] opacity-100" : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${tour.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 pb-12">
        <div className="container mx-auto max-w-5xl">
          {activeTab === "about" && (
            <div className="space-y-10">
              {tour.activities && tour.activities.length > 0 && (
                <div>
                  <h2 
                    className="text-[22px] sm:text-[24px] text-[#222] font-normal uppercase mb-5"
                    style={{
                      fontFamily: 'var(--font-unlimited-pie)',
                    } as React.CSSProperties}
                  >
                    Tour Activities
                  </h2>
                  <ul className="space-y-3">
                    {tour.activities.map((activity, index) => (
                      <li key={index} className="text-[#555] text-[15px] sm:text-[16px] leading-[26px] font-sans flex items-start">
                        <span className="text-[#ff5e00] mr-3 mt-1.5">•</span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tour.whatsIncluded && tour.whatsIncluded.length > 0 && (
                <div>
                  <h2 
                    className="text-[22px] sm:text-[24px] text-[#222] font-normal uppercase mb-5"
                    style={{
                      fontFamily: 'var(--font-unlimited-pie)',
                  
                    } as React.CSSProperties}
                  >
                    What&apos;s Included
                  </h2>
                  <ul className="space-y-3">
                    {tour.whatsIncluded.map((item, index) => (
                      <li key={index} className="text-[#555] text-[15px] sm:text-[16px] leading-[26px] font-sans flex items-start">
                        <span className="text-[#00A86B] mr-3 mt-1.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tour.whyBook && tour.whyBook.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <h2 
                    className="text-[22px] sm:text-[24px] text-[#222] font-normal uppercase mb-5"
                    style={{
                      fontFamily: 'var(--font-unlimited-pie)',
                    } as React.CSSProperties}
                  >
                    Why Book This Tour
                  </h2>
                  <ul className="space-y-3">
                    {tour.whyBook.map((reason, index) => (
                      <li key={index} className="text-[#555] text-[15px] sm:text-[16px] leading-[26px] font-sans flex items-start hover:text-[#222] transition-colors duration-200">
                        <span className="text-[#ff5e00] mr-3 mt-1.5 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "itinerary" && (
            <div>
              <h2 
                className="text-[22px] sm:text-[24px] text-[#222] font-normal uppercase mb-6"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                } as React.CSSProperties}
              >
                Itinerary
              </h2>
              {tour.itinerary && tour.itinerary.length > 0 ? (
                <div className="space-y-4">
                  {tour.itinerary.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 rounded-lg p-3 -m-3 transition-colors duration-200">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff5e00] to-[#e55500] flex items-center justify-center text-white font-bold text-[14px] font-sans shadow-md hover:shadow-lg transition-shadow duration-300">
                          {item.time}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[#222] text-[17px] sm:text-[18px] font-semibold mb-1 font-sans">
                          {item.activity}
                        </h3>
                        {item.description && (
                          <p className="text-[#555] text-[15px] sm:text-[16px] leading-[26px] font-sans">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#666] text-[15px] font-sans">
                  Itinerary details coming soon.
                </p>
              )}
            </div>
          )}

          {activeTab === "price" && (
            <div className="space-y-8">
              <div>
                <h2 
                  className="text-[22px] sm:text-[24px] text-[#222] font-normal uppercase mb-5"
                  style={{
                    fontFamily: 'var(--font-unlimited-pie)',
                    textShadow: '0px 4px 0px #893300',
                    WebkitTextStroke: '1px #893300',
                  } as React.CSSProperties}
                >
                  Pricing
                </h2>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-[#222] text-[28px] sm:text-[36px] font-bold font-sans">
                      {tour.price}
                    </span>
                    <span className="text-[#666] text-[15px] font-sans">per person</span>
                  </div>
                  {tour.bookedCount && (
                    <p className="text-[#666] text-[14px] font-sans">
                      Booked {tour.bookedCount} times
                    </p>
                  )}
                </div>
              </div>
              
              {/* Pricing Breakdown */}
              <div>
                <h3 className="text-[#222] text-[20px] font-bold mb-4 font-sans">
                  What&apos;s Included in the Price
                </h3>
                {tour.whatsIncluded && tour.whatsIncluded.length > 0 ? (
                  <ul className="space-y-3">
                    {tour.whatsIncluded.map((item, index) => (
                      <li key={index} className="text-[#555] text-[15px] sm:text-[16px] leading-[26px] font-sans flex items-start">
                        <span className="text-[#00A86B] mr-3 mt-1.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#666] text-[15px] font-sans">
                    All tour activities and transportation included.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "duration" && (
            <div>
              <h2 
                className="text-[22px] sm:text-[24px] text-[#222] font-normal uppercase mb-4"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  textShadow: '0px 4px 0px #893300',
                  WebkitTextStroke: '1px #893300',
                } as React.CSSProperties}
              >
                Duration
              </h2>
              <p className="text-[#666] text-[16px] sm:text-[18px] leading-[24px] font-sans">
                {tour.duration || "Not specified"}
              </p>
            </div>
          )}

          {activeTab === "gallery" && (
            <div>
              <h2 
                className="text-[22px] sm:text-[24px] text-[#222] font-normal uppercase mb-6"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  textShadow: '0px 4px 0px #893300',
                  WebkitTextStroke: '1px #893300',
                } as React.CSSProperties}
              >
                Gallery
              </h2>
              {tour.gallery && tour.gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tour.gallery.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative w-full h-[200px] sm:h-[240px] rounded-lg overflow-hidden cursor-pointer hover:opacity-90 hover:scale-105 hover:shadow-lg transition-all duration-300"
                      onClick={() => setSelectedGalleryImage(index)}
                    >
                      <Image
                        src={image}
                        alt={`${tour.title} gallery ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={tour.image}
                    alt={tour.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === "location" && (
            <div>
              <h2 
                className="text-[22px] sm:text-[24px] text-[#222] font-normal uppercase mb-4"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  textShadow: '0px 4px 0px #893300',
                  WebkitTextStroke: '1px #893300',
                } as React.CSSProperties}
              >
                Location
              </h2>
              <p className="text-[#666] text-[16px] sm:text-[18px] leading-[24px] mb-4 font-sans">
                {tour.location || "Not specified"}
              </p>
              {tour.mapCoordinates && (
                <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                  <a
                    href={`https://www.google.com/maps?q=${tour.mapCoordinates.lat},${tour.mapCoordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0060CC] text-[16px] font-bold font-sans hover:underline"
                  >
                    View on Google Maps →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      {tour.faq && tour.faq.length > 0 && (
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 bg-gray-50">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-[#222] text-[24px] sm:text-[28px] font-bold mb-8 font-sans">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {tour.faq.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-5 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
                  <h3 className="text-[#222] text-[17px] sm:text-[18px] font-semibold mb-3 font-sans">
                    {item.question}
                  </h3>
                  <p className="text-[#555] text-[15px] sm:text-[16px] leading-[26px] font-sans">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Similar Tours */}
      {similarTours.length > 0 && (
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-[#222] text-[24px] sm:text-[28px] font-bold mb-8 font-sans">
              Similar Tours You Might Like
            </h2>
            <TourGrid tours={similarTours} categorySlug={tour.categorySlug} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

