// src/components/shared/PrivacyNotice.tsx
import { useState } from 'react';

interface Props { onAccept: () => void; dark?: boolean; }

export default function PrivacyNotice({ onAccept, dark = true }: Props) {
  const [ok, setOk] = useState(false);

  // ── Login-matched theme tokens ──
  const pageBg    = dark ? '#1e293b'                    : '#ffffff';
  const cardBg    = dark ? '#1e293b'                    : '#ffffff';
  const cardBdr   = dark ? 'rgba(56,197,134,0.16)'      : '#e5e7eb';
  const cardShdw  = dark ? 'none'                       : '0 4px 24px rgba(0,0,0,0.07)';
  const surfaceBg = dark ? 'rgba(255,255,255,0.04)'     : '#f9fafb';
  const surfaceBdr= dark ? 'rgba(255,255,255,0.07)'     : '#e5e7eb';
  const accentClr = dark ? '#38c586'                    : '#2d5016';
  const accentGrd = dark ? 'linear-gradient(135deg,#38c586,#2da86e)' : 'linear-gradient(135deg,#2d5016,#4a7a25)';
  const accentShdw= dark ? '0 4px 14px rgba(56,197,134,0.3)'        : '0 4px 14px rgba(45,80,22,0.25)';
  const textPri   = dark ? '#e2d9c8'                    : '#1e293b';
  const textSub   = dark ? 'rgba(226,217,200,0.45)'     : '#6b7280';
  const textDim   = dark ? 'rgba(226,217,200,0.28)'     : '#9ca3af';
  const warnBg    = dark ? 'rgba(234,179,8,0.07)'       : 'rgba(234,179,8,0.08)';
  const warnBdr   = dark ? 'rgba(234,179,8,0.18)'       : 'rgba(234,179,8,0.22)';
  const warnClr   = dark ? 'rgba(253,224,71,0.75)'      : 'rgba(120,80,0,0.8)';
  const cbBg      = dark ? 'rgba(255,255,255,0.06)'     : '#f9fafb';
  const cbBdr     = dark ? 'rgba(56,197,134,0.2)'       : '#e5e7eb';
  const focusShdw = dark ? '0 0 0 3px rgba(56,197,134,0.15)' : '0 0 0 3px rgba(45,80,22,0.1)';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .pn-root {
          position: fixed; inset: 0; z-index: 9999;
          background: ${pageBg};
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px;
          font-family: 'Nunito', sans-serif;
        }

        .pn-card {
          width: 100%; max-width: 520px;
          background: ${cardBg};
          border: 1px solid ${cardBdr}; border-radius: 16px; overflow: hidden;
          box-shadow: ${cardShdw};
          animation: pn-in .28s cubic-bezier(0.34,1.15,0.64,1);
        }
        @keyframes pn-in { from { transform: scale(0.97) translateY(10px); opacity: 0; } to { transform: none; opacity: 1; } }

        /* Accent top bar — matches login's card accent line pattern */
        .pn-card::before {
          content: ''; display: block; height: 3px;
          background: ${accentGrd};
        }

        /* Header */
        .pn-hd {
          padding: 22px 28px 18px;
          border-bottom: 1px solid ${cardBdr};
          display: flex; align-items: center; gap: 14px;
        }
        .pn-hd-icon {
          width: 44px; height: 44px; border-radius: 11px; flex-shrink: 0;
          background: ${dark ? 'rgba(56,197,134,0.1)' : 'rgba(45,80,22,0.07)'};
          border: 1px solid ${dark ? 'rgba(56,197,134,0.2)' : 'rgba(45,80,22,0.15)'};
          display: flex; align-items: center; justify-content: center; font-size: 1.15rem;
        }
        .pn-hd-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.05rem; font-weight: 900;
          letter-spacing: 0.07em; text-transform: uppercase; color: ${textPri};
          margin-bottom: 3px;
        }
        .pn-hd-sub {
          font-family: 'Nunito', sans-serif;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: ${textDim};
        }

        /* Items */
        .pn-items { padding: 18px 28px; display: flex; flex-direction: column; gap: 10px; }
        .pn-item {
          display: flex; align-items: flex-start; gap: 13px;
          padding: 14px 16px; border-radius: 10px;
          border: 1px solid ${surfaceBdr}; background: ${surfaceBg};
        }
        .pn-iico {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 0.95rem;
        }
        .pn-iico-blue {
          background: ${dark ? 'rgba(59,130,246,0.1)'  : 'rgba(59,130,246,0.08)'};
          border: 1px solid ${dark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)'};
        }
        .pn-iico-amber {
          background: ${dark ? 'rgba(234,179,8,0.1)'   : 'rgba(234,179,8,0.08)'};
          border: 1px solid ${dark ? 'rgba(234,179,8,0.2)' : 'rgba(234,179,8,0.15)'};
        }
        .pn-iico-green {
          background: ${dark ? 'rgba(56,197,134,0.1)'  : 'rgba(45,80,22,0.07)'};
          border: 1px solid ${dark ? 'rgba(56,197,134,0.2)' : 'rgba(45,80,22,0.15)'};
        }
        .pn-iti {
          font-family: 'Nunito', sans-serif;
          font-size: 0.72rem; font-weight: 900;
          letter-spacing: 0.08em; text-transform: uppercase; color: ${textPri}; margin-bottom: 4px;
        }
        .pn-itx {
          font-family: 'Nunito', sans-serif;
          font-size: 0.78rem; font-weight: 500; color: ${textSub}; line-height: 1.6;
        }

        /* Warning */
        .pn-warn {
          margin: 0 28px 4px;
          padding: 12px 16px; border-radius: 10px;
          background: ${warnBg}; border: 1px solid ${warnBdr};
          display: flex; align-items: flex-start; gap: 10px;
          font-family: 'Nunito', sans-serif; font-size: 0.76rem; font-weight: 600;
          color: ${warnClr}; line-height: 1.6;
        }

        /* Footer */
        .pn-ft { padding: 16px 28px 26px; display: flex; flex-direction: column; gap: 14px; }

        /* Checkbox row — matches login's input field style */
        .pn-cbr {
          display: flex; align-items: flex-start; gap: 12px; cursor: pointer;
          padding: 12px 14px; border-radius: 10px;
          border: 1px solid ${cardBdr};
          background: ${dark ? 'rgba(255,255,255,0.04)' : '#f9fafb'};
          transition: border-color 0.15s;
        }
        .pn-cbr:hover { border-color: ${dark ? 'rgba(56,197,134,0.3)' : 'rgba(45,80,22,0.25)'}; }
        .pn-cbr.checked { border-color: ${dark ? 'rgba(56,197,134,0.3)' : 'rgba(45,80,22,0.3)'}; box-shadow: ${focusShdw}; }
        .pn-cb {
          width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0; margin-top: 1px;
          border: 1px solid ${cbBdr}; background: ${cbBg};
          display: flex; align-items: center; justify-content: center;
          transition: background-color 0.15s, border-color 0.15s;
        }
        .pn-cb.on { background: ${accentClr}; border-color: ${accentClr}; }
        .pn-cbck {
          font-family: 'Nunito', sans-serif;
          font-size: 0.8rem; font-weight: 900; color: #fff;
        }
        .pn-cblbl {
          font-family: 'Nunito', sans-serif;
          font-size: 0.8rem; font-weight: 600; color: ${textSub}; line-height: 1.6; user-select: none;
        }

        /* Submit — matches login's .lp-submit exactly */
        .pn-btn {
          width: 100%; height: 52px; border-radius: 12px; border: none; cursor: pointer;
          font-family: 'Nunito', sans-serif;
          font-size: 1rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
          background: ${accentGrd}; color: #fff;
          box-shadow: ${accentShdw};
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: box-shadow 0.18s, transform 0.18s;
        }
        .pn-btn:hover:not(:disabled) {
          box-shadow: ${dark ? '0 10px 30px rgba(56,197,134,0.4)' : '0 10px 30px rgba(45,80,22,0.3)'};
          transform: translateY(-1px);
        }
        .pn-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="pn-root">
        <div className="pn-card">

          <div className="pn-hd">
            <div className="pn-hd-icon">🔒</div>
            <div>
              <div className="pn-hd-title">Privacy &amp; Camera Notice</div>
              <div className="pn-hd-sub">Please read before continuing</div>
            </div>
          </div>

          <div className="pn-items">
            {[
              { icon: '📷', cls: 'pn-iico-blue',  title: 'Camera Usage', text: 'This system uses your device camera to capture photos during attendance scanning for security and verification purposes.' },
              { icon: '💾', cls: 'pn-iico-amber', title: 'Data Storage',  text: 'Photos and attendance records are securely stored and only accessible by authorized school personnel.' },
              { icon: '✔',  cls: 'pn-iico-green', title: 'Your Rights',   text: 'All data is handled in compliance with data privacy regulations. Contact your school administrator for any concerns.' },
            ].map(it => (
              <div className="pn-item" key={it.title}>
                <div className={`pn-iico ${it.cls}`}>{it.icon}</div>
                <div>
                  <div className="pn-iti">{it.title}</div>
                  <div className="pn-itx">{it.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pn-warn">
            <span style={{ flexShrink: 0, opacity: 0.8, marginTop: '1px' }}>⚠️</span>
            <span>By continuing, you acknowledge that you have read and understood this notice, and consent to camera and data usage as described above.</span>
          </div>

          <div className="pn-ft">
            <label className={`pn-cbr${ok ? ' checked' : ''}`} onClick={() => setOk(v => !v)}>
              <div className={`pn-cb${ok ? ' on' : ''}`}>
                {ok && <span className="pn-cbck">✓</span>}
              </div>
              <span className="pn-cblbl">I have read and understood the privacy notice above.</span>
            </label>
            <button className="pn-btn" onClick={onAccept} disabled={!ok}>
              Continue to Dashboard →
            </button>
          </div>

        </div>
      </div>
    </>
  );
}