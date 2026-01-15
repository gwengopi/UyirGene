import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Card, CardMedia, IconButton } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormField, Select, Checkbox, Button } from '../common';
import { validateForm, hasErrors } from '../../utils/validators';
import { useConfig } from '../../store';
import { COURSE_CATEGORIES, IMAGES } from '../../utils/constants';
import { getApiBaseUrl } from '../../services/api';

/**
 * Course Form for creating/editing courses
 */
function CourseForm({ course, onSave, onCancel, loading = false }) {
  const { getCategoryOptions } = useConfig();
  const fileInputRef = useRef(null);

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

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
      // Set existing image preview from API
      if (course.hasImage && course.imageUrl) {
        setImagePreview(`${getApiBaseUrl()}${course.imageUrl}`);
      }
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      setRemoveImage(false);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
      video: formData.videoUrl ? {
        title: formData.videoTitle || formData.title,
        url: formData.videoUrl,
      } : null,
    };

    onSave?.(dataToSave, imageFile, removeImage);
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
        {/* Course Image Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Course Image
          </Typography>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  height: 180,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.default',
                  border: '2px dashed',
                  borderColor: 'divider',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {imagePreview ? (
                  <>
                    <CardMedia
                      component="img"
                      image={imagePreview}
                      alt="Course preview"
                      sx={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                      }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" sx={{ color: 'white' }} />
                    </IconButton>
                  </>
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      color: 'text.secondary',
                      cursor: 'pointer',
                      p: 2,
                    }}
                    onClick={handleUploadClick}
                  >
                    <ImageIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                    <Typography variant="body2">Click to upload</Typography>
                  </Box>
                )}
              </Card>
            </Grid>
            <Grid item xs={12} sm={8}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={handleUploadClick}
                sx={{ mb: 2 }}
              >
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                Upload a course thumbnail image. Supported formats: JPG, PNG, GIF.
                Maximum size: 5MB. Recommended: 800x450 pixels (16:9 ratio).
              </Typography>
              {!imagePreview && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  If no image is uploaded, a default placeholder will be used.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>

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
