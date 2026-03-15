import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Button } from '../common';
import api from '../../services/api';
import manualService from '../../services/manualService';
import { useToast } from '../../store';

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(contentType, fileName) {
  const ct = contentType?.toLowerCase() || '';
  const ext = fileName?.split('.').pop()?.toLowerCase() || '';
  if (ct.includes('pdf') || ext === 'pdf') return 'pdf';
  if (ct.includes('word') || ct.includes('document') || ext === 'doc' || ext === 'docx') return 'word';
  if (ct.includes('sheet') || ct.includes('excel') || ext === 'xls' || ext === 'xlsx') return 'excel';
  if (ct.includes('presentation') || ct.includes('powerpoint') || ext === 'ppt' || ext === 'pptx') return 'ppt';
  return 'other';
}

const FILE_TYPE_CONFIG = {
  pdf:   { icon: PictureAsPdfIcon,  color: '#e53935', bg: '#ffebee', label: 'PDF'  },
  word:  { icon: ArticleIcon,       color: '#1565c0', bg: '#e3f2fd', label: 'DOC'  },
  excel: { icon: TableChartIcon,    color: '#2e7d32', bg: '#e8f5e9', label: 'XLS'  },
  ppt:   { icon: DescriptionIcon,   color: '#e65100', bg: '#fff3e0', label: 'PPT'  },
  other: { icon: DescriptionIcon,   color: '#546e7a', bg: '#eceff1', label: 'FILE' },
};

function FileTypeBadge({ contentType, fileName }) {
  const type = getFileType(contentType, fileName);
  const { icon: Icon, color, bg, label } = FILE_TYPE_CONFIG[type];
  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 1.5,
        bgcolor: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        gap: 0.2,
      }}
    >
      <Icon sx={{ fontSize: 20, color }} />
      <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color, lineHeight: 1 }}>{label}</Typography>
    </Box>
  );
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
  title = 'Course Materials',
}) {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(null); // manual id being downloaded
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
      // silent — stay empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId || flagshipProgramId) load();
  }, [courseId, flagshipProgramId]); // eslint-disable-line

  const handleDownload = async (manual) => {
    const path = courseId
      ? `/api/courses/${courseId}/manuals/${manual.id}/download`
      : `/api/flagship/${flagshipProgramId}/manuals/${manual.id}/download`;
    setDownloading(manual.id);
    try {
      const response = await api.get(path, { responseType: 'blob' });
      const blobUrl = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = manual.fileName || manual.label;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      showError('Failed to download document. Please try again.');
    } finally {
      setDownloading(null);
    }
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

  if (!isAdmin && !loading && manuals.length === 0) return null;

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e3a5f 0%, #1a2e4a 100%)'
              : 'linear-gradient(135deg, #e3f0ff 0%, #dbeafe 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MenuBookIcon sx={{ fontSize: 18, color: '#fff' }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} color="primary.dark">
            {title}
          </Typography>
          {!loading && manuals.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {manuals.length} {manuals.length === 1 ? 'document' : 'documents'} available
            </Typography>
          )}
        </Box>
        {!loading && manuals.length > 0 && (
          <Chip
            label={manuals.length}
            size="small"
            color="primary"
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
          />
        )}
      </Box>

      {/* Body */}
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {manuals.length === 0 && isAdmin && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1, mb: 1 }}>
                No documents uploaded yet.
              </Typography>
            )}

            {/* Manual cards */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {manuals.map((manual) => (
                <Box
                  key={manual.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50',
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      borderColor: 'primary.light',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(25,118,210,0.08)' : 'primary.50',
                      boxShadow: '0 2px 8px rgba(25,118,210,0.10)',
                    },
                  }}
                >
                  <FileTypeBadge contentType={manual.contentType} fileName={manual.fileName} />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.25 }}
                      title={manual.label}
                    >
                      {manual.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                    >
                      {manual.fileName}
                      {manual.fileSize ? ` · ${formatFileSize(manual.fileSize)}` : ''}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={
                        downloading === manual.id
                          ? <CircularProgress size={13} color="inherit" />
                          : <DownloadIcon />
                      }
                      onClick={() => handleDownload(manual)}
                      disabled={downloading === manual.id}
                      sx={{
                        borderRadius: 5,
                        fontSize: '0.75rem',
                        px: 1.5,
                        py: 0.4,
                        minWidth: 0,
                        textTransform: 'none',
                      }}
                    >
                      {downloading === manual.id ? 'Downloading…' : 'Download'}
                    </Button>
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
            </Box>

            {/* Admin upload form */}
            {isAdmin && (
              <Box
                sx={{
                  mt: manuals.length > 0 ? 2 : 0,
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
          </>
        )}
      </Box>
    </Box>
  );
}

export default ManualSection;
