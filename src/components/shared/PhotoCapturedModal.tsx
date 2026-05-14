// src/components/shared/PhotoCapturedModal.tsx
import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  open:          boolean;
  studentName:   string;
  onCaptureDone: (base64: string | null) => void;
  dark?:         boolean;
}

type Phase = 'starting' | 'message' | 'countdown' | 'flash' | 'done';

// ── Tuned for speed ──────────────────────────────────
const MESSAGE_DURATION = 800;   // was 2800 → show message briefly
const COUNTDOWN_FROM   = 1;     // was 3    → single tick then shoot
const FLASH_DURATION   = 300;   // was 600  → snappier flash
// ─────────────────────────────────────────────────────

export default function PhotoCapturedModal({ open, studentName, onCaptureDone, dark = true }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [phase,     setPhase]     = useState<Phase>('starting');
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [camError,  setCamError]  = useState(false);
  const [flash,     setFlash]     = useState(false);

  const clearTimer = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const doCapture = useCallback(() => {
    let dataUrl: string | null = null;
    if (videoRef.current && canvasRef.current) {
      const v = videoRef.current, c = canvasRef.current;
      c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
      const ctx = c.getContext('2d')!;
      ctx.translate(c.width, 0); ctx.scale(-1, 1);
      ctx.drawImage(v, 0, 0, c.width, c.height);
      dataUrl = c.toDataURL('image/jpeg', 0.82); // slightly lower quality = faster encode
    }
    setFlash(true); setPhase('flash');
    timerRef.current = setTimeout(() => {
      setFlash(false); setPhase('done');
      stopCamera(); onCaptureDone(dataUrl);
    }, FLASH_DURATION);
  }, [stopCamera, onCaptureDone]);

  const runCountdown = useCallback((remaining: number) => {
    setCountdown(remaining);
    if (remaining <= 0) { doCapture(); return; }
    timerRef.current = setTimeout(() => runCountdown(remaining - 1), 1000);
  }, [doCapture]);

  const startSequence = useCallback(async () => {
    setCamError(false); setPhase('starting');
    setCountdown(COUNTDOWN_FROM); setFlash(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // Lower resolution = faster camera init
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to actually have frames before starting sequence
        await new Promise<void>((resolve) => {
          const v = videoRef.current!;
          if (v.readyState >= 3) { resolve(); return; }
          v.oncanplay = () => resolve();
          v.play().catch(() => resolve());
        });
      }
      setPhase('message');
      // Go straight to countdown after brief message
      timerRef.current = setTimeout(() => {
        setPhase('countdown');
        runCountdown(COUNTDOWN_FROM);
      }, MESSAGE_DURATION);
    } catch {
      setCamError(true); setPhase('message');
      // Auto-skip after 1.5s if camera fails — don't block the flow
      timerRef.current = setTimeout(() => {
        stopCamera(); onCaptureDone(null);
      }, 1500);
    }
  }, [runCountdown, stopCamera, onCaptureDone]);

  useEffect(() => {
    if (open) {
      startSequence();
    } else {
      clearTimer(); stopCamera(); setPhase('starting');
      setCountdown(COUNTDOWN_FROM); setFlash(false); setCamError(false);
    }
    return () => { clearTimer(); stopCamera(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSkip = () => { clearTimer(); stopCamera(); onCaptureDone(null); };

  if (!open) return null;

  const firstName = studentName.split(' ')[0] || studentName;
  const R    = 28;
  const circ = 2 * Math.PI * R;

  const overlayBg   = dark ? 'rgba(30,41,59,0.85)'  : 'rgba(0,0,0,0.5)';
  const cardBg      = dark ? '#1e293b'               : '#ffffff';
  const cardBorder  = dark ? 'rgba(56,197,134,0.16)' : '#e5e7eb';
  const topbarBg    = dark ? '#1e293b'               : '#f9fafb';
  const topbarBdr   = dark ? 'rgba(56,197,134,0.16)' : '#e5e7eb';
  const infoBg      = dark ? '#1e293b'               : '#f9fafb';
  const surfaceBg   = dark ? 'rgba(255,255,255,0.06)': '#f3f4f6';
  const accentClr   = dark ? '#38c586'               : '#2d5016';
  const accentGrd   = dark ? 'linear-gradient(135deg,#38c586,#2da86e)' : 'linear-gradient(135deg,#2d5016,#4a7a25)';
  const accentShdw  = dark ? '0 4px 14px rgba(56,197,134,0.3)'         : '0 4px 14px rgba(45,80,22,0.25)';
  const textPri     = dark ? '#e2d9c8'               : '#1e293b';
  const textSub     = dark ? 'rgba(226,217,200,0.45)': '#6b7280';
  const textDim     = dark ? 'rgba(226,217,200,0.28)': '#9ca3af';
  const skipBg      = dark ? 'rgba(255,255,255,0.06)': 'rgba(0,0,0,0.05)';
  const skipBdr     = dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
  const errOverBg   = dark ? 'rgba(30,41,59,0.92)'   : 'rgba(255,255,255,0.92)';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .pcm-root {
          position: fixed; inset: 0; z-index: 9700;
          display: flex; align-items: center; justify-content: center;
          background: ${overlayBg}; backdrop-filter: blur(6px);
          font-family: 'Nunito', sans-serif; padding: 20px;
          animation: pcm-bg .2s ease;
        }
        @keyframes pcm-bg { from { opacity: 0; } to { opacity: 1; } }

        .pcm-card {
          width: 100%; max-width: 520px;
          background: ${cardBg};
          border-radius: 16px; overflow: hidden;
          border: 1px solid ${cardBorder};
          box-shadow: 0 24px 60px rgba(0,0,0,0.35);
          animation: pcm-card-in .2s cubic-bezier(0.34,1.2,0.64,1);
        }
        @keyframes pcm-card-in { from { transform: scale(0.95) translateY(16px); opacity: 0; } to { transform: none; opacity: 1; } }

        .pcm-hd {
          height: 60px; padding: 0 20px;
          background: ${topbarBg}; border-bottom: 1px solid ${topbarBdr};
          display: flex; align-items: center; justify-content: space-between;
          position: relative;
        }
        .pcm-hd::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: ${accentClr}; opacity: 0.2;
        }
        .pcm-hd-left { display: flex; align-items: center; gap: 10px; }
        .pcm-hd-icon {
          width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
          background: ${accentGrd};
          display: flex; align-items: center; justify-content: center; font-size: 1rem;
          box-shadow: ${accentShdw};
        }
        .pcm-hd-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: ${accentClr};
          animation: pcm-dot 1.8s ease-in-out infinite; flex-shrink: 0;
        }
        .pcm-hd-dot.idle { background: ${textDim}; animation: none; }
        @keyframes pcm-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .pcm-hd-title {
          font-family: 'Nunito', sans-serif;
          font-size: 1rem; font-weight: 900; color: ${textPri};
          text-transform: uppercase; letter-spacing: 0.07em; line-height: 1;
        }
        .pcm-hd-sub {
          font-family: 'Nunito', sans-serif;
          font-size: 0.64rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: ${textDim}; margin-top: 2px;
        }
        .pcm-skip {
          height: 32px; padding: 0 14px; border-radius: 8px;
          background: ${skipBg}; border: 1px solid ${skipBdr};
          color: ${textSub};
          font-family: 'Nunito', sans-serif; font-size: 0.75rem; font-weight: 800;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
          transition: background-color 0.15s, color 0.15s;
        }
        .pcm-skip:hover { background: ${surfaceBg}; color: ${textPri}; }

        .pcm-vf { position: relative; width: 100%; aspect-ratio: 4/3; background: #000; overflow: hidden; }
        .pcm-video { width: 100%; height: 100%; object-fit: cover; display: block; transform: scaleX(-1); }

        .pcm-corner { position: absolute; width: 20px; height: 20px; border-color: ${accentClr}; border-style: solid; opacity: 0.6; pointer-events: none; }
        .pcm-corner.tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
        .pcm-corner.tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; }
        .pcm-corner.bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; }
        .pcm-corner.br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }

        .pcm-flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; transition: opacity .04s; }
        .pcm-flash.on { opacity: 1; }

        .pcm-starting {
          position: absolute; inset: 0;
          background: ${dark ? '#1e293b' : '#f9fafb'};
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
        }
        .pcm-spin {
          width: 30px; height: 30px;
          border: 3px solid ${dark ? 'rgba(56,197,134,0.15)' : 'rgba(45,80,22,0.12)'}; border-top-color: ${accentClr};
          border-radius: 50%; animation: pcm-s .6s linear infinite;
        }
        @keyframes pcm-s { to { transform: rotate(360deg); } }
        .pcm-starting-txt {
          font-family: 'Nunito', sans-serif;
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: ${textDim};
        }

        .pcm-cam-err {
          position: absolute; inset: 0; background: ${errOverBg};
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 22px;
        }
        .pcm-cam-err-txt {
          font-family: 'Nunito', sans-serif;
          font-size: 0.78rem; font-weight: 600; color: ${textSub};
          text-align: center; max-width: 230px; line-height: 1.6;
        }

        .pcm-done-ov {
          position: absolute; inset: 0;
          background: ${dark ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.65)'};
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
          animation: pcm-fade .2s ease;
        }
        @keyframes pcm-fade { from { opacity: 0; } to { opacity: 1; } }
        .pcm-done-check {
          width: 54px; height: 54px; border-radius: 50%;
          background: ${accentGrd};
          display: flex; align-items: center; justify-content: center; font-size: 1.4rem; color: #fff;
          box-shadow: ${accentShdw};
          animation: pcm-pop .3s cubic-bezier(0.34,1.5,0.64,1);
        }
        @keyframes pcm-pop { from { transform: scale(0); } to { transform: scale(1); } }
        .pcm-done-txt {
          font-family: 'Nunito', sans-serif;
          font-size: 0.78rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
          color: ${textSub};
        }

        .pcm-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: ${dark ? 'rgba(56,197,134,0.1)' : 'rgba(45,80,22,0.08)'}; overflow: hidden; }
        .pcm-progress-fill { height: 100%; background: ${accentGrd}; transition: width .8s linear; }

        .pcm-info {
          padding: 16px 22px 18px;
          background: ${infoBg}; border-top: 1px solid ${cardBorder};
          min-height: 80px; display: flex; align-items: center; justify-content: center;
        }
        .pcm-msg {
          display: flex; flex-direction: column; align-items: center; gap: 5px; text-align: center;
          animation: pcm-msg-in .2s cubic-bezier(0.34,1.2,0.64,1);
        }
        @keyframes pcm-msg-in { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .pcm-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 12px; border-radius: 20px;
          background: ${dark ? 'rgba(56,197,134,0.1)' : 'rgba(45,80,22,0.07)'};
          border: 1px solid ${dark ? 'rgba(56,197,134,0.2)' : 'rgba(45,80,22,0.15)'};
          font-family: 'Nunito', sans-serif; font-size: 0.72rem; font-weight: 800;
          letter-spacing: 0.06em; text-transform: uppercase; color: ${accentClr};
        }
        .pcm-saved {
          font-family: 'Nunito', sans-serif;
          font-size: 0.78rem; font-weight: 600; color: ${textSub};
        }
        .pcm-saved strong { color: ${accentClr}; font-weight: 800; }
        .pcm-smile {
          font-family: 'Nunito', sans-serif;
          font-size: 1.05rem; font-weight: 900; color: ${textPri};
          letter-spacing: 0.02em; text-transform: uppercase; line-height: 1.2;
        }
        .pcm-smile em { font-style: normal; color: ${accentClr}; }
        .pcm-sub {
          font-family: 'Nunito', sans-serif;
          font-size: 0.7rem; font-weight: 600; color: ${textDim};
        }

        .pcm-cd {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          animation: pcm-msg-in .2s ease;
        }
        .pcm-ring { position: relative; width: 56px; height: 56px; }
        .pcm-ring-svg { width: 56px; height: 56px; transform: rotate(-90deg); }
        .pcm-ring-track { fill: none; stroke: ${dark ? 'rgba(56,197,134,0.1)' : 'rgba(45,80,22,0.1)'}; stroke-width: 4; }
        .pcm-ring-arc {
          fill: none; stroke: ${accentClr}; stroke-width: 4; stroke-linecap: round;
          transition: stroke-dashoffset .8s linear;
        }
        .pcm-ring-num {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          font-family: 'Nunito', sans-serif; font-size: 1.5rem; font-weight: 900; color: ${textPri};
        }
        .pcm-cd-lbl {
          font-family: 'Nunito', sans-serif;
          font-size: 0.75rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
          color: ${textSub};
        }
        .pcm-cd-name {
          font-family: 'Nunito', sans-serif;
          font-size: 0.7rem; font-weight: 600; color: ${textDim};
        }

        @media (max-width: 560px) {
          .pcm-root { padding: 0; align-items: flex-end; }
          .pcm-card { border-radius: 16px 16px 0 0; max-width: 100%; }
        }
      `}</style>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="pcm-root">
        <div className="pcm-card">

          {/* Header */}
          <div className="pcm-hd">
            <div className="pcm-hd-left">
              <div className="pcm-hd-icon">📷</div>
              <div className={`pcm-hd-dot${phase === 'starting' || camError ? ' idle' : ''}`} />
              <div>
                <div className="pcm-hd-title">
                  {camError ? 'Camera Error' : phase === 'starting' ? 'Starting Camera' : 'Live'}
                </div>
                <div className="pcm-hd-sub">ChildTrack Photo Capture</div>
              </div>
            </div>
            <button className="pcm-skip" onClick={handleSkip}>Skip</button>
          </div>

          {/* Viewfinder */}
          <div className="pcm-vf">
            <video ref={videoRef} className="pcm-video" playsInline muted />

            {(phase === 'message' || phase === 'countdown') && !camError && (
              <>
                <div className="pcm-corner tl" /><div className="pcm-corner tr" />
                <div className="pcm-corner bl" /><div className="pcm-corner br" />
              </>
            )}

            {phase === 'starting' && !camError && (
              <div className="pcm-starting">
                <div className="pcm-spin" />
                <span className="pcm-starting-txt">Starting camera…</span>
              </div>
            )}

            {camError && (
              <div className="pcm-cam-err">
                <span style={{ fontSize: '2rem', opacity: 0.4 }}>📵</span>
                <p className="pcm-cam-err-txt">Camera unavailable. Skipping photo…</p>
              </div>
            )}

            {phase === 'done' && (
              <div className="pcm-done-ov">
                <div className="pcm-done-check">✓</div>
                <span className="pcm-done-txt">Photo Saved</span>
              </div>
            )}

            <div className={`pcm-flash${flash ? ' on' : ''}`} />

            {phase === 'countdown' && (
              <div className="pcm-progress">
                <div className="pcm-progress-fill"
                  style={{ width: `${((COUNTDOWN_FROM - countdown) / COUNTDOWN_FROM) * 100}%` }} />
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="pcm-info">
            {(phase === 'message' || phase === 'starting') && !camError && (
              <div className="pcm-msg">
                <div className="pcm-chip">👤 {studentName}</div>
                <p className="pcm-saved">Attendance of <strong>{studentName}</strong> saved.</p>
                <p className="pcm-smile">Please <em>smile</em>! 😊</p>
              </div>
            )}

            {camError && (
              <div className="pcm-msg">
                <p className="pcm-saved">Attendance of <strong>{studentName}</strong> has been saved.</p>
                <p className="pcm-smile" style={{ color: textDim, fontSize: '1rem' }}>
                  Skipping photo…
                </p>
              </div>
            )}

            {phase === 'countdown' && (
              <div className="pcm-cd">
                <div className="pcm-ring">
                  <svg className="pcm-ring-svg" viewBox="0 0 64 64">
                    <circle className="pcm-ring-track" cx="32" cy="32" r={R} />
                    <circle
                      className="pcm-ring-arc"
                      cx="32" cy="32" r={R}
                      strokeDasharray={circ}
                      strokeDashoffset={circ * (countdown / COUNTDOWN_FROM)}
                    />
                  </svg>
                  <div className="pcm-ring-num">{countdown}</div>
                </div>
                <p className="pcm-cd-lbl">Get Ready!</p>
                <p className="pcm-cd-name">{studentName}</p>
              </div>
            )}

            {(phase === 'flash' || phase === 'done') && (
              <div className="pcm-msg">
                <p className="pcm-smile" style={{ color: accentClr }}>✓ Photo Captured!</p>
                <p className="pcm-sub">Have a great day, {firstName}!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}