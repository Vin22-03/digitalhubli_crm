import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BRAND } from "../config/branding";
import logo from "../assets/logo.png";

const COMPANIES = [
  { name: "LIC of India", short: "LIC", active: true },
  { name: "TATA AIA Life Insurance", short: "TATA AIA", active: true },
  { name: "TATA AIG General Insurance", short: "TATA AIG", active: true },
  { name: "Star Health Insurance", short: "STAR", active: false },
  { name: "Manipal Cigna", short: "CIGNA", active: false },
  
];

const FEATURES = [
  { icon: "📋", title: "Ready-Made Templates", desc: "Pre-built WhatsApp templates for every plan — just select company, plan, age and send. No typing, no errors.", color: "#3b82f6" },
  { icon: "📊", title: "Plan-Wise Brochures", desc: "Professional HTML brochures for every insurance plan. Share instantly with clients via WhatsApp or email.", color: "#8b5cf6" },
  { icon: "🤖", title: "AI Chatbot Assistant", desc: "Smart chatbot that helps your clients understand plan details 24/7. You sell even while you sleep.", color: "#06b6d4" },
  { icon: "👥", title: "Lead & Contact CRM", desc: "Track every client interaction — calls, WhatsApp messages, meetings. Never miss a follow-up again.", color: "#10b981" },
  { icon: "🏢", title: "Multi-Company Support", desc: "Sell LIC, TATA AIA, TATA AIG, Star Health and more — all from one dashboard. One login, all companies.", color: "#f59e0b" },
  { icon: "📱", title: "Mobile First Design", desc: "Works perfectly on your phone. Manage leads, send templates, track clients — anywhere, anytime.", color: "#ef4444" },
];

const STEPS = [
  { num: "01", title: "Sign Up & Pay", desc: "Create your account and activate with ₹2,000/year. Instant access to your personal CRM workspace." },
  { num: "02", title: "Select Company & Plan", desc: "Choose from LIC, TATA AIA, TATA AIG and more. Pick the insurance plan that fits your client's age and need." },
  { num: "03", title: "Generate & Send", desc: "Auto-generated WhatsApp message with professional brochure. One tap to send via WhatsApp. Save as lead automatically." },
  { num: "04", title: "Track & Follow Up", desc: "Every interaction logged. Set reminders. Never lose a client. Watch your conversion rate grow." },
];

