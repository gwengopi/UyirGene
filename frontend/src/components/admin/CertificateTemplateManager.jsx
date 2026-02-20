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
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { LoadingSpinner } from '../common';
import { useToast } from '../../store';
import certificateTemplateService, { CERTIFICATE_TYPES, DEFAULT_TEMPLATE_CONFIG } from '../../services/certificateTemplateService';
import { courseService } from '../../services';
import { getApiBaseUrl } from '../../services/api';
import CertificatePreview from './CertificatePreview';

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
    templateConfig: null,
    isDefault: false,
    active: true,
    backgroundImage: null,
    templateFile: null,
    removeBackgroundImage: false,
    removeTemplateFile: false,
  });

  // Template config state (parsed from JSON)
  const [templateConfig, setTemplateConfig] = useState(DEFAULT_TEMPLATE_CONFIG);

  // Preview state
  const [backgroundPreview, setBackgroundPreview] = useState(null);
  const [templatePdfData, setTemplatePdfData] = useState(null); // ArrayBuffer for PDF preview

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
      templateConfig: null,
      isDefault: false,
      active: true,
      backgroundImage: null,
      templateFile: null,
      removeBackgroundImage: false,
      removeTemplateFile: false,
    });
    setTemplateConfig(DEFAULT_TEMPLATE_CONFIG);
    setBackgroundPreview(null);
    setTemplatePdfData(null);
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
        templateConfig: template.templateConfig || null,
        isDefault: template.isDefault || false,
        active: template.active !== false,
        backgroundImage: null,
        templateFile: null,
        removeBackgroundImage: false,
        removeTemplateFile: false,
      });
      // Parse template config if available, merge with defaults for any missing fields
      if (template.templateConfig) {
        try {
          const parsed = JSON.parse(template.templateConfig);
          // Merge each element with its default so new fields get default values
          const merged = { ...DEFAULT_TEMPLATE_CONFIG };
          Object.keys(parsed).forEach((key) => {
            if (DEFAULT_TEMPLATE_CONFIG[key] && typeof parsed[key] === 'object' && parsed[key] !== null) {
              merged[key] = { ...DEFAULT_TEMPLATE_CONFIG[key], ...parsed[key] };
            } else {
              merged[key] = parsed[key];
            }
          });
          setTemplateConfig(merged);
        } catch {
          setTemplateConfig(DEFAULT_TEMPLATE_CONFIG);
        }
      } else {
        setTemplateConfig(DEFAULT_TEMPLATE_CONFIG);
      }
      // Set preview if template has background image
      if (template.hasBackgroundImage) {
        setBackgroundPreview(`${getApiBaseUrl()}${template.backgroundImageUrl}`);
      } else {
        setBackgroundPreview(null);
      }
      // Fetch template PDF for preview if available
      if (template.hasTemplateFile) {
        certificateTemplateService.downloadTemplateFile(template.id)
          .then((blob) => blob.arrayBuffer())
          .then((buffer) => setTemplatePdfData(buffer))
          .catch(() => setTemplatePdfData(null));
      } else {
        setTemplatePdfData(null);
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

      // Read template PDF for preview
      if (field === 'templateFile') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setTemplatePdfData(reader.result);
        };
        reader.readAsArrayBuffer(file);
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
    if (field === 'templateFile') {
      setTemplatePdfData(null);
    }
  };

  // Update a specific field in template config
  const updateTemplateConfig = (elementKey, field, value) => {
    setTemplateConfig((prev) => ({
      ...prev,
      [elementKey]: {
        ...prev[elementKey],
        [field]: value,
      },
    }));
  };

  // Render a text element configuration section
  const renderTextElementConfig = (label, elementKey, config) => (
    <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2">{label}</Typography>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={config?.visible ?? true}
              onChange={(e) => updateTemplateConfig(elementKey, 'visible', e.target.checked)}
            />
          }
          label="Visible"
        />
      </Box>
      {config?.visible !== false && (
        <Grid container spacing={1} alignItems="flex-end">
          <Grid item xs={6} sm={2}>
            <TextField
              size="small"
              type="number"
              label="X Position"
              value={config?.x ?? 297.5}
              onChange={(e) => updateTemplateConfig(elementKey, 'x', parseFloat(e.target.value))}
              fullWidth
              helperText="From left"
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <TextField
              size="small"
              type="number"
              label="Y Position"
              value={config?.y ?? 0}
              onChange={(e) => updateTemplateConfig(elementKey, 'y', parseFloat(e.target.value))}
              fullWidth
              helperText="From bottom"
            />
          </Grid>
          <Grid item xs={4} sm={1}>
            <TextField
              size="small"
              type="number"
              label="Size"
              value={config?.fontSize ?? 12}
              onChange={(e) => updateTemplateConfig(elementKey, 'fontSize', parseInt(e.target.value, 10))}
              fullWidth
            />
          </Grid>
          <Grid item xs={4} sm={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Font</InputLabel>
              <Select
                value={config?.fontFamily ?? 'oswald'}
                onChange={(e) => updateTemplateConfig(elementKey, 'fontFamily', e.target.value)}
                label="Font"
              >
                <MenuItem disabled sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>— Modern Sans-Serif —</MenuItem>
                <MenuItem value="anton">Anton</MenuItem>
                <MenuItem value="oswald">Oswald</MenuItem>
                <MenuItem value="montserrat">Montserrat</MenuItem>
                <MenuItem value="raleway">Raleway</MenuItem>
                <MenuItem value="lato">Lato</MenuItem>
                <MenuItem value="roboto">Roboto</MenuItem>
                <MenuItem disabled sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>— Elegant / Formal —</MenuItem>
                <MenuItem value="playfair">Playfair Display</MenuItem>
                <MenuItem value="cinzel">Cinzel</MenuItem>
                <MenuItem value="garamond">EB Garamond</MenuItem>
                <MenuItem value="merriweather">Merriweather</MenuItem>
                <MenuItem disabled sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>— Classic (Built-in) —</MenuItem>
                <MenuItem value="helvetica">Helvetica</MenuItem>
                <MenuItem value="times">Times Roman</MenuItem>
                <MenuItem value="courier">Courier</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} sm={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Style</InputLabel>
              <Select
                value={config?.fontStyle ?? 'normal'}
                onChange={(e) => updateTemplateConfig(elementKey, 'fontStyle', e.target.value)}
                label="Style"
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="bold">Bold</MenuItem>
                <MenuItem value="italic">Italic</MenuItem>
                <MenuItem value="bold-italic">Bold Italic</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} sm={1}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Color
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 0.5,
                  height: 40,
                }}
              >
                <input
                  type="color"
                  value={config?.fontColor ?? '#000000'}
                  onChange={(e) => updateTemplateConfig(elementKey, 'fontColor', e.target.value)}
                  style={{ width: 28, height: 28, border: 'none', padding: 0, cursor: 'pointer', background: 'none' }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={4} sm={2}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={config?.centered ?? true}
                  onChange={(e) => updateTemplateConfig(elementKey, 'centered', e.target.checked)}
                />
              }
              label={<Typography variant="caption">Center</Typography>}
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );

  // Render QR code configuration
  const renderQRCodeConfig = (config) => (
    <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2">QR Code</Typography>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={config?.visible ?? true}
              onChange={(e) => updateTemplateConfig('qrCode', 'visible', e.target.checked)}
            />
          }
          label="Visible"
        />
      </Box>
      {config?.visible !== false && (
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <TextField
              size="small"
              type="number"
              label="X Position"
              value={config?.x ?? 262.5}
              onChange={(e) => updateTemplateConfig('qrCode', 'x', parseFloat(e.target.value))}
              fullWidth
              helperText="From left"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              size="small"
              type="number"
              label="Y Position"
              value={config?.y ?? 150}
              onChange={(e) => updateTemplateConfig('qrCode', 'y', parseFloat(e.target.value))}
              fullWidth
              helperText="From bottom"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              size="small"
              type="number"
              label="Size (px)"
              value={config?.size ?? 70}
              onChange={(e) => updateTemplateConfig('qrCode', 'size', parseInt(e.target.value, 10))}
              fullWidth
              helperText="Width & height"
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      showError('Name and type are required');
      return;
    }

    setSaving(true);
    try {
      // Include templateConfig as JSON string
      const dataToSubmit = {
        ...formData,
        templateConfig: JSON.stringify(templateConfig),
      };
      const submitData = certificateTemplateService.createTemplateFormData(dataToSubmit);

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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
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
                      sx={{ objectFit: 'contain', bgcolor: 'action.hover' }}
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
                      bgcolor: 'action.hover',
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
                    bgcolor: 'action.hover',
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

            {/* Template Configuration + Preview Section */}
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon color="primary" />
                    <Typography variant="subtitle1">Text Position Configuration & Preview</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {/* Left: Configuration controls */}
                    <Grid item xs={12} md={7}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Configure text position, size, and color on the certificate PDF.
                        Coordinates are in PDF points (A4: 595 x 842 points).
                        X = distance from left edge, Y = distance from bottom edge.
                        Enable "Center" to horizontally center text (X is ignored when centered).
                      </Alert>

                      {renderTextElementConfig('Certificate Type ("Completion / Participation")', 'certificateType', templateConfig.certificateType)}
                      {renderTextElementConfig('Certify Text ("This is to certify that")', 'certifyText', templateConfig.certifyText)}
                      {renderTextElementConfig('Student Name', 'studentName', templateConfig.studentName)}
                      {renderTextElementConfig('Completed Text', 'completedText', templateConfig.completedText)}
                      {renderTextElementConfig('Course Title', 'courseTitle', templateConfig.courseTitle)}
                      {renderTextElementConfig('Course Code', 'courseCode', templateConfig.courseCode)}
                      {renderTextElementConfig('Trainer Name', 'trainerName', templateConfig.trainerName)}
                      {renderTextElementConfig('Short Description', 'shortDescription', templateConfig.shortDescription)}
                      {renderTextElementConfig('Score/Marks', 'marks', templateConfig.marks)}
                      {renderTextElementConfig('Issue Date', 'issueDate', templateConfig.issueDate)}
                      {renderTextElementConfig('Certificate ID', 'certificateId', templateConfig.certificateId)}
                      {renderQRCodeConfig(templateConfig.qrCode)}
                      {renderTextElementConfig('Scan to Verify Text', 'scanText', templateConfig.scanText)}

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setTemplateConfig(DEFAULT_TEMPLATE_CONFIG)}
                        sx={{ mt: 1 }}
                      >
                        Reset to Defaults
                      </Button>
                    </Grid>

                    {/* Right: Live preview */}
                    <Grid item xs={12} md={5}>
                      <Box sx={{ position: 'sticky', top: 0 }}>
                        <CertificatePreview
                          templateConfig={templateConfig}
                          backgroundPreview={backgroundPreview}
                          certificateType={formData.type}
                          templatePdfData={templatePdfData}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
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
