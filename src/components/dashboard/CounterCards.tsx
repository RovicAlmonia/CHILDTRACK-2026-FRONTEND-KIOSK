// src/components/dashboard/CounterCards.tsx
import type { AttendanceRecord } from '../../types/index';

interface Props {
  rows:            AttendanceRecord[];
  dark?:           boolean;
  activeFilter?:   string;
  onFilterChange?: (key: string) => void;
}

const CARDS = [
  { key: 'Drop-off', label: 'Drop-off', sub: 'Arrived today',   color: '#4a9e38', glow: 'rgba(74,158,56,0.2)',   emoji: '🌅' },
  { key: 'Pick-up',  label: 'Pick-up',  sub: 'Departed safely', color: '#4a90d4', glow: 'rgba(74,144,212,0.2)', emoji: '🏠' },
  { key: 'Late',     label: 'Late',     sub: '30+ min delay',   color: '#e07830', glow: 'rgba(224,120,48,0.2)', emoji: '⏰' },
] as const;

export default function CounterCards({ rows, dark = true, activeFilter, onFilterChange }: Props) {
  const count = (s: string) => rows.filter(r => r.status === s).length;

  const cardBg    = dark ? 'rgba(13,31,48,0.8)'      : '#ffffff';
  const cardActive= dark ? '#0f2235'                  : '#f5fbf5';
  const textDim   = dark ? 'rgba(226,217,200,0.32)'  : 'rgba(26,46,26,0.38)';
  const iconBg    = dark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.05)';
  const borderDef = dark ? 'rgba(255,255,255,0.07)'  : 'rgba(0,0,0,0.08)';
  const shadow    = dark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.07)';

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Nunito:wght@400;600;700;800&display=swap');
    .cc-grid {
      display: grid; grid-template-columns: repeat(3,1fr); gap: 10px;
      width: 100%; box-sizing: border-box;
    }
    @media (max-width:480px) { .cc-grid { grid-template-columns:1fr; } }
    .cc-card {
      border-radius: 12px; padding: 12px 14px;
      background: ${cardBg}; border: 1px solid ${borderDef};
      box-shadow: ${shadow}; cursor: pointer; position: relative; overflow: hidden;
      font-family: 'Nunito', sans-serif; min-width: 0;
      transition: transform 0.18s, box-shadow 0.18s, border-color 0.15s, background 0.15s;
    }
    .cc-card::before {
      content:''; position:absolute; top:0; left:0; right:0; height:2px;
      background: var(--c); opacity:0.5; transition: opacity 0.18s;
    }
    .cc-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px var(--g); }
    .cc-card:hover::before { opacity:1; }
    .cc-card.on {
      background: ${cardActive}; border-color: var(--c);
      box-shadow: 0 0 0 1px var(--c) inset, 0 6px 24px var(--g);
    }
    .cc-card.on::before { opacity:1; }
    .cc-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:10px; }
    .cc-label {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 0.58rem; font-weight: 800;
      letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--c); display:flex; align-items:center; gap:4px; line-height:1;
    }
    .cc-dot { width:4px; height:4px; border-radius:50%; background:var(--c); flex-shrink:0; }
    .cc-icon {
      width:28px; height:28px; border-radius:8px;
      background: ${iconBg}; display:flex; align-items:center; justify-content:center;
      font-size:0.9rem; flex-shrink:0;
    }
    .cc-num {
      font-family: 'Barlow Condensed', sans-serif;
      font-size:2rem; font-weight:900; line-height:1;
      color:var(--c); letter-spacing:-0.01em; margin-bottom:4px;
    }
    .cc-sub {
      font-family: 'Nunito', sans-serif;
      font-size:0.65rem; font-weight:600; color:${textDim};
    }
  `;

  return (
    <>
      <style>{CSS}</style>
      <div className="cc-grid">
        {CARDS.map(c => (
          <div
            key={c.key}
            className={`cc-card${activeFilter === c.key ? ' on' : ''}`}
            style={{ '--c': c.color, '--g': c.glow } as React.CSSProperties}
            onClick={() => onFilterChange?.(activeFilter === c.key ? 'All' : c.key)}
          >
            <div className="cc-top">
              <div className="cc-label"><span className="cc-dot" />{c.label}</div>
              <div className="cc-icon">{c.emoji}</div>
            </div>
            <div className="cc-num">{count(c.key)}</div>
            <div className="cc-sub">{c.sub}</div>
          </div>
        ))}
      </div>
    </>
  );
}