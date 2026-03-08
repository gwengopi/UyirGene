import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormField, Button } from '../components/common';
import { useToast, useUI } from '../store';
import { authService } from '../services';
import { ROUTES, IMAGES } from '../utils/constants';

function ForgotPassword() {
  const { showError } = useToast();
  const { isDarkMode } = useUI();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch {
      showError('Something went wrong. Please try again.');
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
              Forgot Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Enter your email and we'll send you a reset link
            </Typography>
          </Box>

          {sent ? (
            <Alert severity="success" sx={{ borderRadius: 2, mb: 2 }}>
              Check your email — a reset link has been sent if an account exists for this address.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <FormField
                name="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                error={emailError}
                required
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.secondary' }} />
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
                Send Reset Link
              </Button>
            </Box>
          )}

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 2.5 }}>
            <Link
              component={RouterLink}
              to={ROUTES.LOGIN}
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              Back to Sign In
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default ForgotPassword;
