import { useEffect, useMemo, useState } from "react";
import AdvisorShell from "../components/AdvisorShell";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { BRAND } from "../config/branding";

const AGE_OPTIONS = Array.from({ length: 83 }, (_, i) => i + 18);

function formatWhatsAppText(text) {
  if (!text) return "";

  const parts = text.split(/(\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <strong key={index} className="font-bold">
          {part.slice(1, -1)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function WhatsAppMessagePreview({ message, clientName }) {
  return (
    <div className="mx-auto w-full max-w-[330px] rounded-[42px] bg-slate-950 p-2 shadow-[0_28px_80px_rgba(15,23,42,0.35)]">
      <div className="relative overflow-hidden rounded-[34px] bg-[#0b141a]">
        {/* iPhone notch */}
        <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-3xl bg-slate-950" />

        {/* WhatsApp header */}
        <div className="flex items-center gap-3 bg-[#075E54] px-4 pb-3 pt-8 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200 text-sm font-black text-emerald-900">
            {(clientName || "C").slice(0, 1).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">
              {clientName || "Client"}
            </p>
            <p className="text-[11px] text-white/75">online</p>
          </div>

          <span className="text-lg">📞</span>
          <span className="text-lg">⋮</span>
        </div>

        {/* Chat area */}
        <div
          className="min-h-[420px] max-h-[520px] overflow-y-auto px-3 py-4"
          style={{
            backgroundColor: "#efeae2",
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.45) 0 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          {!message?.trim() ? (
            <div className="flex min-h-[360px] items-center justify-center text-center text-xs font-semibold text-slate-500">
              Generated WhatsApp message will appear here
            </div>
          ) : (
            <div className="ml-auto max-w-[86%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2 shadow-sm">
              <div className="whitespace-pre-wrap break-words text-[13px] leading-[1.55] text-slate-900">
                {formatWhatsAppText(message)}
              </div>

              <div className="mt-1 flex justify-end gap-1 text-[10px] text-slate-500">
                <span>
                  {new Date().toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
                <span className="font-bold text-sky-500">✓✓</span>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp input bar */}
        <div className="flex items-center gap-2 bg-[#efeae2] px-2 pb-3 pt-1">
          <div className="flex h-10 flex-1 items-center rounded-full bg-white px-3 text-xs text-slate-400">
            Message
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884] text-white">
            🎙️
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Subscription expired / inactive screen ── */
function SubscriptionExpiredScreen({ daysLeft, expiryDate }) {
  const expired = daysLeft !== null && daysLeft < 0;
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
          expired ? "bg-red-100" : "bg-amber-100"
        }`}
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke={expired ? "#dc2626" : "#d97706"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2
        className={`text-2xl font-black tracking-tight ${
          expired ? "text-red-700" : "text-amber-700"
        }`}
      >
        {expired ? "Subscription Expired" : "Account Inactive"}
      </h2>

      {expiryDate && expired && (
        <p className="mt-2 text-sm text-slate-500">
          Your plan expired on <strong>{formatDate(expiryDate)}</strong>
        </p>
      )}

      <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
        {expired
          ? "Your digitalhubli CRM subscription has expired. Please renew to continue accessing your leads, contacts and templates."
          : "Your account is currently inactive. Please contact admin to activate your account."}
      </p>

      <div className="mt-6 w-full max-w-sm rounded-[20px] border border-blue-100 bg-white/80 px-5 py-5 text-left shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-blue-700">
          Contact for Renewal
        </p>

        <div className="space-y-2.5 text-sm text-slate-700">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-700">
              WA
            </span>
            <div>
              <p className="font-semibold">WhatsApp / Call</p>
              <a
                href={`https://wa.me/91${BRAND.supportPhone}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-blue-600 hover:underline"
              >
                {BRAND.supportPhone}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
              ₹
            </span>
            <div>
              <p className="font-semibold">Renewal Amount</p>
              <p className="text-slate-500">₹2,000 / year</p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs text-slate-400">
        {BRAND.companyName} · {BRAND.tagline}
      </p>
    </div>
  );
}

/* ── Subscription info banner ── */
function SubscriptionBanner({ sub }) {
  if (!sub || sub.status === "ACTIVE") {
    if (sub?.daysLeft !== null && sub?.daysLeft <= 30 && sub?.daysLeft > 0) {
      return (
        <div className="mb-4 flex items-center gap-3 rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="text-amber-500">⚠</span>
          <p className="text-sm text-amber-800">
            Your subscription expires in <strong>{sub.daysLeft} days</strong> on{" "}
            <strong>
              {new Date(sub.expiryDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </strong>
            . Contact{" "}
            <a
              href={`https://wa.me/91${BRAND.supportPhone}`}
              className="font-bold underline"
            >
              {BRAND.supportPhone}
            </a>{" "}
            to renew.
          </p>
        </div>
      );
    }
    return null;
  }

  return null;
}

function AdvisorDashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const [allowedCompanies, setAllowedCompanies] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(true);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    companyId: "",
    clientName: "",
    clientMobile: "",
    age: "",
    templateId: "",
    planId: "",
  });

  useEffect(() => {
    if (location.state?.prefillContact) {
      const contact = location.state.prefillContact;
      setForm((prev) => ({
        ...prev,
        clientName: contact.clientName || "",
        clientMobile: contact.clientMobile || "",
        age: contact.age || "",
      }));
    }
  }, [location.state]);

  useEffect(() => {
    API.get("/subscriptions/my")
      .then((res) => setSubscription(res.data.subscription))
      .catch(() => setSubscription(null))
      .finally(() => setSubLoading(false));
  }, []);

  useEffect(() => {
    API.get("/auth/me")
      .then((res) => {
        const companies = res?.data?.user?.companies || [];
        setAllowedCompanies(companies.filter((c) => c?.id && c?.name));
      })
      .catch((err) =>
        setErrorMsg(err?.response?.data?.message || "Failed to load companies.")
      );
  }, []);

  useEffect(() => {
    if (!form.companyId || !form.age) {
      setPlans([]);
      setTemplates([]);
      setSelectedTemplate(null);
      setForm((prev) => ({ ...prev, planId: "", templateId: "" }));
      return;
    }

    setLoadingPlans(true);
    setPlans([]);
    setTemplates([]);
    setSelectedTemplate(null);
    setGeneratedMessage("");

    API.get(`/templates/plans?companyId=${form.companyId}&age=${form.age}`)
      .then((res) => setPlans(res.data.plans || []))
      .catch((err) =>
        setErrorMsg(err?.response?.data?.message || "Failed to load plans.")
      )
      .finally(() => setLoadingPlans(false));
  }, [form.companyId, form.age]);

  useEffect(() => {
    if (!form.companyId || !form.planId) {
      setTemplates([]);
      setSelectedTemplate(null);
      setForm((prev) => ({ ...prev, templateId: "" }));
      return;
    }

    setLoadingTemplates(true);
    setTemplates([]);
    setSelectedTemplate(null);
    setGeneratedMessage("");

    API.get(
      `/templates?companyId=${form.companyId}&age=${form.age}&planId=${form.planId}`
    )
      .then((res) => setTemplates(res.data.templates || []))
      .catch((err) =>
        setErrorMsg(err?.response?.data?.message || "Failed to load templates.")
      )
      .finally(() => setLoadingTemplates(false));
  }, [form.companyId, form.age, form.planId]);

  const selectedCompany = useMemo(
    () => allowedCompanies.find((c) => String(c.id) === String(form.companyId)),
    [allowedCompanies, form.companyId]
  );

  const templateInfo = useMemo(
    () => templates.find((t) => String(t.id) === String(form.templateId)),
    [templates, form.templateId]
  );

  useEffect(() => {
    setSelectedTemplate(templateInfo || null);
  }, [templateInfo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setSuccessMsg("");
    setErrorMsg("");

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "companyId" || name === "age"
        ? { planId: "", templateId: "" }
        : {}),
      ...(name === "planId" ? { templateId: "" } : {}),
    }));

    if (name === "companyId" || name === "age") {
      setSelectedTemplate(null);
      setGeneratedMessage("");
    }
  };

  const handleTemplateSelection = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, templateId: value }));
    setSelectedTemplate(
      templates.find((t) => String(t.id) === String(value)) || null
    );
    setGeneratedMessage("");
  };

  const replaceTemplateVariables = (body) => {
    if (!body) return "";

    return body
      .replaceAll("{client_name}", form.clientName || "Client")
      .replaceAll("{age}", form.age || "")
      .replaceAll("{advisor_name}", user?.name || "Advisor")
      .replaceAll("{advisor_mobile}", user?.phone || "")
      .replaceAll("{advisor_url}", "")
      .replaceAll("{company_name}", selectedCompany?.name || "")
      .replaceAll("{advisor_brand}", user?.brandName || BRAND.companyName)
      .replaceAll("{advisor_tagline}", user?.tagline || "Your trusted insurance partner")
      .replaceAll("{template_title}", selectedTemplate?.title || "Plan");
  };

  const generateMessage = () => {
    if (
      !form.companyId ||
      !form.clientName ||
      !form.clientMobile ||
      !form.age ||
      !form.templateId
    ) {
      setErrorMsg("Please select company, fill client details, age, and template.");
      return;
    }

    if (!selectedTemplate?.body) {
      setErrorMsg("Selected template has no message body.");
      return;
    }

    const bodyWithVariables = replaceTemplateVariables(selectedTemplate.body);

    const isTataAig =
      selectedCompany?.code === "TATA_AIG" ||
      selectedCompany?.name?.toLowerCase().includes("tata aig");

    const advisorPhone = String(user?.phone || "").replace(/\D/g, "");
    const advisorChatflowUrl = advisorPhone
      ? `${window.location.origin}/tata-aig-medicare-select/${advisorPhone}`
      : "";

    const advisorUrlLine =
      isTataAig && advisorChatflowUrl
        ? `\n\nFor more information, please chat with *Shreya* \n${advisorChatflowUrl}`
        : "";

    const advisorBrand = user?.brandName || user?.name || BRAND.companyName;
    const advisorTagline = user?.tagline || "Your trusted insurance partner";

    const finalMessage = `Dear *${form.clientName || "Client"}*,\n\n${bodyWithVariables}\n\nFor more details, please contact:\n*${user?.name || "Advisor"}*\n*${user?.phone || ""}*${advisorUrlLine}\n\nTeam - ${advisorBrand}\n${advisorTagline}`;

    setGeneratedMessage(finalMessage);
    setSuccessMsg("Message generated successfully.");
    setErrorMsg("");
  };

  const openWhatsApp = () => {
    if (!generatedMessage.trim()) {
      setErrorMsg("Please generate the message first.");
      return;
    }

    const mobile = form.clientMobile.replace(/\D/g, "");

    if (!mobile) {
      setErrorMsg("Please enter a valid client mobile number.");
      return;
    }

    window.open(
      `https://wa.me/91${mobile}?text=${encodeURIComponent(generatedMessage)}`,
      "_blank"
    );
  };

  const openPdfLink = () => {
    if (!selectedTemplate?.pdfUrl) {
      setErrorMsg("No PDF link available for this template.");
      return;
    }

    window.open(selectedTemplate.pdfUrl, "_blank");
  };

  const copyMessage = async () => {
    if (!generatedMessage.trim()) {
      setErrorMsg("No generated message to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedMessage);
      setSuccessMsg("Message copied successfully.");
    } catch {
      setErrorMsg("Failed to copy message.");
    }
  };

  const clearForm = () => {
    setForm({
      companyId: "",
      clientName: "",
      clientMobile: "",
      age: "",
      templateId: "",
      planId: "",
    });
    setTemplates([]);
    setSelectedTemplate(null);
    setGeneratedMessage("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const confirmSentAndSaveLead = async () => {
    if (!generatedMessage.trim()) {
      setErrorMsg("Generate the message before saving the lead.");
      return;
    }

    if (!selectedTemplate) {
      setErrorMsg("Please select a template first.");
      return;
    }

    try {
      setErrorMsg("");
      setSuccessMsg("");

      await API.post("/leads", {
        name: form.clientName.trim(),
        phone: form.clientMobile.trim(),
        age: form.age ? Number(form.age) : null,
        companyId: Number(form.companyId),
        templateId: selectedTemplate.id,
        remarks: "Template shared from dashboard",
        sourcePage: "DASHBOARD_PAGE",
      });

      setSuccessMsg("Lead saved successfully.");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Failed to save lead.");
    }
  };

  if (!subLoading && subscription) {
    const isExpired = subscription.isExpired;
    const isInactive = subscription.status !== "ACTIVE";

    if (isExpired || isInactive) {
      return (
        <AdvisorShell title="Dashboard" activeTab="dashboard">
          <SubscriptionExpiredScreen
            daysLeft={subscription.daysLeft}
            expiryDate={subscription.expiryDate}
          />
        </AdvisorShell>
      );
    }
  }

  return (
    <AdvisorShell title="Advisor Dashboard" activeTab="dashboard">
      {subscription && <SubscriptionBanner sub={subscription} />}

      {errorMsg && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 sm:text-sm">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:text-sm">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-[24px] border border-blue-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,249,255,0.98))] p-4 shadow-[0_12px_32px_rgba(37,99,235,0.06)] sm:p-5">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
              Message Setup
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
              Client & Template
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Company
              </label>
              <select
                name="companyId"
                value={form.companyId}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select Company</option>
                {allowedCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Client Name
              </label>
              <input
                type="text"
                name="clientName"
                value={form.clientName}
                onChange={handleInputChange}
                placeholder="Enter client name"
                className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Client Mobile
              </label>
              <input
                type="text"
                name="clientMobile"
                value={form.clientMobile}
                onChange={handleInputChange}
                placeholder="Enter mobile number"
                className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Age
              </label>
              <select
                name="age"
                value={form.age}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select Age</option>
                {AGE_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Plan
              </label>
              <select
                name="planId"
                value={form.planId}
                onChange={handleInputChange}
                disabled={!form.companyId || !form.age || loadingPlans}
                className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="">
                  {loadingPlans ? "Loading plans..." : "Select Plan"}
                </option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Template
              </label>
              <select
                name="templateId"
                value={form.templateId}
                onChange={handleTemplateSelection}
                disabled={
                  !form.companyId ||
                  !form.age ||
                  !form.planId ||
                  loadingTemplates
                }
                className="w-full rounded-xl border border-blue-100 bg-[#f8fbff] px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="">
                  {loadingTemplates ? "Loading templates..." : "Select Template"}
                </option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2">
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-3 text-xs text-slate-700">
              <span className="font-bold text-slate-900">
                Template Selection Logic
              </span>
              <br />
              First select <span className="font-bold">Company + Age + Suitable Plan</span>,
              then choose the most suitable template from the dropdown.
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-3 text-xs text-amber-900">
              <span className="font-bold">Important</span>
              <br />
              Please use only your own mobile or your own WhatsApp Web account
              before sending client messages.
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              onClick={generateMessage}
              className="rounded-xl bg-blue-600 px-3 py-2.5 text-[11px] font-bold text-white shadow-[0_10px_20px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 sm:text-xs"
            >
              Generate
            </button>

            <button
              onClick={openWhatsApp}
              className="rounded-xl bg-emerald-600 px-3 py-2.5 text-[11px] font-bold text-white shadow-[0_10px_20px_rgba(5,150,105,0.18)] transition hover:bg-emerald-700 sm:text-xs"
            >
              WhatsApp
            </button>

            <button
              onClick={confirmSentAndSaveLead}
              className="rounded-xl bg-sky-600 px-3 py-2.5 text-[11px] font-bold text-white shadow-[0_10px_20px_rgba(2,132,199,0.18)] transition hover:bg-sky-700 sm:text-xs"
            >
              Save Lead
            </button>

            <button
              onClick={openPdfLink}
              className="rounded-xl border border-blue-200 bg-white/90 px-3 py-2.5 text-[11px] font-bold text-slate-700 transition hover:bg-blue-50 sm:text-xs"
            >
              PDF
            </button>
          </div>
        </section>

        <section className="rounded-[24px] border border-blue-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,249,255,0.98))] p-4 shadow-[0_12px_32px_rgba(37,99,235,0.06)] sm:p-5">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                Preview
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                Message
              </h2>
            </div>

            <p className="text-xs font-semibold text-blue-700">
              {selectedTemplate?.title || "No template selected"}
            </p>
          </div>

          {subscription?.status === "ACTIVE" && subscription?.expiryDate && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-blue-700">
              <span>📅</span>
              <span>
                Plan valid until{" "}
                <strong>
                  {new Date(subscription.expiryDate).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </strong>{" "}
                ·{" "}
                <span
                  className={
                    subscription.daysLeft <= 30
                      ? "font-bold text-amber-600"
                      : "text-blue-600"
                  }
                >
                  {subscription.daysLeft}d left
                </span>
              </span>
            </div>
          )}

          <div className="rounded-[26px] border border-blue-100 bg-white/80 p-3 shadow-inner">
            <WhatsAppMessagePreview message={generatedMessage} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={copyMessage}
              className="rounded-xl border border-blue-200 bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-blue-50"
            >
              Copy
            </button>

            <button
              onClick={clearForm}
              className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </section>
      </div>
    </AdvisorShell>
  );
}

export default AdvisorDashboard;