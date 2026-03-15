import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Button, TextField, Typography, IconButton, Switch,
  FormControlLabel, CircularProgress, Divider, Chip,
  Tooltip, Accordion, AccordionSummary, AccordionDetails, Paper,
  InputAdornment, Autocomplete, Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PublicIcon from '@mui/icons-material/Public';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ImageIcon from '@mui/icons-material/Image';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import CloseIcon from '@mui/icons-material/Close';
import { flagshipService } from '../../services/flagshipService';
import { SUPPORTED_COUNTRIES } from '../../utils/constants';
import { useToast } from '../../store';
import ManualSection from '../course/ManualSection';

const SECTION_TYPES = [
  { value: 'overview', label: 'Overview / Info Grid' },
  { value: 'text', label: 'Text Paragraph' },
  { value: 'bullets', label: 'Bullet List' },
  { value: 'modules', label: 'Course Modules' },
];

const SECTION_COLORS = {
  overview: '#E3F2FD',
  text: '#F3E5F5',
  bullets: '#E8F5E9',
  modules: '#FFF3E0',
};

const emptyPrice = () => ({ countryCode: '', currencyCode: '', amount: '' });
const emptyVideo = () => ({ title: '', url: '', durationSeconds: '' });
const emptyAssessmentLink = () => ({ title: '', url: '' });

const empty = () => ({
  title: '',
  tagline: '',
  programCode: '',
  cardDescription: '',
  trainerName: '',
  cardHighlights: [],
  sections: [],
  active: true,
  displayOrder: 0,
  backgroundImage: null,
  backgroundImagePreview: null,
  removeBackgroundImage: false,
  price: '',
  countryPrices: [],
  assessmentLinks: [],
  preAssessmentLinks: [],
  preAssessmentInstructions: 'Complete the pre-assessment before starting your learning journey. This helps us understand your baseline knowledge and customize your learning experience.',
  reminderDays: '',
  trainingDuration: '',
  // Course detail fields
  targetAudience: '',
  assessment: '',
  outcome: '',
  examDetails: [],
  // Videos
  videos: [],
});

