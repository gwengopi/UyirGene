import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, TextField, Alert,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Button } from './index';
import { ROUTES } from '../../utils/constants';

function GuestEmailDialog({ open, onClose, onSubmit, loading, courseName }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  const handleClose = () => {
    setEmail('');
    setEmailError('');
    setAlreadyEnrolled(false);
    onClose();
  };

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    const result = await onSubmit(trimmed);
    if (result?.alreadyEnrolled) {
      setAlreadyEnrolled(true);
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Enroll in {courseName}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Enter your email to enroll. We'll create a free account and send you an access link.
        </DialogContentText>
        <TextField
          label="Email Address"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
            setAlreadyEnrolled(false);
          }}
          error={!!emailError}
          helperText={emailError || 'Your access link will be sent here'}
          disabled={loading}
          required
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        />
        {alreadyEnrolled && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This email is already enrolled.{' '}
            <RouterLink to={ROUTES.LOGIN} style={{ fontWeight: 600 }}>Log in</RouterLink>
            {' '}or{' '}
            <RouterLink to="/forgot-password" style={{ fontWeight: 600 }}>reset your password</RouterLink>
            {' '}to access it.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          loading={loading}
          disabled={!email.trim() || alreadyEnrolled}
        >
          Enroll Free
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GuestEmailDialog;
