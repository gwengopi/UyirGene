import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Alert,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, LinearProgress, Tooltip, IconButton, CircularProgress,
  InputAdornment, Divider,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import PreviewIcon from '@mui/icons-material/Preview';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddLinkIcon from '@mui/icons-material/AddLink';
import AdminLayout from '../../components/admin/AdminLayout';
import marketingService from '../../services/marketingService';

const STATUS_COLOR = {
  IN_PROGRESS: 'warning',
  PENDING: 'info',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

/** Convert plain text to safe HTML (mirrors backend plainTextToHtml) */
function plainTextToHtml(text) {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

/** Resolve [[CTA:CODE|Label]] → button HTML for the preview iframe */
function applyCtaPlaceholders(html) {
  return html.replace(
    /\[\[CTA:([A-Za-z0-9\-_]+)(?:\|([^\]]+))?\]\]/gi,
    (_, code, label) => {
      const text = label || 'Learn More';
      return `<div style="text-align:center;padding:20px 0 8px;">
        <a href="#preview-${code}" style="display:inline-block;background:#1a237e;color:#fff;
           padding:14px 36px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:700;">
          ${text}
        </a>
        <div style="font-size:11px;color:#888;margin-top:4px;">[Code: ${code}]</div>
      </div>`;
    }
  );
}

function buildPreviewHtml(messageContent, footerAddress) {
  const resolvedContent = applyCtaPlaceholders(plainTextToHtml(messageContent));
  const address = footerAddress || 'Uyirgene International, Tamil Nadu, India';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4">
<tr><td align="center" style="padding:20px 10px;">
<table width="600" cellpadding="0" cellspacing="0" border="0"
       style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden;">
  <tr>
    <td style="background:linear-gradient(135deg,#1a237e 0%,#283593 100%);padding:32px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;">UyirGene</h1>
      <p style="margin:6px 0 0;color:#c5cae9;font-size:13px;">Professional Food Safety &amp; Quality Training</p>
    </td>
  </tr>
  <tr><td style="padding:36px 40px 24px;">${resolvedContent}</td></tr>
  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e0e0e0;margin:0;"></td></tr>
  <tr>
    <td style="padding:24px 40px;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;color:#757575;">You received this because you registered on UyirGene.</p>
      <p style="margin:0 0 8px;font-size:12px;color:#757575;">${address}</p>
      <p style="margin:0;font-size:12px;color:#757575;"><a href="#" style="color:#1a237e;">Unsubscribe</a></p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export default function MarketingCampaigns() {
  const [history, setHistory] = useState([]);
  const [active, setActive] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [settings, setSettings] = useState({ footerAddress: '', fromName: '' });
  const [loading, setLoading] = useState(true);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formContent, setFormContent] = useState('');
  const contentRef = useRef(null); // ref to the textarea DOM node

  // CTA insert helper
  const [ctaCode, setCtaCode] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaLookup, setCtaLookup] = useState(null);   // {type, name, url}
  const [ctaLookupLoading, setCtaLookupLoading] = useState(false);
  const [ctaLookupError, setCtaLookupError] = useState('');

  // Dialogs
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [histData, activeData, estData, settingsData] = await Promise.all([
        marketingService.getHistory(),
        marketingService.getActive(),
        marketingService.getEstimate(),
        marketingService.getSettings(),
      ]);
      setHistory(histData);
      setActive(activeData && activeData.active !== false ? activeData : null);
      setEstimate(estData);
      setSettings(settingsData);
    } catch (e) {
      console.error('Failed to load campaign data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Debounced CTA code lookup
  useEffect(() => {
    if (!ctaCode.trim()) {
      setCtaLookup(null);
      setCtaLookupError('');
      return;
    }
    const timer = setTimeout(async () => {
      setCtaLookupLoading(true);
      setCtaLookupError('');
      try {
        const result = await marketingService.lookupCode(ctaCode.trim());
        setCtaLookup(result);
      } catch {
        setCtaLookup(null);
        setCtaLookupError('Not found — check course code or flagship program code.');
      } finally {
        setCtaLookupLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [ctaCode]);

  /** Insert [[CTA:CODE|Label]] at the current cursor position in the textarea */
  const insertCtaPlaceholder = () => {
    if (!ctaCode.trim()) return;
    const placeholder = `[[CTA:${ctaCode.trim().toUpperCase()}${ctaLabel.trim() ? `|${ctaLabel.trim()}` : ''}]]`;
    const el = contentRef.current?.querySelector('textarea');
    if (el) {
      const start = el.selectionStart ?? formContent.length;
      const end   = el.selectionEnd   ?? formContent.length;
      const newVal = formContent.slice(0, start) + placeholder + formContent.slice(end);
      setFormContent(newVal);
      // Restore cursor after the inserted placeholder
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + placeholder.length;
        el.focus();
      }, 0);
    } else {
      setFormContent(prev => prev + placeholder);
    }
    setCtaCode('');
    setCtaLabel('');
    setCtaLookup(null);
  };

  const isActiveCampaign = active !== null;

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      await marketingService.triggerCampaign({
        name: formName,
        subject: formSubject,
        htmlBody: formContent,
      });
      setConfirmOpen(false);
      setFormName(''); setFormSubject(''); setFormContent('');
      setCtaCode(''); setCtaLabel(''); setCtaLookup(null);
      await load();
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || 'Failed to trigger campaign.';
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await marketingService.cancelCampaign(id);
      setCancelConfirmId(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to cancel campaign.');
    }
  };

  const batches = estimate ? estimate.estimatedBatches : '?';
  const days    = estimate ? estimate.estimatedDays    : '?';
  const count   = estimate ? estimate.recipientCount   : '?';
  const formValid = !!(formName && formSubject && formContent);

  return (
    <AdminLayout title="Marketing Campaigns">
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <CampaignIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight={700}>Marketing Campaigns</Typography>
        </Box>

        {/* Active Campaign Alert */}
        {isActiveCampaign && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" startIcon={<CancelIcon />}
                      onClick={() => setCancelConfirmId(active.id)}>
                Cancel
              </Button>
            }
          >
            <AlertTitle>Campaign In Progress: {active.name}</AlertTitle>
            {active.batchesSent}/{active.totalBatches} batches sent &middot;&nbsp;
            {active.totalRecipients} total recipients &middot;&nbsp;
            Status: <strong>{active.status}</strong>
            <LinearProgress
              variant="determinate"
              value={active.totalBatches > 0 ? (active.batchesSent / active.totalBatches) * 100 : 0}
              sx={{ mt: 1 }}
            />
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {/* New Campaign Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>New Campaign</Typography>
            <Tooltip title={isActiveCampaign ? 'Another campaign is already in progress' : ''} placement="top">
              <span>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Campaign Name" value={formName}
                    onChange={e => setFormName(e.target.value)}
                    disabled={isActiveCampaign} fullWidth size="small"
                  />
                  <TextField
                    label="Email Subject" value={formSubject}
                    onChange={e => setFormSubject(e.target.value)}
                    disabled={isActiveCampaign} fullWidth size="small"
                  />

                  {/* Content textarea */}
                  <TextField
                    ref={contentRef}
                    label="Email Content"
                    value={formContent} onChange={e => setFormContent(e.target.value)}
                    disabled={isActiveCampaign} fullWidth multiline minRows={8} size="small"
                    placeholder={`Dear learner,\n\nWe have an exciting new course for you!\n\n[[CTA:COURSE-CODE|Enrol Now]]\n\nFeel free to reach out if you have any questions.\n\nWarm regards,\nUyirGene Team`}
                    helperText="Write plain text. Line breaks are preserved. Use [[CTA:CODE|Button Text]] to insert CTA buttons anywhere."
                  />

                  {/* CTA Insert Helper */}
                  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Insert CTA Button
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                      Enter a Course Code or Flagship Program Code, then click <strong>Insert</strong> to
                      place a button at the cursor position in your content. Add as many as you need.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <TextField
                        label="Course/Program Code"
                        value={ctaCode}
                        onChange={e => { setCtaCode(e.target.value.toUpperCase()); setCtaLookup(null); setCtaLookupError(''); }}
                        disabled={isActiveCampaign}
                        size="small"
                        sx={{ minWidth: 220 }}
                        placeholder="e.g. HACCP-001"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {ctaLookupLoading && <CircularProgress size={14} />}
                              {!ctaLookupLoading && ctaLookup && <CheckCircleIcon color="success" fontSize="small" />}
                              {!ctaLookupLoading && ctaLookupError && <ErrorIcon color="error" fontSize="small" />}
                              {!ctaLookupLoading && !ctaLookup && !ctaLookupError && <SearchIcon color="disabled" fontSize="small" />}
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label="Button Label"
                        value={ctaLabel}
                        onChange={e => setCtaLabel(e.target.value)}
                        disabled={isActiveCampaign}
                        size="small"
                        sx={{ minWidth: 160 }}
                        placeholder="Learn More"
                      />
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddLinkIcon />}
                        disabled={isActiveCampaign || !ctaCode.trim() || ctaLookupLoading}
                        onClick={insertCtaPlaceholder}
                        sx={{ height: 40 }}
                      >
                        Insert
                      </Button>
                    </Box>

                    {ctaLookup && (
                      <Alert severity="success" sx={{ mt: 1.5 }} icon={<CheckCircleIcon fontSize="small" />}>
                        <strong>{ctaLookup.type === 'course' ? 'Course' : 'Flagship Program'}:</strong>{' '}
                        {ctaLookup.name}
                      </Alert>
                    )}
                    {ctaLookupError && (
                      <Alert severity="warning" sx={{ mt: 1.5 }}>{ctaLookupError}</Alert>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined" startIcon={<PreviewIcon />}
                      disabled={isActiveCampaign || !formContent}
                      onClick={() => setPreviewOpen(true)}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="contained" startIcon={<SendIcon />}
                      disabled={isActiveCampaign || !formValid}
                      onClick={() => setConfirmOpen(true)}
                    >
                      Send Campaign
                    </Button>
                  </Box>
                </Box>
              </span>
            </Tooltip>
          </CardContent>
        </Card>

        {/* History Table */}
        <Typography variant="h6" fontWeight={600} gutterBottom>Campaign History</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Subject</strong></TableCell>
                  <TableCell><strong>Triggered By</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Recipients</strong></TableCell>
                  <TableCell><strong>Batches</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No campaigns yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map(c => (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.name}</TableCell>
                      <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.subject}
                      </TableCell>
                      <TableCell>{c.triggeredBy}</TableCell>
                      <TableCell>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{c.totalRecipients}</TableCell>
                      <TableCell>{c.batchesSent}/{c.totalBatches}</TableCell>
                      <TableCell>
                        <Chip label={c.status} color={STATUS_COLOR[c.status] || 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        {(c.status === 'IN_PROGRESS' || c.status === 'PENDING') && (
                          <Tooltip title="Cancel">
                            <IconButton size="small" color="error" onClick={() => setCancelConfirmId(c.id)}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Email Preview</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <iframe
            srcDoc={buildPreviewHtml(formContent, settings.footerAddress)}
            title="Email Preview"
            style={{ width: '100%', height: 520, border: 'none' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Send Dialog */}
      <Dialog open={confirmOpen} onClose={() => !sending && setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Campaign Send</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            This will send to approximately <strong>{count}</strong> opted-in users in{' '}
            <strong>{batches}</strong> batch{batches !== 1 ? 'es' : ''} over{' '}
            <strong>{days}</strong> day{days !== 1 ? 's' : ''}.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            First batch ({estimate?.batchSize ?? 500} emails) sends immediately.
            Subsequent batches deliver at 09:00 AM each following day.
          </Typography>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={sending}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
            onClick={handleSend} disabled={sending}
          >
            {sending ? 'Sending...' : 'Confirm & Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirm Dialog */}
      <Dialog open={cancelConfirmId !== null} onClose={() => setCancelConfirmId(null)}>
        <DialogTitle>Cancel Campaign?</DialogTitle>
        <DialogContent>
          <Typography>Unsent batches will not be delivered.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmId(null)}>No</Button>
          <Button color="error" variant="contained" onClick={() => handleCancel(cancelConfirmId)}>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
