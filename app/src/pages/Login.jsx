import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { BRAND } from "../config/branding";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo-ih.png";

/* ─── tiny icon components (no extra deps) ─── */
const IconMail    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 7 10 7 10-7"/></svg>;
const IconLock    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconEye     = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEyeOff  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const IconArrow   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IconX       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconShield  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const brandName = BRAND.companyName;
  const tagline   = BRAND.tagline;

  const [identifier, setIdentifier]         = useState("");
  const [password, setPassword]             = useState("");
  const [showPwd, setShowPwd]               = useState(false);
  const [loading, setLoading]               = useState(false);
  const [errorMsg, setErrorMsg]             = useState("");
  const [pendingPayment, setPendingPayment] = useState(false);

  const [showForgot, setShowForgot]         = useState(false);
  const [forgotId, setForgotId]             = useState("");
  const [forgotLoading, setForgotLoading]   = useState(false);
  const [forgotSuccess, setForgotSuccess]   = useState("");
  const [forgotError, setForgotError]       = useState("");

  useEffect(() => {
    if (user?.role === "ADMIN")   navigate("/admin");
    else if (user?.role === "ADVISOR") navigate("/advisor");
  }, [user, navigate]);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setErrorMsg("Please enter your email / mobile and password.");
      return;
    }
    try {
      setLoading(true); setErrorMsg(""); setPendingPayment(false);
      const data = await login(identifier.trim(), password);
      if (data?.user?.role === "ADMIN") navigate("/admin");
      else navigate("/advisor");
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Login failed.");
      setPendingPayment(err?.response?.data?.pendingPayment === true);
    } finally { setLoading(false); }
  };

  const handleForgot = async () => {
    if (!forgotId.trim()) { setForgotError("Please enter your email or mobile."); return; }
    try {
      setForgotLoading(true); setForgotError(""); setForgotSuccess("");
      const res  = await fetch("/auth/forgot-password-request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      setForgotSuccess(data?.message || "Request sent to admin.");
      setForgotId("");
    } catch (err) { setForgotError(err.message || "Something went wrong."); }
    finally { setForgotLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dh-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100svh; height: 100svh;
          overflow: hidden;
          background: #060818;
          color: #fff;
          display: flex;
          position: relative;
        }

        /* ── animated background ── */
        .dh-bg {
          position: absolute; inset: 0; overflow: hidden; z-index: 0;
        }
        .dh-bg::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 15% 10%, rgba(59,130,246,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 85% 80%, rgba(6,182,212,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(99,102,241,0.07) 0%, transparent 60%);
        }
        .dh-orb {
          position: absolute; border-radius: 50%;
          filter: blur(60px); opacity: 0.55;
          animation: orbFloat 8s ease-in-out infinite;
        }
        .dh-orb-1 { width: 340px; height: 340px; background: radial-gradient(circle, rgba(59,130,246,0.35), transparent 70%); top: -80px; left: -80px; animation-delay: 0s; }
        .dh-orb-2 { width: 280px; height: 280px; background: radial-gradient(circle, rgba(6,182,212,0.25), transparent 70%); bottom: -60px; right: -60px; animation-delay: -3s; }
        .dh-orb-3 { width: 200px; height: 200px; background: radial-gradient(circle, rgba(139,92,246,0.20), transparent 70%); top: 40%; left: 30%; animation-delay: -5s; }

        /* grid lines */
        .dh-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(20px, -15px) scale(1.05); }
          66%       { transform: translate(-10px, 10px) scale(0.96); }
        }

        /* ── layout ── */
        .dh-layout {
          position: relative; z-index: 1;
          display: flex; width: 100%; height: 100svh;
        }

        /* ── left hero panel (desktop only) ── */
        .dh-hero {
          display: none;
          flex: 1;
          flex-direction: column;
          justify-content: center;
          padding: 3rem 3rem 3rem 4rem;
          border-right: 1px solid rgba(255,255,255,0.06);
          background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.00) 100%);
          backdrop-filter: blur(2px);
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 1024px) {
          .dh-hero { display: flex; max-width: 520px; }
        }
        @media (min-width: 1280px) {
          .dh-hero { max-width: 580px; padding: 3rem 4rem 3rem 5rem; }
        }

        .dh-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(59,130,246,0.12);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 99px;
          padding: 6px 14px;
          font-size: 11px; font-weight: 600;
          color: rgba(147,197,253,0.9);
          letter-spacing: 0.08em; text-transform: uppercase;
          margin-bottom: 2rem;
        }
        .dh-hero-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 8px rgba(52,211,153,0.8);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.6; transform: scale(0.85); }
        }

        .dh-logo-wrap {
          display: inline-flex;
          background: rgba(255,255,255,0.96);
          border-radius: 22px;
          padding: 14px;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.12), 0 20px 60px rgba(59,130,246,0.22);
          margin-bottom: 2rem;
        }
        .dh-logo-wrap img { width: 72px; height: 72px; object-fit: contain; display: block; border-radius: 12px; }

        .dh-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.4rem, 3.5vw, 3.2rem);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: #fff;
          margin-bottom: 1.25rem;
        }
        .dh-hero-title span {
          background: linear-gradient(135deg, #60a5fa 0%, #38bdf8 50%, #67e8f9 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dh-divider {
          width: 44px; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg, #38bdf8, #3b82f6);
          margin-bottom: 1.5rem;
        }

        .dh-hero-desc {
          font-size: 15px; line-height: 1.75;
          color: rgba(186,230,255,0.65);
          max-width: 380px;
          margin-bottom: 2.5rem;
        }

        .dh-features {
          display: flex; flex-direction: column; gap: 12px;
        }
        .dh-feature {
          display: flex; align-items: center; gap: 12px;
          font-size: 13px; color: rgba(186,230,255,0.7);
        }
        .dh-feature-icon {
          width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
          background: rgba(59,130,246,0.12);
          border: 1px solid rgba(59,130,246,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #60a5fa;
        }

        /* ── right form panel ── */
        .dh-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          overflow-y: auto;
        }
        @media (min-width: 640px) { .dh-form-panel { padding: 2rem; } }
        @media (min-width: 1024px) { .dh-form-panel { padding: 3rem; } }

        .dh-form-box {
          width: 100%; max-width: 440px;
        }

        /* mobile-only logo header */
        .dh-mobile-header {
          display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem;
        }
        @media (min-width: 1024px) { .dh-mobile-header { display: none; } }

        .dh-mobile-logo {
          width: 62px; height: 62px; border-radius: 18px;
          background: rgba(255,255,255,0.96);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 12px 36px rgba(59,130,246,0.22);
          margin-bottom: 10px;
        }
        .dh-mobile-logo img { width: 44px; height: 44px; object-fit: contain; }

        .dh-mobile-brand {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800; letter-spacing: -0.02em;
        }
        .dh-mobile-tagline {
          font-size: 12px; color: rgba(147,197,253,0.65); margin-top: 3px;
        }

        /* card */
        .dh-card {
          background: linear-gradient(180deg, rgba(15,23,60,0.90) 0%, rgba(10,16,45,0.95) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2rem 1.75rem;
          box-shadow: 0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.08);
          backdrop-filter: blur(20px);
        }
        @media (min-width: 480px) { .dh-card { padding: 2.25rem 2rem; } }

        .dh-card-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.15));
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 99px; padding: 5px 12px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.07em;
          color: rgba(147,197,253,0.9);
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .dh-card-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.9rem, 5vw, 2.4rem);
          font-weight: 800; letter-spacing: -0.03em;
          line-height: 1.1; color: #fff;
          margin-bottom: 0.35rem;
        }
        .dh-card-subtitle {
          font-size: 14px; color: rgba(186,230,255,0.55);
          margin-bottom: 1.6rem; line-height: 1.5;
        }

        /* fields */
        .dh-field { margin-bottom: 1rem; }
        .dh-label {
          display: block; font-size: 12px; font-weight: 600;
          color: rgba(186,230,255,0.75); letter-spacing: 0.04em;
          text-transform: uppercase; margin-bottom: 7px;
        }
        .dh-input-wrap {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 0 14px;
          height: 50px;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .dh-input-wrap:focus-within {
          border-color: rgba(59,130,246,0.55);
          background: rgba(59,130,246,0.06);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .dh-input-icon { color: rgba(147,197,253,0.45); flex-shrink: 0; display: flex; }
        .dh-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #fff; font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 400; height: 100%;
        }
        .dh-input::placeholder { color: rgba(255,255,255,0.22); }
        .dh-eye-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(147,197,253,0.4); display: flex; padding: 4px;
          transition: color 0.15s;
        }
        .dh-eye-btn:hover { color: rgba(147,197,253,0.75); }

        /* forgot link */
        .dh-forgot-row {
          display: flex; justify-content: flex-end; margin-bottom: 0.85rem; margin-top: -0.25rem;
        }
        .dh-forgot-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgba(56,189,248,0.8);
          transition: color 0.15s;
        }
        .dh-forgot-btn:hover { color: #67e8f9; }

        /* error */
        .dh-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 10px 14px;
          font-size: 13px; color: rgba(252,165,165,0.9);
          margin-bottom: 0.85rem; line-height: 1.5;
        }
        .dh-error-pending {
          font-weight: 600; color: rgba(251,191,36,0.9);
          margin-top: 4px; font-size: 12px;
        }

        /* submit btn */
        .dh-submit {
          width: 100%; height: 52px;
          background: linear-gradient(135deg, #2563eb 0%, #0284c7 60%, #0891b2 100%);
          border: none; border-radius: 14px; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 600; color: #fff;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 8px 28px rgba(37,99,235,0.38), 0 0 0 1px rgba(255,255,255,0.08) inset;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          position: relative; overflow: hidden;
        }
        .dh-submit::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
        }
        .dh-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 36px rgba(37,99,235,0.48), 0 0 0 1px rgba(255,255,255,0.1) inset;
        }
        .dh-submit:active:not(:disabled) { transform: translateY(0); }
        .dh-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .dh-submit-arrow {
          transition: transform 0.2s;
          display: flex; align-items: center;
        }
        .dh-submit:hover:not(:disabled) .dh-submit-arrow { transform: translateX(3px); }

        /* signup link */
        .dh-signup-row {
          text-align: center; margin-top: 1.25rem;
          font-size: 13.5px; color: rgba(186,230,255,0.5);
        }
        .dh-signup-row a {
          color: rgba(56,189,248,0.85); font-weight: 600;
          text-decoration: none; transition: color 0.15s;
        }
        .dh-signup-row a:hover { color: #67e8f9; }

        /* card footer */
        .dh-card-footer {
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-size: 11.5px; color: rgba(255,255,255,0.28);
        }
        .dh-card-footer svg { opacity: 0.5; }

        /* ── modal overlay ── */
        .dh-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.25rem;
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .dh-modal {
          background: linear-gradient(180deg, #0d1845 0%, #080e2e 100%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 22px; width: 100%; max-width: 420px;
          padding: 1.75rem;
          box-shadow: 0 30px 90px rgba(0,0,0,0.6);
          animation: slideUp 0.22s ease;
        }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .dh-modal-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 1.4rem; gap: 12px;
        }
        .dh-modal-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .dh-modal-sub   { font-size: 13px; color: rgba(186,230,255,0.5); }
        .dh-modal-close {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; width: 32px; height: 32px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.5);
          transition: background 0.15s, color 0.15s;
        }
        .dh-modal-close:hover { background: rgba(255,255,255,0.12); color: #fff; }

        .dh-modal-field { margin-bottom: 1rem; }
        .dh-modal-label { display: block; font-size: 12px; font-weight: 600; color: rgba(186,230,255,0.7); letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 7px; }
        .dh-modal-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 12px 14px;
          color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .dh-modal-input:focus {
          border-color: rgba(59,130,246,0.5);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .dh-modal-input::placeholder { color: rgba(255,255,255,0.2); }

        .dh-modal-success {
          background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2);
          border-radius: 12px; padding: 10px 14px;
          font-size: 13px; color: rgba(110,231,183,0.9);
          margin-bottom: 1rem; line-height: 1.5;
        }
        .dh-modal-error {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 10px 14px;
          font-size: 13px; color: rgba(252,165,165,0.9);
          margin-bottom: 1rem; line-height: 1.5;
        }

        .dh-modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 0.5rem; }
        .dh-btn-cancel {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; height: 46px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.7);
          transition: background 0.15s;
        }
        .dh-btn-cancel:hover { background: rgba(255,255,255,0.1); }
        .dh-btn-send {
          background: linear-gradient(135deg, #2563eb, #0891b2);
          border: none; border-radius: 12px; height: 46px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; color: #fff;
          box-shadow: 0 6px 20px rgba(37,99,235,0.3);
          transition: opacity 0.15s, transform 0.15s;
        }
        .dh-btn-send:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .dh-btn-send:disabled { opacity: 0.6; cursor: not-allowed; }

        /* spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .dh-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        /* power strip — bottom of hero */
        .dh-power-strip {
          position: absolute; bottom: 2rem; left: 4rem; right: 3rem;
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; color: rgba(255,255,255,0.25);
        }
        @media (min-width: 1280px) { .dh-power-strip { left: 5rem; } }
        .dh-power-dot { width: 1px; height: 12px; background: rgba(255,255,255,0.15); }

        /* page-level fade in */
        @keyframes pageIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .dh-form-box { animation: pageIn 0.4s ease both; }
        .dh-hero > * { animation: pageIn 0.5s ease both; }
        .dh-hero > *:nth-child(2) { animation-delay: 0.05s; }
        .dh-hero > *:nth-child(3) { animation-delay: 0.1s; }
        .dh-hero > *:nth-child(4) { animation-delay: 0.15s; }
        .dh-hero > *:nth-child(5) { animation-delay: 0.2s; }
        .dh-hero > *:nth-child(6) { animation-delay: 0.25s; }

        /* ensure no body scroll bleeds through */
        html, body, #root { height: 100%; overflow: hidden; }
      `}</style>

      <div className="dh-root">
        {/* Background */}
        <div className="dh-bg">
          <div className="dh-grid" />
          <div className="dh-orb dh-orb-1" />
          <div className="dh-orb dh-orb-2" />
          <div className="dh-orb dh-orb-3" />
        </div>

        <div className="dh-layout">

          {/* ── LEFT HERO (desktop) ── */}
          <div className="dh-hero">
            <div className="dh-hero-badge">
              <span className="dh-hero-badge-dot" />
              Platform Live
            </div>

            <div className="dh-logo-wrap">
              <img src={logo} alt={brandName} />
            </div>

            <h1 className="dh-hero-title">
              Secure leads.<br />
              Build trust.<br />
              <span>Grow smarter.</span>
            </h1>

            <div className="dh-divider" />

            <p className="dh-hero-desc">
              India's premium CRM built exclusively for insurance advisors. Manage clients, follow-ups, templates and communication — all in one place.
            </p>

            <div className="dh-features">
              {[
                { icon: "📋", text: "Lead & contact management" },
                { icon: "💬", text: "WhatsApp template sharing" },
                { icon: "📊", text: "Performance analytics" },
              ].map((f) => (
                <div className="dh-feature" key={f.text}>
                  <div className="dh-feature-icon" style={{ fontSize: 14 }}>{f.icon}</div>
                  {f.text}
                </div>
              ))}
            </div>

            <div className="dh-power-strip">
              <IconShield />
              <span>Powered by {brandName}</span>
              <span className="dh-power-dot" />
              <span>{tagline}</span>
            </div>
          </div>

          {/* ── RIGHT FORM ── */}
          <div className="dh-form-panel">
            <div className="dh-form-box">

              {/* Mobile header */}
              <div className="dh-mobile-header">
                <div className="dh-mobile-logo">
                  <img src={logo} alt={brandName} />
                </div>
                <div className="dh-mobile-brand">{brandName}</div>
                <div className="dh-mobile-tagline">{tagline}</div>
              </div>

              {/* Card */}
              <div className="dh-card">
                <div className="dh-card-eyebrow">
                  <span className="dh-hero-badge-dot" style={{ width: 6, height: 6 }} />
                  Welcome back
                </div>
                <h2 className="dh-card-title">Login</h2>
                <p className="dh-card-subtitle">Email or mobile · Your choice</p>

                {/* Identifier */}
                <div className="dh-field">
                  <label className="dh-label">Email or Mobile</label>
                  <div className="dh-input-wrap">
                    <span className="dh-input-icon"><IconMail /></span>
                    <input
                      className="dh-input"
                      type="text"
                      placeholder="you@example.com or 9XXXXXXXXX"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="dh-field">
                  <label className="dh-label">Password</label>
                  <div className="dh-input-wrap">
                    <span className="dh-input-icon"><IconLock /></span>
                    <input
                      className="dh-input"
                      type={showPwd ? "text" : "password"}
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      autoComplete="current-password"
                    />
                    <button className="dh-eye-btn" type="button" onClick={() => setShowPwd((p) => !p)}>
                      {showPwd ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>

                {/* Forgot */}
                <div className="dh-forgot-row">
                  <button className="dh-forgot-btn" type="button"
                    onClick={() => { setShowForgot(true); setForgotError(""); setForgotSuccess(""); setForgotId(identifier); }}>
                    Forgot password?
                  </button>
                </div>

                {/* Error */}
                {errorMsg && (
                  <div className="dh-error">
                    {errorMsg}
                    {pendingPayment && <div className="dh-error-pending">⚠ Account pending payment activation.</div>}
                  </div>
                )}

                {/* Submit */}
                <button className="dh-submit" onClick={handleLogin} disabled={loading}>
                  {loading
                    ? <><span className="dh-spinner" /> Logging in…</>
                    : <><span>Login to Dashboard</span><span className="dh-submit-arrow"><IconArrow /></span></>
                  }
                </button>

                {/* Signup link */}
                <div className="dh-signup-row">
                  New advisor?{" "}
                  <Link to="/signup">Create your account →</Link>
                </div>

                {/* Footer */}
                <div className="dh-card-footer">
                  <IconShield />
                  {brandName} · {tagline}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgot && (
        <div className="dh-overlay" onClick={(e) => e.target === e.currentTarget && setShowForgot(false)}>
          <div className="dh-modal">
            <div className="dh-modal-header">
              <div>
                <div className="dh-modal-title">Forgot Password</div>
                <div className="dh-modal-sub">We'll send a reset request to the admin</div>
              </div>
              <button className="dh-modal-close" onClick={() => setShowForgot(false)}><IconX /></button>
            </div>

            <div className="dh-modal-field">
              <label className="dh-modal-label">Email or Mobile</label>
              <input className="dh-modal-input" type="text"
                placeholder="Enter your email or mobile"
                value={forgotId}
                onChange={(e) => setForgotId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleForgot()}
              />
            </div>

            {forgotError   && <div className="dh-modal-error">{forgotError}</div>}
            {forgotSuccess && <div className="dh-modal-success">{forgotSuccess}</div>}

            <div className="dh-modal-actions">
              <button className="dh-btn-cancel" onClick={() => setShowForgot(false)}>Cancel</button>
              <button className="dh-btn-send" onClick={handleForgot} disabled={forgotLoading}>
                {forgotLoading ? <span className="dh-spinner" /> : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
