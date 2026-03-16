import React, { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
  Alert,
  Collapse,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PublishIcon from '@mui/icons-material/Publish';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Button, LoadingSpinner, EmptyState } from '../common';
import { adminService } from '../../services';
import api from '../../services/api';
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
  const [trainerNameValue, setTrainerNameValue] = useState(''); // trainer name for certificate
  const [expandedRow, setExpandedRow] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // track which action is loading
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadEnrollmentId, setUploadEnrollmentId] = useState(null);
  const [uploadCertType, setUploadCertType] = useState('COMPLETION');
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishEnrollmentId, setPublishEnrollmentId] = useState(null);
  const fileInputRef = useRef(null);

  // Grant Access dialog state
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [grantType, setGrantType] = useState('course'); // 'course' | 'flagship' | 'bundle'
  const [grantItemId, setGrantItemId] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantLists, setGrantLists] = useState({ courses: [], flagship: [], bundles: [] });
  const [grantListsLoading, setGrantListsLoading] = useState(false);

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
    if (!window.confirm('Are you sure you want to unenroll this user?')) {
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
    // Use existing trainer name or default to course trainer
    setTrainerNameValue(enrollment.trainerName || enrollment.defaultTrainerName || '');
  };

  const handleCancelEditMarks = () => {
    setEditingMarks(null);
    setMarksValue('');
    setTrainerNameValue('');
  };

  const handleSaveMarks = async (enrollmentId) => {
    const marks = parseFloat(marksValue);
    if (isNaN(marks) || marks < 0 || marks > 100) {
      showError('Please enter a valid marks value between 0 and 100');
      return;
    }

    setActionLoading(`marks-${enrollmentId}`);
    try {
      // Send trainer name along with marks (null/empty will use course default)
      await adminService.updateEnrollmentMarks(enrollmentId, marks, trainerNameValue || null);
      showSuccess('Marks updated successfully');
      setEditingMarks(null);
      setMarksValue('');
      setTrainerNameValue('');
      loadEnrollments();
    } catch (error) {
      showError(error.message || 'Failed to update marks');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublishClick = (enrollmentId) => {
    setPublishEnrollmentId(enrollmentId);
    setPublishDialogOpen(true);
  };

  const handlePublishCancel = () => {
    setPublishDialogOpen(false);
    setPublishEnrollmentId(null);
  };

  const handlePublishConfirm = async () => {
    setPublishDialogOpen(false);
    if (!publishEnrollmentId) return;

    setActionLoading(`publish-${publishEnrollmentId}`);
    try {
      await adminService.publishResult(publishEnrollmentId);
      showSuccess('Result published successfully');
      loadEnrollments();
    } catch (error) {
      showError(error.message || 'Failed to publish result');
    } finally {
      setActionLoading(null);
      setPublishEnrollmentId(null);
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

  const handlePreviewCertificate = async (enrollmentId) => {
    setActionLoading(`preview-${enrollmentId}`);
    try {
      await adminService.previewCertificate(enrollmentId);
    } catch (error) {
      showError(error.message || 'Failed to preview certificate');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUploadClick = (enrollmentId) => {
    setUploadEnrollmentId(enrollmentId);
    setUploadCertType('COMPLETION');
    setUploadDialogOpen(true);
  };

  const handleUploadDialogConfirm = () => {
    setUploadDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleUploadDialogCancel = () => {
    setUploadDialogOpen(false);
    setUploadEnrollmentId(null);
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadEnrollmentId) return;

    if (file.type !== 'application/pdf') {
      showError('Only PDF files are accepted');
      return;
    }

    setActionLoading(`upload-${uploadEnrollmentId}`);
    try {
      await adminService.uploadCertificate(uploadEnrollmentId, file, uploadCertType);
      showSuccess('Certificate uploaded successfully');
      loadEnrollments();
    } catch (error) {
      showError(error.response?.data?.error || error.message || 'Failed to upload certificate');
    } finally {
      setActionLoading(null);
      setUploadEnrollmentId(null);
    }
  };

  const toggleExpandRow = (enrollmentId) => {
    setExpandedRow(expandedRow === enrollmentId ? null : enrollmentId);
  };

  const openGrantDialog = async () => {
    setGrantItemId('');
    setGrantType('course');
    setGrantDialogOpen(true);
    setGrantListsLoading(true);
    try {
      const [courses, flagship, bundles] = await Promise.all([
        api.get('/api/courses/admin').then((r) => r.data),
        api.get('/api/flagship/admin').then((r) => r.data),
        api.get('/api/bundles/admin').then((r) => r.data),
      ]);
      setGrantLists({ courses, flagship, bundles });
    } catch {
      showError('Failed to load available items');
    } finally {
      setGrantListsLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!grantItemId) return;
    setGrantLoading(true);
    try {
      const payload =
        grantType === 'course'
          ? { courseId: Number(grantItemId) }
          : grantType === 'flagship'
          ? { flagshipProgramId: Number(grantItemId) }
          : { bundleId: Number(grantItemId) };

      const result = await adminService.grantAccess(user.id, payload);
      const count = result.enrollmentCount ?? 1;
      showSuccess(`Access granted successfully (${count} enrollment${count !== 1 ? 's' : ''} created)`);
      setGrantDialogOpen(false);
      setGrantItemId('');
      loadEnrollments();
      onRefresh?.();
    } catch (err) {
      showError(err?.response?.data?.message || err.message || 'Failed to grant access');
    } finally {
      setGrantLoading(false);
    }
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
    <Dialog open={open} onClose={(e, reason) => { if (reason !== 'backdropClick') onClose(e, reason); }} disableEscapeKeyDown maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">User Enrollments</Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.name} ({user?.email})
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddCircleOutlineIcon />}
            onClick={openGrantDialog}
            sx={{ ml: 2, flexShrink: 0 }}
          >
            Grant Access
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <LoadingSpinner text="Loading enrollments..." />
        ) : enrollments.length === 0 ? (
          <EmptyState
            title="No enrollments"
            description="This user is not enrolled in any courses or flagship programs"
          />
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={40}></TableCell>
                  <TableCell>Course / Program</TableCell>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {enrollment.courseName}
                          </Typography>
                          {enrollment.isFlagship && (
                            <Chip
                              label="Flagship"
                              size="small"
                              color="secondary"
                              icon={<StarIcon />}
                              sx={{ height: 18, fontSize: '0.65rem' }}
                            />
                          )}
                        </Box>
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
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TextField
                                size="small"
                                type="number"
                                value={marksValue}
                                onChange={(e) => setMarksValue(e.target.value)}
                                inputProps={{ min: 0, max: 100, step: 'any' }}
                                sx={{ width: 80 }}
                                placeholder="0-100"
                                label="Marks"
                              />
                              <TextField
                                size="small"
                                value={trainerNameValue}
                                onChange={(e) => setTrainerNameValue(e.target.value)}
                                sx={{ width: 150 }}
                                placeholder="Trainer name"
                                label="Trainer"
                                helperText={enrollment.defaultTrainerName ? `Default: ${enrollment.defaultTrainerName}` : ''}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
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
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                              <Tooltip title="Edit Marks & Trainer">
                                <IconButton
                                  size="small"
                                  onClick={() => handleStartEditMarks(enrollment)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            {(enrollment.trainerName || enrollment.defaultTrainerName) && (
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                                {enrollment.trainerName || enrollment.defaultTrainerName}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                          {enrollment.hasCertificate && (
                            <>
                              <Chip
                                label={enrollment.certificateType || 'Generated'}
                                size="small"
                                color="success"
                                icon={<CardMembershipIcon />}
                              />
                              <Tooltip title="View Certificate">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handlePreviewCertificate(enrollment.id)}
                                  disabled={actionLoading === `preview-${enrollment.id}`}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {enrollment.canGenerateCertificate && (
                            <Tooltip title={enrollment.hasCertificate ? "Regenerate Certificate" : "Generate Certificate"}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleGenerateCertificate(enrollment.id)}
                                disabled={actionLoading === `cert-${enrollment.id}`}
                              >
                                <CardMembershipIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title={enrollment.hasCertificate ? "Replace Certificate (Upload PDF)" : "Upload Certificate PDF"}>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleUploadClick(enrollment.id)}
                              disabled={actionLoading === `upload-${enrollment.id}`}
                            >
                              <UploadFileIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, alignItems: 'center' }}>
                          {enrollment.resultPublishedAt ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Chip
                                label="Published"
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                              {enrollment.marks !== null && enrollment.hasCertificate && (
                                <Tooltip title="Re-publish Result">
                                  <IconButton
                                    size="small"
                                    color="info"
                                    onClick={() => handlePublishClick(enrollment.id)}
                                    disabled={actionLoading === `publish-${enrollment.id}`}
                                  >
                                    <PublishIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          ) : (
                            <>
                              {enrollment.marks !== null && enrollment.hasCertificate && (
                                <Tooltip title="Publish Result">
                                  <IconButton
                                    size="small"
                                    color="info"
                                    onClick={() => handlePublishClick(enrollment.id)}
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
                            </>
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
                          <Box sx={{ py: 2, px: 2, bgcolor: 'action.hover' }}>
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
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Trainer (for Certificate)
                                </Typography>
                                <Typography variant="body2">
                                  {enrollment.trainerName || enrollment.defaultTrainerName || '-'}
                                  {enrollment.trainerName && enrollment.trainerName !== enrollment.defaultTrainerName && (
                                    <Chip label="Custom" size="small" sx={{ ml: 1 }} />
                                  )}
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
                            {!enrollment.resultPublishedAt && (
                              <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Certificate Workflow:
                                </Typography>
                                <ol style={{ margin: 0, paddingLeft: 20 }}>
                                  <li style={{ color: enrollment.marks !== null ? 'green' : 'inherit' }}>
                                    Enter marks & trainer name {enrollment.marks !== null && '✓'}
                                  </li>
                                  <li style={{ color: enrollment.hasCertificate ? 'green' : 'inherit' }}>
                                    Generate or upload certificate {enrollment.hasCertificate && '✓'}
                                  </li>
                                  <li style={{ color: enrollment.hasCertificate ? 'inherit' : '#999' }}>
                                    Preview certificate (click the eye icon)
                                  </li>
                                  <li style={{ color: '#999' }}>
                                    Publish result (makes result visible to user)
                                  </li>
                                </ol>
                              </Alert>
                            )}
                            {enrollment.resultPublishedAt && (
                              <Alert severity="success" sx={{ mt: 2 }}>
                                Result published on {formatDate(enrollment.resultPublishedAt)}. You can still edit marks, trainer name, and regenerate or upload certificates.
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
      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      {/* Publish Result Confirmation Dialog */}
      <Dialog open={publishDialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') handlePublishCancel(); }} disableEscapeKeyDown maxWidth="xs" fullWidth>
        <DialogTitle>Publish Result</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Publishing makes the result visible to the user.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to publish the result? This will:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2, '& li': { mb: 0.5 } }}>
            <Typography component="li" variant="body2">Allow the user to see their marks and download the certificate</Typography>
            <Typography component="li" variant="body2">You can still edit marks, trainer name, and regenerate certificates after publishing</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePublishCancel}>Cancel</Button>
          <Button onClick={handlePublishConfirm} variant="contained" color="warning">
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Grant Access Dialog */}
      <Dialog open={grantDialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') { setGrantDialogOpen(false); setGrantItemId(''); } }} disableEscapeKeyDown maxWidth="sm" fullWidth>
        <DialogTitle>Grant Enrollment Access</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Grant <strong>{user?.name}</strong> access to a course, flagship program, or bundle — same as a completed payment. An enrollment confirmation email will be sent.
          </Typography>

          {/* Type selector */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Access Type</InputLabel>
            <Select
              value={grantType}
              onChange={(e) => { setGrantType(e.target.value); setGrantItemId(''); }}
              label="Access Type"
            >
              <MenuItem value="course">Course</MenuItem>
              <MenuItem value="flagship">Flagship Program</MenuItem>
              <MenuItem value="bundle">Bundle</MenuItem>
            </Select>
          </FormControl>

          {/* Item picker */}
          {grantListsLoading ? (
            <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={24} /></Box>
          ) : (
            <FormControl fullWidth size="small">
              <InputLabel>
                {grantType === 'course' ? 'Select Course' : grantType === 'flagship' ? 'Select Flagship Program' : 'Select Bundle'}
              </InputLabel>
              <Select
                value={grantItemId}
                onChange={(e) => setGrantItemId(e.target.value)}
                label={grantType === 'course' ? 'Select Course' : grantType === 'flagship' ? 'Select Flagship Program' : 'Select Bundle'}
              >
                {grantType === 'course' && grantLists.courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>
                ))}
                {grantType === 'flagship' && grantLists.flagship.map((f) => (
                  <MenuItem key={f.id} value={f.id}>{f.title}</MenuItem>
                ))}
                {grantType === 'bundle' && grantLists.bundles.map((b) => (
                  <MenuItem key={b.id} value={b.id}>{b.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {grantType === 'bundle' && grantItemId && (
            <Alert severity="info" sx={{ mt: 1.5 }}>
              The user will be enrolled in all courses within this bundle.
            </Alert>
          )}
          {grantType === 'flagship' && grantItemId && (
            <Alert severity="info" sx={{ mt: 1.5 }}>
              The user will be enrolled in the flagship program and all its linked courses.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setGrantDialogOpen(false); setGrantItemId(''); }} disabled={grantLoading}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleGrantAccess}
            disabled={!grantItemId || grantLoading || grantListsLoading}
            startIcon={grantLoading ? <CircularProgress size={14} color="inherit" /> : <AddCircleOutlineIcon />}
          >
            {grantLoading ? 'Granting…' : 'Grant Access'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Certificate Type Dialog */}
      <Dialog open={uploadDialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') handleUploadDialogCancel(); }} disableEscapeKeyDown maxWidth="xs" fullWidth>
        <DialogTitle>Upload Certificate</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the certificate type, then choose a PDF file to upload.
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Certificate Type</InputLabel>
            <Select
              value={uploadCertType}
              onChange={(e) => setUploadCertType(e.target.value)}
              label="Certificate Type"
            >
              <MenuItem value="COMPLETION">Completion</MenuItem>
              <MenuItem value="PARTICIPATION">Participation</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogCancel}>Cancel</Button>
          <Button onClick={handleUploadDialogConfirm} variant="contained" color="primary">
            Choose File
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

export default UserEnrollmentsDialog;
