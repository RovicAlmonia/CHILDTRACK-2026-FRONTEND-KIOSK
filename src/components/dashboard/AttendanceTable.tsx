// src/components/dashboard/AttendanceTable.tsx
import { useState } from 'react';
import { format } from 'date-fns';
import type { AttendanceRecord, AttendanceStatus } from '../../types/index';

interface Props {
  rows:           AttendanceRecord[];
  loading:        boolean;
  dark?:          boolean;
  onDelete:       (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
}

const STATUSES = ['Drop-off', 'Pick-up', 'Late', 'Absent'] as const;

export default function AttendanceTable({ rows, loading, dark = true, onDelete, onStatusChange }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);

  // ── theme tokens ──────────────────────────────────────────────────────────
  const tableBg    = dark ? '#0d1f30'                   : '#ffffff';
  const headBg     = dark ? '#091622'                   : '#f4f6f4';
  const thColor    = dark ? 'rgba(226,217,200,0.3)'    : 'rgba(26,46,26,0.38)';
  const thBorder   = dark ? 'rgba(74,158,56,0.1)'      : 'rgba(0,0,0,0.07)';
  const rowBorder  = dark ? 'rgba(255,255,255,0.04)'   : 'rgba(0,0,0,0.05)';
  const rowHover   = dark ? 'rgba(74,158,56,0.05)'     : 'rgba(45,107,26,0.03)';
  const lrnColor   = dark ? 'rgba(226,217,200,0.35)'   : 'rgba(26,46,26,0.38)';
  const nameColor  = dark ? '#e8dcc8'                  : '#1a2e1a';
  const byColor    = dark ? 'rgba(226,217,200,0.5)'    : 'rgba(26,46,26,0.5)';
  const timeColor  = dark ? 'rgba(226,217,200,0.38)'   : 'rgba(26,46,26,0.4)';
  const pickupSub  = dark ? '#5898c8'                  : '#3a7ac8';
  const selectBg   = dark ? 'rgba(255,255,255,0.05)'   : '#f4f6f4';
  const selectBdr  = dark ? 'rgba(255,255,255,0.08)'   : 'rgba(0,0,0,0.09)';
  const selectClr  = dark ? '#e2d9c8'                  : '#1a2e1a';
  const delBg      = dark ? 'rgba(208,72,72,0.06)'     : 'rgba(208,72,72,0.05)';
  const delBdr     = dark ? 'rgba(208,72,72,0.12)'     : 'rgba(208,72,72,0.12)';
  const delClr     = dark ? 'rgba(252,165,165,0.45)'   : 'rgba(208,72,72,0.5)';
  const emptyColor = dark ? 'rgba(226,217,200,0.35)'   : 'rgba(26,46,26,0.38)';
  const emptySub   = dark ? 'rgba(226,217,200,0.22)'   : 'rgba(26,46,26,0.28)';

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap');

    .at-wrap {
      border-radius: 12px;
      border: 1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'};
      overflow: auto;
      background: ${tableBg};
      box-shadow: ${dark ? 'none' : '0 2px 10px rgba(0,0,0,0.05)'};
      scrollbar-width: thin;
      scrollbar-color: rgba(74,158,56,0.18) transparent;
      font-family: 'Nunito', sans-serif;
    }
    .at-wrap table { width:100%; border-collapse:collapse; }
    .at-wrap thead tr { position:sticky; top:0; z-index:1; background:${headBg}; }
    .at-wrap th {
      padding: 10px 14px; text-align:left;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 0.58rem; font-weight: 800;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: ${thColor};
      border-bottom: 1px solid ${thBorder};
      white-space: nowrap;
    }
    .at-wrap tbody tr { border-bottom: 1px solid ${rowBorder}; transition: background 0.12s; }
    .at-wrap tbody tr:last-child { border-bottom: none; }
    .at-wrap tbody tr:hover { background: ${rowHover}; }
    .at-wrap td { padding: 11px 14px; vertical-align: middle; font-size: 0.81rem; }

    .at-lrn {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 0.78rem; font-weight: 700;
      letter-spacing: 0.04em; color: ${lrnColor};
    }
    .at-name { font-weight: 700; color: ${nameColor}; font-family: 'Nunito', sans-serif; }
    .at-by   { color: ${byColor}; font-size: 0.79rem; font-family: 'Nunito', sans-serif; }
    .at-time {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 0.76rem; font-weight: 700;
      letter-spacing: 0.04em; color: ${timeColor};
    }
    .at-pickup-sub {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 0.66rem; font-weight: 700;
      color: ${pickupSub}; margin-top: 2px; letter-spacing: 0.02em;
    }

