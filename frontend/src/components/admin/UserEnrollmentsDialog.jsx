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
  TextField,
  Alert,
  Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PublishIcon from '@mui/icons-material/Publish';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Button, LoadingSpinner, EmptyState } from '../common';
import { adminService } from '../../services';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../store';

/**
 * Dialog to view and manage a user's course enrollments
 * Includes marks entry, result publishing, and certificate generation
 */
function UserEnrollmentsDialog({
  open,
  user,
  onClose,
  onUnenroll,
  onComplete,
  onRefresh,
}) {
  const { showSuccess, showError } = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMarks, setEditingMarks] = useState(null); // enrollment ID being edited
  const [marksValue, setMarksValue] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // track which action is loading

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

  const handleStartEditMarks = (enrollment) => {
    setEditingMarks(enrollment.id);
    setMarksValue(enrollment.marks !== null ? enrollment.marks.toString() : '');
  };

  const handleCancelEditMarks = () => {
    setEditingMarks(null);
    setMarksValue('');
  };

  const handleSaveMarks = async (enrollmentId) => {
    const marks = parseFloat(marksValue);
    if (isNaN(marks) || marks < 0 || marks > 100) {
      showError('Please enter a valid marks value between 0 and 100');
      return;
    }

    setActionLoading(`marks-${enrollmentId}`);
    try {
      await adminService.updateEnrollmentMarks(enrollmentId, marks);
      showSuccess('Marks updated successfully');
      setEditingMarks(null);
      setMarksValue('');
      loadEnrollments();
    } catch (error) {
      showError(error.message || 'Failed to update marks');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublishResult = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to publish the result? The user will be able to see their marks.')) {
      return;
    }

    setActionLoading(`publish-${enrollmentId}`);
    try {
      await adminService.publishResult(enrollmentId);
      showSuccess('Result published successfully');
      loadEnrollments();
    } catch (error) {
      showError(error.message || 'Failed to publish result');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateCertificate = async (enrollmentId) => {
    setActionLoading(`cert-${enrollmentId}`);
    try {
      await adminService.generateCertificate(enrollmentId);
      showSuccess('Certificate generated successfully');
      loadEnrollments();
    } catch (error) {
      showError(error.message || 'Failed to generate certificate');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpandRow = (enrollmentId) => {
    setExpandedRow(expandedRow === enrollmentId ? null : enrollmentId);
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
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
                  <TableCell width={40}></TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Marks</TableCell>
                  <TableCell align="center">Certificate</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map((enrollment) => (
                  <React.Fragment key={enrollment.id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleExpandRow(enrollment.id)}
                        >
                          {expandedRow === enrollment.id ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ExpandMoreIcon fontSize="small" />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {enrollment.courseName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {enrollment.coursePrice
                            ? formatCurrency(enrollment.coursePrice)
                            : 'Free'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={enrollment.status}
                          size="small"
                          color={getStatusColor(enrollment.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {editingMarks === enrollment.id ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                            <TextField
                              size="small"
                              type="number"
                              value={marksValue}
                              onChange={(e) => setMarksValue(e.target.value)}
                              inputProps={{ min: 0, max: 100, step: 0.1 }}
                              sx={{ width: 80 }}
                              placeholder="0-100"
                            />
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleSaveMarks(enrollment.id)}
                              disabled={actionLoading === `marks-${enrollment.id}`}
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={handleCancelEditMarks}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                            {enrollment.marks !== null ? (
                              <Chip
                                label={`${enrollment.marks}%`}
                                size="small"
                                color={enrollment.passed ? 'success' : 'warning'}
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                            <Tooltip title="Edit Marks">
                              <IconButton
                                size="small"
                                onClick={() => handleStartEditMarks(enrollment)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {enrollment.hasCertificate ? (
                          <Chip
                            label={enrollment.certificateType || 'Generated'}
                            size="small"
                            color="success"
                            icon={<CardMembershipIcon />}
                          />
                        ) : enrollment.canGenerateCertificate ? (
                          <Tooltip title="Generate Certificate">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleGenerateCertificate(enrollment.id)}
                              disabled={actionLoading === `cert-${enrollment.id}`}
                            >
                              <CardMembershipIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          {enrollment.marks !== null && !enrollment.resultPublishedAt && (
                            <Tooltip title="Publish Result">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handlePublishResult(enrollment.id)}
                                disabled={actionLoading === `publish-${enrollment.id}`}
                              >
                                <PublishIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
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
                        </Box>
                      </TableCell>
                    </TableRow>
                    {/* Expanded Details Row */}
                    <TableRow>
                      <TableCell colSpan={6} sx={{ py: 0, borderBottom: expandedRow === enrollment.id ? undefined : 'none' }}>
                        <Collapse in={expandedRow === enrollment.id} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, px: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Enrollment Details
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Enrolled At
                                </Typography>
                                <Typography variant="body2">
                                  {formatDate(enrollment.enrolledAt)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Test Completed At
                                </Typography>
                                <Typography variant="body2">
                                  {formatDate(enrollment.testCompletedAt)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Result Published At
                                </Typography>
                                <Typography variant="body2">
                                  {enrollment.resultPublishedAt ? (
                                    formatDate(enrollment.resultPublishedAt)
                                  ) : (
                                    <Chip label="Not Published" size="small" color="warning" />
                                  )}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Pass Mark
                                </Typography>
                                <Typography variant="body2">
                                  {enrollment.passMarkPercentage}%
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Certificate Type
                                </Typography>
                                <Typography variant="body2">
                                  {enrollment.certificateType || '-'}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Certificate ID
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                  {enrollment.certificateId || '-'}
                                </Typography>
                              </Box>
                            </Box>

                            {enrollment.hasTestLink && (
                              <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                  <strong>Test Link:</strong>{' '}
                                  <a href={enrollment.testLink} target="_blank" rel="noopener noreferrer">
                                    {enrollment.testLink}
                                  </a>
                                </Typography>
                                {enrollment.testDescription && (
                                  <Typography variant="body2" sx={{ mt: 1 }}>
                                    {enrollment.testDescription}
                                  </Typography>
                                )}
                              </Alert>
                            )}

                            {/* Action workflow guide */}
                            {!enrollment.hasCertificate && (
                              <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Certificate Generation Workflow:
                                </Typography>
                                <ol style={{ margin: 0, paddingLeft: 20 }}>
                                  <li style={{ color: enrollment.marks !== null ? 'green' : 'inherit' }}>
                                    Enter marks for the student {enrollment.marks !== null && '✓'}
                                  </li>
                                  <li style={{ color: enrollment.resultPublishedAt ? 'green' : 'inherit' }}>
                                    Publish the result (makes marks visible to student) {enrollment.resultPublishedAt && '✓'}
                                  </li>
                                  <li style={{ color: enrollment.hasCertificate ? 'green' : 'inherit' }}>
                                    Generate certificate (based on pass/fail status)
                                  </li>
                                </ol>
                              </Alert>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
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