function FlagshipProgramForm({ open, program, onClose, onSaved }) {
  const { showError } = useToast();
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (program) {
      let highlights = [];
      try { if (program.cardHighlights) highlights = JSON.parse(program.cardHighlights); } catch {}
      let sections = [];
      try { if (program.sections) sections = JSON.parse(program.sections); } catch {}
      let examDetails = [];
      try { if (program.examDetails) examDetails = JSON.parse(program.examDetails); } catch {}

      let assessmentLinks = [];
      try { if (program.assessmentLinks) assessmentLinks = JSON.parse(program.assessmentLinks); } catch {}

      setForm({
        title: program.title || '',
        tagline: program.tagline || '',
        programCode: program.programCode || '',
        cardDescription: program.cardDescription || '',
        trainerName: program.trainerName || '',
        cardHighlights: highlights,
        sections,
        active: program.active !== false,
        displayOrder: program.displayOrder ?? 0,
        backgroundImage: null,
        backgroundImagePreview: program.backgroundImageUrl || null,
        removeBackgroundImage: false,
        price: program.price != null ? program.price.toString() : '',
        countryPrices: (program.countryPrices || []).map((cp) => ({
          countryCode: cp.countryCode,
          currencyCode: cp.currencyCode,
          amount: cp.amount.toString(),
        })),
        assessmentLinks: assessmentLinks.map((l) => ({ title: l.title || '', url: l.url || '' })),
        preAssessmentLinks: (() => {
          try { return program.preAssessmentLinks ? JSON.parse(program.preAssessmentLinks).map(l => ({ title: l.title || '', url: l.url || '' })) : []; } catch { return []; }
        })(),
        preAssessmentInstructions: program.preAssessmentInstructions || '',
        reminderDays: program.reminderDays != null ? program.reminderDays.toString() : '',
        trainingDuration: program.trainingDuration || '',
        targetAudience: program.targetAudience || '',
        assessment: program.assessment || '',
        outcome: program.outcome || '',
        examDetails,
        videos: (program.videos || []).map((v) => ({
          title: v.title || '',
          url: v.url || '',
          durationSeconds: v.durationSeconds != null ? v.durationSeconds.toString() : '',
        })),
      });
    } else {
      setForm(empty());
    }
  }, [open, program]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  // ── Highlights ──────────────────────────────────────────────────────────────
  const addHighlight = () => set('cardHighlights', [...form.cardHighlights, '']);
  const updateHighlight = (i, v) => {
    const h = [...form.cardHighlights]; h[i] = v; set('cardHighlights', h);
  };
  const removeHighlight = (i) => set('cardHighlights', form.cardHighlights.filter((_, j) => j !== i));

  // ── Exam Details ────────────────────────────────────────────────────────────
  const addExamDetail = () => set('examDetails', [...form.examDetails, '']);
  const updateExamDetail = (i, v) => {
    const d = [...form.examDetails]; d[i] = v; set('examDetails', d);
  };
  const removeExamDetail = (i) => set('examDetails', form.examDetails.filter((_, j) => j !== i));

  // ── Videos ──────────────────────────────────────────────────────────────────
  const addVideo = () => set('videos', [...form.videos, emptyVideo()]);
  const updateVideo = (i, field, value) => {
    const arr = [...form.videos]; arr[i] = { ...arr[i], [field]: value }; set('videos', arr);
  };
  const removeVideo = (i) => set('videos', form.videos.filter((_, j) => j !== i));
  const moveVideo = (i, dir) => {
    const arr = [...form.videos];
    const t = i + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[i], arr[t]] = [arr[t], arr[i]];
    set('videos', arr);
  };

  // ── Assessment Links ─────────────────────────────────────────────────────────
  const addAssessmentLink = () => set('assessmentLinks', [...form.assessmentLinks, emptyAssessmentLink()]);
  const updateAssessmentLink = (i, field, value) => {
    const arr = [...form.assessmentLinks]; arr[i] = { ...arr[i], [field]: value }; set('assessmentLinks', arr);
  };
  const removeAssessmentLink = (i) => set('assessmentLinks', form.assessmentLinks.filter((_, j) => j !== i));

  // ── Pre-Assessment Links ──────────────────────────────────────────────────────
  const addPreAssessmentLink = () => set('preAssessmentLinks', [...form.preAssessmentLinks, emptyAssessmentLink()]);
  const updatePreAssessmentLink = (i, field, value) => {
    const arr = [...form.preAssessmentLinks]; arr[i] = { ...arr[i], [field]: value }; set('preAssessmentLinks', arr);
  };
  const removePreAssessmentLink = (i) => set('preAssessmentLinks', form.preAssessmentLinks.filter((_, j) => j !== i));

  // ── Country prices ──────────────────────────────────────────────────────────
  const addCountryPrice = () => {
    const usedCodes = form.countryPrices.map(cp => cp.countryCode);
    const available = SUPPORTED_COUNTRIES.filter(c => c.code !== 'IN' && c.code !== 'US' && !usedCodes.includes(c.code));
    if (available.length === 0) return;
    set('countryPrices', [...form.countryPrices, { countryCode: available[0].code, currencyCode: available[0].currency, amount: '' }]);
  };
  const updateCountryPrice = (i, field, value) => {
    const arr = [...form.countryPrices];
    if (field === 'countryCode') {
      const country = SUPPORTED_COUNTRIES.find(c => c.code === value);
      arr[i] = { ...arr[i], countryCode: value, currencyCode: country?.currency || '' };
    } else {
      arr[i] = { ...arr[i], [field]: value };
    }
    set('countryPrices', arr);
  };
  const removeCountryPrice = (i) => set('countryPrices', form.countryPrices.filter((_, j) => j !== i));

  // ── USD price helpers ────────────────────────────────────────────────────────
  const [convertingPrices, setConvertingPrices] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const usdAmount = form.countryPrices.find(cp => cp.countryCode === 'US')?.amount || '';
  const handleUsdPriceChange = (val) => {
    const entry = { countryCode: 'US', currencyCode: 'USD', amount: val };
    set('countryPrices', [...form.countryPrices.filter(cp => cp.countryCode !== 'US'), entry]);
  };

  const roundForCurrency = (amount, currency) => {
    if (['JPY', 'KRW', 'IDR', 'VND', 'CLP', 'ISK', 'HUF', 'TWD', 'COP', 'IQD', 'IRR'].includes(currency))
      return Math.round(amount).toString();
    if (['BHD', 'KWD', 'JOD', 'OMR'].includes(currency))
      return (Math.round(amount * 1000) / 1000).toString();
    return (Math.round(amount * 100) / 100).toString();
  };

  const handleConvertAll = async () => {
    const usd = parseFloat(usdAmount);
    if (!usd || usd <= 0) return;
    setConvertingPrices(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      const rates = data.rates;
      const newPrices = SUPPORTED_COUNTRIES
        .filter(c => c.code !== 'IN')
        .map(c => {
          const rate = rates[c.currency];
          if (!rate) return null;
          return { countryCode: c.code, currencyCode: c.currency, amount: roundForCurrency(usd * rate, c.currency) };
        })
        .filter(Boolean);
      set('countryPrices', newPrices);
      const inrRate = rates['INR'];
      if (inrRate) set('price', Math.round(usd * inrRate).toString());
      setShowCountries(true);
      setCountrySearch('');
    } catch {
      alert('Failed to fetch exchange rates. Please check your connection and try again.');
    } finally {
      setConvertingPrices(false);
    }
  };

  // ── Sections ────────────────────────────────────────────────────────────────
  const addSection = (type) => {
    const base = { type, title: '' };
    const defaults = {
      overview: { items: [''] },
      text: { content: '' },
      bullets: { items: [''] },
      modules: { modules: [{ title: '', description: '', points: [''] }] },
    };
    set('sections', [...form.sections, { ...base, ...defaults[type] }]);
  };
  const updateSection = (i, updater) =>
    set('sections', form.sections.map((s, j) => (j === i ? updater(s) : s)));
  const removeSection = (i) => set('sections', form.sections.filter((_, j) => j !== i));
  const moveSection = (i, dir) => {
    const arr = [...form.sections];
    const target = i + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[i], arr[target]] = [arr[target], arr[i]];
    set('sections', arr);
  };
  const addItem = (si) =>
    updateSection(si, (s) => ({ ...s, items: [...(s.items || []), ''] }));
  const updateItem = (si, ii, v) =>
    updateSection(si, (s) => { const it = [...s.items]; it[ii] = v; return { ...s, items: it }; });
  const removeItem = (si, ii) =>
    updateSection(si, (s) => ({ ...s, items: s.items.filter((_, j) => j !== ii) }));
  const addModule = (si) =>
    updateSection(si, (s) => ({
      ...s, modules: [...(s.modules || []), { title: '', description: '', points: [''] }],
    }));
  const updateModule = (si, mi, field, value) =>
    updateSection(si, (s) => {
      const mods = [...(s.modules || [])]; mods[mi] = { ...mods[mi], [field]: value };
      return { ...s, modules: mods };
    });
  const removeModule = (si, mi) =>
    updateSection(si, (s) => ({ ...s, modules: s.modules.filter((_, j) => j !== mi) }));
  const addModulePoint = (si, mi) =>
    updateSection(si, (s) => {
      const mods = [...(s.modules || [])];
      mods[mi] = { ...mods[mi], points: [...(mods[mi].points || []), ''] };
      return { ...s, modules: mods };
    });
  const updateModulePoint = (si, mi, pi, v) =>
    updateSection(si, (s) => {
      const mods = [...(s.modules || [])];
      const pts = [...(mods[mi].points || [])]; pts[pi] = v;
      mods[mi] = { ...mods[mi], points: pts };
      return { ...s, modules: mods };
    });
  const removeModulePoint = (si, mi, pi) =>
    updateSection(si, (s) => {
      const mods = [...(s.modules || [])];
      mods[mi] = { ...mods[mi], points: mods[mi].points.filter((_, j) => j !== pi) };
      return { ...s, modules: mods };
    });

  // ── Image ────────────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set('backgroundImage', file);
    set('backgroundImagePreview', URL.createObjectURL(file));
    set('removeBackgroundImage', false);
  };
  const handleRemoveImage = () => {
    set('backgroundImage', null);
    set('backgroundImagePreview', null);
    set('removeBackgroundImage', true);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.title.trim()) { showError('Title is required.'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      if (form.programCode.trim()) fd.append('programCode', form.programCode.trim().toUpperCase());
      if (form.tagline) fd.append('tagline', form.tagline.trim());
      if (form.cardDescription) fd.append('cardDescription', form.cardDescription.trim());
      if (form.trainerName.trim()) fd.append('trainerName', form.trainerName.trim());
      fd.append('cardHighlights', JSON.stringify(form.cardHighlights.filter(Boolean)));
      fd.append('sections', JSON.stringify(form.sections));
      fd.append('active', form.active);
      fd.append('displayOrder', form.displayOrder);
      if (form.backgroundImage) fd.append('backgroundImage', form.backgroundImage);
      if (program) fd.append('removeBackgroundImage', form.removeBackgroundImage);
      if (form.price) fd.append('price', parseFloat(form.price));
      const validLinks = form.assessmentLinks.filter((l) => l.url.trim());
      fd.append('assessmentLinks', JSON.stringify(
        validLinks.map((l) => ({ title: l.title.trim(), url: l.url.trim() }))
      ));
      const validPreLinks = form.preAssessmentLinks.filter((l) => l.url.trim());
      fd.append('preAssessmentLinks', JSON.stringify(
        validPreLinks.map((l) => ({ title: l.title.trim(), url: l.url.trim() }))
      ));
      if (form.preAssessmentInstructions.trim()) fd.append('preAssessmentInstructions', form.preAssessmentInstructions.trim());
      if (form.reminderDays) fd.append('reminderDays', parseInt(form.reminderDays, 10));
      if (form.trainingDuration.trim()) fd.append('trainingDuration', form.trainingDuration.trim());

      // Course detail fields
      if (form.targetAudience.trim()) fd.append('targetAudience', form.targetAudience.trim());
      if (form.assessment.trim()) fd.append('assessment', form.assessment.trim());
      if (form.outcome.trim()) fd.append('outcome', form.outcome.trim());
      const validExamDetails = form.examDetails.filter((d) => d.trim());
      fd.append('examDetails', JSON.stringify(validExamDetails));

      // Country prices
      const validPrices = form.countryPrices.filter(
        (cp) => cp.countryCode.trim() && cp.currencyCode.trim() && cp.amount
      );
      fd.append('countryPrices', JSON.stringify(
        validPrices.map((cp) => ({
          countryCode: cp.countryCode.trim().toUpperCase(),
          currencyCode: cp.currencyCode.trim().toUpperCase(),
          amount: parseFloat(cp.amount),
        }))
      ));

      // Videos
      const validVideos = form.videos
        .filter((v) => v.url.trim())
        .map((v, i) => ({
          title: v.title.trim() || `Video ${i + 1}`,
          url: v.url.trim(),
          orderIndex: i,
          durationSeconds: v.durationSeconds ? parseInt(v.durationSeconds) : null,
        }));
      fd.append('videos', JSON.stringify(validVideos));

      const saved = program
        ? await flagshipService.updateProgram(program.id, fd)
        : await flagshipService.createProgram(fd);

      onSaved(saved);
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to save program.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={(e, reason) => { if (reason !== 'backdropClick') onClose(e, reason); }} disableEscapeKeyDown maxWidth="md" fullWidth
      PaperProps={{ sx: { maxHeight: '95vh' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          {program ? 'Edit Flagship Program' : 'Add Flagship Program'}
        </Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* ── Basic Info ── */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Basic Info</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title *" value={form.title}
              onChange={(e) => set('title', e.target.value)} fullWidth size="small" />
            <TextField label="Tagline (e.g. In-High Demand)" value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)} fullWidth size="small" />
            <TextField
              label="Program Code"
              value={form.programCode}
              onChange={(e) => set('programCode', e.target.value.toUpperCase())}
              fullWidth size="small"
              helperText="Unique code for marketing CTA links (e.g. FP-HACCP-TRAINING). Auto-generated if left blank."
              inputProps={{ style: { textTransform: 'uppercase' } }}
            />
            <TextField label="Card Description" value={form.cardDescription}
              onChange={(e) => set('cardDescription', e.target.value)}
              fullWidth size="small" multiline rows={2} />
            <TextField label="Trainer / Instructor Name"
              value={form.trainerName}
              onChange={(e) => set('trainerName', e.target.value)}
              fullWidth size="small"
              helperText="Pre-filled as default trainer name when generating certificates" />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Display Order" type="number" value={form.displayOrder}
                onChange={(e) => set('displayOrder', parseInt(e.target.value) || 0)}
                size="small" sx={{ width: 140 }} />
              <FormControlLabel
                control={<Switch checked={form.active} onChange={(e) => set('active', e.target.checked)} />}
                label="Active (visible on site)"
              />
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* ── Pricing ── */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Pricing</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* USD + INR inputs + convert button */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <TextField
                label="US Price (USD)"
                type="number"
                value={usdAmount}
                onChange={(e) => handleUsdPriceChange(e.target.value)}
                size="small"
                sx={{ width: 180 }}
                placeholder="e.g. 99"
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
              <TextField
                label="India Price (INR)"
                type="number"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                size="small"
                sx={{ width: 180 }}
                placeholder="e.g. 8299"
                inputProps={{ min: 0, step: 1 }}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
              <Button
                variant="contained"
                color="secondary"
                size="medium"
                startIcon={convertingPrices ? <CircularProgress size={14} color="inherit" /> : <PublicIcon />}
                onClick={handleConvertAll}
                disabled={!usdAmount || convertingPrices}
              >
                {convertingPrices ? 'Converting…' : 'Convert to all countries'}
              </Button>
            </Box>

            {/* Country prices collapsible panel */}
            {form.countryPrices.filter(cp => cp.countryCode !== 'US').length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No country prices set. Enter a USD price and click "Convert to all countries".
              </Typography>
            ) : (
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                {/* Panel header */}
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 2, py: 1.5, bgcolor: 'background.default', cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => setShowCountries(v => !v)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PublicIcon fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight={600}>
                      {form.countryPrices.filter(cp => cp.countryCode !== 'US').length} countries configured
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    {showCountries ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                </Box>

                <Collapse in={showCountries}>
                  {/* Search + Add row */}
                  <Box sx={{ display: 'flex', gap: 1, px: 2, pt: 1.5, pb: 1 }}>
                    <TextField
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      size="small"
                      fullWidth
                      InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                    />
                    <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addCountryPrice} sx={{ whiteSpace: 'nowrap' }}>
                      Add
                    </Button>
                  </Box>

                  {/* Scrollable list */}
                  <Box sx={{ maxHeight: 360, overflowY: 'auto', px: 2, pb: 1.5 }}>
                    {form.countryPrices
                      .filter(cp => cp.countryCode !== 'US')
                      .filter(cp => {
                        if (!countrySearch.trim()) return true;
                        const q = countrySearch.toLowerCase();
                        const country = SUPPORTED_COUNTRIES.find(c => c.code === cp.countryCode);
                        return (
                          country?.name.toLowerCase().includes(q) ||
                          cp.countryCode.toLowerCase().includes(q) ||
                          cp.currencyCode.toLowerCase().includes(q)
                        );
                      })
                      .map((cp) => {
                        const i = form.countryPrices.findIndex(p => p === cp);
                        const country = SUPPORTED_COUNTRIES.find(c => c.code === cp.countryCode);
                        return (
                          <Box
                            key={i}
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 1.5,
                              py: 0.75, borderBottom: '1px solid', borderColor: 'divider',
                              '&:last-child': { borderBottom: 'none' },
                            }}
                          >
                            <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                              {country?.name || cp.countryCode}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ width: 36, flexShrink: 0 }}>
                              {cp.currencyCode}
                            </Typography>
                            <TextField
                              type="number"
                              value={cp.amount}
                              onChange={(e) => updateCountryPrice(i, 'amount', e.target.value)}
                              size="small"
                              sx={{ width: 110, flexShrink: 0 }}
                              inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right' } }}
                            />
                            <IconButton size="small" color="error" onClick={() => removeCountryPrice(i)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        );
                      })}
                  </Box>
                </Collapse>
              </Box>
            )}
          </Box>
        </Box>

        <Divider />

        {/* ── Links / Assessment ── */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Assessment & Links</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Assessment Links</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addAssessmentLink}>Add Link</Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                Each link appears as an "Take Assessment" button on the program page.
              </Typography>
              {form.assessmentLinks.map((link, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField
                    label="Button Label"
                    value={link.title}
                    onChange={(e) => updateAssessmentLink(i, 'title', e.target.value)}
                    size="small"
                    sx={{ width: 180 }}
                    placeholder="e.g. Pre-Assessment"
                  />
                  <TextField
                    label="URL *"
                    value={link.url}
                    onChange={(e) => updateAssessmentLink(i, 'url', e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                    placeholder="https://forms.google.com/..."
                  />
                  <IconButton size="small" color="error" onClick={() => removeAssessmentLink(i)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {form.assessmentLinks.length === 0 && (
                <Typography variant="body2" color="text.secondary">No assessment links yet.</Typography>
              )}
            </Box>
            <TextField
              label="Completion Reminder (days after enrollment)"
              type="number"
              value={form.reminderDays}
              onChange={(e) => set('reminderDays', e.target.value)}
              fullWidth size="small"
              placeholder="e.g. 7, 14, 30"
              helperText="Send a reminder email if the user hasn't completed the program after this many days. Leave empty to disable."
              inputProps={{ min: 1, step: 1 }}
            />
          </Box>
        </Box>

        <Divider />

        {/* ── Pre-Assessment (Practice) ── */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Pre-Assessment (Practice)</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Instructions (shown above pre-assessment buttons)"
              value={form.preAssessmentInstructions}
              onChange={(e) => set('preAssessmentInstructions', e.target.value)}
              fullWidth size="small" multiline rows={2}
              placeholder="e.g. Complete the pre-assessment before starting your learning journey. This helps us understand your baseline knowledge."
              helperText="Leave blank to use the default instruction text"
            />
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Pre-Assessment Links</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addPreAssessmentLink}>Add Link</Button>
              </Box>
              {form.preAssessmentLinks.map((link, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField
                    label="Button Label"
                    value={link.title}
                    onChange={(e) => updatePreAssessmentLink(i, 'title', e.target.value)}
                    size="small"
                    sx={{ width: 180 }}
                    placeholder="e.g. Pre-Assessment"
                  />
                  <TextField
                    label="URL *"
                    value={link.url}
                    onChange={(e) => updatePreAssessmentLink(i, 'url', e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                    placeholder="https://forms.google.com/..."
                  />
                  <IconButton size="small" color="error" onClick={() => removePreAssessmentLink(i)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {form.preAssessmentLinks.length === 0 && (
                <Typography variant="body2" color="text.secondary">No pre-assessment links yet.</Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* ── Course Detail Fields ── */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Course Details</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Target Audience"
              value={form.targetAudience}
              onChange={(e) => set('targetAudience', e.target.value)}
              fullWidth size="small" multiline rows={3}
              placeholder="Who is this program designed for?"
            />
            <TextField
              label="Assessment Method"
              value={form.assessment}
              onChange={(e) => set('assessment', e.target.value)}
              fullWidth size="small" multiline rows={3}
              placeholder="Describe the assessment method and criteria"
            />
            <TextField
              label="Outcome"
              value={form.outcome}
              onChange={(e) => set('outcome', e.target.value)}
              fullWidth size="small" multiline rows={3}
              placeholder="What will participants achieve upon completion?"
            />
            <TextField
              label="Duration of Training"
              value={form.trainingDuration}
              onChange={(e) => set('trainingDuration', e.target.value)}
              fullWidth size="small"
              placeholder="e.g., 3 Months, 40 Hours, 6 Weeks"
              helperText="Shown on the program detail page and printed on the certificate"
            />
            {/* Exam Details — array of strings */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Exam Details</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addExamDetail}>Add Detail</Button>
              </Box>
              {form.examDetails.map((detail, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField value={detail} onChange={(e) => updateExamDetail(i, e.target.value)}
                    size="small" fullWidth placeholder={`Exam detail ${i + 1}`} />
                  <IconButton size="small" color="error" onClick={() => removeExamDetail(i)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {form.examDetails.length === 0 && (
                <Typography variant="body2" color="text.secondary">No exam details yet.</Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* ── Videos ── */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <OndemandVideoIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={700}>Videos</Typography>
            </Box>
            <Button size="small" startIcon={<AddIcon />} onClick={addVideo}>Add Video</Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            Videos are only accessible to enrolled participants. URLs are encrypted for playback.
          </Typography>

          {form.videos.length === 0 && (
            <Typography variant="body2" color="text.secondary">No videos added yet.</Typography>
          )}

          {form.videos.map((video, i) => (
            <Paper key={i} variant="outlined" sx={{ mb: 1.5, p: 1.5, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 60 }}>
                  Video {i + 1}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Tooltip title="Move Up"><span>
                  <IconButton size="small" onClick={() => moveVideo(i, -1)} disabled={i === 0}>
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Move Down"><span>
                  <IconButton size="small" onClick={() => moveVideo(i, 1)} disabled={i === form.videos.length - 1}>
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Remove Video">
                  <IconButton size="small" color="error" onClick={() => removeVideo(i)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <TextField label="Title" value={video.title}
                  onChange={(e) => updateVideo(i, 'title', e.target.value)}
                  size="small" sx={{ flex: 2, minWidth: 160 }} placeholder={`Video ${i + 1}`} />
                <TextField label="Duration (seconds)" type="number" value={video.durationSeconds}
                  onChange={(e) => updateVideo(i, 'durationSeconds', e.target.value)}
                  size="small" sx={{ width: 160 }} />
                <TextField label="Video URL *" value={video.url}
                  onChange={(e) => updateVideo(i, 'url', e.target.value)}
                  size="small" fullWidth placeholder="https://vimeo.com/... or https://youtu.be/..." />
              </Box>
            </Paper>
          ))}
        </Box>

        <Divider />

        {/* ── Card Highlights ── */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>Card Highlights</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addHighlight}>Add</Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            These appear as ✓ tick marks on the program card (e.g. "5 Days / 40 Hrs", "Certificate Provided")
          </Typography>
          {form.cardHighlights.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField value={item} onChange={(e) => updateHighlight(i, e.target.value)}
                size="small" fullWidth placeholder={`Highlight ${i + 1}`} />
              <IconButton size="small" color="error" onClick={() => removeHighlight(i)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          {form.cardHighlights.length === 0 && (
            <Typography variant="body2" color="text.secondary">No highlights yet.</Typography>
          )}
        </Box>

        <Divider />

        {/* ── Background Image ── */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>Background Image</Typography>
          <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }} onChange={handleImageChange} />
          {form.backgroundImagePreview ? (
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Box component="img" src={form.backgroundImagePreview} alt="Background preview"
                sx={{ height: 140, maxWidth: '100%', borderRadius: 2, objectFit: 'cover', display: 'block' }} />
              <IconButton size="small"
                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                onClick={handleRemoveImage}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Button variant="outlined" startIcon={<ImageIcon />}
              onClick={() => imageInputRef.current?.click()} sx={{ borderStyle: 'dashed' }}>
              Upload Background Image
            </Button>
          )}
          {form.backgroundImagePreview && (
            <Button size="small" sx={{ mt: 1, display: 'block' }}
              onClick={() => imageInputRef.current?.click()}>
              Change Image
            </Button>
          )}
        </Box>

        <Divider />

        {/* ── Content Sections ── */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Content Sections</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {SECTION_TYPES.map((st) => (
                <Button key={st.value} size="small" variant="outlined" startIcon={<AddIcon />}
                  onClick={() => addSection(st.value)}>
                  {st.label}
                </Button>
              ))}
            </Box>
          </Box>

          {form.sections.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No sections yet. Add sections to describe the program content.
            </Typography>
          )}

          {form.sections.map((section, si) => (
            <Paper key={si} variant="outlined" sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5,
                bgcolor: SECTION_COLORS[section.type] || '#f5f5f5',
              }}>
                <Chip label={section.type.toUpperCase()} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                <TextField value={section.title}
                  onChange={(e) => updateSection(si, (s) => ({ ...s, title: e.target.value }))}
                  placeholder="Section title" size="small"
                  sx={{ flex: 1, bgcolor: 'background.paper', borderRadius: 1 }} />
                <Tooltip title="Move Up"><span>
                  <IconButton size="small" onClick={() => moveSection(si, -1)} disabled={si === 0}>
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Move Down"><span>
                  <IconButton size="small" onClick={() => moveSection(si, 1)} disabled={si === form.sections.length - 1}>
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span></Tooltip>
                <Tooltip title="Delete Section">
                  <IconButton size="small" color="error" onClick={() => removeSection(si)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ p: 2 }}>
                {section.type === 'text' && (
                  <TextField label="Content" value={section.content || ''}
                    onChange={(e) => updateSection(si, (s) => ({ ...s, content: e.target.value }))}
                    fullWidth multiline rows={4} size="small" />
                )}
                {(section.type === 'overview' || section.type === 'bullets') && (
                  <Box>
                    {(section.items || []).map((item, ii) => (
                      <Box key={ii} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField value={item} onChange={(e) => updateItem(si, ii, e.target.value)}
                          fullWidth size="small" placeholder={`Item ${ii + 1}`} />
                        <IconButton size="small" color="error" onClick={() => removeItem(si, ii)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    <Button size="small" startIcon={<AddIcon />} onClick={() => addItem(si)}>Add Item</Button>
                  </Box>
                )}
                {section.type === 'modules' && (
                  <Box>
                    {(section.modules || []).map((mod, mi) => (
                      <Accordion key={mi} disableGutters elevation={0}
                        sx={{ border: '1px solid', borderColor: 'divider', mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, mr: 1 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ mr: 1 }}>Module {mi + 1}</Typography>
                            <TextField value={mod.title}
                              onChange={(e) => { e.stopPropagation(); updateModule(si, mi, 'title', e.target.value); }}
                              onClick={(e) => e.stopPropagation()}
                              size="small" placeholder="Module title" sx={{ flex: 1 }} />
                          </Box>
                          <IconButton size="small" color="error"
                            onClick={(e) => { e.stopPropagation(); removeModule(si, mi); }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TextField label="Description" value={mod.description || ''}
                            onChange={(e) => updateModule(si, mi, 'description', e.target.value)}
                            fullWidth multiline rows={2} size="small" sx={{ mb: 1.5 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            Sub-points
                          </Typography>
                          {(mod.points || []).map((pt, pi) => (
                            <Box key={pi} sx={{ display: 'flex', gap: 1, mb: 0.75 }}>
                              <TextField value={pt}
                                onChange={(e) => updateModulePoint(si, mi, pi, e.target.value)}
                                size="small" fullWidth placeholder={`Point ${pi + 1}`} />
                              <IconButton size="small" color="error"
                                onClick={() => removeModulePoint(si, mi, pi)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                          <Button size="small" startIcon={<AddIcon />}
                            onClick={() => addModulePoint(si, mi)}>Add Point</Button>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                    <Button size="small" startIcon={<AddIcon />} onClick={() => addModule(si)}>Add Module</Button>
                  </Box>
                )}
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Manuals — only shown when editing an existing program */}
        {program?.id && (
          <Box sx={{ mt: 3 }}>
            <ManualSection flagshipProgramId={program.id} isAdmin title="Manuals & Documents" />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}
          sx={{ bgcolor: '#7B2D8B', '&:hover': { bgcolor: '#6A1B7A' } }}>
          {saving ? <CircularProgress size={20} color="inherit" /> : program ? 'Save Changes' : 'Create Program'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FlagshipProgramForm;
