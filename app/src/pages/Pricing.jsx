import { useNavigate } from "react-router-dom";
import PublicLayout from "../components/PublicLayout";
import { BRAND } from "../config/branding";

const features = [
  "Advisor CRM dashboard",
  "Lead and contact management",
  "WhatsApp-first template sharing",
  "Plan-wise templates and brochures",
  "Follow-up reminders and activity history",
  "Advisor subscription page",
  "Mobile-first responsive experience",
  "Priority WhatsApp support",
];

function Pricing() {
  const navigate = useNavigate();

  return (
    <PublicLayout
      badge="Simple yearly pricing"
      title="Smart CRM pricing for insurance advisors."
      subtitle="A clean yearly plan built to help advisors manage leads, share plan details faster, follow up on time, and grow their insurance business professionally."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[32px] border border-blue-100 bg-white p-6 shadow-[0_24px_70px_rgba(37,99,235,0.10)] sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                Advisor Plan
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                digitalhubli CRM Yearly
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Perfect for individual insurance advisors, LIC agents, health
                insurance advisors, and small advisor teams.
              </p>
            </div>

            <div className="rounded-3xl bg-blue-50 px-5 py-4 text-center">
              <p className="text-xs font-bold text-blue-700">Starting at</p>
              <p className="text-4xl font-black text-slate-950">₹2,000</p>
              <p className="text-xs font-semibold text-slate-500">
                per advisor / year
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                <span className="mt-0.5 text-emerald-600">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/signup")}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-3 text-sm font-black text-white shadow-[0_14px_32px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5"
            >
              Create Account →
            </button>

            <a
              href={`https://wa.me/91${BRAND.supportPhone}?text=Hi, I want pricing details for digitalhubli CRM`}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-blue-100 bg-white px-6 py-3 text-center text-sm font-black text-blue-700 transition hover:bg-blue-50"
            >
              Talk to Support
            </a>
          </div>
        </div>

        <aside className="rounded-[32px] border border-blue-100 bg-[linear-gradient(180deg,#eff6ff,#ffffff)] p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)] sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
            Why advisors choose us
          </p>

          <h3 className="mt-2 text-2xl font-black text-slate-950">
            Built to make daily insurance work faster.
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            Manage client details, generate ready-to-send WhatsApp messages,
            track follow-ups, and keep your insurance communication organized
            from one simple workspace.
          </p>

          <div className="mt-5 space-y-3">
            {[
              "No complex setup",
              "Works smoothly on mobile",
              "Useful for daily advisor workflow",
              "Designed for Indian insurance advisors",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  ✓
                </span>
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-950 px-5 py-4 text-white">
            <p className="text-sm font-black">Need help choosing?</p>
            <p className="mt-1 text-xs leading-5 text-slate-300">
              Message our team and we’ll guide you with the right setup for your
              insurance business.
            </p>
          </div>
        </aside>
      </div>
    </PublicLayout>
  );
}

export default Pricing;