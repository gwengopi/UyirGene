import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Tooltip,
  Alert,
  Rating,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SaveIcon from '@mui/icons-material/Save';
import { Button, LoadingSpinner } from '../common';
import { reviewService, configService } from '../../services';
import { useToast } from '../../store';

const initialFormState = {
  authorName: '',
  rating: 5,
  reviewText: '',
  relativeTimeDescription: '',
  profilePhotoUrl: '',
  active: true,
};

function GoogleReviewManager() {
  const { showSuccess, showError } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  // Config state
  const [configLoading, setConfigLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [googleReviewLink, setGoogleReviewLink] = useState({ id: null, value: '' });
  const [googlePlaceId, setGooglePlaceId] = useState({ id: null, value: '' });
  const [googleApiKey, setGoogleApiKey] = useState({ id: null, value: '' });

  // Load reviews
  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAllReviewsAdmin();
      setReviews(data);
    } catch (error) {
      showError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Load config
  const loadConfig = async () => {
    setConfigLoading(true);
    try {
      const allConfigs = await configService.getAllConfigs();
      const reviewConfigs = allConfigs.filter((c) => c.category === 'REVIEW');

      const linkConfig = reviewConfigs.find((c) => c.key === 'GOOGLE_REVIEW_LINK');
      const placeConfig = reviewConfigs.find((c) => c.key === 'GOOGLE_PLACE_ID');
      const apiKeyConfig = reviewConfigs.find((c) => c.key === 'GOOGLE_API_KEY');

      if (linkConfig) setGoogleReviewLink({ id: linkConfig.id, value: linkConfig.value || '' });
      if (placeConfig) setGooglePlaceId({ id: placeConfig.id, value: placeConfig.value || '' });
      if (apiKeyConfig) setGoogleApiKey({ id: apiKeyConfig.id, value: apiKeyConfig.value || '' });
    } catch (error) {
      showError('Failed to load review configuration');
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    loadReviews();
  }, []);

  // Save config
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      if (googleReviewLink.id) {
        await configService.updateConfig(googleReviewLink.id, { value: googleReviewLink.value });
      }
      if (googlePlaceId.id) {
        await configService.updateConfig(googlePlaceId.id, { value: googlePlaceId.value });
      }
      if (googleApiKey.id) {
        await configService.updateConfig(googleApiKey.id, { value: googleApiKey.value });
      }
      showSuccess('Configuration saved successfully');
    } catch (error) {
      showError('Failed to save configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  // Fetch from Google
  const handleFetchFromGoogle = async () => {
    if (!googlePlaceId.value || !googleApiKey.value) {
      showError('Please configure and save Google Place ID and API Key first');
      return;
    }
    setFetching(true);
    try {
      const data = await reviewService.fetchFromGoogle();
      showSuccess(`Fetched ${data.length} reviews from Google`);
      loadReviews();
    } catch (error) {
      showError(error.response?.data?.message || error.response?.data || 'Failed to fetch from Google');
    } finally {
      setFetching(false);
    }
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Open dialog for create/edit
  const handleOpenDialog = (review = null) => {
    if (review) {
      setSelectedReview(review);
      setFormData({
        authorName: review.authorName || '',
        rating: review.rating || 5,
        reviewText: review.reviewText || '',
        relativeTimeDescription: review.relativeTimeDescription || '',
        profilePhotoUrl: review.profilePhotoUrl || '',
        active: review.active,
      });
    } else {
      setSelectedReview(null);
      setFormData(initialFormState);
    }
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedReview(null);
    setFormData(initialFormState);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!formData.authorName.trim() || !formData.reviewText.trim()) {
      showError('Author name and review text are required');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedReview) {
        await reviewService.updateReview(selectedReview.id, formData);
        showSuccess('Review updated successfully');
      } else {
        await reviewService.createReview(formData);
        showSuccess('Review created successfully');
      }
      handleCloseDialog();
      loadReviews();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save review');
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete confirmation
  const handleOpenDelete = (review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!selectedReview) return;

    setSubmitting(true);
    try {
      await reviewService.deleteReview(selectedReview.id);
      showSuccess('Review deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedReview(null);
      loadReviews();
    } catch (error) {
      showError('Failed to delete review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && configLoading) {
    return <LoadingSpinner text="Loading Google Reviews..." />;
  }

  return (
    <Box>
      {/* Configuration Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Google Review Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure your Google Business review link and API credentials to fetch reviews automatically.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Google Review Page Link"
            value={googleReviewLink.value}
            onChange={(e) => setGoogleReviewLink((prev) => ({ ...prev, value: e.target.value }))}
            placeholder="https://g.page/r/your-business/review"
            helperText="The link where users can leave a review on Google Maps"
          />

          <TextField
            fullWidth
            label="Google Place ID"
            value={googlePlaceId.value}
            onChange={(e) => setGooglePlaceId((prev) => ({ ...prev, value: e.target.value }))}
            placeholder="ChIJ..."
            helperText="Find your Place ID at: https://developers.google.com/maps/documentation/places/web-service/place-id"
          />

          <TextField
            fullWidth
            label="Google API Key"
            type="password"
            value={googleApiKey.value}
            onChange={(e) => setGoogleApiKey((prev) => ({ ...prev, value: e.target.value }))}
            placeholder="AIza..."
            helperText="Google Cloud API key with Places API enabled"
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveConfig}
              loading={savingConfig}
            >
              Save Configuration
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudDownloadIcon />}
              onClick={handleFetchFromGoogle}
              loading={fetching}
              disabled={!googlePlaceId.value || !googleApiKey.value}
            >
              Fetch Reviews from Google
            </Button>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* Reviews Section Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Reviews
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadReviews}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Review Manually
          </Button>
        </Box>
      </Box>

      {/* Reviews Table */}
      {reviews.length === 0 ? (
        <Alert severity="info">
          No reviews found. Fetch from Google or add reviews manually.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Author</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Review</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {review.authorName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Rating value={review.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>
                      {review.reviewText}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={review.source === 'GOOGLE_API' ? 'Google' : 'Manual'}
                      size="small"
                      color={review.source === 'GOOGLE_API' ? 'info' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={review.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={review.active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(review)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDelete(review)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') handleCloseDialog(); }} disableEscapeKeyDown maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedReview ? 'Edit Review' : 'Add Review Manually'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Author Name"
              name="authorName"
              value={formData.authorName}
              onChange={handleFormChange}
              required
            />

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Rating
              </Typography>
              <Rating
                name="rating"
                value={Number(formData.rating)}
                onChange={(e, newValue) =>
                  setFormData((prev) => ({ ...prev, rating: newValue || 1 }))
                }
              />
            </Box>

            <TextField
              fullWidth
              label="Review Text"
              name="reviewText"
              value={formData.reviewText}
              onChange={handleFormChange}
              required
              multiline
              rows={4}
            />

            <TextField
              fullWidth
              label="Time Description"
              name="relativeTimeDescription"
              value={formData.relativeTimeDescription}
              onChange={handleFormChange}
              placeholder="e.g., 2 months ago"
              helperText="When the review was posted"
            />

            <TextField
              fullWidth
              label="Profile Photo URL"
              name="profilePhotoUrl"
              value={formData.profilePhotoUrl}
              onChange={handleFormChange}
              placeholder="https://..."
            />

            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={formData.active}
                  onChange={handleFormChange}
                />
              }
              label="Active (visible on website)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            loading={submitting}
          >
            {selectedReview ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={(e, reason) => { if (reason !== 'backdropClick') setDeleteDialogOpen(false); }} disableEscapeKeyDown>
        <DialogTitle>Delete Review?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this review?
          </Typography>
          {selectedReview && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Review by "{selectedReview.authorName}"
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            loading={submitting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GoogleReviewManager;
