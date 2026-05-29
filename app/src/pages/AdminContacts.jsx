import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import AdminShell from "../components/AdminShell";
import API from "../api/axios";
import { FiX, FiChevronLeft, FiChevronRight, FiEye, FiSearch } from "react-icons/fi";

function maskPhone(phone) {
  if (!phone) return "";
  return `${phone.slice(0, 2)}****${phone.slice(-4)}`;
}

function getSourceBadgeClass(source) {
  switch (source) {
    case "EXCEL":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "MANUAL":
    default:
      return "border-violet-200 bg-violet-50 text-violet-700";
  }
}

function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [advisors, setAdvisors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [advisorId, setAdvisorId] = useState("");
  const [source, setSource] = useState("ALL");
  const [leadFilter, setLeadFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (selectedContact) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedContact]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const res = await API.get("/contacts", {
        params: {
          search: debouncedSearch,
          advisorId,
          source,
        },
      });

      setContacts(res.data.contacts || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvisors = async () => {
    try {
      const res = await API.get("/admin/advisors");
      setAdvisors(res.data.advisors || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdvisors();
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [debouncedSearch, advisorId, source]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, advisorId, source, leadFilter, pageSize]);

  const filteredContacts = useMemo(() => {
    let data = contacts;

    if (leadFilter !== "ALL") {
      data = data.filter((c) =>
        leadFilter === "HAS_LEAD" ? c.hasLead : !c.hasLead
      );
    }

    return data;
  }, [contacts, leadFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedContacts = filteredContacts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const startItem =
    filteredContacts.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, filteredContacts.length);

  const stats = useMemo(() => {
    return {
      total: contacts.length,
      imported: contacts.filter((c) => c.importSource === "EXCEL").length,
      manual: contacts.filter((c) => c.importSource === "MANUAL").length,
      converted: contacts.filter((c) => c.hasLead).length,
    };
  }, [contacts]);

  return (
    <AdminShell
      title="Admin Contacts"
      subtitle="Monitor advisor contact uploads, contact quality, and contact-to-lead conversion across the team."
      activeTab="contacts"
    >
      {errorMsg ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      ) : null}

      {/* KPI CARDS */}
      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Card label="Total Contacts" value={stats.total} />
        <Card label="Imported" value={stats.imported} />
        <Card label="Manual" value={stats.manual} />
        <Card label="Converted" value={stats.converted} />
      </div>

      {/* FILTERS */}
      <div className="mb-5 rounded-[26px] border border-blue-100 bg-white/85 p-3 shadow-[0_12px_30px_rgba(37,99,235,0.05)] sm:p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-blue-100 bg-[#f8fbff] px-4 py-3 pl-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={advisorId}
            onChange={(e) => setAdvisorId(e.target.value)}
            className="w-full rounded-2xl border border-blue-100 bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All Advisors</option>
            {advisors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-2xl border border-blue-100 bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="ALL">All Source</option>
            <option value="MANUAL">Manual</option>
            <option value="EXCEL">Imported</option>
          </select>

          <select
            value={leadFilter}
            onChange={(e) => setLeadFilter(e.target.value)}
            className="w-full rounded-2xl border border-blue-100 bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="ALL">All Leads</option>
            <option value="HAS_LEAD">Has Lead</option>
            <option value="NO_LEAD">No Lead</option>
          </select>
        </div>
      </div>

      {/* INFO STRIP */}
      <div className="mb-5 rounded-[22px] border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900 sm:text-sm">
        Admin view is for monitoring only. Advisors create and work contacts; admin tracks usage, source quality, and conversion.
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden overflow-hidden rounded-[28px] border border-blue-100 bg-white/85 shadow-[0_12px_30px_rgba(37,99,235,0.05)] lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-blue-50/70">
              <tr className="text-left text-sm text-slate-700">
                <th className="w-[20%] px-4 py-4 font-semibold">Advisor</th>
                <th className="w-[36%] px-4 py-4 font-semibold">Contact</th>
                <th className="w-[14%] px-4 py-4 text-center font-semibold">Source</th>
                <th className="w-[14%] px-4 py-4 text-center font-semibold">Lead</th>
                <th className="w-[16%] px-4 py-4 text-center font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <TableSkeleton />
              ) : paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-sm text-slate-600">
                    🔍 No contacts match your filters.
                  </td>
                </tr>
              ) : (
                paginatedContacts.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t border-blue-100 transition hover:bg-blue-50/30"
                  >
                    <td className="px-4 py-4 text-sm text-slate-700">
                      <div className="font-semibold text-slate-900">
                        {c.advisor?.name || "—"}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">
                        {c.name || "Unnamed Contact"}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {maskPhone(c.phone)}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getSourceBadgeClass(
                          c.importSource
                        )}`}
                      >
                        {c.importSource === "EXCEL" ? "Imported" : "Manual"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          c.hasLead
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-600"
                        }`}
                      >
                        {c.hasLead ? "Lead Created" : "No Lead"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setSelectedContact(c)}
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                      >
                        <FiEye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="space-y-3 lg:hidden">
        {loading ? (
          <MobileSkeleton />
        ) : paginatedContacts.length === 0 ? (
          <div className="rounded-[24px] border border-blue-100 bg-white/85 p-5 text-center text-sm text-slate-600 shadow-sm">
            <div className="text-2xl">🔍</div>
            <p className="mt-2 font-semibold text-slate-800">No contacts found</p>
            <p className="mt-1 text-xs text-slate-500">Try changing search or filters.</p>
          </div>
        ) : (
          paginatedContacts.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedContact(c)}
              className="w-full rounded-[22px] border border-blue-100 bg-white/90 p-3 text-left shadow-[0_10px_25px_rgba(37,99,235,0.06)] transition active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {c.name || "Unnamed Contact"}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {maskPhone(c.phone)}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    c.hasLead
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-600"
                  }`}
                >
                  {c.hasLead ? "Lead" : "No Lead"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniInfo label="Advisor" value={c.advisor?.name || "—"} />
                <MiniInfo
                  label="Source"
                  value={c.importSource === "EXCEL" ? "Imported" : "Manual"}
                />
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50/70 py-2 text-sm font-semibold text-blue-700">
                <FiEye size={15} />
                Tap to view
              </div>
            </button>
          ))
        )}
      </div>

      {/* PAGINATION */}
      <div className="mt-5 flex flex-col gap-3 rounded-[24px] border border-blue-100 bg-white/75 px-4 py-4 shadow-[0_10px_25px_rgba(37,99,235,0.04)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{startItem}</span>–
            <span className="font-semibold">{endItem}</span> of{" "}
            <span className="font-semibold">{filteredContacts.length}</span>
          </p>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2 text-sm text-slate-700 outline-none"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <button
            disabled={safePage === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiChevronLeft size={16} />
          </button>

          <div className="rounded-xl border border-blue-100 bg-[#f8fbff] px-4 py-2 text-sm font-semibold text-slate-700">
            {safePage} / {totalPages}
          </div>

          <button
            disabled={safePage === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* MOBILE-FIRST MODAL */}
      {selectedContact &&
  createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedContact(null)}
          />

          <div className="fixed inset-x-0 bottom-0 z-[10000] max-h-[88dvh] overflow-hidden rounded-t-[28px] border border-blue-100 bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.18)] lg:left-1/2 lg:top-1/2 lg:bottom-auto lg:max-h-[82vh] lg:w-full lg:max-w-xl lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[28px]">
            <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-slate-300 lg:hidden" />

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-blue-100 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Contact Details
                </h2>
                <p className="text-sm text-slate-500">Admin monitoring view</p>
              </div>

              <button
                onClick={() => setSelectedContact(null)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="max-h-[calc(88dvh-140px)] overflow-y-auto px-5 py-5 lg:max-h-[calc(82vh-132px)]">
              <div className="space-y-4">
                <DetailBox label="Advisor">
                  {selectedContact.advisor?.name || "—"}
                </DetailBox>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailBox label="Contact Name">
                    {selectedContact.name || "Unnamed Contact"}
                  </DetailBox>

                  <DetailBox label="Phone">
                    {selectedContact.phone || "—"}
                  </DetailBox>

                  <DetailBox label="Source">
                    {selectedContact.importSource === "EXCEL"
                      ? "Imported"
                      : "Manual"}
                  </DetailBox>

                  <DetailBox label="Lead Status">
                    {selectedContact.hasLead ? "Lead Created" : "No Lead"}
                  </DetailBox>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-blue-100 bg-blue-50/70 px-5 py-4">
              <button
                onClick={() => setSelectedContact(null)}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)] lg:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ,
document.body
)}
    </AdminShell>
  );
}

function Card({ label, value }) {
  return (
    <div className="rounded-[22px] border border-blue-100 bg-[linear-gradient(180deg,#ffffff,#f3f8ff)] p-4 shadow-[0_10px_25px_rgba(37,99,235,0.06)] sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700 sm:text-xs">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-blue-100 bg-[#f8fbff] p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function DetailBox({ label, children }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-[#f8fbff] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">
        {label}
      </p>
      <div className="mt-2 text-sm font-semibold text-slate-900">
        {children}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((row) => (
        <tr key={row} className="border-t border-blue-100">
          <td className="px-4 py-4">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-100" />
          </td>
          <td className="px-4 py-4">
            <div className="mx-auto h-7 w-20 animate-pulse rounded-full bg-slate-100" />
          </td>
          <td className="px-4 py-4">
            <div className="mx-auto h-7 w-24 animate-pulse rounded-full bg-slate-100" />
          </td>
          <td className="px-4 py-4">
            <div className="mx-auto h-9 w-20 animate-pulse rounded-xl bg-slate-100" />
          </td>
        </tr>
      ))}
    </>
  );
}

function MobileSkeleton() {
  return (
    <>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-[22px] border border-blue-100 bg-white/85 p-3 shadow-sm"
        >
          <div className="flex justify-between gap-3">
            <div>
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-7 w-16 animate-pulse rounded-full bg-slate-100" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      ))}
    </>
  );
}

export default AdminContacts;