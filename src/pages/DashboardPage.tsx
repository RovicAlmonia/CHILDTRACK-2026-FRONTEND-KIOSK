// src/pages/DashboardPage.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Box, Button, Typography, Chip, Avatar, Tooltip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Card, CardContent,
} from '@mui/material';
import CheckCircleIcon   from '@mui/icons-material/CheckCircle';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon   from '@mui/icons-material/ArrowUpward';
import AccessTimeIcon    from '@mui/icons-material/AccessTime';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon        from '@mui/icons-material/Search';
import FilterAltIcon     from '@mui/icons-material/FilterAlt';
import RefreshIcon       from '@mui/icons-material/Refresh';
import DeleteIcon        from '@mui/icons-material/Delete';
import LightModeIcon     from '@mui/icons-material/LightMode';
import DarkModeIcon      from '@mui/icons-material/DarkMode';

import { useAuth }          from '../context/AuthContext';
import api                  from '../api/client';
import type { AttendanceRecord, QRPayload } from '../types';
import PrivacyNotice        from '../components/shared/PrivacyNotice';
import PhotoCaptureModal    from '../components/shared/PhotoCapturedModal';
import GuardianDrawer       from '../components/guardian/GuardianDrawer';
import Sidebar              from '../components/layout/Sidebar';
import { useScanner }       from '../hooks/useScanner';
import { enqueueRecord, syncQueue } from '../utils/offlineQueue';


/* ── Types ── */
type SnackT = 'success' | 'error' | 'warning' | 'info';
type Snack  = { id: number; msg: string; type: SnackT };
type Dlg    = { open: boolean; title: string; body: string; label?: string; danger?: boolean; onConfirm: () => void };

/* ── Helpers ── */
function parseQR(raw: string): QRPayload | null { try { return JSON.parse(raw); } catch { return null; } }
function fmtTime(iso?: string | null) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

/* ── SMS helper ── */
async function sendSMSNotification(
  phones: string[],
  message: string,
  onSent?: (count: number) => void
): Promise<void> {
  const validPhones = phones.filter(p => p && p.trim() !== '');
  if (validPhones.length === 0) return;
  try {
    await api.post('/sms/send', { numbers: validPhones, message });
    onSent?.(validPhones.length);
  } catch (err) {
    console.warn('[SMS] Failed:', err);
  }
}

function buildSMSMessage(
  studentName: string,
  guardianName: string,
  role: string,
  status: string,
  time: string
): string {
  if (status === 'Pick-up') {
    return `ChildTrack Alert: ${studentName} has been picked up by ${role} ${guardianName} at ${time}. Stay safe!`;
  }
  if (status === 'Late') {
    return `ChildTrack Alert: ${studentName} arrived LATE and was dropped off by ${role} ${guardianName} at ${time}.`;
  }
  return `ChildTrack Alert: ${studentName} has been dropped off by ${role} ${guardianName} at ${time}. Have a great day!`;
}

/* ── Stat card config ── */
type StatCard = {
  key: string; label: string; sub: string; color: string; lightColor?: string;
  bgDark: string; bgLight: string; borderDark: string; borderLight: string;
  Icon: React.ElementType;
};

const STAT_CARDS: StatCard[] = [
  {
    key: 'Drop-off', label: 'Drop-off', sub: 'arrived today',
    color: '#16a34a', lightColor: '#2d5016',
    bgDark: 'rgba(34,197,94,0.08)', bgLight: 'rgba(22,163,74,0.08)',
    borderDark: 'rgba(34,197,94,0.2)', borderLight: 'rgba(22,163,74,0.35)',
    Icon: ArrowDownwardIcon,
  },
  {
    key: 'Pick-up', label: 'Pick-up', sub: 'departed safely',
    color: '#2563eb',
    bgDark: 'rgba(59,130,246,0.08)', bgLight: 'rgba(37,99,235,0.07)',
    borderDark: 'rgba(59,130,246,0.2)', borderLight: 'rgba(37,99,235,0.3)',
    Icon: ArrowUpwardIcon,
  },
  {
    key: 'Late', label: 'Late', sub: '30+ min delay',
    color: '#d97706',
    bgDark: 'rgba(245,158,11,0.08)', bgLight: 'rgba(217,119,6,0.07)',
    borderDark: 'rgba(245,158,11,0.2)', borderLight: 'rgba(217,119,6,0.3)',
    Icon: AccessTimeIcon,
  },
];

/* ── sx helpers ── */
const cardSx = (dark: boolean) => ({
  borderRadius: '14px',
  background: dark ? '#1e293b' : '#ffffff',
  border: `1px solid ${dark ? 'rgba(56,197,134,0.15)' : '#e5e7eb'}`,
  boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
});

const dlgPaperSx = (dark: boolean) => ({
  background: dark ? '#1e293b' : '#ffffff',
  color: dark ? '#e2e8f0' : '#1e293b',
  border: dark ? '1px solid rgba(56,197,134,0.15)' : '1px solid rgba(0,0,0,0.08)',
  borderRadius: '14px',
  fontFamily: "'Nunito', sans-serif",
  boxShadow: dark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.15)',
});

const muiInputSx = (dark: boolean) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontFamily: "'Nunito', sans-serif",
    '& fieldset':             { borderColor: dark ? 'rgba(56,197,134,0.2)' : 'rgba(0,0,0,0.12)' },
    '&:hover fieldset':       { borderColor: 'rgba(56,197,134,0.45)' },
    '&.Mui-focused fieldset': { borderColor: '#38c586' },
  },
  '& input': {
    color: dark ? '#e2e8f0' : '#1e293b',
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 600, fontSize: '1rem',
  },
  '& .MuiInputLabel-root': { fontFamily: "'Nunito', sans-serif" },
});

