// src/components/dashboard/Sidebar.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Switch, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import StopIcon          from '@mui/icons-material/Stop';
import AccessTimeIcon    from '@mui/icons-material/AccessTime';
import ShieldIcon        from '@mui/icons-material/Shield';
import AccessAlarmIcon   from '@mui/icons-material/AccessAlarm';
import LightModeIcon     from '@mui/icons-material/LightMode';
import DarkModeIcon      from '@mui/icons-material/DarkMode';
import LogoutIcon        from '@mui/icons-material/Logout';
import { useAuth }       from '../../context/AuthContext';
import LOGO_DARK         from '../../assets/pop.png';
import LOGO_LIGHT        from '../../assets/lop.png';


interface Props {
  mode:              'Drop-off' | 'Pick-up';
  onModeChange:      (m: 'Drop-off' | 'Pick-up') => void;
  scannerOn:         boolean;
  scanning:          boolean;
  onScannerToggle:   (v: boolean) => void;
  isOnline:          boolean;
  teacher:           any;
  classTime:         string;
  onClassTimeChange: (t: string) => void;
  onOpenGuardian:    () => void;
  dark:              boolean;
  onToggleDark:      () => void;
  clock:             string;
}

/* ─────────────────────────────────────────────────────────────────
   Theme tokens — sourced from AttendancePage.tsx
   Dark  : sidebar bg #1e293b, accent #38c586/#4ade80, text #e2e8f0,
           muted #64748b, border rgba(56,197,134,0.15)
   Light : sidebar bg #ffffff, accent #2d5016, text #1e293b,
           muted #6b7280, border #e5e7eb
───────────────────────────────────────────────────────────────── */

/* ── Sidebar shell background ── */
const shellSx = (dark: boolean) => ({
  width: 252,
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  overflowY: 'auto' as const,
  scrollbarWidth: 'none' as const,
  '&::-webkit-scrollbar': { display: 'none' },
  background: dark ? '#1e293b' : '#ffffff',
  borderRight: `1px solid ${dark ? 'rgba(56,197,134,0.12)' : '#e5e7eb'}`,
  boxShadow: dark ? 'none' : '1px 0 4px rgba(0,0,0,0.06)',
});

/* ── Brand header ── */
const brandHeaderSx = (dark: boolean) => ({
  position: 'relative' as const,
  overflow: 'hidden',
  borderBottom: `1px solid ${dark ? 'rgba(56,197,134,0.14)' : '#f0f0f0'}`,
  '&::after': {
    content: '""',
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
    background: dark
      ? 'linear-gradient(90deg,transparent,rgba(56,197,134,0.45),transparent)'
      : 'linear-gradient(90deg,transparent,rgba(45,80,22,0.25),transparent)',
  },
});

/* ── Clock ── */
const clockSx = (dark: boolean) => ({
  fontFamily: "'Nunito', sans-serif",
  fontSize: '1.5rem', fontWeight: 700,
  color: dark ? '#38c586' : '#2d5016',
  lineHeight: 1, letterSpacing: '0.02em',
});

/* ── Date text ── */
const dateSx = (dark: boolean) => ({
  fontSize: '0.63rem',
  color: dark ? 'rgba(226,232,240,0.38)' : '#9ca3af',
  mt: '3px',
});

/* ── Status pill ── */
const pillSx = (dark: boolean) => ({
  display: 'inline-flex', alignItems: 'center', gap: '7px', mt: '8px',
  background: dark ? 'rgba(56,197,134,0.1)' : 'rgba(45,80,22,0.07)',
  border: `1px solid ${dark ? 'rgba(56,197,134,0.2)' : 'rgba(45,80,22,0.18)'}`,
  borderRadius: '20px', px: '11px', py: '4px',
  fontSize: '0.68rem',
  color: dark ? '#e2e8f0' : '#2d5016',
  maxWidth: '100%', overflow: 'hidden',
});

/* ── Nav section label ── */
const navLabelSx = (dark: boolean) => ({
  fontFamily: "'Nunito', sans-serif",
  fontSize: '0.57rem', fontWeight: 800,
  letterSpacing: '0.14em', textTransform: 'uppercase' as const,
  color: dark ? 'rgba(226,232,240,0.28)' : '#9ca3af',
  px: 1, mb: 0.5, mt: 0.75,
});

/* ── Nav separator ── */
const navSepSx = (dark: boolean) => ({
  height: '1px', mx: 1.25, my: 1,
  background: dark ? 'rgba(255,255,255,0.06)' : '#f0f0f0',
});

