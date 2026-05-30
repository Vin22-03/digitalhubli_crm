import { useEffect, useMemo, useState } from "react";
import AdvisorShell from "../components/AdvisorShell";
import API from "../api/axios";
import { BRAND } from "../config/branding";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStatusStyles(subscription) {
  if (!subscription) {
    return {
      label: "Loading",
      badge: "bg-slate-100 text-slate-600 border-slate-200",
      iconBg: "bg-slate-100 text-slate-600",
      ring: "ring-slate-100",
    };
  }

  if (subscription.isExpired || subscription.status === "EXPIRED") {
    return {
      label: "Expired",
      badge: "bg-red-50 text-red-700 border-red-200",
      iconBg: "bg-red-100 text-red-700",
      ring: "ring-red-100",
    };
  }

  if (subscription.status !== "ACTIVE") {
    return {
      label: subscription.status || "Inactive",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      iconBg: "bg-amber-100 text-amber-700",
      ring: "ring-amber-100",
    };
  }

  if (subscription.daysLeft !== null && subscription.daysLeft <= 30) {
    return {
      label: "Renew Soon",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      iconBg: "bg-amber-100 text-amber-700",
      ring: "ring-amber-100",
    };
  }

  return {
    label: "Active",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-700",
    ring: "ring-emerald-100",
  };
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-[22px] border border-blue-100 bg-white/82 p-4 shadow-[0_12px_30px_rgba(37,99,235,0.06)]">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-700">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      {hint ? <p className="mt-1 text-xs font-medium text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default function AdvisorSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    API.get("/subscriptions/my")
      .then((res) => setSubscription(res.data.subscription || null))
      .catch((err) => {
        setErrorMsg(err?.response?.data?.message || "Failed to load subscription details.");
        setSubscription(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const status = useMemo(() => getStatusStyles(subscription), [subscription]);

  const renewalMessage = encodeURIComponent(
    `Hi digitalhubli team, I want to renew my CRM subscription. My registered account is linked with this WhatsApp number.`
  );

  const supportPhone = BRAND.supportPhone || "9900244538";

  return (
    <AdvisorShell
      title="Subscription"
      subtitle="Manage your CRM access, renewal details, plan validity, and support from one place."
      activeTab="subscription"
    >
      {errorMsg && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="overflow-hidden rounded-[28px] border border-blue-100 bg-white/86 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
          <div className="bg-[linear-gradient(135deg,#1d4ed8,#0ea5e9)] px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-100">
                  Current Subscription
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  {loading ? "Loading plan..." : subscription?.planName || subscription?.plan || "digitalhubli CRM Plan"}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-50">
                  Your advisor workspace access is controlled from this subscription. Renew before expiry to avoid interruption.
                </p>
              </div>

              <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-black ${status.badge}`}>
                {status.label}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard
                label="Status"
                value={loading ? "—" : status.label}
                hint={subscription?.status ? `System: ${subscription.status}` : "CRM access state"}
              />
              <StatCard
                label="Days Left"
                value={loading ? "—" : subscription?.daysLeft ?? "—"}
                hint={subscription?.daysLeft !== null && subscription?.daysLeft < 0 ? "Expired already" : "Until expiry"}
              />
              <StatCard
                label="Expiry Date"
                value={loading ? "—" : formatDate(subscription?.expiryDate)}
                hint="Renew before this date"
              />
            </div>

            <div className="mt-5 rounded-[24px] border border-blue-100 bg-blue-50/55 p-4">
              <div className="flex gap-3">
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-black ring-8 ${status.iconBg} ${status.ring}`}>
                  ₹
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Renewal Amount</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">₹2,000 / year</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Online payment gateway can be connected later. For now, advisors can renew by contacting support directly.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={`https://wa.me/91${supportPhone}?text=${renewalMessage}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-[0_12px_24px_rgba(5,150,105,0.18)] transition hover:bg-emerald-700"
              >
                WhatsApp Renewal Support
              </a>
              <a
                href={`tel:${supportPhone}`}
                className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-black text-blue-700 shadow-sm transition hover:bg-blue-50"
              >
                Call Support: {supportPhone}
              </a>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-blue-100 bg-white/86 p-5 shadow-[0_18px_45px_rgba(37,99,235,0.08)] sm:p-7">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">Account Access</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">What happens after expiry?</h2>

          <div className="mt-5 space-y-3">
            {[
              ["CRM access may be restricted", "Dashboard, leads, contacts, and templates may become unavailable until renewal."],
              ["Data remains protected", "Your workspace data should remain safe and can be accessed again after renewal."],
              ["Renewal support is manual now", "Use WhatsApp or call support. Razorpay/payment gateway can be added later."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-[20px] border border-blue-100 bg-blue-50/45 p-4">
                <p className="text-sm font-black text-slate-900">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[22px] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <p className="font-black">Renewal Tip</p>
            <p className="mt-1">
              Renew at least 3–5 days before expiry to avoid client follow-up interruption.
            </p>
          </div>
        </section>
      </div>
    </AdvisorShell>
  );
}
