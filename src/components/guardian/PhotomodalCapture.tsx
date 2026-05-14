// src/components/shared/PhotoCapturedModal.tsx
import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  open:          boolean;
  studentName:   string;
  onCaptureDone: (base64: string | null) => void;
  dark?:         boolean;
}

type Phase = 'starting' | 'message' | 'countdown' | 'flash' | 'done';

const MESSAGE_DURATION = 2800;
const COUNTDOWN_FROM   = 3;
const FLASH_DURATION   = 600;

export default function PhotoCapturedModal({ open, studentName, onCaptureDone, dark = true }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [phase,     setPhase]     = useState<Phase>('starting');
  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);
  const [camError,  setCamError]  = useState(false);
  const [flash,     setFlash]     = useState(false);

  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };

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
      dataUrl = c.toDataURL('image/jpeg', 0.92);
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
    setCamError(false); setPhase('starting'); setCountdown(COUNTDOWN_FROM); setFlash(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setPhase('message');
      timerRef.current = setTimeout(() => { setPhase('countdown'); runCountdown(COUNTDOWN_FROM); }, MESSAGE_DURATION);
    } catch {
      setCamError(true); setPhase('message');
    }
  }, [runCountdown]);

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

  const firstName     = studentName.split(' ')[0] || studentName;
  const R             = 24;
  const circumference = 2 * Math.PI * R;
  const dashOffset    = circumference * (countdown / COUNTDOWN_FROM);

  // ── Login-matched theme tokens ──
  const overlayBg    = dark ? 'rgba(30,41,59,0.85)'              : 'rgba(0,0,0,0.45)';
  const cardBg       = dark ? '#1e293b'                           : '#ffffff';
  const cardBorder   = dark ? 'rgba(56,197,134,0.16)'            : '#e5e7eb';
  const headerBg     = dark ? '#1e293b'                           : '#f9fafb';
  const headerBorder = dark ? 'rgba(56,197,134,0.16)'            : '#e5e7eb';
  const infoBg       = dark ? '#1e293b'                           : '#f9fafb';
  const surfaceBg    = dark ? 'rgba(255,255,255,0.06)'           : 'rgba(0,0,0,0.04)';
  const vfStartBg    = dark ? '#1e293b'                           : '#f3f4f6';
  const errOverBg    = dark ? 'rgba(30,41,59,0.92)'              : 'rgba(255,255,255,0.93)';
  const doneOverBg   = dark ? 'rgba(30,41,59,0.6)'               : 'rgba(255,255,255,0.7)';
  const accentClr    = dark ? '#38c586'                           : '#2d5016';
  const accentGrd    = dark ? 'linear-gradient(135deg,#38c586,#2da86e)' : 'linear-gradient(135deg,#2d5016,#4a7a25)';
  const accentShdw   = dark ? '0 4px 14px rgba(56,197,134,0.3)' : '0 4px 14px rgba(45,80,22,0.25)';
  const accentTrack  = dark ? 'rgba(56,197,134,0.1)'            : 'rgba(45,80,22,0.1)';
  const accentCorner = dark ? 'rgba(56,197,134,0.6)'            : 'rgba(45,80,22,0.5)';
  const textPri      = dark ? '#e2d9c8'                           : '#1e293b';
  const textSub      = dark ? 'rgba(226,217,200,0.45)'           : '#6b7280';
  const textDim      = dark ? 'rgba(226,217,200,0.28)'           : '#9ca3af';
  const textFaint    = dark ? 'rgba(226,217,200,0.2)'            : '#d1d5db';
  const dotIdle      = dark ? 'rgba(226,217,200,0.2)'            : '#d1d5db';
  const skipBg       = dark ? 'rgba(255,255,255,0.06)'           : 'rgba(0,0,0,0.04)';
  const skipBdr      = dark ? 'rgba(255,255,255,0.09)'           : '#e5e7eb';
  const spinTrack    = dark ? 'rgba(56,197,134,0.15)'            : 'rgba(45,80,22,0.12)';
  const retryBg      = dark ? 'rgba(56,197,134,0.15)'            : 'rgba(45,80,22,0.07)';
  const retryBdr     = dark ? 'rgba(56,197,134,0.25)'            : 'rgba(45,80,22,0.2)';
  const progressBg   = dark ? 'rgba(56,197,134,0.1)'            : 'rgba(45,80,22,0.08)';

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; }

    .pcm-root {
      position: fixed; inset: 0; z-index: 9700;
      display: flex; align-items: center; justify-content: center;
      background: ${overlayBg}; backdrop-filter: blur(5px);
      font-family: 'Nunito', sans-serif; padding: 20px;
      animation: pcm-in 0.2s ease;
    }
    @keyframes pcm-in { from { opacity: 0; } to { opacity: 1; } }

    .pcm-card {
      width: 100%; max-width: 500px;
      background: ${cardBg};
      border-radius: 16px; overflow: hidden;
      border: 1px solid ${cardBorder};
      box-shadow: 0 24px 60px rgba(0,0,0,0.4);
      animation: pcm-up 0.28s cubic-bezier(0.34,1.2,0.64,1);
    }
    @keyframes pcm-up { from { transform: translateY(16px) scale(0.97); opacity: 0; } to { transform: none; opacity: 1; } }

    /* ── Header ── */
    .pcm-header {
      height: 56px; padding: 0 18px;
      display: flex; align-items: center; justify-content: space-between;
      background: ${headerBg}; border-bottom: 1px solid ${headerBorder};
      position: relative;
    }
    .pcm-header::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
      background: ${accentClr}; opacity: 0.2;
    }
    .pcm-header-left { display: flex; align-items: center; gap: 10px; }

    /* Live dot — kept from original */
    .pcm-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .pcm-dot-live { background: ${accentClr}; animation: pcm-blink 1.8s ease-in-out infinite; }
    .pcm-dot-idle { background: ${dotIdle}; }
    @keyframes pcm-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }

    .pcm-header-title {
      font-family: 'Nunito', sans-serif;
      font-size: 0.95rem; font-weight: 900;
      color: ${textPri}; text-transform: uppercase; letter-spacing: 0.07em; line-height: 1;
    }
    .pcm-header-sub {
      font-family: 'Nunito', sans-serif;
      font-size: 0.64rem; font-weight: 700;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: ${textDim}; margin-top: 2px;
    }
    .pcm-skip {
      height: 30px; padding: 0 13px; border-radius: 8px;
      font-family: 'Nunito', sans-serif; font-size: 0.72rem; font-weight: 800;
      letter-spacing: 0.06em; text-transform: uppercase;
      background: ${skipBg}; border: 1px solid ${skipBdr};
      color: ${textSub}; cursor: pointer;
      transition: background-color 0.15s, color 0.15s;
    }
    .pcm-skip:hover { background: ${surfaceBg}; color: ${textPri}; }

    /* ── Viewfinder ── */
    .pcm-vf { position: relative; width: 100%; aspect-ratio: 4/3; background: #000; overflow: hidden; }
    .pcm-video { width: 100%; height: 100%; object-fit: cover; display: block; transform: scaleX(-1); }

    /* Corner brackets */
    .pcm-corner { position: absolute; width: 18px; height: 18px; border-color: ${accentCorner}; border-style: solid; pointer-events: none; }
    .pcm-corner-tl { top: 10px; left: 10px; border-width: 2px 0 0 2px; border-radius: 3px 0 0 0; }
    .pcm-corner-tr { top: 10px; right: 10px; border-width: 2px 2px 0 0; border-radius: 0 3px 0 0; }
    .pcm-corner-bl { bottom: 10px; left: 10px; border-width: 0 0 2px 2px; border-radius: 0 0 0 3px; }
    .pcm-corner-br { bottom: 10px; right: 10px; border-width: 0 2px 2px 0; border-radius: 0 0 3px 0; }

    /* Flash */
    .pcm-flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; transition: opacity 0.05s; }
    .pcm-flash-on { opacity: 1; }

    /* Starting overlay */
    .pcm-overlay-center {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
      background: ${vfStartBg};
    }
    .pcm-spin {
      width: 28px; height: 28px;
      border: 2.5px solid ${spinTrack}; border-top-color: ${accentClr};
      border-radius: 50%; animation: pcm-s 0.75s linear infinite;
    }
    @keyframes pcm-s { to { transform: rotate(360deg); } }
    .pcm-overlay-text {
      font-family: 'Nunito', sans-serif;
      font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
      color: ${textDim};
    }

    /* Camera error overlay */
    .pcm-err-overlay {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 20px;
      background: ${errOverBg};
    }
    .pcm-err-text {
      font-family: 'Nunito', sans-serif;
      font-size: 0.78rem; font-weight: 600; color: ${textSub};
      text-align: center; max-width: 240px; line-height: 1.6;
    }
    .pcm-retry {
      height: 34px; padding: 0 18px; border-radius: 8px;
      font-family: 'Nunito', sans-serif; font-size: 0.75rem; font-weight: 800;
      letter-spacing: 0.06em; text-transform: uppercase;
      background: ${retryBg}; border: 1px solid ${retryBdr};
      color: ${accentClr}; cursor: pointer; transition: background-color 0.15s;
    }
    .pcm-retry:hover { background: ${dark ? 'rgba(56,197,134,0.25)' : 'rgba(45,80,22,0.14)'}; }

    /* Done overlay */
    .pcm-done-overlay {
      position: absolute; inset: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
      background: ${doneOverBg}; animation: pcm-in 0.2s ease;
    }
    .pcm-check {
      width: 48px; height: 48px; border-radius: 50%;
      background: ${accentGrd};
      display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: #fff;
      animation: pcm-pop 0.35s cubic-bezier(0.34,1.5,0.64,1);
      box-shadow: ${accentShdw};
    }
    @keyframes pcm-pop { from { transform: scale(0); } to { transform: scale(1); } }
    .pcm-check-text {
      font-family: 'Nunito', sans-serif;
      font-size: 0.76rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
      color: ${textSub};
    }

    /* Progress bar */
    .pcm-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: ${progressBg}; }
    .pcm-progress-fill { height: 100%; background: ${accentGrd}; transition: width 0.9s linear; }

    /* ── Info panel ── */
    .pcm-info {
      padding: 18px 20px; background: ${infoBg};
      border-top: 1px solid ${headerBorder};
      min-height: 88px; display: flex; align-items: center; justify-content: center;
    }

    /* Message block */
    .pcm-msg { text-align: center; animation: pcm-msg-in 0.3s ease; }
    @keyframes pcm-msg-in { from { transform: translateY(8px); opacity: 0; } to { transform: none; opacity: 1; } }
    .pcm-msg-saved {
      font-family: 'Nunito', sans-serif;
      font-size: 0.76rem; font-weight: 600; color: ${textSub}; margin-bottom: 6px;
    }
    .pcm-msg-saved strong { color: ${accentClr}; font-weight: 800; }
    .pcm-msg-main {
      font-family: 'Nunito', sans-serif;
      font-size: 1.1rem; font-weight: 900; color: ${textPri};
      text-transform: uppercase; letter-spacing: 0.03em;
    }
    .pcm-msg-main em { font-style: normal; color: ${accentClr}; }
    .pcm-msg-sub {
      font-family: 'Nunito', sans-serif;
      font-size: 0.72rem; font-weight: 600; color: ${textFaint}; margin-top: 4px;
    }

    /* Countdown */
    .pcm-countdown { display: flex; flex-direction: column; align-items: center; gap: 8px; animation: pcm-msg-in 0.25s ease; }
    .pcm-ring { position: relative; width: 56px; height: 56px; }
    .pcm-ring-svg { width: 56px; height: 56px; transform: rotate(-90deg); }
    .pcm-ring-track { fill: none; stroke: ${accentTrack}; stroke-width: 3; }
    .pcm-ring-arc {
      fill: none; stroke: ${accentClr}; stroke-width: 3; stroke-linecap: round;
      transition: stroke-dashoffset 0.9s linear;
    }
    .pcm-ring-num {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Nunito', sans-serif; font-size: 1.5rem; font-weight: 900; color: ${textPri};
    }
    .pcm-cd-label {
      font-family: 'Nunito', sans-serif;
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
      color: ${textSub};
    }
    .pcm-cd-name {
      font-family: 'Nunito', sans-serif;
      font-size: 0.68rem; font-weight: 600; color: ${textDim};
    }

    @media (max-width: 520px) {
      .pcm-root { padding: 0; align-items: flex-end; }
      .pcm-card { border-radius: 14px 14px 0 0; max-width: 100%; }
    }
  `;

  return (
    <>
      <style>{CSS}</style>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="pcm-root">
        <div className="pcm-card">

          {/* ── Header ── */}
          <div className="pcm-header">
            <div className="pcm-header-left">
              <span className={camError || phase === 'starting' ? 'pcm-dot pcm-dot-idle' : 'pcm-dot pcm-dot-live'} />
              <div>
                <div className="pcm-header-title">
                  {camError ? 'Camera unavailable' : phase === 'starting' ? 'Starting camera...' : 'Photo capture'}
                </div>
                <div className="pcm-header-sub">CHILDTrack</div>
              </div>
            </div>
            <button className="pcm-skip" onClick={handleSkip}>Skip</button>
          </div>

          {/* ── Viewfinder ── */}
          <div className="pcm-vf">
            <video ref={videoRef} className="pcm-video" playsInline muted />

            {(phase === 'message' || phase === 'countdown') && !camError && (
              <>
                <div className="pcm-corner pcm-corner-tl" />
                <div className="pcm-corner pcm-corner-tr" />
                <div className="pcm-corner pcm-corner-bl" />
                <div className="pcm-corner pcm-corner-br" />
              </>
            )}

            {phase === 'starting' && !camError && (
              <div className="pcm-overlay-center">
                <div className="pcm-spin" />
                <span className="pcm-overlay-text">Starting camera...</span>
              </div>
            )}

            {camError && (
              <div className="pcm-err-overlay">
                <span className="pcm-overlay-text" style={{ fontSize: '1.5rem', opacity: 0.4 }}>&#x1F4F5;</span>
                <p className="pcm-err-text">Camera unavailable. The photo will be skipped.</p>
                <button className="pcm-retry" onClick={() => startSequence()}>Retry</button>
              </div>
            )}

            {phase === 'done' && (
              <div className="pcm-done-overlay">
                <div className="pcm-check">&#10003;</div>
                <span className="pcm-check-text">Photo saved</span>
              </div>
            )}

            <div className={flash ? 'pcm-flash pcm-flash-on' : 'pcm-flash'} />

            {phase === 'countdown' && (
              <div className="pcm-progress">
                <div className="pcm-progress-fill"
                  style={{ width: `${((COUNTDOWN_FROM - countdown) / COUNTDOWN_FROM) * 100}%` }} />
              </div>
            )}
          </div>

          {/* ── Info panel ── */}
          <div className="pcm-info">
            {(phase === 'message' || phase === 'starting') && !camError && (
              <div className="pcm-msg">
                <p className="pcm-msg-saved">
                  Attendance of <strong>{studentName}</strong> has been saved.
                </p>
                <p className="pcm-msg-main">Please <em>smile</em> for the photo! &#128522;</p>
                <p className="pcm-msg-sub">Auto-capture in a moment...</p>
              </div>
            )}

            {camError && (
              <div className="pcm-msg">
                <p className="pcm-msg-saved">
                  Attendance of <strong>{studentName}</strong> has been saved.
                </p>
                <p className="pcm-msg-main" style={{ color: textDim, fontSize: '0.95rem' }}>
                  Camera not available &#8212; photo skipped.
                </p>
              </div>
            )}

            {phase === 'countdown' && (
              <div className="pcm-countdown">
                <div className="pcm-ring">
                  <svg className="pcm-ring-svg" viewBox="0 0 56 56">
                    <circle className="pcm-ring-track" cx="28" cy="28" r={R} />
                    <circle
                      className="pcm-ring-arc"
                      cx="28" cy="28" r={R}
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                    />
                  </svg>
                  <div className="pcm-ring-num">{countdown}</div>
                </div>
                <p className="pcm-cd-label">
                  {countdown === 1 ? 'Ready...' : countdown === 2 ? 'Almost...' : 'Get ready!'}
                </p>
                <p className="pcm-cd-name">{studentName}</p>
              </div>
            )}

            {(phase === 'flash' || phase === 'done') && (
              <div className="pcm-msg">
                <p className="pcm-msg-main" style={{ color: accentClr }}>&#10003; Photo captured!</p>
                <p className="pcm-msg-sub">Have a great day, {firstName}!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}