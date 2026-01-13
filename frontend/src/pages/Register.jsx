import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Paper, Typography, Box, Link, Alert } from '@mui/material';
import { FormField, Select, Button } from '../components/common';
import { authService } from '../services';
import { useToast } from '../store';
import { validateForm, hasErrors } from '../utils/validators';
import { ROUTES, ROLES } from '../utils/constants';

function Register() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.STUDENT,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (registerError) {
      setRegisterError('');
    }
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
      role: { required: true, label: 'Role' },
    };

    const validationErrors = validateForm(schema, formData);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    setLoading(true);
    setRegisterError('');

    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
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

  const roleOptions = [
    { value: ROLES.STUDENT, label: 'Student' },
    { value: ROLES.INSTRUCTOR, label: 'Instructor' },
  ];

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center" fontWeight={600}>
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Start your learning journey today
        </Typography>

        {registerError && (
          <Alert severity="error" sx={{ mb: 3 }}>
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
          />

          <FormField
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="new-password"
            helperText="Minimum 8 characters with uppercase, lowercase, and number"
          />

          <FormField
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />

          <Select
            name="role"
            label="I want to"
            value={formData.role}
            onChange={handleChange}
            error={errors.role}
            options={roleOptions}
            required
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            loading={loading}
            sx={{ mt: 2, mb: 3 }}
          >
            Create Account
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to={ROUTES.LOGIN}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;
