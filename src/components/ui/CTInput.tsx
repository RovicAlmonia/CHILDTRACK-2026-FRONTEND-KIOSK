// src/components/ui/CTInput.tsx
// ─── Unified text input ────────────────────────────────────────────────────────
// Wraps MUI TextField with consistent styling and optional helper text.
//
// Usage:
//   <CTInput label="Full Name" value={name} onChange={e => setName(e.target.value)} />
//   <CTInput label="Password" type="password" required />
//   <CTInput label="LRN" mono />   ← monospace font for codes

import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import { CT } from '../../theme/tokens';

interface CTInputProps extends Omit<TextFieldProps, 'variant' | 'size'> {
  mono?: boolean;
}

export default function CTInput({ mono = false, sx, InputProps, ...rest }: CTInputProps) {
  return (
    <TextField
      variant="outlined"
      size="small"
      fullWidth
      {...rest}
      InputProps={{
        ...InputProps,
        sx: {
          fontFamily:   mono ? CT.font.mono : CT.font.body,
          borderRadius: CT.radius.md,
          background:   CT.gray[50],
          ...(InputProps?.sx as object),
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '&:hover fieldset':       { borderColor: CT.green[600] },
          '&.Mui-focused fieldset': {
            borderColor: CT.green[800],
            borderWidth:  2,
          },
        },
        ...sx,
      }}
    />
  );
}