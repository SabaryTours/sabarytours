import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-7">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px] sm:min-h-[500px] md:min-h-[623px] gap-4">
        {/* Left Column */}
        <div className="bg-[#FFDFCC] relative overflow-hidden px-4 sm:px-6 md:px-10 py-8 sm:py-12 md:py-16 flex flex-col justify-center rounded-2xl min-h-[300px] sm:min-h-[400px] md:min-h-auto">
          {/* Ghana Map Background */}
          <div className="absolute inset-0 opacity-90 flex items-center justify-center pointer-events-none">
            <div className="relative w-full h-full max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[393px] max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[572px]">
              <Image
                src="/assets/ghana.png"
                alt="Ghana map"
                fill
                className="object-contain"
                priority={false}
              />
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col">
            <div className="flex flex-col gap-2 sm:gap-3">
              <h1 
                className="text-[20px] sm:text-[28px] md:text-[32px] lg:text-[36px] xl:text-[40px] font-normal leading-[1.2] text-[#ff5e00] uppercase break-words overflow-wrap-anywhere"
                style={{
                  textShadow: '2px 2px 0px #331300',
                  fontFamily: 'var(--font-unlimited-pie)'
                }}
              >
                Experience Ghana The sabary way!
              </h1>
              <p className="text-[#222] text-[12px] sm:text-[13px] md:text-[14px] font-bold leading-[20px] sm:leading-[22px] md:leading-[24px] break-words overflow-wrap-anywhere">
                We plan the trips, you make the memories. From waterfalls to street food, we take you beyond the brochures, showing you Ghana the way only locals can.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-[17px]">
              <button className="bg-[#ff5e00] text-white h-[40px] sm:h-[44px] px-[10px] py-[10px] rounded-lg font-bold text-[12px] sm:text-[14px] leading-[20px] sm:leading-[24px] hover:bg-[#e55500] transition-colors flex items-center justify-center whitespace-nowrap">
                Book now
              </button>
              <button className="bg-white text-[#ff5e00] h-[40px] sm:h-[44px] px-[10px] py-[10px] rounded-lg font-bold text-[12px] sm:text-[14px] leading-[20px] sm:leading-[24px] hover:bg-orange-50 transition-colors flex items-center justify-center whitespace-nowrap">
                Learn more
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-[#3D2817] relative overflow-hidden rounded-2xl min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[623px]">
          <div className="w-full h-full relative">
            <Image
              src="/assets/waterfall.png"
              alt="Ghana waterfall"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

