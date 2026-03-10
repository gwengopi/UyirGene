import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Box, Typography, Button, Table, TableHead, TableRow,
  TableCell, TableBody, Paper, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Tooltip, Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import standardsService from '../../services/standardsService';
import { useToast } from '../../store';

const CATEGORY_SUGGESTIONS = ['HACCP', 'Food Safety', 'GMP', 'ISO', 'Regulations', 'Other'];

const emptyForm = { title: '', description: '', category: '', displayOrder: '', file: null, removeFile: false };

export default function AdminStandards() {
  const { showSuccess, showError } = useToast();
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const fileRef = useRef(null);

  const load = () => {
    setLoading(true);
    standardsService.getAll().then(setStandards).catch(() => showError('Failed to load standards.')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (s) => {
    setEditTarget(s);
    setForm({ title: s.title, description: s.description || '', category: s.category || '', displayOrder: s.displayOrder?.toString() || '', file: null, removeFile: false });
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditTarget(null); };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setForm((f) => ({ ...f, file, removeFile: false }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { showError('Title is required.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      if (form.description.trim()) fd.append('description', form.description.trim());
      if (form.category.trim()) fd.append('category', form.category.trim());
      if (form.displayOrder) fd.append('displayOrder', parseInt(form.displayOrder, 10));
      if (form.file) fd.append('file', form.file);
      if (editTarget) fd.append('removeFile', form.removeFile);

      if (editTarget) {
        await standardsService.update(editTarget.id, fd);
        showSuccess('Standard updated.');
      } else {
        await standardsService.create(fd);
        showSuccess('Standard created.');
      }
      closeDialog();
      load();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save standard.';
      showError(msg);
      console.error('Standard save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await standardsService.delete(deleteId);
      showSuccess('Standard deleted.');
      setDeleteId(null);
      load();
    } catch {
      showError('Failed to delete.');
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout title="Standards">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Uyirgene Standards</Typography>
            <Typography variant="body2" color="text.secondary">Manage downloadable manuals and guidelines</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Standard</Button>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
        ) : (
          <Paper elevation={0} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>File</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Order</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {standards.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>No standards yet. Click "Add Standard" to create one.</TableCell></TableRow>
                )}
                {standards.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Typography fontWeight={600} variant="body2">{s.title}</Typography>
                      {s.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                          {s.description.length > 80 ? s.description.slice(0, 80) + '…' : s.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {s.category ? <Chip label={s.category} size="small" /> : <Typography variant="caption" color="text.disabled">—</Typography>}
                    </TableCell>
                    <TableCell>
                      {s.hasFile ? (
                        <Tooltip title={s.fileName || 'File uploaded'}>
                          <Chip icon={<CheckCircleIcon />} label="Uploaded" size="small" color="success" variant="outlined" />
                        </Tooltip>
                      ) : (
                        <Chip icon={<HourglassEmptyIcon />} label="No file" size="small" variant="outlined" sx={{ color: 'text.disabled' }} />
                      )}
                    </TableCell>
                    <TableCell>{s.displayOrder ?? 0}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(s)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(s.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') closeDialog(); }} disableEscapeKeyDown maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editTarget ? 'Edit Standard' : 'Add Standard'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <TextField
            label="Title" required fullWidth size="small"
            value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. HACCP Implementation Guide"
          />
          <TextField
            label="Description" fullWidth multiline rows={3} size="small"
            value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief overview of what this document covers"
          />
          <TextField
            label="Category" fullWidth size="small"
            value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="e.g. HACCP, Food Safety, GMP"
            helperText={"Suggestions: " + CATEGORY_SUGGESTIONS.join(', ')}
          />
          <TextField
            label="Display Order" fullWidth size="small" type="number"
            value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
            helperText="Lower number = shown first" inputProps={{ min: 0 }}
          />

          {/* File upload */}
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Document File</Typography>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileChange} style={{ display: 'none' }} />
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" size="small" startIcon={<UploadFileIcon />} onClick={() => fileRef.current?.click()}>
                {form.file ? 'Change File' : editTarget?.hasFile ? 'Replace File' : 'Upload File'}
              </Button>
              {editTarget?.hasFile && !form.file && (
                <Button size="small" color="error" onClick={() => setForm((f) => ({ ...f, removeFile: true }))}>
                  Remove File
                </Button>
              )}
            </Stack>
            {form.file && (
              <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                Selected: {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}
            {editTarget?.hasFile && !form.file && !form.removeFile && (
              <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                Current file: {editTarget.fileName || 'uploaded'} — leave blank to keep
              </Typography>
            )}
            {form.removeFile && (
              <Alert severity="warning" sx={{ mt: 1, py: 0 }}>File will be removed on save.</Alert>
            )}
            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
              Accepted: PDF, Word, Excel · Max 20 MB
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
            {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onClose={(e, reason) => { if (reason !== 'backdropClick') setDeleteId(null); }} disableEscapeKeyDown maxWidth="xs" fullWidth>
        <DialogTitle>Delete Standard?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently delete the standard and its uploaded file. This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
