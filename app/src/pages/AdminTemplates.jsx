import { useEffect, useMemo, useState } from "react";
import AdminShell from "../components/AdminShell";
import API from "../api/axios";
import { Pencil, Trash2, Power } from "lucide-react";

const initialForm = {
  companyId: "",
  planId: "",
  title: "",
  tagline: "",
  minAge: "",
  maxAge: "",
  body: "",
  pdfUrl: "",
};

const ITEMS_PER_PAGE = 8;

function AdminTemplates() {
  const [companies, setCompanies] = useState([]);
  const [allPlans, setAllPlans]   = useState([]);
  const [templates, setTemplates] = useState([]);

  const [pagination, setPagination] = useState({ page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [errorMsg, setErrorMsg]     = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch]             = useState("");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [currentPage, setCurrentPage]     = useState(1);
  const [showPanel, setShowPanel]   = useState(false);
  const [mode, setMode]             = useState("create");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState(initialForm);

  // Plans filtered by selected company in form
  const filteredPlans = useMemo(() => {
    if (!form.companyId) return [];
    return allPlans.filter((p) => String(p.companyId) === String(form.companyId) && p.isActive);
  }, [allPlans, form.companyId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const [companiesRes, plansRes, templatesRes] = await Promise.all([
        API.get("/admin/companies"),
        API.get("/admin/plans"),
        API.get("/admin/templates", {
          params: { page: currentPage, limit: ITEMS_PER_PAGE, search, companyId: companyFilter },
        }),
      ]);
      setCompanies(companiesRes.data.companies || []);
      setAllPlans(plansRes.data.plans || []);
      setTemplates(templatesRes.data.templates || []);
      setPagination(templatesRes.data.pagination || { page: currentPage, limit: ITEMS_PER_PAGE, total: 0, totalPages: 1 });
    } catch (error) {
      console.error("Failed to load templates data:", error);
      setErrorMsg(error?.response?.data?.message || "Failed to load templates data.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInitialData(); }, [currentPage, search, companyFilter]);
  useEffect(() => { setCurrentPage(1); }, [search, companyFilter]);

  const openCreatePanel = () => {
    setMode("create"); setSelectedTemplate(null); setForm(initialForm);
    setErrorMsg(""); setSuccessMsg(""); setShowPanel(true);
  };

  const openEditPanel = (template) => {
    setMode("edit"); setSelectedTemplate(template);
    setForm({
      companyId: String(template.company?.id || ""),
      planId: String(template.planId || template.plan?.id || ""),
      title: template.title || "",
      tagline: template.tagline || "",
      minAge: template.minAge != null ? String(template.minAge) : "",
      maxAge: template.maxAge != null ? String(template.maxAge) : "",
      body: template.body || "",
      pdfUrl: template.pdfUrl || "",
    });
    setErrorMsg(""); setSuccessMsg(""); setShowPanel(true);
  };

  const closePanel = () => {
    setShowPanel(false); setSelectedTemplate(null); setForm(initialForm);
    setErrorMsg(""); setSuccessMsg("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // When company changes, reset planId
      if (name === "companyId") next.planId = "";
      return next;
    });
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); setErrorMsg(""); setSuccessMsg("");
      const payload = {
        companyId: Number(form.companyId),
        planId: form.planId ? Number(form.planId) : null,
        title: form.title.trim(),
        tagline: form.tagline.trim(),
        minAge: form.minAge !== "" ? Number(form.minAge) : null,
        maxAge: form.maxAge !== "" ? Number(form.maxAge) : null,
        body: form.body.trim(),
        pdfUrl: form.pdfUrl.trim(),
      };
      if (mode === "create") {
        await API.post("/admin/templates", payload);
        setSuccessMsg("Template created successfully.");
      } else if (mode === "edit" && selectedTemplate) {
        await API.put(`/admin/templates/${selectedTemplate.id}`, payload);
        setSuccessMsg("Template updated successfully.");
      }
      await fetchInitialData();
      closePanel();
    } catch (error) {
      console.error("Save template failed:", error);
      setErrorMsg(error?.response?.data?.message || "Failed to save template.");
    } finally { setSaving(false); }
  };

  const handleToggleStatus = async (template) => {
    try {
      setErrorMsg(""); setSuccessMsg("");
      await API.patch(`/admin/templates/${template.id}/toggle`);
      await fetchInitialData();
    } catch (error) { setErrorMsg(error?.response?.data?.message || "Failed to update template status."); }
  };

  const handleDeleteTemplate = async (template) => {
    if (!window.confirm(`Delete template "${template.title}"? This cannot be undone.`)) return;
    try {
      setErrorMsg(""); setSuccessMsg("");
      await API.delete(`/admin/templates/${template.id}`);
      await fetchInitialData();
    } catch (error) { setErrorMsg(error?.response?.data?.message || "Failed to delete template."); }
  };

  const Pagination = () => {
    if (pagination.total <= ITEMS_PER_PAGE) return null;
    const startItem = pagination.total === 0 ? 0 : (currentPage - 1) * pagination.limit + 1;
    const endItem = Math.min(currentPage * pagination.limit, pagination.total);
    return (
      <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-blue-100 bg-white/80 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-600">Showing <span className="font-bold text-slate-900">{startItem}</span> to <span className="font-bold text-slate-900">{endItem}</span> of <span className="font-bold text-slate-900">{pagination.total}</span></p>
        <div className="flex items-center gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded-2xl border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 disabled:opacity-40">Previous</button>
          <span className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">{currentPage} / {pagination.totalPages}</span>
          <button disabled={currentPage === pagination.totalPages} onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))} className="rounded-2xl border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50 disabled:opacity-40">Next</button>
        </div>
      </div>
    );
  };

  const inp = "w-full rounded-2xl border border-blue-100 bg-[#f8fbff] px-4 py-3 text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100";
  const lbl = "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <AdminShell title="Template Management" subtitle="Create templates under Company → Plan → Age for advisors to use." activeTab="templates">
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-blue-100 bg-white/70 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[700px] xl:w-[860px]">
          <input type="text" placeholder="Search by title, tagline, or company" value={search} onChange={(e) => setSearch(e.target.value)} className={inp} />
          <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className={inp}>
            <option value="ALL">All Companies</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={openCreatePanel} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition">+ Add Template</button>
      </div>

      {errorMsg && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>}
      {successMsg && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMsg}</div>}

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-[28px] border border-blue-100 bg-white/75 shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-blue-50/70">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4">Template</th>
                <th className="px-5 py-4">Company</th>
                <th className="px-5 py-4">Plan</th>
                <th className="px-5 py-4">Age</th>
                <th className="px-5 py-4">PDF</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="px-5 py-6 text-sm text-slate-500">Loading templates...</td></tr>
              ) : templates.length === 0 ? (
                <tr><td colSpan="7" className="px-5 py-6 text-sm text-slate-500">No templates found.</td></tr>
              ) : templates.map((t) => (
                <tr key={t.id} className="border-t border-blue-100 hover:bg-blue-50/30 transition">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{t.title}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{t.tagline || "No tagline"}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    <div className="font-medium">{t.company?.name}</div>
                    <div className="text-xs text-slate-400">{t.company?.code}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {t.plan ? (
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{t.plan.name}</span>
                    ) : <span className="text-xs text-slate-400">No plan</span>}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {t.minAge != null || t.maxAge != null ? `${t.minAge ?? "any"}–${t.maxAge ?? "any"}` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    {t.pdfUrl ? <a href={t.pdfUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-700 hover:underline">Open PDF</a> : <span className="text-xs text-slate-400">No PDF</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{t.isActive ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditPanel(t)} title="Edit" className="rounded-xl border border-blue-200 bg-white p-2 text-slate-700 hover:bg-blue-50"><Pencil size={15}/></button>
                      <button onClick={() => handleToggleStatus(t)} title={t.isActive ? "Deactivate" : "Activate"} className={`rounded-xl border bg-white p-2 ${t.isActive ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}><Power size={15}/></button>
                      <button onClick={() => handleDeleteTemplate(t)} title="Delete" className="rounded-xl border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50"><Trash2 size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 lg:hidden">
        {loading ? (
          <div className="rounded-2xl border border-blue-100 bg-white/75 px-4 py-4 text-sm text-slate-500">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="rounded-2xl border border-blue-100 bg-white/75 px-4 py-4 text-sm text-slate-500">No templates found.</div>
        ) : templates.map((t) => (
          <div key={t.id} className="rounded-[24px] border border-blue-100 bg-white/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900">{t.title}</h3>
                <p className="mt-0.5 text-sm text-slate-500">{t.company?.name}</p>
                {t.plan && <span className="mt-1 inline-block rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{t.plan.name}</span>}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{t.isActive ? "Active" : "Inactive"}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Age: {t.minAge != null ? `${t.minAge}–${t.maxAge ?? "any"}` : "—"}</div>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => openEditPanel(t)} className="rounded-xl border border-blue-200 bg-white p-2 text-slate-700"><Pencil size={15}/></button>
              <button onClick={() => handleToggleStatus(t)} className={`rounded-xl border bg-white p-2 ${t.isActive ? "border-amber-200 text-amber-700" : "border-emerald-200 text-emerald-700"}`}><Power size={15}/></button>
              <button onClick={() => handleDeleteTemplate(t)} className="rounded-xl border border-red-200 bg-white p-2 text-red-600"><Trash2 size={15}/></button>
            </div>
          </div>
        ))}
      </div>

      <Pagination />

      {/* ── DRAWER ── */}
      {showPanel && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px]" onClick={closePanel} />
          <div className="absolute inset-y-0 right-0 flex w-full justify-end overflow-hidden">
            <div className="h-full w-full max-w-[980px] border-l border-blue-100 bg-[linear-gradient(180deg,#ffffff,#f7fbff)] shadow-[-20px_0_60px_rgba(15,23,42,0.16)]">
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-blue-100 bg-white px-5 py-5 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{mode === "create" ? "Create Template" : "Edit Template"}</p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-900">{mode === "create" ? "Add New Template" : "Update Template"}</h2>
                      <p className="mt-2 text-sm text-slate-600">Select Company → Plan → set age range and message.</p>
                    </div>
                    <button onClick={closePanel} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                  {errorMsg && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>}

                  <form id="template-form" onSubmit={handleSaveTemplate} className="space-y-5">
                    {/* Company → Plan cascade */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-blue-700">Step 1 — Select Company & Plan</p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={lbl}>Company *</label>
                          <select name="companyId" value={form.companyId} onChange={handleInputChange} className={inp}>
                            <option value="">Select company</option>
                            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={lbl}>Plan <span className="font-normal text-slate-400">— filters by selected company</span></label>
                          <select name="planId" value={form.planId} onChange={handleInputChange} disabled={!form.companyId} className={`${inp} disabled:opacity-50`}>
                            <option value="">{!form.companyId ? "Select company first" : filteredPlans.length === 0 ? "No plans for this company" : "Select plan"}</option>
                            {filteredPlans.map((p) => <option key={p.id} value={p.id}>{p.name} {p.minAge != null ? `(${p.minAge}–${p.maxAge ?? "any"})` : ""}</option>)}
                          </select>
                          {form.companyId && filteredPlans.length === 0 && (
                            <p className="mt-1.5 text-xs text-amber-600">No plans found for this company. Add plans first in Companies & Plans.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Template details */}
                    <div className="rounded-2xl border border-blue-100 bg-white/80 p-4">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-blue-700">Step 2 — Template Details</p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className={lbl}>Title *</label>
                          <input type="text" name="title" value={form.title} onChange={handleInputChange} placeholder="e.g. Jeevan Anand for Young Professionals" className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Tagline</label>
                          <input type="text" name="tagline" value={form.tagline} onChange={handleInputChange} placeholder="Short subtitle" className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Min Age <span className="font-normal text-slate-400">— template shown for clients ≥ this age</span></label>
                          <input type="number" name="minAge" value={form.minAge} onChange={handleInputChange} placeholder="e.g. 25" className={inp} />
                        </div>
                        <div>
                          <label className={lbl}>Max Age <span className="font-normal text-slate-400">— template shown for clients ≤ this age</span></label>
                          <input type="number" name="maxAge" value={form.maxAge} onChange={handleInputChange} placeholder="e.g. 45" className={inp} />
                        </div>
                        <div className="md:col-span-2">
                          <label className={lbl}>PDF URL <span className="font-normal text-slate-400">— optional brochure link</span></label>
                          <input type="text" name="pdfUrl" value={form.pdfUrl} onChange={handleInputChange} placeholder="https://..." className={inp} />
                        </div>
                      </div>
                    </div>

                    {/* Message body */}
                    <div className="rounded-2xl border border-blue-100 bg-white/80 p-4">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-blue-700">Step 3 — Message Body</p>
                      <p className="mb-2 text-xs text-slate-500">Variables: {"{client_name}"} {"{advisor_name}"} {"{advisor_mobile}"} {"{advisor_brand}"} {"{advisor_tagline}"} {"{template_title}"} {"{company_name}"}</p>
                      <textarea name="body" value={form.body} onChange={handleInputChange} placeholder="Write the WhatsApp message template here..." rows={10} className={`${inp} resize-none`} />
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="border-t border-blue-100 bg-white px-5 py-4 sm:px-6">
                  <div className="flex gap-3">
                    <button type="submit" form="template-form" disabled={saving}
                      className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-70 transition">
                      {saving ? "Saving..." : mode === "create" ? "Create Template" : "Save Changes"}
                    </button>
                    <button type="button" onClick={closePanel} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
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

export default AdminTemplates;