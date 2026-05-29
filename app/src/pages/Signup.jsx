import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BRAND } from "../config/branding";
import API from "../api/axios";
import {
  ShieldCheck, User, Mail, Phone, Lock, Eye, EyeOff,
  Building2, ArrowRight, CheckCircle2,
} from "lucide-react";
import logo from "../assets/logo-ih.png";

function Signup() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loadingCo, setLoadingCo] = useState(true);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", companyIds: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errorMsg, setErrorMsg]         = useState("");
  const [success, setSuccess]           = useState(false);

  useEffect(() => {
    if (user?.role === "ADMIN")    navigate("/admin");
    else if (user?.role === "ADVISOR") navigate("/advisor");
  }, [user, navigate]);

  useEffect(() => {
    API.get("/auth/companies")
      .then((res) => setCompanies(res.data.companies || []))
      .catch(() => setCompanies([]))
      .finally(() => setLoadingCo(false));
  }, []);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleCompany = (id) => {
    setForm((f) => ({
      ...f,
      companyIds: f.companyIds.includes(id)
        ? f.companyIds.filter((c) => c !== id)
        : [...f.companyIds, id],
    }));
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!form.name.trim())    return setErrorMsg("Full name is required.");
    if (!form.email.trim())   return setErrorMsg("Email is required.");
    if (!form.phone.trim())   return setErrorMsg("Mobile number is required.");
    if (!form.password)       return setErrorMsg("Password is required.");
    if (form.password.length < 6) return setErrorMsg("Password must be at least 6 characters.");
    if (form.companyIds.length === 0) return setErrorMsg("Please select at least one insurance company.");

    try {
      setLoading(true);
      await API.post("/auth/signup", {
        name:       form.name.trim(),
        email:      form.email.trim().toLowerCase(),
        phone:      form.phone.trim(),
        password:   form.password,
        companyIds: form.companyIds,
      });
      setSuccess(true);
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────
  if (success) {
    return (
      <div className="relative flex h-[100svh] items-center justify-center overflow-hidden bg-[#031b61] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.30),_transparent_60%)]" />
        <div className="relative z-10 mx-auto max-w-md px-6 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-400/40">
              <CheckCircle2 size={40} className="text-emerald-400" />
            </div>
          </div>
          <h2 className="text-3xl font-black tracking-tight">Account Created!</h2>
          <p className="mt-3 leading-7 text-blue-100/70">
            Your <strong className="text-white">{BRAND.companyName} CRM</strong> account has been created. Complete payment to activate and start using the platform.
          </p>
          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-200 leading-6">
            Our team will contact you on <strong>{form.phone}</strong> or <strong>{form.email}</strong> with payment details.
          </div>
          <p className="mt-4 text-xs text-white/40">Powered by {BRAND.companyName} · {BRAND.tagline}</p>
          <Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-bold transition hover:brightness-110">
            Back to Login <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Signup form ───────────────────────────────────────────
  return (
    <div className="relative min-h-[100svh] overflow-x-hidden bg-[#031b61] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,_rgba(37,99,235,0.34),_transparent_28%),linear-gradient(135deg,_#031b61_0%,_#08245f_30%,_#03113d_72%,_#020617_100%)]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-60px] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Top-right brand badge */}
      <div className="pointer-events-none absolute right-6 top-5 z-20 hidden items-center gap-2 text-xs text-white/60 lg:flex">
        <ShieldCheck size={14} />
        <span>{BRAND.companyName} · {BRAND.tagline}</span>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[560px] flex-col justify-center px-4 py-8 sm:px-6">

        {/* Logo + brand */}
        <div className="mb-5 flex flex-col items-center">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] border border-blue-200/20 bg-white/95 p-2.5 shadow-[0_0_30px_rgba(96,165,250,0.30)]">
            <img src={logo} alt={BRAND.companyName} className="h-full w-full object-contain" />
          </div>
          <h1 className="mt-2.5 text-2xl font-black tracking-tight">{BRAND.companyName}</h1>
          <p className="text-xs text-blue-100/60">{BRAND.tagline}</p>
        </div>

        <div className="rounded-[1.55rem] border border-white/14 bg-[linear-gradient(180deg,rgba(18,41,112,0.92),rgba(12,31,88,0.90))] px-5 py-6 shadow-[0_18px_65px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:px-7 sm:py-7">
          <h2 className="mb-1 text-2xl font-black tracking-tight">Advisor Sign Up</h2>
          <p className="mb-5 text-sm text-blue-100/60">
            Create your account on <span className="font-semibold text-cyan-300">{BRAND.companyName} CRM</span>
          </p>

          <div className="space-y-3.5">
            <Field label="Full Name" icon={<User size={17} className="text-white/40" />}>
              <input type="text" placeholder="Your full name"
                value={form.name} onChange={set("name")}
                className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35 sm:text-base" />
            </Field>

            <Field label="Email Address" icon={<Mail size={17} className="text-white/40" />}>
              <input type="email" placeholder="you@example.com"
                value={form.email} onChange={set("email")}
                className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35 sm:text-base" />
            </Field>

            <Field label="Mobile Number" icon={<Phone size={17} className="text-white/40" />}>
              <input type="text" placeholder="10-digit mobile number"
                value={form.phone} onChange={set("phone")}
                className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35 sm:text-base" />
            </Field>

            <Field label="Password" icon={<Lock size={17} className="text-white/40" />}
              action={
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="ml-2 text-white/40 hover:text-white/70 transition">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }>
              <input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters"
                value={form.password} onChange={set("password")}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35 sm:text-base" />
            </Field>

            {/* Company selection */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-[13px] font-bold text-white/95 sm:text-sm">
                <Building2 size={16} className="text-white/50" />
                Select Your Insurance Companies
              </label>
              <p className="mb-2 text-xs text-blue-100/50">
                Select all companies you work with as an advisor
              </p>
              {loadingCo ? (
                <div className="text-sm text-white/50">Loading...</div>
              ) : companies.length === 0 ? (
                <div className="text-sm text-red-300">No companies available. Contact support: {BRAND.supportPhone}</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {companies.map((c) => {
                    const selected = form.companyIds.includes(c.id);
                    return (
                      <button key={c.id} type="button" onClick={() => toggleCompany(c.id)}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-all ${
                          selected
                            ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200"
                            : "border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:bg-white/10"
                        }`}>
                        <div className={`h-4 w-4 flex-shrink-0 rounded border-2 transition-all ${selected ? "border-cyan-400 bg-cyan-400" : "border-white/30"}`}>
                          {selected && (
                            <svg viewBox="0 0 12 10" fill="none" className="h-full w-full p-0.5">
                              <path d="M1 5l3.5 3.5L11 1" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {errorMsg}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="group mt-1 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-bold shadow-lg transition-all duration-300 hover:scale-[1.01] disabled:opacity-70 sm:h-14 sm:text-base">
              <span>{loading ? "Creating account..." : "Create My Account"}</span>
              <ArrowRight className="ml-3 transition-transform duration-300 group-hover:translate-x-1" size={20} />
            </button>

            {/* Powered by */}
            <p className="text-center text-[11px] text-white/35">
              By signing up you agree to use <strong className="text-white/55">{BRAND.companyName} CRM</strong> platform
            </p>
          </div>

          <div className="mt-4 text-center text-sm text-blue-100/60">
            Already have an account?{" "}
            <Link to="/" className="font-semibold text-cyan-400 transition hover:text-cyan-300">Login →</Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/30">
          © {new Date().getFullYear()} {BRAND.companyName} · {BRAND.tagline}
        </p>
      </div>
    </div>
  );
}

function Field({ label, icon, action, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-bold text-white/95 sm:text-sm">{label}</label>
      <div className="flex h-11 items-center rounded-2xl border border-white/12 bg-[#071b54]/90 px-3.5 shadow-inner sm:h-13">
        {icon && <span className="mr-2.5 flex-shrink-0">{icon}</span>}
        {children}
        {action}
      </div>
    </div>
  );
}

export default Signup;
