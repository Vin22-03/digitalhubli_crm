import API from "../api/axios";

/* Loads the Razorpay checkout script once. */
export function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Starts the full pay → verify → activate flow.
 *
 * @param {Object}  opts
 * @param {number} [opts.userId]   advisorId — pass for new-signup activation
 *                                 (omit for logged-in renewals; the token is used)
 * @param {Function} opts.onSuccess  called after server confirms activation
 * @param {Function} [opts.onError]  called with an error message
 */
export async function startSubscriptionPayment({ userId, onSuccess, onError }) {
  try {
    const ok = await loadRazorpay();
    if (!ok) throw new Error("Could not load payment gateway. Check your connection.");

    // 1) Ask the server to create an order (server computes the amount)
    const { data } = await API.post("/payments/create-order", userId ? { userId } : {});

    // 2) Open Razorpay checkout
    const rzp = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,        // paise
      currency: data.currency,
      order_id: data.orderId,
      name: "digitalhubli",
      description: "CRM Yearly Subscription",
      prefill: data.prefill,
      theme: { color: "#2563eb" },
      handler: async (resp) => {
        try {
          // 3) Verify on the server, which also activates the account
          await API.post("/payments/verify", {
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
            ...(userId ? { userId } : {}),
          });
          onSuccess?.();
        } catch (e) {
          onError?.(e?.response?.data?.message || "Payment verification failed.");
        }
      },
      modal: {
        ondismiss: () => onError?.("Payment cancelled."),
      },
    });

    rzp.open();
  } catch (e) {
    onError?.(e?.response?.data?.message || e.message || "Something went wrong.");
  }
}