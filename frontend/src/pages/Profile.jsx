import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { Breadcrumb } from '../components/common';
import { ProfileCard, ProfileForm } from '../components/user';
import { authService, enrollmentService } from '../services';
import { useAuth, useToast } from '../store';
import { ROUTES } from '../utils/constants';

function Profile() {
  const { user, refreshUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ enrolledCourses: 0, completedCourses: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const enrollments = await enrollmentService.getEnrolledCourses();
        setStats({
          enrolledCourses: enrollments.length,
          completedCourses: enrollments.filter((e) => e.status === 'COMPLETED').length,
        });
      } catch (_) {
        // Keep defaults
      }
    };
    loadStats();
  }, []);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      await authService.updateProfile(data);
      await refreshUser();
      showSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumb items={[{ label: 'Profile', path: ROUTES.PROFILE }]} />

      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <ProfileCard
            user={user}
            stats={stats}
            onEditProfile={() => setIsEditing(true)}
            showEditButton={!isEditing}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {isEditing ? (
              <ProfileForm
                user={user}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
                loading={saving}
              />
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click "Edit Profile" to update your information.
                </Typography>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  <strong>Name:</strong> {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  This name will be displayed on your certificates
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {user?.email}
                </Typography>
                <Typography variant="body1">
                  <strong>Role:</strong> {user?.role}
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;
