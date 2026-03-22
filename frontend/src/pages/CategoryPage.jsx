import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import { Breadcrumb, SEO, Button } from '../components/common';
import { CourseList } from '../components/course';
import { courseService, enrollmentService } from '../services';
import { getPublishedBundlesByCategory } from '../services/bundleService';
import { useAuth, useToast, useConfig } from '../store';
import { ROUTES, IMAGES } from '../utils/constants';
import { formatCurrency } from '../utils/formatters';
import { getApiBaseUrl } from '../services/api';

function CategoryPage() {
  const { categoryCode } = useParams();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const { getImage, getCategoryLabel } = useConfig();
  const navigate = useNavigate();
  // Decode URL-encoded category code (e.g. "FOOD_SAFETY")
  const categoryValue = decodeURIComponent(categoryCode);

  const [bundles, setBundles] = useState([]);
  const [categoryCourses, setCategoryCourses] = useState([]);
  const [otherCourses, setOtherCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);
  const [search, setSearch] = useState('');

  // Resolve code to human-readable label for display
  const categoryLabel = getCategoryLabel(categoryValue);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [bundlesData, categoryCoursesData, otherCoursesData] = await Promise.all([
          getPublishedBundlesByCategory(categoryValue),
          courseService.getCoursesByCategory(categoryValue, false),
          courseService.getCoursesByCategory(categoryValue, true),
        ]);
        setBundles(bundlesData);
        setCategoryCourses(categoryCoursesData);
        setOtherCourses(otherCoursesData);

        if (isAuthenticated()) {
          try {
            const enrolled = await enrollmentService.getEnrolledCourses();
            const confirmed = enrolled.filter(
              (e) => e.status === 'ENROLLED' || e.status === 'COMPLETED'
            );
            setEnrolledIds(confirmed.map((e) => e.course?.id || e.id));
          } catch {
            // Non-critical
          }
        }
      } catch {
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryValue, isAuthenticated]);

  const handleEnroll = useCallback(
    async (courseId) => {
      if (!isAuthenticated()) {
        showError('Please login to enroll in courses');
        return;
      }
      if (enrolledIds.includes(courseId)) {
        showError('You are already enrolled in this course');
        return;
      }
      setEnrollingId(courseId);
      try {
        const allCourses = [...categoryCourses, ...otherCourses];
        const result = await enrollmentService.startEnrollment(courseId);
        const order = result && (result.order ? result.order : result.orderId ? result : null);
        if (order) {
          navigate(ROUTES.PAYMENT, {
            state: {
              courseId,
              courseName: allCourses.find((c) => c.id === courseId)?.title,
              order,
            },
          });
          return;
        }
        setEnrolledIds((prev) => [...prev, courseId]);
        showSuccess('Successfully enrolled in the course!');
      } catch (err) {
        if (err.message === 'Payment cancelled') return;
        if (err.response?.status === 401) {
          showError('Session expired. Please login again.');
        } else {
          showError(err.message || 'Failed to enroll');
        }
      } finally {
        setEnrollingId(null);
      }
    },
    [isAuthenticated, enrolledIds, categoryCourses, otherCourses, showSuccess, showError, navigate]
  );

  const breadcrumbItems = [
    { label: 'Courses', path: ROUTES.COURSES },
    { label: categoryLabel },
  ];

  const apiBase = getApiBaseUrl();

  // Get bundle price for a given country (defaults to US for international display)
  const getBundleCardPrice = (bundle, country = 'US') => {
    if (!country || country === 'IN') return { amount: bundle.price, currency: 'INR' };
    const cp = bundle.countryPrices?.find((p) => p.countryCode === country);
    if (cp) return { amount: cp.amount, currency: cp.currencyCode };
    // No price for this country — fall back to US if available, else INR
    const usCp = bundle.countryPrices?.find((p) => p.countryCode === 'US');
    if (usCp) return { amount: usCp.amount, currency: usCp.currencyCode };
    return { amount: bundle.price, currency: 'INR' };
  };
  // Original price = sum of individual course prices for the given country
  const getBundleCardOriginalPrice = (bundle, country = 'US') => {
    const courses = bundle.courses || [];
    const dp = getBundleCardPrice(bundle, country);

    if (!country || country === 'IN') {
      const total = courses.reduce((sum, c) => sum + (c.price || 0), 0);
      return total > dp.amount ? { amount: Math.round(total), currency: 'INR' } : null;
    }

    const cp = bundle.countryPrices?.find((p) => p.countryCode === country);
    if (!cp) return null;

    // Sum each course's stored country price
    const total = courses.reduce((sum, c) => {
      const courseCp = c.countryPrices?.find((p) => p.countryCode === country);
      return sum + (courseCp ? courseCp.amount : 0);
    }, 0);

    if (total <= 0 || total <= dp.amount) return null;
    return { amount: Math.round(total * 100) / 100, currency: cp.currencyCode };
  };

  const searchLower = search.toLowerCase();
  const filteredCategoryCourses = search
    ? categoryCourses.filter(
        (c) =>
          c.title?.toLowerCase().includes(searchLower) ||
          c.shortDescription?.toLowerCase().includes(searchLower) ||
          c.trainerName?.toLowerCase().includes(searchLower)
      )
    : categoryCourses;
  const filteredOtherCourses = search
    ? otherCourses.filter(
        (c) =>
          c.title?.toLowerCase().includes(searchLower) ||
          c.shortDescription?.toLowerCase().includes(searchLower) ||
          c.trainerName?.toLowerCase().includes(searchLower)
      )
    : otherCourses;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <SEO
        title={`${categoryLabel} Courses`}
        description={`Browse ${categoryLabel} courses, combo offers and certifications at Uyirgene International.`}
        path={`/courses/category/${categoryCode}`}
      />
      <Breadcrumb items={breadcrumbItems} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          {categoryLabel}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore combo offers and individual courses in {categoryLabel}.
        </Typography>
      </Box>

      <TextField
        placeholder={`Search ${categoryLabel} courses…`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        fullWidth
        sx={{ mb: 3, maxWidth: 480 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* ── Section 1: Combo Offers ── */}
          {bundles.length > 0 && (
            <Box sx={{ mb: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LocalOfferIcon color="error" />
                <Typography variant="h5" component="h2" fontWeight={700}>
                  Combo Offers
                </Typography>
                <Chip label="Save More" color="error" size="small" />
              </Box>
              <Grid container spacing={3}>
                {bundles.map((bundle) => {
                  const bundleCourses = bundle.courses || [];
                  const totalDuration = bundleCourses.reduce((sum, c) => sum + (c.durationHours || 0), 0);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={bundle.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          overflow: 'hidden',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            boxShadow: 6,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out',
                          },
                        }}
                        onClick={() => navigate(ROUTES.BUNDLE_DETAIL(bundle.slug || bundle.id))}
                      >
                        <Box sx={{ display: 'flex', height: 140, overflow: 'hidden', position: 'relative' }}>
                          {bundle.thumbnailImageUrl ? (
                            <Box
                              component="img"
                              src={`${apiBase}${bundle.thumbnailImageUrl}`}
                              alt={bundle.title}
                              sx={{ width: '100%', objectFit: 'cover', height: '100%', filter: 'brightness(0.85)' }}
                            />
                          ) : (
                            bundleCourses.slice(0, 3).map((course, idx) => {
                              const imgUrl = course.thumbnailImageUrl
                                ? `${apiBase}${course.thumbnailImageUrl}`
                                : getImage('COURSE_PLACEHOLDER', IMAGES.COURSE_PLACEHOLDER);
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
                                    borderRight: idx < Math.min(bundleCourses.length, 3) - 1 ? '2px solid' : 'none',
                                    borderColor: 'background.paper',
                                    filter: 'brightness(0.85)',
                                  }}
                                />
                              );
                            })
                          )}
                          {(() => {
                            const dp = getBundleCardPrice(bundle);
                            const op = getBundleCardOriginalPrice(bundle);
                            const pct = op && op.amount > 0 ? Math.round((1 - dp.amount / op.amount) * 100) : bundle.savingsPercent;
                            return pct > 0 ? (
                              <Chip
                                label={`SAVE ${pct}%`}
                                color="error"
                                size="small"
                                sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 700 }}
                              />
                            ) : null;
                          })()}
                          <Chip
                            icon={<SchoolIcon sx={{ fontSize: 16 }} />}
                            label={`${bundleCourses.length} Courses`}
                            size="small"
                            sx={{
                              position: 'absolute',
                              bottom: 10,
                              left: 10,
                              bgcolor: 'rgba(0,0,0,0.75)',
                              color: 'white',
                              '& .MuiChip-icon': { color: 'white' },
                            }}
                          />
                        </Box>
                        <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 0.5 }}>
                            {bundle.title}
                          </Typography>
                          {bundle.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                              {bundle.description.length > 120
                                ? bundle.description.substring(0, 120) + '...'
                                : bundle.description}
                            </Typography>
                          )}
                          <Grid container spacing={0.5} sx={{ mb: 2, flex: 1 }}>
                            {bundleCourses.map((c, i) => (
                              <Grid item xs={6} key={c.id}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                                  <Box
                                    sx={{
                                      minWidth: 18, height: 18,
                                      borderRadius: '50%',
                                      bgcolor: 'primary.main',
                                      color: '#fff',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '0.6rem', fontWeight: 700,
                                      flexShrink: 0, mt: '1px',
                                    }}
                                  >
                                    {i + 1}
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      lineHeight: 1.3,
                                      overflow: 'hidden',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                    }}
                                  >
                                    {c.title}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                              {(() => {
                                const dp = getBundleCardPrice(bundle);
                                const op = getBundleCardOriginalPrice(bundle);
                                return (
                                  <>
                                    <Typography variant="h5" fontWeight={700} color="primary">
                                      {formatCurrency(dp.amount, dp.currency)}
                                    </Typography>
                                    {op && op.amount > dp.amount && (
                                      <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                        {formatCurrency(op.amount, op.currency)}
                                      </Typography>
                                    )}
                                  </>
                                );
                              })()}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {totalDuration > 0 && (
                                <Chip
                                  icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                                  label={`${totalDuration}h`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ height: 24, fontSize: '0.7rem' }}
                                />
                              )}
                              <Button
                                variant="contained"
                                size="small"
                                endIcon={<ArrowForwardIcon />}
                                onClick={(e) => { e.stopPropagation(); navigate(ROUTES.BUNDLE_DETAIL(bundle.slug || bundle.id)); }}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                              >
                                View Offer
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              <Divider sx={{ mt: 5 }} />
            </Box>
          )}

          {/* ── Section 2: Courses in this category ── */}
          <Box sx={{ mb: 5 }}>
            <Typography variant="h5" component="h2" fontWeight={700} sx={{ mb: 3 }}>
              {categoryLabel} Courses
            </Typography>
            <CourseList
              courses={filteredCategoryCourses}
              enrolledIds={enrolledIds}
              onEnroll={handleEnroll}
              loading={false}
              enrollingId={enrollingId}
              emptyTitle={search ? 'No courses match your search' : `No ${categoryLabel} courses available`}
              emptyDescription={search ? 'Try a different search term.' : 'Check back later for new courses in this category.'}
            />
          </Box>

          {/* ── Section 3: Other courses ── */}
          {(otherCourses.length > 0 && (!search || filteredOtherCourses.length > 0)) && (
            <>
              <Divider sx={{ mb: 5 }} />
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h2" fontWeight={700} sx={{ mb: 1 }}>
                  Other Courses
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Explore more from our full course catalog.
                </Typography>
                <CourseList
                  courses={filteredOtherCourses}
                  enrolledIds={enrolledIds}
                  onEnroll={handleEnroll}
                  loading={false}
                  enrollingId={enrollingId}
                  emptyTitle="No other courses match your search"
                  emptyDescription=""
                />
              </Box>
            </>
          )}
        </>
      )}
    </Container>
  );
}

export default CategoryPage;