/* ── Nav button ── */
const navBtnSx = (dark: boolean, active = false, danger = false) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '9px',
  px: 1.25,
  py: 0.9,
  mb: '1px',
  borderRadius: '8px',
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 700,
  fontSize: '0.82rem',
  textTransform: 'none' as const,
  color: danger
    ? (dark ? 'rgba(252,165,165,0.5)' : 'rgba(220,38,38,0.45)')
    : active
    ? (dark ? '#4ade80' : '#2d5016')
    : (dark ? 'rgba(226,232,240,0.55)' : '#6b7280'),
  background: active
    ? (dark
        ? 'linear-gradient(135deg,rgba(56,197,134,0.2),rgba(56,197,134,0.1))'
        : 'rgba(45,80,22,0.08)')
    : 'transparent',
  border: active
    ? `1px solid ${dark ? 'rgba(56,197,134,0.25)' : 'rgba(45,80,22,0.2)'}`
    : danger
    ? '1px solid transparent'
    : 'none',
  '&:hover': {
    background: danger
      ? (dark ? 'rgba(208,72,72,0.1)' : 'rgba(220,38,38,0.06)')
      : active
      ? (dark
          ? 'linear-gradient(135deg,rgba(56,197,134,0.3),rgba(56,197,134,0.18))'
          : 'rgba(45,80,22,0.14)')
      : (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'),
    color: danger
      ? (dark ? '#fca5a5' : '#dc2626')
      : active
      ? (dark ? '#86efac' : '#2d5016')
      : (dark ? '#e2e8f0' : '#374151'),
    borderColor: danger
      ? (dark ? 'rgba(208,72,72,0.2)' : 'rgba(220,38,38,0.15)')
      : active
      ? (dark ? 'rgba(56,197,134,0.4)' : 'rgba(45,80,22,0.3)')
      : 'transparent',
  },
});

/* ── Scanner button ── */
const scanBtnSx = (dark: boolean, on: boolean) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '9px',
  px: 1.25,
  py: 0.9,
  mb: '1px',
  borderRadius: '8px',
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 700,
  fontSize: '0.82rem',
  textTransform: 'none' as const,
  background: on
    ? (dark
        ? 'linear-gradient(135deg,rgba(230,57,70,0.2),rgba(230,57,70,0.1))'
        : 'rgba(220,38,38,0.07)')
    : (dark
        ? 'linear-gradient(135deg,rgba(56,197,134,0.2),rgba(56,197,134,0.1))'
        : 'rgba(45,80,22,0.08)'),
  border: on
    ? `1px solid ${dark ? 'rgba(230,57,70,0.25)' : 'rgba(220,38,38,0.2)'}`
    : `1px solid ${dark ? 'rgba(56,197,134,0.25)' : 'rgba(45,80,22,0.2)'}`,
  color: on
    ? (dark ? '#fca5a5' : '#dc2626')
    : (dark ? '#4ade80' : '#2d5016'),
  '&:hover': {
    background: on
      ? (dark
          ? 'linear-gradient(135deg,rgba(230,57,70,0.3),rgba(230,57,70,0.18))'
          : 'rgba(220,38,38,0.12)')
      : (dark
          ? 'linear-gradient(135deg,rgba(56,197,134,0.3),rgba(56,197,134,0.18))'
          : 'rgba(45,80,22,0.14)'),
  },
});

/* ── Mode label ── */
const modeLabelSx = (dark: boolean, isDropOff: boolean) => ({
  fontSize: '0.82rem', fontWeight: 700,
  color: isDropOff
    ? (dark ? '#4ade80' : '#2d5016')
    : (dark ? '#93c5fd' : '#2563eb'),
  fontFamily: "'Nunito', sans-serif",
});

/* ── Switch track ── */
const switchSx = (dark: boolean) => ({
  '& .MuiSwitch-thumb': { bgcolor: '#fff' },
  '& .Mui-checked + .MuiSwitch-track': {
    bgcolor: `${dark ? 'rgba(56,197,134,0.55)' : 'rgba(45,80,22,0.5)'} !important`,
  },
});

/* ── Dialogs ── */
const dlgPaperSx = (dark: boolean) => ({
  background: dark ? '#1e293b' : '#ffffff',
  color: dark ? '#e2e8f0' : '#1e293b',
  border: `1px solid ${dark ? 'rgba(56,197,134,0.15)' : '#e5e7eb'}`,
  borderRadius: '14px',
  fontFamily: "'Nunito', sans-serif",
  boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 8px 30px rgba(0,0,0,0.12)',
});

const dlgTitleSx = (dark: boolean) => ({
  fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1rem',
  color: dark ? '#e2e8f0' : '#1e293b', pt: 3, pb: 1,
});

const dlgBodySx = (dark: boolean) => ({
  fontFamily: "'Nunito', sans-serif",
  color: dark ? 'rgba(226,232,240,0.5)' : '#6b7280',
  fontSize: '0.875rem', lineHeight: 1.7,
});

