import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BRAND } from "../config/branding";
import API from "../api/axios";
import logo from "../assets/logo-ih.png";

export default function Signup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const brandName = BRAND.companyName || "digitalhubli";
  const tagline = BRAND.tagline || "Smart CRM for Insurance Growth";

  const [companies, setCompanies] = useState([]);
  const [loadingCo, setLoadingCo] = useState(true);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", companyIds: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.role === "ADMIN") navigate("/admin");
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
    if (!form.name.trim()) return setErrorMsg("Full name is required.");
    if (!form.email.trim()) return setErrorMsg("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setErrorMsg("Please enter a valid email address.");
    if (!form.phone.trim()) return setErrorMsg("Mobile number is required.");
    if (!/^\d{10}$/.test(form.phone.trim())) return setErrorMsg("Mobile number must be exactly 10 digits.");
    if (!form.password) return setErrorMsg("Password is required.");
    if (form.password.length < 8) return setErrorMsg("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(form.password)) return setErrorMsg("Password needs at least 1 uppercase letter.");
    if (!/[a-z]/.test(form.password)) return setErrorMsg("Password needs at least 1 lowercase letter.");
    if (!/[0-9]/.test(form.password)) return setErrorMsg("Password needs at least 1 number.");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) return setErrorMsg("Password needs at least 1 special character (!@#$%^&*).");
    if (form.companyIds.length === 0) return setErrorMsg("Please select at least one insurance company.");

    try {
      setLoading(true);
      await API.post("/auth/signup", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        companyIds: form.companyIds,
      });
      setSuccess(true);
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* ABSOLUTE ZERO SCROLL LOCK */
        html, body, #root {
          margin: 0;
          width: 100%;
          height: 100%;
          overflow: hidden !important; 
          overscroll-behavior: none;
        }

        * {
          box-sizing: border-box;
        }

        .signup-screen {
          height: 100svh;
          width: 100%;
          overflow: hidden;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #0f172a;
          position: relative;
          background:
            radial-gradient(circle at 12% 18%, rgba(29, 78, 216, 0.35), transparent 26%),
            radial-gradient(circle at 82% 16%, rgba(14, 165, 233, 0.32), transparent 24%),
            radial-gradient(circle at 76% 82%, rgba(6, 182, 212, 0.28), transparent 28%),
            linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 42%, #eef8ff 100%);
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
        }

        .mesh {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(14, 165, 233, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.12) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }

        .orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(24px);
          opacity: 0.85;
          pointer-events: none;
          z-index: 0;
        }

        .orb.one {
          width: 380px; height: 380px;
          left: -50px; top: -50px;
          background: rgba(37, 99, 235, 0.25);
        }

        .orb.two {
          width: 440px; height: 440px;
          right: -100px; bottom: -100px;
          background: rgba(14, 165, 233, 0.25);
        }

        .left {
          position: relative;
          z-index: 1;
          height: 100svh;
          padding: clamp(30px, 4vw, 62px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background:
            linear-gradient(135deg, rgba(3, 58, 142, 0.98), rgba(2, 132, 199, 0.92)),
            radial-gradient(circle at 80% 30%, rgba(255,255,255,0.22), transparent 28%);
          color: white;
          overflow: hidden;
        }

        /* Group brand and hero to keep them aligned to the top */
        .left-content {
          display: flex;
          flex-direction: column;
          gap: 40px;
          margin-top: 2vh;
        }

        .brand {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .brand-logo {
          background: #ffffff;
          padding: 16px 28px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 1);
          min-width: 140px;
        }

        .brand-logo img {
          height: 70px; 
          width: auto;
          max-width: 250px;
          object-fit: contain;
        }

        .brand-name {
          font-size: clamp(32px, 3vw, 44px);
          font-weight: 950;
          letter-spacing: -0.05em;
          line-height: 0.9;
        }

        .brand-tag {
          margin-top: 8px;
          font-size: 15px;
          color: #b8efff;
          font-weight: 700;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(42px, 5vw, 68px);
          line-height: 1;
          letter-spacing: -0.05em;
          font-weight: 950;
        }

        .hero h1 span { color: #b8efff; }

        .hero p {
          margin: 20px 0 28px;
          max-width: 520px;
          color: rgba(255,255,255,0.85);
          font-size: 17px;
          line-height: 1.6;
        }

        .left-footer {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 16px;
          color: rgba(255,255,255,0.72);
          font-size: 13px;
          font-weight: 600;
        }

        .right {
          position: relative;
          z-index: 10;
          height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(16px, 3vw, 40px);
        }

        .form-wrap {
          width: min(560px, 100%);
          position: relative;
          z-index: 20;
        }

        .mobile-brand {
          display: none;
        }

        .panel {
          width: 100%;
          padding: 32px 40px;
          border-radius: 32px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(255,255,255,1);
          box-shadow: 0 40px 100px rgba(15,23,42,0.15), inset 0 1px 0 rgba(255,255,255,1);
          backdrop-filter: blur(30px);
        }

        .eyebrow {
          color: #0284c7;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .panel h2 {
          margin: 8px 0 6px;
          font-size: 36px;
          line-height: 1.1;
          letter-spacing: -0.05em;
          font-weight: 900;
          color: #0f172a;
        }

        .sub {
          margin: 0 0 24px;
          color: #475569;
          font-size: 15px;
        }

        /* FIXED 2-COLUMN INPUT GRID */
        .input-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 16px;
          margin-bottom: 16px;
          width: 100%;
        }

        .field {
          width: 100%;
          min-width: 0; /* CRITICAL FIX: prevents grid blowout */
        }

        .field label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .input {
          height: 52px;
          width: 100%; /* CRITICAL FIX: forces input to stay inside field */
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          transition: all 0.2s ease;
          min-width: 0; /* Ensures flex container shrinks */
        }

        .input:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }

        .input span { font-size: 16px; opacity: 0.7; flex-shrink: 0; }

        .input input {
          flex: 1; 
          min-width: 0; /* CRITICAL FIX: prevents text from pushing width */
          height: 100%; 
          border: 0; 
          outline: 0;
          background: transparent; 
          color: #0f172a; 
          font-size: 15px; 
          font-weight: 500;
        }
        .input input::placeholder { color: #94a3b8; font-weight: 400; }

        .eye {
          border: 0; background: transparent; cursor: pointer;
          font-size: 16px; opacity: 0.6; transition: 0.2s;
          flex-shrink: 0;
        }

        /* INTERNALLY SCROLLABLE COMPANY LIST */
        .companies-section {
          margin-bottom: 20px;
        }
        
        .companies-section label {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 800; text-transform: uppercase;
          color: #334155; margin-bottom: 8px;
        }

        .companies-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-height: 100px;
          overflow-y: auto;
          padding-right: 4px;
        }
        
        .companies-grid::-webkit-scrollbar { width: 4px; }
        .companies-grid::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .companies-grid::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

        .company-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: 0.2s;
        }

        .company-btn:hover { border-color: #cbd5e1; background: #ffffff; }

        .company-btn.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1d4ed8;
          box-shadow: 0 0 0 1px #3b82f6;
        }

        .check-box {
          width: 14px; height: 14px; border-radius: 4px;
          border: 2px solid #cbd5e1;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .company-btn.active .check-box {
          background: #3b82f6; border-color: #3b82f6;
        }

        .error {
          margin-bottom: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          font-size: 13px;
          font-weight: 500;
        }

        .login-btn {
          width: 100%;
          height: 56px;
          border: 0;
          border-radius: 18px;
          cursor: pointer;
          color: white;
          font-weight: 800;
          font-size: 16px;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          box-shadow: 0 10px 25px rgba(37,99,235,0.25);
          transition: all 0.2s ease;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(37,99,235,0.35);
        }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .footer-link {
          margin-top: 16px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }
        .footer-link a { color: #2563eb; font-weight: 800; text-decoration: none; }

        /* SUCCESS SCREEN MODAL */
        .success-wrap {
          display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        .success-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: #ecfdf5; border: 4px solid #d1fae5;
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; margin-bottom: 20px;
        }
        .success-wrap h2 { margin: 0 0 12px; font-size: 32px; font-weight: 900; color: #0f172a; }
        .success-wrap p { color: #475569; font-size: 16px; line-height: 1.5; margin: 0 0 20px; }
        .success-box {
          background: #fffbeb; border: 1px solid #fde68a; padding: 16px;
          border-radius: 16px; color: #92400e; font-size: 14px; font-weight: 500;
          margin-bottom: 24px; width: 100%;
        }

        /* --- MOBILE SAAS OPTIMIZATION --- */
        @media (max-width: 900px) {
          .signup-screen {
            grid-template-columns: 1fr;
            background: linear-gradient(135deg, #f0f7ff 0%, #dbeafe 100%);
          }
          .left { display: none; }
          .right { padding: 12px; }

          .mobile-brand {
            display: flex; justify-content: center; width: 100%;
            margin-bottom: 16px;
          }
          .mobile-brand img {
            background: #ffffff; padding: 12px 24px; border-radius: 20px;
            height: 60px;
            box-shadow: 0 10px 30px rgba(37,99,235,0.1);
          }

          .panel { padding: 24px; border-radius: 28px; }
          .panel h2 { font-size: 28px; text-align: center; margin-bottom: 4px; }
          .eyebrow, .sub { text-align: center; }
          .sub { margin-bottom: 16px; font-size: 14px; }

          .input-grid { 
            grid-template-columns: 1fr; 
            gap: 10px; 
            margin-bottom: 12px; 
          }
          .input { height: 46px; } 
          
          .companies-section { margin-bottom: 16px; }
          .companies-grid { max-height: 90px; } 
          
          .login-btn { height: 52px; font-size: 15px; }
          .footer-link { margin-top: 12px; font-size: 13px; }
        }
      `}</style>

      <main className="signup-screen">
        <div className="mesh" />
        <div className="orb one" />
        <div className="orb two" />

        <section className="left">
          <div className="left-content">
            <div className="brand">
              <div className="brand-logo">
                <img src={logo} alt={brandName} />
              </div>
              <div>
                <div className="brand-name">{brandName}</div>
                <div className="brand-tag">{tagline}</div>
              </div>
            </div>

            <div className="hero">
              <h1>Join India's top <span>advisors.</span></h1>
              <p>Create your premium CRM account to manage leads, automate follow-ups, and track your daily selling discipline effortlessly.</p>
            </div>
          </div>

          <div className="left-footer">
            <span>Digital insurance growth system</span>
            <span>•</span>
            <span>Powered by {brandName}</span>
          </div>
        </section>

        <section className="right">
          <div className="form-wrap">
            
            <div className="mobile-brand">
              <img src={logo} alt={brandName} />
            </div>

            <div className="panel">
              {success ? (
                <div className="success-wrap">
                  <div className="success-icon">✅</div>
                  <h2>Account Created!</h2>
                  <p>Your <strong>{brandName}</strong> account is ready. Complete your payment to activate your workspace.</p>
                  <div className="success-box">
                    Our team will contact you on <strong>{form.phone}</strong> or <strong>{form.email}</strong> with next steps.
                  </div>
                  <Link to="/login" className="login-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                    Return to Login
                  </Link>
                </div>
              ) : (
                <>
                  <div className="eyebrow">New Advisor</div>
                  <h2>Create account</h2>
                  <p className="sub">Register to access your dedicated CRM workspace.</p>

                  <div className="input-grid">
                    <div className="field">
                      <label>Full Name</label>
                      <div className="input">
                        <span>👤</span>
                        <input type="text" placeholder="Your name" value={form.name} onChange={set("name")} />
                      </div>
                    </div>
                    <div className="field">
                      <label>Email Address</label>
                      <div className="input">
                        <span>✉️</span>
                        <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
                      </div>
                    </div>
                    <div className="field">
                      <label>Mobile Number</label>
                      <div className="input">
                        <span>📱</span>
                        <input type="text" placeholder="10-digit number" value={form.phone} onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); setForm(f => ({...f, phone: v})); }} />
                      </div>
                    </div>
                    <div className="field">
                      <label>Password</label>
                      <div className="input" style={(() => {
                        const p = form.password;
                        if (!p) return {};
                        const allPass = p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p);
                        return allPass ? { borderColor: '#22c55e' } : { borderColor: '#f59e0b' };
                      })()}>
                        <span>🔒</span>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Min. 8 chars, Aa1@" 
                          value={form.password} 
                          onChange={set("password")} 
                          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                        <button className="eye" type="button" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {form.password && (
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {[
                            { ok: form.password.length >= 8, label: "8+ chars" },
                            { ok: /[A-Z]/.test(form.password), label: "Uppercase" },
                            { ok: /[a-z]/.test(form.password), label: "Lowercase" },
                            { ok: /[0-9]/.test(form.password), label: "Number" },
                            { ok: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password), label: "Special (!@#)" },
                          ].map((r) => (
                            <span key={r.label} style={{
                              fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px',
                              background: r.ok ? '#dcfce7' : '#fef3c7',
                              color: r.ok ? '#166534' : '#92400e',
                              transition: 'all 0.2s',
                            }}>
                              {r.ok ? "✓" : "○"} {r.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="companies-section">
                    <label>🏢 Select Insurance Companies</label>
                    {loadingCo ? (
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Loading...</div>
                    ) : (
                      <div className="companies-grid">
                        {companies.map((c) => {
                          const selected = form.companyIds.includes(c.id);
                          return (
                            <button 
                              key={c.id} 
                              type="button" 
                              onClick={() => toggleCompany(c.id)}
                              className={`company-btn ${selected ? 'active' : ''}`}
                            >
                              <div className="check-box">
                                {selected && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
                              </div>
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {errorMsg && <div className="error">{errorMsg}</div>}

                  <button className="login-btn" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Creating..." : "Create My Account →"}
                  </button>

                  <div className="footer-link">
                    Already have an account? <Link to="/login">Login here</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}