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
  Stack,
  Tooltip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Button, EmptyState, LoadingSpinner } from '../common';
import UserEnrollmentsDialog from './UserEnrollmentsDialog';
import { formatRole } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';

/**
 * User Manager component for admin panel
 */
const EMPTY_CREATE_FORM = { name: '', email: '', password: '', role: 'STUDENT' };

function UserManager({
  users = [],
  loading = false,
  onRoleChange,
  onToggleStatus,
  onDelete,
  onUnenroll,
  onCompleteEnrollment,
  onRefresh,
  onCreateUser,
  onExport,
  onResendAccessLink,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [enrollmentsDialogOpen, setEnrollmentsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createErrors, setCreateErrors] = useState({});
  const [createSaving, setCreateSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleResendAccessLink = () => {
    if (selectedUser) {
      onResendAccessLink?.(selectedUser.id);
    }
    handleMenuClose();
  };

  const handleOpenCreate = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateErrors({});
    setShowPassword(false);
    setCreateDialogOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateDialogOpen(false);
  };

  const validateCreate = () => {
    const errs = {};
    if (!createForm.name.trim()) errs.name = 'Name is required';
    if (!createForm.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) errs.email = 'Invalid email';
    if (!createForm.password) errs.password = 'Password is required';
    else if (createForm.password.length < 6) errs.password = 'At least 6 characters';
    return errs;
  };

  const handleCreateSubmit = async () => {
    const errs = validateCreate();
    if (Object.keys(errs).length > 0) { setCreateErrors(errs); return; }
    setCreateSaving(true);
    const ok = await onCreateUser?.(createForm);
    setCreateSaving(false);
    if (ok) handleCloseCreate();
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="h6">Users ({filteredUsers.length})</Typography>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
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
            sx={{ minWidth: 220 }}
          />
          <Tooltip title="Download user list as CSV">
            <span>
              <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={onExport}>
                Export CSV
              </Button>
            </span>
          </Tooltip>
          <Button variant="contained" size="small" startIcon={<PersonAddIcon />} onClick={handleOpenCreate}>
            Add User
          </Button>
        </Stack>
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
        <MenuItem onClick={handleResendAccessLink}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Resend Access Link"
            secondary="For guest-enrolled users without a password"
            secondaryTypographyProps={{ fontSize: '0.7rem' }}
          />
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

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onClose={(_, r) => { if (r !== 'backdropClick') handleCloseCreate(); }} disableEscapeKeyDown maxWidth="xs" fullWidth>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              size="small"
              fullWidth
              required
              value={createForm.name}
              onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
              error={!!createErrors.name}
              helperText={createErrors.name}
            />
            <TextField
              label="Email"
              size="small"
              fullWidth
              required
              type="email"
              value={createForm.email}
              onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
              error={!!createErrors.email}
              helperText={createErrors.email}
            />
            <TextField
              label="Password"
              size="small"
              fullWidth
              required
              type={showPassword ? 'text' : 'password'}
              value={createForm.password}
              onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
              error={!!createErrors.password}
              helperText={createErrors.password || 'Min. 6 characters'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(p => !p)} edge="end">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={createForm.role}
                label="Role"
                onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))}
              >
                <MenuItem value="STUDENT">Student</MenuItem>
                <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate} disabled={createSaving}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSubmit} loading={createSaving}>
            Create User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManager;
