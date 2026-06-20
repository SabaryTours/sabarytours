const items = [
  "⭐ 5-Star Rated by Travelers",
  "🌍 Trusted by Guests from 20+ Countries",
  "🔒 Secure Online & Offline Payments",
  "🏆 Creating Memorable Ghana Experiences Since 2018",
];

export default function HomeTrustStrip() {
  return (
    <section className="w-full px-4 sm:px-6 md:px-12 py-4">
      <div className="container mx-auto">
        <div className="rounded-2xl border border-orange-100 bg-white shadow-sm px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {items.map((item) => (
              <div
                key={item}
                className="rounded-xl bg-orange-50/70 px-4 py-3 text-center text-sm font-bold text-[#222] font-sans"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
