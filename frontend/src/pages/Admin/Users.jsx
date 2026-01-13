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

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      showSuccess('User deleted successfully');
      loadUsers();
    } catch (error) {
      showError('Failed to delete user');
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
            View and manage user accounts and roles.
          </Typography>
        </Box>

        <UserManager
          users={users}
          onRoleChange={handleRoleChange}
          onDelete={handleDelete}
        />
      </Container>
    </AdminLayout>
  );
}

export default AdminUsers;
