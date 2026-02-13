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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Button, LoadingSpinner } from '../common';
import { careerService } from '../../services';
import { useToast } from '../../store';

const emptyFormData = {
  title: '',
  subtitle: '',
  whyJoinTitle: '',
  whyJoinDescription: '',
  benefits: [],
  positions: [],
  published: false,
  displayOrder: 0,
};

function CareerManager() {
  const { showSuccess, showError } = useToast();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [saving, setSaving] = useState(false);

  // Temporary input states
  const [newBenefit, setNewBenefit] = useState('');
  const [newPosTitle, setNewPosTitle] = useState('');
  const [newPosDepartment, setNewPosDepartment] = useState('');
  const [newPosLocation, setNewPosLocation] = useState('');
  const [newPosType, setNewPosType] = useState('');
  const [newPosDescription, setNewPosDescription] = useState('');

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    setLoading(true);
    try {
      const data = await careerService.getAllCareers();
      setCareers(data);
    } catch (error) {
      showError('Failed to load careers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (career = null) => {
    if (career) {
      setSelectedCareer(career);
      setFormData({
        title: career.title || '',
        subtitle: career.subtitle || '',
        whyJoinTitle: career.whyJoinTitle || '',
        whyJoinDescription: career.whyJoinDescription || '',
        benefits: career.benefits || [],
        positions: career.positions || [],
        published: career.published || false,
        displayOrder: career.displayOrder || 0,
      });
    } else {
      setSelectedCareer(null);
      setFormData(emptyFormData);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCareer(null);
    setFormData(emptyFormData);
    setNewBenefit('');
    setNewPosTitle('');
    setNewPosDepartment('');
    setNewPosLocation('');
    setNewPosType('');
    setNewPosDescription('');
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showError('Title is required');
      return;
    }

    setSaving(true);
    try {
      if (selectedCareer) {
        await careerService.updateCareer(selectedCareer.id, formData);
        showSuccess('Career entry updated successfully');
      } else {
        await careerService.createCareer(formData);
        showSuccess('Career entry created successfully');
      }
      handleCloseDialog();
      loadCareers();
    } catch (error) {
      showError(error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCareer) return;
    setSaving(true);
    try {
      await careerService.deleteCareer(selectedCareer.id);
      showSuccess('Career entry deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedCareer(null);
      loadCareers();
    } catch (error) {
      showError('Failed to delete');
    } finally {
      setSaving(false);
    }
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

  const handleAddPosition = () => {
    if (newPosTitle.trim() && newPosDescription.trim()) {
      setFormData((prev) => ({
        ...prev,
        positions: [
          ...prev.positions,
          {
            title: newPosTitle.trim(),
            department: newPosDepartment.trim() || '',
            location: newPosLocation.trim() || '',
            type: newPosType.trim() || '',
            description: newPosDescription.trim(),
          },
        ],
      }));
      setNewPosTitle('');
      setNewPosDepartment('');
      setNewPosLocation('');
      setNewPosType('');
      setNewPosDescription('');
    }
  };

  const handleRemovePosition = (index) => {
    setFormData((prev) => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <LoadingSpinner text="Loading careers..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Careers
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Career Entry
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Manage careers page content including job positions and benefits. Each entry represents a careers page configuration with its own set of positions and benefits.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Subtitle</TableCell>
              <TableCell align="center">Positions</TableCell>
              <TableCell align="center">Benefits</TableCell>
              <TableCell align="center">Published</TableCell>
              <TableCell align="center">Order</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {careers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No career entries found. Click "Add Career Entry" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              careers.map((career) => (
                <TableRow key={career.id} hover>
                  <TableCell>
                    <Typography fontWeight={500}>{career.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {career.subtitle}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{career.positions?.length || 0}</TableCell>
                  <TableCell align="center">{career.benefits?.length || 0}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={career.published ? 'Published' : 'Draft'}
                      color={career.published ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{career.displayOrder}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(career)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedCareer(career);
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
        <DialogTitle>{selectedCareer ? 'Edit Career Entry' : 'Add New Career Entry'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Page Content
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                label="Page Title"
                fullWidth
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Join Our Team"
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
                label="Page Subtitle"
                fullWidth
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., Help us transform education and empower learners around the world."
              />
            </Grid>

            {/* Why Join Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Why Join Us Section
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Why Join Title"
                fullWidth
                value={formData.whyJoinTitle}
                onChange={(e) => setFormData({ ...formData, whyJoinTitle: e.target.value })}
                placeholder="e.g., Why Join Uyirgene?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Why Join Description"
                fullWidth
                multiline
                rows={3}
                value={formData.whyJoinDescription}
                onChange={(e) => setFormData({ ...formData, whyJoinDescription: e.target.value })}
                placeholder="Describe why someone should join your team..."
              />
            </Grid>

            {/* Benefits */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Benefits
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                List of benefits offered to employees
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                {formData.benefits.map((benefit, i) => (
                  <Chip key={i} label={benefit} onDelete={() => handleRemoveBenefit(i)} />
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

            {/* Positions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
                Open Positions
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add job positions with title, department, location, type, and description
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {formData.positions.map((pos, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Typography fontWeight={500}>{pos.title}</Typography>
                      {pos.department && <Chip label={pos.department} size="small" variant="outlined" />}
                      {pos.type && <Chip label={pos.type} size="small" color="primary" />}
                    </Box>
                    {pos.location && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {pos.location}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{pos.description}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleRemovePosition(i)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={12} md={3}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Job Title"
                    value={newPosTitle}
                    onChange={(e) => setNewPosTitle(e.target.value)}
                    placeholder="e.g., Frontend Developer"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Department"
                    value={newPosDepartment}
                    onChange={(e) => setNewPosDepartment(e.target.value)}
                    placeholder="e.g., Engineering"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Location"
                    value={newPosLocation}
                    onChange={(e) => setNewPosLocation(e.target.value)}
                    placeholder="e.g., Chennai"
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Type"
                    value={newPosType}
                    onChange={(e) => setNewPosType(e.target.value)}
                    placeholder="e.g., Full-time"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Description"
                    value={newPosDescription}
                    onChange={(e) => setNewPosDescription(e.target.value)}
                    placeholder="Brief job description"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" onClick={handleAddPosition}>
                    Add Position
                  </Button>
                </Grid>
              </Grid>
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
            {selectedCareer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Career Entry?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedCareer?.title}"? This action cannot be undone.
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

export default CareerManager;
