import React, { useState } from 'react';
import {
  Paper, Box, Typography, Divider, TextField,
  IconButton, Avatar, Tooltip,
} from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Button } from '../common';
import { useAuth } from '../../store';
import { authService } from '../../services';

// Teal accent — readable on both white and dark paper
const TEAL = '#00796b';
const TEAL_DARK = '#004d40';
const TEAL_LIGHT = '#26a69a';

export default function CertificateNameCard() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const displayName = user?.name || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  const handleEdit = () => {
    setNameValue(displayName);
    setError('');
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
  };

  const handleSave = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      setError('Name cannot be empty');
      return;
    }
    if (trimmed === displayName) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await authService.updateProfile({ name: trimmed });
      await refreshUser();
      setEditing(false);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 3000);
    } catch {
      setError('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      sx={{
        mb: 3,
        borderRadius: 2,
        overflow: 'hidden',
        border: (theme) =>
          `1px solid ${theme.palette.mode === 'dark'
            ? 'rgba(38, 166, 154, 0.2)'
            : 'rgba(0, 121, 107, 0.15)'}`,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 2px 12px rgba(0,0,0,0.4)'
            : '0 2px 12px rgba(0, 121, 107, 0.08)',
      }}
    >
      {/* ── Gradient header ── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.8,
          background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <WorkspacePremiumIcon sx={{ color: '#80cbc4', fontSize: 20 }} />
        <Typography
          variant="subtitle1"
          sx={{ color: '#fff', fontWeight: 700, letterSpacing: 0.4, lineHeight: 1 }}
        >
          Certificate Name
        </Typography>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {!editing ? (
          /* ── View mode ── */
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(38, 166, 154, 0.08)'
                  : 'rgba(0, 121, 107, 0.05)',
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'dark'
                  ? 'rgba(38, 166, 154, 0.18)'
                  : 'rgba(0, 121, 107, 0.15)'}`,
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: `linear-gradient(135deg, ${TEAL_LIGHT}, ${TEAL})`,
                fontSize: '0.9rem',
                fontWeight: 700,
                flexShrink: 0,
                boxShadow: `0 2px 8px rgba(0, 121, 107, 0.3)`,
              }}
            >
              {initial}
            </Avatar>

            <Typography
              variant="body1"
              fontWeight={600}
              sx={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: savedFeedback ? 'success.main' : 'text.primary',
                transition: 'color 0.4s ease',
              }}
            >
              {savedFeedback ? '✓ Name updated!' : (displayName || 'Not set')}
            </Typography>

            <Tooltip title="Edit certificate name" placement="top">
              <IconButton
                size="small"
                onClick={handleEdit}
                aria-label="Edit certificate name"
                sx={{
                  color: TEAL_LIGHT,
                  border: `1px solid rgba(0, 121, 107, 0.3)`,
                  borderRadius: 1.5,
                  p: 0.6,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(38, 166, 154, 0.15)'
                        : 'rgba(0, 121, 107, 0.08)',
                    borderColor: TEAL_LIGHT,
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <EditIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          /* ── Edit mode ── */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label="Full name for certificate"
              placeholder="e.g. Jane Smith"
              value={nameValue}
              onChange={(e) => { setNameValue(e.target.value); setError(''); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              error={!!error}
              helperText={error || `${nameValue.length} / 100`}
              inputProps={{ maxLength: 100 }}
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: TEAL },
                '& .MuiInputLabel-root.Mui-focused': { color: TEAL },
              }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancel}
                disabled={saving}
                startIcon={<CloseIcon />}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleSave}
                loading={saving}
                startIcon={<CheckIcon />}
                sx={{
                  flex: 1,
                  bgcolor: TEAL,
                  '&:hover': { bgcolor: TEAL_DARK },
                }}
              >
                Save
              </Button>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
          <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', mt: 0.25, flexShrink: 0 }} />
          <Typography variant="caption" color="text.disabled" lineHeight={1.5}>
            This name will be printed on your certificate. Make sure it matches your official name.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