    /* Gender badges */
    .at-badge {
      display:inline-flex; align-items:center; gap:4px;
      padding:3px 8px; border-radius:5px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size:0.66rem; font-weight:800;
      letter-spacing:0.06em; border:1px solid;
    }
    .at-badge-m { background:rgba(74,144,212,0.12); color:#7ab4e8; border-color:rgba(74,144,212,0.2); }
    .at-badge-f { background:rgba(200,100,180,0.12); color:#dda8d0; border-color:rgba(200,100,180,0.2); }
    .at-badge-u { background:transparent; color:${dark ? 'rgba(226,217,200,0.22)' : 'rgba(26,46,26,0.22)'}; border-color:transparent; }

    /* Status pills */
    .at-pill {
      display:inline-flex; align-items:center; gap:4px;
      padding:3px 8px; border-radius:5px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size:0.66rem; font-weight:800;
      letter-spacing:0.04em; border:1px solid;
    }
    .at-pill-drop { background:rgba(74,158,56,0.12);  color:#7bc67e; border-color:rgba(74,158,56,0.22);  }
    .at-pill-pick { background:rgba(74,144,212,0.12); color:#7ab4e8; border-color:rgba(74,144,212,0.22); }
    .at-pill-late { background:rgba(224,120,48,0.12); color:#e8a870; border-color:rgba(224,120,48,0.22); }
    .at-pill-abs  { background:rgba(208,72,72,0.12);  color:#f09090; border-color:rgba(208,72,72,0.22);  }

    /* Status select */
    .at-sel {
      height:30px; padding:0 8px; border-radius:6px;
      border:1px solid ${selectBdr}; background:${selectBg};
      color:${selectClr}; font-family:'Barlow Condensed',sans-serif;
      font-size:0.78rem; font-weight:700; letter-spacing:0.04em;
      cursor:pointer; outline:none;
      transition: border-color 0.15s;
    }
    .at-sel:focus { border-color:#4a9e38; box-shadow:0 0 0 3px rgba(74,158,56,0.12); }
    .at-sel option { background:${dark ? '#0d1f30' : '#fff'}; color:${dark ? '#e2d9c8' : '#1a2e1a'}; }

    /* Delete button */
    .at-del {
      width:28px; height:28px; border-radius:6px;
      border:1px solid ${delBdr}; background:${delBg}; color:${delClr};
      cursor:pointer; display:flex; align-items:center; justify-content:center;
      font-size:0.85rem; transition:all 0.15s;
    }
    .at-del:hover { background:rgba(208,72,72,0.18); color:#fca5a5; border-color:rgba(208,72,72,0.28); }

    /* Empty states */
    .at-empty {
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      padding:56px 20px; gap:10px; text-align:center;
    }
    .at-empty-icon { font-size:2.8rem; opacity:0.35; }
    .at-empty-title {
      font-family:'Barlow Condensed',sans-serif;
      font-size:0.9rem; font-weight:900; letter-spacing:0.06em; text-transform:uppercase;
      color:${emptyColor};
    }
    .at-empty-sub {
      font-family:'Nunito',sans-serif;
      font-size:0.76rem; color:${emptySub};
      max-width:260px; line-height:1.6;
    }
    .at-spin-wrap { display:flex; flex-direction:column; align-items:center; padding:56px 20px; gap:12px; }
    .at-spin {
      width:32px; height:32px;
      border:3px solid rgba(74,158,56,0.1); border-top-color:#4a9e38;
      border-radius:50%; animation:at-s 0.75s linear infinite;
    }
    @keyframes at-s { to { transform:rotate(360deg); } }
    .at-spin-label {
      font-family:'Barlow Condensed',sans-serif;
      font-size:0.75rem; font-weight:800; letter-spacing:0.1em; text-transform:uppercase;
      color:${emptyColor};
    }
  `;

  const genderBadge = (g: string) => {
    const u = String(g ?? '').toUpperCase();
    if (u === 'M' || u === 'MALE')   return <span className="at-badge at-badge-m">♂ M</span>;
    if (u === 'F' || u === 'FEMALE') return <span className="at-badge at-badge-f">♀ F</span>;
    return <span className="at-badge at-badge-u">—</span>;
  };

  const statusPill = (s: string) => {
    const cls = s === 'Drop-off' ? 'at-pill-drop' : s === 'Pick-up' ? 'at-pill-pick' : s === 'Late' ? 'at-pill-late' : 'at-pill-abs';
    const icon = s === 'Drop-off' ? '🌅' : s === 'Pick-up' ? '🏠' : s === 'Late' ? '⏰' : '❌';
    return <span className={`at-pill ${cls}`}>{icon} {s}</span>;
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="at-wrap">
        {loading ? (
          <div className="at-spin-wrap">
            <div className="at-spin" />
            <span className="at-spin-label">Loading records…</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="at-empty">
            <div className="at-empty-icon">📭</div>
            <div className="at-empty-title">No records yet today</div>
            <div className="at-empty-sub">Enable the scanner and scan QR codes to start recording attendance.</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>LRN</th>
                <th>Student</th>
                <th>Gender</th>
                <th>Dropped off by</th>
                <th>Status</th>
                <th>Picked up by</th>
                <th>Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td><span className="at-lrn">{row.lrn || '—'}</span></td>
                  <td><span className="at-name">{row.student_name}</span></td>
                  <td>{genderBadge(row.gender)}</td>
                  <td><span className="at-by">{row.guardian_name || row.by_whom || '—'}</span></td>
                  <td>
                    {editingId === row.id ? (
                      <select
                        className="at-sel"
                        value={row.status}
                        autoFocus
                        onBlur={() => setEditingId(null)}
                        onChange={e => { onStatusChange(row.id, e.target.value); setEditingId(null); }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span
                        title="Click to edit"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setEditingId(row.id)}
                      >
                        {statusPill(row.status)}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="at-by">
                      {row.status === 'Pick-up' ? ((row as any).pickup_by || '—') : '—'}
                    </span>
                  </td>
                  <td>
                    <div className="at-time">
                      {row.timestamp ? format(new Date(row.timestamp), 'hh:mm:ss aa') : '—'}
                    </div>
                    {row.status === 'Pick-up' && (row as any).pickup_time && (
                      <div className="at-pickup-sub">
                        ↑ {format(new Date((row as any).pickup_time), 'hh:mm aa')}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className="at-del"
                      title="Remove record"
                      onClick={() => {
                        if (confirm(`Remove record for ${row.student_name}?`)) onDelete(row.id);
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}