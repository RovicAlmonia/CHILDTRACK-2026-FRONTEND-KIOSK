
// src/components/ui/CTPageHeader.tsx
// ─── Page Header with back button, title, and optional right actions ──────────
//
// Usage:
//   <CTPageHeader title="Student Registration" back="/dashboard" />
//   <CTPageHeader title="Dashboard" actions={<CTButton>Export</CTButton>} />

import type { ReactNode } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { CT } from '../../theme/tokens';

interface CTPageHeaderProps {
  title:    string;
  subtitle?: string;
  back?:    string;        // route to go back to
  onBack?:  () => void;   // custom back handler
  actions?: ReactNode;    // right-side slot
  icon?:    ReactNode;
}

export default function CTPageHeader({
  title, subtitle, back, onBack, actions, icon,
}: CTPageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (back)   { navigate(back); return; }
    navigate(-1);
  };

  return (
    <Box sx={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      mb:             3,
      pb:             2,
      borderBottom:   `2px solid ${CT.green[100]}`,
    }}>
      <Box display="flex" alignItems="center" gap={1.5}>
        {(back !== undefined || onBack) && (
          <Tooltip title="Go back">
            <IconButton
              onClick={handleBack}
              size="small"
              sx={{
                background:  CT.green[100],
                color:       CT.green[800],
                '&:hover':   { background: CT.green[800], color: '#fff' },
                transition:  'all 0.18s ease',
              }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {icon && (
          <Typography fontSize="1.6rem" lineHeight={1}>{icon}</Typography>
        )}
        <Box>
          <Typography variant="h5" fontWeight={800} color={CT.green[800]} lineHeight={1.1}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" mt={0.25}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {actions && (
        <Box display="flex" gap={1} alignItems="center">
          {actions}
        </Box>
      )}
    </Box>
  );
}