const muiInputSx = (dark: boolean) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontFamily: "'Nunito', sans-serif",
    '& fieldset':             { borderColor: dark ? 'rgba(56,197,134,0.2)' : '#d1d5db' },
    '&:hover fieldset':       { borderColor: dark ? 'rgba(56,197,134,0.45)' : '#2d5016' },
    '&.Mui-focused fieldset': { borderColor: dark ? '#38c586' : '#2d5016' },
  },
  '& input': {
    color: dark ? '#e2e8f0' : '#1e293b',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 600,
    fontSize: '1rem',
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'Nunito', sans-serif",
    color: dark ? 'rgba(226,232,240,0.5)' : '#9ca3af',
  },
});

const primaryBtnSx = (dark: boolean) => ({
  px: 3, borderRadius: '10px', fontWeight: 700,
  fontFamily: "'Nunito', sans-serif", textTransform: 'none' as const,
  background: dark
    ? 'linear-gradient(135deg,#38c586,#2da86e)'
    : 'linear-gradient(135deg,#2d5016,#4a7a25)',
  boxShadow: dark
    ? '0 4px 14px rgba(56,197,134,0.3)'
    : '0 4px 14px rgba(45,80,22,0.25)',
  '&:hover': {
    background: dark
      ? 'linear-gradient(135deg,#2da86e,#1e8a5a)'
      : 'linear-gradient(135deg,#3a6420,#5a8a30)',
  },
});

const dangerBtnSx = {
  px: 3, borderRadius: '10px', fontWeight: 700,
  fontFamily: "'Nunito', sans-serif", textTransform: 'none' as const,
  background: 'linear-gradient(135deg,#e63946,#c62828)',
  '&:hover': { background: '#b91c1c' },
};

const cancelBtnSx = (dark: boolean) => ({
  fontFamily: "'Nunito', sans-serif", fontWeight: 700,
  textTransform: 'none' as const,
  color: dark ? 'rgba(226,232,240,0.45)' : '#9ca3af',
  '&:hover': {
    background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
  },
});

/* ── Sub-components ── */
function NavLabel({ dark, children }: { dark: boolean; children: React.ReactNode }) {
  return <Typography sx={navLabelSx(dark)}>{children}</Typography>;
}

function NavSep({ dark }: { dark: boolean }) {
  return <Box sx={navSepSx(dark)} />;
}

