// src/components/ui/CTCard.tsx
// ─── ChildTrack Unified Card ──────────────────────────────────────────────────
// Replaces raw MUI <Paper> with consistent padding, radius, and optional accents.
//
// Usage:
//   <CTCard>...</CTCard>
//   <CTCard accent="green" title="Student Info" icon="📚">...</CTCard>
//   <CTCard variant="flat">...</CTCard>
//   <CTCard variant="outlined">...</CTCard>

import type { ReactNode } from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import type { PaperProps } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { CT } from '../../theme/tokens';

type CTCardVariant = 'elevated' | 'flat' | 'outlined';
type CTCardAccent  = 'green' | 'blue' | 'yellow' | 'red' | 'none';

interface CTCardProps extends Omit<PaperProps, 'variant'> {
  variant?:  CTCardVariant;
  accent?:   CTCardAccent;
  title?:    string;
  icon?:     ReactNode;
  action?:   ReactNode;
  noPad?:    boolean;
  children?: ReactNode;
}

const ACCENT_COLORS: Record<CTCardAccent, string> = {
  green:  CT.green[800],
  blue:   CT.status.pickup.bg,
  yellow: CT.yellow[500],
  red:    CT.status.absent.bg,
  none:   'transparent',
};

const VARIANT_STYLES: Record<CTCardVariant, SxProps<Theme>> = {
  elevated: { boxShadow: CT.shadow.md },
  flat:     { boxShadow: 'none', background: CT.gray[50] },
  outlined: { boxShadow: 'none', border: `1.5px solid ${CT.gray[200]}` },
};

export default function CTCard({
  variant  = 'elevated',
  accent   = 'none',
  title,
  icon,
  action,
  noPad    = false,
  children,
  sx,
  ...rest
}: CTCardProps) {
  const accentColor = ACCENT_COLORS[accent];
  const hasHeader   = title || icon || action;

  return (
    <Paper
      {...rest}
      sx={{
        borderRadius:  CT.radius.lg,
        overflow:      'visible',
        position:      'relative',
        ...VARIANT_STYLES[variant],
        ...(accent !== 'none' && {
          borderTop: `4px solid ${accentColor}`,
        }),
        ...sx,
      }}
    >
      {/* Optional Card Header */}
      {hasHeader && (
        <>
          <Box sx={{
            px: 2.5, py: 1.5,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
          }}>
            <Box display="flex" alignItems="center" gap={1}>
              {icon && (
                <Typography fontSize="1.2rem" lineHeight={1}>{icon}</Typography>
              )}
              {title && (
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color={accent !== 'none' ? accentColor : CT.gray[800]}
                  fontSize="0.95rem"
                >
                  {title}
                </Typography>
              )}
            </Box>
            {action && <Box>{action}</Box>}
          </Box>
          <Divider />
        </>
      )}

      {/* Card Body */}
      <Box sx={noPad ? {} : { p: 2.5 }}>
        {children}
      </Box>
    </Paper>
  );
}