const primaryBtnSx = {
  px: 3, borderRadius: '10px', fontWeight: 700,
  fontFamily: "'Nunito', sans-serif", textTransform: 'none' as const,
  background: 'linear-gradient(135deg,#38c586,#2da86e)',
  boxShadow: '0 4px 14px rgba(56,197,134,0.3)',
  '&:hover': { background: 'linear-gradient(135deg,#2da86e,#1e8a5a)' },
  '&.Mui-disabled': { opacity: 0.5 },
};

const dangerBtnSx = {
  px: 3, borderRadius: '10px', fontWeight: 700,
  fontFamily: "'Nunito', sans-serif", textTransform: 'none' as const,
  background: 'linear-gradient(135deg,#e63946,#c62828)',
  '&:hover': { background: '#b91c1c' },
};

const cancelBtnSx = (dark: boolean) => ({
  fontFamily: "'Nunito', sans-serif", fontWeight: 700, textTransform: 'none' as const,
  color: dark ? 'rgba(226,232,240,0.45)' : 'rgba(30,41,59,0.5)',
  '&:hover': { background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
});

/* ════════════════════════════════════════════════════════
   DashboardPage
════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { teacher, token, logout } = useAuth();

  const [dark, setDark] = useState(() => localStorage.getItem('ct-theme') !== 'light');
  const toggleDark = () => {
    const n = !dark;
    setDark(n);
    localStorage.setItem('ct-theme', n ? 'dark' : 'light');
  };

  const [rows,           setRows]           = useState<AttendanceRecord[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [retries,        setRetries]        = useState(0);
  const [mode,           setMode]           = useState<'Drop-off' | 'Pick-up'>('Drop-off');
  const [scannerOn,      setScannerOn]      = useState(false);
  const [scanning,       setScanning]       = useState(false);
  const [isOnline,       setIsOnline]       = useState(navigator.onLine);
  const [classTime,      setClassTime]      = useState(() => localStorage.getItem('classStartTime') || '07:30');
  const [classTimeInput, setClassTimeInput] = useState(classTime);
  const [timeDialog,     setTimeDialog]     = useState(false);
  const [photoModal,     setPhotoModal]     = useState(false);
  const [photoStudent,   setPhotoStudent]   = useState('');
  const [photoMode,      setPhotoMode]      = useState<'Drop-off' | 'Pick-up' | 'Late'>('Drop-off');
  const [guardianDrawer, setGuardianDrawer] = useState(false);
  const [privacyShown,   setPrivacyShown]   = useState(() => localStorage.getItem('privacyAccepted') === 'true');
  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [snacks,         setSnacks]         = useState<Snack[]>([]);
  const [dlg,            setDlg]            = useState<Dlg>({ open: false, title: '', body: '', onConfirm: () => {} });
  const [clock,          setClock]          = useState('');

  // ── SMS port status ──────────────────────────────────────────────────────────
  const [smsPort,    setSmsPort]    = useState<'open' | 'closed' | 'checking'>('checking');
  const [smsQueue,   setSmsQueue]   = useState(0);
  const [smsSent,    setSmsSent]    = useState<{ name: string; count: number } | null>(null);

  const snackId  = useRef(0);
  const lastScan = useRef('');
  const lastTime = useRef(0);
  const rowsRef  = useRef<AttendanceRecord[]>([]);

  useEffect(() => { rowsRef.current = rows; }, [rows]);

  // ── SMS port polling (every 5s) ──────────────────────────────────────────────
  useEffect(() => {
    const checkPort = async () => {
      try {
        const { data } = await api.get('/sms/status');
        setSmsPort(data.portOpen ? 'open' : 'closed');
        setSmsQueue(data.queueSize ?? 0);
      } catch {
        setSmsPort('closed');
        setSmsQueue(0);
      }
    };
    checkPort();
    const iv = setInterval(checkPort, 5000);
    return () => clearInterval(iv);
  }, []);

  // ── Clock ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-PH', {
      timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const showAlert = useCallback((msg: string, type: SnackT = 'info') => {
    const id = ++snackId.current;
    setSnacks(p => [...p, { id, msg, type }]);
    setTimeout(() => setSnacks(p => p.filter(s => s.id !== id)), 4000);
  }, []);

  const confirm  = (opts: Omit<Dlg, 'open'>) => setDlg({ ...opts, open: true });
  const closeDlg = () => setDlg(d => ({ ...d, open: false }));

  const isLate = useCallback(() => {
    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();
    const [h, m] = classTime.split(':').map(Number);
    return cur - (h * 60 + m) >= 30;
  }, [classTime]);

  const fetchAttendance = useCallback(async (silent = false) => {
    try {
      const { data } = await api.get(`/attendance?date=${format(new Date(), 'yyyy-MM-dd')}`);
      setRows(Array.isArray(data) ? data : []);
      setRetries(0);
    } catch (err: any) {
      if (!silent) {
        const c = err?.response?.status;
        if (c === 401) showAlert('Session expired', 'error');
        else if (c >= 500) { showAlert('Server error, retrying…', 'warning'); setRetries(r => r + 1); }
        else showAlert('Could not load records', 'error');
      }
    } finally { setLoading(false); }
  }, [showAlert]);

  useEffect(() => {
    fetchAttendance();
    const iv = setInterval(() => fetchAttendance(true), 30000);
    return () => clearInterval(iv);
  }, [fetchAttendance]);

  useEffect(() => {
    if (retries > 0 && retries <= 3) {
      const t = setTimeout(() => fetchAttendance(true), Math.min(5000 * retries, 15000));
      return () => clearTimeout(t);
    }
  }, [retries, fetchAttendance]);

  useEffect(() => {
    const up = async () => {
      setIsOnline(true);
      showAlert('🌐 Connection restored', 'success');
      try {
        const n = await syncQueue(token || '');
        if (n > 0) { showAlert(`✅ Synced ${n} offline record(s)`, 'success'); fetchAttendance(true); }
      } catch { showAlert('⚠️ Could not sync offline records', 'warning'); }
    };
    const dn = () => { setIsOnline(false); showAlert('📴 Offline — scans saved locally', 'warning'); };
    window.addEventListener('online', up);
    window.addEventListener('offline', dn);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', dn); };
  }, [fetchAttendance, token, showAlert]);

  const handleScan = useCallback(async (raw: string) => {
    const now = Date.now();
    if (raw === lastScan.current && now - lastTime.current < 5000) return;
    if (scanning) return;
    const p = parseQR(raw);
    if (!p?.student || !p?.lrn) { showAlert('❌ Invalid QR code', 'error'); return; }
    lastScan.current = raw; lastTime.current = now; setScanning(true);
    const today   = format(new Date(), 'yyyy-MM-dd');
    const session = new Date().getHours() < 12 ? 'AM' : 'PM';
    const status  = mode === 'Drop-off' && isLate() ? 'Late' : mode;

    const timeNow = new Date().toLocaleTimeString('en-PH', {
      timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit',
    });

    const rawContacts: string[] = Array.isArray((p as any).contacts)
      ? (p as any).contacts
      : Array.isArray((p as any).phones)
      ? (p as any).phones
      : [];

    const phones: string[] = rawContacts
      .filter((n: any) => typeof n === 'string' && n.trim() !== '')
      .map((n: string) => {
        const cleaned = n.trim().replace(/\s+/g, '');
        if (cleaned.startsWith('09') && cleaned.length === 11) return '+63' + cleaned.slice(1);
        if (cleaned.startsWith('+63')) return cleaned;
        return cleaned;
      });

    if (!isOnline) {
      try {
        enqueueRecord({ student_name: p.student, lrn: p.lrn, gender: p.gender ?? '', guardian_name: p.name ?? '', by_whom: `${p.role ?? 'Guardian'}: ${p.name ?? ''}`, status, session, date: today, qr_data: raw });
        setRows(prev => [{ student_name: p.student, lrn: p.lrn, gender: p.gender ?? '', guardian_name: p.name ?? '', by_whom: `${p.role ?? 'Guardian'}: ${p.name ?? ''}`, status, session, date: today, id: Date.now(), timestamp: new Date().toISOString() } as AttendanceRecord, ...prev]);
        showAlert(`📴 Saved offline: ${p.student}`, 'warning');
      } catch { showAlert('❌ Could not save offline record', 'error'); }
      finally { setScanning(false); }
      return;
    }

    if (mode === 'Pick-up') {
      const existing = rowsRef.current.find(r => r.lrn === p.lrn && (r.status === 'Drop-off' || r.status === 'Late'));
      if (!existing) { showAlert(`⚠️ No drop-off found for ${p.student}`, 'warning'); setScanning(false); return; }
      try {
        const pickupTime = new Date().toISOString();
        const pickupBy   = `${p.role ?? 'Guardian'}: ${p.name ?? ''}`;
        await api.patch(`/attendance/${existing.id}`, { status: 'Pick-up', pickup_by: pickupBy, pickup_time: pickupTime });
        setRows(prev => prev.map(r => r.id === existing.id ? { ...r, status: 'Pick-up', pickup_by: pickupBy, pickup_time: pickupTime, _justUpdated: true } as any : r));
        fetchAttendance(true);
        setPhotoStudent(p.student); setPhotoMode('Pick-up'); setPhotoModal(true);
        if (phones.length > 0) {
          const smsMsg = buildSMSMessage(p.student, p.name ?? 'Guardian', p.role ?? 'Guardian', 'Pick-up', timeNow);
          sendSMSNotification(phones, smsMsg, (count) => setSmsSent({ name: p.student, count }));
        }
      } catch (err: any) {
        const c = err?.response?.status;
        if (c === 404) showAlert('❌ Record not found', 'error');
        else if (c === 409) showAlert('⚠️ Pick-up already recorded', 'warning');
        else showAlert('❌ Failed to record pick-up', 'error');
      } finally { setScanning(false); }
      return;
    }

    try {
      if (rowsRef.current.find(r => r.lrn === p.lrn && (r.status === 'Drop-off' || r.status === 'Late'))) {
        showAlert(`⚠️ ${p.student} already recorded`, 'warning'); setScanning(false); return;
      }
      await api.post('/attendance', { student_name: p.student, lrn: p.lrn, gender: p.gender ?? '', guardian_name: p.name ?? '', by_whom: `${p.role ?? 'Guardian'}: ${p.name ?? ''}`, status, session, date: today, qr_data: raw });
      setPhotoStudent(p.student); setPhotoMode(status as 'Drop-off' | 'Late'); setPhotoModal(true);
      fetchAttendance(true);
      if (phones.length > 0) {
        const smsMsg = buildSMSMessage(p.student, p.name ?? 'Guardian', p.role ?? 'Guardian', status, timeNow);
        sendSMSNotification(phones, smsMsg, (count) => setSmsSent({ name: p.student, count }));
      }
    } catch (err: any) {
      const c = err?.response?.status;
      if (c === 409) showAlert(`⚠️ Already recorded for ${p.student}`, 'warning');
      else if (c === 422) showAlert('❌ Invalid QR data', 'error');
      else showAlert('❌ Failed to record attendance', 'error');
    } finally { setScanning(false); }
  }, [mode, isLate, isOnline, fetchAttendance, scanning, showAlert]);

  useScanner(scannerOn, handleScan);

  const handleDelete = (id: number, name: string) => {
    confirm({
      title: 'Remove record',
      body: `Remove attendance record for ${name}? This cannot be undone.`,
      label: 'Remove',
      danger: true,
      onConfirm: async () => {
        closeDlg();
        try {
          await api.delete(`/attendance/${id}`);
          setRows(p => p.filter(r => r.id !== id));
          showAlert('🗑️ Record removed', 'warning');
        } catch (err: any) {
          if (err?.response?.status === 404) showAlert('Already removed', 'info');
          else showAlert('❌ Could not remove', 'error');
        }
      },
    });
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setRows(p => p.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
    try {
      await api.patch(`/attendance/${id}`, { status: newStatus });
      showAlert(`✅ Updated to ${newStatus}`, 'success');
    } catch { fetchAttendance(true); showAlert('❌ Could not update status', 'error'); }
  };

  const count    = (s: string) => rows.filter(r => r.status === s).length;
  const filtered = rows.filter(r => {
    const ms = statusFilter === 'All' || r.status === statusFilter;
    const q  = search.toLowerCase();
    return ms && (!q || r.student_name?.toLowerCase().includes(q) || r.lrn?.toLowerCase().includes(q) || r.guardian_name?.toLowerCase().includes(q));
  });

  /* ── Theme tokens ── */
  const bg           = dark ? '#1e293b' : '#ffffff';
  const textMain     = dark ? '#e2e8f0' : '#1e293b';
  const textMuted    = dark ? '#64748b' : '#6b7280';
  const topbarBg     = dark ? '#1e293b' : '#ffffff';
  const topbarBorder = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
  const theadBg      = dark ? '#162032' : '#1e293b';
  const rowBorder    = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)';
  const rowHover     = dark ? 'rgba(56,197,134,0.05)' : 'rgba(45,80,22,0.03)';
  const inputBg      = dark ? '#1e293b' : '#ffffff';
  const inputBorderC = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)';

  const todayStr  = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Manila' });
  const shortDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' });

  /* ── SMS port chip derived values ── */
  const smsColor  = smsPort === 'open' ? '#22c55e' : smsPort === 'closed' ? '#e63946' : '#f59e0b';
  const smsBgD    = smsPort === 'open' ? 'rgba(34,197,94,0.08)'  : smsPort === 'closed' ? 'rgba(230,57,70,0.08)'  : 'rgba(245,158,11,0.08)';
  const smsBgL    = smsPort === 'open' ? 'rgba(34,197,94,0.07)'  : smsPort === 'closed' ? 'rgba(230,57,70,0.06)'  : 'rgba(245,158,11,0.06)';
  const smsBorder = smsPort === 'open' ? 'rgba(34,197,94,0.25)'  : smsPort === 'closed' ? 'rgba(230,57,70,0.25)'  : 'rgba(245,158,11,0.25)';
  const smsLabel  = smsPort === 'open'
    ? (smsQueue > 0 ? `SMS · ${smsQueue} queued` : 'SMS Ready')
    : smsPort === 'closed' ? 'SMS Off' : 'SMS…';
  const smsTooltip = smsPort === 'open'
    ? (smsQueue > 0 ? `SIM800L connected — ${smsQueue} message(s) in queue` : 'SIM800L connected on COM4 — ready to send')
    : smsPort === 'closed' ? 'SIM800L not detected — check USB or close Serial Monitor'
    : 'Checking SMS module…';

  const [smsConnecting, setSmsConnecting] = useState(false);

  const handleSmsConnect = useCallback(async () => {
    if (smsConnecting || smsPort === 'open') return;
    setSmsConnecting(true);
    setSmsPort('checking');
    try {
      await api.post('/sms/connect');
      await new Promise(r => setTimeout(r, 1500));
      const { data } = await api.get('/sms/status');
      if (data.portOpen) {
        setSmsPort('open');
        setSmsQueue(data.queueSize ?? 0);
        showAlert('📡 SIM800L connected!', 'success');
      } else {
        setSmsPort('closed');
        showAlert('❌ Could not connect — check USB cable and COM port', 'error');
      }
    } catch {
      setSmsPort('closed');
      showAlert('❌ Connection failed — is the Serial Monitor open?', 'error');
    } finally {
      setSmsConnecting(false);
    }
  }, [smsConnecting, smsPort, showAlert]);

  /* ── Gender badge ── */
  const genderBadge = (g: string) => {
    const u = String(g ?? '').toUpperCase();
    if (u === 'M' || u === 'MALE') return (
      <Chip label="♂ M" size="small" sx={{
        bgcolor: 'rgba(59,130,246,0.12)', color: '#7ab4e8',
        border: '1px solid rgba(59,130,246,0.22)', fontWeight: 700, fontSize: '0.66rem',
        fontFamily: "'Nunito', sans-serif",
      }} />
    );
    if (u === 'F' || u === 'FEMALE') return (
      <Chip label="♀ F" size="small" sx={{
        bgcolor: 'rgba(200,100,180,0.12)', color: '#dda8d0',
        border: '1px solid rgba(200,100,180,0.22)', fontWeight: 700, fontSize: '0.66rem',
        fontFamily: "'Nunito', sans-serif",
      }} />
    );
    return <Typography sx={{ color: textMuted, fontSize: '0.8rem', fontFamily: "'Nunito', sans-serif" }}>—</Typography>;
  };

  /* ════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body, .MuiTypography-root, .MuiButton-root, .MuiMenuItem-root,
        .MuiInputBase-root, .MuiDialogTitle-root, .MuiTableCell-root {
          font-family: 'Nunito', sans-serif !important;
        }
        @keyframes sms-blink  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes sms-glow   { 0%,100%{box-shadow:0 0 4px #22c55e} 50%{box-shadow:0 0 10px #22c55e} }
        @keyframes sms-spin   { to { transform: rotate(360deg); } }
        @keyframes sms-fadein { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        @keyframes sms-pop    { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes db-row-flash { 0%{background:rgba(56,197,134,0.13)} 100%{background:transparent} }
        .db-row-new { animation: db-row-flash 2.5s ease forwards; }
        @keyframes db-ti { from{transform:translateX(16px);opacity:0} to{transform:translateX(0);opacity:1} }
      `}</style>

      {!privacyShown && (
        <PrivacyNotice onAccept={() => { setPrivacyShown(true); localStorage.setItem('privacyAccepted', 'true'); }} />
      )}

      {/* ── Toasts ── */}
      <Box sx={{
        position: 'fixed', top: 16, right: 16, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '7px', pointerEvents: 'none',
      }}>
        {snacks.map(s => {
          const styles: Record<SnackT, object> = {
            success: { background: '#052e16', color: '#86efac', borderColor: 'rgba(134,239,172,0.22)' },
            error:   { background: '#2a0f0f', color: '#fca5a5', borderColor: 'rgba(252,165,165,0.22)' },
            warning: { background: '#2a1a06', color: '#fcd34d', borderColor: 'rgba(252,211,77,0.22)'  },
            info:    { background: '#0a1828', color: '#93c5fd', borderColor: 'rgba(147,197,253,0.22)' },
          };
          return (
            <Box key={s.id} sx={{
              ...styles[s.type],
              padding: '10px 16px', borderRadius: '10px', fontSize: '0.79rem', fontWeight: 600,
              minWidth: 250, maxWidth: 340, border: '1px solid', pointerEvents: 'all',
              animation: 'db-ti 0.22s cubic-bezier(0.34,1.2,0.64,1)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
              fontFamily: "'Nunito', sans-serif", lineHeight: 1.5,
            }}>
              {s.msg}
            </Box>
          );
        })}
      </Box>

      {/* ── Confirm Dialog ── */}
      <Dialog open={dlg.open} onClose={closeDlg} maxWidth="xs" fullWidth PaperProps={{ sx: dlgPaperSx(dark) }}>
        <DialogTitle sx={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1rem', color: dark ? '#e2e8f0' : '#1e293b', pt: 3, pb: 1 }}>
          {dlg.title}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: dark ? 'rgba(226,232,240,0.5)' : 'rgba(30,41,59,0.6)', fontSize: '0.875rem', lineHeight: 1.7, fontFamily: "'Nunito', sans-serif" }}>
            {dlg.body}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={closeDlg} sx={cancelBtnSx(dark)}>Cancel</Button>
          <Button variant="contained" onClick={dlg.onConfirm} sx={dlg.danger ? dangerBtnSx : primaryBtnSx}>
            {dlg.label ?? 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Class Time Dialog ── */}
      <Dialog open={timeDialog} onClose={() => setTimeDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: dlgPaperSx(dark) }}>
        <DialogTitle sx={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1rem', color: dark ? '#e2e8f0' : '#1e293b', pt: 3, pb: 1 }}>
          Class Start Time
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: dark ? 'rgba(226,232,240,0.45)' : 'rgba(30,41,59,0.55)', mb: 2.5, fontSize: '0.82rem', lineHeight: 1.7, fontFamily: "'Nunito', sans-serif" }}>
            Students scanned 30+ minutes after this time are marked Late.
          </Typography>
          <TextField type="time" fullWidth value={classTimeInput} onChange={e => setClassTimeInput(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={muiInputSx(dark)} />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setTimeDialog(false)} sx={cancelBtnSx(dark)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setClassTime(classTimeInput); localStorage.setItem('classStartTime', classTimeInput); setTimeDialog(false); showAlert(`✅ Class time set to ${classTimeInput}`, 'success'); }} sx={primaryBtnSx}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════ Shell ════ */}
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', background: bg }}>

        <Sidebar
          mode={mode} onModeChange={setMode}
          scannerOn={scannerOn} scanning={scanning}
          onScannerToggle={v => { setScannerOn(v); if (!v) setScanning(false); showAlert(v ? '📡 Scanner active' : '⏹ Scanner stopped', v ? 'success' : 'info'); }}
          isOnline={isOnline} teacher={teacher} classTime={classTime}
          onClassTimeChange={t => { setClassTime(t); localStorage.setItem('classStartTime', t); showAlert(`✅ Class time set to ${t}`, 'success'); }}
          onOpenGuardian={() => setGuardianDrawer(true)}
          dark={dark} onToggleDark={toggleDark} clock={clock}
        />

        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* ── Topbar ── */}
          <Box sx={{
            height: 60, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 3, background: topbarBg,
            borderBottom: `1px solid ${topbarBorder}`,
            boxShadow: dark ? 'none' : '0 1px 0 rgba(0,0,0,0.05)',
          }}>
            <Box>
              <Typography sx={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.35rem', color: dark ? '#4ade80' : '#2d5016', letterSpacing: '0.04em', lineHeight: 1 }}>
                Today's Attendance
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', color: textMuted, mt: 0.25, fontFamily: "'Nunito', sans-serif" }}>
                {todayStr}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

              {/* Date chip */}
              <Chip label={shortDate} size="small" sx={{ bgcolor: dark ? 'rgba(56,197,134,0.08)' : 'rgba(45,80,22,0.06)', color: dark ? '#38c586' : '#2d5016', border: `1px solid ${dark ? 'rgba(56,197,134,0.2)' : 'rgba(45,80,22,0.15)'}`, fontWeight: 700, fontSize: '0.7rem', fontFamily: "'Nunito', sans-serif" }} />

              {/* Class time chip */}
              <Chip label={`Class: ${classTime}`} size="small" sx={{ bgcolor: dark ? 'rgba(245,158,11,0.08)' : '#fffbeb', color: dark ? '#fcd34d' : '#92400e', border: `1px solid ${dark ? 'rgba(245,158,11,0.2)' : '#fde68a'}`, fontWeight: 700, fontSize: '0.7rem', fontFamily: "'Nunito', sans-serif" }} />

              {/* Online/Offline chip */}
              <Chip
                icon={<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isOnline ? '#22c55e' : '#f59e0b', ml: '6px !important' }} />}
                label={isOnline ? 'Online' : 'Offline'} size="small"
                sx={{ bgcolor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', color: textMuted, border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, fontWeight: 600, fontSize: '0.7rem', fontFamily: "'Nunito', sans-serif" }}
              />

              {/* ── SMS Port Status chip ── */}
              <Tooltip title={smsTooltip} arrow>
                <Chip
                  icon={
                    <Box sx={{
                      width: 7, height: 7, borderRadius: '50%',
                      ml: '6px !important',
                      bgcolor: smsColor,
                      animation:
                        smsPort === 'checking' ? 'sms-blink 1s ease-in-out infinite' :
                        smsPort === 'open'     ? 'sms-glow 2s ease-in-out infinite'  : 'none',
                      boxShadow: smsPort === 'open' ? `0 0 5px ${smsColor}` : 'none',
                    }} />
                  }
                  label={smsLabel}
                  size="small"
                  onClick={smsPort === 'closed' ? handleSmsConnect : undefined}
                  sx={{
                    bgcolor: dark ? smsBgD : smsBgL,
                    color: smsColor,
                    border: `1px solid ${smsBorder}`,
                    fontWeight: 700, fontSize: '0.7rem',
                    fontFamily: "'Nunito', sans-serif",
                    cursor: smsPort === 'closed' ? 'pointer' : 'default',
                    transition: 'all 0.3s ease',
                    ...(smsPort === 'closed' && {
                      '&:hover': {
                        bgcolor: dark ? 'rgba(230,57,70,0.15)' : 'rgba(230,57,70,0.1)',
                        borderColor: '#e63946',
                      },
                    }),
                  }}
                />
              </Tooltip>

              {/* Connect button — only shown when port is closed */}
              {smsPort === 'closed' && (
                <Tooltip title="Reconnect SIM800L on COM4" arrow>
                  <Box
                    component="button"
                    onClick={handleSmsConnect}
                    disabled={smsConnecting}
                    sx={{
                      height: 30, px: '10px', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      background: smsConnecting
                        ? dark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.08)'
                        : 'linear-gradient(135deg,#38c586,#2da86e)',
                      border: smsConnecting
                        ? '1px solid rgba(245,158,11,0.3)'
                        : '1px solid rgba(56,197,134,0.4)',
                      color: smsConnecting ? '#f59e0b' : '#fff',
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 800, fontSize: '0.68rem',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      cursor: smsConnecting ? 'not-allowed' : 'pointer',
                      boxShadow: smsConnecting ? 'none' : '0 2px 8px rgba(56,197,134,0.25)',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                      '&:hover:not(:disabled)': {
                        background: 'linear-gradient(135deg,#2da86e,#1e8a5a)',
                        boxShadow: '0 4px 12px rgba(56,197,134,0.35)',
                      },
                    }}
                  >
                    {smsConnecting ? (
                      <>
                        <Box sx={{
                          width: 8, height: 8, borderRadius: '50%',
                          border: '1.5px solid rgba(245,158,11,0.3)',
                          borderTopColor: '#f59e0b',
                          animation: 'sms-spin 0.7s linear infinite',
                          flexShrink: 0,
                        }} />
                        Connecting…
                      </>
                    ) : (
                      <>📡 Connect</>
                    )}
                  </Box>
                </Tooltip>
              )}

              {/* Dark mode toggle */}
              <Tooltip title={dark ? 'Light mode' : 'Dark mode'}>
                <IconButton size="small" onClick={toggleDark} sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: `1px solid ${dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`, color: textMuted, '&:hover': { bgcolor: 'rgba(56,197,134,0.12)', color: '#38c586', borderColor: 'rgba(56,197,134,0.25)' } }}>
                  {dark ? <LightModeIcon sx={{ fontSize: 18 }} /> : <DarkModeIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* ── Stat Cards ── */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', px: 3, pt: 2.5, pb: 0 }}>
            {STAT_CARDS.map(c => (
              <Card key={c.key} onClick={() => setStatusFilter(sf => sf === c.key ? 'All' : c.key)} sx={{ flex: '1 1 0', minWidth: 150, cursor: 'pointer', borderRadius: '14px', background: dark ? c.bgDark : c.bgLight, border: `1px solid ${statusFilter === c.key ? c.color : dark ? c.borderDark : c.borderLight}`, boxShadow: statusFilter === c.key ? `0 0 0 1px ${c.color}40 inset, 0 4px 16px ${c.color}20` : dark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.18s', position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: c.color, opacity: statusFilter === c.key ? 1 : 0.5, transition: 'opacity 0.18s' }, '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${c.color}20`, borderColor: c.color, '&::before': { opacity: 1 } } }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: '18px 20px', '&:last-child': { pb: '18px' } }}>
                  <Box sx={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, bgcolor: dark ? `${c.color}22` : `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <c.Icon sx={{ color: dark ? c.color : (c.lightColor ?? c.color), fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '2rem', lineHeight: 1, color: dark ? c.color : (c.lightColor ?? c.color) }}>{count(c.key)}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: dark ? '#94a3b8' : '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, mt: 0.2, fontFamily: "'Nunito', sans-serif" }}>{c.label}</Typography>
                    <Typography sx={{ fontSize: '0.66rem', color: textMuted, mt: 0.3, fontFamily: "'Nunito', sans-serif" }}>{c.sub}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* ── Table area ── */}
          <Box sx={{ flex: 1, overflow: 'hidden', px: 3, pt: 2, pb: 2.5, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

            {/* Toolbar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              <Typography sx={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: dark ? '#4ade80' : '#2d5016' }}>
                Records
              </Typography>
              <Chip label={filtered.length === rows.length ? `${rows.length} total` : `${filtered.length} of ${rows.length}`} size="small" sx={{ bgcolor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: textMuted, fontSize: '0.68rem', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, fontFamily: "'Nunito', sans-serif" }} />

              <Box sx={{ flex: 1, minWidth: 160, position: 'relative' }}>
                <SearchIcon sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: textMuted, pointerEvents: 'none' }} />
                <Box component="input" placeholder="Search name, LRN, guardian…" value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} sx={{ width: '100%', height: 36, pl: '32px', pr: '12px', background: inputBg, border: `1px solid ${inputBorderC}`, borderRadius: '9px', color: textMain, fontSize: '0.8rem', fontFamily: "'Nunito', sans-serif", outline: 'none', transition: 'all 0.15s', '&::placeholder': { color: textMuted }, '&:focus': { borderColor: '#38c586', boxShadow: '0 0 0 3px rgba(56,197,134,0.12)' } }} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FilterAltIcon sx={{ fontSize: 16, color: textMuted }} />
                <Box component="select" value={statusFilter} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)} sx={{ height: 36, px: '10px', background: inputBg, border: `1px solid ${inputBorderC}`, borderRadius: '9px', color: dark ? 'rgba(226,232,240,0.7)' : '#1e293b', fontSize: '0.76rem', fontFamily: "'Nunito', sans-serif", cursor: 'pointer', outline: 'none', appearance: 'none', pr: '28px' }}>
                  <option value="All">All Statuses</option>
                  <option value="Drop-off">Drop-off</option>
                  <option value="Pick-up">Pick-up</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                </Box>
              </Box>

              <Tooltip title="Refresh records">
                <IconButton size="small" onClick={() => { fetchAttendance(); showAlert('🔄 Refreshing…', 'info'); }} sx={{ width: 36, height: 36, borderRadius: '9px', bgcolor: inputBg, border: `1px solid ${inputBorderC}`, color: textMuted, '&:hover': { bgcolor: 'rgba(56,197,134,0.1)', color: '#38c586', borderColor: 'rgba(56,197,134,0.25)' } }}>
                  <RefreshIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Table card */}
            <Card sx={{ ...cardSx(dark), flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1, overflow: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(56,197,134,0.18) transparent' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 1.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 40, color: dark ? 'rgba(56,197,134,0.2)' : 'rgba(0,0,0,0.1)' }} />
                    <Typography sx={{ color: textMuted, fontWeight: 700, fontSize: '0.88rem', fontFamily: "'Nunito', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loading…</Typography>
                  </Box>
                ) : rows.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 1.5, textAlign: 'center', px: 3 }}>
                    <CheckCircleIcon sx={{ fontSize: 44, color: dark ? 'rgba(56,197,134,0.18)' : 'rgba(0,0,0,0.08)' }} />
                    <Typography sx={{ color: textMuted, fontWeight: 700, fontSize: '0.88rem', fontFamily: "'Nunito', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>No records yet today</Typography>
                    <Typography sx={{ color: dark ? '#475569' : '#9ca3af', fontSize: '0.78rem', lineHeight: 1.6, maxWidth: 260, fontFamily: "'Nunito', sans-serif" }}>Start the scanner and scan a student QR code to begin recording attendance.</Typography>
                    <Button variant="contained" onClick={() => { setScannerOn(true); showAlert('📡 Scanner enabled', 'success'); }} startIcon={<QrCodeScannerIcon />} sx={{ ...primaryBtnSx, mt: 0.5, ...(!dark && { background: '#2d5016', boxShadow: '0 4px 14px rgba(45,80,22,0.3)', '&:hover': { background: '#1e3a0f' } }) }}>
                      Start Scanner
                    </Button>
                  </Box>
                ) : filtered.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 1.5, textAlign: 'center' }}>
                    <SearchIcon sx={{ fontSize: 44, color: dark ? 'rgba(56,197,134,0.18)' : 'rgba(0,0,0,0.08)' }} />
                    <Typography sx={{ color: textMuted, fontWeight: 700, fontSize: '0.88rem', fontFamily: "'Nunito', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>No matching records</Typography>
                    <Button variant="outlined" onClick={() => { setSearch(''); setStatusFilter('All'); }} sx={{ borderRadius: '9px', fontWeight: 700, textTransform: 'none', fontFamily: "'Nunito', sans-serif", mt: 0.5, borderColor: dark ? 'rgba(56,197,134,0.3)' : 'rgba(45,80,22,0.25)', color: dark ? '#38c586' : '#2d5016', '&:hover': { borderColor: dark ? '#38c586' : '#2d5016', bgcolor: dark ? 'rgba(56,197,134,0.06)' : '#f0f7e8' } }}>
                      Clear filter
                    </Button>
                  </Box>
                ) : (
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                    <Box component="thead">
                      <Box component="tr" sx={{ background: theadBg, position: 'sticky', top: 0, zIndex: 1 }}>
                        {['LRN', 'Student', 'Gender', 'Dropped Off By', 'Status', 'Picked Up By', 'Time', ''].map(h => (
                          <Box component="th" key={h} sx={{ p: '10px 14px', textAlign: 'left', fontSize: '0.57rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'rgba(226,232,240,0.4)', borderBottom: '1px solid rgba(56,197,134,0.1)', fontFamily: "'Nunito', sans-serif" }}>{h}</Box>
                        ))}
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {filtered.map(r => (
                        <Box component="tr" key={r.id} className={(r as any)._justUpdated ? 'db-row-new' : ''} sx={{ borderBottom: `1px solid ${rowBorder}`, transition: 'background 0.12s', '&:last-child td': { borderBottom: 'none' }, '&:hover': { background: rowHover } }}>
                          <Box component="td" sx={{ p: '11px 14px', verticalAlign: 'middle' }}>
                            <Typography sx={{ fontFamily: 'monospace', fontSize: '0.74rem', color: textMuted, fontWeight: 500 }}>{r.lrn || '—'}</Typography>
                          </Box>
                          <Box component="td" sx={{ p: '11px 14px', verticalAlign: 'middle' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Avatar sx={{ width: 30, height: 30, fontSize: '0.72rem', fontWeight: 800, bgcolor: dark ? 'rgba(56,197,134,0.12)' : 'rgba(45,80,22,0.1)', color: dark ? '#38c586' : '#2d5016', border: `1.5px solid ${dark ? 'rgba(56,197,134,0.3)' : 'rgba(45,80,22,0.2)'}`, fontFamily: "'Nunito', sans-serif" }}>
                                {r.student_name?.charAt(0)?.toUpperCase() ?? '?'}
                              </Avatar>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: textMain, fontFamily: "'Nunito', sans-serif" }}>{r.student_name}</Typography>
                            </Box>
                          </Box>
                          <Box component="td" sx={{ p: '11px 14px', verticalAlign: 'middle' }}>{genderBadge(r.gender)}</Box>
                          <Box component="td" sx={{ p: '11px 14px', verticalAlign: 'middle' }}>
                            <Typography sx={{ color: textMuted, fontSize: '0.79rem', fontFamily: "'Nunito', sans-serif" }}>{r.guardian_name || r.by_whom || '—'}</Typography>
                          </Box>
                          <Box component="td" sx={{ p: '11px 14px', verticalAlign: 'middle' }}>
                            <Box component="select" value={r.status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusChange(r.id, e.target.value)} sx={{ height: 30, px: '8px', borderRadius: '7px', cursor: 'pointer', outline: 'none', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '0.74rem', bgcolor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, color: dark ? '#e2e8f0' : '#1e293b', '&:focus': { borderColor: '#38c586', boxShadow: '0 0 0 2px rgba(56,197,134,0.15)' } }}>
                              {['Drop-off', 'Pick-up', 'Late', 'Absent'].map(s => (
                                <option key={s} value={s} style={{ background: dark ? '#1e293b' : '#fff' }}>{s}</option>
                              ))}
                            </Box>
                          </Box>
                          <Box component="td" sx={{ p: '11px 14px', verticalAlign: 'middle' }}>
                            <Typography sx={{ color: textMuted, fontSize: '0.79rem', fontFamily: "'Nunito', sans-serif" }}>{r.status === 'Pick-up' ? ((r as any).pickup_by || '—') : '—'}</Typography>
                          </Box>
                          <Box component="td" sx={{ p: '11px 14px', verticalAlign: 'middle' }}>
                            <Typography sx={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.74rem', color: textMuted }}>{fmtTime(r.timestamp)}</Typography>
                            {r.status === 'Pick-up' && (r as any).pickup_time && (
                              <Typography sx={{ fontSize: '0.66rem', color: '#60a5fa', mt: '2px', fontFamily: "'Nunito', sans-serif" }}>{fmtTime((r as any).pickup_time)}</Typography>
                            )}
                          </Box>
                          <Box component="td" sx={{ p: '11px 14px', verticalAlign: 'middle' }}>
                            <Tooltip title="Remove record">
                              <IconButton size="small" onClick={() => handleDelete(r.id, r.student_name)} sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: 'rgba(230,57,70,0.07)', border: '1px solid rgba(230,57,70,0.14)', color: 'rgba(252,165,165,0.5)', '&:hover': { bgcolor: 'rgba(230,57,70,0.18)', color: '#e63946', borderColor: 'rgba(230,57,70,0.3)' } }}>
                                <DeleteIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>

              {!loading && filtered.length > 0 && (
                <Box sx={{ px: 3, py: 1.5, borderTop: `1px solid ${dark ? '#334155' : '#f0f0f0'}` }}>
                  <Typography sx={{ fontSize: '0.76rem', color: textMuted, fontFamily: "'Nunito', sans-serif" }}>
                    Showing {filtered.length} of {rows.length} record{rows.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              )}
            </Card>
          </Box>
        </Box>
      </Box>

      <PhotoCaptureModal
        open={photoModal}
        studentName={photoStudent}
        onCaptureDone={async base64 => {
          setPhotoModal(false);
          if (!base64) return;
          try {
            await api.post('/scan-photos', { student_name: photoStudent, status: photoMode, photo_base64: base64 });
          } catch { showAlert('⚠️ Photo not saved — attendance was still recorded', 'warning'); }
        }}
      />

      <GuardianDrawer open={guardianDrawer} onClose={() => setGuardianDrawer(false)} dark={dark} />

      {/* ── SMS Sent Modal ── */}
      {smsSent && (
        <Box
          onClick={() => setSmsSent(null)}
          sx={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Box
            onClick={e => e.stopPropagation()}
            sx={{
              background: dark ? '#1e293b' : '#ffffff',
              border: `1px solid ${dark ? 'rgba(56,197,134,0.25)' : 'rgba(56,197,134,0.3)'}`,
              borderRadius: '20px',
              px: 5, py: 4.5,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5,
              boxShadow: dark ? '0 24px 64px rgba(0,0,0,0.6)' : '0 24px 64px rgba(0,0,0,0.18)',
              minWidth: 310, textAlign: 'center',
              animation: 'sms-fadein 0.22s ease',
            }}
          >
            {/* Checkmark icon */}
            <Box sx={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg,#38c586,#2da86e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 24px rgba(56,197,134,0.45)',
              animation: 'sms-pop 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              <CheckCircleIcon sx={{ color: '#ffffff', fontSize: 36 }} />
            </Box>

            {/* Text */}
            <Box>
              <Typography sx={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: '1.5rem', letterSpacing: '0.04em',
                color: dark ? '#e2e8f0' : '#1e293b', lineHeight: 1.2, mb: 0.75,
              }}>
                Messages Sent!
              </Typography>
              <Typography sx={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: '0.85rem',
                color: dark ? '#64748b' : '#6b7280',
                fontWeight: 600, lineHeight: 1.7,
              }}>
                {smsSent.count} guardian{smsSent.count !== 1 ? 's' : ''} notified for
              </Typography>
              <Typography sx={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: '1rem',
                color: '#38c586',
                fontWeight: 800, lineHeight: 1.4, mt: 0.25,
              }}>
                {smsSent.name}
              </Typography>
            </Box>

            {/* Done button */}
            <Button
              variant="contained"
              onClick={() => setSmsSent(null)}
              sx={{ ...primaryBtnSx, mt: 0.5, minWidth: 120, py: 1 }}
            >
              Done
            </Button>

            <Typography sx={{
              fontSize: '0.7rem',
              color: dark ? '#334155' : '#d1d5db',
              fontFamily: "'Nunito', sans-serif",
              mt: -1,
            }}>
              Click anywhere to dismiss
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
}