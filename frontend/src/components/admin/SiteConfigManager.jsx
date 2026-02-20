import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import { Button, LoadingSpinner, EmptyState } from '../common';
import { configService } from '../../services';
import { useToast } from '../../store';

const CONFIG_TYPES = ['IMAGE', 'TEXT', 'URL', 'JSON'];
const CATEGORIES = ['LOGO', 'HERO', 'COURSE', 'SERVICE', 'ABOUT', 'BACKGROUND', 'CONTACT', 'SETTINGS', 'FOOTER', 'REVIEW', 'GENERAL'];

function SiteConfigManager() {
  const { showSuccess, showError } = useToast();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
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

  const handleOpenDialog = (config = null) => {
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
      if (editingConfig) {
        await configService.updateConfig(editingConfig.id, formData);
        showSuccess('Configuration updated');
      } else {
        await configService.createConfig(formData);
        showSuccess('Configuration created');
      }
      handleCloseDialog();
      loadConfigs();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save configuration');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) return;

    try {
      await configService.deleteConfig(id);
      showSuccess('Configuration deleted');
      loadConfigs();
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
                        src={config.value}
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig ? 'Edit Configuration' : 'Add Configuration'}
        </DialogTitle>
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
            <TextField
              name="value"
              label="Value"
              value={formData.value}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              required
              helperText={formData.type === 'IMAGE' ? 'Enter image URL' : 'Enter value'}
            />
            {formData.type === 'IMAGE' && formData.value && (
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Preview
                </Typography>
                <img
                  src={formData.value}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </Box>
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingConfig ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SiteConfigManager;
