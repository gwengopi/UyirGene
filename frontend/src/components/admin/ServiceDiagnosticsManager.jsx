import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Grid,
  Divider,
  Alert,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { Button, LoadingSpinner } from '../common';
import { serviceDiagnosticsService } from '../../services';
import { useToast } from '../../store';
import { getApiBaseUrl } from '../../services/api';

const emptyFormData = {
  title: '',
  subtitle: '',
  description: '',
  testProfiles: [],
  highlights: [],
  published: false,
  displayOrder: 0,
  thumbnailImage: null,
  heroImage: null,
};

function ServiceDiagnosticsManager() {
  const { showSuccess, showError } = useToast();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDiag, setSelectedDiag] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [saving, setSaving] = useState(false);

  // Temporary input states for test profile fields
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestDescription, setNewTestDescription] = useState('');
  const [newTestReportingTime, setNewTestReportingTime] = useState('');
  const [newTestCategory, setNewTestCategory] = useState('');

  // Temporary input states for highlight fields
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [newHighlightDescription, setNewHighlightDescription] = useState('');

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    setLoading(true);
    try {
      const data = await serviceDiagnosticsService.getAllDiagnostics();
      setDiagnostics(data);
    } catch (error) {
      showError('Failed to load clinical research entries');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (diag = null) => {
    if (diag) {
      setSelectedDiag(diag);
      setFormData({
        title: diag.title || '',
        subtitle: diag.subtitle || '',
        description: diag.description || '',
        testProfiles: diag.testProfiles || [],
        highlights: diag.highlights || [],
        published: diag.published || false,
        displayOrder: diag.displayOrder || 0,
        thumbnailImage: null,
        heroImage: null,
      });
    } else {
      setSelectedDiag(null);
      setFormData(emptyFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDiag(null);
    setFormData(emptyFormData);
    setNewTestTitle('');
    setNewTestDescription('');
    setNewTestReportingTime('');
    setNewTestCategory('');
    setNewHighlightTitle('');
    setNewHighlightDescription('');
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showError('Title is required');
      return;
    }

    setSaving(true);
    try {
      if (selectedDiag) {
        await serviceDiagnosticsService.updateDiagnostics(selectedDiag.id, formData);
        showSuccess('Clinical research entry updated successfully');
      } else {
        await serviceDiagnosticsService.createDiagnostics(formData);
        showSuccess('Clinical research entry created successfully');
      }
      handleCloseDialog();
      loadDiagnostics();
    } catch (error) {
      showError(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDiag) return;
    setSaving(true);
    try {
      await serviceDiagnosticsService.deleteDiagnostics(selectedDiag.id);
      showSuccess('Clinical research entry deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedDiag(null);
      loadDiagnostics();
    } catch (error) {
      showError('Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTestProfile = () => {
    if (newTestTitle.trim() && newTestDescription.trim()) {
      setFormData((prev) => ({
        ...prev,
        testProfiles: [
          ...prev.testProfiles,
          {
            title: newTestTitle.trim(),
            description: newTestDescription.trim(),
            reportingTime: newTestReportingTime.trim() || '',
            category: newTestCategory.trim() || '',
          },
        ],
      }));
      setNewTestTitle('');
      setNewTestDescription('');
      setNewTestReportingTime('');
      setNewTestCategory('');
    }
  };

  const handleRemoveTestProfile = (index) => {
    setFormData((prev) => ({
      ...prev,
      testProfiles: prev.testProfiles.filter((_, i) => i !== index),
    }));
  };

  const handleAddHighlight = () => {
    if (newHighlightTitle.trim() && newHighlightDescription.trim()) {
      setFormData((prev) => ({
        ...prev,
        highlights: [
          ...prev.highlights,
          { title: newHighlightTitle.trim(), description: newHighlightDescription.trim() },
        ],
      }));
      setNewHighlightTitle('');
      setNewHighlightDescription('');
    }
  };

  const handleRemoveHighlight = (index) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <LoadingSpinner text="Loading clinical research entries..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Clinical Research
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Entry
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Manage clinical research &amp; medical testing entries displayed in the Services &gt; Clinical Research section. Each entry can have test profiles, highlights, and images.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Subtitle</TableCell>
              <TableCell align="center">Test Profiles</TableCell>
              <TableCell align="center">Published</TableCell>
              <TableCell align="center">Order</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {diagnostics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No entries found. Click "Add Entry" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              diagnostics.map((diag) => (
                <TableRow key={diag.id} hover>
                  <TableCell>
                    <Avatar
                      src={diag.thumbnailImageUrl ? `${getApiBaseUrl()}${diag.thumbnailImageUrl}` : undefined}
                      variant="rounded"
                      sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                    >
                      <LocalHospitalIcon />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>{diag.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {diag.subtitle}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{diag.testProfiles?.length || 0}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={diag.published ? 'Published' : 'Draft'}
                      color={diag.published ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{diag.displayOrder}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(diag)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedDiag(diag);
                        setDeleteDialogOpen(true);
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') handleCloseDialog(); }} disableEscapeKeyDown maxWidth="md" fullWidth>
        <DialogTitle>{selectedDiag ? 'Edit Clinical Research Entry' : 'Add New Clinical Research Entry'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                label="Title"
                fullWidth
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Clinical Research & Medical Testing"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Display Order"
                type="number"
                fullWidth
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Subtitle"
                fullWidth
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., Advanced Testing Solutions at Uyirgene Research Lab"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description (Overview)"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

            {/* Test Profiles */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Test Profiles
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add test profiles with title, description, reporting time, and category
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {formData.testProfiles.map((test, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      <Typography fontWeight={500}>{test.title}</Typography>
                      {test.category && <Chip label={test.category} size="small" variant="outlined" />}
                      {test.reportingTime && <Chip label={test.reportingTime} size="small" color="primary" />}
                    </Box>
                    <Typography variant="body2" color="text.secondary">{test.description}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleRemoveTestProfile(i)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={12} md={3}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Test Title"
                    value={newTestTitle}
                    onChange={(e) => setNewTestTitle(e.target.value)}
                    placeholder="e.g., Thyroid Profile"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Category"
                    value={newTestCategory}
                    onChange={(e) => setNewTestCategory(e.target.value)}
                    placeholder="e.g., Hormonal"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Reporting Time"
                    value={newTestReportingTime}
                    onChange={(e) => setNewTestReportingTime(e.target.value)}
                    placeholder="e.g., 6 Hrs"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Description"
                    value={newTestDescription}
                    onChange={(e) => setNewTestDescription(e.target.value)}
                    placeholder="Brief description"
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <Button variant="outlined" fullWidth onClick={handleAddTestProfile}>
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Highlights */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Highlights
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add highlight cards with title and description
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {formData.highlights.map((highlight, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography fontWeight={500}>{highlight.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{highlight.description}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleRemoveHighlight(i)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Highlight Title"
                    value={newHighlightTitle}
                    onChange={(e) => setNewHighlightTitle(e.target.value)}
                    placeholder="e.g., Advanced Equipment"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Highlight Description"
                    value={newHighlightDescription}
                    onChange={(e) => setNewHighlightDescription(e.target.value)}
                    placeholder="Brief description of this highlight"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button variant="outlined" fullWidth onClick={handleAddHighlight}>
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {/* Images */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Images
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Thumbnail Image (for card display)
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, thumbnailImage: e.target.files[0] })}
              />
              {selectedDiag?.thumbnailImageUrl && !formData.thumbnailImage && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Current image will be kept unless you upload a new one.
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Hero Image (for detail page header)
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, heroImage: e.target.files[0] })}
              />
              {selectedDiag?.heroImageUrl && !formData.heroImage && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Current image will be kept unless you upload a new one.
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  />
                }
                label="Published (visible to users)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} loading={saving}>
            {selectedDiag ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') setDeleteDialogOpen(false); }} disableEscapeKeyDown>
        <DialogTitle>Delete Clinical Research Entry?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedDiag?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} loading={saving}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ServiceDiagnosticsManager;
