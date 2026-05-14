// src/components/ui/CTButton.tsx
// ─── ChildTrack Unified Button ────────────────────────────────────────────────
// Use this instead of raw MUI <Button> everywhere in the app.
// Guarantees consistent height, weight, radius, and hover behavior.
//
// Usage:
//   <CTButton>Save</CTButton>
//   <CTButton variant="outline">Cancel</CTButton>
//   <CTButton variant="ghost" icon={<Delete />}>Remove</CTButton>
//   <CTButton variant="danger">Delete</CTButton>
//   <CTButton loading>Saving...</CTButton>

import type { ReactNode } from 'react';
import { Button, Box, CircularProgress, type ButtonProps } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { CT } from '../../theme/tokens';

type CTVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'white';

interface CTButtonProps extends Omit<ButtonProps, 'variant' | 'color'> {
  variant?: CTVariant;
  loading?: boolean;
  icon?:    ReactNode;
  children?: ReactNode;
}

const STYLES: Record<CTVariant, SxProps<Theme>> = {
  primary: {
    background:  CT.green[800],
    color:       '#fff',
    '&:hover':   { background: CT.green[700], boxShadow: CT.shadow.green },
    '&:active':  { background: CT.green[900] },
  },
  outline: {
    background:  'transparent',
    color:       CT.green[800],
    border:      `2px solid ${CT.green[800]}`,
    '&:hover':   { background: CT.green[50], borderColor: CT.green[700] },
  },
  ghost: {
    background:  'transparent',
    color:       CT.green[800],
    '&:hover':   { background: CT.green[50] },
  },
  danger: {
    background:  CT.status.absent.bg,
    color:       '#fff',
    '&:hover':   { background: '#b02a37', boxShadow: '0 4px 12px rgba(220,53,69,0.35)' },
    '&.Mui-disabled': { opacity: 0.5 },
  },
  success: {
    background:  CT.status.dropoff.bg,
    color:       '#fff',
    '&:hover':   { background: '#1e7e34' },
  },
  warning: {
    background:  CT.status.late.bg,
    color:       '#fff',
    '&:hover':   { background: '#e65100' },
  },
  white: {
    background:  '#ffffff',
    color:       CT.green[800],
    boxShadow:   CT.shadow.sm,
    '&:hover':   { background: CT.green[50], boxShadow: CT.shadow.md },
  },
};

export default function CTButton({
  variant  = 'primary',
  loading  = false,
  icon,
  children,
  disabled,
  sx,
  ...rest
}: CTButtonProps) {
  return (
    <Button
      disableElevation
      disabled={disabled || loading}
      startIcon={loading ? undefined : icon}
      {...rest}
      sx={{
        fontWeight:    700,
        minHeight:     44,
        borderRadius:  CT.radius.md,
        textTransform: 'none',
        px:            2.5,
        boxShadow:     'none',
        transition:    'all 0.18s ease',
        '&.Mui-disabled': { opacity: 0.5 },
        ...STYLES[variant],
        ...sx,
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CircularProgress size={18} color="inherit" sx={{ mr: children ? 1 : 0 }} />
          {children}
        </Box>
      ) : (
        children
      )}
    </Button>
  );
}