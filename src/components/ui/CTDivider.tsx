// src/components/ui/CTDivider.tsx
// ─── Labeled or plain divider ─────────────────────────────────────────────────
//
// Usage:
//   <CTDivider />
//   <CTDivider label="Student Details" />

import { Box, Divider, Typography } from '@mui/material';
import { CT } from '../../theme/tokens';

interface Props { label?: string; my?: number; }

export default function CTDivider({ label, my = 2 }: Props) {
  if (!label) return <Divider sx={{ my, borderColor: CT.gray[200] }} />;

  return (
    <Box display="flex" alignItems="center" gap={1.5} my={my}>
      <Divider sx={{ flex: 1, borderColor: CT.gray[200] }} />
      <Typography
        variant="caption"
        sx={{
          color:         CT.gray[400],
          fontWeight:    700,
          fontSize:      '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          whiteSpace:    'nowrap',
        }}
      >
        {label}
      </Typography>
      <Divider sx={{ flex: 1, borderColor: CT.gray[200] }} />
    </Box>
  );
}