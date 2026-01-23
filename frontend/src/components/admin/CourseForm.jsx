import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Card, CardMedia, IconButton, Divider } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormField, Select, Checkbox, Button } from '../common';
import { validateForm, hasErrors } from '../../utils/validators';
import { useConfig } from '../../store';
import { COURSE_CATEGORIES } from '../../utils/constants';
import { getApiBaseUrl } from '../../services/api';

/**
 * Course Form for creating/editing courses
 */
function CourseForm({ course, onSave, onCancel, loading = false }) {
  const { getCategoryOptions } = useConfig();
  const thumbnailInputRef = useRef(null);
  const descriptionImageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    durationHours: '',
    price: '',
    published: false,
    testLink: '',
    testDescription: '',
  });
  const [errors, setErrors] = useState({});

  // Videos state - array of video objects
  const [videos, setVideos] = useState([{ title: '', url: '' }]);

  // Image states - separate for thumbnail and description image
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  const [descriptionImageFile, setDescriptionImageFile] = useState(null);
  const [descriptionImagePreview, setDescriptionImagePreview] = useState(null);
  const [removeDescriptionImage, setRemoveDescriptionImage] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        durationHours: course.durationHours?.toString() || '',
        price: course.price?.toString() || '',
        published: course.published || false,
        testLink: course.testLink || '',
        testDescription: course.testDescription || '',
      });

      // Set existing videos or default empty video
      if (course.videos && course.videos.length > 0) {
        setVideos(course.videos.map(v => ({ title: v.title || '', url: v.url || '', id: v.id })));
      } else {
        setVideos([{ title: '', url: '' }]);
      }

      // Set existing thumbnail preview
      if (course.hasThumbnailImage && course.thumbnailImageUrl) {
        setThumbnailPreview(`${getApiBaseUrl()}${course.thumbnailImageUrl}`);
      } else if (course.hasImage && course.imageUrl) {
        // Fallback to legacy image
        setThumbnailPreview(`${getApiBaseUrl()}${course.imageUrl}`);
      }

      // Set existing description image preview
      if (course.hasDescriptionImage && course.descriptionImageUrl) {
        setDescriptionImagePreview(`${getApiBaseUrl()}${course.descriptionImageUrl}`);
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

  // Video handlers
  const handleVideoChange = (index, field, value) => {
    const newVideos = [...videos];
    newVideos[index][field] = value;
    setVideos(newVideos);
  };

  const addVideo = () => {
    setVideos([...videos, { title: '', url: '' }]);
  };

  const removeVideo = (index) => {
    if (videos.length === 1) {
      // Keep at least one empty video field
      setVideos([{ title: '', url: '' }]);
    } else {
      const newVideos = videos.filter((_, i) => i !== index);
      setVideos(newVideos);
    }
  };

  // Image handlers
  const handleImageSelect = (e, type) => {
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

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'thumbnail') {
          setThumbnailFile(file);
          setThumbnailPreview(reader.result);
          setRemoveThumbnail(false);
        } else {
          setDescriptionImageFile(file);
          setDescriptionImagePreview(reader.result);
          setRemoveDescriptionImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (type) => {
    if (type === 'thumbnail') {
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setRemoveThumbnail(true);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    } else {
      setDescriptionImageFile(null);
      setDescriptionImagePreview(null);
      setRemoveDescriptionImage(true);
      if (descriptionImageInputRef.current) {
        descriptionImageInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const schema = {
      title: { required: true, label: 'Title', minLength: 3, maxLength: 200 },
      description: { required: true, label: 'Description', minLength: 10 },
      category: { required: true, label: 'Category' },
      durationHours: { positive: true, label: 'Duration' },
      price: { positive: true, label: 'Price' },
    };

    const validationErrors = validateForm(schema, formData);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    // Filter out empty videos
    const validVideos = videos.filter(v => v.url && v.url.trim());

    const dataToSave = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      durationHours: formData.durationHours ? parseInt(formData.durationHours, 10) : null,
      price: formData.price ? parseFloat(formData.price) : null,
      published: formData.published,
      testLink: formData.testLink || null,
      testDescription: formData.testDescription || null,
      videos: validVideos.map((v, index) => ({
        id: v.id || null,
        title: v.title || formData.title,
        url: v.url,
        orderIndex: index,
      })),
    };

    onSave?.(dataToSave, {
      thumbnailImage: thumbnailFile,
      descriptionImage: descriptionImageFile,
      removeThumbnailImage: removeThumbnail,
      removeDescriptionImage: removeDescriptionImage,
    });
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
        {/* Thumbnail Image Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Thumbnail Image
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This image will be displayed in the courses list/grid view.
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
                {thumbnailPreview ? (
                  <>
                    <CardMedia
                      component="img"
                      image={thumbnailPreview}
                      alt="Thumbnail preview"
                      sx={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemoveImage('thumbnail')}
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
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    <ImageIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                    <Typography variant="body2">Click to upload</Typography>
                  </Box>
                )}
              </Card>
            </Grid>
            <Grid item xs={12} sm={8}>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, 'thumbnail')}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => thumbnailInputRef.current?.click()}
                sx={{ mb: 2 }}
              >
                {thumbnailPreview ? 'Change Thumbnail' : 'Upload Thumbnail'}
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                Recommended: 800x450 pixels (16:9 ratio). Max size: 5MB.
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Description Image Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Course Detail Image
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This image will be displayed when viewing the course details (larger, more detailed image).
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
                {descriptionImagePreview ? (
                  <>
                    <CardMedia
                      component="img"
                      image={descriptionImagePreview}
                      alt="Description image preview"
                      sx={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      onClick={() => handleRemoveImage('description')}
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
                    onClick={() => descriptionImageInputRef.current?.click()}
                  >
                    <ImageIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                    <Typography variant="body2">Click to upload</Typography>
                  </Box>
                )}
              </Card>
            </Grid>
            <Grid item xs={12} sm={8}>
              <input
                ref={descriptionImageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, 'description')}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => descriptionImageInputRef.current?.click()}
                sx={{ mb: 2 }}
              >
                {descriptionImagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                Recommended: 1200x675 pixels (16:9 ratio). Max size: 5MB.
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
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
            rows={6}
            placeholder="Enter course description (no character limit)"
            helperText="You can enter unlimited text for the description"
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

        {/* Test/Assessment Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Test / Assessment (Optional)
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            name="testLink"
            label="Test Link"
            value={formData.testLink}
            onChange={handleChange}
            placeholder="https://forms.google.com/... or external test URL"
            helperText="Link to Google Form or external assessment"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            name="testDescription"
            label="Test Instructions"
            value={formData.testDescription}
            onChange={handleChange}
            placeholder="Instructions for students taking the test"
            multiline
            rows={2}
          />
        </Grid>

        {/* Videos Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Course Videos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add video links (YouTube, Google Drive, or direct URLs)
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addVideo}
              size="small"
            >
              Add Video
            </Button>
          </Box>
        </Grid>

        {videos.map((video, index) => (
          <React.Fragment key={index}>
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.default',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Video {index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeVideo(index)}
                    disabled={videos.length === 1 && !video.url}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5}>
                    <FormField
                      name={`videoTitle-${index}`}
                      label="Video Title"
                      value={video.title}
                      onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                      placeholder="e.g., Introduction to the Course"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <FormField
                      name={`videoUrl-${index}`}
                      label="Video URL"
                      value={video.url}
                      onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or Google Drive link"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </React.Fragment>
        ))}
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
