import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Tooltip,
  Card,
  CardMedia,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ClearIcon from '@mui/icons-material/Clear';
import { LoadingSpinner } from '../common';
import { useToast } from '../../store';
import certificateTemplateService, { CERTIFICATE_TYPES } from '../../services/certificateTemplateService';
import { courseService } from '../../services';
import { getApiBaseUrl } from '../../services/api';

function CertificateTemplateManager() {
  const { showSuccess, showError } = useToast();
  const [templates, setTemplates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: CERTIFICATE_TYPES.COMPLETION,
    courseId: '',
    headerText: '',
    bodyTemplate: '',
    isDefault: false,
    active: true,
    backgroundImage: null,
    templateFile: null,
    removeBackgroundImage: false,
    removeTemplateFile: false,
  });

  // Preview state
  const [backgroundPreview, setBackgroundPreview] = useState(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await certificateTemplateService.getAllTemplates();
      setTemplates(data);
    } catch (error) {
      showError('Failed to load certificate templates');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const loadCourses = useCallback(async () => {
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses', error);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
    loadCourses();
  }, [loadTemplates, loadCourses]);

  const resetForm = () => {
    setFormData({
      name: '',
      type: CERTIFICATE_TYPES.COMPLETION,
      courseId: '',
      headerText: '',
      bodyTemplate: '',
      isDefault: false,
      active: true,
      backgroundImage: null,
      templateFile: null,
      removeBackgroundImage: false,
      removeTemplateFile: false,
    });
    setBackgroundPreview(null);
    setSelectedTemplate(null);
  };

  const handleOpenDialog = (template = null) => {
    if (template) {
      setSelectedTemplate(template);
      setFormData({
        name: template.name || '',
        type: template.type || CERTIFICATE_TYPES.COMPLETION,
        courseId: template.courseId || '',
        headerText: template.headerText || '',
        bodyTemplate: template.bodyTemplate || '',
        isDefault: template.isDefault || false,
        active: template.active !== false,
        backgroundImage: null,
        templateFile: null,
        removeBackgroundImage: false,
        removeTemplateFile: false,
      });
      // Set preview if template has background image
      if (template.hasBackgroundImage) {
        setBackgroundPreview(`${getApiBaseUrl()}${template.backgroundImageUrl}`);
      } else {
        setBackgroundPreview(null);
      }
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
        [field === 'backgroundImage' ? 'removeBackgroundImage' : 'removeTemplateFile']: false,
      }));

      // Create preview for background image
      if (field === 'backgroundImage') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBackgroundPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveFile = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: null,
      [field === 'backgroundImage' ? 'removeBackgroundImage' : 'removeTemplateFile']: true,
    }));
    if (field === 'backgroundImage') {
      setBackgroundPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      showError('Name and type are required');
      return;
    }

    setSaving(true);
    try {
      const submitData = certificateTemplateService.createTemplateFormData(formData);

      if (selectedTemplate) {
        await certificateTemplateService.updateTemplate(selectedTemplate.id, submitData);
        showSuccess('Template updated successfully');
      } else {
        await certificateTemplateService.createTemplate(submitData);
        showSuccess('Template created successfully');
      }

      handleCloseDialog();
      loadTemplates();
    } catch (error) {
      showError(error.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;

    setSaving(true);
    try {
      await certificateTemplateService.deleteTemplate(selectedTemplate.id);
      showSuccess('Template deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (error) {
      showError(error.message || 'Failed to delete template');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (template) => {
    try {
      await certificateTemplateService.setAsDefault(template.id);
      showSuccess('Template set as default');
      loadTemplates();
    } catch (error) {
      showError(error.message || 'Failed to set default template');
    }
  };

  const openDeleteDialog = (template) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return <LoadingSpinner text="Loading templates..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Certificate Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Template
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Certificate templates allow you to customize the appearance of certificates.
        You can create course-specific templates or global default templates.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Default</TableCell>
              <TableCell>Assets</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No certificate templates found. Create one to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id} hover>
                  <TableCell>
                    <Typography fontWeight={500}>{template.name}</Typography>
                    {template.headerText && (
                      <Typography variant="caption" color="text.secondary">
                        {template.headerText}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={template.type}
                      size="small"
                      color={template.type === 'COMPLETION' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    {template.courseName || (
                      <Chip label="Global" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={template.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={template.active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {template.isDefault ? (
                      <Tooltip title="Default template for this type">
                        <StarIcon color="warning" />
                      </Tooltip>
                    ) : (
                      <Tooltip title="Set as default">
                        <IconButton
                          size="small"
                          onClick={() => handleSetDefault(template)}
                        >
                          <StarBorderIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {template.hasBackgroundImage && (
                        <Tooltip title="Has background image">
                          <ImageIcon fontSize="small" color="action" />
                        </Tooltip>
                      )}
                      {template.hasTemplateFile && (
                        <Tooltip title="Has template file">
                          <DescriptionIcon fontSize="small" color="action" />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(template)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteDialog(template)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTemplate ? 'Edit Certificate Template' : 'Create Certificate Template'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Template Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                margin="normal"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Certificate Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Certificate Type"
                >
                  <MenuItem value={CERTIFICATE_TYPES.COMPLETION}>Completion</MenuItem>
                  <MenuItem value={CERTIFICATE_TYPES.PARTICIPATION}>Participation</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Course (Optional)</InputLabel>
                <Select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  label="Course (Optional)"
                >
                  <MenuItem value="">
                    <em>Global Template</em>
                  </MenuItem>
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={course.id}>
                      {course.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Header Text"
                name="headerText"
                value={formData.headerText}
                onChange={handleInputChange}
                margin="normal"
                placeholder="e.g., Certificate of Excellence"
                helperText="Custom title for the certificate"
              />

              <TextField
                fullWidth
                label="Body Template"
                name="bodyTemplate"
                value={formData.bodyTemplate}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={3}
                placeholder="Use placeholders: {{name}}, {{course}}, {{date}}"
                helperText="Template text with placeholders"
              />

              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                    />
                  }
                  label="Active"
                />
                <FormControlLabel
                  control={
                    <Switch
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                    />
                  }
                  label="Set as Default"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Background Image Upload */}
              <Typography variant="subtitle2" gutterBottom>
                Background Image
              </Typography>
              <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
                {backgroundPreview ? (
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={backgroundPreview}
                      alt="Background preview"
                      sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                      onClick={() => handleRemoveFile('backgroundImage')}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No background image
                    </Typography>
                  </Box>
                )}
                <Button
                  fullWidth
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 2 }}
                >
                  Upload Background
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'backgroundImage')}
                  />
                </Button>
              </Card>

              {/* Template File Upload */}
              <Typography variant="subtitle2" gutterBottom>
                Template PDF (Optional)
              </Typography>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                  }}
                >
                  <DescriptionIcon color="action" />
                  <Box sx={{ flexGrow: 1 }}>
                    {formData.templateFile ? (
                      <Typography variant="body2">{formData.templateFile.name}</Typography>
                    ) : selectedTemplate?.hasTemplateFile && !formData.removeTemplateFile ? (
                      <Typography variant="body2">Template file uploaded</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No template file
                      </Typography>
                    )}
                  </Box>
                  {(formData.templateFile || (selectedTemplate?.hasTemplateFile && !formData.removeTemplateFile)) && (
                    <IconButton size="small" onClick={() => handleRemoveFile('templateFile')}>
                      <ClearIcon />
                    </IconButton>
                  )}
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 2 }}
                >
                  Upload Template PDF
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'templateFile')}
                  />
                </Button>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : selectedTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{selectedTemplate?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={saving}
          >
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CertificateTemplateManager;
