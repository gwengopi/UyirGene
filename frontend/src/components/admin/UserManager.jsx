import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import { Button, EmptyState, LoadingSpinner } from '../common';
import UserEnrollmentsDialog from './UserEnrollmentsDialog';
import { formatRole } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';

/**
 * User Manager component for admin panel
 */
function UserManager({
  users = [],
  loading = false,
  onRoleChange,
  onToggleStatus,
  onDelete,
  onUnenroll,
  onCompleteEnrollment,
  onRefresh,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [enrollmentsDialogOpen, setEnrollmentsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenRoleDialog = () => {
    if (selectedUser) {
      setSelectedRole(selectedUser.role || 'STUDENT');
      setRoleDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleCloseRoleDialog = () => {
    setRoleDialogOpen(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const handleRoleSubmit = () => {
    if (selectedUser && selectedRole) {
      onRoleChange?.(selectedUser.id, selectedRole);
    }
    handleCloseRoleDialog();
  };

  const handleToggleStatus = () => {
    if (selectedUser) {
      onToggleStatus?.(selectedUser.id, !selectedUser.enabled);
    }
    handleMenuClose();
  };

  const handleOpenEnrollments = () => {
    setEnrollmentsDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseEnrollments = () => {
    setEnrollmentsDialogOpen(false);
    setSelectedUser(null);
  };

  const handleOpenDeleteConfirm = () => {
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = () => {
    if (selectedUser) {
      onDelete?.(selectedUser.id);
    }
    handleCloseDeleteConfirm();
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  const getRoleColor = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'error';
      case ROLES.INSTRUCTOR:
        return 'primary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  if (!users || users.length === 0) {
    return (
      <EmptyState
        title="No users found"
        description="Users will appear here when they register"
      />
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6">Users ({filteredUsers.length})</Typography>
        <TextField
          size="small"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Role</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {user.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={formatRole(user.role)}
                    size="small"
                    color={getRoleColor(user.role)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={user.enabled !== false ? 'Active' : 'Disabled'}
                    size="small"
                    color={user.enabled !== false ? 'success' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, user)}
                    aria-label="User actions"
                    aria-haspopup="true"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredUsers.length === 0 && searchQuery && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No users found matching "{searchQuery}"
          </Typography>
        </Box>
      )}

      {/* Actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleOpenRoleDialog}>
          <ListItemIcon>
            <AdminPanelSettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change Role</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleStatus}>
          <ListItemIcon>
            {selectedUser?.enabled !== false ? (
              <BlockIcon fontSize="small" color="warning" />
            ) : (
              <CheckCircleIcon fontSize="small" color="success" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedUser?.enabled !== false ? 'Disable User' : 'Enable User'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenEnrollments}>
          <ListItemIcon>
            <SchoolIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Enrollments</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenDeleteConfirm} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') handleCloseRoleDialog(); }} disableEscapeKeyDown maxWidth="xs" fullWidth>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Changing role for: <strong>{selectedUser?.name}</strong>
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="STUDENT">Student</MenuItem>
                <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleRoleSubmit}>
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') handleCloseDeleteConfirm(); }} disableEscapeKeyDown maxWidth="xs" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedUser?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            This will also delete all their course enrollments. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Enrollments Dialog */}
      <UserEnrollmentsDialog
        open={enrollmentsDialogOpen}
        user={selectedUser}
        onClose={handleCloseEnrollments}
        onUnenroll={onUnenroll}
        onComplete={onCompleteEnrollment}
        onRefresh={onRefresh}
      />
    </Box>
  );
}

export default UserManager;
