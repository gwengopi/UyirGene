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
import VerifiedIcon from '@mui/icons-material/Verified';
import { Button, LoadingSpinner } from '../common';
import { serviceCertificationService } from '../../services';
import { useToast } from '../../store';
import { getApiBaseUrl } from '../../services/api';

const emptyFormData = {
  title: '',
  subtitle: '',
  description: '',
  whatIs: '',
  keyElements: [],
  whoNeeds: [],
  certificationRoute: [],
  benefits: [],
  published: false,
  displayOrder: 0,
  thumbnailImage: null,
  heroImage: null,
};

function ServiceCertificationManager() {
  const { showSuccess, showError } = useToast();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [saving, setSaving] = useState(false);

  // Temporary input states for array fields
  const [newKeyElement, setNewKeyElement] = useState('');
  const [newWhoNeed, setNewWhoNeed] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newStepLabel, setNewStepLabel] = useState('');
  const [newStepDescription, setNewStepDescription] = useState('');

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    setLoading(true);
    try {
      const data = await serviceCertificationService.getAllCertifications();
      setCertifications(data);
    } catch (error) {
      showError('Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cert = null) => {
    if (cert) {
      setSelectedCert(cert);
      setFormData({
        title: cert.title || '',
        subtitle: cert.subtitle || '',
        description: cert.description || '',
        whatIs: cert.whatIs || '',
        keyElements: cert.keyElements || [],
        whoNeeds: cert.whoNeeds || [],
        certificationRoute: cert.certificationRoute || [],
        benefits: cert.benefits || [],
        published: cert.published || false,
        displayOrder: cert.displayOrder || 0,
        thumbnailImage: null,
        heroImage: null,
      });
    } else {
      setSelectedCert(null);
      setFormData(emptyFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCert(null);
    setFormData(emptyFormData);
    setNewKeyElement('');
    setNewWhoNeed('');
    setNewBenefit('');
    setNewStepLabel('');
    setNewStepDescription('');
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showError('Title is required');
      return;
    }

    setSaving(true);
    try {
      if (selectedCert) {
        await serviceCertificationService.updateCertification(selectedCert.id, formData);
        showSuccess('Certification updated successfully');
      } else {
        await serviceCertificationService.createCertification(formData);
        showSuccess('Certification created successfully');
      }
      handleCloseDialog();
      loadCertifications();
    } catch (error) {
      showError(error.message || 'Failed to save certification');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCert) return;
    setSaving(true);
    try {
      await serviceCertificationService.deleteCertification(selectedCert.id);
      showSuccess('Certification deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedCert(null);
      loadCertifications();
    } catch (error) {
      showError('Failed to delete certification');
    } finally {
      setSaving(false);
    }
  };

  const handleAddKeyElement = () => {
    if (newKeyElement.trim()) {
      setFormData((prev) => ({
        ...prev,
        keyElements: [...prev.keyElements, newKeyElement.trim()],
      }));
      setNewKeyElement('');
    }
  };

  const handleRemoveKeyElement = (index) => {
    setFormData((prev) => ({
      ...prev,
      keyElements: prev.keyElements.filter((_, i) => i !== index),
    }));
  };

  const handleAddWhoNeed = () => {
    if (newWhoNeed.trim()) {
      setFormData((prev) => ({
        ...prev,
        whoNeeds: [...prev.whoNeeds, newWhoNeed.trim()],
      }));
      setNewWhoNeed('');
    }
  };

  const handleRemoveWhoNeed = (index) => {
    setFormData((prev) => ({
      ...prev,
      whoNeeds: prev.whoNeeds.filter((_, i) => i !== index),
    }));
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }));
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const handleAddStep = () => {
    if (newStepLabel.trim() && newStepDescription.trim()) {
      setFormData((prev) => ({
        ...prev,
        certificationRoute: [
          ...prev.certificationRoute,
          { label: newStepLabel.trim(), description: newStepDescription.trim() },
        ],
      }));
      setNewStepLabel('');
      setNewStepDescription('');
    }
  };

  const handleRemoveStep = (index) => {
    setFormData((prev) => ({
      ...prev,
      certificationRoute: prev.certificationRoute.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <LoadingSpinner text="Loading certifications..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Service Certifications
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Certification
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Manage certification types displayed in the Services &gt; Certification section. Each certification can have its own details, images, and steps.
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
            {certifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No certifications found. Click "Add Certification" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              certifications.map((cert) => (
                <TableRow key={cert.id} hover>
                  <TableCell>
                    <Avatar
                      src={cert.thumbnailImageUrl ? `${getApiBaseUrl()}${cert.thumbnailImageUrl}` : undefined}
                      variant="rounded"
                      sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                    >
                      <VerifiedIcon />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>{cert.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {cert.subtitle}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={cert.published ? 'Published' : 'Draft'}
                      color={cert.published ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{cert.displayOrder}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(cert)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedCert(cert);
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedCert ? 'Edit Certification' : 'Add New Certification'}</DialogTitle>
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
                placeholder="e.g., ISO 22000 - Food Safety Certifications"
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
                placeholder="e.g., Global Training & Certification Services"
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
                What is this Certification?
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="What is [Certification]? Description"
                fullWidth
                multiline
                rows={3}
                value={formData.whatIs}
                onChange={(e) => setFormData({ ...formData, whatIs: e.target.value })}
                placeholder="Describe what this certification is..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Key Elements (shown as chips)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {formData.keyElements.map((elem, i) => (
                  <Chip key={i} label={elem} onDelete={() => handleRemoveKeyElement(i)} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add key element"
                  value={newKeyElement}
                  onChange={(e) => setNewKeyElement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyElement())}
                />
                <Button variant="outlined" size="small" onClick={handleAddKeyElement}>
                  Add
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Who Needs This Certification?
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Applicable industries/organizations
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {formData.whoNeeds.map((item, i) => (
                  <Chip key={i} label={item} onDelete={() => handleRemoveWhoNeed(i)} variant="outlined" />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add industry/organization"
                  value={newWhoNeed}
                  onChange={(e) => setNewWhoNeed(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddWhoNeed())}
                  sx={{ flex: 1 }}
                />
                <Button variant="outlined" size="small" onClick={handleAddWhoNeed}>
                  Add
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Certification Route (Steps)
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {formData.certificationRoute.map((step, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography fontWeight={500}>Step {i + 1}: {step.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{step.description}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleRemoveStep(i)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Step Label"
                    value={newStepLabel}
                    onChange={(e) => setNewStepLabel(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Step Description"
                    value={newStepDescription}
                    onChange={(e) => setNewStepDescription(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button variant="outlined" fullWidth onClick={handleAddStep}>
                    Add Step
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Benefits of Certification
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 1 }}>
                {formData.benefits.map((benefit, i) => (
                  <Chip key={i} label={benefit} onDelete={() => handleRemoveBenefit(i)} sx={{ mr: 0.5, mb: 0.5 }} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Add benefit"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                  sx={{ flex: 1 }}
                />
                <Button variant="outlined" size="small" onClick={handleAddBenefit}>
                  Add
                </Button>
              </Box>
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
              {selectedCert?.thumbnailImageUrl && !formData.thumbnailImage && (
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
              {selectedCert?.heroImageUrl && !formData.heroImage && (
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
            {selectedCert ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Certification?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedCert?.title}"? This action cannot be undone.
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

export default ServiceCertificationManager;
