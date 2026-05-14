// src/components/ui/CTAlert.tsx
// ─── Inline alert message (not snackbar) ──────────────────────────────────────
//
// Usage:
//   <CTAlert type="success">Saved successfully!</CTAlert>
//   <CTAlert type="error">Something went wrong.</CTAlert>
//   <CTAlert type="warning" onClose={() => setMsg(null)}>Watch out.</CTAlert>

import { Alert, Collapse } from '@mui/material';
import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material';
import { CT } from '../../theme/tokens';

interface Props {
  type?:     'success' | 'error' | 'warning' | 'info';
  children:  ReactNode;
  show?:     boolean;
  onClose?:  () => void;
  sx?:       SxProps<Theme>;
}

export default function CTAlert({ type = 'info', children, show = true, onClose, sx }: Props) {
  return (
    <Collapse in={show}>
      <Alert
        severity={type}
        variant="filled"
        onClose={onClose}
        sx={{
          borderRadius: CT.radius.md,
          fontWeight:   600,
          mb:           2,
          ...sx,
        }}
      >
        {children}
      </Alert>
    </Collapse>
  );
}