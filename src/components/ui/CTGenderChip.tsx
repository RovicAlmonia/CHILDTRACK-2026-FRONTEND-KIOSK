// src/components/ui/CTGenderChip.tsx
// ─── Gender display chip ───────────────────────────────────────────────────────
//
// Usage:
//   <CTGenderChip gender="M" />
//   <CTGenderChip gender="Female" />

import { Chip } from '@mui/material';
import { CT } from '../../theme/tokens';

interface Props {
  gender: 'M' | 'F' | 'Male' | 'Female' | string;
  size?:  'small' | 'medium';
}

export default function CTGenderChip({ gender, size = 'small' }: Props) {
  const isMale = gender === 'M' || gender === 'Male';
  return (
    <Chip
      label={isMale ? '♂ Male' : '♀ Female'}
      size={size}
      sx={{
        background:    isMale ? CT.gender.male.bg : CT.gender.female.bg,
        color:         '#fff',
        fontWeight:    700,
        fontSize:      size === 'small' ? '0.72rem' : '0.82rem',
        borderRadius:  CT.radius.sm,
      }}
    />
  );
}