import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Grid, IconButton, Divider, Chip,
  InputAdornment, Paper, Alert, Stack, TextField, Tooltip,
  MenuItem, Select as MuiSelect, FormControl, InputLabel,
  Collapse, Autocomplete,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import TableChartIcon from '@mui/icons-material/TableChart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { FormField, Select, Button } from '../common';
import { validateForm, hasErrors } from '../../utils/validators';
import { getApiBaseUrl } from '../../services/api';
import { blogService } from '../../services';

// ── Section types ─────────────────────────────────────────────────────────────
const SECTION_TYPES = [
  { value: 'intro',    label: 'Introduction',    icon: <FormatAlignLeftIcon />,    color: '#e3f2fd', desc: 'Opening paragraph' },
  { value: 'text',     label: 'Text Block',       icon: <FormatAlignLeftIcon />,    color: '#f3e5f5', desc: 'Regular paragraph content' },
  { value: 'bullets',  label: 'Bullet List',      icon: <FormatListBulletedIcon />, color: '#e8f5e9', desc: 'Unordered bullet points' },
  { value: 'numbered', label: 'Numbered List',    icon: <FormatListNumberedIcon />, color: '#fff8e1', desc: 'Ordered numbered list' },
  { value: 'callout',  label: 'Callout / Quote',  icon: <FormatQuoteIcon />,        color: '#fce4ec', desc: 'Highlighted note or quote' },
  { value: 'table',    label: 'Table',            icon: <TableChartIcon />,         color: '#e0f2f1', desc: 'Data in rows & columns' },
  { value: 'faq',      label: 'FAQ',              icon: <HelpOutlineIcon />,        color: '#ede7f6', desc: 'Question & answer pairs' },
  { value: 'image',    label: 'Image',            icon: <ImageOutlinedIcon />,      color: '#fff3e0', desc: 'Image with optional caption' },
];

const SECTION_DEFAULTS = {
  intro:    { content: '' },
  text:     { content: '' },
  bullets:  { items: [''] },
  numbered: { items: [''] },
  callout:  { content: '' },
  table:    { headers: ['', ''], rows: [['', '']] },
  faq:      { items: [{ question: '', answer: '' }] },
  image:    { url: '', caption: '' },
};

