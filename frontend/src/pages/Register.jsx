import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  ButtonBase,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useGoogleLogin } from '@react-oauth/google';
import { FormField, Button } from '../components/common';
import { authService } from '../services';
import { useAuth, useToast, useUI } from '../store';
import { validateForm, hasErrors } from '../utils/validators';
import { ROUTES, ROLES, IMAGES } from '../utils/constants';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const FEATURES = ['Expert-led courses', 'Industry certifications', 'Flexible learning'];

function Register() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const { showSuccess, showError } = useToast();
  const { isDarkMode } = useUI();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setRegisterError('');
      try {
        const result = await authService.googleLogin({ accessToken: tokenResponse.access_token });
        loginWithToken(result.token, result.user);
        showSuccess('Account created successfully!');
        navigate(ROUTES.DASHBOARD);
      } catch (error) {
        const message = error.response?.data?.message || 'Google sign up failed';
        setRegisterError(message);
        showError(message);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      showError('Google sign up failed');
      setRegisterError('Google sign up failed. Please try again.');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (registerError) setRegisterError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const schema = {
      name: { required: true, label: 'Name', minLength: 2 },
      email: { required: true, email: true, label: 'Email' },
      password: { required: true, password: true, label: 'Password' },
      confirmPassword: {
        required: true,
        label: 'Confirm password',
        custom: (value, values) =>
          value !== values.password ? 'Passwords do not match' : null,
      },
    };
    const validationErrors = validateForm(schema, formData);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setLoading(true);
    setRegisterError('');
    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: ROLES.STUDENT,
      });
      showSuccess('Account created successfully! Please login.');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      setRegisterError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        background: isDarkMode
          ? 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
          : 'linear-gradient(135deg, #dce8ff 0%, #e8d5f5 50%, #d5eaf5 100%)',
        pt: { xs: 2, md: 2 },
        pb: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: isDarkMode
            ? 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(79,102,114,0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* Animated background blobs */}
      <Box sx={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: 420, height: 420, borderRadius: '50%',
        background: isDarkMode
          ? 'radial-gradient(circle, rgba(66,133,244,0.22) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(66,133,244,0.55) 0%, transparent 70%)',
        filter: 'blur(50px)',
        animation: 'blobFloat1 8s ease-in-out infinite',
        '@keyframes blobFloat1': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(-40px, 30px) scale(1.1)' },
        },
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-15%', left: '-8%',
        width: 500, height: 500, borderRadius: '50%',
        background: isDarkMode
          ? 'radial-gradient(circle, rgba(79,102,114,0.25) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(103,58,183,0.45) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'blobFloat2 10s ease-in-out infinite',
        '@keyframes blobFloat2': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(30px, -40px) scale(1.08)' },
        },
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute', top: '35%', right: '25%',
        width: 280, height: 280, borderRadius: '50%',
        background: isDarkMode
          ? 'radial-gradient(circle, rgba(100,130,145,0.15) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(0,172,193,0.4) 0%, transparent 70%)',
        filter: 'blur(45px)',
        animation: 'blobFloat3 12s ease-in-out infinite',
        '@keyframes blobFloat3': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(-20px, -30px) scale(1.05)' },
          '66%': { transform: 'translate(20px, 20px) scale(0.95)' },
        },
        zIndex: 0,
      }} />

      <Container maxWidth={false} sx={{ maxWidth: 820, px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={isDarkMode ? 4 : 12}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
          }}
        >
          {/* ── LEFT: Form panel ── */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, sm: 4 },
              background: isDarkMode ? 'rgb(26,26,26)' : '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 0,
            }}
          >
            {/* Back to home */}
            <Link
              component={RouterLink}
              to={ROUTES.HOME}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.78rem',
                mb: 2,
                '&:hover': { color: 'text.primary' },
              }}
            >
              ← Back to home
            </Link>

            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5, color: isDarkMode ? '#fff' : '#1a1a2e' }}>
              CREATE ACCOUNT
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start your learning journey today
            </Typography>

            {registerError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2, py: 0.5, '& .MuiAlert-icon': { alignItems: 'center' } }}>
                {registerError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <FormField
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                autoComplete="name"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5 }}
              />

              <FormField
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5 }}
              />

              <FormField
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                autoComplete="new-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: 'text.secondary' }}>
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5 }}
              />

              <FormField
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small" sx={{ color: 'text.secondary' }}>
                        {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1.5 }}
              />

              {/* Primary button — centered pill */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  loading={loading}
                  sx={{
                    px: 4.5,
                    py: 0.8,
                    borderRadius: '30px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    lineHeight: 1.5,
                    color: '#fff',
                    background: 'linear-gradient(90deg, rgb(69,90,100) 0%, rgb(100,130,145) 100%)',
                    boxShadow: '0 4px 14px rgba(79,102,114,0.4)',
                    textTransform: 'none',
                    '&:hover': {
                      color: '#fff',
                      background: 'linear-gradient(90deg, rgb(55,75,85) 0%, rgb(79,102,114) 100%)',
                      boxShadow: '0 6px 18px rgba(79,102,114,0.5)',
                    },
                  }}
                >
                  Create Account
                </Button>
              </Box>

              {/* SSO divider */}
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>or continue with</Typography>
              </Divider>

              <ButtonBase
                onClick={() => !googleLoading && googleLogin()}
                disabled={googleLoading}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  px: 2.5,
                  py: 1.1,
                  borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: '#4285F4',
                  bgcolor: isDarkMode ? 'rgba(66,133,244,0.08)' : '#fff',
                  boxShadow: isDarkMode
                    ? '0 0 0 0 rgba(66,133,244,0.4)'
                    : '0 2px 10px rgba(66,133,244,0.15)',
                  transition: 'all 0.25s ease',
                  animation: 'googlePulse 2.2s ease-in-out infinite',
                  '@keyframes googlePulse': {
                    '0%, 100%': {
                      boxShadow: isDarkMode
                        ? '0 0 6px 1px rgba(66,133,244,0.2)'
                        : '0 2px 10px rgba(66,133,244,0.15)',
                    },
                    '50%': {
                      boxShadow: isDarkMode
                        ? '0 0 18px 4px rgba(66,133,244,0.45)'
                        : '0 4px 22px rgba(66,133,244,0.35)',
                    },
                  },
                  '&:hover': {
                    borderColor: '#3367d6',
                    bgcolor: isDarkMode ? 'rgba(66,133,244,0.15)' : '#f0f4ff',
                    transform: 'translateY(-1px)',
                    animation: 'none',
                    boxShadow: '0 6px 24px rgba(66,133,244,0.4)',
                  },
                  '&:disabled': { opacity: 0.5, animation: 'none' },
                }}
              >
                {googleLoading
                  ? <CircularProgress size={18} sx={{ color: '#4285F4' }} />
                  : <GoogleIcon />}
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: isDarkMode ? '#fff' : '#3c4043' }}>
                  {googleLoading ? 'Signing up...' : 'Continue with Google'}
                </Typography>
              </ButtonBase>

              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2.5, color: 'text.secondary' }}>
                Already have an account?{' '}
                <Link component={RouterLink} to={ROUTES.LOGIN} fontWeight={600} sx={{ color: isDarkMode ? '#90caf9' : 'rgb(79,102,114)' }}>
                  Sign in
                </Link>
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1, opacity: 0.6 }}>
                By registering you agree to our{' '}
                <Link component={RouterLink} to="/terms" color="inherit">Terms</Link>
                {' '}&{' '}
                <Link component={RouterLink} to="/privacy" color="inherit">Privacy</Link>
              </Typography>
            </Box>
          </Box>

          {/* ── RIGHT: Brand panel ── */}
          <Box
            sx={{
              width: 260,
              flexShrink: 0,
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3.5,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(160deg, rgb(55,75,88) 0%, rgb(79,102,114) 55%, rgb(100,130,145) 100%)',
            }}
          >
            {/* Decorative circles */}
            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
            <Box sx={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <Box sx={{ position: 'absolute', top: '45%', right: -25, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

            {/* Logo */}
            <Box
              component="img"
              src={IMAGES.LOGO}
              alt="UyirGene"
              sx={{ height: 52, objectFit: 'contain', mb: 2, position: 'relative', zIndex: 1 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            <Typography variant="h6" fontWeight={700} sx={{ color: '#fff', textAlign: 'center', mb: 0.5, position: 'relative', zIndex: 1 }}>
              UyirGene
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.6, mb: 3, position: 'relative', zIndex: 1 }}>
              Your gateway to food safety expertise and professional certification
            </Typography>

            {/* Feature pills */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', position: 'relative', zIndex: 1 }}>
              {FEATURES.map((item) => (
                <Box
                  key={item}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    px: 1.5,
                    py: 0.75,
                  }}
                >
                  <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#81d4fa', flexShrink: 0 }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.78rem' }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Register;
