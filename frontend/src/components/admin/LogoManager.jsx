import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, LinearProgress, Chip, Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import { Button } from '../common';
import { configService } from '../../services';
import { useToast, useConfig } from '../../store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function resolveImageSrc(value) {
  if (!value) return '';
  if (value.startsWith('/api/')) return `${API_BASE}${value}`;
  return value;
}

const LOGO_ITEMS = [
  {
    key: 'LOGO_MAIN',
    label: 'Main Logo',
    description: 'Used on login, register, and other pages',
    hint: 'PNG with transparent background · min 200×80 px recommended',
  },
  {
    key: 'LOGO_SMALL',
    label: 'Navbar Logo',
    description: 'Displayed in the top navigation bar',
    hint: 'PNG with transparent background · min 120×40 px recommended',
  },
  {
    key: 'FAVICON',
    label: 'Favicon',
    description: 'Shown in the browser tab',
    hint: '.ico or PNG · 32×32 px recommended',
  },
];

function LogoManager() {
  const { showSuccess, showError } = useToast();
  const { refreshImages } = useConfig();

  const [configs, setConfigs] = useState({});           // key → config object
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);   // one of LOGO_ITEMS
  const [uploadMode, setUploadMode] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { loadConfigs(); }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const all = await configService.getAllConfigs();
      const map = {};
      all.forEach((c) => { map[c.key] = c; });
      setConfigs(map);
    } catch {
      showError('Failed to load logo configurations');
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (item) => {
    setActiveItem(item);
    const cfg = configs[item.key];
    setUrlValue(cfg?.value || '');
    setUploadMode(false);
    setUploadFile(null);
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadPreview(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setActiveItem(null);
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadPreview(null);
    setUploadFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!activeItem) return;
    setSaving(true);
    try {
      const existing = configs[activeItem.key];
      if (existing) {
        // Update existing config
        if (!uploadMode) {
          await configService.updateConfig(existing.id, { ...existing, value: urlValue });
        } else if (uploadFile) {
          await configService.uploadConfigImage(existing.id, uploadFile);
        }
        showSuccess(`${activeItem.label} updated`);
      } else {
        // Create new config entry
        const created = await configService.createConfig({
          key: activeItem.key,
          value: uploadMode ? '' : urlValue,
          type: 'IMAGE',
          category: 'LOGO',
          description: activeItem.description,
          active: true,
        });
        if (uploadMode && uploadFile) {
          await configService.uploadConfigImage(created.id, uploadFile);
        }
        showSuccess(`${activeItem.label} saved`);
      }
      await loadConfigs();
      refreshImages();
      closeDialog();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save logo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Logo & Favicon
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage logos shown across the website and the browser tab favicon. You can paste an image URL or upload a file.
      </Typography>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {LOGO_ITEMS.map((item) => {
            const cfg = configs[item.key];
            const src = cfg ? resolveImageSrc(cfg.value) : '';
            return (
              <Grid item xs={12} sm={6} md={4} key={item.key}>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{item.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                      </Box>
                      {cfg && <Chip label="Set" size="small" color="success" />}
                    </Box>

                    <Divider sx={{ mb: 1.5 }} />

                    {/* Preview */}
                    <Box
                      sx={{
                        height: 90,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                        overflow: 'hidden',
                        mb: 1.5,
                      }}
                    >
                      {src ? (
                        <Box
                          component="img"
                          src={src}
                          alt={item.label}
                          sx={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
                          <ImageIcon sx={{ fontSize: 32, mb: 0.5 }} />
                          <Typography variant="caption" display="block">Not set</Typography>
                        </Box>
                      )}
                    </Box>

                    <Typography variant="caption" color="text.disabled">{item.hint}</Typography>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => openDialog(item)}
                    >
                      {cfg ? 'Change' : 'Set Logo'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{activeItem ? `Edit ${activeItem.label}` : 'Edit Logo'}</DialogTitle>
        {saving && <LinearProgress />}
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {activeItem && (
              <Alert severity="info" sx={{ py: 0.5 }}>
                {activeItem.hint}
              </Alert>
            )}

            {/* URL / Upload toggle */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant={!uploadMode ? 'contained' : 'outlined'}
                startIcon={<LinkIcon />}
                onClick={() => { setUploadMode(false); setUploadFile(null); if (uploadPreview) { URL.revokeObjectURL(uploadPreview); setUploadPreview(null); } }}
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
                    accept="image/jpeg,image/png,image/webp,image/x-icon"
                    onChange={handleFileChange}
                  />
                </Button>
                {uploadPreview && (
                  <Box sx={{ textAlign: 'center', mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Preview</Typography>
                    <img src={uploadPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain' }} />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {uploadFile && `${(uploadFile.size / 1024).toFixed(0)} KB`}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <>
                <TextField
                  label="Image URL"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  fullWidth
                  placeholder="https://..."
                  helperText="Paste a direct link to the image"
                />
                {urlValue && (
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Preview</Typography>
                    <img
                      src={resolveImageSrc(urlValue)}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || (uploadMode ? !uploadFile : !urlValue.trim())}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LogoManager;
