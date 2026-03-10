import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Avatar,
  Alert,
  LinearProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import { Button, LoadingSpinner, EmptyState } from '../common';
import { configService } from '../../services';
import { useToast, useConfig } from '../../store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Resolve config image values: relative API paths get prefixed with the API base URL
function resolveImageSrc(value) {
  if (!value) return '';
  if (value.startsWith('/api/')) return `${API_BASE}${value}`;
  return value;
}

function getImageRecommendation(category) {
  switch (category) {
    case 'LOGO':       return '400×200 px · PNG with transparent background recommended';
    case 'HERO':
    case 'BACKGROUND': return '1920×1080 px or larger for best quality';
    case 'COURSE':
    case 'SERVICE':
    case 'ABOUT':      return '800×600 px or larger';
    default:           return '1280×720 px or larger';
  }
}

const CONFIG_TYPES = ['IMAGE', 'TEXT', 'URL', 'JSON'];
const CATEGORIES = ['LOGO', 'HERO', 'COURSE', 'SERVICE', 'ABOUT', 'BACKGROUND', 'CONTACT', 'SETTINGS', 'FOOTER', 'REVIEW', 'GENERAL'];

function SiteConfigManager() {
  const { showSuccess, showError } = useToast();
  const { refreshImages } = useConfig();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    type: 'IMAGE',
    category: 'GENERAL',
    description: '',
    active: true,
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await configService.getAllConfigs();
      setConfigs(data);
    } catch (error) {
      showError('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const resetUploadState = () => {
    setUploadMode(false);
    setUploadFile(null);
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadPreview(null);
  };

  const handleOpenDialog = (config = null) => {
    resetUploadState();
    if (config) {
      setEditingConfig(config);
      setFormData({
        key: config.key,
        value: config.value || '',
        type: config.type || 'IMAGE',
        category: config.category || 'GENERAL',
        description: config.description || '',
        active: config.active !== false,
      });
    } else {
      setEditingConfig(null);
      setFormData({
        key: '',
        value: '',
        type: 'IMAGE',
        category: 'GENERAL',
        description: '',
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConfig(null);
    resetUploadState();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setUploading(true);
      let saved;
      if (editingConfig) {
        saved = await configService.updateConfig(editingConfig.id, formData);
        if (formData.type === 'IMAGE' && uploadMode && uploadFile) {
          await configService.uploadConfigImage(editingConfig.id, uploadFile);
        }
        showSuccess('Configuration updated');
      } else {
        saved = await configService.createConfig(formData);
        if (formData.type === 'IMAGE' && uploadMode && uploadFile) {
          await configService.uploadConfigImage(saved.id, uploadFile);
        }
        showSuccess('Configuration created');
      }
      handleCloseDialog();
      loadConfigs();
      refreshImages();
    } catch (error) {
      showError(error.response?.data?.message || error.response?.data?.error || 'Failed to save configuration');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) return;

    try {
      await configService.deleteConfig(id);
      showSuccess('Configuration deleted');
      loadConfigs();
      refreshImages();
    } catch (error) {
      showError('Failed to delete configuration');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading configurations..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Site Configuration
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Configuration
        </Button>
      </Box>

      {configs.length === 0 ? (
        <EmptyState
          title="No configurations yet"
          description="Add site configurations like images, URLs, and settings"
          actionLabel="Add Configuration"
          onAction={() => handleOpenDialog()}
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Preview</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id} hover>
                  <TableCell>
                    {config.type === 'IMAGE' && config.value ? (
                      <Avatar
                        variant="rounded"
                        src={resolveImageSrc(config.value)}
                        sx={{ width: 60, height: 40 }}
                      >
                        <ImageIcon />
                      </Avatar>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {config.value?.substring(0, 30)}...
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {config.key}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={config.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={config.type}
                      size="small"
                      color={config.type === 'IMAGE' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {config.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={config.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={config.active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenDialog(config)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(config.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') handleCloseDialog(); }} disableEscapeKeyDown maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig ? 'Edit Configuration' : 'Add Configuration'}
        </DialogTitle>
        {uploading && <LinearProgress />}
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="key"
              label="Key"
              value={formData.key}
              onChange={handleChange}
              fullWidth
              required
              disabled={!!editingConfig}
              helperText="Unique identifier (e.g., LOGO_MAIN, HERO_IMAGE)"
            />

            {/* IMAGE type: show URL / Upload toggle */}
            {formData.type === 'IMAGE' ? (
              <>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={!uploadMode ? 'contained' : 'outlined'}
                    startIcon={<LinkIcon />}
                    onClick={() => { setUploadMode(false); setUploadFile(null); if (uploadPreview) URL.revokeObjectURL(uploadPreview); setUploadPreview(null); }}
                  >
                    Image URL
                  </Button>
                  <Button
                    size="small"
                    variant={uploadMode ? 'contained' : 'outlined'}
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setUploadMode(true)}
                  >
                    Upload File
                  </Button>
                </Box>

                {uploadMode ? (
                  <Box>
                    <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }}>
                      Accepted formats: <strong>JPG, PNG, WebP</strong> &nbsp;·&nbsp; Max size: <strong>5 MB</strong> &nbsp;·&nbsp; Recommended: <strong>{getImageRecommendation(formData.category)}</strong>
                    </Alert>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      {uploadFile ? uploadFile.name : 'Choose Image File'}
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {uploadPreview && (
                      <Box sx={{ textAlign: 'center', mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          Preview
                        </Typography>
                        <img
                          src={uploadPreview}
                          alt="Upload preview"
                          style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                        />
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {uploadFile && `${(uploadFile.size / 1024).toFixed(0)} KB`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <>
                    <TextField
                      name="value"
                      label="Image URL"
                      value={formData.value}
                      onChange={handleChange}
                      fullWidth
                      helperText="Enter a direct image URL (https://...)"
                    />
                    {formData.value && (
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          Preview
                        </Typography>
                        <img
                          src={resolveImageSrc(formData.value)}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </Box>
                    )}
                  </>
                )}
              </>
            ) : (
              <TextField
                name="value"
                label="Value"
                value={formData.value}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                required
                helperText="Enter value"
              />
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="type"
                label="Type"
                value={formData.type}
                onChange={handleChange}
                select
                fullWidth
              >
                {CONFIG_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name="category"
                label="Category"
                value={formData.category}
                onChange={handleChange}
                select
                fullWidth
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={uploading}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={uploading}>
            {uploading ? 'Saving...' : editingConfig ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SiteConfigManager;
