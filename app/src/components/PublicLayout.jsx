import { Link, useNavigate } from "react-router-dom";
import { BRAND } from "../config/branding";
import logo from "../assets/logo.png";

const footerLinks = [
  { label: "Pricing", path: "/pricing" },
  { label: "Features", path: "/features" },
  { label: "FAQ", path: "/faq" },
  { label: "Security", path: "/security" },
  { label: "Contact", path: "/contact-us" },
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Terms", path: "/terms-and-conditions" },
  { label: "Refund Policy", path: "/refund-policy" },
  { label: "Cancellation Policy", path: "/cancellation-policy" },
];

function PublicLayout({
  badge = "digitalhubli",
  title,
  subtitle,
  children,
  updated = "30 May 2026",
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_34%),linear-gradient(180deg,#eff6ff_0%,#ffffff_42%,#f8fbff_100%)] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-blue-100/70 bg-white/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-slate-950 no-underline">
            <img src={logo} alt={BRAND.companyName} className="h-10 rounded-xl bg-white object-contain shadow-sm" />
            <div className="leading-tight">
              <p className="text-lg font-black tracking-tight">{BRAND.companyName}</p>
              <p className="hidden text-[11px] font-semibold text-slate-500 sm:block">{BRAND.tagline}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
            <Link className="hover:text-blue-700" to="/features">Features</Link>
            <Link className="hover:text-blue-700" to="/pricing">Pricing</Link>
            <Link className="hover:text-blue-700" to="/faq">FAQ</Link>
            <Link className="hover:text-blue-700" to="/contact-us">Contact</Link>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/login")} className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:bg-blue-50 sm:text-sm">
              Login
            </button>
            <button onClick={() => navigate("/signup")} className="rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2 text-xs font-black text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 sm:text-sm">
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-4 pb-8 pt-10 text-center sm:px-6 sm:pb-12 sm:pt-16 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {badge}
          </div>
          <h1 className="mx-auto max-w-4xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
              {subtitle}
            </p>
          ) : null}
          <p className="mt-4 text-xs font-semibold text-slate-400">Last updated: {updated}</p>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
          {children}
        </section>
      </main>

      <footer className="border-t border-blue-100 bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-[1.4fr_2fr_1fr]">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <img src={logo} alt={BRAND.companyName} className="h-9 rounded-lg bg-white object-contain" />
                <span className="text-xl font-black">{BRAND.companyName}</span>
              </div>
              <p className="max-w-sm text-sm leading-6 text-white/55">
                A mobile-first insurance CRM for advisors to manage leads, contacts, WhatsApp templates, plan pages, and follow-ups responsibly.
              </p>
            </div>

            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/45">Important Pages</p>
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                {footerLinks.map((item) => (
                  <Link key={item.path} to={item.path} className="text-white/55 no-underline transition hover:text-white">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/45">Support</p>
              <a className="mb-2 block text-sm text-white/60 hover:text-white" href={`tel:+91${BRAND.supportPhone}`}>+91 {BRAND.supportPhone}</a>
              <a className="block text-sm text-white/60 hover:text-white" href={`https://wa.me/91${BRAND.supportPhone}`} target="_blank" rel="noreferrer">WhatsApp Support</a>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} {BRAND.companyName}. All rights reserved.</span>
            <span>Built in Hubballi, Karnataka · India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
