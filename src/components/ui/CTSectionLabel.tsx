// src/components/ui/CTSectionLabel.tsx
// ─── Section heading label used inside cards and forms ────────────────────────
//
// Usage:
//   <CTSectionLabel>Scanner Controls</CTSectionLabel>
//   <CTSectionLabel icon="📱">Scanner Controls</CTSectionLabel>

import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { CT } from '../../theme/tokens';

interface Props {
  children: ReactNode;
  icon?:    string;
  mb?:      number;
}

export default function CTSectionLabel({ children, icon, mb = 1 }: Props) {
  return (
    <Box display="flex" alignItems="center" gap={0.75} mb={mb}>
      {icon && <Typography fontSize="0.85rem">{icon}</Typography>}
      <Typography
        variant="overline"
        sx={{
          color:         CT.gray[500],
          fontWeight:    700,
          fontSize:      '0.7rem',
          letterSpacing: '0.08em',
          lineHeight:    1,
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}