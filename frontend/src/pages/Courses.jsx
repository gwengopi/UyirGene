import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { CourseList, CourseFilters } from '../components/course';
import { Breadcrumb } from '../components/common';
import { courseService, enrollmentService } from '../services';
import { useAuth, useToast } from '../store';
import { ROUTES } from '../utils/constants';

function Courses() {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Load courses
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);

        if (isAuthenticated()) {
          const enrolled = await enrollmentService.getEnrolledCourses();
          setEnrolledIds(enrolled.map((c) => c.id));
        }
      } catch (error) {
        showError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, showError]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (category) {
      result = result.filter((course) => course.category === category);
    }

    // Price filter
    if (priceFilter === 'free') {
      result = result.filter((course) => !course.price || course.price === 0);
    } else if (priceFilter === 'paid') {
      result = result.filter((course) => course.price && course.price > 0);
    }

    // Sorting
    switch (sortBy) {
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'price_low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'duration':
        result.sort((a, b) => (b.durationHours || 0) - (a.durationHours || 0));
        break;
      default:
        break;
    }

    return result;
  }, [courses, search, category, priceFilter, sortBy]);

  // Handle enrollment
  const handleEnroll = useCallback(
    async (courseId) => {
      if (!isAuthenticated()) {
        showError('Please login to enroll in courses');
        return;
      }

      setEnrollingId(courseId);
      try {
        const result = await enrollmentService.startEnrollment(courseId);

        // Check if payment is required
        if (result.order) {
          // Handle Razorpay payment
          const paymentData = await enrollmentService.processRazorpayPayment({
            orderId: result.order.orderId,
            amount: result.order.amount,
            currency: result.order.currency,
            keyId: result.order.keyId,
            courseName: courses.find((c) => c.id === courseId)?.title,
          });

          // Confirm payment
          await enrollmentService.confirmPayment(courseId, paymentData);
        }

        // Update enrolled list
        setEnrolledIds((prev) => [...prev, courseId]);
        showSuccess('Successfully enrolled in the course!');
      } catch (error) {
        if (error.message !== 'Payment cancelled') {
          showError(error.message || 'Failed to enroll');
        }
      } finally {
        setEnrollingId(null);
      }
    },
    [isAuthenticated, courses, showSuccess, showError]
  );

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setPriceFilter('');
    setSortBy('');
  };

  const breadcrumbItems = [{ label: 'Courses', path: ROUTES.COURSES }];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumb items={breadcrumbItems} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          All Courses
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore our comprehensive collection of courses designed to help you succeed.
        </Typography>
      </Box>

      <CourseFilters
        search={search}
        category={category}
        priceFilter={priceFilter}
        sortBy={sortBy}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onPriceFilterChange={setPriceFilter}
        onSortByChange={setSortBy}
        onClearFilters={handleClearFilters}
      />

      <CourseList
        courses={filteredCourses}
        enrolledIds={enrolledIds}
        onEnroll={handleEnroll}
        loading={loading}
        enrollingId={enrollingId}
        emptyTitle={search || category || priceFilter ? 'No courses match your filters' : 'No courses available'}
        emptyDescription={
          search || category || priceFilter
            ? 'Try adjusting your filters or search query'
            : 'Check back later for new courses'
        }
        emptyAction={search || category || priceFilter ? 'Clear Filters' : undefined}
        onEmptyAction={handleClearFilters}
      />
    </Container>
  );
}

export default Courses;
