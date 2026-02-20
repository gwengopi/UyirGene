import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Link,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SchoolIcon from '@mui/icons-material/School';
import CircularProgress from '@mui/material/CircularProgress';
import { useGoogleLogin } from '@react-oauth/google';
import { FormField, Button } from '../components/common';
import { useAuth, useToast, useUI } from '../store';
import { authService } from '../services';
import { validateForm, hasErrors } from '../utils/validators';
import { ROUTES } from '../utils/constants';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const { login, loginWithToken } = useAuth();
  const { showSuccess, showError } = useToast();
  const { isDarkMode } = useUI();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setLoginError('');
      try {
        const result = await authService.googleLogin({ accessToken: tokenResponse.access_token });
        loginWithToken(result.token, result.user);
        showSuccess('Login successful!');
        navigate(ROUTES.DASHBOARD);
      } catch (error) {
        const message = error.response?.data?.message || 'Google login failed';
        setLoginError(message);
        showError(message);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      showError('Google login failed');
      setLoginError('Google login failed. Please try again.');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const schema = {
      email: { required: true, email: true, label: 'Email' },
      password: { required: true, label: 'Password' },
    };

    const validationErrors = validateForm(schema, formData);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setLoading(true);
    setLoginError('');

    try {
      await login(formData.email, formData.password);
      showSuccess('Login successful!');
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Invalid email or password'
        : error.message || 'Login failed';
      setLoginError(message);
      showError(message);
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
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            background: isDarkMode
              ? 'linear-gradient(180deg, rgb(35, 35, 35) 0%, rgb(25, 25, 25) 100%)'
              : 'linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(248, 248, 248) 100%)',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Logo/Brand Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgb(79, 102, 114) 0%, rgb(100, 130, 145) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 4px 20px rgba(79, 102, 114, 0.3)',
              }}
            >
              <SchoolIcon sx={{ fontSize: 36, color: 'white' }} />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              sx={{
                  background: isDarkMode
                      ? 'linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(180, 180, 180) 100%)'
                      : 'linear-gradient(90deg, rgb(33, 33, 33) 0%, rgb(80, 80, 80) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Sign in to continue your learning journey
            </Typography>
          </Box>

          {loginError && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': { alignItems: 'center' },
              }}
            >
              {loginError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <FormField
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
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

            <FormField
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link
                component={RouterLink}
                to="#"
                sx={{
                  fontSize: '0.875rem',
                  color: 'primary.light',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              loading={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                color: '#fff',
                background: 'linear-gradient(90deg, rgb(69, 90, 100) 0%, rgb(79, 102, 114) 100%)',
                boxShadow: '0 4px 15px rgba(79, 102, 114, 0.3)',
                '&:hover': {
                  color: '#fff',
                  background: 'linear-gradient(90deg, rgb(79, 102, 114) 0%, rgb(100, 130, 145) 100%)',
                  boxShadow: '0 6px 20px rgba(79, 102, 114, 0.4)',
                },
              }}
            >
              Sign In
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Button
              fullWidth
              size="large"
              onClick={() => googleLogin()}
              disabled={googleLoading}
              startIcon={googleLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: 2,
                textTransform: 'none',
                color: isDarkMode ? '#e3e3e3' : '#3c4043',
                bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                border: '1px solid',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                boxShadow: isDarkMode
                  ? '0 1px 3px rgba(0,0,0,0.3)'
                  : '0 1px 3px rgba(0,0,0,0.08)',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(66, 133, 244, 0.04)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(66, 133, 244, 0.4)',
                  boxShadow: isDarkMode
                    ? '0 2px 6px rgba(0,0,0,0.4)'
                    : '0 2px 6px rgba(66, 133, 244, 0.15)',
                },
                mb: 3,
              }}
            >
              {googleLoading ? 'Signing in...' : 'Sign in with Google'}
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                New to UyirGene?
              </Typography>
            </Divider>

            <Button
              component={RouterLink}
              to={ROUTES.REGISTER}
              variant="outlined"
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                fontSize: '1rem',
                borderRadius: 2,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              Create an Account
            </Button>
          </Box>
        </Paper>

        {/* Footer text */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mt: 3, opacity: 0.7 }}
        >
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </Container>
    </Box>
  );
}

export default Login;
