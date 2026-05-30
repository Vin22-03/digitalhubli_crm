import PublicLayout from "../components/PublicLayout";
import { BRAND } from "../config/branding";

function ContactUs() {
  return (
    <PublicLayout
      badge="Contact"
      title="Contact digitalhubli support."
      subtitle="For subscription, onboarding, billing, technical support or product demo requests, contact us through WhatsApp or phone."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-3xl">💬</p>
          <h2 className="mt-3 text-xl font-black text-slate-950">WhatsApp Support</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Best for quick questions, renewals and onboarding support.</p>
          <a href={`https://wa.me/91${BRAND.supportPhone}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white no-underline">Chat on WhatsApp</a>
        </div>
        <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-3xl">📞</p>
          <h2 className="mt-3 text-xl font-black text-slate-950">Phone</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Call for sales, demo, payment and account support.</p>
          <a href={`tel:+91${BRAND.supportPhone}`} className="mt-5 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white no-underline">+91 {BRAND.supportPhone}</a>
        </div>
        <div className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-3xl">📍</p>
          <h2 className="mt-3 text-xl font-black text-slate-950">Location</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">digitalhubli operates from Hubballi, Karnataka, India.</p>
          <p className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">Support hours: 10 AM – 7 PM IST</p>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Business communication note</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          For refunds, billing disputes, account activation or subscription issues, please include your registered mobile number, payment date, payment screenshot or Razorpay payment ID if available.
        </p>
      </div>
    </PublicLayout>
  );
}

export default ContactUs;
