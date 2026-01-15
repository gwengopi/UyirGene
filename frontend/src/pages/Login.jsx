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
import { FormField, Button } from '../components/common';
import { useAuth, useToast } from '../store';
import { validateForm, hasErrors } from '../utils/validators';
import { ROUTES } from '../utils/constants';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        background: 'linear-gradient(135deg, rgb(22, 22, 22) 0%, rgb(40, 40, 40) 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            background: 'linear-gradient(180deg, rgb(35, 35, 35) 0%, rgb(25, 25, 25) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
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
                background: 'linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(180, 180, 180) 100%)',
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
                background: 'linear-gradient(90deg, rgb(69, 90, 100) 0%, rgb(79, 102, 114) 100%)',
                boxShadow: '0 4px 15px rgba(79, 102, 114, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, rgb(79, 102, 114) 0%, rgb(100, 130, 145) 100%)',
                  boxShadow: '0 6px 20px rgba(79, 102, 114, 0.4)',
                },
              }}
            >
              Sign In
            </Button>

            <Divider sx={{ my: 3 }}>
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
                borderColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  background: 'rgba(255, 255, 255, 0.05)',
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
