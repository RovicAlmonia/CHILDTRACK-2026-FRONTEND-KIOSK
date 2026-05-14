// src/components/guardian/GuardianDrawer.tsx
import { useState } from 'react';
import api from '../../api/client';
import PhotoCapturedModal from '../shared/PhotoCapturedModal';

interface Props { open: boolean; onClose: () => void; dark?: boolean; }
const RELATIONSHIPS = ['Parent', 'Guardian', 'Grandparent', 'Sibling', 'Relative', 'Other'];

export default function GuardianDrawer({ open, onClose, dark = true }: Props) {
  const [form, setForm] = useState({ name: '', age: '', address: '', relationship: '', contact: '', student_name: '' });
  const [photo, setPhoto]                   = useState<string | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [loading, setLoading]               = useState(false);
  const [toast, setToast]                   = useState<{ msg: string; ok: boolean } | null>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    if (!form.name.trim())                                                 { showToast('Full name is required.', false); return; }
    if (!form.age || parseInt(form.age) < 18 || parseInt(form.age) > 100) { showToast('Please enter a valid age (18 to 100).', false); return; }
    if (!form.student_name.trim())                                         { showToast('Student name is required.', false); return; }
    setLoading(true);
    try {
      let photoPath: string | null = null;
      if (photo) {
        const res = await api.post('/scan-photos', { student_name: form.student_name, status: 'guardian_registration', photo_base64: photo });
        photoPath = res.data?.path ?? null;
      }
      await api.post('/guardians', { ...form, age: parseInt(form.age) || null, photo_path: photoPath });
      showToast(`${form.name} registered successfully.`, true);
      setForm({ name: '', age: '', address: '', relationship: '', contact: '', student_name: '' });
      setPhoto(null);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Registration failed. Please try again.', false);
    } finally { setLoading(false); }
  };

  const handleClose = () => {
    setForm({ name: '', age: '', address: '', relationship: '', contact: '', student_name: '' });
    setPhoto(null); setToast(null); onClose();
  };

  if (!open) return null;

  // ── Login-matched theme tokens ──
  const bg        = dark ? '#1e293b'           : '#ffffff';
  const bgCard    = dark ? '#1e293b'           : '#ffffff';
  const bgSurface = dark ? 'rgba(255,255,255,0.04)' : '#f9fafb';
  const bgTopbar  = dark ? '#1e293b'           : '#ffffff';
  const border    = dark ? 'rgba(56,197,134,0.16)' : '#e5e7eb';
  const borderHi  = dark ? 'rgba(56,197,134,0.28)' : '#d1d5db';
  const accentPri = dark ? '#38c586'           : '#2d5016';
  const accentGrd = dark ? 'linear-gradient(135deg,#38c586,#2da86e)' : 'linear-gradient(135deg,#2d5016,#4a7a25)';
  const accentShadow = dark ? '0 4px 14px rgba(56,197,134,0.3)' : '0 4px 14px rgba(45,80,22,0.25)';
  const accentShadowHover = dark ? '0 8px 24px rgba(56,197,134,0.45)' : '0 8px 24px rgba(45,80,22,0.35)';
  const textPri   = dark ? '#e2d9c8'           : '#1e293b';
  const textSub   = dark ? 'rgba(226,217,200,0.45)' : '#6b7280';
  const textDim   = dark ? 'rgba(226,217,200,0.28)' : '#9ca3af';
  const inputBg   = dark ? 'rgba(255,255,255,0.06)' : '#f9fafb';
  const inputBdr  = dark ? 'rgba(56,197,134,0.16)' : '#e5e7eb';
  const focusShadow = dark ? '0 0 0 3px rgba(56,197,134,0.15)' : '0 0 0 3px rgba(45,80,22,0.1)';
  const focusBdr  = dark ? '#38c586'           : '#2d5016';
  const photoBg   = dark ? 'rgba(56,197,134,0.05)' : 'rgba(45,80,22,0.04)';
  const selectBg  = dark ? '#1e293b'           : '#ffffff';

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; }

    .gd-overlay {
      position: fixed; inset: 0; z-index: 9500;
      background: ${bg};
      display: flex; flex-direction: column;
      font-family: 'Nunito', sans-serif;
      animation: gd-fadein 0.22s ease;
      overflow: hidden;
    }
    @keyframes gd-fadein { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

    /* ── Topbar ── */
    .gd-topbar {
      height: 64px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 32px;
      background: ${bgTopbar};
      border-bottom: 1px solid ${border};
      position: relative;
    }
    .gd-topbar::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
      background: ${accentPri}; opacity: 0.2;
    }
    .gd-topbar-left { display: flex; align-items: center; gap: 14px; }
    .gd-topbar-icon {
      width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
      background: ${accentGrd};
      display: flex; align-items: center; justify-content: center; font-size: 1.05rem;
      box-shadow: ${accentShadow};
    }
    .gd-topbar-title {
      font-family: 'Nunito', sans-serif;
      font-size: 1.1rem; font-weight: 900;
      color: ${textPri};
      text-transform: uppercase; letter-spacing: 0.08em; line-height: 1;
    }
    .gd-topbar-sub {
      font-family: 'Nunito', sans-serif;
      font-size: 0.68rem; font-weight: 700;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: ${textDim}; margin-top: 3px;
    }
    .gd-close {
      width: 36px; height: 36px; border-radius: 9px;
      background: ${inputBg};
      border: 1px solid ${border};
      color: ${textSub}; cursor: pointer;
      display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
      transition: background-color 0.15s, border-color 0.15s, color 0.15s;
    }
    .gd-close:hover { background: rgba(208,72,72,0.14); color: #fca5a5; border-color: rgba(208,72,72,0.25); }

    /* ── Body ── */
    .gd-body {
      flex: 1; overflow-y: auto; padding: 28px 32px;
      display: flex; flex-direction: column; align-items: center;
      background: ${bg};
      scrollbar-width: thin; scrollbar-color: ${border} transparent;
    }
    .gd-body::-webkit-scrollbar { width: 5px; }
    .gd-body::-webkit-scrollbar-thumb { background: ${border}; border-radius: 10px; }
    .gd-wrap { width: 100%; max-width: 860px; }

    /* ── Section divider label (matches login's .lp-section-label) ── */
    .gd-divider {
      font-family: 'Nunito', sans-serif;
      font-size: 0.72rem; font-weight: 900;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: ${textDim};
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 16px;
    }
    .gd-divider::before, .gd-divider::after {
      content: ''; flex: 1; height: 1px;
      background: ${border};
    }

    /* ── Photo row ── */
    .gd-photo-row {
      display: flex; align-items: center; gap: 20px;
      background: ${photoBg}; border: 1px solid ${border};
      border-radius: 12px; padding: 18px 22px; margin-bottom: 24px;
    }
    .gd-avatar {
      width: 68px; height: 68px; border-radius: 50%; flex-shrink: 0; overflow: hidden;
      border: 2px solid ${border};
      background: ${inputBg};
      display: flex; align-items: center; justify-content: center; font-size: 2rem;
    }
    .gd-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .gd-photo-info { flex: 1; }
    .gd-photo-status {
      font-family: 'Nunito', sans-serif;
      font-size: 0.8rem; font-weight: 500;
      color: ${textSub}; margin-bottom: 11px; line-height: 1.6;
    }
    .gd-photo-status strong { color: ${accentPri}; font-weight: 700; }
    .gd-photo-btns { display: flex; gap: 9px; flex-wrap: wrap; }
    .gd-photo-btn {
      height: 36px; padding: 0 16px; border-radius: 8px;
      font-family: 'Nunito', sans-serif;
      font-size: 0.78rem; font-weight: 800;
      cursor: pointer; transition: all 0.15s;
      display: inline-flex; align-items: center; gap: 7px; border: 1px solid;
    }
    .gd-photo-btn-take {
      background: ${accentGrd}; color: #fff; border-color: transparent;
      box-shadow: ${accentShadow};
    }
    .gd-photo-btn-take:hover { filter: brightness(1.08); box-shadow: ${accentShadowHover}; transform: translateY(-1px); }
    .gd-photo-btn-other {
      background: ${inputBg}; color: ${textSub}; border-color: ${border};
    }
    .gd-photo-btn-other:hover { background: ${bgSurface}; color: ${textPri}; border-color: ${borderHi}; }

    /* ── Sections grid ── */
    .gd-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .gd-section {
      background: ${bgCard};
      border: 1px solid ${border}; border-radius: 12px; overflow: hidden;
    }
    .gd-section-head {
      padding: 13px 18px;
      background: ${bgSurface};
      border-bottom: 1px solid ${border};
      display: flex; align-items: center; gap: 9px;
    }
    .gd-section-head-icon { font-size: 1rem; }
    .gd-section-head-label {
      font-family: 'Nunito', sans-serif;
      font-size: 0.68rem; font-weight: 900;
      letter-spacing: 0.12em; text-transform: uppercase; color: ${textDim};
    }
    .gd-section-body { padding: 18px; display: flex; flex-direction: column; gap: 14px; }

    /* ── Fields (matches login's .lp-field / .lp-label / .lp-input) ── */
    .gd-field { display: flex; flex-direction: column; gap: 7px; }
    .gd-label {
      display: block;
      font-family: 'Nunito', sans-serif;
      font-size: 0.68rem; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: ${textDim};
      display: flex; align-items: center; gap: 5px;
    }
    .gd-req { color: #fca5a5; }
    .gd-input, .gd-select {
      height: 48px; padding: 0 14px;
      background: ${inputBg}; border: 1px solid ${inputBdr};
      border-radius: 10px; color: ${textPri};
      font-size: 0.92rem; font-family: 'Nunito', sans-serif; font-weight: 600;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
      width: 100%;
    }
    .gd-input::placeholder { color: ${textDim}; font-weight: 400; }
    .gd-input:focus, .gd-select:focus {
      border-color: ${focusBdr};
      box-shadow: ${focusShadow};
      background: ${dark ? 'rgba(255,255,255,0.09)' : '#ffffff'};
    }
    .gd-select {
      cursor: pointer; appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='${dark ? '%2338c586' : '%232d5016'}' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px;
    }
    .gd-select option { background: ${selectBg}; color: ${textPri}; }
    .gd-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    /* ── Footer ── */
    .gd-footer {
      height: 68px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: flex-end; gap: 12px;
      padding: 0 32px;
      border-top: 1px solid ${border};
      background: ${bgTopbar};
    }
    .gd-btn {
      height: 48px; padding: 0 28px; border-radius: 10px;
      font-family: 'Nunito', sans-serif;
      font-size: 0.875rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
      cursor: pointer; transition: all 0.15s;
      display: inline-flex; align-items: center; gap: 8px; border: 1px solid;
    }
    .gd-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .gd-btn-cancel {
      background: ${inputBg}; color: ${textSub}; border-color: ${border};
    }
    .gd-btn-cancel:hover:not(:disabled) {
      background: ${bgSurface}; color: ${textPri}; border-color: ${borderHi};
    }
    .gd-btn-save {
      background: ${accentGrd}; color: #fff; border-color: transparent;
      box-shadow: ${accentShadow};
    }
    .gd-btn-save:hover:not(:disabled) {
      filter: brightness(1.08);
      box-shadow: ${accentShadowHover};
      transform: translateY(-1px);
    }

    /* ── Spinner ── */
    .gd-spin {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
      border-radius: 50%; animation: gd-s 0.7s linear infinite;
    }
    @keyframes gd-s { to { transform: rotate(360deg); } }

    /* ── Toast ── */
    .gd-toast {
      position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 10100;
      padding: 11px 20px; border-radius: 10px;
      font-family: 'Nunito', sans-serif; font-size: 0.82rem; font-weight: 700;
      min-width: 280px; max-width: 420px; text-align: center; border: 1px solid;
      animation: gd-ti 0.22s cubic-bezier(0.34,1.2,0.64,1);
      box-shadow: 0 6px 28px rgba(0,0,0,0.35); line-height: 1.5;
    }
    @keyframes gd-ti { from { transform: translateX(-50%) translateY(-8px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
    .gd-toast-ok  { background: ${dark ? '#0a2210' : '#f0fdf4'}; color: ${dark ? '#86efac' : '#166534'}; border-color: ${dark ? 'rgba(134,239,172,0.2)' : 'rgba(22,101,52,0.2)'}; }
    .gd-toast-err { background: ${dark ? '#2a0f0f' : '#fef2f2'}; color: ${dark ? '#fca5a5' : '#dc2626'}; border-color: ${dark ? 'rgba(252,165,165,0.2)' : 'rgba(220,38,38,0.2)'}; }

    @media (max-width: 700px) {
      .gd-sections  { grid-template-columns: 1fr; }
      .gd-field-row { grid-template-columns: 1fr; }
      .gd-body      { padding: 20px 16px; }
      .gd-topbar, .gd-footer { padding: 0 16px; }
    }
  `;

  return (
    <>
      <style>{CSS}</style>

      {toast && (
        <div className={toast.ok ? 'gd-toast gd-toast-ok' : 'gd-toast gd-toast-err'}>
          {toast.msg}
        </div>
      )}

      <PhotoCapturedModal
        open={photoModalOpen}
        studentName={form.student_name || 'Guardian'}
        onCaptureDone={url => { if (url) setPhoto(url); setPhotoModalOpen(false); }}
        dark={dark}
      />

      <div className="gd-overlay">

        {/* Topbar */}
        <div className="gd-topbar">
          <div className="gd-topbar-left">
            <div>
              <div className="gd-topbar-title">Register Guardian</div>
              <div className="gd-topbar-sub">Fields marked * are required</div>
            </div>
          </div>
          <button className="gd-close" onClick={handleClose}>&#215;</button>
        </div>

        {/* Body */}
        <div className="gd-body">
          <div className="gd-wrap">

            <div className="gd-divider">Guardian Photo</div>

            {/* Photo */}
            <div className="gd-photo-row">
              <div className="gd-avatar">
                {photo ? <img src={photo} alt="Guardian" /> : '👤'}
              </div>
              <div className="gd-photo-info">
                <p className="gd-photo-status">
                  {photo
                    ? <><strong>Photo captured.</strong> You can retake before saving.</>
                    : 'Optional. A photo helps identify the guardian at pickup time.'}
                </p>
                <div className="gd-photo-btns">
                  <button
                    className={photo ? 'gd-photo-btn gd-photo-btn-other' : 'gd-photo-btn gd-photo-btn-take'}
                    onClick={() => setPhotoModalOpen(true)}>
                    {photo ? '🔄 Retake' : '📷 Take photo'}
                  </button>
                  {photo && (
                    <button className="gd-photo-btn gd-photo-btn-other" onClick={() => setPhoto(null)}>
                      🗑️ Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="gd-divider">Guardian Details</div>

            {/* Two-column sections */}
            <div className="gd-sections">

              {/* Basic info */}
              <div className="gd-section">
                <div className="gd-section-head">
                  <span className="gd-section-head-icon">👤</span>
                  <span className="gd-section-head-label">Basic Information</span>
                </div>
                <div className="gd-section-body">
                  <div className="gd-field-row">
                    <div className="gd-field">
                      <label className="gd-label" htmlFor="gd-name">Full name <span className="gd-req">*</span></label>
                      <input id="gd-name" className="gd-input" type="text" placeholder="e.g. Maria Santos"
                        value={form.name} onChange={e => set('name', e.target.value)} />
                    </div>
                    <div className="gd-field">
                      <label className="gd-label" htmlFor="gd-age">Age <span className="gd-req">*</span></label>
                      <input id="gd-age" className="gd-input" type="number" min={18} max={100} placeholder="18 – 100"
                        value={form.age} onChange={e => set('age', e.target.value)} />
                    </div>
                  </div>
                  <div className="gd-field-row">
                    <div className="gd-field">
                      <label className="gd-label" htmlFor="gd-rel">Relationship</label>
                      <select id="gd-rel" className="gd-select" value={form.relationship} onChange={e => set('relationship', e.target.value)}>
                        <option value="">Select...</option>
                        {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="gd-field">
                      <label className="gd-label" htmlFor="gd-contact">Contact</label>
                      <input id="gd-contact" className="gd-input" type="tel" placeholder="09XXXXXXXXX"
                        value={form.contact} onChange={e => set('contact', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Student & address */}
              <div className="gd-section">
                <div className="gd-section-head">
                  <span className="gd-section-head-icon">🎒</span>
                  <span className="gd-section-head-label">Student &amp; Address</span>
                </div>
                <div className="gd-section-body">
                  <div className="gd-field">
                    <label className="gd-label" htmlFor="gd-student">Student name <span className="gd-req">*</span></label>
                    <input id="gd-student" className="gd-input" type="text" placeholder="Student's full name"
                      value={form.student_name} onChange={e => set('student_name', e.target.value)} />
                  </div>
                  <div className="gd-field">
                    <label className="gd-label" htmlFor="gd-addr">Address</label>
                    <input id="gd-addr" className="gd-input" type="text" placeholder="Optional — home address"
                      value={form.address} onChange={e => set('address', e.target.value)} />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="gd-footer">
          <button className="gd-btn gd-btn-cancel" onClick={handleClose}>Cancel</button>
          <button className="gd-btn gd-btn-save" onClick={handleSave} disabled={loading}>
            {loading ? <span className="gd-spin" /> : '💾 Save guardian'}
          </button>
        </div>
      </div>
    </>
  );
}