// src/components/ui/CTModal.tsx
// ─── Unified modal / dialog wrapper ───────────────────────────────────────────
// Consistent green header, rounded corners, footer action slot.
//
// Usage:
//   <CTModal
//     open={open}
//     onClose={() => setOpen(false)}
//     title="Edit Status"
//     actions={<><CTButton variant="outline" onClick={onClose}>Cancel</CTButton>
//               <CTButton onClick={handleSave}>Save</CTButton></>}
//   >
//     <p>Modal body content here</p>
//   </CTModal>

import type { ReactNode } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Typography, Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { CT } from '../../theme/tokens';

interface CTModalProps {
  open:       boolean;
  onClose:    () => void;
  title:      string;
  icon?:      string;
  maxWidth?:  'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?:  boolean;
  actions?:   ReactNode;
  children:   ReactNode;
  noPad?:     boolean;
}

export default function CTModal({
  open, onClose, title, icon,
  maxWidth  = 'sm',
  fullWidth = true,
  actions,
  children,
  noPad = false,
}: CTModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: CT.radius.xl,
          overflow:     'hidden',
          boxShadow:    CT.shadow.xl,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: CT.green[800],
          color:      '#fff',
          p:          0,
        }}
      >
        <Box sx={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          px: 3, py: 2,
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            {icon && <Typography fontSize="1.3rem">{icon}</Typography>}
            <Typography
              variant="h6"
              fontWeight={700}
              color="#fff"
              fontFamily={CT.font.family}
            >
              {title}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color:     'rgba(255,255,255,0.7)',
              '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.15)' },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Body */}
      <DialogContent sx={noPad ? { p: 0 } : { px: 3, py: 2.5 }}>
        {children}
      </DialogContent>

      {/* Footer */}
      {actions && (
        <DialogActions sx={{
          px: 3, py: 2,
          gap: 1,
          borderTop: `1px solid ${CT.gray[200]}`,
          background: CT.gray[50],
        }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}