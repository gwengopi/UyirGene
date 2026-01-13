import React from 'react';
import { Grid, Box } from '@mui/material';
import CourseCard from './CourseCard';
import { EmptyState } from '../common';
import SchoolIcon from '@mui/icons-material/School';

/**
 * Course List component with grid layout
 */
function CourseList({
  courses = [],
  enrolledIds = [],
  progressMap = {},
  onEnroll,
  loading = false,
  loadingCount = 6,
  emptyTitle = 'No courses found',
  emptyDescription = 'Check back later for new courses.',
  emptyAction,
  onEmptyAction,
  enrollingId,
}) {
  // Show loading skeletons
  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: loadingCount }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
            <CourseCard loading />
          </Grid>
        ))}
      </Grid>
    );
  }

  // Show empty state
  if (!courses || courses.length === 0) {
    return (
      <EmptyState
        icon={SchoolIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyAction}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <Grid container spacing={3}>
      {courses.map((course) => {
        const isEnrolled = enrolledIds.includes(course.id);
        const progress = progressMap[course.id] || 0;
        const isEnrolling = enrollingId === course.id;

        return (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard
              course={course}
              isEnrolled={isEnrolled}
              progress={progress}
              onEnroll={onEnroll}
              enrolling={isEnrolling}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default CourseList;
