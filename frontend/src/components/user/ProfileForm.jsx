import React, { useState } from 'react';
import { Box, Typography, Divider, Alert } from '@mui/material';
import { FormField, Button } from '../common';
import { validateForm, hasErrors } from '../../utils/validators';

/**
 * Profile Edit Form component
 */
function ProfileForm({ user, onSave, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate profile form
    const profileSchema = {
      name: { required: true, label: 'Name', minLength: 2 },
      email: { required: true, email: true, label: 'Email' },
    };
    const profileErrors = validateForm(profileSchema, formData);

    // Validate password if changing
    let finalPasswordErrors = {};
    if (showPasswordForm && (passwordData.currentPassword || passwordData.newPassword)) {
      const passwordSchema = {
        currentPassword: { required: true, label: 'Current password' },
        newPassword: { required: true, password: true, label: 'New password' },
        confirmPassword: {
          required: true,
          label: 'Confirm password',
          custom: (value, values) =>
            value !== values.newPassword ? 'Passwords do not match' : null,
        },
      };
      finalPasswordErrors = validateForm(passwordSchema, passwordData);
    }

    setErrors(profileErrors);
    setPasswordErrors(finalPasswordErrors);

    if (hasErrors(profileErrors) || hasErrors(finalPasswordErrors)) {
      return;
    }

    const dataToSave = {
      ...formData,
      ...(showPasswordForm && passwordData.newPassword
        ? {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }
        : {}),
    };

    onSave?.(dataToSave);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        Profile Information
      </Typography>

      <FormField
        name="name"
        label="Full Name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        autoComplete="name"
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
        disabled // Email typically shouldn't be editable
        helperText="Email cannot be changed"
      />

      <Divider sx={{ my: 3 }} />

      {/* Password change section */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="text"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          type="button"
        >
          {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
        </Button>
      </Box>

      {showPasswordForm && (
        <>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>

          <Alert severity="info" sx={{ mb: 2 }}>
            Leave password fields empty if you don't want to change your password.
          </Alert>

          <FormField
            name="currentPassword"
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.currentPassword}
            autoComplete="current-password"
          />

          <FormField
            name="newPassword"
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.newPassword}
            autoComplete="new-password"
            helperText="Minimum 8 characters with uppercase, lowercase, and number"
          />

          <FormField
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.confirmPassword}
            autoComplete="new-password"
          />
        </>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button type="submit" variant="contained" loading={loading}>
          Save Changes
        </Button>
        <Button type="button" variant="outlined" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}

export default ProfileForm;
