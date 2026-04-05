import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { AdminLayout, UserManager } from '../../components/admin';
import { LoadingSpinner } from '../../components/common';
import { adminService } from '../../services';
import { useToast } from '../../store';

function AdminUsers() {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      showSuccess('User role updated successfully');
      loadUsers();
    } catch (error) {
      showError('Failed to update user role');
    }
  };

  const handleToggleStatus = async (userId, enabled) => {
    try {
      await adminService.updateUserStatus(userId, enabled);
      showSuccess(`User ${enabled ? 'enabled' : 'disabled'} successfully`);
      loadUsers();
    } catch (error) {
      showError('Failed to update user status');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      showSuccess('User deleted successfully');
      loadUsers();
    } catch (error) {
      showError('Failed to delete user');
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await adminService.createUser(userData);
      showSuccess('User created successfully');
      loadUsers();
      return true;
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to create user');
      return false;
    }
  };

  const handleExport = async () => {
    try {
      await adminService.exportUsers();
    } catch (error) {
      showError('Failed to export users');
    }
  };

  const handleResendAccessLink = async (userId) => {
    try {
      const result = await adminService.resendAccessLink(userId);
      showSuccess(result.message || 'Access link sent successfully');
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to send access link');
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    try {
      await adminService.adminUnenroll(enrollmentId);
      showSuccess('User unenrolled successfully');
    } catch (error) {
      showError('Failed to unenroll user');
    }
  };

  const handleCompleteEnrollment = async (enrollmentId) => {
    try {
      await adminService.adminCompleteEnrollment(enrollmentId);
      showSuccess('Enrollment marked as complete');
    } catch (error) {
      showError('Failed to complete enrollment');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner fullScreen text="Loading users..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage user accounts, roles, and enrollments.
          </Typography>
        </Box>

        <UserManager
          users={users}
          onRoleChange={handleRoleChange}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          onUnenroll={handleUnenroll}
          onCompleteEnrollment={handleCompleteEnrollment}
          onRefresh={loadUsers}
          onCreateUser={handleCreateUser}
          onExport={handleExport}
          onResendAccessLink={handleResendAccessLink}
        />
      </Container>
    </AdminLayout>
  );
}

export default AdminUsers;
