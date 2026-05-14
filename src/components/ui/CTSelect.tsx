// src/components/ui/CTSelect.tsx
// ─── Unified select / dropdown ────────────────────────────────────────────────
//
// Usage:
//   <CTSelect label="Gender" value={gender} onChange={e => setGender(e.target.value)}>
//     <MenuItem value="Male">Male</MenuItem>
//     <MenuItem value="Female">Female</MenuItem>
//   </CTSelect>

import type { ReactNode } from 'react';
import { FormControl, InputLabel, Select, FormHelperText } from '@mui/material';
import type { SelectProps } from '@mui/material';
import { CT } from '../../theme/tokens';

interface CTSelectProps extends Omit<SelectProps, 'size'> {
  label:       string;
  helperText?: string;
  required?:   boolean;
  fullWidth?:  boolean;
  children:    ReactNode;
}

export default function CTSelect({
  label, helperText, required = false,
  fullWidth = true, children, sx, ...rest
}: CTSelectProps) {
  return (
    <FormControl
      fullWidth={fullWidth}
      required={required}
      size="small"
      sx={{ mb: 0 }}
    >
      <InputLabel sx={{
        '&.Mui-focused': { color: CT.green[800] },
      }}>
        {label}
      </InputLabel>
      <Select
        label={label}
        {...rest}
        sx={{
          borderRadius: CT.radius.md,
          background:   CT.gray[50],
          '& .MuiOutlinedInput-notchedOutline': {
            '&:hover': { borderColor: CT.green[600] },
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: CT.green[800],
            borderWidth:  2,
          },
          ...sx,
        }}
      >
        {children}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}