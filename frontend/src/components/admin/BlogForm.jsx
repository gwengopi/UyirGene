import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Divider,
  Chip,
  InputAdornment,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormField, Select, Button } from '../common';
import { validateForm, hasErrors } from '../../utils/validators';
import { getApiBaseUrl } from '../../services/api';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'MEMBERS_ONLY', label: 'Members Only' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'Tamil' },
  { value: 'hi', label: 'Hindi' },
];

const CATEGORY_OPTIONS = [
  { value: 'News', label: 'News' },
  { value: 'Tutorials', label: 'Tutorials' },
  { value: 'Industry Insights', label: 'Industry Insights' },
  { value: 'Research', label: 'Research' },
  { value: 'Events', label: 'Events' },
  { value: 'Career Tips', label: 'Career Tips' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Health', label: 'Health' },
  { value: 'Education', label: 'Education' },
  { value: 'Other', label: 'Other' },
];

function BlogForm({ blog, onSave, onCancel, loading = false }) {
  const imageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    content: '',
    authorName: 'Editorial Team',
    category: '',
    tags: '',
    status: 'DRAFT',
    visibility: 'PUBLIC',
    language: 'en',
    urlSlug: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        shortDescription: blog.shortDescription || '',
        content: blog.content || '',
        authorName: blog.authorName || 'Editorial Team',
        category: blog.category || '',
        tags: blog.tags || '',
        status: blog.status || 'DRAFT',
        visibility: blog.visibility || 'PUBLIC',
        language: blog.language || 'en',
        urlSlug: blog.urlSlug || '',
        imageUrl: blog.imageUrl || '',
      });

      // Set existing image preview
      if (blog.featuredImage || blog.id) {
        setImagePreview(`${getApiBaseUrl()}/api/blogs/admin/${blog.id}/image`);
      } else if (blog.imageUrl) {
        setImagePreview(blog.imageUrl);
      }
    }
  }, [blog]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(file);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const schema = {
      title: { required: true, label: 'Title', minLength: 3, maxLength: 70 },
      content: { required: true, label: 'Content', minLength: 50 },
      category: { required: true, label: 'Category' },
    };

    const validationErrors = validateForm(schema, formData);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    const dataToSave = {
      title: formData.title,
      shortDescription: formData.shortDescription || null,
      content: formData.content,
      authorName: formData.authorName || 'Editorial Team',
      category: formData.category,
      tags: formData.tags || null,
      status: formData.status,
      visibility: formData.visibility,
      language: formData.language,
      urlSlug: formData.urlSlug || null,
      imageUrl: formData.imageUrl || null,
    };

    onSave?.(dataToSave, { imageFile });
  };

  const isEditing = !!blog?.id;

  // Calculate reading time based on content
  const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
      </Typography>

      <Grid container spacing={3}>
        {/* Featured Image Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Featured Image
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
                      alt="Featured image preview"
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
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                    <Typography variant="body2">Click to upload</Typography>
                  </Box>
                )}
              </Card>
            </Grid>
            <Grid item xs={12} sm={8}>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => imageInputRef.current?.click()}
                sx={{ mb: 2 }}
              >
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                Recommended: 1200x630 pixels. Max size: 5MB.
              </Typography>

              <FormField
                name="imageUrl"
                label="Or enter image URL"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                size="small"
                sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Title */}
        <Grid item xs={12}>
          <FormField
            name="title"
            label="Blog Title (H1)"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
            placeholder="Enter blog title"
            helperText={`${formData.title.length}/70 characters`}
            inputProps={{ maxLength: 70 }}
          />
        </Grid>

        {/* Short Description */}
        <Grid item xs={12}>
          <FormField
            name="shortDescription"
            label="Short Description"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="Brief description for previews and SEO"
            helperText={`${formData.shortDescription.length}/300 characters`}
            multiline
            rows={2}
            inputProps={{ maxLength: 300 }}
          />
        </Grid>

        {/* Content */}
        <Grid item xs={12}>
          <FormField
            name="content"
            label="Blog Content"
            value={formData.content}
            onChange={handleChange}
            error={errors.content}
            required
            multiline
            rows={12}
            placeholder="Write your blog content here... (supports HTML)"
            helperText={`Word count: ${wordCount} | Estimated reading time: ${readingTime} min`}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Metadata
          </Typography>
        </Grid>

        {/* Author Name */}
        <Grid item xs={12} sm={6}>
          <FormField
            name="authorName"
            label="Author Name"
            value={formData.authorName}
            onChange={handleChange}
            placeholder="Editorial Team"
          />
        </Grid>

        {/* Category */}
        <Grid item xs={12} sm={6}>
          <Select
            name="category"
            label="Category"
            value={formData.category}
            onChange={handleChange}
            error={errors.category}
            options={CATEGORY_OPTIONS}
            required
            placeholder="Select a category"
          />
        </Grid>

        {/* Tags */}
        <Grid item xs={12}>
          <FormField
            name="tags"
            label="Tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="education, technology, health (comma separated)"
            helperText="Enter tags separated by commas"
          />
          {formData.tags && (
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {formData.tags.split(',').map((tag, index) => (
                tag.trim() && (
                  <Chip
                    key={index}
                    label={tag.trim()}
                    size="small"
                    variant="outlined"
                  />
                )
              ))}
            </Box>
          )}
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Publishing Options
          </Typography>
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={4}>
          <Select
            name="status"
            label="Status"
            value={formData.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
          />
        </Grid>

        {/* Visibility */}
        <Grid item xs={12} sm={4}>
          <Select
            name="visibility"
            label="Visibility"
            value={formData.visibility}
            onChange={handleChange}
            options={VISIBILITY_OPTIONS}
          />
        </Grid>

        {/* Language */}
        <Grid item xs={12} sm={4}>
          <Select
            name="language"
            label="Language"
            value={formData.language}
            onChange={handleChange}
            options={LANGUAGE_OPTIONS}
          />
        </Grid>

        {/* URL Slug */}
        <Grid item xs={12}>
          <FormField
            name="urlSlug"
            label="URL Slug"
            value={formData.urlSlug}
            onChange={handleChange}
            placeholder="auto-generated-from-title"
            helperText="Leave empty to auto-generate from title"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">/blog/</InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Reading Time Info */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`Reading Time: ${readingTime} min`} variant="outlined" />
            <Chip label={`Words: ${wordCount}`} variant="outlined" />
            <Chip label={`Status: ${formData.status}`} color={formData.status === 'PUBLISHED' ? 'success' : 'default'} />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} disabled={loading} type="button">
          Cancel
        </Button>
        <Button variant="contained" type="submit" loading={loading}>
          {isEditing ? 'Save Changes' : 'Create Blog'}
        </Button>
      </Box>
    </Box>
  );
}

export default BlogForm;
