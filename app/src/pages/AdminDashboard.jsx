import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminShell from "../components/AdminShell";
import API from "../api/axios";
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiDollarSign,
  FiArrowRight,
  FiKey,
  FiBriefcase,
} from "react-icons/fi";

function formatDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function daysLeft(expiryDate) {
  if (!expiryDate) return null;
  return Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [rows, setRows] = useState([]);
  const [pendingPwd, setPendingPwd] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const [subsRes, pwdRes] = await Promise.all([
          API.get("/subscriptions"),
          API.get("/admin/password-requests").catch(() => ({ data: { requests: [] } })),
        ]);
        setRows(subsRes.data.subscriptions || []);
        const reqs = pwdRes.data.requests || pwdRes.data.passwordRequests || [];
        setPendingPwd(Array.isArray(reqs) ? reqs.filter((r) => r.status === "PENDING").length : 0);
      } catch (e) {
        setErrorMsg(e?.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // business metrics from subscription data
  const metrics = useMemo(() => {
    let active = 0, pending = 0, expired = 0, revenue = 0;
    rows.forEach((r) => {
      const s = r.subscription;
      if (!s || s.status === "PENDING") pending += 1;
      else if (s.status === "ACTIVE") {
        const d = daysLeft(s.expiryDate);
        if (d !== null && d < 0) expired += 1;
        else { active += 1; revenue += Number(s.amountPaid || 0); }
      } else if (s.status === "EXPIRED") expired += 1;
    });
    return { total: rows.length, active, pending, expired, revenue };
  }, [rows]);

  // expiring soon (next 30 days)
  const expiringSoon = useMemo(() => {
    return rows
      .filter((r) => {
        const s = r.subscription;
        if (!s || s.status !== "ACTIVE") return false;
        const d = daysLeft(s.expiryDate);
        return d !== null && d >= 0 && d <= 30;
      })
      .sort((a, b) => daysLeft(a.subscription.expiryDate) - daysLeft(b.subscription.expiryDate));
  }, [rows]);

  // recent signups
  const recentSignups = useMemo(() => {
    return [...rows]
      .sort((a, b) => new Date(b.advisor.signupDate) - new Date(a.advisor.signupDate))
      .slice(0, 5);
  }, [rows]);

  const cards = [
    { label: "Total Advisors",  value: metrics.total,   icon: FiUsers,       cls: "bg-blue-50 border-blue-200 text-blue-700" },
    { label: "Active",          value: metrics.active,  icon: FiCheckCircle, cls: "bg-emerald-50 border-emerald-200 text-emerald-700" },
    { label: "Pending Payment", value: metrics.pending, icon: FiClock,       cls: "bg-amber-50 border-amber-200 text-amber-700" },
    { label: "Expired",         value: metrics.expired, icon: FiAlertTriangle, cls: "bg-red-50 border-red-200 text-red-700" },
  ];

  return (
    <AdminShell
      title="Dashboard"
      subtitle="Your business at a glance — advisors, subscriptions, and revenue."
      activeTab="dashboard"
    >
      {errorMsg && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>
      )}

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`rounded-[22px] border ${c.cls} px-4 py-4`}>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black">{loading ? "—" : c.value}</span>
                <Icon size={20} className="opacity-60" />
              </div>
              <div className="mt-1 text-xs font-semibold opacity-80">{c.label}</div>
            </div>
          );
        })}
      </div>

      {/* Revenue + quick links */}
      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-[22px] border border-green-200 bg-green-50 px-5 py-5 lg:col-span-1">
          <div className="flex items-center gap-2">
            <FiDollarSign className="text-green-700" size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide text-green-700">Revenue (active subs)</span>
          </div>
          <div className="mt-2 text-3xl font-black text-green-800">
            {loading ? "—" : `₹${metrics.revenue.toLocaleString("en-IN")}`}
          </div>
          <p className="mt-1 text-xs text-green-600">From {metrics.active} active subscriptions</p>
        </div>

        <button onClick={() => navigate("/admin/subscriptions")}
          className="flex items-center justify-between rounded-[22px] border border-blue-100 bg-white/75 px-5 py-5 text-left transition hover:bg-blue-50/50">
          <div>
            <p className="text-sm font-bold text-slate-900">Manage Subscriptions</p>
            <p className="mt-1 text-xs text-slate-500">Activate, extend, change pricing</p>
          </div>
          <FiArrowRight className="text-blue-600" />
        </button>

        <button onClick={() => navigate("/admin/companies")}
          className="flex items-center justify-between rounded-[22px] border border-blue-100 bg-white/75 px-5 py-5 text-left transition hover:bg-blue-50/50">
          <div>
            <p className="text-sm font-bold text-slate-900">Companies & Plans</p>
            <p className="mt-1 text-xs text-slate-500">Add insurance companies and plans</p>
          </div>
          <FiBriefcase className="text-blue-600" />
        </button>
      </div>

      {/* Password requests alert */}
      {pendingPwd > 0 && (
        <button onClick={() => navigate("/admin/password-requests")}
          className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left transition hover:bg-amber-100">
          <FiKey className="text-amber-600" />
          <span className="text-sm font-semibold text-amber-800">
            {pendingPwd} pending password reset {pendingPwd === 1 ? "request" : "requests"} — click to review
          </span>
          <FiArrowRight className="ml-auto text-amber-600" />
        </button>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Expiring soon */}
        <div className="rounded-[24px] border border-blue-100 bg-white/75 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FiClock className="text-amber-600" size={16} />
            <h3 className="text-sm font-bold text-slate-900">Expiring Soon (next 30 days)</h3>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : expiringSoon.length === 0 ? (
            <p className="text-sm text-slate-400">No subscriptions expiring soon.</p>
          ) : (
            <div className="space-y-2">
              {expiringSoon.slice(0, 6).map((r) => {
                const d = daysLeft(r.subscription.expiryDate);
                return (
                  <div key={r.advisor.id} className="flex items-center justify-between rounded-xl border border-blue-50 bg-[#f8fbff] px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{r.advisor.name}</p>
                      <p className="text-[11px] text-slate-500">{r.advisor.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${d <= 7 ? "text-red-600" : "text-amber-600"}`}>{d}d left</p>
                      <p className="text-[11px] text-slate-400">{formatDate(r.subscription.expiryDate)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent signups */}
        <div className="rounded-[24px] border border-blue-100 bg-white/75 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FiUsers className="text-blue-600" size={16} />
            <h3 className="text-sm font-bold text-slate-900">Recent Signups</h3>
          </div>
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : recentSignups.length === 0 ? (
            <p className="text-sm text-slate-400">No advisors yet.</p>
          ) : (
            <div className="space-y-2">
              {recentSignups.map((r) => {
                const status = r.subscription?.status || "PENDING";
                const statusCls = status === "ACTIVE" ? "bg-emerald-50 text-emerald-700"
                  : status === "PENDING" ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-700";
                return (
                  <div key={r.advisor.id} className="flex items-center justify-between rounded-xl border border-blue-50 bg-[#f8fbff] px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{r.advisor.name}</p>
                      <p className="text-[11px] text-slate-500">Joined {formatDate(r.advisor.signupDate)}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusCls}`}>{status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}