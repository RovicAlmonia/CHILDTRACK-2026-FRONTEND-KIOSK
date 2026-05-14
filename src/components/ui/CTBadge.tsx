// src/components/ui/CTBadge.tsx
// ─── Small count or label badge ───────────────────────────────────────────────
//
// Usage:
//   <CTBadge count={5} />
//   <CTBadge count={12} color="red" />
//   <CTBadge label="NEW" color="green" />

import { Box, Typography } from '@mui/material';
import { CT } from '../../theme/tokens';

type BadgeColor = 'green' | 'blue' | 'red' | 'yellow' | 'gray';

const COLOR_MAP: Record<BadgeColor, { bg: string; text: string }> = {
  green:  { bg: CT.green[800],          text: '#fff' },
  blue:   { bg: CT.status.pickup.bg,    text: '#fff' },
  red:    { bg: CT.status.absent.bg,    text: '#fff' },
  yellow: { bg: CT.yellow[500],         text: '#000' },
  gray:   { bg: CT.gray[400],           text: '#fff' },
};

interface Props {
  count?: number;
  label?: string;
  color?: BadgeColor;
  max?:   number;    // cap display (e.g. 99+)
}

export default function CTBadge({ count, label, color = 'green', max = 99 }: Props) {
  const { bg, text } = COLOR_MAP[color];
  const display = label ?? (count !== undefined
    ? (count > max ? `${max}+` : String(count))
    : '0');

  return (
    <Box
      component="span"
      sx={{
        display:       'inline-flex',
        alignItems:    'center',
        justifyContent:'center',
        minWidth:      20,
        height:        20,
        px:            0.75,
        borderRadius:  CT.radius.full,
        background:    bg,
        lineHeight:    1,
      }}
    >
      <Typography
        component="span"
        sx={{ color: text, fontWeight: 800, fontSize: '0.68rem', fontFamily: CT.font.family }}
      >
        {display}
      </Typography>
    </Box>
  );
}