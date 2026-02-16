import Image from "next/image";

const events = [
  {
    category: "Ongoing",
    title: "CapeCoast City Tour",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop",
    dotColor: "#FF0000", // Red for Ongoing
  },
  {
    category: "Ongoing",
    title: "Volta Tour",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    dotColor: "#FF0000", // Red for Ongoing
  },
  {
    category: "Upcoming",
    title: "Eastern Day Trip",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop",
    dotColor: "#FF5E00", // Orange for Upcoming
  },
];

export default function WhatsHappening() {
  return (
    <section className="w-full bg-[#0060CC] relative py-8 sm:py-12 md:py-16 overflow-visible">
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
      <div className="flex flex-col md:flex-row gap-[12px] items-center leading-none uppercase w-full justify-center mb-12 overflow-visible px-2">
              <h2 
                className="text-[32px] text-[#ffffff] relative"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  lineHeight: 1
                }}
              >
                what&apos;s 
              </h2>
              <h2 
                className="text-[32px] text-[#ff5e00] relative"
                style={{
                  fontFamily: 'var(--font-unlimited-pie)',
                  lineHeight: 1,
                  textShadow: '1px 1px 0px #551f00'
                }}
              >
                happening now?!
              </h2>
            </div>

        <div className="flex flex-wrap justify-center" style={{ gap: '40px' }}>
          {events.map((event, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-[20px] border-[3px] border-[rgba(255,255,255,0.5)]"
              style={{
                width: '342px',
                height: '124px',
              }}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover rounded-[20px]"
                  unoptimized
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
                        backgroundColor: event.dotColor,
                        opacity: 0.8,
                      }}
                    />
                    <div 
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{
                        backgroundColor: event.dotColor,
                        opacity: 0.4,
                      }}
                    />
                  </div>
                  <span className="text-[#222] text-[12px] font-bold leading-none">
                    {event.category}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="text-white text-[16px] font-bold leading-[28px]">
                  {event.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

