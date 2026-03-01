import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, Chip,
  Divider, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Tooltip, IconButton,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../store';
import api from '../../services/api';

const TOKEN_DOCS = [
  { token: '{YEAR}', desc: '4-digit year', example: '2026' },
  { token: '{YY}', desc: '2-digit year', example: '26' },
  { token: '{MONTH}', desc: '2-digit month', example: '02' },
  { token: '{DD}', desc: '2-digit day', example: '28' },
  { token: '{SEQ}', desc: 'Sequence number (no padding)', example: '42' },
  { token: '{SEQ:N}', desc: 'Sequence zero-padded to N digits', example: '{SEQ:5} → 00042' },
];

/** Client-side preview so the user sees changes instantly while typing */
function previewFormat(format, nextSeq) {
  const now = new Date();
  const year = now.getFullYear();
  const yy = String(year).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  let result = format;
  result = result.replaceAll('{YEAR}', year);
  result = result.replaceAll('{YY}', yy);
  result = result.replaceAll('{MONTH}', month);
  result = result.replaceAll('{DD}', dd);

  // {SEQ:N} — must replace before bare {SEQ}
  result = result.replace(/\{SEQ:(\d+)\}/g, (_, n) =>
    String(nextSeq).padStart(parseInt(n), '0')
  );
  result = result.replaceAll('{SEQ}', String(nextSeq));

  return result;
}

export default function CertSettings() {
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [format, setFormat] = useState('');
  const [currentSeq, setCurrentSeq] = useState(0);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetToValue, setResetToValue] = useState('0');

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/config/admin/cert-number');
      setFormat(res.data.format);
      setCurrentSeq(res.data.currentSeq);
    } catch {
      showError('Failed to load certificate number settings.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSaveFormat = async () => {
    if (!format.trim()) {
      showError('Format cannot be empty.');
      return;
    }
    if (!format.includes('{SEQ}') && !/\{SEQ:\d+\}/.test(format)) {
      showError('Format must include {SEQ} or {SEQ:N} — without it every certificate will get the same ID.');
      return;
    }
    try {
      setSaving(true);
      const res = await api.put('/api/config/admin/cert-number', { format: format.trim() });
      setFormat(res.data.format);
      setCurrentSeq(res.data.currentSeq);
      showSuccess('Certificate number format saved.');
    } catch {
      showError('Failed to save format.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSeq = async () => {
    const val = parseInt(resetToValue, 10);
    if (isNaN(val) || val < 0) {
      showError('Please enter a valid non-negative integer.');
      return;
    }
    try {
      setSaving(true);
      const res = await api.put('/api/config/admin/cert-number', { seq: val });
      setCurrentSeq(res.data.currentSeq);
      setResetDialogOpen(false);
      showSuccess(`Sequence reset to ${val}.`);
    } catch {
      showError('Failed to reset sequence.');
    } finally {
      setSaving(false);
    }
  };

  const nextSeq = currentSeq + 1;
  const preview = format ? previewFormat(format, nextSeq) : '';

  return (
    <AdminLayout title="Certificate Settings">
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Certificate Number Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure the format for auto-generated certificate numbers. Every new certificate
        gets a unique, incrementing number based on this format.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Format editor */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Format Pattern</Typography>
            <TextField
              fullWidth
              label="Certificate Number Format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              placeholder="e.g. UG-{YEAR}-{SEQ:5}"
              helperText="Use the tokens below to compose your format. Changes take effect on the next certificate generated."
              sx={{ mb: 2 }}
            />

            {/* Warning when format has no sequence token */}
            {format && !format.includes('{SEQ}') && !/\{SEQ:\d+\}/.test(format) && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Missing sequence token.</strong> Without <code>&#123;SEQ&#125;</code> or <code>&#123;SEQ:N&#125;</code>,
                every certificate will get the <em>same</em> ID — add a sequence token to make each number unique.
              </Alert>
            )}

            {/* Live preview */}
            {preview && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Preview (next certificate):</strong>&nbsp;
                <code style={{ fontSize: '1.05rem', letterSpacing: 1 }}>{preview}</code>
              </Alert>
            )}

            <Button
              variant="contained"
              onClick={handleSaveFormat}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Format'}
            </Button>
          </Paper>

          {/* Token reference */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Tokens
              <Tooltip title="Insert these tokens into the format string above">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {TOKEN_DOCS.map(({ token }) => (
                <Chip
                  key={token}
                  label={token}
                  size="small"
                  variant="outlined"
                  onClick={() => setFormat((f) => f + token)}
                  sx={{ fontFamily: 'monospace', cursor: 'pointer' }}
                />
              ))}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <Box component="thead">
                <Box component="tr">
                  {['Token', 'Description', 'Example'].map((h) => (
                    <Box component="th" key={h} sx={{ textAlign: 'left', pb: 1, pr: 2 }}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">
                        {h}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {TOKEN_DOCS.map(({ token, desc, example }) => (
                  <Box component="tr" key={token}>
                    <Box component="td" sx={{ pr: 3, py: 0.5 }}>
                      <code>{token}</code>
                    </Box>
                    <Box component="td" sx={{ pr: 3, py: 0.5 }}>
                      <Typography variant="body2">{desc}</Typography>
                    </Box>
                    <Box component="td" sx={{ py: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">{example}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>

          {/* Sequence counter */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Sequence Counter</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The counter is automatically incremented each time a certificate is generated.
              You can reset it here if needed (e.g., at the start of a new year).
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Current sequence:</strong> {currentSeq} &nbsp;|&nbsp;
              <strong>Next certificate will be:</strong>&nbsp;
              <code>{preview || '(set a format above)'}</code>
            </Alert>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RefreshIcon />}
              onClick={() => { setResetToValue('0'); setResetDialogOpen(true); }}
            >
              Reset Sequence
            </Button>
          </Paper>

        </Box>
      )}

      {/* Reset confirmation dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Sequence Counter</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter the value to reset the counter to. Setting it to 0 means the next
            certificate will use sequence 1. This cannot be undone.
          </DialogContentText>
          <TextField
            label="Reset counter to"
            type="number"
            value={resetToValue}
            onChange={(e) => setResetToValue(e.target.value)}
            inputProps={{ min: 0 }}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetSeq} color="warning" variant="contained" disabled={saving}>
            {saving ? 'Resetting…' : 'Reset'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
