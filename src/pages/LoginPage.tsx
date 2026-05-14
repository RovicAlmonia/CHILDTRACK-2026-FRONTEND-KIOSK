// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

import logoDark  from '../assets/kop.png';
import logoLight from '../assets/lop.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [dark,     setDark]     = useState(() => localStorage.getItem('ct-theme') !== 'light');

  const toggleDark = () => {
    const n = !dark;
    setDark(n);
    localStorage.setItem('ct-theme', n ? 'dark' : 'light');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Please fill in both fields'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { username, password });
      login(data.token, data.teacher);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; }

    /* ── Smooth theme transition on everything except opacity ── */
    .lp-root, .lp-root * {
      transition:
        background-color 0.35s ease,
        border-color 0.35s ease,
        color 0.35s ease,
        box-shadow 0.35s ease;
    }
    /* Elements that need their own transition untouched */
    .lp-root .lp-submit { transition: box-shadow 0.18s, transform 0.18s, background-color 0.35s ease; }
    .lp-root .lp-spin   { transition: none; }
    .lp-root .lp-logo   { transition: opacity 0.35s ease; }

    /* ── Root ── */
    .lp-root {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Nunito', sans-serif;
      padding: 24px 16px;
      position: relative;
      overflow: hidden;
    }
    .lp-root.lp-dark  { background-color: #1e293b; }
    .lp-root.lp-light { background-color: #ffffff; }

    /* ── Card ── */
    .lp-card {
      width: 100%;
      max-width: 420px;
      padding: 48px 40px 40px;
      border-radius: 16px;
      position: relative;
    }
    .lp-dark  .lp-card {
      background-color: #1e293b;
      border: 1px solid rgba(56,197,134,0.16);
      box-shadow: none;
    }
    .lp-light .lp-card {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 24px rgba(0,0,0,0.07);
    }

    /* ── Theme toggle ── */
    .lp-theme-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      border: 1px solid;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      background: none;
    }
    .lp-dark  .lp-theme-btn { border-color: rgba(255,255,255,0.09); color: #64748b; }
    .lp-light .lp-theme-btn { border-color: rgba(0,0,0,0.08);       color: #6b7280; }
    .lp-dark  .lp-theme-btn:hover { background-color: rgba(56,197,134,0.12); color: #38c586; border-color: rgba(56,197,134,0.25); }
    .lp-light .lp-theme-btn:hover { background-color: rgba(45,80,22,0.06);   color: #2d5016; border-color: rgba(45,80,22,0.2); }

    /* ── Logo ── */
    .lp-logo-block {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: -30px;
      margin-bottom: -30px;
    }
    .lp-logo-wrap {
      width: 100%;
      max-width: 460px;
      height: 380px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      position: relative;
      margin-top: -45px;
      margin-bottom: -50px;
    }
    .lp-logo {
      width: 410px;
      height: auto;
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .lp-logo-dark  { opacity: 0; }
    .lp-logo-light { opacity: 0; }
    .lp-dark  .lp-logo-dark  { opacity: 1; }
    .lp-light .lp-logo-light { opacity: 1; }

    /* ── Section label ── */
    .lp-section-label {
      font-family: 'Nunito', sans-serif;
      font-size: 0.78rem;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 20px;
      margin-top: -40px;
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .lp-dark  .lp-section-label { color: rgba(226,217,200,0.3); }
    .lp-light .lp-section-label { color: #9ca3af; }
    .lp-section-label::before,
    .lp-section-label::after {
      content: '';
      flex: 1;
      height: 1px;
    }
    .lp-dark  .lp-section-label::before,
    .lp-dark  .lp-section-label::after { background-color: rgba(56,197,134,0.15); }
    .lp-light .lp-section-label::before,
    .lp-light .lp-section-label::after { background-color: #e5e7eb; }

    /* ── Fields ── */
    .lp-field { margin-bottom: 16px; }

    .lp-label {
      display: block;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 8px;
      font-family: 'Nunito', sans-serif;
    }
    .lp-dark  .lp-label { color: rgba(226,217,200,0.42); }
    .lp-light .lp-label { color: #6b7280; }

    .lp-input-wrap { position: relative; }

    .lp-input {
      width: 100%;
      height: 48px;
      padding: 0 14px;
      border-radius: 10px;
      font-size: 0.92rem;
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
      outline: none;
      box-sizing: border-box;
    }
    .lp-dark  .lp-input { background-color: rgba(255,255,255,0.06); border: 1px solid rgba(56,197,134,0.16); color: #e2d9c8; }
    .lp-light .lp-input { background-color: #f9fafb;                border: 1px solid #e5e7eb;              color: #1e293b; }
    .lp-dark  .lp-input::placeholder { color: rgba(226,217,200,0.2);  font-weight: 400; }
    .lp-light .lp-input::placeholder { color: #9ca3af; font-weight: 400; }
    .lp-dark  .lp-input:focus { border-color: #38c586; box-shadow: 0 0 0 3px rgba(56,197,134,0.15); background-color: rgba(255,255,255,0.09); }
    .lp-light .lp-input:focus { border-color: #2d5016; box-shadow: 0 0 0 3px rgba(45,80,22,0.1);    background-color: #ffffff; }
    .lp-input-pw { padding-right: 48px; }

    /* ── PW toggle ── */
    .lp-pw-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 4px;
      display: flex;
      align-items: center;
    }
    .lp-dark  .lp-pw-toggle { color: rgba(226,217,200,0.3); }
    .lp-light .lp-pw-toggle { color: #9ca3af; }
    .lp-dark  .lp-pw-toggle:hover { color: #38c586; }
    .lp-light .lp-pw-toggle:hover { color: #2d5016; }

    /* ── Error ── */
    .lp-error {
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 16px;
      line-height: 1.5;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .lp-dark  .lp-error { background-color: rgba(208,72,72,0.1);  border: 1px solid rgba(208,72,72,0.22);  color: #fca5a5; }
    .lp-light .lp-error { background-color: rgba(220,38,38,0.07); border: 1px solid rgba(220,38,38,0.18);  color: #dc2626; }
    .lp-error-close {
      margin-left: auto;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 0;
      flex-shrink: 0;
      line-height: 1;
    }
    .lp-dark  .lp-error-close { color: rgba(252,165,165,0.5); }
    .lp-light .lp-error-close { color: rgba(220,38,38,0.4); }
    .lp-dark  .lp-error-close:hover { color: #fca5a5; }
    .lp-light .lp-error-close:hover { color: #dc2626; }

    /* ── Submit ──
       Gradients can't transition, so we fake it with a pseudo overlay.
       background-color sits underneath; the gradient pseudo fades out on theme change. ── */
    .lp-submit {
      width: 100%;
      height: 52px;
      margin-top: 10px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-family: 'Nunito', sans-serif;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      position: relative;
      overflow: hidden;
    }
    .lp-dark  .lp-submit { background-color: #2da86e; box-shadow: 0 4px 14px rgba(56,197,134,0.3); }
    .lp-light .lp-submit { background-color: #3a6b1e; box-shadow: 0 4px 14px rgba(45,80,22,0.25); }
    .lp-submit::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
      pointer-events: none;
    }
    .lp-dark  .lp-submit:hover:not(:disabled) { box-shadow: 0 10px 30px rgba(56,197,134,0.4); transform: translateY(-1px); }
    .lp-light .lp-submit:hover:not(:disabled) { box-shadow: 0 10px 30px rgba(45,80,22,0.3);  transform: translateY(-1px); }
    .lp-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* ── Spinner ── */
    .lp-spin {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: lp-s 0.7s linear infinite;
    }
    @keyframes lp-s { to { transform: rotate(360deg); } }

    /* ── Footer ── */
    .lp-footer { text-align: center; margin-top: 24px; font-size: 0.8rem; }
    .lp-dark  .lp-footer { color: rgba(226,217,200,0.35); }
    .lp-light .lp-footer { color: #9ca3af; }
  `;

  return (
    <>
      <style>{CSS}</style>
      <div className={`lp-root ${dark ? 'lp-dark' : 'lp-light'}`}>
        <div className="lp-card">

          <button className="lp-theme-btn" onClick={toggleDark} title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? '☀️' : '🌙'}
          </button>

          <div className="lp-logo-block">
            <div className="lp-logo-wrap">
              <img src={logoDark}  alt="ChildTrack" className="lp-logo lp-logo-dark" />
              <img src={logoLight} alt=""           className="lp-logo lp-logo-light" aria-hidden="true" />
            </div>
          </div>

          <div className="lp-section-label">Teacher Sign In</div>

          {error && (
            <div className="lp-error">
              ⚠️ {error}
              <button className="lp-error-close" onClick={() => setError('')}>×</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-username">Username</label>
              <input
                id="lp-username"
                className="lp-input"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-password">Password</label>
              <div className="lp-input-wrap">
                <input
                  id="lp-password"
                  className="lp-input lp-input-pw"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="lp-pw-toggle"
                  onClick={() => setShowPw(p => !p)}
                  tabIndex={-1}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="lp-submit" disabled={loading}>
              {loading ? <span className="lp-spin" /> : '🔓 Sign In'}
            </button>
          </form>

          <div className="lp-footer" />
        </div>
      </div>
    </>
  );
}