import CachedImage from "./CachedImage";
import Link from "next/link";
import type { NowHappening } from "../lib/api";

interface WhatsHappeningProps {
  events: NowHappening[];
}

const statusDotColor: Record<string, string> = {
  ongoing: "#FF0000",
  upcoming: "#FF5E00",
  ended: "#999999",
};

export default function WhatsHappening({ events }: WhatsHappeningProps) {
  return (
    <section id="upcoming-tours" className="w-full bg-[#0060CC] relative py-8 sm:py-12 md:py-16 overflow-visible scroll-mt-28">
      {/* Pattern background */}
      <div className="absolute inset-0 opacity-80">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("/assets/pattern.svg")`,
          backgroundRepeat: 'repeat',
            backgroundSize: 'auto',
            opacity: 0.8,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
        }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
      <div className="flex flex-col md:flex-row gap-[12px] items-center leading-none uppercase w-full justify-center mb-12 overflow-visible px-2 text-center md:text-left">
              <h2 
                className="text-[26px] md:text-[32px] text-[#ffffff] relative"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  lineHeight: 1
                }}
              >
                what&apos;s 
              </h2>
              <h2 
                className="text-[26px] md:text-[32px] text-[#ff5e00] relative"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  lineHeight: 1,
                  textShadow: '1px 1px 0px #551f00'
                }}
              >
                happening now?!
              </h2>
            </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {events.map((event) => {
            const dotColor = statusDotColor[event.status] || "#FF5E00";
            const cardContent = (
            <div
              key={event.id}
              className="relative overflow-hidden rounded-[20px] border-[3px] border-[rgba(255,255,255,0.5)] w-full"
              style={{
                height: '124px',
              }}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <CachedImage
                  src={event.image_url}
                  alt={event.name}
                  fill
                  maxWidth={480}
                  className="object-cover rounded-[20px]"
                />
              </div>
              
              {/* Blur Overlay */}
              <div 
                className="absolute inset-0 rounded-[20px]"
                style={{
                  backdropFilter: 'blur(2px)',
                  backgroundColor: 'rgba(157,157,157,0.4)',
                }}
              />
              
              {/* Content */}
              <div className="absolute top-1/2 left-[22px] -translate-y-1/2 flex flex-col gap-3">
                {/* Status Badge */}
                <div 
                  className="flex items-center gap-1 px-[10px] py-[10px] rounded-[20px]"
                  style={{
                    backdropFilter: 'blur(6px)',
                    backgroundColor: 'rgba(255,255,255,0.72)',
                    border: '0.5px solid white',
                  }}
                >
                  {/* Pulsing Dot */}
                  <div className="relative w-3 h-3">
                    <div 
                      className="absolute inset-0 rounded-full"
                      style={{
                        backgroundColor: dotColor,
                        opacity: 0.8,
                      }}
                    />
                    <div 
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{
                        backgroundColor: dotColor,
                        opacity: 0.4,
                      }}
                    />
                  </div>
                  <span className="text-[#222] text-[12px] font-bold leading-none">
                    {event.status.toUpperCase()}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="text-white text-[16px] font-bold leading-[28px]">
                  {event.name}
                </h3>
              </div>
            </div>
            );

            return event.link_url ? (
              <Link
                key={event.id}
                href={event.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-[1.02]"
              >
                {cardContent}
              </Link>
            ) : (
              <div key={event.id} className="transition-transform hover:scale-[1.02]">
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

