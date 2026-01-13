import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { FormField, Select, Checkbox, Button } from '../common';
import { validateForm, hasErrors } from '../../utils/validators';
import { useConfig } from '../../store';
import { COURSE_CATEGORIES } from '../../utils/constants';

/**
 * Course Form for creating/editing courses
 */
function CourseForm({ course, onSave, onCancel, loading = false }) {
  const { getCategoryOptions, categories } = useConfig();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    durationHours: '',
    price: '',
    published: false,
    videoUrl: '',
    videoTitle: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        durationHours: course.durationHours?.toString() || '',
        price: course.price?.toString() || '',
        published: course.published || false,
        videoUrl: course.videos?.[0]?.url || '',
        videoTitle: course.videos?.[0]?.title || '',
      });
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const schema = {
      title: { required: true, label: 'Title', minLength: 3, maxLength: 200 },
      description: { required: true, label: 'Description', minLength: 10, maxLength: 5000 },
      category: { required: true, label: 'Category' },
      durationHours: { positive: true, label: 'Duration' },
      price: { positive: true, label: 'Price' },
    };

    const validationErrors = validateForm(schema, formData);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    const dataToSave = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      durationHours: formData.durationHours ? parseInt(formData.durationHours, 10) : null,
      price: formData.price ? parseFloat(formData.price) : null,
      published: formData.published,
      // Include video data if provided
      video: formData.videoUrl ? {
        title: formData.videoTitle || formData.title,
        url: formData.videoUrl,
      } : null,
    };

    onSave?.(dataToSave);
  };

  // Use dynamic categories from master data, fallback to static list
  const dynamicCategories = getCategoryOptions();
  const categoryOptions = dynamicCategories.length > 0
    ? dynamicCategories
    : COURSE_CATEGORIES.map((cat) => ({ value: cat, label: cat }));

  const isEditing = !!course?.id;

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Edit Course' : 'Create New Course'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormField
            name="title"
            label="Course Title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
            placeholder="Enter course title"
          />
        </Grid>

        <Grid item xs={12}>
          <FormField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            required
            multiline
            rows={4}
            placeholder="Enter course description"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Select
            name="category"
            label="Category"
            value={formData.category}
            onChange={handleChange}
            error={errors.category}
            options={categoryOptions}
            required
            placeholder="Select a category"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            name="durationHours"
            label="Duration (hours)"
            type="number"
            value={formData.durationHours}
            onChange={handleChange}
            error={errors.durationHours}
            placeholder="e.g., 10"
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            name="price"
            label="Price (INR)"
            type="number"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            placeholder="Leave empty for free"
            helperText="Leave empty or 0 for free courses"
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box sx={{ mt: 2 }}>
            <Checkbox
              name="published"
              label="Publish course immediately"
              checked={formData.published}
              onChange={handleChange}
              helperText="Published courses are visible to students"
            />
          </Box>
        </Grid>

        {/* Video Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
            Course Video
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add a Google Classroom or YouTube video URL for this course
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            name="videoTitle"
            label="Video Title"
            value={formData.videoTitle}
            onChange={handleChange}
            error={errors.videoTitle}
            placeholder="e.g., Introduction to the Course"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            name="videoUrl"
            label="Video URL"
            value={formData.videoUrl}
            onChange={handleChange}
            error={errors.videoUrl}
            placeholder="https://www.youtube.com/watch?v=... or Google Drive link"
            helperText="YouTube, Google Drive, or direct video URL"
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} disabled={loading} type="button">
          Cancel
        </Button>
        <Button variant="contained" type="submit" loading={loading}>
          {isEditing ? 'Save Changes' : 'Create Course'}
        </Button>
      </Box>
    </Box>
  );
}

export default CourseForm;
