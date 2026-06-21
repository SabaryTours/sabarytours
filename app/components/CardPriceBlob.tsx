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
    <div
      className={`rounded-2xl bg-[#ff5e00] px-3 py-2 text-white shadow-lg border border-white/20 font-sans ${className}`}
    >
      {parts.label ? (
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/90 leading-none mb-1">
          {parts.label}
        </p>
      ) : null}
      <p className="text-sm font-bold leading-tight">{parts.amount}</p>
    </div>
  );
}
