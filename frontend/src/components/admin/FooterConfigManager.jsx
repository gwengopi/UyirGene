import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkIcon from '@mui/icons-material/Link';
import { Button, LoadingSpinner } from '../common';
import { configService } from '../../services';
import { useToast } from '../../store';

// Icon options for social links
const ICON_OPTIONS = [
  { value: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
  { value: 'twitter', label: 'Twitter', icon: <TwitterIcon /> },
  { value: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon /> },
  { value: 'youtube', label: 'YouTube', icon: <YouTubeIcon /> },
  { value: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon /> },
  { value: 'instagram', label: 'Instagram', icon: <InstagramIcon /> },
];

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`footer-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Get icon by name
const getIcon = (iconName) => {
  const iconOption = ICON_OPTIONS.find((opt) => opt.value === iconName?.toLowerCase());
  return iconOption?.icon || <LinkIcon />;
};

function FooterConfigManager() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [configs, setConfigs] = useState({});
  const [configIds, setConfigIds] = useState({});

  // Text configs
  const [tagline, setTagline] = useState('');
  const [copyright, setCopyright] = useState('');
  const [bottomText, setBottomText] = useState('');

  // Link arrays
  const [socialLinks, setSocialLinks] = useState([]);
  const [platformLinks, setPlatformLinks] = useState([]);
  const [supportLinks, setSupportLinks] = useState([]);
  const [legalLinks, setLegalLinks] = useState([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'social', 'platform', 'support', 'legal'
  const [editingIndex, setEditingIndex] = useState(null);
  const [linkForm, setLinkForm] = useState({ name: '', url: '', icon: '', label: '', path: '' });

  // Load configs
  const loadConfigs = async () => {
    setLoading(true);
    try {
      // Get all configs to find IDs
      const allConfigs = await configService.getAllConfigs();
      const footerConfigs = allConfigs.filter((c) => c.category === 'FOOTER');

      const idsMap = {};
      footerConfigs.forEach((c) => {
        idsMap[c.key] = c.id;
      });
      setConfigIds(idsMap);

      // Get footer config map
      const data = await configService.getByCategory('FOOTER');
      setConfigs(data);

      // Parse text configs
      setTagline(data.FOOTER_TAGLINE || '');
      setCopyright(data.FOOTER_COPYRIGHT || '');
      setBottomText(data.FOOTER_BOTTOM_TEXT || '');

      // Parse JSON configs
      setSocialLinks(parseJsonSafe(data.FOOTER_SOCIAL_LINKS, []));
      setPlatformLinks(parseJsonSafe(data.FOOTER_PLATFORM_LINKS, []));
      setSupportLinks(parseJsonSafe(data.FOOTER_SUPPORT_LINKS, []));
      setLegalLinks(parseJsonSafe(data.FOOTER_LEGAL_LINKS, []));
    } catch (error) {
      showError('Failed to load footer configs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  // Parse JSON safely
  const parseJsonSafe = (jsonString, defaultValue) => {
    if (!jsonString) return defaultValue;
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  };

  // Save text config
  const saveTextConfig = async (key, value) => {
    try {
      const id = configIds[key];
      if (id) {
        await configService.updateConfig(id, { value });
        showSuccess(`${key} updated successfully`);
      }
    } catch (error) {
      showError(`Failed to update ${key}`);
    }
  };

  // Save JSON config
  const saveJsonConfig = async (key, value) => {
    try {
      const id = configIds[key];
      if (id) {
        await configService.updateConfig(id, { value: JSON.stringify(value) });
        showSuccess('Links updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      showError('Failed to update links');
      return false;
    }
  };

  // Handle save all text configs
  const handleSaveTextConfigs = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveTextConfig('FOOTER_TAGLINE', tagline),
        saveTextConfig('FOOTER_COPYRIGHT', copyright),
        saveTextConfig('FOOTER_BOTTOM_TEXT', bottomText),
      ]);
    } finally {
      setSaving(false);
    }
  };

  // Open dialog for add/edit link
  const handleOpenDialog = (type, index = null) => {
    setDialogType(type);
    setEditingIndex(index);

    if (index !== null) {
      // Edit mode
      let link;
      switch (type) {
        case 'social':
          link = socialLinks[index];
          setLinkForm({ name: link.name || '', url: link.url || '', icon: link.icon || '' });
          break;
        case 'platform':
          link = platformLinks[index];
          setLinkForm({ label: link.label || '', path: link.path || '' });
          break;
        case 'support':
          link = supportLinks[index];
          setLinkForm({ label: link.label || '', path: link.path || '' });
          break;
        case 'legal':
          link = legalLinks[index];
          setLinkForm({ label: link.label || '', path: link.path || '' });
          break;
      }
    } else {
      // Add mode
      setLinkForm({ name: '', url: '', icon: 'facebook', label: '', path: '' });
    }
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogType('');
    setEditingIndex(null);
    setLinkForm({ name: '', url: '', icon: '', label: '', path: '' });
  };

  // Save link
  const handleSaveLink = async () => {
    let newLinks;
    let key;

    switch (dialogType) {
      case 'social':
        if (!linkForm.name || !linkForm.url) {
          showError('Name and URL are required');
          return;
        }
        newLinks = [...socialLinks];
        const socialLink = { name: linkForm.name, url: linkForm.url, icon: linkForm.icon };
        if (editingIndex !== null) {
          newLinks[editingIndex] = socialLink;
        } else {
          newLinks.push(socialLink);
        }
        key = 'FOOTER_SOCIAL_LINKS';
        if (await saveJsonConfig(key, newLinks)) {
          setSocialLinks(newLinks);
        }
        break;

      case 'platform':
        if (!linkForm.label || !linkForm.path) {
          showError('Label and path are required');
          return;
        }
        newLinks = [...platformLinks];
        const platformLink = { label: linkForm.label, path: linkForm.path };
        if (editingIndex !== null) {
          newLinks[editingIndex] = platformLink;
        } else {
          newLinks.push(platformLink);
        }
        key = 'FOOTER_PLATFORM_LINKS';
        if (await saveJsonConfig(key, newLinks)) {
          setPlatformLinks(newLinks);
        }
        break;

      case 'support':
        if (!linkForm.label || !linkForm.path) {
          showError('Label and path are required');
          return;
        }
        newLinks = [...supportLinks];
        const supportLink = { label: linkForm.label, path: linkForm.path };
        if (editingIndex !== null) {
          newLinks[editingIndex] = supportLink;
        } else {
          newLinks.push(supportLink);
        }
        key = 'FOOTER_SUPPORT_LINKS';
        if (await saveJsonConfig(key, newLinks)) {
          setSupportLinks(newLinks);
        }
        break;

      case 'legal':
        if (!linkForm.label || !linkForm.path) {
          showError('Label and path are required');
          return;
        }
        newLinks = [...legalLinks];
        const legalLink = { label: linkForm.label, path: linkForm.path };
        if (editingIndex !== null) {
          newLinks[editingIndex] = legalLink;
        } else {
          newLinks.push(legalLink);
        }
        key = 'FOOTER_LEGAL_LINKS';
        if (await saveJsonConfig(key, newLinks)) {
          setLegalLinks(newLinks);
        }
        break;
    }

    handleCloseDialog();
  };

  // Delete link
  const handleDeleteLink = async (type, index) => {
    let newLinks;
    let key;

    switch (type) {
      case 'social':
        newLinks = socialLinks.filter((_, i) => i !== index);
        key = 'FOOTER_SOCIAL_LINKS';
        if (await saveJsonConfig(key, newLinks)) {
          setSocialLinks(newLinks);
        }
        break;
      case 'platform':
        newLinks = platformLinks.filter((_, i) => i !== index);
        key = 'FOOTER_PLATFORM_LINKS';
        if (await saveJsonConfig(key, newLinks)) {
          setPlatformLinks(newLinks);
        }
        break;
      case 'support':
        newLinks = supportLinks.filter((_, i) => i !== index);
        key = 'FOOTER_SUPPORT_LINKS';
        if (await saveJsonConfig(key, newLinks)) {
          setSupportLinks(newLinks);
        }
        break;
      case 'legal':
        newLinks = legalLinks.filter((_, i) => i !== index);
        key = 'FOOTER_LEGAL_LINKS';
        if (await saveJsonConfig(key, newLinks)) {
          setLegalLinks(newLinks);
        }
        break;
    }
  };

  // Render links table
  const renderLinksTable = (type, links, isSocial = false) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Links
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog(type)}
        >
          Add Link
        </Button>
      </Box>
      {links.length === 0 ? (
        <Alert severity="info">No links configured. Click "Add Link" to create one.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                {isSocial ? (
                  <>
                    <TableCell>Icon</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>URL</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Label</TableCell>
                    <TableCell>Path</TableCell>
                  </>
                )}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {links.map((link, index) => (
                <TableRow key={index} hover>
                  {isSocial ? (
                    <>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getIcon(link.icon)}
                        </Box>
                      </TableCell>
                      <TableCell>{link.name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                          {link.url}
                        </Typography>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{link.label}</TableCell>
                      <TableCell>
                        <Chip label={link.path} size="small" variant="outlined" />
                      </TableCell>
                    </>
                  )}
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(type, index)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteLink(type, index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  if (loading) {
    return <LoadingSpinner text="Loading footer configuration..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Footer Configuration
        </Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadConfigs}>
          Refresh
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Text Settings" />
          <Tab label="Social Links" />
          <Tab label="Platform Links" />
          <Tab label="Support Links" />
          <Tab label="Legal Links" />
        </Tabs>
      </Paper>

      {/* Text Settings Tab */}
      <TabPanel value={activeTab} index={0}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Footer Text Settings
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              helperText="Displayed below the logo in the footer"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Copyright Text"
              value={copyright}
              onChange={(e) => setCopyright(e.target.value)}
              helperText="Year is added automatically (e.g., 2025 {your text})"
            />
            <TextField
              fullWidth
              label="Bottom Text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              helperText="Displayed at the bottom right of the footer"
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveTextConfigs}
                loading={saving}
              >
                Save Text Settings
              </Button>
            </Box>
          </Box>
        </Paper>
      </TabPanel>

      {/* Social Links Tab */}
      <TabPanel value={activeTab} index={1}>
        <Paper sx={{ p: 3 }}>
          {renderLinksTable('social', socialLinks, true)}
        </Paper>
      </TabPanel>

      {/* Platform Links Tab */}
      <TabPanel value={activeTab} index={2}>
        <Paper sx={{ p: 3 }}>
          {renderLinksTable('platform', platformLinks)}
        </Paper>
      </TabPanel>

      {/* Support Links Tab */}
      <TabPanel value={activeTab} index={3}>
        <Paper sx={{ p: 3 }}>
          {renderLinksTable('support', supportLinks)}
        </Paper>
      </TabPanel>

      {/* Legal Links Tab */}
      <TabPanel value={activeTab} index={4}>
        <Paper sx={{ p: 3 }}>
          {renderLinksTable('legal', legalLinks)}
        </Paper>
      </TabPanel>

      {/* Add/Edit Link Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Edit' : 'Add'} {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} Link
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {dialogType === 'social' ? (
              <>
                <FormControl fullWidth>
                  <InputLabel>Icon</InputLabel>
                  <Select
                    value={linkForm.icon}
                    label="Icon"
                    onChange={(e) => setLinkForm({ ...linkForm, icon: e.target.value })}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {opt.icon}
                          <span>{opt.label}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Name"
                  value={linkForm.name}
                  onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                  placeholder="e.g., Facebook"
                  required
                />
                <TextField
                  fullWidth
                  label="URL"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  placeholder="e.g., https://facebook.com/uyirgene"
                  required
                />
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Label"
                  value={linkForm.label}
                  onChange={(e) => setLinkForm({ ...linkForm, label: e.target.value })}
                  placeholder="e.g., About Us"
                  required
                />
                <TextField
                  fullWidth
                  label="Path"
                  value={linkForm.path}
                  onChange={(e) => setLinkForm({ ...linkForm, path: e.target.value })}
                  placeholder="e.g., /about or https://external.com"
                  helperText="Use / prefix for internal links or full URL for external links"
                  required
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveLink}>
            {editingIndex !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FooterConfigManager;