const STATUS_OPTIONS = [
  { value: 'DRAFT',     label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ARCHIVED',  label: 'Archived' },
];

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC',       label: 'Public' },
  { value: 'PRIVATE',      label: 'Private' },
  { value: 'MEMBERS_ONLY', label: 'Members Only' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'Tamil' },
  { value: 'hi', label: 'Hindi' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function SectionCard({ section, index, total, onUpdate, onRemove, onMove }) {
  const meta = SECTION_TYPES.find(t => t.value === section.type) || SECTION_TYPES[0];

  const upd = (patch) => onUpdate(index, { ...section, ...patch });
  const updItem = (i, v) => { const items = [...section.items]; items[i] = v; upd({ items }); };
  const addItem = () => upd({ items: [...(section.items || []), ''] });
  const removeItem = (i) => upd({ items: section.items.filter((_, j) => j !== i) });

  const updHeader = (i, v) => { const headers = [...section.headers]; headers[i] = v; upd({ headers }); };
  const addCol = () => upd({ headers: [...section.headers, ''], rows: section.rows.map(r => [...r, '']) });
  const removeCol = (i) => upd({ headers: section.headers.filter((_, j) => j !== i), rows: section.rows.map(r => r.filter((_, j) => j !== i)) });
  const updCell = (ri, ci, v) => { const rows = section.rows.map(r => [...r]); rows[ri][ci] = v; upd({ rows }); };
  const addRow = () => upd({ rows: [...section.rows, section.headers.map(() => '')] });
  const removeRow = (i) => upd({ rows: section.rows.filter((_, j) => j !== i) });

  const updFaq = (i, field, v) => { const items = section.items.map((it, j) => j === i ? { ...it, [field]: v } : it); upd({ items }); };
  const addFaq = () => upd({ items: [...section.items, { question: '', answer: '' }] });
  const removeFaq = (i) => upd({ items: section.items.filter((_, j) => j !== i) });

  return (
    <Paper
      variant="outlined"
      sx={{ mb: 2, overflow: 'hidden', borderColor: 'divider' }}
    >
      {/* Section header bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25, bgcolor: meta.color }}>
        <Box sx={{ color: 'text.secondary', display: 'flex' }}>{meta.icon}</Box>
        <Chip label={meta.label} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
        <TextField
          value={section.title || ''}
          onChange={e => upd({ title: e.target.value })}
          placeholder="Section heading (optional)"
          size="small"
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.7)' } }}
        />
        <Tooltip title="Move Up">
          <span><IconButton size="small" onClick={() => onMove(index, -1)} disabled={index === 0}><ArrowUpwardIcon fontSize="small" /></IconButton></span>
        </Tooltip>
        <Tooltip title="Move Down">
          <span><IconButton size="small" onClick={() => onMove(index, 1)} disabled={index === total - 1}><ArrowDownwardIcon fontSize="small" /></IconButton></span>
        </Tooltip>
        <Tooltip title="Remove Section">
          <IconButton size="small" color="error" onClick={() => onRemove(index)}><DeleteIcon fontSize="small" /></IconButton>
        </Tooltip>
      </Box>

      {/* Section body */}
      <Box sx={{ p: 2 }}>
        {/* intro / text / callout */}
        {(section.type === 'intro' || section.type === 'text' || section.type === 'callout') && (
          <TextField
            fullWidth multiline minRows={section.type === 'callout' ? 2 : 3}
            label={section.type === 'callout' ? 'Callout text' : 'Content'}
            value={section.content || ''}
            onChange={e => upd({ content: e.target.value })}
            placeholder={section.type === 'callout' ? 'Important note or highlighted quote...' : 'Write paragraph content here...'}
          />
        )}

        {/* bullets / numbered */}
        {(section.type === 'bullets' || section.type === 'numbered') && (
          <Box>
            {(section.items || []).map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, textAlign: 'right' }}>
                  {section.type === 'numbered' ? `${i + 1}.` : '•'}
                </Typography>
                <TextField
                  fullWidth size="small" value={item}
                  onChange={e => updItem(i, e.target.value)}
                  placeholder={`Item ${i + 1}`}
                />
                <IconButton size="small" color="error" onClick={() => removeItem(i)} disabled={section.items.length === 1}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={addItem} sx={{ mt: 0.5 }}>
              Add Item
            </Button>
          </Box>
        )}

        {/* table */}
        {section.type === 'table' && (
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">Headers:</Typography>
              {(section.headers || []).map((h, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 0.5 }}>
                  <TextField size="small" value={h} onChange={e => updHeader(i, e.target.value)}
                    placeholder={`Col ${i + 1}`} sx={{ width: 120 }} />
                  <IconButton size="small" color="error" onClick={() => removeCol(i)} disabled={section.headers.length <= 1}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<AddIcon />} onClick={addCol}>Col</Button>
            </Box>
            {(section.rows || []).map((row, ri) => (
              <Box key={ri} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                {row.map((cell, ci) => (
                  <TextField key={ci} size="small" value={cell}
                    onChange={e => updCell(ri, ci, e.target.value)}
                    placeholder={`Row ${ri + 1}, Col ${ci + 1}`} sx={{ width: 120 }} />
                ))}
                <IconButton size="small" color="error" onClick={() => removeRow(ri)} disabled={section.rows.length === 1}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={addRow}>Add Row</Button>
          </Box>
        )}

        {/* faq */}
        {section.type === 'faq' && (
          <Box>
            {(section.items || []).map((item, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" fontWeight={700} color="primary">Q&A {i + 1}</Typography>
                  <IconButton size="small" color="error" onClick={() => removeFaq(i)} disabled={section.items.length === 1}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <TextField fullWidth size="small" label="Question" value={item.question || ''}
                  onChange={e => updFaq(i, 'question', e.target.value)} sx={{ mb: 1 }} />
                <TextField fullWidth multiline minRows={2} size="small" label="Answer" value={item.answer || ''}
                  onChange={e => updFaq(i, 'answer', e.target.value)} />
              </Paper>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={addFaq}>Add Q&A</Button>
          </Box>
        )}

        {/* image */}
        {section.type === 'image' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField fullWidth size="small" label="Image URL" value={section.url || ''}
              onChange={e => upd({ url: e.target.value })} placeholder="https://example.com/image.jpg" />
            <TextField fullWidth size="small" label="Caption (optional)" value={section.caption || ''}
              onChange={e => upd({ caption: e.target.value })} placeholder="Describe the image..." />
            {section.url && (
              <Box component="img" src={section.url} alt="preview"
                sx={{ maxHeight: 200, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
              />
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
function BlogForm({ blog, onSave, onCancel, loading = false }) {
  const imageInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    authorName: 'Editorial Team',
    category: '',
    tags: '',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    language: 'en',
    urlSlug: '',
    imageUrl: '',
  });
  const [sections, setSections] = useState([]);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');

  // Load categories dynamically
  useEffect(() => {
    blogService.getCategoriesWithCount()
      .then(data => {
        // data is [[category, count], ...]
        const cats = (data || []).map(([cat]) => ({ value: cat, label: cat }));
        // Merge with defaults so new categories appear even if no published blogs yet
        const defaults = ['News','Tutorials','Industry Insights','Research','Events','Career Tips','Technology','Health','Education','Other'];
        const merged = [...new Map([
          ...defaults.map(d => [d, { value: d, label: d }]),
          ...cats.map(c => [c.value, c]),
        ].reverse()).values()];
        setCategories(merged);
      })
      .catch(() => {
        setCategories(['News','Tutorials','Industry Insights','Research','Events','Career Tips','Technology','Health','Education','Other']
          .map(c => ({ value: c, label: c })));
      });
  }, []);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        shortDescription: blog.shortDescription || '',
        authorName: blog.authorName || 'Editorial Team',
        category: blog.category || '',
        tags: blog.tags || '',
        status: blog.status || 'DRAFT',
        visibility: blog.visibility || 'PUBLIC',
        language: blog.language || 'en',
        urlSlug: blog.urlSlug || '',
        imageUrl: blog.imageUrl || '',
      });

      // Parse sections
      try {
        setSections(blog.sections ? JSON.parse(blog.sections) : []);
      } catch { setSections([]); }

      if (blog.featuredImage && blog.id) {
        setImagePreview(`${getApiBaseUrl()}/api/blogs/admin/${blog.id}/image`);
      } else if (blog.imageUrl) {
        setImagePreview(blog.imageUrl);
      } else {
        setImagePreview(null);
        setImageFile(null);
      }
    } else {
      // Reset all state when creating a new blog
      setFormData({
        title: '',
        shortDescription: '',
        authorName: 'Editorial Team',
        category: '',
        tags: '',
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        language: 'en',
        urlSlug: '',
        imageUrl: '',
      });
      setSections([]);
      setImagePreview(null);
      setImageFile(null);
      setErrors({});
    }
  }, [blog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── Image upload ────────────────────────────────────────────────────────────
  const processImageFile = (file) => {
    setImageError('');
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED.includes(file.type)) { setImageError('Invalid format. Use JPEG, PNG, WebP, or GIF.'); return; }
    if (file.size > 5 * 1024 * 1024) { setImageError('File too large. Maximum size is 5 MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setImageFile(file); setImagePreview(reader.result); };
    reader.readAsDataURL(file);
  };
  const handleImageSelect = (e) => { const f = e.target.files?.[0]; if (f) processImageFile(f); };
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) processImageFile(f); };
  const handleRemoveImage = () => { setImageFile(null); setImagePreview(null); setImageError(''); if (imageInputRef.current) imageInputRef.current.value = ''; };

  // ── Sections ────────────────────────────────────────────────────────────────
  const addSection = (type) => {
    setSections(prev => [...prev, { type, title: '', ...SECTION_DEFAULTS[type] }]);
  };
  const updateSection = (i, updated) => setSections(prev => prev.map((s, j) => j === i ? updated : s));
  const removeSection = (i) => setSections(prev => prev.filter((_, j) => j !== i));
  const moveSection = (i, dir) => {
    const arr = [...sections];
    const t = i + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[i], arr[t]] = [arr[t], arr[i]];
    setSections(arr);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const schema = {
      title:    { required: true, label: 'Title', minLength: 3, maxLength: 70 },
      category: { required: true, label: 'Category' },
    };
    if (sections.length === 0) {
      setErrors(prev => ({ ...prev, sections: 'Add at least one content section.' }));
      return;
    }
    const validationErrors = validateForm(schema, formData);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    // Build plain-text content for reading time calculation
    const plainContent = sections.map(s => {
      if (s.content) return s.content;
      if (s.items) return s.type === 'faq' ? s.items.map(i => `${i.question} ${i.answer}`).join(' ') : s.items.join(' ');
      if (s.rows) return s.rows.map(r => r.join(' ')).join(' ');
      return '';
    }).join(' ');

    onSave?.({
      title: formData.title,
      shortDescription: formData.shortDescription || null,
      content: plainContent,
      sections: JSON.stringify(sections),
      authorName: formData.authorName || 'Editorial Team',
      category: formData.category,
      tags: formData.tags || null,
      status: formData.status,
      visibility: formData.visibility,
      language: formData.language,
      urlSlug: formData.urlSlug || null,
      imageUrl: formData.imageUrl || null,
    }, { imageFile });
  };

  const isEditing = !!blog?.id;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={3}>

        {/* ── Featured Image ─────────────────────────────── */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Featured Image</Typography>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={5}>
              <Box
                onClick={() => !imagePreview && imageInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                sx={{
                  height: 190,
                  border: '2px dashed',
                  borderColor: dragOver ? 'primary.main' : imagePreview ? 'success.main' : 'divider',
                  borderRadius: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                  bgcolor: dragOver ? 'primary.50' : 'background.default',
                  cursor: imagePreview ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {imagePreview ? (
                  <>
                    <Box component="img" src={imagePreview} alt="Preview"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton onClick={e => { e.stopPropagation(); handleRemoveImage(); }} size="small"
                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' } }}>
                      <DeleteIcon fontSize="small" sx={{ color: 'white' }} />
                    </IconButton>
                    <CheckCircleIcon sx={{ position: 'absolute', bottom: 8, left: 8, color: 'success.main', bgcolor: 'white', borderRadius: '50%', fontSize: 22 }} />
                  </>
                ) : (
                  <Stack alignItems="center" spacing={1}>
                    <ImageIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Drag & drop or click to upload
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={7}>
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageSelect} style={{ display: 'none' }} />
              <Button variant="outlined" startIcon={<CloudUploadIcon />}
                onClick={() => imageInputRef.current?.click()} sx={{ mb: 2 }}>
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>Image Requirements</Typography>
                <Stack spacing={0.5}>
                  {['Formats: JPEG, PNG, WebP, GIF', 'Recommended: 1200 × 630 px (16:9)', 'Max file size: 5 MB'].map(l => (
                    <Typography key={l} variant="caption" color="text.secondary">• {l}</Typography>
                  ))}
                </Stack>
              </Paper>
              {imageError && <Alert severity="error" sx={{ mt: 1 }}>{imageError}</Alert>}
              {imageFile && <Alert severity="success" sx={{ mt: 1 }}>{imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB) — ready</Alert>}
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}><Divider /></Grid>

        {/* ── Basic Info ─────────────────────────────────── */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Basic Information</Typography>
        </Grid>

        <Grid item xs={12}>
          <FormField name="title" label="Blog Title" value={formData.title} onChange={handleChange}
            error={errors.title} required placeholder="Enter a clear, descriptive title"
            helperText={`${formData.title.length}/70 characters`} inputProps={{ maxLength: 70 }} />
        </Grid>

        <Grid item xs={12}>
          <FormField name="shortDescription" label="Short Description" value={formData.shortDescription}
            onChange={handleChange} placeholder="Brief summary shown on blog cards and search results"
            helperText={`${formData.shortDescription.length}/300 characters — used for SEO`}
            multiline rows={2} inputProps={{ maxLength: 300 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField name="authorName" label="Author Name" value={formData.authorName}
            onChange={handleChange} placeholder="Editorial Team" />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete
            freeSolo
            options={categories.map(c => c.value || c)}
            value={formData.category}
            onInputChange={(_, newValue) => {
              setFormData(prev => ({ ...prev, category: newValue }));
              if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category *"
                size="small"
                error={!!errors.category}
                helperText={errors.category || 'Select existing or type a new category'}
                placeholder="e.g. Food Science"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <FormField name="tags" label="Tags" value={formData.tags} onChange={handleChange}
            placeholder="food safety, microbiology, HACCP (comma separated)"
            helperText="Tags help readers find related content" />
          {formData.tags && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {formData.tags.split(',').map((tag, i) =>
                tag.trim() ? <Chip key={i} label={tag.trim()} size="small" variant="outlined" /> : null
              )}
            </Box>
          )}
        </Grid>

        <Grid item xs={12}><Divider /></Grid>

        {/* ── Content Sections ───────────────────────────── */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Content Sections</Typography>
          </Box>

          {/* Add section buttons */}
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Add a section:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {SECTION_TYPES.map(st => (
                <Button key={st.value} size="small" variant="outlined" startIcon={st.icon}
                  onClick={() => addSection(st.value)}
                  sx={{ bgcolor: st.color, borderColor: 'divider', color: 'text.primary', '&:hover': { bgcolor: st.color, opacity: 0.85 } }}>
                  {st.label}
                </Button>
              ))}
            </Box>
          </Paper>

          {errors.sections && <Alert severity="error" sx={{ mb: 2 }}>{errors.sections}</Alert>}

          {sections.length === 0 && (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
              <Typography color="text.secondary">
                No sections yet. Click a button above to add your first section.
              </Typography>
            </Paper>
          )}

          {sections.map((section, i) => (
            <SectionCard key={i} section={section} index={i} total={sections.length}
              onUpdate={updateSection} onRemove={removeSection} onMove={moveSection} />
          ))}
        </Grid>

        <Grid item xs={12}><Divider /></Grid>

        {/* ── Publishing ─────────────────────────────────── */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Publishing</Typography>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Select name="status" label="Status" value={formData.status} onChange={handleChange} options={STATUS_OPTIONS} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Select name="visibility" label="Visibility" value={formData.visibility} onChange={handleChange} options={VISIBILITY_OPTIONS} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Select name="language" label="Language" value={formData.language} onChange={handleChange} options={LANGUAGE_OPTIONS} />
        </Grid>

        <Grid item xs={12}>
          <FormField name="urlSlug" label="URL Slug" value={formData.urlSlug} onChange={handleChange}
            placeholder="auto-generated-from-title" helperText="Leave blank to auto-generate from the title"
            InputProps={{ startAdornment: <InputAdornment position="start">/blog/</InputAdornment> }} />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`${sections.length} section${sections.length !== 1 ? 's' : ''}`} size="small" variant="outlined" />
            <Chip label={formData.status} size="small" color={formData.status === 'PUBLISHED' ? 'success' : 'default'} />
            {imageFile && <Chip label="Image ready" size="small" color="info" />}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} disabled={loading} type="button">Cancel</Button>
        <Button variant="contained" type="submit" loading={loading}>
          {isEditing ? 'Save Changes' : 'Publish Blog'}
        </Button>
      </Box>
    </Box>
  );
}

export default BlogForm;
