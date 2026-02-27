import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Typography, TextField, InputAdornment,
  Grid, Card, CardContent, Chip, Button, Tooltip,
  CircularProgress, Alert, Stack, useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ArticleIcon from '@mui/icons-material/Article';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useNavigate } from 'react-router-dom';
import standardsService from '../services/standardsService';
import { useAuth } from '../store';
import { ROUTES } from '../utils/constants';

/* ─── Category palette ──────────────────────────────────────────── */
const CATEGORY_STYLES = {
  'HACCP':       { bg: '#FFF3E0', color: '#BF360C', iconBg: '#FF6D00', gradient: 'linear-gradient(135deg,#FF6D00,#FF8F00)', glow: 'rgba(255,109,0,0.28)' },
  'Food Safety': { bg: '#E3F2FD', color: '#0D47A1', iconBg: '#1565C0', gradient: 'linear-gradient(135deg,#1565C0,#1976D2)', glow: 'rgba(21,101,192,0.28)' },
  'GMP':         { bg: '#E8F5E9', color: '#1B5E20', iconBg: '#2E7D32', gradient: 'linear-gradient(135deg,#2E7D32,#43A047)', glow: 'rgba(46,125,50,0.28)' },
  'ISO':         { bg: '#F3E5F5', color: '#4A148C', iconBg: '#6A1B9A', gradient: 'linear-gradient(135deg,#6A1B9A,#8E24AA)', glow: 'rgba(106,27,154,0.28)' },
  'Regulations': { bg: '#FCE4EC', color: '#880E4F', iconBg: '#AD1457', gradient: 'linear-gradient(135deg,#AD1457,#C2185B)', glow: 'rgba(173,20,87,0.28)' },
};

function getCatStyle(cat) {
  return CATEGORY_STYLES[cat] || {
    bg: '#ECEFF1', color: '#37474F', iconBg: '#546E7A',
    gradient: 'linear-gradient(135deg,#546E7A,#607D8B)', glow: 'rgba(84,110,122,0.28)',
  };
}

function formatFileSize(bytes) {
  if (!bytes) return null;
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function isRecentlyAdded(createdAt) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
}

function getFileBadge(contentType) {
  if (!contentType) return null;
  if (contentType.includes('pdf'))                                 return { label: 'PDF',  color: '#C62828' };
  if (contentType.includes('word'))                               return { label: 'DOCX', color: '#1565C0' };
  if (contentType.includes('excel') || contentType.includes('sheet')) return { label: 'XLSX', color: '#2E7D32' };
  return null;
}

