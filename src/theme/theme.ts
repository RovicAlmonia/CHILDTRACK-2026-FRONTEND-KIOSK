// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';
import { CT } from './tokens';

const theme = createTheme({
  palette: {
    primary: {
      main:         CT.green[800],
      light:        CT.green[700],
      dark:         CT.green[900],
      contrastText: '#ffffff',
    },
    secondary: {
      main:         CT.yellow[500],
      contrastText: '#000000',
    },
    success: { main: CT.status.dropoff.bg },
    warning: { main: CT.status.late.bg   },
    error:   { main: CT.status.absent.bg },
    info:    { main: CT.status.pickup.bg },
    background: {
      default: CT.pageBg,
      paper:   CT.paperBg,
    },
    text: {
      primary:   CT.gray[900],
      secondary: CT.gray[500],
    },
  },

  typography: {
    fontFamily: CT.font.body,
    h1: { fontFamily: CT.font.family, fontWeight: 800 },
    h2: { fontFamily: CT.font.family, fontWeight: 800 },
    h3: { fontFamily: CT.font.family, fontWeight: 800 },
    h4: { fontFamily: CT.font.family, fontWeight: 700 },
    h5: { fontFamily: CT.font.family, fontWeight: 700 },
    h6: { fontFamily: CT.font.family, fontWeight: 700 },
    button: { fontFamily: CT.font.body, fontWeight: 600, textTransform: 'none' },
    caption: { fontFamily: CT.font.body },
    overline: { fontFamily: CT.font.family, fontWeight: 700, letterSpacing: '0.08em' },
  },

  shape: { borderRadius: CT.radius.md },

  shadows: [
    'none',
    CT.shadow.sm,
    CT.shadow.sm,
    CT.shadow.md,
    CT.shadow.md,
    CT.shadow.md,
    CT.shadow.md,
    CT.shadow.lg,
    CT.shadow.lg,
    CT.shadow.lg,
    CT.shadow.lg,
    CT.shadow.lg,
    CT.shadow.lg,
    CT.shadow.xl,
    CT.shadow.xl,
    CT.shadow.xl,
    CT.shadow.xl,
    CT.shadow.xl,
    CT.shadow.xl,
    CT.shadow.xl,
    CT.shadow.xl,
    CT.shadow.xl,
    CT.shadow.xl,
    CT.shadow.xl,
    CT.shadow.xl,
  ] as any,

  components: {
    // ── Button ──────────────────────────────────────────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight:    700,
          minHeight:     44,
          borderRadius:  CT.radius.md,
          boxShadow:     'none',
          '&:hover': { boxShadow: CT.shadow.sm },
        },
        containedPrimary: {
          background: CT.green[800],
          '&:hover':  { background: CT.green[700] },
        },
      },
    },

    // ── TextField ───────────────────────────────────────────────────────────────
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: CT.radius.md,
            background:   CT.gray[50],
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: CT.green[600],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: CT.green[800],
              borderWidth:  2,
            },
          },
        },
      },
    },

    // ── Select ──────────────────────────────────────────────────────────────────
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: CT.radius.md },
      },
    },

    // ── Paper ───────────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: CT.radius.lg,
          boxShadow:    CT.shadow.md,
        },
      },
    },

    // ── Table Head ──────────────────────────────────────────────────────────────
    MuiTableCell: {
      styleOverrides: {
        head: {
          background:    CT.green[800],
          color:         '#ffffff',
          fontWeight:    700,
          fontFamily:    CT.font.family,
          textTransform: 'uppercase',
          fontSize:      '0.78rem',
          letterSpacing: '0.06em',
          padding:       '12px 16px',
        },
        body: {
          padding:    '10px 16px',
          fontSize:   '0.875rem',
          color:      CT.gray[800],
        },
      },
    },

    // ── TableRow ────────────────────────────────────────────────────────────────
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { background: CT.green[50] },
          '&:last-child td': { border: 0 },
        },
      },
    },

    // ── Chip ────────────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight:    700,
          fontSize:      '0.72rem',
          borderRadius:  CT.radius.sm,
          letterSpacing: '0.02em',
        },
      },
    },

    // ── Divider ─────────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: CT.gray[200] },
      },
    },

    // ── Dialog ──────────────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: CT.radius.xl,
          boxShadow:    CT.shadow.xl,
        },
      },
    },

    // ── Tooltip ─────────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background:   CT.gray[900],
          fontSize:     '0.78rem',
          borderRadius: CT.radius.sm,
        },
      },
    },

    // ── Snackbar / Alert ────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: CT.radius.md,
          fontWeight:   600,
        },
        filledSuccess: { background: CT.status.dropoff.bg },
        filledError:   { background: CT.status.absent.bg  },
        filledWarning: { background: CT.status.late.bg    },
        filledInfo:    { background: CT.status.pickup.bg  },
      },
    },
  },
});

export default theme;