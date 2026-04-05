import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Autocomplete,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Button, Breadcrumb, LoadingSpinner, SEO } from '../components/common';
import { useAuth, useToast, useConfig } from '../store';
import { formatCurrency } from '../utils/formatters';
import { ROUTES, SUPPORTED_COUNTRIES, IMAGES } from '../utils/constants';
import { getApiBaseUrl } from '../services/api';
import * as bundleService from '../services/bundleService';

function BundleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const { getImage, getCategoryLabel } = useConfig();

  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [warningDialog, setWarningDialog] = useState({ open: false, message: '', order: null });
  const [allOwnedDialog, setAllOwnedDialog] = useState({ open: false, message: '' });

  useEffect(() => {
    const loadBundle = async () => {
      setLoading(true);
      try {
        const data = await bundleService.getBundleBySlug(slug);
        setBundle(data);
      } catch (error) {
        showError('Failed to load value pack details');
        navigate(ROUTES.COURSES);
      } finally {
        setLoading(false);
      }
    };
    loadBundle();
  }, [slug, showError, navigate]);

  const handleEnroll = async () => {
    if (!isAuthenticated()) {
      setEnrolling(true);
      try {
        const result = await bundleService.startAnonMultiBundleEnrollment([bundle.id], selectedCountry, null);
        const order = result?.order;
        if (order) {
          navigate(ROUTES.PAYMENT, {
            state: {
              bundleIds: [bundle.id],
              courseName: bundle.title,
              order,
              anonymous: true,
            },
          });
        }
      } catch (error) {
        showError(error.response?.data?.message || error.message || 'Failed to start enrollment');
      } finally {
        setEnrolling(false);
      }
      return;
    }

    setEnrolling(true);
    try {
      const result = await bundleService.startBundleEnrollment(bundle.id, selectedCountry);

      if (result.allOwned) {
        setAllOwnedDialog({ open: true, message: result.message || 'You already own all courses in this value pack.' });
        setEnrolling(false);
        return;
      }

      if (result.alreadyOwnedCourses?.length > 0) {
        setWarningDialog({ open: true, message: result.message, order: result.order });
        setEnrolling(false);
        return;
      }

      navigateToPayment(result.order);
    } catch (error) {
      showError(error.message || 'Failed to start enrollment');
      setEnrolling(false);
    }
  };

  const navigateToPayment = (order) => {
    setEnrolling(false);
    setWarningDialog({ open: false, message: '', order: null });
    navigate(ROUTES.PAYMENT, {
      state: {
        bundleId: bundle.id,
        bundleName: bundle.title,
        courseName: bundle.title,
        order,
      },
    });
  };

  const getDisplayPrice = () => {
    if (!bundle) return { amount: null, currency: 'USD' };
    if (selectedCountry === 'IN') return { amount: bundle.price, currency: 'INR' };
    const cp = bundle.countryPrices?.find((p) => p.countryCode === selectedCountry);
    if (cp) return { amount: cp.amount, currency: cp.currencyCode };
    return { amount: bundle.price, currency: 'INR' };
  };

  // Original price = sum of individual course prices for the selected country
  const getOriginalDisplayPrice = () => {
    const courses = bundle.courses || [];
    if (courses.length === 0) return null;

    const dp = getDisplayPrice();

    if (selectedCountry === 'IN') {
      const total = courses.reduce((sum, c) => sum + (c.price || 0), 0);
      return total > dp.amount ? { amount: Math.round(total), currency: 'INR' } : null;
    }

    // Non-INR: sum each course's stored price for the selected country
    const bundleCp = bundle.countryPrices?.find((p) => p.countryCode === selectedCountry);
    if (!bundleCp) return null;

    const total = courses.reduce((sum, c) => {
      const cp = c.countryPrices?.find((p) => p.countryCode === selectedCountry);
      return sum + (cp ? cp.amount : 0);
    }, 0);

    if (total <= 0 || total <= bundleCp.amount) return null;
    return { amount: Math.round(total * 100) / 100, currency: bundleCp.currencyCode };
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading bundle..." />;
  if (!bundle) return null;

  const displayPrice = getDisplayPrice();
  const originalPrice = getOriginalDisplayPrice();
  const apiBase = getApiBaseUrl();
  const hasCountryPrices = bundle.countryPrices?.length > 0;
  const bundleCourses = bundle.courses || [];
  const totalDuration = bundleCourses.reduce((sum, c) => sum + (c.durationHours || 0), 0);

  const breadcrumbItems = [
    { label: 'Courses', path: ROUTES.COURSES },
    { label: bundle.title },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title={`${bundle.title} - Value Pack`}
        description={bundle.description || `Save ${bundle.savingsPercent}% with this value pack. Includes ${bundleCourses.length} courses.`}
        path={`/bundles/${bundle.slug || slug}`}
      />
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero banner */}
      <Paper
        sx={{
          mb: 4,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Bundle thumbnail if set, otherwise course image mosaic */}
        <Box sx={{ display: 'flex', height: { xs: 160, md: 220 }, overflow: 'hidden' }}>
          {bundle.thumbnailImageUrl ? (
            <Box
              component="img"
              src={`${apiBase}${bundle.thumbnailImageUrl}`}
              alt={bundle.title}
              sx={{ width: '100%', objectFit: 'cover', height: '100%', filter: 'brightness(0.7)' }}
            />
          ) : (
            bundleCourses.slice(0, 4).map((course, idx) => {
              const imgPath = course.thumbnailImageUrl;
              const imgUrl = imgPath ? `${apiBase}${imgPath}` : getImage('COURSE_PLACEHOLDER', IMAGES.COURSE_PLACEHOLDER);
              return (
                <Box
                  key={course.id}
                  component="img"
                  src={imgUrl}
                  alt={course.title}
                  sx={{
                    flex: 1,
                    objectFit: 'cover',
                    height: '100%',
                    borderRight: idx < bundleCourses.slice(0, 4).length - 1 ? '3px solid' : 'none',
                    borderColor: 'background.paper',
                    filter: 'brightness(0.7)',
                  }}
                />
              );
            })
          )}
          {/* Overlay with bundle info */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: { xs: 2, md: 3 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {bundle.savingsPercent > 0 && (
                <Chip
                  icon={<LocalOfferIcon />}
                  label={`Save ${bundle.savingsPercent}%`}
                  color="error"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
              <Chip
                icon={<SchoolIcon />}
                label={`${bundleCourses.length} Courses`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '& .MuiChip-icon': { color: 'white' } }}
              />
              {totalDuration > 0 && (
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`${totalDuration} Hours`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '& .MuiChip-icon': { color: 'white' } }}
                />
              )}
            </Box>
            <Typography variant="h4" component="h1" fontWeight={700} sx={{ color: 'white' }}>
              {bundle.title}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Left: Bundle Details */}
        <Grid item xs={12} md={8}>
          {bundle.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {bundle.description}
            </Typography>
          )}

          {/* What's Included */}
          <Typography variant="h5" fontWeight={600} gutterBottom>
            What's Included
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            {bundleCourses.map((course, idx) => {
              const imgPath = course.thumbnailImageUrl;
              const imgUrl = imgPath ? `${apiBase}${imgPath}` : getImage('COURSE_PLACEHOLDER', IMAGES.COURSE_PLACEHOLDER);
              return (
                <Card
                  key={course.id}
                  variant="outlined"
                  sx={{
                    display: 'flex',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 2, borderColor: 'primary.main' },
                    overflow: 'hidden',
                  }}
                  onClick={() => navigate(ROUTES.COURSE_DETAIL(course.slug || course.id))}
                >
                  <CardMedia
                    component="img"
                    image={imgUrl}
                    alt={course.title}
                    sx={{ width: { xs: 100, sm: 160 }, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <CardContent sx={{ flex: 1, py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {course.title}
                        </Typography>
                        {course.shortDescription && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              mb: 1,
                            }}
                          >
                            {course.shortDescription}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                          {course.categories?.[0] && (
                            <Chip label={getCategoryLabel(course.categories[0])} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                          )}
                          {course.durationHours > 0 && (
                            <Chip
                              icon={<AccessTimeIcon sx={{ fontSize: 12 }} />}
                              label={`${course.durationHours}h`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22, fontSize: '0.7rem' }}
                            />
                          )}
                          {course.courseType && (
                            <Chip label={course.courseType.replace('_', ' ')} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                      </Box>
                      {course.price > 0 && (() => {
                        // Show course individual price in selected country's currency
                        const ccp = course.countryPrices?.find((p) => p.countryCode === selectedCountry);
                        const courseAmt = (selectedCountry !== 'IN' && ccp) ? ccp.amount : course.price;
                        const courseCur = (selectedCountry !== 'IN' && ccp) ? ccp.currencyCode : 'INR';
                        return (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through', whiteSpace: 'nowrap', ml: 1 }}
                          >
                            {formatCurrency(courseAmt, courseCur)}
                          </Typography>
                        );
                      })()}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* Why this bundle */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Why choose this value pack?
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {originalPrice && originalPrice.amount > displayPrice.amount && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleOutlineIcon color="success" fontSize="small" />
                  <Typography variant="body2">
                    Save {formatCurrency(originalPrice.amount - displayPrice.amount, displayPrice.currency)} compared to buying individually
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleOutlineIcon color="success" fontSize="small" />
                <Typography variant="body2">
                  Access all {bundleCourses.length} courses with a single payment
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleOutlineIcon color="success" fontSize="small" />
                <Typography variant="body2">
                  Earn certificates for each course upon completion
                </Typography>
              </Box>
              {totalDuration > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleOutlineIcon color="success" fontSize="small" />
                  <Typography variant="body2">
                    {totalDuration} hours of comprehensive learning content
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right: Sticky Price Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 80, borderRadius: 2 }}>
            {/* Mini course avatars */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 48, height: 48, border: '2px solid', borderColor: 'background.paper' } }}>
                {bundleCourses.map((course) => {
                  const imgPath = course.thumbnailImageUrl;
                  const imgUrl = imgPath ? `${apiBase}${imgPath}` : undefined;
                  return (
                    <Avatar key={course.id} src={imgUrl} alt={course.title}>
                      {course.title?.[0]}
                    </Avatar>
                  );
                })}
              </AvatarGroup>
            </Box>

            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
              {bundleCourses.length} courses included
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Price */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h3" fontWeight={700} color="primary">
                {formatCurrency(displayPrice.amount, displayPrice.currency)}
              </Typography>
              {originalPrice && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 0.5 }}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {formatCurrency(originalPrice.amount, originalPrice.currency)}
                  </Typography>
                  {bundle.savingsPercent > 0 && (
                    <Chip label={`${bundle.savingsPercent}% OFF`} color="error" size="small" sx={{ fontWeight: 700 }} />
                  )}
                </Box>
              )}
            </Box>

            {/* Country selector */}
            {hasCountryPrices && (
              <Autocomplete
                size="small"
                options={SUPPORTED_COUNTRIES}
                getOptionLabel={(option) => `${option.name} (${option.currency})`}
                value={SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountry) || null}
                onChange={(_, newVal) => setSelectedCountry(newVal?.code || 'IN')}
                renderInput={(params) => <TextField {...params} label="Select your country" />}
                sx={{ mb: 2 }}
              />
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleEnroll}
              loading={enrolling}
              disabled={enrolling}
              sx={{ mb: 1.5, py: 1.5, fontWeight: 700, fontSize: '1rem' }}
            >
              Enroll & Get Certified
            </Button>

            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
              One-time payment. Lifetime access to all courses.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog: All courses already owned */}
      <Dialog open={allOwnedDialog.open} onClose={(e, reason) => { if (reason !== 'backdropClick') setAllOwnedDialog({ open: false, message: '' }); }} disableEscapeKeyDown>
        <DialogTitle>Already Enrolled in All Courses</DialogTitle>
        <DialogContent>
          <DialogContentText>{allOwnedDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAllOwnedDialog({ open: false, message: '' })}>Close</Button>
          <Button variant="contained" onClick={() => navigate(ROUTES.MY_COURSES)}>Go to My Courses</Button>
        </DialogActions>
      </Dialog>

      {/* Warning Dialog for already-owned courses */}
      <Dialog open={warningDialog.open} onClose={(e, reason) => { if (reason !== 'backdropClick') setWarningDialog({ open: false, message: '', order: null }); }} disableEscapeKeyDown>
        <DialogTitle>Some Courses Already Owned</DialogTitle>
        <DialogContent>
          <DialogContentText>{warningDialog.message}</DialogContentText>
          <Alert severity="info" sx={{ mt: 2 }}>
            The value pack price remains the same. You will get access to the remaining courses.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarningDialog({ open: false, message: '', order: null })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => navigateToPayment(warningDialog.order)}
          >
            Proceed to Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default BundleDetail;