/* ════════════════════════════════════════════════════════
   Sidebar
════════════════════════════════════════════════════════ */
export default function Sidebar({
  mode, onModeChange, scannerOn, scanning, onScannerToggle,
  isOnline, teacher, classTime, onClassTimeChange,
  onOpenGuardian, dark, onToggleDark, clock,
}: Props) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [timeDialog,   setTimeDialog]   = useState(false);
  const [tempTime,     setTempTime]     = useState(classTime);
  const [logoutDialog, setLogoutDialog] = useState(false);

  const todayLong = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'Asia/Manila',
  });

  return (
    <>
      {/* ── Class Time Dialog ── */}
      <Dialog
        open={timeDialog}
        onClose={() => setTimeDialog(false)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: dlgPaperSx(dark) }}
      >
        <DialogTitle sx={dlgTitleSx(dark)}>
          Class Start Time
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ ...dlgBodySx(dark), mb: 2.5, fontSize: '0.82rem', lineHeight: 1.7 }}>
            Students scanned 30+ minutes after this time are marked Late.
          </Typography>
          <TextField
            type="time" fullWidth value={tempTime}
            onChange={e => setTempTime(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={muiInputSx(dark)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setTimeDialog(false)} sx={cancelBtnSx(dark)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => { onClassTimeChange(tempTime); setTimeDialog(false); }}
            sx={primaryBtnSx(dark)}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Logout Dialog ── */}
      <Dialog
        open={logoutDialog}
        onClose={() => setLogoutDialog(false)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: dlgPaperSx(dark) }}
      >
        <DialogTitle sx={dlgTitleSx(dark)}>
          Log Out
        </DialogTitle>
        <DialogContent>
          <Typography sx={dlgBodySx(dark)}>
            Are you sure you want to log out of ChildTrack?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setLogoutDialog(false)} sx={cancelBtnSx(dark)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setLogoutDialog(false); logout(); }} sx={dangerBtnSx}>
            Log Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════ Sidebar shell ════ */}
      <Box component="aside" sx={shellSx(dark)}>

        {/* ── Brand / Logo ── */}
        <Box sx={brandHeaderSx(dark)}>
          <Box
            component="img"
            src={dark ? LOGO_DARK : LOGO_LIGHT}
            alt="ChildTrack"
            sx={{ width: '100%', height: 'auto', display: 'block' }}
            onError={(e: any) => {
              e.target.style.display = 'none';
              const fb = e.target.nextSibling as HTMLElement;
              if (fb) fb.style.display = 'block';
            }}
          />
          {/* Fallback text logo */}
          <Typography sx={{
            display: 'none',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '1.35rem', fontWeight: 900,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: dark ? '#e2e8f0' : '#1e293b',
            p: '18px 18px 0', lineHeight: 1,
          }}>
            Child<Box component="span" sx={{ color: dark ? '#38c586' : '#2d5016' }}>Track</Box>
          </Typography>

          {/* Brand info */}
          <Box sx={{ p: '10px 16px 14px' }}>
            <Typography sx={clockSx(dark)}>{clock}</Typography>
            <Typography sx={dateSx(dark)}>{todayLong}</Typography>

            {/* Status pill */}
            <Box sx={pillSx(dark)}>
              <Box sx={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                bgcolor: isOnline
                  ? (dark ? '#38c586' : '#16a34a')
                  : '#f59e0b',
                boxShadow: isOnline
                  ? `0 0 6px ${dark ? 'rgba(56,197,134,0.7)' : 'rgba(22,163,74,0.5)'}`
                  : 'none',
                animation: isOnline ? 'sb-blink 2s ease-in-out infinite' : 'none',
                '@keyframes sb-blink': {
                  '0%,100%': { opacity: 1 },
                  '50%':     { opacity: 0.3 },
                },
              }} />
              <Box component="span" sx={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontSize: '0.68rem', fontFamily: "'Nunito', sans-serif",
              }}>
                {teacher?.name || 'Teacher'}{teacher?.section ? ` · ${teacher.section}` : ''}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Nav ── */}
        <Box sx={{ p: '12px 10px 0', flex: 1 }}>

          {/* Scanner */}
          <NavLabel dark={dark}>Scanner</NavLabel>
          <Button
            sx={{
              ...scanBtnSx(dark, scannerOn),
              animation: scannerOn ? 'scan-pulse 2s ease-in-out infinite' : 'none',
              '@keyframes scan-pulse': {
                '0%,100%': { opacity: 1 },
                '50%':     { opacity: 0.55 },
              },
            }}
            onClick={() => onScannerToggle(!scannerOn)}
            startIcon={
              scannerOn
                ? (scanning
                  ? <AccessTimeIcon sx={{ fontSize: 17 }} />
                  : <StopIcon sx={{ fontSize: 17 }} />)
                : <QrCodeScannerIcon sx={{ fontSize: 17 }} />
            }
          >
            {scannerOn ? (scanning ? 'Processing…' : 'Stop Scanner') : 'Start Scanner'}
          </Button>

          <NavSep dark={dark} />

          {/* Mode */}
          <NavLabel dark={dark}>Mode</NavLabel>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 1.25, py: 0.75,
          }}>
            <Typography sx={modeLabelSx(dark, mode === 'Drop-off')}>
              {mode === 'Drop-off' ? 'Drop-off' : 'Pick-up'}
            </Typography>
            <Switch
              size="small"
              checked={mode === 'Drop-off'}
              onChange={e => onModeChange(e.target.checked ? 'Drop-off' : 'Pick-up')}
              sx={switchSx(dark)}
            />
          </Box>

          <NavSep dark={dark} />

          {/* Navigation */}
          <NavLabel dark={dark}>Navigation</NavLabel>
          <Button
            sx={navBtnSx(dark)}
            onClick={onOpenGuardian}
            startIcon={<ShieldIcon sx={{ fontSize: 17 }} />}
          >
            Register Guardian
          </Button>

          <NavSep dark={dark} />

          {/* Settings */}
          <NavLabel dark={dark}>Settings</NavLabel>
          <Button
            sx={navBtnSx(dark)}
            onClick={() => { setTempTime(classTime); setTimeDialog(true); }}
            startIcon={<AccessAlarmIcon sx={{ fontSize: 17 }} />}
          >
            Class at {classTime}
          </Button>
          <Button
            sx={navBtnSx(dark)}
            onClick={onToggleDark}
            startIcon={dark
              ? <LightModeIcon sx={{ fontSize: 17 }} />
              : <DarkModeIcon  sx={{ fontSize: 17 }} />}
          >
            {dark ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </Box>

        <Box sx={{ flex: 1, minHeight: '12px' }} />

        {/* ── Footer / Logout ── */}
        <Box sx={{ p: '0 10px 16px' }}>
          <Button
            sx={navBtnSx(dark, false, true)}
            startIcon={<LogoutIcon sx={{ fontSize: 17 }} />}
            onClick={() => setLogoutDialog(true)}
          >
            Log Out
          </Button>
        </Box>
      </Box>
    </>
  );
}