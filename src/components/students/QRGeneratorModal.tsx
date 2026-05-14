// src/components/students/QRGeneratorModal.tsx
import { useRef } from 'react';
import { QRCodeSVG as QRCode, QRCodeCanvas } from 'qrcode.react';
import type { StudentForm, GuardianForm } from '../../types';

interface Props {
  open:      boolean;
  onClose:   () => void;
  student:   StudentForm;
  guardians: GuardianForm[];
  dark?:     boolean;
}

export default function QRGeneratorModal({ open, onClose, student, guardians, dark = true }: Props) {
  const dlRefs = useRef<{ [role: string]: HTMLCanvasElement | null }>({});

  const cardBg    = dark ? '#0d1f30'                     : '#ffffff';
  const headBg    = dark ? '#091622'                     : '#f4f6f4';
  const mainBg    = dark ? 'rgba(13,31,48,0.98)'         : '#ffffff';
  const overlayBg = dark ? 'rgba(6,12,20,0.75)'         : 'rgba(20,40,20,0.5)';
  const border    = dark ? 'rgba(255,255,255,0.08)'      : 'rgba(0,0,0,0.08)';
  const titleClr  = dark ? '#e8dcc8'                     : '#1a2e1a';
  const subClr    = dark ? 'rgba(226,217,200,0.32)'     : 'rgba(26,46,26,0.42)';
  const introClr  = dark ? 'rgba(226,217,200,0.35)'     : 'rgba(26,46,26,0.45)';
  const lrnClr    = dark ? 'rgba(74,158,56,0.75)'       : '#2d6b1a';
  const itemBg    = dark ? 'rgba(255,255,255,0.02)'     : 'rgba(0,0,0,0.02)';
  const namClr    = dark ? '#e8dcc8'                     : '#1a2e1a';
  const cntClr    = dark ? 'rgba(226,217,200,0.36)'     : 'rgba(26,46,26,0.42)';
  const ftBtnBg   = dark ? 'rgba(255,255,255,0.05)'     : 'rgba(0,0,0,0.04)';
  const ftBtnBdr  = dark ? 'rgba(255,255,255,0.09)'     : 'rgba(0,0,0,0.09)';
  const ftBtnClr  = dark ? 'rgba(226,217,200,0.45)'     : 'rgba(26,46,26,0.5)';

  const makePayload = (g: GuardianForm) => JSON.stringify({
    lrn:      student.lrn,
    student:  student.name,
    gender:   student.gender === 'Male' ? 'M' : 'F',
    role:     g.role,
    name:     g.name,
    contacts: guardians.map(gd => gd.contact_number).filter(Boolean),
  });

  const downloadQR = (role: string) => {
    const canvas = dlRefs.current[role];
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `QR_${(student.name || 'student').replace(/\s+/g,'_')}_${role.replace(/\s+/g,'_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadAll = () => {
    guardians.filter(g => g.name).forEach((g, i) => setTimeout(() => downloadQR(g.role), i * 300));
  };

  if (!open) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; }

        .qr-ov {
          position:fixed;inset:0;z-index:9000;
          background:${overlayBg};backdrop-filter:blur(5px);
          display:flex;align-items:flex-start;justify-content:center;
          padding:40px 20px;overflow-y:auto;
          animation:qr-bg .2s ease;font-family:'Nunito',sans-serif;
        }
        @keyframes qr-bg { from{opacity:0} to{opacity:1} }

        .qr-card {
          width:100%;max-width:760px;
          background:${mainBg};border:1px solid ${border};
          border-radius:16px;overflow:hidden;
          box-shadow:${dark ? '0 24px 60px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.1)'};
          animation:qr-up .28s cubic-bezier(0.34,1.15,0.64,1);margin-bottom:40px;
        }
        @keyframes qr-up { from{transform:scale(0.96) translateY(14px);opacity:0} to{transform:none;opacity:1} }
        .qr-card::before { content:'';display:block;height:3px;background:linear-gradient(90deg,#1a4010,#4a9e38,#1a4010); }

        .qr-hd {
          padding:16px 22px;border-bottom:1px solid ${border};
          display:flex;align-items:center;justify-content:space-between;
          background:${headBg};
        }
        .qr-hd-left { display:flex;align-items:center;gap:12px; }
        .qr-hd-icon {
          width:36px;height:36px;border-radius:9px;flex-shrink:0;
          background:rgba(74,158,56,0.12);border:1px solid rgba(74,158,56,0.2);
          display:flex;align-items:center;justify-content:center;font-size:0.9rem;
        }
        .qr-hd-title { font-family:'Barlow Condensed',sans-serif;font-size:0.95rem;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;color:${titleClr}; }
        .qr-hd-sub { font-size:0.7rem;color:${subClr};margin-top:1px; }
        .qr-hd-actions { display:flex;align-items:center;gap:8px; }

        .qr-dl-all {
          height:30px;padding:0 13px;border-radius:7px;
          background:rgba(74,158,56,0.1);border:1px solid rgba(74,158,56,0.22);
          color:#4a9e38;font-family:'Barlow Condensed',sans-serif;font-size:0.76rem;font-weight:800;
          letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;
          display:flex;align-items:center;gap:6px;transition:all 0.15s;
        }
        .qr-dl-all:hover { background:rgba(74,158,56,0.2);color:#6ec862; }
        .qr-close {
          width:30px;height:30px;border-radius:7px;
          background:${ftBtnBg};border:1px solid ${ftBtnBdr};
          color:${ftBtnClr};font-family:'Barlow Condensed',sans-serif;
          font-size:0.9rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;
        }
        .qr-close:hover { background:rgba(255,255,255,0.1);color:${titleClr}; }

        .qr-intro {
          padding:12px 22px 0;
          font-family:'Nunito',sans-serif;font-size:0.76rem;color:${introClr};line-height:1.5;
        }
        .qr-intro strong { color:${dark ? 'rgba(226,217,200,0.65)' : '#1a2e1a'};font-weight:700; }
        .qr-intro-lrn {
          font-family:'Barlow Condensed',sans-serif;
          font-size:0.8rem;font-weight:800;color:${lrnClr};letter-spacing:0.04em;
        }

        .qr-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:14px 22px 20px; }

        .qr-item {
          border:1px solid ${border};border-radius:10px;
          background:${itemBg};
          display:flex;flex-direction:column;align-items:center;
          padding:18px 14px 14px;gap:12px;
          transition:border-color 0.15s,background 0.15s;
        }
        .qr-item:hover { border-color:rgba(74,158,56,0.3);background:rgba(74,158,56,0.04); }

        .qr-role {
          align-self:stretch;text-align:center;
          font-family:'Barlow Condensed',sans-serif;
          font-size:0.64rem;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;
          color:rgba(74,158,56,0.8);background:rgba(74,158,56,0.08);
          border:1px solid rgba(74,158,56,0.14);border-radius:5px;padding:4px 0;
        }
        .qr-code-wrap {
          background:#fff;padding:10px;border-radius:8px;
          border:1px solid rgba(255,255,255,0.12);
          display:flex;align-items:center;justify-content:center;
        }
        .qr-name { font-family:'Nunito',sans-serif;font-size:0.84rem;font-weight:700;color:${namClr};text-align:center; }
        .qr-noname { font-size:0.78rem;color:${dark ? 'rgba(226,217,200,0.22)' : 'rgba(26,46,26,0.25)'};font-style:italic;text-align:center; }
        .qr-contact {
          font-family:'Barlow Condensed',sans-serif;
          font-size:0.74rem;font-weight:700;letter-spacing:0.04em;color:${cntClr};text-align:center;
        }

        .qr-dl-btn {
          align-self:stretch;height:34px;
          background:linear-gradient(135deg,#2d6b1a,#3a8520);border:none;border-radius:7px;
          color:#e8dcc8;font-family:'Barlow Condensed',sans-serif;font-size:0.78rem;font-weight:800;
          letter-spacing:0.04em;text-transform:uppercase;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background 0.15s;
        }
        .qr-dl-btn:hover { background:linear-gradient(135deg,#3a8520,#48a028); }

        .qr-ft {
          padding:12px 22px 18px;border-top:1px solid ${border};
          display:flex;align-items:center;justify-content:flex-end;gap:9px;
          background:${headBg};
        }
        .qr-ft-close {
          height:36px;padding:0 18px;border-radius:8px;
          background:${ftBtnBg};border:1px solid ${ftBtnBdr};
          color:${ftBtnClr};font-family:'Barlow Condensed',sans-serif;
          font-size:0.84rem;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;
          cursor:pointer;transition:all 0.15s;
        }
        .qr-ft-close:hover { background:rgba(255,255,255,0.1);color:${titleClr}; }
        .qr-ft-dl {
          height:36px;padding:0 18px;border-radius:8px;border:none;
          background:linear-gradient(135deg,#2d6b1a,#3a8520,#4a9e38);
          color:#fff;font-family:'Barlow Condensed',sans-serif;
          font-size:0.84rem;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;
          cursor:pointer;display:flex;align-items:center;gap:7px;transition:background 0.15s;
          box-shadow:0 4px 14px rgba(45,107,26,0.35);
        }
        .qr-ft-dl:hover { background:linear-gradient(135deg,#3a8520,#48a028); }

        @media (max-width:660px) { .qr-grid { grid-template-columns:1fr 1fr; } .qr-ov { padding:24px 14px; } }
        @media (max-width:440px) { .qr-grid { grid-template-columns:1fr; } }
      `}</style>

      {/* Hidden canvases for hi-res download */}
      <div style={{ position:'absolute', left:'-9999px', top:0, pointerEvents:'none', zIndex:-1 }}>
        {guardians.map(g => (
          <QRCodeCanvas
            key={g.role}
            ref={(el: HTMLCanvasElement | null) => { dlRefs.current[g.role] = el; }}
            value={makePayload(g)}
            size={400} level="H"
          />
        ))}
      </div>

      <div className="qr-ov" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="qr-card">

          <div className="qr-hd">
            <div className="qr-hd-left">
              <div className="qr-hd-icon">🪪</div>
              <div>
                <div className="qr-hd-title">QR Codes — {student.name || 'Student'}</div>
                <div className="qr-hd-sub">One code per guardian · unique to this student</div>
              </div>
            </div>
            <div className="qr-hd-actions">
              <button className="qr-dl-all" onClick={downloadAll}>↓ Download All</button>
              <button className="qr-close" onClick={onClose}>✕</button>
            </div>
          </div>

          <div className="qr-intro">
            Each guardian has a unique QR code linked to <strong>{student.name || '—'}</strong>
            {student.lrn && <> (<span className="qr-intro-lrn">{student.lrn}</span>)</>}.
            Guardian must present this code at the kiosk.
          </div>

          <div className="qr-grid">
            {guardians.map(g => (
              <div className="qr-item" key={g.role}>
                <div className="qr-role">{g.role}</div>
                <div className="qr-code-wrap">
                  <QRCode value={makePayload(g)} size={148} level="H" />
                </div>
                {g.name ? <div className="qr-name">{g.name}</div> : <div className="qr-noname">No name entered</div>}
                <div className="qr-contact">
                  {g.contact_number || <span style={{opacity:0.4}}>No contact</span>}
                </div>
                <button
                  className="qr-dl-btn"
                  onClick={() => downloadQR(g.role)}
                  disabled={!g.name}
                  style={!g.name ? {opacity:0.35,cursor:'not-allowed'} : undefined}
                >
                  ↓ Download PNG
                </button>
              </div>
            ))}
          </div>

          <div className="qr-ft">
            <button className="qr-ft-close" onClick={onClose}>Close</button>
            <button className="qr-ft-dl" onClick={downloadAll}>↓ Download All QR Codes</button>
          </div>
        </div>
      </div>
    </>
  );
}