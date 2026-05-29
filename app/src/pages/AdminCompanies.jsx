import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/AdminShell";
import API from "../api/axios";
import { FiPlus, FiEdit2, FiX, FiCheck, FiBriefcase, FiLayers } from "react-icons/fi";

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);
  const [saving, setSaving]       = useState(false);

  // drawer: { mode: "company"|"plan", edit?: row }
  const [drawer, setDrawer] = useState(null);
  const [companyForm, setCompanyForm] = useState({ name: "", code: "" });
  const [planForm, setPlanForm]       = useState({ companyId: "", name: "", code: "", minAge: "", maxAge: "", brochureUrl: "", description: "" });

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [cRes, pRes] = await Promise.all([
        API.get("/admin/companies"),
        API.get("/admin/plans"),
      ]);
      setCompanies(cRes.data.companies || []);
      setPlans(pRes.data.plans || []);
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Failed to load data.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // group plans by company
  const plansByCompany = useMemo(() => {
    const map = {};
    plans.forEach((p) => {
      if (!map[p.companyId]) map[p.companyId] = [];
      map[p.companyId].push(p);
    });
    return map;
  }, [plans]);

  /* ── Company drawer ── */
  const openNewCompany = () => { setCompanyForm({ name: "", code: "" }); setDrawer({ mode: "company" }); };
  const openEditCompany = (c) => { setCompanyForm({ name: c.name, code: c.code }); setDrawer({ mode: "company", edit: c }); };

  const saveCompany = async () => {
    if (!companyForm.name.trim() || !companyForm.code.trim()) { showToast("error", "Name and code required."); return; }
    try {
      setSaving(true);
      if (drawer.edit) {
        await API.put(`/admin/companies/${drawer.edit.id}`, companyForm);
        showToast("success", "Company updated.");
      } else {
        await API.post("/admin/companies", companyForm);
        showToast("success", "Company added.");
      }
      setDrawer(null);
      fetchAll();
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Failed to save company.");
    } finally { setSaving(false); }
  };

  const toggleCompany = async (c) => {
    try {
      await API.patch(`/admin/companies/${c.id}/toggle`);
      fetchAll();
    } catch (e) { showToast("error", "Failed to toggle company."); }
  };

  /* ── Plan drawer ── */
  const openNewPlan = (companyId = "") => {
    setPlanForm({ companyId: companyId || "", name: "", code: "", minAge: "", maxAge: "", brochureUrl: "", description: "" });
    setDrawer({ mode: "plan" });
  };
  const openEditPlan = (p) => {
    setPlanForm({
      companyId: p.companyId, name: p.name, code: p.code || "",
      minAge: p.minAge ?? "", maxAge: p.maxAge ?? "",
      brochureUrl: p.brochureUrl || "", description: p.description || "",
    });
    setDrawer({ mode: "plan", edit: p });
  };

  const savePlan = async () => {
    if (!planForm.companyId || !planForm.name.trim()) { showToast("error", "Company and plan name required."); return; }
    try {
      setSaving(true);
      if (drawer.edit) {
        await API.put(`/admin/plans/${drawer.edit.id}`, planForm);
        showToast("success", "Plan updated.");
      } else {
        await API.post("/admin/plans", planForm);
        showToast("success", "Plan added.");
      }
      setDrawer(null);
      fetchAll();
    } catch (e) {
      showToast("error", e?.response?.data?.message || "Failed to save plan.");
    } finally { setSaving(false); }
  };

  const togglePlan = async (p) => {
    try {
      await API.patch(`/admin/plans/${p.id}/toggle`);
      fetchAll();
    } catch (e) { showToast("error", "Failed to toggle plan."); }
  };

  const inp = "w-full rounded-2xl border border-blue-100 bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
  const lbl = "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <AdminShell
      title="Companies & Plans"
      subtitle="Add insurance companies and the plans advisors can pick from."
      activeTab="companies"
    >
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-xl text-sm font-semibold ${
          toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
        }`}>
          {toast.type === "success" ? <FiCheck size={16}/> : <FiX size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* Top actions */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          {companies.length} companies · {plans.length} plans
        </p>
        <div className="flex gap-2">
          <button onClick={openNewCompany}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition">
            <FiPlus size={15}/> Add Company
          </button>
          <button onClick={() => openNewPlan()}
            className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition">
            <FiPlus size={15}/> Add Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-blue-100 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">Loading...</div>
      ) : companies.length === 0 ? (
        <div className="rounded-2xl border border-blue-100 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">
          No companies yet. Click "Add Company" to create your first one (e.g. LIC of India).
        </div>
      ) : (
        <div className="space-y-5">
          {companies.map((c) => {
            const companyPlans = plansByCompany[c.id] || [];
            return (
              <div key={c.id} className="rounded-[24px] border border-blue-100 bg-white/75 p-5 shadow-sm">
                {/* Company header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                      <FiBriefcase className="text-blue-700" size={18}/>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">{c.code}</span>
                      </div>
                      <p className="text-xs text-slate-500">{companyPlans.length} plans</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditCompany(c)}
                      className="rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50">
                      <FiEdit2 size={12} className="inline mr-1"/> Edit
                    </button>
                    <button onClick={() => openNewPlan(c.id)}
                      className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                      <FiPlus size={12} className="inline mr-1"/> Plan
                    </button>
                  </div>
                </div>

                {/* Plans list */}
                {companyPlans.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 px-4 py-3 text-xs text-slate-500">
                    No plans yet. Click "Plan" above to add one (e.g. Jeevan Anand).
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {companyPlans.map((p) => (
                      <div key={p.id} className={`rounded-xl border px-3 py-2.5 ${p.isActive ? "border-blue-100 bg-[#f8fbff]" : "border-slate-200 bg-slate-50 opacity-70"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <FiLayers size={12} className="text-blue-600 flex-shrink-0"/>
                              <span className="text-sm font-semibold text-slate-800 truncate">{p.name}</span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {p.code ? `${p.code} · ` : ""}
                              Age {p.minAge ?? "any"}–{p.maxAge ?? "any"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <button onClick={() => openEditPlan(p)} className="text-[11px] font-semibold text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => togglePlan(p)} className={`text-[11px] font-semibold ${p.isActive ? "text-red-500" : "text-emerald-600"} hover:underline`}>
                              {p.isActive ? "Disable" : "Enable"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── DRAWER ── */}
      {drawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px]" onClick={() => setDrawer(null)} />
          <div className="absolute inset-y-0 right-0 flex w-full justify-end overflow-hidden">
            <div className="h-full w-full max-w-[480px] border-l border-blue-100 bg-[linear-gradient(180deg,#ffffff,#f7fbff)] shadow-[-20px_0_60px_rgba(15,23,42,0.16)]">
              <div className="flex h-full flex-col">
                <div className="sticky top-0 z-10 border-b border-blue-100 bg-white px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-900">
                      {drawer.mode === "company"
                        ? (drawer.edit ? "Edit Company" : "Add Company")
                        : (drawer.edit ? "Edit Plan" : "Add Plan")}
                    </h2>
                    <button onClick={() => setDrawer(null)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Close</button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  {drawer.mode === "company" ? (
                    <>
                      <div>
                        <label className={lbl}>Company Name</label>
                        <input className={inp} value={companyForm.name} placeholder="e.g. LIC of India"
                          onChange={(e) => setCompanyForm((f) => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Company Code <span className="font-normal text-slate-400">— short, unique (used internally)</span></label>
                        <input className={inp} value={companyForm.code} placeholder="e.g. LIC"
                          onChange={(e) => setCompanyForm((f) => ({ ...f, code: e.target.value }))} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className={lbl}>Company</label>
                        <select className={inp} value={planForm.companyId}
                          onChange={(e) => setPlanForm((f) => ({ ...f, companyId: e.target.value }))}>
                          <option value="">Select company</option>
                          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Plan Name</label>
                        <input className={inp} value={planForm.name} placeholder="e.g. Jeevan Anand"
                          onChange={(e) => setPlanForm((f) => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Plan Code <span className="font-normal text-slate-400">— optional</span></label>
                        <input className={inp} value={planForm.code} placeholder="e.g. JA-2024"
                          onChange={(e) => setPlanForm((f) => ({ ...f, code: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lbl}>Min Age</label>
                          <input className={inp} type="number" value={planForm.minAge} placeholder="e.g. 18"
                            onChange={(e) => setPlanForm((f) => ({ ...f, minAge: e.target.value }))} />
                        </div>
                        <div>
                          <label className={lbl}>Max Age</label>
                          <input className={inp} type="number" value={planForm.maxAge} placeholder="e.g. 65"
                            onChange={(e) => setPlanForm((f) => ({ ...f, maxAge: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label className={lbl}>Brochure URL <span className="font-normal text-slate-400">— optional PDF link</span></label>
                        <input className={inp} value={planForm.brochureUrl} placeholder="https://..."
                          onChange={(e) => setPlanForm((f) => ({ ...f, brochureUrl: e.target.value }))} />
                      </div>
                      <div>
                        <label className={lbl}>Description <span className="font-normal text-slate-400">— optional</span></label>
                        <textarea className={inp} rows={3} value={planForm.description} placeholder="Short description of the plan"
                          onChange={(e) => setPlanForm((f) => ({ ...f, description: e.target.value }))} />
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-blue-100 bg-white px-6 py-4">
                  <div className="flex gap-3">
                    <button onClick={drawer.mode === "company" ? saveCompany : savePlan} disabled={saving}
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 transition">
                      {saving ? "Saving..." : drawer.edit ? "Save Changes" : "Add"}
                    </button>
                    <button onClick={() => setDrawer(null)}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
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