/* ─── Card ──────────────────────────────────────────────────────── */
function StandardCard({ standard, isAuthenticated, onDownload, downloading, index }) {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isDark   = theme.palette.mode === 'dark';
  const cs      = getCatStyle(standard.category);
  const isDocx  = standard.fileContentType?.includes('word');
  const fileSize = formatFileSize(standard.fileSize);
  const badge    = getFileBadge(standard.fileContentType);
  const showNew  = isRecentlyAdded(standard.createdAt);

  const handleDownload = () => {
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    onDownload(standard.id, standard.fileName || standard.title + '.pdf');
  };

  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        border: '1.5px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'visible',

        /* staggered entrance */
        '@keyframes fadeUp': {
          from: { opacity: 0, transform: 'translateY(28px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        opacity: 0,
        animation: 'fadeUp 0.45s ease forwards',
        animationDelay: `${index * 0.07}s`,

        transition: 'box-shadow 0.3s, transform 0.3s, border-color 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          borderColor: cs.iconBg,
          boxShadow: `0 12px 36px ${cs.glow}, 0 2px 8px rgba(0,0,0,0.06)`,
          '& .card-icon': { transform: 'scale(1.1) rotate(-4deg)' },
          '& .dl-btn':    { background: cs.gradient, boxShadow: `0 6px 20px ${cs.glow}` },
        },
      }}
    >
      {/* Shimmer gradient top bar */}
      <Box sx={{
        height: 6, background: cs.gradient,
        borderRadius: '12px 12px 0 0',
        position: 'relative', overflow: 'hidden',
        '&::after': {
          content: '""', position: 'absolute',
          top: 0, left: '-100%', width: '55%', height: '100%',
          background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)',
          '@keyframes barShimmer': { to: { left: '160%' } },
          animation: 'barShimmer 2.4s ease-in-out infinite',
          animationDelay: `${index * 0.3}s`,
        },
      }} />

      {/* NEW badge */}
      {showNew && (
        <Chip label="NEW" size="small" sx={{
          position: 'absolute', top: 14, right: 14, zIndex: 2,
          bgcolor: '#00C853', color: '#fff',
          fontWeight: 800, fontSize: 9, height: 20, letterSpacing: 0.6,
          '@keyframes badgePulse': {
            '0%,100%': { boxShadow: '0 0 0 0 rgba(0,200,83,0.45)' },
            '55%':     { boxShadow: '0 0 0 7px rgba(0,200,83,0)' },
          },
          animation: 'badgePulse 2s ease-in-out infinite',
        }} />
      )}

      {/* File-type badge */}
      {badge && !showNew && (
        <Box sx={{
          position: 'absolute', top: 14, right: 14, zIndex: 2,
          bgcolor: badge.color + '15', color: badge.color,
          border: `1px solid ${badge.color}35`,
          borderRadius: 1, px: 0.8, py: 0.25,
          fontSize: 10, fontWeight: 800, letterSpacing: 0.6,
        }}>
          {badge.label}
        </Box>
      )}

      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, p: 2.5 }}>
        {/* Icon + heading row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            className="card-icon"
            sx={{
              width: 54, height: 54, borderRadius: 2,
              background: cs.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 4px 14px ${cs.glow}`,
              transition: 'transform 0.35s ease',
            }}
          >
            {isDocx
              ? <DescriptionIcon sx={{ color: '#fff', fontSize: 26 }} />
              : <PictureAsPdfIcon sx={{ color: '#fff', fontSize: 26 }} />}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
            {standard.category && (
              <Chip label={standard.category} size="small" sx={{
                bgcolor: isDark ? cs.iconBg + '28' : cs.bg,
                color:   isDark ? cs.iconBg      : cs.color,
                fontWeight: 700, fontSize: 10, height: 20, mb: 0.75,
                border: `1px solid ${cs.iconBg}${isDark ? '55' : '30'}`,
              }} />
            )}
            <Typography
              variant="subtitle1" fontWeight={700}
              sx={{
                lineHeight: 1.35, fontSize: '0.9rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {standard.title}
            </Typography>
          </Box>
        </Box>

        {/* Description */}
        {standard.description && (
          <Typography variant="body2" color="text.secondary" sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.65, flex: 1, fontSize: '0.815rem',
          }}>
            {standard.description}
          </Typography>
        )}

        {/* Footer */}
        <Box sx={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          mt: 'auto', pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {fileSize || (standard.hasFile ? 'Available' : 'Coming soon')}
          </Typography>

          {!standard.hasFile ? (
            <Tooltip title="Document will be available soon">
              <span>
                <Button size="small" variant="outlined" disabled sx={{ fontSize: 11, borderRadius: 2 }}>
                  Coming Soon
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Button
              className="dl-btn"
              size="small" variant="contained" disableElevation
              startIcon={downloading
                ? <CircularProgress size={11} color="inherit" />
                : <DownloadIcon sx={{ fontSize: 14 }} />}
              onClick={handleDownload}
              disabled={downloading}
              sx={{
                fontSize: 11, borderRadius: 2, px: 1.5, fontWeight: 700,
                background: cs.gradient,
                boxShadow: `0 3px 10px ${cs.glow}`,
                transition: 'background 0.3s, box-shadow 0.3s, transform 0.15s',
                '&:hover': { transform: 'scale(1.05)' },
                '&:disabled': { background: 'rgba(0,0,0,0.12)', boxShadow: 'none' },
              }}
            >
              {downloading ? 'Downloading…' : 'Download'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

/* ─── Stat pill (hero bottom) ────────────────────────────────────── */
function StatPill({ value, label }) {
  return (
    <Box sx={{ textAlign: 'center', px: { xs: 1.5, md: 3 } }}>
      <Typography sx={{
        color: '#fff', fontWeight: 800,
        fontSize: { xs: '1.6rem', md: '2.1rem' },
        lineHeight: 1,
        '@keyframes countUp': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        animation: 'countUp 0.6s 0.4s ease both',
      }}>
        {value}
      </Typography>
      <Typography sx={{
        color: 'rgba(255,255,255,0.55)', fontSize: 11,
        fontWeight: 600, letterSpacing: 1.2,
        textTransform: 'uppercase', mt: 0.4,
      }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function Standards() {
  const { isAuthenticated } = useAuth();
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isAuth = isAuthenticated();
  const [standards, setStandards]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [searchInput, setSearchInput]   = useState('');
  const [search, setSearch]             = useState('');
  const [selectedCat, setSelectedCat]   = useState('All');
  const [downloading, setDownloading]   = useState({});

  useEffect(() => {
    setLoading(true);
    standardsService.getAll(search)
      .then(setStandards)
      .catch(() => setError('Failed to load standards. Please try again.'))
      .finally(() => setLoading(false));
  }, [search]);

  const categories = useMemo(() => {
    const cats = [...new Set(standards.map((s) => s.category).filter(Boolean))];
    return ['All', ...cats.sort()];
  }, [standards]);

  const catCounts = useMemo(() => {
    const c = {};
    standards.forEach((s) => { if (s.category) c[s.category] = (c[s.category] || 0) + 1; });
    return c;
  }, [standards]);

  const filtered = useMemo(() =>
    selectedCat === 'All' ? standards : standards.filter((s) => s.category === selectedCat),
    [standards, selectedCat],
  );

  const handleSearchKeyDown = (e) => { if (e.key === 'Enter') setSearch(searchInput); };
  const handleSearchClear   = () => { setSearchInput(''); setSearch(''); };

  const handleDownload = async (id, fileName) => {
    setDownloading((p) => ({ ...p, [id]: true }));
    try { await standardsService.download(id, fileName); }
    catch { /* silent */ }
    finally { setDownloading((p) => ({ ...p, [id]: false })); }
  };

  /* floating icon config */
  const floatingIcons = [
    { Icon: LibraryBooksIcon,  top: '14%', left: '7%',  size: 44, dur: '5.2s', delay: '0s'   },
    { Icon: ArticleIcon,       top: '62%', left: '5%',  size: 30, dur: '4.6s', delay: '1.3s' },
    { Icon: AutoStoriesIcon,   top: '18%', right: '7%', size: 38, dur: '5.8s', delay: '0.7s' },
    { Icon: DescriptionIcon,   top: '68%', right: '5%', size: 32, dur: '5s',   delay: '2s'   },
    { Icon: ArticleIcon,       top: '42%', left: '2%',  size: 22, dur: '4.2s', delay: '1.8s' },
    { Icon: AutoStoriesIcon,   top: '35%', right: '2%', size: 24, dur: '4.8s', delay: '0.4s' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>

      {/* ═══════════ HERO ═══════════ */}
      <Box sx={{
        position: 'relative',
        background: 'linear-gradient(140deg, #080E2D 0%, #1a237e 30%, #2A1070 60%, #4A148C 100%)',
        py: { xs: 9, md: 13 },
        px: 2,
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Grid overlay */}
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)',
          backgroundSize: '52px 52px',
        }} />

        {/* Glow orbs */}
        <Box sx={{
          position: 'absolute', width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
          top: -140, left: -100, pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
          bottom: -100, right: -60, pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
          top: '30%', left: '45%', pointerEvents: 'none',
        }} />

        {/* Floating background icons */}
        {floatingIcons.map(({ Icon, top, left, right, size, dur, delay }, i) => (
          <Box key={i} sx={{
            position: 'absolute', top, left, right,
            display: { xs: 'none', md: 'flex' },
            color: '#fff', opacity: 0.07,
            pointerEvents: 'none',
            '@keyframes iconFloat': {
              '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
              '50%':     { transform: `translateY(-14px) rotate(${i % 2 ? 6 : -6}deg)` },
            },
            animation: `iconFloat ${dur} ease-in-out infinite`,
            animationDelay: delay,
          }}>
            <Icon sx={{ fontSize: size }} />
          </Box>
        ))}

        {/* ─ Hero content ─ */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Pulsing icon ring */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 84, height: 84, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.18)',
            mb: 3,
            '@keyframes ringPulse': {
              '0%,100%': { boxShadow: '0 0 0 0 rgba(255,255,255,0.15)' },
              '50%':     { boxShadow: '0 0 0 18px rgba(255,255,255,0)' },
            },
            animation: 'ringPulse 3.2s ease infinite',
          }}>
            <LibraryBooksIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.92)' }} />
          </Box>

          {/* Eyebrow label */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.8,
            bgcolor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 99, px: 2, py: 0.5, mb: 2,
            '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
            animation: 'fadeIn 0.5s ease both',
          }}>
            <VerifiedIcon sx={{ fontSize: 14, color: '#82B1FF' }} />
            <Typography sx={{ color: '#82B1FF', fontSize: 12, fontWeight: 700, letterSpacing: 0.8 }}>
              OFFICIAL MANUALS & GUIDELINES
            </Typography>
          </Box>

          <Typography variant="h3" fontWeight={800} color="white" sx={{
            mb: 1.5,
            fontSize: { xs: '2rem', md: '3rem' },
            letterSpacing: '-0.5px',
            textShadow: '0 2px 24px rgba(0,0,0,0.35)',
            '@keyframes heroTitle': {
              from: { opacity: 0, transform: 'translateY(-14px)' },
              to:   { opacity: 1, transform: 'translateY(0)' },
            },
            animation: 'heroTitle 0.55s 0.1s ease both',
          }}>
            Uyirgene Standards
          </Typography>

          <Typography sx={{
            color: 'rgba(255,255,255,0.65)', fontSize: { xs: 14, md: 17 },
            mb: 5, maxWidth: 500, mx: 'auto', lineHeight: 1.75,
            animation: 'heroTitle 0.55s 0.2s ease both',
          }}>
            Professional standards, guidelines, and manuals for food safety
            and quality management — free to download
          </Typography>

          {/* Search bar */}
          <Box sx={{ maxWidth: 520, mx: 'auto', animation: 'heroTitle 0.55s 0.3s ease both' }}>
            <TextField
              fullWidth
              placeholder="Search by title, category, or keyword…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#777' }} />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <Button size="small" onClick={handleSearchClear}
                      sx={{ color: '#888', minWidth: 0, px: 0.5, fontSize: 16 }}>✕</Button>
                  </InputAdornment>
                ) : null,
                sx: {
                  bgcolor: 'rgba(255,255,255,0.97)', borderRadius: 3,
                  boxShadow: '0 6px 28px rgba(0,0,0,0.3)',
                  '& fieldset': { border: 'none' },
                  '& input': { fontWeight: 500 },
                  transition: 'box-shadow 0.25s',
                  '&:hover, &.Mui-focused': { boxShadow: '0 10px 40px rgba(0,0,0,0.4)' },
                },
              }}
            />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.38)', mt: 1, display: 'block' }}>
              Press Enter to search
            </Typography>
          </Box>

          {/* Stats strip */}
          {!loading && (
            <Box sx={{
              display: 'flex', justifyContent: 'center',
              alignItems: 'center', gap: 0, mt: 7,
              animation: 'heroTitle 0.55s 0.4s ease both',
            }}>
              <StatPill value={`${standards.length}+`} label="Manuals" />
              <Box sx={{ width: 1, height: 36, bgcolor: 'rgba(255,255,255,0.18)' }} />
              <StatPill value={`${categories.length > 1 ? categories.length - 1 : 0}`} label="Categories" />
              <Box sx={{ width: 1, height: 36, bgcolor: 'rgba(255,255,255,0.18)' }} />
              <StatPill value="Free" label="Always" />
            </Box>
          )}
        </Box>

        {/* Wave separator */}
        <Box sx={{ position: 'absolute', bottom: -1, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
            <path fill={theme.palette.background.default} d="M0,48 C240,72 480,24 720,44 C960,64 1200,20 1440,44 L1440,72 L0,72 Z" />
          </svg>
        </Box>
      </Box>

      {/* ═══════════ CONTENT ═══════════ */}
      <Container maxWidth="lg" sx={{ py: 5 }}>

        {/* Category filter */}
        {categories.length > 1 && (
          <Stack direction="row" spacing={1}
            sx={{ mb: 4, flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
            {categories.map((cat) => {
              const active   = selectedCat === cat;
              const cs       = cat === 'All' ? null : getCatStyle(cat);
              const count    = cat === 'All' ? standards.length : (catCounts[cat] || 0);
              return (
                <Chip
                  key={cat}
                  label={`${cat} (${count})`}
                  onClick={() => setSelectedCat(cat)}
                  sx={{
                    fontWeight: active ? 700 : 500, fontSize: 13, height: 36, px: 0.5,
                    background: active
                      ? (cs ? cs.gradient : 'linear-gradient(135deg,#1a237e,#311B92)')
                      : (cs
                          ? (isDark ? cs.iconBg + '20' : cs.bg)
                          : (isDark ? 'rgba(255,255,255,0.06)' : '#fff')),
                    color: active
                      ? '#fff'
                      : (cs
                          ? (isDark ? cs.iconBg : cs.color)
                          : (isDark ? '#90A4AE' : '#455a64')),
                    border: '1.5px solid',
                    borderColor: active
                      ? 'transparent'
                      : (cs
                          ? cs.iconBg + (isDark ? '50' : '45')
                          : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')),
                    boxShadow: active ? `0 4px 14px ${cs ? cs.glow : 'rgba(26,35,126,0.32)'}` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: cs ? `0 6px 16px ${cs.glow}` : '0 6px 16px rgba(0,0,0,0.12)',
                    },
                  }}
                />
              );
            })}
          </Stack>
        )}

        {/* Search result banner */}
        {search && (
          <Box sx={{
            mb: 3, display: 'flex', alignItems: 'center', gap: 1,
            bgcolor: isDark ? 'rgba(57,73,171,0.18)' : '#e8eaf6',
            borderRadius: 2, px: 2, py: 1.2,
            border: '1px solid',
            borderColor: isDark ? 'rgba(57,73,171,0.35)' : 'transparent',
          }}>
            <SearchIcon sx={{ fontSize: 16, color: '#5c6bc0' }} />
            <Typography variant="body2" color="text.secondary">
              Results for <strong style={{ color: isDark ? '#9fa8da' : '#1a237e' }}>"{search}"</strong> — {filtered.length} found
            </Typography>
            <Button size="small" onClick={handleSearchClear}
              sx={{ ml: 'auto', fontSize: 12, color: '#5c6bc0' }}>Clear</Button>
          </Box>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <CircularProgress sx={{ color: '#311B92' }} />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 14 }}>
            <Box sx={{
              display: 'inline-flex', p: 3.5, borderRadius: '50%', mb: 3,
              background: isDark
                ? 'linear-gradient(135deg,rgba(57,73,171,0.25),rgba(106,27,154,0.25))'
                : 'linear-gradient(135deg,#e8eaf6,#ede7f6)',
              boxShadow: '0 4px 20px rgba(106,27,154,0.12)',
            }}>
              <LibraryBooksIcon sx={{ fontSize: 58, color: '#7986cb' }} />
            </Box>
            <Typography variant="h6" color="text.secondary" fontWeight={700}>No standards found</Typography>
            <Typography variant="body2" color="text.disabled" mt={1}>
              {search ? 'Try a different search term or clear the filter.' : 'Standards will appear here once published.'}
            </Typography>
            {search && (
              <Button onClick={handleSearchClear} sx={{ mt: 2 }} variant="outlined" size="small">
                Clear search
              </Button>
            )}
          </Box>
        )}

        {/* Document grid */}
        {!loading && filtered.length > 0 && (
          <>
            {/* Summary row */}
            <Box sx={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', mb: 3,
            }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {filtered.length} {filtered.length === 1 ? 'document' : 'documents'} available
              </Typography>
              {!isAuth && (
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: '#9e9e9e !important' }} />}
                  label="Login to download"
                  size="small" variant="outlined"
                  sx={{ fontSize: 11, borderStyle: 'dashed', color: 'text.disabled', borderColor: 'divider' }}
                />
              )}
            </Box>

            <Grid container spacing={3}>
              {filtered.map((s, i) => (
                <Grid item xs={12} sm={6} md={4} key={s.id}>
                  <StandardCard
                    standard={s}
                    isAuthenticated={isAuth}
                    onDownload={handleDownload}
                    downloading={!!downloading[s.id]}
                    index={i}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}