const TESTIMONIALS = [
  { name: "Rajesh Kumar", city: "Mumbai", role: "LIC Advisor", text: "digitalhubli CRM has transformed my daily workflow. I send 50+ personalized messages a day now — something I could never do manually." },
  { name: "Priya Sharma", city: "Delhi", role: "TATA AIG Advisor", text: "The ready-made templates save me 2 hours every day. My clients love the professional brochures. Best investment I've made." },
  { name: "Suresh Patil", city: "Bangalore", role: "Multi-company Advisor", text: "Managing LIC and TATA AIA from one dashboard is a game-changer. No more switching between apps. My team uses it too." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#1e293b", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        .land-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:14px;font-weight:700;font-size:15px;cursor:pointer;transition:all .25s;border:none;text-decoration:none}
        .land-btn-primary{background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;box-shadow:0 8px 30px rgba(37,99,235,.28)}
        .land-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(37,99,235,.35)}
        .land-btn-white{background:#fff;color:#1e293b;box-shadow:0 4px 20px rgba(0,0,0,.08)}
        .land-btn-white:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,.12)}
        .land-section{max-width:1200px;margin:0 auto;padding:0 24px}
        .land-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:99px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
        .glow-ring{position:absolute;border-radius:50%;filter:blur(80px);opacity:.15;pointer-events:none;z-index:0}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .7s ease both}
        .fade-up-d1{animation-delay:.1s}.fade-up-d2{animation-delay:.2s}.fade-up-d3{animation-delay:.3s}.fade-up-d4{animation-delay:.4s}
        @media(max-width:768px){
          .hero-grid{flex-direction:column!important;text-align:center}
          .hero-h{font-size:32px!important;line-height:1.15!important}
          .hero-sub{font-size:15px!important}
          .hero-stats{justify-content:center!important}
          .hero-btns{justify-content:center!important}
          .features-grid{grid-template-columns:1fr!important}
          .steps-grid{grid-template-columns:1fr 1fr!important}
          .pricing-card{max-width:100%!important}
          .testi-grid{grid-template-columns:1fr!important}
          .footer-grid{grid-template-columns:1fr!important;text-align:center}
          .nav-links{display:none!important}
          .hero-preview{display:none!important}
          .land-section{padding:0 16px!important}
          .company-bar{gap:10px!important}
          .cta-h{font-size:26px!important}
          .section-h{font-size:28px!important}
          .price-num{font-size:48px!important}
        }
        @media(max-width:480px){
          .steps-grid{grid-template-columns:1fr!important}
          .hero-h{font-size:28px!important}
          .nav-btns button:first-child{display:none!important}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "14px 0",
        background: scrolled ? "rgba(255,255,255,.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(37,99,235,.08)" : "none",
        transition: "all .35s",
      }}>
        <div className="land-section" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={logo} alt="digitalhubli" style={{ height: 38, borderRadius: 8 }} />
            <span style={{ fontSize: 22, fontWeight: 800, color: scrolled ? "#1e293b" : "#fff" }}>digitalhubli</span>
          </div>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["Features", "How it Works", "Pricing", "Testimonials"].map(t => (
              <a key={t} href={`#${t.toLowerCase().replace(/\s/g, "-")}`}
                style={{ fontSize: 14, fontWeight: 600, color: scrolled ? "#475569" : "rgba(255,255,255,.85)", textDecoration: "none", transition: "color .2s" }}>
                {t}
              </a>
            ))}
          </div>
          <div className="nav-btns" style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("/login")} className="land-btn" style={{
              padding: "10px 22px", borderRadius: 10, fontSize: 13,
              background: scrolled ? "transparent" : "rgba(255,255,255,.12)",
              color: scrolled ? "#1e293b" : "#fff",
              border: scrolled ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,.2)",
            }}>Login</button>
            <button onClick={() => navigate("/signup")} className="land-btn land-btn-primary" style={{ padding: "10px 22px", borderRadius: 10, fontSize: 13 }}>
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 40%, #1d4ed8 100%)",
        padding: "140px 0 100px",
        minHeight: "92vh",
        display: "flex", alignItems: "center",
      }}>
        <div className="glow-ring" style={{ width: 500, height: 500, background: "#3b82f6", top: -100, right: -100 }} />
        <div className="glow-ring" style={{ width: 400, height: 400, background: "#06b6d4", bottom: -80, left: -80 }} />
        <div className="glow-ring" style={{ width: 300, height: 300, background: "#8b5cf6", top: "40%", left: "30%" }} />

        <div className="land-section" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-grid" style={{ display: "flex", alignItems: "center", gap: 60 }}>
            <div style={{ flex: "1.2" }}>
              <div className="land-badge fade-up" style={{ background: "rgba(255,255,255,.1)", color: "#93c5fd", marginBottom: 24 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} /> Trusted by 500+ Advisors Across India
              </div>

              <h1 className="hero-h fade-up fade-up-d1" style={{
                fontSize: 54, fontWeight: 800, lineHeight: 1.1,
                color: "#fff", marginBottom: 24,
              }}>
                Sell Smarter.<br />
                <span style={{ background: "linear-gradient(135deg, #60a5fa, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Close Faster.
                </span>
              </h1>

              <p className="hero-sub fade-up fade-up-d2" style={{ fontSize: 19, lineHeight: 1.7, color: "rgba(255,255,255,.7)", maxWidth: 520, marginBottom: 36 }}>
                India's #1 CRM built exclusively for insurance advisors. Ready-made WhatsApp templates, professional brochures, AI chatbot — everything you need to grow your insurance business.
              </p>

              <div className="fade-up fade-up-d3 hero-btns" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button onClick={() => navigate("/signup")} className="land-btn land-btn-primary" style={{ fontSize: 16, padding: "16px 36px" }}>
                  Subscribe Now — ₹2,000/year →
                </button>
                <a href="#features" className="land-btn land-btn-white" style={{ fontSize: 16, padding: "16px 32px" }}>
                  See Features
                </a>
              </div>

              <div className="fade-up fade-up-d4" className="hero-stats" style={{ marginTop: 36, display: "flex", gap: 32, flexWrap: "wrap" }}>
                {[
                  { val: "500+", lbl: "Active Advisors" },
                  { val: "50K+", lbl: "Leads Generated" },
                  { val: "15+", lbl: "Insurance Plans" },
                ].map(s => (
                  <div key={s.lbl}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{s.val}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 500 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div className="fade-up fade-up-d2 hero-preview" style={{
                background: "rgba(255,255,255,.06)", backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, padding: 28,
                maxWidth: 380, width: "100%",
              }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Live Preview</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>WhatsApp Message Ready</div>
                  <div style={{ background: "#dcfce7", borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.6, color: "#166534" }}>
                    Dear <strong>Rajesh</strong>,<br /><br />
                    Thank you for your time. We are sharing <strong>Jeevan Anand Plan</strong> details...<br /><br />
                    <span style={{ color: "#15803d" }}>📎 Brochure attached</span><br />
                    <span style={{ color: "#15803d" }}>🤖 Chat with Shreya for details</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, background: "#22c55e", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
                    📲 Send via WhatsApp
                  </div>
                  <div style={{ flex: 1, background: "#3b82f6", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
                    💾 Save as Lead
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPANY LOGOS ── */}
      <section style={{ padding: "48px 0", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div className="land-section" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 20 }}>
            Templates available for India's top insurance companies
          </p>
          <div className="company-bar" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16 }}>
            {COMPANIES.map(c => (
              <div key={c.short} style={{
                background: c.active ? "#fff" : "#f8fafc", border: c.active ? "1px solid #e2e8f0" : "1px dashed #cbd5e1", borderRadius: 12,
                padding: "12px 24px", fontSize: 14, fontWeight: 700, color: c.active ? "#334155" : "#94a3b8",
                boxShadow: c.active ? "0 2px 8px rgba(0,0,0,.03)" : "none",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                {c.name}
                {!c.active && <span style={{ fontSize: 10, fontWeight: 600, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 99 }}>Coming Soon</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "100px 0", background: "#fff" }}>
        <div className="land-section">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="land-badge" style={{ background: "#eff6ff", color: "#2563eb", marginBottom: 16 }}>Features</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: "#0f172a", marginBottom: 16, className: "section-h" }}>
              Everything an Insurance Advisor Needs
            </h2>
            <p style={{ fontSize: 17, color: "#64748b", maxWidth: 600, margin: "0 auto" }}>
              Built by insurance professionals, for insurance professionals. Every feature designed to help you sell more policies with less effort.
            </p>
          </div>

          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: "#fafbfc", border: "1px solid #f1f5f9", borderRadius: 20,
                padding: 28, transition: "all .3s",
                cursor: "default",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 16px 40px ${f.color}15`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${f.color}12`, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, marginBottom: 18,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#64748b" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "100px 0", background: "linear-gradient(180deg, #f8fafc, #fff)" }}>
        <div className="land-section">
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="land-badge" style={{ background: "#f0fdf4", color: "#16a34a", marginBottom: 16 }}>How It Works</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: "#0f172a", marginBottom: 16, className: "section-h" }}>
              Start Selling in 4 Simple Steps
            </h2>
          </div>

          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ textAlign: "center", position: "relative" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#fff", fontSize: 20, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 18px", boxShadow: "0 8px 24px rgba(37,99,235,.25)",
                }}>{s.num}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{s.title}</h4>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "#64748b" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "100px 0", background: "#0f172a", position: "relative", overflow: "hidden" }}>
        <div className="glow-ring" style={{ width: 400, height: 400, background: "#2563eb", top: -100, right: "20%" }} />
        <div className="land-section" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div className="land-badge" style={{ background: "rgba(255,255,255,.08)", color: "#93c5fd", marginBottom: 16 }}>Pricing</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: "#fff", marginBottom: 16 }}>
              One Simple Plan. Everything Included.
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,.5)", maxWidth: 500, margin: "0 auto" }}>
              No hidden fees. No per-message charges. Unlimited templates, unlimited leads.
            </p>
          </div>

          <div className="pricing-card" style={{
            maxWidth: 480, margin: "0 auto",
            background: "linear-gradient(145deg, rgba(255,255,255,.08), rgba(255,255,255,.03))",
            border: "1px solid rgba(255,255,255,.1)", borderRadius: 28,
            padding: 40, textAlign: "center",
            backdropFilter: "blur(20px)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
              Yearly Plan
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 18, color: "rgba(255,255,255,.5)" }}>₹</span>
              <span style={{ fontSize: 64, fontWeight: 800, color: "#fff" }}>2,000</span>
              <span style={{ fontSize: 16, color: "rgba(255,255,255,.4)" }}>/year</span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", marginBottom: 32 }}>
              That's just ₹5.50/day — less than a cup of chai
            </p>

            <div style={{ textAlign: "left", marginBottom: 32 }}>
              {[
                "Unlimited WhatsApp templates",
                "All insurance company plans",
                "Professional HTML brochures",
                "AI chatbot for your clients",
                "Lead & contact management",
                "Activity log & follow-up reminders",
                "Multi-company dashboard",
                "Mobile-first — works on phone",
                "Priority WhatsApp support",
              ].map(f => (
                <div key={f} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                  <span style={{ color: "#4ade80", fontSize: 16 }}>✓</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,.7)" }}>{f}</span>
                </div>
              ))}
            </div>

            <button onClick={() => navigate("/signup")} className="land-btn" style={{
              width: "100%", justifyContent: "center",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#fff", fontSize: 17, padding: "16px 0",
              boxShadow: "0 8px 30px rgba(34,197,94,.3)",
            }}>
              Start Now — ₹2,000/year →
            </button>

            <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 14 }}>
              Instant activation after payment. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: "100px 0", background: "#fff" }}>
        <div className="land-section">
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div className="land-badge" style={{ background: "#fef3c7", color: "#92400e", marginBottom: 16 }}>Testimonials</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: "#0f172a" }}>
              Advisors Love digitalhubli
            </h2>
          </div>

          <div className="testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: "#fafbfc", border: "1px solid #f1f5f9", borderRadius: 20, padding: 28,
              }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: .2 }}>"</div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#475569", marginBottom: 20, fontStyle: "italic" }}>{t.text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    color: "#fff", fontSize: 16, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{t.role} · {t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: "80px 0",
        background: "linear-gradient(135deg, #1e40af, #1d4ed8, #2563eb)",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div className="glow-ring" style={{ width: 300, height: 300, background: "#60a5fa", top: -60, left: "10%" }} />
        <div className="land-section" style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 16 }}>
            Ready to Grow Your Insurance Business?
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,.6)", marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
            Join 500+ advisors across India who sell smarter with digitalhubli CRM.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/signup")} className="land-btn" style={{
              background: "#fff", color: "#1d4ed8", fontSize: 17, padding: "16px 40px",
              fontWeight: 800, boxShadow: "0 8px 30px rgba(0,0,0,.15)",
            }}>
              Create Your Account →
            </button>
            <a href={`https://wa.me/91${BRAND.supportPhone}?text=Hi, I want to know more about digitalhubli CRM`}
              target="_blank" rel="noreferrer" className="land-btn" style={{
              background: "rgba(255,255,255,.12)", color: "#fff", fontSize: 17, padding: "16px 40px",
              border: "1px solid rgba(255,255,255,.2)",
            }}>
              WhatsApp Us 📲
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "60px 0 30px", background: "#0f172a" }}>
        <div className="land-section">
          <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <img src={logo} alt="digitalhubli" style={{ height: 32, borderRadius: 6 }} />
                <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>digitalhubli</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,.4)", maxWidth: 280 }}>
                Smart Insurance CRM for Advisors. Manage leads, send templates, grow your business — all from one platform.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Product</h4>
              {["Features", "Pricing", "Testimonials"].map(t => (
                <a key={t} href={`#${t.toLowerCase()}`} style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,.35)", textDecoration: "none", marginBottom: 10 }}>{t}</a>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Companies</h4>
              {["LIC of India", "TATA AIA", "TATA AIG"].map(t => (
                <span key={t} style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,.35)", marginBottom: 10 }}>{t}</span>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Contact</h4>
              <a href={`tel:+91${BRAND.supportPhone}`} style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,.35)", textDecoration: "none", marginBottom: 10 }}>📞 {BRAND.supportPhone}</a>
              <a href={`https://wa.me/91${BRAND.supportPhone}`} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,.35)", textDecoration: "none", marginBottom: 10 }}>💬 WhatsApp</a>
              <span style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,.35)", marginBottom: 10 }}>📍 Hubballi, Karnataka</span>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.25)" }}>© 2026 {BRAND.companyName}. All rights reserved.</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.25)" }}>Built with ❤️ in Hubballi, India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}