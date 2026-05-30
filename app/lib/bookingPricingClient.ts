/** Match server-side rounding in app/lib/serverBookingPricing.ts */
export function roundBookingCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computeClientPaymentAmount(
  totalPrice: number,
  paymentOption: "full" | "deposit" | "cash",
  depositPercentage = 30,
): number {
  if (paymentOption === "cash") return 0;
  if (paymentOption === "deposit") {
    return roundBookingCurrency((totalPrice * depositPercentage) / 100);
  }
  return totalPrice;
}
