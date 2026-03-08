import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { FormField, Button } from '../components/common';
import { useToast, useUI } from '../store';
import { authService } from '../services';
import { ROUTES, IMAGES } from '../utils/constants';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showSuccess, showError } = useToast();
  const { isDarkMode } = useUI();

  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  if (!token) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error">
          Invalid reset link.{' '}
          <Link component={RouterLink} to={ROUTES.FORGOT_PASSWORD}>Request a new one</Link>
        </Alert>
      </Box>
    );
  }

  const validate = () => {
    const errs = {};
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Minimum 8 characters';
    else if (!/.*[A-Z].*/.test(password) || !/.*[a-z].*/.test(password) || !/.*[0-9].*/.test(password))
      errs.password = 'Must contain uppercase, lowercase, and a number';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (confirmPassword !== password) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerError('');
    try {
      await authService.resetPassword(token, password);
      showSuccess('Password reset successfully. Please sign in.');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      const msg = error.response?.data?.message || 'Reset failed. The link may have expired.';
      setServerError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: isDarkMode
          ? 'linear-gradient(135deg, rgb(22, 22, 22) 0%, rgb(40, 40, 40) 100%)'
          : 'linear-gradient(135deg, rgb(245, 245, 245) 0%, rgb(230, 230, 230) 100%)',
        py: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: isDarkMode
              ? 'linear-gradient(180deg, rgb(35, 35, 35) 0%, rgb(25, 25, 25) 100%)'
              : 'linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(248, 248, 248) 100%)',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src={IMAGES.LOGO}
              alt="UyirGene"
              sx={{
                height: 52,
                mb: 1.5,
                objectFit: 'contain',
                filter: isDarkMode
                  ? 'brightness(1.2)'
                  : 'drop-shadow(0 0 6px rgba(0,0,0,0.45))',
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <Typography variant="h5" component="h1" fontWeight={700}
              sx={{
                background: isDarkMode
                  ? 'linear-gradient(90deg, rgb(255,255,255) 0%, rgb(180,180,180) 100%)'
                  : 'linear-gradient(90deg, rgb(33,33,33) 0%, rgb(80,80,80) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Set New Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Choose a strong password for your account
            </Typography>
          </Box>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {serverError}{' '}
              <Link component={RouterLink} to={ROUTES.FORGOT_PASSWORD}>Request a new link</Link>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormField
              name="password"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
              error={errors.password}
              required
              autoFocus
              helperText="Min 8 chars with uppercase, lowercase, and number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.secondary' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <FormField
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors({}); }}
              error={errors.confirmPassword}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" sx={{ color: 'text.secondary' }}>
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              loading={loading}
              sx={{
                py: 1.4,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                color: '#fff',
                background: 'linear-gradient(90deg, rgb(69,90,100) 0%, rgb(79,102,114) 100%)',
                boxShadow: '0 4px 15px rgba(79,102,114,0.3)',
                '&:hover': {
                  color: '#fff',
                  background: 'linear-gradient(90deg, rgb(79,102,114) 0%, rgb(100,130,145) 100%)',
                  boxShadow: '0 6px 20px rgba(79,102,114,0.4)',
                },
              }}
            >
              Reset Password
            </Button>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2.5, color: 'text.secondary' }}>
            Remember your password?{' '}
            <Link component={RouterLink} to={ROUTES.LOGIN} fontWeight={600}>Sign in</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default ResetPassword;
