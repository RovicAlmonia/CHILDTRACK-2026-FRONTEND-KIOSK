// src/components/ui/CTStatusChip.tsx
// ─── Attendance status chip ────────────────────────────────────────────────────
//
// Usage:
//   <CTStatusChip status="Drop-off" />
//   <CTStatusChip status="Late" />

import { Chip } from '@mui/material';
import { CT } from '../../theme/tokens';

type Status = 'Drop-off' | 'Pick-up' | 'Late' | 'Absent';

const CONFIG: Record<Status, { bg: string; label: string; emoji: string }> = {
  'Drop-off': { bg: CT.status.dropoff.bg, label: 'Drop-off', emoji: '🌅' },
  'Pick-up':  { bg: CT.status.pickup.bg,  label: 'Pick-up',  emoji: '🌇' },
  'Late':     { bg: CT.status.late.bg,    label: 'Late',     emoji: '⏰' },
  'Absent':   { bg: CT.status.absent.bg,  label: 'Absent',   emoji: '❌' },
};

interface Props {
  status: Status | string;
  showEmoji?: boolean;
  size?: 'small' | 'medium';
}

export default function CTStatusChip({ status, showEmoji = false, size = 'small' }: Props) {
  const cfg = CONFIG[status as Status] ?? { bg: CT.gray[400], label: status, emoji: '' };
  return (
    <Chip
      label={showEmoji ? `${cfg.emoji} ${cfg.label}` : cfg.label}
      size={size}
      sx={{
        background:    cfg.bg,
        color:         '#fff',
        fontWeight:    700,
        fontSize:      size === 'small' ? '0.72rem' : '0.82rem',
        borderRadius:  CT.radius.sm,
        letterSpacing: '0.02em',
      }}
    />
  );
}