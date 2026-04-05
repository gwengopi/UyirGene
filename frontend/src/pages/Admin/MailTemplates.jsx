import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AdminLayout from '../../components/admin/AdminLayout';
import { getMailTemplates, updateMailTemplate, triggerReminders } from '../../services/mailTemplateService';

// Sample values shown in the preview in place of real variables
const COURSE_LIST_SAMPLE = `
  <ul style="list-style:none;padding:0;margin:0;">
    <li style="padding:8px 0;border-bottom:1px solid #e0d0f0;color:#333;">&#10003;&nbsp;<strong>Advanced Microbiology</strong></li>
    <li style="padding:8px 0;border-bottom:1px solid #e0d0f0;color:#333;">&#10003;&nbsp;<strong>Clinical Diagnostics Fundamentals</strong></li>
    <li style="padding:8px 0;color:#333;">&#10003;&nbsp;<strong>Laboratory Safety &amp; Compliance</strong></li>
  </ul>`;

const SAMPLE_VARS = {
  name: 'John Doe',
  courseTitle: 'Advanced Microbiology',
  courseDescription: 'A comprehensive course on advanced microbiology techniques.',
  courseCode: 'MB-ADV-001',
  trainerName: 'Dr. Sarah Smith',
  courseUrl: '#',
  appName: 'UyirGene',
  marks: '88.5%',
  certificateType: 'MERIT',
  dashboardUrl: '#',
  certificateId: 'CERT-2024-XYZ789',
  issuedDate: 'February 20, 2026',
  downloadUrl: '#',
  verifyUrl: '#',
  bundleTitle: 'Microbiology Excellence Value Pack',
  courseList: COURSE_LIST_SAMPLE,
  reason: 'Your card was declined. Please check your card details and try again.',
  retryUrl: '#',
  reasonLine: '<p style="color:#721c24;margin:0;font-size:14px;"><strong>Reason:</strong> Your card was declined. Please check your card details and try again.</p>',
};

function buildPreview(htmlBody, currentContent) {
  if (!htmlBody) return null;
  let html = htmlBody;
  const vars = { ...SAMPLE_VARS, content: currentContent || '(your message will appear here)' };
  Object.entries(vars).forEach(([key, val]) => {
    // Replace all occurrences
    html = html.split(`{{${key}}}`).join(val);
  });
  return html;
}

export default function AdminMailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [triggeringReminders, setTriggeringReminders] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMailTemplates();
      setTemplates(res.data);
    } catch {
      setError('Failed to load mail templates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleEdit = (tpl) => {
    setSelected(tpl);
    setSubject(tpl.subject);
    setContent(tpl.content);
    setEditOpen(true);
  };

  const handleClose = () => {
    setEditOpen(false);
    setSelected(null);
  };

  const handleSave = async () => {
    if (!subject.trim() || !content.trim()) return;
    try {
      setSaving(true);
      await updateMailTemplate(selected.id, { subject: subject.trim(), content: content.trim() });
      setSnackbar({ open: true, message: 'Template updated successfully.', severity: 'success' });
      handleClose();
      load();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save template.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerReminders = async () => {
    try {
      setTriggeringReminders(true);
      await triggerReminders();
      setSnackbar({ open: true, message: 'Reminder job triggered. Check server logs for details.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to trigger reminder job.', severity: 'error' });
    } finally {
      setTriggeringReminders(false);
    }
  };

  // Live preview: regenerated on every content keystroke
  const previewHtml = useMemo(
    () => buildPreview(selected?.htmlBody, content),
    [selected?.htmlBody, content]
  );

  const hasPreview = !!selected?.htmlBody;

  return (
    <AdminLayout title="Mail Templates">
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
          <EmailIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>Mail Templates</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Customize the subject line and message content for each automated email.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Email Type</strong></TableCell>
                <TableCell><strong>Subject</strong></TableCell>
                <TableCell><strong>Message Content</strong></TableCell>
                <TableCell align="right"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((tpl) => (
                <TableRow key={tpl.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{tpl.displayName}</Typography>
                    <Typography variant="caption" color="text.secondary">{tpl.templateKey}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{tpl.subject}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {tpl.content}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(tpl)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reminder trigger panel */}
      <Paper variant="outlined" sx={{ mt: 4, p: 3 }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <NotificationsActiveIcon color="action" sx={{ mt: 0.5 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Course Completion Reminders
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The reminder job runs automatically every day at 9:00 AM. Click below to trigger it manually right now (useful for testing). Check the server logs after clicking to see which enrollments were processed.
            </Typography>
            <Button
              variant="outlined"
              startIcon={triggeringReminders ? <CircularProgress size={16} /> : <NotificationsActiveIcon />}
              onClick={handleTriggerReminders}
              disabled={triggeringReminders}
            >
              {triggeringReminders ? 'Running…' : 'Send Reminders Now'}
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Edit Dialog — wider when preview is available */}
      <Dialog
        open={editOpen}
        onClose={(e, reason) => { if (reason !== 'backdropClick') handleClose(); }}
        disableEscapeKeyDown
        maxWidth={hasPreview ? 'lg' : 'sm'}
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon fontSize="small" color="primary" />
          Edit — {selected?.displayName}
        </DialogTitle>

        <DialogContent dividers>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexDirection: { xs: 'column', md: hasPreview ? 'row' : 'column' },
            }}
          >
            {/* Left: form fields */}
            <Stack spacing={2.5} sx={{ flex: '0 0 auto', width: { xs: '100%', md: hasPreview ? 340 : '100%' } }}>
              {selected?.availableVariables && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Available variables (replaced automatically):
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {selected.availableVariables.split(',').map((v) => (
                      <Chip key={v.trim()} label={v.trim()} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}

              <TextField
                label="Email Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
                size="small"
                helperText="You can use variables like {{courseTitle}} in the subject."
              />

              <TextField
                label="Message Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                fullWidth
                multiline
                rows={5}
                helperText="This paragraph appears in the email body just below the greeting. The preview updates live as you type."
              />
            </Stack>

            {/* Right: live email preview */}
            {hasPreview && (
              <>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                    <VisibilityIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Live Preview (sample data)
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      height: { xs: 320, md: 440 },
                      bgcolor: '#f4f4f4',
                    }}
                  >
                    <iframe
                      srcDoc={previewHtml}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      title="Email Preview"
                      sandbox="allow-same-origin"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Your edited content appears in the paragraph below the greeting.
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !subject.trim() || !content.trim()}
          >
            {saving ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
}
