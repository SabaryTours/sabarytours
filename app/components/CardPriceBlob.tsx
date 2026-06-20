type CardPriceBlobProps = {
  price: string;
  className?: string;
};

function priceDisplay(price: string): { label: string | null; amount: string } | null {
  const amount = price.trim();
  if (!amount) return null;
  if (/starts?\s+from/i.test(amount)) {
    return { label: null, amount };
  }
  return { label: "Starts from", amount };
}

export default function CardPriceBlob({ price, className = "" }: CardPriceBlobProps) {
  const parts = priceDisplay(price);
  if (!parts) return null;

  return (
    <div className={`inline-flex pointer-events-none ${className}`}>
      <div className="relative px-4 py-2.5">
        <div
          aria-hidden
          className="absolute inset-0 bg-[#ff5e00] shadow-lg"
          style={{
            borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%",
            transform: "rotate(-6deg) scale(1.1)",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-1 -right-0.5 h-3.5 w-4 bg-[#ff5e00]"
          style={{
            borderRadius: "70% 30% 50% 50% / 60% 40% 60% 40%",
            transform: "rotate(14deg)",
          }}
        />
        <div className="relative z-10 text-center text-white font-sans whitespace-nowrap">
          {parts.label ? (
            <p className="text-[9px] font-bold uppercase tracking-wide text-white/95 leading-none mb-0.5">
              {parts.label}
            </p>
          ) : null}
          <p className="text-xs font-bold leading-tight">{parts.amount}</p>
        </div>
      </div>
    </div>
  );
}
