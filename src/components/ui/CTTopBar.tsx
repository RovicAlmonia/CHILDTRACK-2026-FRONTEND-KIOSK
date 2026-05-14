// src/components/ui/CTTopBar.tsx
// ─── Dashboard top header bar ─────────────────────────────────────────────────
// The green header strip shown above the main content area.
//
// Usage:
//   <CTTopBar title="Today's Attendance" />
//   <CTTopBar title="Dashboard" left={<IconButton>...</IconButton>} right={<DateChip />} />

import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { CT } from '../../theme/tokens';

interface Props {
  title:   string;
  left?:   ReactNode;
  right?:  ReactNode;
  sx?:     object;
}

export default function CTTopBar({ title, left, right, sx }: Props) {
  return (
    <Box sx={{
      background:    CT.green[800],
      px:            3,
      py:            1.75,
      display:       'flex',
      alignItems:    'center',
      justifyContent:'space-between',
      boxShadow:     '0 2px 8px rgba(0,0,0,0.2)',
      flexShrink:    0,
      ...sx,
    }}>
      {/* Left */}
      <Box display="flex" alignItems="center" gap={2}>
        {left}
        <Typography
          variant="h5"
          fontWeight={800}
          color="#ffffff"
          fontFamily={CT.font.family}
          letterSpacing="-0.01em"
        >
          {title}
        </Typography>
      </Box>

      {/* Right */}
      {right && (
        <Box display="flex" alignItems="center" gap={1.5}>
          {right}
        </Box>
      )}
    </Box>
  );
}