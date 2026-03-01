import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import { Button } from '../common';
import manualService from '../../services/manualService';
import { useToast } from '../../store';

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ contentType }) {
  if (contentType?.includes('pdf'))
    return <PictureAsPdfIcon color="error" sx={{ fontSize: 22, flexShrink: 0 }} />;
  if (contentType?.includes('word') || contentType?.includes('document'))
    return <ArticleIcon color="primary" sx={{ fontSize: 22, flexShrink: 0 }} />;
  return <DescriptionIcon color="action" sx={{ fontSize: 22, flexShrink: 0 }} />;
}

/**
 * ManualSection — shows downloadable documents for a course or flagship program.
 *
 * @param {number}  courseId           – pass for course manuals
 * @param {number}  flagshipProgramId  – pass for flagship manuals
 * @param {boolean} isAdmin            – show upload / delete controls
 * @param {string}  title              – section heading
 */
function ManualSection({
  courseId,
  flagshipProgramId,
  isAdmin = false,
  title = 'Manuals & Documents',
}) {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newFile, setNewFile] = useState(null);
  const { showSuccess, showError } = useToast();

  const load = async () => {
    try {
      const data = courseId
        ? await manualService.getCourseManuals(courseId)
        : await manualService.getFlagshipManuals(flagshipProgramId);
      setManuals(data);
    } catch {
      // silent — if there are no manuals the list stays empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId || flagshipProgramId) load();
  }, [courseId, flagshipProgramId]); // eslint-disable-line

  const handleDownload = (manual) => {
    const url = courseId
      ? manualService.getCourseManualDownloadUrl(courseId, manual.id)
      : manualService.getFlagshipManualDownloadUrl(flagshipProgramId, manual.id);
    window.open(url, '_blank');
  };

  const handleUpload = async () => {
    if (!newFile || !newLabel.trim()) return;
    setUploading(true);
    try {
      if (courseId) {
        await manualService.uploadCourseManual(courseId, newLabel.trim(), newFile);
      } else {
        await manualService.uploadFlagshipManual(flagshipProgramId, newLabel.trim(), newFile);
      }
      setNewLabel('');
      setNewFile(null);
      await load();
      showSuccess('Document uploaded successfully');
    } catch {
      showError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (manualId) => {
    try {
      if (courseId) {
        await manualService.deleteCourseManual(courseId, manualId);
      } else {
        await manualService.deleteFlagshipManual(flagshipProgramId, manualId);
      }
      await load();
      showSuccess('Document deleted');
    } catch {
      showError('Failed to delete document');
    }
  };

  // Public view: hide section entirely if no manuals
  if (!isAdmin && !loading && manuals.length === 0) return null;

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Box>
          {manuals.length === 0 && isAdmin && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No documents uploaded yet.
            </Typography>
          )}

          {manuals.map((manual, idx) => (
            <Box
              key={manual.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1.5,
                borderBottom: idx < manuals.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <FileIcon contentType={manual.contentType} />
              <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  title={manual.label}
                >
                  {manual.label}
                </Typography>
                {manual.fileSize && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {formatFileSize(manual.fileSize)}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                <Tooltip title="Download">
                  <IconButton size="small" color="primary" onClick={() => handleDownload(manual)}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {isAdmin && (
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(manual.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          ))}

          {/* Admin upload form */}
          {isAdmin && (
            <Box
              sx={{
                mt: 2,
                pt: manuals.length > 0 ? 2 : 0,
                borderTop: manuals.length > 0 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                Upload new document
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  size="small"
                  label="Document label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  sx={{ minWidth: 200, flex: 1 }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleUpload(); }}
                />
                <Tooltip title={newFile ? newFile.name : ''}>
                  <Button
                    size="small"
                    variant="outlined"
                    component="label"
                    sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}
                  >
                    {newFile ? newFile.name : 'Choose file'}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={(e) => setNewFile(e.target.files[0] || null)}
                    />
                  </Button>
                </Tooltip>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleUpload}
                  disabled={!newFile || !newLabel.trim()}
                  loading={uploading}
                >
                  Upload
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}

export default ManualSection;
