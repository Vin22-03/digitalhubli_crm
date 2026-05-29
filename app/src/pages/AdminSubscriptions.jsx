import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/AdminShell";
import API from "../api/axios";
import { FiCreditCard, FiCheck, FiX, FiEdit2, FiSearch, FiCalendar, FiDollarSign, FiRefreshCw } from "react-icons/fi";

const ITEMS_PER_PAGE = 10;

function formatDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function daysLeft(expiryDate) {
  if (!expiryDate) return null;
  const diff = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING:   "bg-amber-50 text-amber-700 border-amber-200",
    EXPIRED:   "bg-red-50 text-red-700 border-red-200",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${map[status] || map.CANCELLED}`}>
      {status}
    </span>
  );
}

export default function AdminSubscriptions() {
  const [rows, setRows]           = useState([]);
  const [plan, setPlan]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("ALL");
  const [page, setPage]           = useState(1);
  const [toast, setToast]         = useState(null); // { type: "success"|"error", msg }

  // drawer state
  const [drawer, setDrawer]       = useState(null); // { mode: "activate"|"extend"|"plan", row }
  const [saving, setSaving]       = useState(false);
  const [drawerErr, setDrawerErr] = useState("");

  // activate form
  const [actForm, setActForm] = useState({ amountPaid: "", discountNote: "", paymentRef: "", activationNote: "", customDays: "" });

  // extend form
  const [extForm, setExtForm] = useState({ extendDays: "", newExpiryDate: "", activationNote: "" });

  // plan edit form
  const [planForm, setPlanForm] = useState({ name: "", basePrice: "", durationDays: "", description: "" });

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [subRes, planRes] = await Promise.all([
        API.get("/subscriptions"),
        API.get("/subscriptions/plans"),
      ]);
      setRows(subRes.data.subscriptions || []);
      const p = planRes.data.plans?.[0];
      if (p) { setPlan(p); setPlanForm({ name: p.name, basePrice: p.basePrice, durationDays: p.durationDays, description: p.description || "" }); }
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Failed to load data.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { setPage(1); }, [search, filter]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const s = search.toLowerCase();
      const matchSearch = r.advisor.name.toLowerCase().includes(s) ||
        r.advisor.phone.includes(s) ||
        (r.advisor.email || "").toLowerCase().includes(s);
      const subStatus = r.subscription?.status || "PENDING";
      const matchFilter = filter === "ALL" || subStatus === filter;
      return matchSearch && matchFilter;
    });
  }, [rows, search, filter]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated   = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // counts for summary cards
  const counts = useMemo(() => ({
    total:    rows.length,
    active:   rows.filter(r => r.subscription?.status === "ACTIVE").length,
    pending:  rows.filter(r => !r.subscription || r.subscription.status === "PENDING").length,
    expired:  rows.filter(r => r.subscription?.status === "EXPIRED").length,
  }), [rows]);

  /* ── Activate ── */
  const openActivate = (row) => {
    setActForm({ amountPaid: plan?.basePrice || "2000", discountNote: "", paymentRef: "", activationNote: "", customDays: "" });
    setDrawerErr("");
    setDrawer({ mode: "activate", row });
  };

  const handleActivate = async () => {
    try {
      setSaving(true); setDrawerErr("");
      await API.post(`/subscriptions/advisors/${drawer.row.advisor.id}/activate`, {
        amountPaid:     actForm.amountPaid     || undefined,
        discountNote:   actForm.discountNote   || undefined,
        paymentRef:     actForm.paymentRef     || undefined,
        activationNote: actForm.activationNote || undefined,
        customDurationDays: actForm.customDays || undefined,
      });
      showToast("success", `${drawer.row.advisor.name} activated! Activation email sent.`);
      setDrawer(null);
      fetchAll();
    } catch (e) {
      setDrawerErr(e?.response?.data?.message || "Activation failed.");
    } finally { setSaving(false); }
  };

  /* ── Extend / Update ── */
  const openExtend = (row) => {
    setExtForm({ extendDays: "365", newExpiryDate: "", activationNote: "" });
    setDrawerErr("");
    setDrawer({ mode: "extend", row });
  };

  const handleExtend = async () => {
    try {
      setSaving(true); setDrawerErr("");
      await API.patch(`/subscriptions/advisors/${drawer.row.advisor.id}/update`, {
        extendDays:     extForm.extendDays     || undefined,
        newExpiryDate:  extForm.newExpiryDate  || undefined,
        activationNote: extForm.activationNote || undefined,
      });
      showToast("success", `Subscription updated. Email sent to ${drawer.row.advisor.name}.`);
      setDrawer(null);
      fetchAll();
    } catch (e) {
      setDrawerErr(e?.response?.data?.message || "Update failed.");
    } finally { setSaving(false); }
  };

  /* ── Deactivate ── */
  const handleDeactivate = async (row) => {
    if (!window.confirm(`Deactivate ${row.advisor.name}? They will lose access immediately.`)) return;
    try {
      await API.patch(`/subscriptions/advisors/${row.advisor.id}/deactivate`, { reason: "Deactivated by admin" });
      showToast("success", `${row.advisor.name} deactivated.`);
      fetchAll();
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Deactivation failed.");
    }
  };

  /* ── Update Plan Price ── */
  const openPlanEdit = () => { setDrawerErr(""); setDrawer({ mode: "plan" }); };

  const handlePlanSave = async () => {
    try {
      setSaving(true); setDrawerErr("");
      await API.put(`/subscriptions/plans/${plan.id}`, {
        name:         planForm.name,
        basePrice:    Number(planForm.basePrice),
        durationDays: Number(planForm.durationDays),
        description:  planForm.description,
      });
      showToast("success", "Plan updated successfully.");
      setDrawer(null);
      fetchAll();
    } catch (e) {
      setDrawerErr(e?.response?.data?.message || "Plan update failed.");
    } finally { setSaving(false); }
  };

  const closeDrawer = () => { setDrawer(null); setDrawerErr(""); };

  /* ── Input helpers ── */
  const inp = "w-full rounded-2xl border border-blue-100 bg-[#f8fbff] px-4 py-3 text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 text-sm";
  const lbl = "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <AdminShell
      title="Subscriptions"
      subtitle="Manage advisor subscriptions, activate accounts, extend plans, and control pricing."
      activeTab="subscriptions"
    >
      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-xl text-sm font-semibold transition-all ${
          toast.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-800"
        }`}>
          {toast.type === "success" ? <FiCheck size={16}/> : <FiX size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total Advisors", value: counts.total,   color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
          { label: "Active",         value: counts.active,  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Pending Payment",value: counts.pending, color: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
          { label: "Expired",        value: counts.expired, color: "text-red-700",     bg: "bg-red-50 border-red-200" },
        ].map((c) => (
          <div key={c.label} className={`rounded-[22px] border ${c.bg} px-4 py-4`}>
            <div className={`text-2xl font-black ${c.color}`}>{c.value}</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Plan info bar ── */}
      {plan && (
        <div className="mb-5 flex flex-col gap-3 rounded-[22px] border border-blue-100 bg-white/70 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
              <FiCreditCard size={16} className="text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{plan.name}</p>
              <p className="text-xs text-slate-500">₹{Number(plan.basePrice).toLocaleString("en-IN")} · {plan.durationDays} days validity</p>
            </div>
          </div>
          <button onClick={openPlanEdit}
            className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 transition">
            <FiEdit2 size={13}/> Edit Plan Price
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="mb-5 flex flex-col gap-3 rounded-[22px] border border-blue-100 bg-white/70 p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name, mobile or email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-blue-100 bg-[#f8fbff] py-3 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="rounded-2xl border border-blue-100 bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending Payment</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button onClick={fetchAll} className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-blue-50 transition">
          <FiRefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden overflow-hidden rounded-[28px] border border-blue-100 bg-white/75 shadow-[0_12px_30px_rgba(37,99,235,0.05)] lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-blue-50/70">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">Advisor</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Sub Status</th>
                <th className="px-5 py-4">Amount Paid</th>
                <th className="px-5 py-4">Valid Until</th>
                <th className="px-5 py-4">Days Left</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="px-5 py-8 text-sm text-slate-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="px-5 py-8 text-sm text-slate-500">No advisors found.</td></tr>
              ) : paginated.map((r) => {
                const sub    = r.subscription;
                const status = sub?.status || "PENDING";
                const days   = sub?.expiryDate ? daysLeft(sub.expiryDate) : null;
                const isActive = r.advisor.isActive;
                return (
                  <tr key={r.advisor.id} className="border-t border-blue-50 hover:bg-blue-50/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{r.advisor.name}</div>
                      {r.advisor.brandName && <div className="text-xs text-slate-400">{r.advisor.brandName}</div>}
                      <div className="mt-1 text-[11px] text-slate-400">Joined {formatDate(r.advisor.signupDate)}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <div>{r.advisor.phone}</div>
                      <div className="text-xs text-slate-400">{r.advisor.email || "—"}</div>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={status} /></td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {sub?.amountPaid ? `₹${Number(sub.amountPaid).toLocaleString("en-IN")}` : "—"}
                      {sub?.discountNote && <div className="text-[11px] font-normal text-amber-600">{sub.discountNote}</div>}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(sub?.expiryDate)}</td>
                    <td className="px-5 py-4">
                      {days === null ? <span className="text-slate-400 text-sm">—</span>
                        : days < 0 ? <span className="text-xs font-semibold text-red-600">Expired</span>
                        : days <= 30 ? <span className="text-xs font-semibold text-amber-600">{days}d left</span>
                        : <span className="text-xs font-semibold text-emerald-600">{days}d left</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(!isActive || status === "PENDING" || status === "EXPIRED") && (
                          <button onClick={() => openActivate(r)}
                            className="rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition">
                            ✓ Activate
                          </button>
                        )}
                        {status === "ACTIVE" && (
                          <button onClick={() => openExtend(r)}
                            className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition">
                            Extend
                          </button>
                        )}
                        {isActive && (
                          <button onClick={() => handleDeactivate(r)}
                            className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition">
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="space-y-4 lg:hidden">
        {loading ? (
          <div className="rounded-2xl border border-blue-100 bg-white/75 px-4 py-4 text-sm text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-blue-100 bg-white/75 px-4 py-4 text-sm text-slate-500">No advisors found.</div>
        ) : paginated.map((r) => {
          const sub    = r.subscription;
          const status = sub?.status || "PENDING";
          const days   = sub?.expiryDate ? daysLeft(sub.expiryDate) : null;
          const isActive = r.advisor.isActive;
          return (
            <div key={r.advisor.id} className="rounded-[24px] border border-blue-100 bg-white/80 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{r.advisor.name}</p>
                  <p className="text-sm text-slate-500">{r.advisor.phone}</p>
                  <p className="text-xs text-slate-400">{r.advisor.email || ""}</p>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div><span className="font-semibold text-slate-700">Paid: </span>{sub?.amountPaid ? `₹${Number(sub.amountPaid).toLocaleString("en-IN")}` : "—"}</div>
                <div><span className="font-semibold text-slate-700">Expiry: </span>{formatDate(sub?.expiryDate)}</div>
                <div><span className="font-semibold text-slate-700">Days left: </span>{days === null ? "—" : days < 0 ? "Expired" : `${days}d`}</div>
                <div><span className="font-semibold text-slate-700">Joined: </span>{formatDate(r.advisor.signupDate)}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(!isActive || status === "PENDING" || status === "EXPIRED") && (
                  <button onClick={() => openActivate(r)} className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700">✓ Activate</button>
                )}
                {status === "ACTIVE" && (
                  <button onClick={() => openExtend(r)} className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700">Extend</button>
                )}
                {isActive && (
                  <button onClick={() => handleDeactivate(r)} className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600">Deactivate</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Pagination ── */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="mt-5 flex flex-col gap-3 rounded-[24px] border border-blue-100 bg-white/75 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{(page-1)*ITEMS_PER_PAGE+1}</span>–<span className="font-semibold">{Math.min(page*ITEMS_PER_PAGE, filtered.length)}</span> of <span className="font-semibold">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button disabled={page===1} onClick={() => setPage(p=>p-1)} className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40 hover:bg-blue-50">Prev</button>
            <span className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">{page}/{totalPages}</span>
            <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40 hover:bg-blue-50">Next</button>
          </div>
        </div>
      )}

      {/* ── DRAWER ── */}
      {drawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px]" onClick={closeDrawer} />
          <div className="absolute inset-y-0 right-0 flex w-full justify-end overflow-hidden">
            <div className="h-full w-full max-w-[520px] border-l border-blue-100 bg-[linear-gradient(180deg,#ffffff,#f7fbff)] shadow-[-20px_0_60px_rgba(15,23,42,0.16)]">
              <div className="flex h-full flex-col">

                {/* Drawer header */}
                <div className="sticky top-0 z-10 border-b border-blue-100 bg-white px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                        {drawer.mode === "activate" ? "Activate Account" : drawer.mode === "extend" ? "Extend / Update Plan" : "Edit Plan Pricing"}
                      </p>
                      <h2 className="mt-1.5 text-xl font-bold text-slate-900">
                        {drawer.mode === "activate" ? `Activate — ${drawer.row?.advisor.name}` :
                         drawer.mode === "extend"   ? `Update — ${drawer.row?.advisor.name}` :
                         "Plan Settings"}
                      </h2>
                      {drawer.mode !== "plan" && (
                        <p className="mt-1 text-sm text-slate-500">{drawer.row?.advisor.email || drawer.row?.advisor.phone}</p>
                      )}
                    </div>
                    <button onClick={closeDrawer} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Close</button>
                  </div>
                </div>

                {/* Drawer body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {drawerErr && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{drawerErr}</div>
                  )}

                  {/* ACTIVATE FORM */}
                  {drawer.mode === "activate" && (
                    <>
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-800">
                        <strong>Default plan:</strong> {plan?.name} · ₹{Number(plan?.basePrice).toLocaleString("en-IN")} · {plan?.durationDays} days
                      </div>
                      <div>
                        <label className={lbl}>Amount Paid (₹) <span className="font-normal text-slate-400">— change for discounts</span></label>
                        <input className={inp} type="number" placeholder={`Default: ₹${plan?.basePrice}`} value={actForm.amountPaid}
                          onChange={e => setActForm(f => ({ ...f, amountPaid: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Custom Duration (days) <span className="font-normal text-slate-400">— leave blank for default ({plan?.durationDays}d)</span></label>
                        <input className={inp} type="number" placeholder={`Default: ${plan?.durationDays} days`} value={actForm.customDays}
                          onChange={e => setActForm(f => ({ ...f, customDays: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Payment Reference <span className="font-normal text-slate-400">— UPI txn ID, cheque no. etc.</span></label>
                        <input className={inp} type="text" placeholder="e.g. UPI ref 123456789" value={actForm.paymentRef}
                          onChange={e => setActForm(f => ({ ...f, paymentRef: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Discount Note <span className="font-normal text-slate-400">— optional</span></label>
                        <input className={inp} type="text" placeholder="e.g. First-year discount" value={actForm.discountNote}
                          onChange={e => setActForm(f => ({ ...f, discountNote: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Internal Note <span className="font-normal text-slate-400">— optional</span></label>
                        <input className={inp} type="text" placeholder="e.g. Referred by XYZ" value={actForm.activationNote}
                          onChange={e => setActForm(f => ({ ...f, activationNote: e.target.value }))} />
                      </div>
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        ✅ On activation — account is set <strong>Active</strong> and an email is sent to <strong>{drawer.row?.advisor.email || "advisor"}</strong> automatically.
                      </div>
                    </>
                  )}

                  {/* EXTEND FORM */}
                  {drawer.mode === "extend" && (
                    <>
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-800">
                        <strong>Current expiry:</strong> {formatDate(drawer.row?.subscription?.expiryDate)}
                        {drawer.row?.subscription?.expiryDate && daysLeft(drawer.row.subscription.expiryDate) > 0
                          ? ` · ${daysLeft(drawer.row.subscription.expiryDate)} days remaining`
                          : " · Expired"}
                      </div>
                      <div>
                        <label className={lbl}>Extend by days <span className="font-normal text-slate-400">— adds on top of current expiry</span></label>
                        <input className={inp} type="number" placeholder="e.g. 365" value={extForm.extendDays}
                          onChange={e => setExtForm(f => ({ ...f, extendDays: e.target.value, newExpiryDate: "" }))} />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-blue-100" />
                        <span className="text-xs font-semibold text-slate-400">OR set exact date</span>
                        <div className="h-px flex-1 bg-blue-100" />
                      </div>
                      <div>
                        <label className={lbl}>Set exact expiry date</label>
                        <input className={inp} type="date" value={extForm.newExpiryDate}
                          onChange={e => setExtForm(f => ({ ...f, newExpiryDate: e.target.value, extendDays: "" }))} />
                      </div>
                      <div>
                        <label className={lbl}>Note to advisor <span className="font-normal text-slate-400">— shown in update email</span></label>
                        <input className={inp} type="text" placeholder="e.g. Renewal confirmed" value={extForm.activationNote}
                          onChange={e => setExtForm(f => ({ ...f, activationNote: e.target.value }))} />
                      </div>
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        📧 An update email will be sent to <strong>{drawer.row?.advisor.email || "advisor"}</strong> with the new expiry date.
                      </div>
                    </>
                  )}

                  {/* PLAN EDIT FORM */}
                  {drawer.mode === "plan" && (
                    <>
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        ⚠ Changing the price here updates the <strong>default price shown on signup</strong>. Existing active subscriptions are not affected.
                      </div>
                      <div>
                        <label className={lbl}>Plan Name</label>
                        <input className={inp} type="text" value={planForm.name}
                          onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Price (₹)</label>
                        <input className={inp} type="number" value={planForm.basePrice}
                          onChange={e => setPlanForm(f => ({ ...f, basePrice: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Duration (days)</label>
                        <input className={inp} type="number" value={planForm.durationDays}
                          onChange={e => setPlanForm(f => ({ ...f, durationDays: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Description <span className="font-normal text-slate-400">— optional</span></label>
                        <input className={inp} type="text" value={planForm.description}
                          onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))} />
                      </div>
                    </>
                  )}
                </div>

                {/* Drawer footer */}
                <div className="border-t border-blue-100 bg-white px-6 py-4">
                  <div className="flex gap-3">
                    <button onClick={drawer.mode === "activate" ? handleActivate : drawer.mode === "extend" ? handleExtend : handlePlanSave}
                      disabled={saving}
                      className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-md transition disabled:opacity-70 ${
                        drawer.mode === "activate" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                        : drawer.mode === "plan"   ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                      }`}>
                      {saving ? "Saving..." :
                        drawer.mode === "activate" ? "✓ Activate & Send Email" :
                        drawer.mode === "extend"   ? "Update Subscription" :
                        "Save Plan"}
                    </button>
                    <button onClick={closeDrawer} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                      Cancel
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
