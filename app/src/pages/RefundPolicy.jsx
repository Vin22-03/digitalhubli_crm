import PublicLayout from "../components/PublicLayout";
import { BRAND } from "../config/branding";

function RefundPolicy() {
  return (
    <PublicLayout badge="Payments" title="Refund Policy" subtitle="A clear refund policy helps advisors understand when refunds are possible and supports payment gateway compliance.">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">General policy</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">digitalhubli is a SaaS subscription product. Once an account is activated and the user gets access to the CRM workspace, subscription fees are generally non-refundable.</p>
        </div>
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Refunds may be considered for</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-emerald-950/80">
            <li>Duplicate payment for the same subscription period.</li>
            <li>Payment deducted but account not activated due to a verified technical issue.</li>
            <li>Wrong amount charged due to a billing error.</li>
            <li>Any case approved by digitalhubli after review.</li>
          </ul>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Refund request process</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Users must contact support within 7 days of payment with registered mobile number, payment date, amount, screenshot and payment/order ID if available. Approved refunds may take 5–10 working days depending on bank/payment gateway timelines.</p>
          <a href={`https://wa.me/91${BRAND.supportPhone}?text=Hi, I need help with refund for digitalhubli CRM`} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white no-underline">Request support</a>
        </div>
      </div>
    </PublicLayout>
  );
}

export default RefundPolicy;
