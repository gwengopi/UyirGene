import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Box, Alert,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

/**
 * Modal shown to unauthenticated users when they click Enroll.
 * Collects name, email, and phone — enough to create a guest account
 * and proceed to the Razorpay payment flow.
 */
function GuestEnrollModal({ open, onClose, onSubmit, loading, courseName }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone.trim())) {
      errs.phone = 'Enter a valid phone number';
    }
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({ name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) handleSubmit();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonOutlineIcon color="primary" />
        Your Contact Details
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter your details to enroll in <strong>{courseName}</strong>. We'll create a free
          account and send you an access link by email.
        </Typography>

        <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: 'inherit', fontWeight: 600 }}>
            Log in here
          </a>{' '}
          to enroll.
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="name"
            label="Full Name"
            value={form.name}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            autoFocus
            disabled={loading}
          />
          <TextField
            name="email"
            label="Email Address"
            type="email"
            value={form.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={!!errors.email}
            helperText={errors.email || 'Your access link will be sent here'}
            fullWidth
            disabled={loading}
          />
          <TextField
            name="phone"
            label="Phone Number"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={!!errors.phone}
            helperText={errors.phone}
            fullWidth
            disabled={loading}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : 'Continue to Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GuestEnrollModal;
