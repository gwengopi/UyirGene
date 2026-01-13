import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Button, LoadingSpinner, EmptyState } from '../common';
import { adminService } from '../../services';
import { formatCurrency } from '../../utils/formatters';

/**
 * Dialog to view and manage a user's course enrollments
 */
function UserEnrollmentsDialog({
  open,
  user,
  onClose,
  onUnenroll,
  onComplete,
  onRefresh,
}) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user?.id) {
      loadEnrollments();
    }
  }, [open, user?.id]);

  const loadEnrollments = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await adminService.getUserEnrollments(user.id);
      setEnrollments(data);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to unenroll this user from the course?')) {
      return;
    }

    await onUnenroll?.(enrollmentId);
    loadEnrollments();
    onRefresh?.();
  };

  const handleComplete = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to mark this enrollment as complete?')) {
      return;
    }

    await onComplete?.(enrollmentId);
    loadEnrollments();
    onRefresh?.();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'ENROLLED':
        return 'primary';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">User Enrollments</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.name} ({user?.email})
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <LoadingSpinner text="Loading enrollments..." />
        ) : enrollments.length === 0 ? (
          <EmptyState
            title="No enrollments"
            description="This user is not enrolled in any courses"
          />
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Course</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Enrolled At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <TableRow key={enrollment.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {enrollment.courseName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={enrollment.status}
                        size="small"
                        color={getStatusColor(enrollment.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {enrollment.coursePrice
                          ? formatCurrency(enrollment.coursePrice)
                          : 'Free'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(enrollment.enrolledAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {enrollment.status !== 'COMPLETED' && (
                        <Tooltip title="Mark Complete">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleComplete(enrollment.id)}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Unenroll">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleUnenroll(enrollment.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserEnrollmentsDialog;
