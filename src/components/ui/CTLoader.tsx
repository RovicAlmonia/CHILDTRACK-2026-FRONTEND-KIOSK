// src/components/ui/CTLoader.tsx
// ─── Full-area loading spinner ────────────────────────────────────────────────
//
// Usage:
//   {loading && <CTLoader />}
//   <CTLoader size={24} inline />          ← inline spinner (no min-height)
//   <CTLoader message="Loading records…" />

import { Box, CircularProgress, Typography } from '@mui/material';
import { CT } from '../../theme/tokens';

interface Props {
  size?:     number;
  message?:  string;
  inline?:   boolean;
  minHeight?: number | string;
}

export default function CTLoader({ size = 36, message, inline = false, minHeight = 200 }: Props) {
  if (inline) {
    return <CircularProgress size={size} sx={{ color: CT.green[800] }} />;
  }

  return (
    <Box sx={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      minHeight,
      gap: 2,
    }}>
      <CircularProgress size={size} sx={{ color: CT.green[800] }} />
      {message && (
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {message}
        </Typography>
      )}
    </Box>
  );
}