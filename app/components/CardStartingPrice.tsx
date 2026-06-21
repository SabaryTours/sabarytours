type CardStartingPriceProps = {
  amount: number;
  currency?: string;
  className?: string;
};

export default function CardStartingPrice({
  amount,
  currency = "GHS",
  className = "",
}: CardStartingPriceProps) {
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return (
    <p className={`text-white text-xs font-sans text-center drop-shadow-md ${className}`}>
      Starts from{" "}
      <span className="font-bold">
        {currency} {amount.toLocaleString()}
      </span>
    </p>
  );
}
