// src/components/ui/CTEmptyState.tsx
// ─── Empty state for tables and lists ─────────────────────────────────────────
//
// Usage:
//   <CTEmptyState />
//   <CTEmptyState icon="📋" title="No records" description="Scan a QR code to begin." />
//   <CTEmptyState action={<CTButton>Add Student</CTButton>} />

import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { CT } from '../../theme/tokens';

interface Props {
  icon?:        string;
  title?:       string;
  description?: string;
  action?:      ReactNode;
  minHeight?:   number | string;
}

export default function CTEmptyState({
  icon        = '📭',
  title       = 'No records yet',
  description = 'Nothing to display here.',
  action,
  minHeight   = 220,
}: Props) {
  return (
    <Box sx={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      minHeight,
      py: 6,
      px: 3,
      textAlign: 'center',
    }}>
      <Typography fontSize="3.5rem" mb={1.5} sx={{ opacity: 0.6 }}>
        {icon}
      </Typography>
      <Typography
        variant="h6" fontWeight={700}
        color={CT.gray[600]} gutterBottom
      >
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={action ? 3 : 0}>
        {description}
      </Typography>
      {action}
    </Box>
  );
}