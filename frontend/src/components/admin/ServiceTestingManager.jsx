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
import ScienceIcon from '@mui/icons-material/Science';
import { Button, LoadingSpinner } from '../common';
import { serviceTestingService } from '../../services';
import { useToast } from '../../store';
import { getApiBaseUrl } from '../../services/api';

const emptyFormData = {
  title: '',
  subtitle: '',
  description: '',
  whatIs: '',
  whyMatters: '',
  certificate: '',
  testingServices: [],
  highlights: [],
  published: false,
  displayOrder: 0,
  thumbnailImage: null,
  heroImage: null,
};

function ServiceTestingManager() {
  const { showSuccess, showError } = useToast();
  const [testings, setTestings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTesting, setSelectedTesting] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [saving, setSaving] = useState(false);

  // Temporary input states for array fields
  const [newTestingService, setNewTestingService] = useState('');
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [newHighlightDescription, setNewHighlightDescription] = useState('');

  useEffect(() => {
    loadTestings();
  }, []);

  const loadTestings = async () => {
    setLoading(true);
    try {
      const data = await serviceTestingService.getAllTestings();
      setTestings(data);
    } catch (error) {
      showError('Failed to load testings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (testing = null) => {
    if (testing) {
      setSelectedTesting(testing);
      setFormData({
        title: testing.title || '',
        subtitle: testing.subtitle || '',
        description: testing.description || '',
        whatIs: testing.whatIs || '',
        whyMatters: testing.whyMatters || '',
        certificate: testing.certificate || '',
        testingServices: testing.testingServices || [],
        highlights: testing.highlights || [],
        published: testing.published || false,
        displayOrder: testing.displayOrder || 0,
        thumbnailImage: null,
        heroImage: null,
      });
    } else {
      setSelectedTesting(null);
      setFormData(emptyFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTesting(null);
    setFormData(emptyFormData);
    setNewTestingService('');
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
      if (selectedTesting) {
        await serviceTestingService.updateTesting(selectedTesting.id, formData);
        showSuccess('Testing updated successfully');
      } else {
        await serviceTestingService.createTesting(formData);
        showSuccess('Testing created successfully');
      }
      handleCloseDialog();
      loadTestings();
    } catch (error) {
      showError(error.message || 'Failed to save testing');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTesting) return;
    setSaving(true);
    try {
      await serviceTestingService.deleteTesting(selectedTesting.id);
      showSuccess('Testing deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedTesting(null);
      loadTestings();
    } catch (error) {
      showError('Failed to delete testing');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTestingService = () => {
    if (newTestingService.trim()) {
      setFormData((prev) => ({
        ...prev,
        testingServices: [...prev.testingServices, newTestingService.trim()],
      }));
      setNewTestingService('');
    }
  };

  const handleRemoveTestingService = (index) => {
    setFormData((prev) => ({
      ...prev,
      testingServices: prev.testingServices.filter((_, i) => i !== index),
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
    return <LoadingSpinner text="Loading testings..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Service Testings
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Testing
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Manage testing types displayed in the Services &gt; Testing section. Each testing can have its own details, images, and company highlights.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Subtitle</TableCell>
              <TableCell align="center">Published</TableCell>
              <TableCell align="center">Order</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {testings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No testings found. Click "Add Testing" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              testings.map((testing) => (
                <TableRow key={testing.id} hover>
                  <TableCell>
                    <Avatar
                      src={testing.thumbnailImageUrl ? `${getApiBaseUrl()}${testing.thumbnailImageUrl}` : undefined}
                      variant="rounded"
                      sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                    >
                      <ScienceIcon />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>{testing.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {testing.subtitle}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={testing.published ? 'Published' : 'Draft'}
                      color={testing.published ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{testing.displayOrder}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(testing)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedTesting(testing);
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
        <DialogTitle>{selectedTesting ? 'Edit Testing' : 'Add New Testing'}</DialogTitle>
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
                placeholder="e.g., GMO Testing Lab"
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
                placeholder="e.g., Your Partner for Quality Assurance"
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

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                What is this Testing?
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="What is [Testing]? Description"
                fullWidth
                multiline
                rows={3}
                value={formData.whatIs}
                onChange={(e) => setFormData({ ...formData, whatIs: e.target.value })}
                placeholder="Describe what this testing is..."
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Why Testing Matters
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Why Testing Matters Description"
                fullWidth
                multiline
                rows={4}
                value={formData.whyMatters}
                onChange={(e) => setFormData({ ...formData, whyMatters: e.target.value })}
                placeholder="Explain why this testing is important..."
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Certificate Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Certificate Details"
                fullWidth
                multiline
                rows={3}
                value={formData.certificate}
                onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                placeholder="Describe the certificate issued upon completion..."
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Our Testing Services
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                List of services offered (shown as bullet points)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {formData.testingServices.map((service, i) => (
                  <Chip key={i} label={service} onDelete={() => handleRemoveTestingService(i)} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add testing service"
                  value={newTestingService}
                  onChange={(e) => setNewTestingService(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTestingService())}
                  sx={{ flex: 1 }}
                />
                <Button variant="outlined" size="small" onClick={handleAddTestingService}>
                  Add
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Company Highlights
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add highlight cards with title and description (shown as feature cards)
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
                    placeholder="e.g., Advanced PCR Technology"
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
              {selectedTesting?.thumbnailImageUrl && !formData.thumbnailImage && (
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
              {selectedTesting?.heroImageUrl && !formData.heroImage && (
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
            {selectedTesting ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') setDeleteDialogOpen(false); }} disableEscapeKeyDown>
        <DialogTitle>Delete Testing?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedTesting?.title}"? This action cannot be undone.
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

export default ServiceTestingManager;
