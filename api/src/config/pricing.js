/* ─────────────────────────────────────────────────
   PRICING — single source of truth (server-side)
   1 company  → ₹2000 / year
   2 or more  → ₹3000 / year
   Always compute on the server. Never trust a price
   that comes from the browser.
───────────────────────────────────────────────── */

export const PRICING = {
  SINGLE_COMPANY: 2000, // rupees
  MULTI_COMPANY: 3000,  // rupees
  CURRENCY: "INR",
};

/**
 * Returns the yearly price in RUPEES for a given number of companies.
 * @param {number} companyCount
 * @returns {number} amount in rupees
 */
export function getAdvisorAmount(companyCount) {
  const count = Number(companyCount) || 0;
  return count >= 2 ? PRICING.MULTI_COMPANY : PRICING.SINGLE_COMPANY;
}

/** Razorpay needs the amount in PAISE (integer). */
export function toPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}