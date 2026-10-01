/** "Rs 650", "Rs 1,250.50". Whole amounts drop the decimals. */
export function formatPrice({ amount, currency }: { amount: number; currency: string }) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
