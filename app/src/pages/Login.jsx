import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { BRAND } from "../config/branding";
import { useNavigate, Link } from "react-router-dom";
import { startSubscriptionPayment } from "../lib/payment";
import logo from "../assets/logo-ih.png";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const brandName = BRAND.companyName || "digitalhubli";
  const tagline = BRAND.tagline || "Smart CRM for Insurance Growth";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pendingPayment, setPendingPayment] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const [paying, setPaying] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter OTP + new password
  const [forgotId, setForgotId] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPwd, setForgotNewPwd] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");

  useEffect(() => {
    if (user?.role === "ADMIN") navigate("/admin");
    else if (user?.role === "ADVISOR") navigate("/advisor");
  }, [user, navigate]);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setErrorMsg("Please enter your email / mobile and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setPendingPayment(false);

      const data = await login(identifier.trim(), password);
      if (data?.user?.role === "ADMIN") navigate("/admin");
      else navigate("/advisor");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Login failed. Please check your details.");
      setPendingPayment(err?.response?.data?.pendingPayment === true);
      setPendingUserId(err?.response?.data?.userId || null);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!forgotId.trim()) {
      setForgotError("Please enter your email or mobile.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotError("");
      setForgotSuccess("");

      const res = await fetch("/auth/forgot-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotId.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");

      setForgotSuccess("Verification code sent to your registered email.");
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || "Something went wrong.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotOtp.trim()) {
      setForgotError("Please enter the verification code.");
      return;
    }
    if (!forgotNewPwd) {
      setForgotError("Please enter a new password.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotError("");
      setForgotSuccess("");

      const res = await fetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: forgotId.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPwd,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");

      setForgotSuccess(data?.message || "Password reset successfully. You can now login.");
      setForgotStep(1);
      setForgotId("");
      setForgotOtp("");
      setForgotNewPwd("");

      // Auto-close modal after 2 seconds
      setTimeout(() => setShowForgot(false), 2500);
    } catch (err) {
      setForgotError(err.message || "Something went wrong.");
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgot(false);
    setForgotStep(1);
    setForgotId("");
    setForgotOtp("");
    setForgotNewPwd("");
    setForgotError("");
    setForgotSuccess("");
  };

  return (
    <>
      <style>{`
        html, body, #root {
          margin: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        * {
          box-sizing: border-box;
        }

        .login-screen {
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

        /* Enhanced Mesh Lines for SaaS Look */
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
          width: 380px;
          height: 380px;
          left: -50px;
          top: -50px;
          background: rgba(37, 99, 235, 0.25);
        }

        .orb.two {
          width: 440px;
          height: 440px;
          right: -100px;
          bottom: -100px;
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

        .left::before {
          content: "";
          position: absolute;
          width: 600px;
          height: 600px;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 50%;
          right: -220px;
          top: 80px;
        }

        .left::after {
          content: "";
          position: absolute;
          width: 380px;
          height: 380px;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 50%;
          right: -90px;
          top: 190px;
        }

        .brand {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 24px;
          margin-bottom: 50px; /* FIX: Clear gap below the logo */
        }

        .brand-logo {
          background: #ffffff;
          padding: 20px 32px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 24px 48px rgba(0, 0, 0, 0.2),
            inset 0 0 0 1px rgba(255, 255, 255, 1);
          width: auto; 
          min-width: 160px;
        }

        .brand-logo img {
          height: 85px; /* FIX: Massive Desktop Logo */
          width: auto;
          max-width: 320px;
          object-fit: contain;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: clamp(34px, 3.2vw, 48px);
          font-weight: 950;
          letter-spacing: -0.05em;
          line-height: 0.9;
        }

        .brand-tag {
          margin-top: 10px;
          font-size: 16px;
          color: #b8efff;
          font-weight: 700;
        }

        .hero {
          position: relative;
          z-index: 2;
          max-width: 640px;
        }

        .live-pill {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 15px;
          border-radius: 999px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.20);
          color: rgba(255,255,255,0.95);
          font-size: 13px;
          font-weight: 850;
          margin-bottom: 24px;
          backdrop-filter: blur(8px);
        }

        .green-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 6px rgba(74, 222, 128, 0.2);
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(48px, 5.7vw, 76px);
          line-height: 1;
          letter-spacing: -0.05em;
          font-weight: 950;
        }

        .hero h1 span {
          color: #b8efff;
        }

        .hero p {
          margin: 24px 0 32px;
          max-width: 520px;
          color: rgba(255,255,255,0.85);
          font-size: 18px;
          line-height: 1.6;
          font-weight: 400;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .chip {
          padding: 12px 18px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          font-size: 14px;
          font-weight: 700;
          color: white;
          backdrop-filter: blur(8px);
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
          padding: clamp(20px, 4vw, 62px);
        }

        .form-wrap {
          width: min(520px, 100%);
          position: relative;
          z-index: 20;
        }

        .mobile-brand {
          display: none;
        }

        .panel {
          width: 100%;
          padding: 48px;
          border-radius: 38px;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(255,255,255,1);
          box-shadow:
            0 40px 100px rgba(15,23,42,0.15),
            inset 0 1px 0 rgba(255,255,255,1);
          backdrop-filter: blur(30px);
        }

        .eyebrow {
          color: #0284c7;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .panel h2 {
          margin: 12px 0 8px;
          font-size: 42px;
          line-height: 1.1;
          letter-spacing: -0.05em;
          font-weight: 900;
          color: #0f172a;
        }

        .sub {
          margin: 0 0 32px;
          color: #475569;
          line-height: 1.55;
          font-size: 16px;
        }

        .field {
          margin-bottom: 18px;
        }

        .field label {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #334155;
        }

        .input {
          height: 60px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 18px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          transition: all 0.2s ease;
        }

        .input:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }

        .input span {
          font-size: 18px;
          opacity: 0.7;
        }

        .input input {
          flex: 1;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #0f172a;
          font-size: 16px;
          font-weight: 500;
        }

        .input input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .eye {
          border: 0;
          background: transparent;
          cursor: pointer;
          font-size: 18px;
          opacity: 0.6;
          transition: 0.2s;
        }
        
        .eye:hover {
          opacity: 1;
        }

        .forgot {
          text-align: right;
          margin: 4px 0 20px;
        }

        .forgot button {
          border: 0;
          background: transparent;
          cursor: pointer;
          color: #0284c7;
          font-weight: 700;
          font-size: 14px;
          transition: 0.2s;
        }
        
        .forgot button:hover {
          color: #0369a1;
          text-decoration: underline;
        }

        .error {
          margin-bottom: 16px;
          padding: 12px 16px;
          border-radius: 16px;
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.5;
        }

        .pending {
          color: #92400e;
          font-weight: 800;
          margin-top: 6px;
        }

        .login-btn {
          width: 100%;
          height: 64px;
          border: 0;
          border-radius: 22px;
          cursor: pointer;
          color: white;
          font-weight: 800;
          font-size: 17px;
          letter-spacing: 0.02em;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          box-shadow: 0 15px 30px rgba(37,99,235,0.25);
          transition: all 0.2s ease;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(37,99,235,0.35);
          background: linear-gradient(135deg, #0284c7, #1d4ed8);
        }

        .login-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .signup {
          margin-top: 24px;
          text-align: center;
          font-size: 15px;
          color: #64748b;
          font-weight: 500;
        }

        .signup a {
          color: #2563eb;
          font-weight: 800;
          text-decoration: none;
        }
        
        .signup a:hover {
          text-decoration: underline;
        }

        /* MODAL STYLES */
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(15,23,42,0.65);
          backdrop-filter: blur(10px);
        }

        .modal {
          width: min(460px, 100%);
          background: #ffffff;
          padding: 32px;
          border-radius: 32px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }

        .modal-head h3 {
          margin: 0 0 6px;
          font-size: 22px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.03em;
        }

        .modal-head p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
        }

        .modal .close {
          width: 36px;
          height: 36px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          color: #64748b;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .modal .close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .modal-input {
          width: 100%;
          height: 52px;
          padding: 0 16px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #f8fafc;
          font-size: 15px;
          font-weight: 500;
          color: #0f172a;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .modal-input:focus {
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
        }

        .modal-input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .modal .msg {
          margin-top: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.4;
        }

        .modal .msg.error {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
        }

        .modal .msg.success {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }

        .modal-actions .cancel {
          flex: 1;
          height: 48px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #ffffff;
          color: #475569;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-actions .cancel:hover {
          background: #f1f5f9;
        }

        .modal-actions .send {
          flex: 1.5;
          height: 48px;
          border: 0;
          border-radius: 14px;
          background: linear-gradient(135deg, #0ea5e9, #2563eb);
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(37,99,235,0.25);
          transition: all 0.2s;
        }

        .modal-actions .send:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(37,99,235,0.35);
        }

        .modal-actions .send:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* --- MOBILE SAAS OPTIMIZATION --- */
        @media (max-width: 900px) {
          .login-screen {
            grid-template-columns: 1fr;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            background: linear-gradient(135deg, #f0f7ff 0%, #dbeafe 100%); /* Richer mobile background */
          }

          .left {
            display: none;
          }

          .right {
            width: 100%;
            height: 100svh;
            padding: 16px;
            align-items: center;
          }

          .form-wrap {
            max-width: 480px;
          }

          /* FORCE LOGO TO CENTER AND MAKE IT MASSIVE */
          .mobile-brand {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            margin-bottom: 40px; /* Big gap before panel */
          }

          .mobile-brand img {
            background: #ffffff;
            padding: 20px 40px;
            border-radius: 28px;
            height: 100px; /* FIX: Massive Mobile Logo */
            width: auto;
            max-width: 90%;
            object-fit: contain;
            box-shadow: 
              0 20px 40px rgba(37, 99, 235, 0.15), 
              0 4px 12px rgba(37, 99, 235, 0.08),
              inset 0 0 0 1px rgba(255, 255, 255, 1);
          }

          .panel {
            padding: 40px 32px;
            border-radius: 36px;
            background: rgba(255, 255, 255, 0.88);
          }

          .panel h2 {
            font-size: 34px;
            text-align: center;
          }

          .eyebrow,
          .sub {
            text-align: center;
          }

          .sub {
            margin-bottom: 24px;
            font-size: 15px;
          }

          .input {
            height: 58px;
          }

          .login-btn {
            height: 60px;
          }

          /* Ensure orbs sit perfectly on mobile for a rich SaaS feel */
          .orb.one {
            width: 300px;
            height: 300px;
            left: -100px;
            top: 0px;
          }
          .orb.two {
            width: 300px;
            height: 300px;
            right: -50px;
            bottom: 0px;
          }
        }

        @media (max-width: 480px) {
          .right {
            padding: 16px;
          }

          .mobile-brand img {
            height: 85px; /* Still very large on small phones */
            padding: 16px 32px;
            border-radius: 24px;
          }

          .panel {
            padding: 32px 24px;
            border-radius: 32px;
          }

          .panel h2 {
            font-size: 30px;
          }

          .sub {
            font-size: 14px;
          }
        }

        @media (max-height: 720px) {
          .mobile-brand {
            margin-bottom: 24px;
          }
          
          .mobile-brand img {
            height: 75px;
            padding: 12px 24px;
          }

          .panel {
            padding: 24px;
          }

          .panel h2 {
            font-size: 28px;
            margin: 8px 0;
          }

          .sub {
            margin-bottom: 16px;
          }

          .field {
            margin-bottom: 12px;
          }

          .input {
            height: 52px;
          }

          .login-btn {
            height: 56px;
          }

          .modal {
            padding: 24px;
            border-radius: 24px;
          }

          .modal-head h3 {
            font-size: 19px;
          }

          .modal-input {
            height: 48px;
            border-radius: 14px;
            font-size: 14px;
          }

          .modal-actions .cancel,
          .modal-actions .send {
            height: 44px;
            font-size: 13px;
          }
        }
      `}</style>

      <main className="login-screen">
        {/* Dynamic SaaS background elements */}
        <div className="mesh" />
        <div className="orb one" />
        <div className="orb two" />

        <section className="left">
          <div className="brand">
            <div className="brand-logo">
              <img src={logo} alt={brandName} />
            </div>
            <div className="brand-text">
              <div className="brand-name">{brandName}</div>
              <div className="brand-tag">{tagline}</div>
            </div>
          </div>

          <div className="hero">
            <div className="live-pill">
              <span className="green-dot" />
              CRM workspace is ready
            </div>

            <h1>
              Convert every lead into a <span>clear next action.</span>
            </h1>

            <p>
              A premium insurance CRM to manage leads, contacts, WhatsApp templates,
              follow-ups and advisor performance — built for daily selling discipline.
            </p>

            <div className="chips">
              <div className="chip">💬 WhatsApp-first CRM</div>
              <div className="chip">📊 Smart follow-ups</div>
              <div className="chip">🔐 Secure access</div>
              <div className="chip">🚀 Built for growth</div>
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
            
            {/* MASSIVE MOBILE BRAND CONTAINER */}
            <div className="mobile-brand">
              <img src={logo} alt={brandName} />
            </div>

            <div className="panel">
              <div className="eyebrow">Welcome back</div>
              <h2>Login to dashboard</h2>
              <p className="sub">
                Access your leads, contacts, follow-ups and growth workspace.
              </p>

              <div className="field">
                <label>Email or Mobile</label>
                <div className="input">
                  <span>✉️</span>
                  <input
                    type="text"
                    placeholder="you@example.com or mobile"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="field">
                <label>Password</label>
                <div className="input">
                  <span>🔒</span>
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    autoComplete="current-password"
                  />
                  <button className="eye" type="button" onClick={() => setShowPwd((p) => !p)}>
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="forgot">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setForgotError("");
                    setForgotSuccess("");
                    setForgotId(identifier);
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {errorMsg && (
                <div className="error">
                  {errorMsg}
                </div>
              )}

              {pendingPayment && pendingUserId && (
                <div style={{ margin: "12px 0", padding: "16px", borderRadius: "16px", background: "#eff6ff", border: "1px solid #bfdbfe", textAlign: "center" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>Your account needs payment activation</p>
                  <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 14px" }}>Complete the payment to start using your CRM workspace.</p>
                  <button
                    onClick={() => {
                      setPaying(true);
                      setErrorMsg("");
                      startSubscriptionPayment({
                        userId: pendingUserId,
                        onSuccess: () => {
                          setPaying(false);
                          setPendingPayment(false);
                          setErrorMsg("");
                          handleLogin();
                        },
                        onError: (m) => {
                          setPaying(false);
                          setErrorMsg(m);
                        },
                      });
                    }}
                    disabled={paying}
                    style={{ width: "100%", height: "48px", border: 0, borderRadius: "14px", cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: "15px", background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 8px 24px rgba(34,197,94,0.25)" }}
                  >
                    {paying ? "Opening payment..." : "Pay & Activate Account →"}
                  </button>
                </div>
              )}

              <button className="login-btn" onClick={handleLogin} disabled={loading}>
                {loading ? "Logging in..." : "Login securely →"}
              </button>

              <div className="signup">
                New advisor? <Link to="/signup">Create account</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Forgot Password Modal — self-service OTP reset */}
      {showForgot && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeForgotModal()}
        >
          <div className="modal">
            <div className="modal-head">
              <div>
                <h3>{forgotStep === 1 ? "Forgot password?" : "Enter verification code"}</h3>
                <p>
                  {forgotStep === 1
                    ? "Enter your email or mobile. We'll send a verification code to your registered email."
                    : "Check your email for the 6-digit code. It expires in 15 minutes."}
                </p>
              </div>
              <button className="close" onClick={closeForgotModal}>×</button>
            </div>

            {forgotStep === 1 ? (
              <>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="Email or mobile"
                  value={forgotId}
                  onChange={(e) => setForgotId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleForgot()}
                />

                {forgotError && <div className="msg error">{forgotError}</div>}
                {forgotSuccess && <div className="msg success">{forgotSuccess}</div>}

                <div className="modal-actions">
                  <button className="cancel" onClick={closeForgotModal}>
                    Cancel
                  </button>
                  <button className="send" onClick={handleForgot} disabled={forgotLoading}>
                    {forgotLoading ? "Sending..." : "Send Code"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  className="modal-input"
                  type="text"
                  placeholder="6-digit verification code"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  style={{ letterSpacing: "6px", fontSize: "20px", fontWeight: 800, textAlign: "center" }}
                />

                <div style={{ position: "relative", marginTop: "10px" }}>
                  <input
                    className="modal-input"
                    type={showNewPwd ? "text" : "password"}
                    placeholder="New password (min 8 chars, Aa1@)"
                    value={forgotNewPwd}
                    onChange={(e) => setForgotNewPwd(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                    style={{ paddingRight: "48px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", cursor: "pointer", fontSize: "16px", opacity: 0.6 }}
                  >
                    {showNewPwd ? "🙈" : "👁️"}
                  </button>
                </div>

                {forgotError && <div className="msg error">{forgotError}</div>}
                {forgotSuccess && <div className="msg success">{forgotSuccess}</div>}

                <div className="modal-actions">
                  <button className="cancel" onClick={() => { setForgotStep(1); setForgotError(""); setForgotOtp(""); setForgotNewPwd(""); }}>
                    ← Back
                  </button>
                  <button className="send" onClick={handleResetPassword} disabled={forgotLoading}>
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}