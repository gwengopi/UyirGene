import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Card, CardMedia, IconButton, Divider, Alert, Autocomplete, TextField } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormField, Select, Checkbox, Button } from '../common';
import { validateForm, hasErrors } from '../../utils/validators';
import { useConfig } from '../../store';
import { COURSE_CATEGORIES, SUPPORTED_COUNTRIES } from '../../utils/constants';
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
    tagline: '',
    courseCode: '',
    trainerName: '',
    shortDescription: '',
    description: '',
    targetAudience: '',
    assessment: '',
    outcome: '',
    courseDurationText: '',
    category: '',
    durationHours: '',
    price: '',
    published: false,
    displayOrder: '',
    courseType: '',
    testLink: '',
    testDescription: '',
    reminderDays: '',
  });

  // Key Components state - array of {title, points[]}
  const [keyComponents, setKeyComponents] = useState([]);
  // Exam Details state - array of strings
  const [examDetails, setExamDetails] = useState([]);

  // Country pricing state - array of { countryCode, currencyCode, amount }
  const [countryPrices, setCountryPrices] = useState([]);
  const [errors, setErrors] = useState({});

  // Videos state - array of video objects
  const [videos, setVideos] = useState([{ title: '', url: '', durationSeconds: '' }]);

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
        tagline: course.tagline || '',
        courseCode: course.courseCode || '',
        trainerName: course.trainerName || '',
        shortDescription: course.shortDescription || '',
        description: course.description || '',
        targetAudience: course.targetAudience || '',
        assessment: course.assessment || '',
        outcome: course.outcome || '',
        courseDurationText: course.courseDurationText || '',
        category: course.category || '',
        durationHours: course.durationHours?.toString() || '',
        price: course.price?.toString() || '',
        published: course.published || false,
        displayOrder: course.displayOrder?.toString() || '',
        courseType: course.courseType || '',
        testLink: course.testLink || '',
        testDescription: course.testDescription || '',
        reminderDays: course.reminderDays?.toString() || '',
      });

      // Set existing key components
      if (Array.isArray(course.keyComponents) && course.keyComponents.length > 0) {
        setKeyComponents(course.keyComponents);
      } else {
        setKeyComponents([]);
      }

      // Set existing exam details
      if (Array.isArray(course.examDetails) && course.examDetails.length > 0) {
        setExamDetails(course.examDetails);
      } else {
        setExamDetails([]);
      }

      // Set existing videos or default empty video
      if (Array.isArray(course.videos) && course.videos.length > 0) {
        setVideos(course.videos.map(v => ({ title: v.title || '', url: v.url || '', durationSeconds: v.durationSeconds != null ? v.durationSeconds.toString() : '', id: v.id })));
      } else {
        setVideos([{ title: '', url: '' }]);
      }

      // Set existing country prices
      if (course.countryPrices && course.countryPrices.length > 0) {
        setCountryPrices(course.countryPrices.map(cp => ({
          countryCode: cp.countryCode,
          currencyCode: cp.currencyCode,
          amount: cp.amount?.toString() || '',
        })));
      } else {
        setCountryPrices([]);
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
    setVideos([...videos, { title: '', url: '', durationSeconds: '' }]);
  };

  const removeVideo = (index) => {
    if (videos.length === 1) {
      // Keep at least one empty video field
      setVideos([{ title: '', url: '', durationSeconds: '' }]);
    } else {
      const newVideos = videos.filter((_, i) => i !== index);
      setVideos(newVideos);
    }
  };

  // Country price handlers
  const addCountryPrice = () => {
    // Find first country not yet added (excluding India)
    const usedCodes = countryPrices.map(cp => cp.countryCode);
    const available = SUPPORTED_COUNTRIES.filter(c => c.code !== 'IN' && !usedCodes.includes(c.code));
    if (available.length === 0) return;
    const next = available[0];
    setCountryPrices([...countryPrices, { countryCode: next.code, currencyCode: next.currency, amount: '' }]);
  };

  const removeCountryPrice = (index) => {
    setCountryPrices(countryPrices.filter((_, i) => i !== index));
  };

  const handleCountryPriceChange = (index, field, value) => {
    const updated = [...countryPrices];
    if (field === 'countryCode') {
      const country = SUPPORTED_COUNTRIES.find(c => c.code === value);
      updated[index] = { ...updated[index], countryCode: value, currencyCode: country?.currency || '' };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setCountryPrices(updated);
  };

  // Key Component handlers
  const addKeyComponent = () => {
    setKeyComponents([...keyComponents, { title: '', points: [''] }]);
  };

  const removeKeyComponent = (index) => {
    setKeyComponents(keyComponents.filter((_, i) => i !== index));
  };

  const handleKeyComponentTitleChange = (index, value) => {
    const updated = [...keyComponents];
    updated[index] = { ...updated[index], title: value };
    setKeyComponents(updated);
  };

  const handleKeyComponentPointChange = (compIndex, pointIndex, value) => {
    const updated = [...keyComponents];
    const points = [...updated[compIndex].points];
    points[pointIndex] = value;
    updated[compIndex] = { ...updated[compIndex], points };
    setKeyComponents(updated);
  };

  const addKeyComponentPoint = (compIndex) => {
    const updated = [...keyComponents];
    updated[compIndex] = { ...updated[compIndex], points: [...updated[compIndex].points, ''] };
    setKeyComponents(updated);
  };

  const removeKeyComponentPoint = (compIndex, pointIndex) => {
    const updated = [...keyComponents];
    const points = updated[compIndex].points.filter((_, i) => i !== pointIndex);
    updated[compIndex] = { ...updated[compIndex], points: points.length > 0 ? points : [''] };
    setKeyComponents(updated);
  };

  // Exam Details handlers
  const addExamDetail = () => {
    setExamDetails([...examDetails, '']);
  };

  const removeExamDetail = (index) => {
    if (examDetails.length === 1) {
      setExamDetails([]);
    } else {
      setExamDetails(examDetails.filter((_, i) => i !== index));
    }
  };

  const handleExamDetailChange = (index, value) => {
    const updated = [...examDetails];
    updated[index] = value;
    setExamDetails(updated);
  };

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  // Image handlers
  const handleImageSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      const errorKey = type === 'thumbnail' ? 'thumbnailImage' : 'descriptionImage';

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, [errorKey]: 'Please select a valid image file (JPG, PNG, etc.)' }));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > MAX_IMAGE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setErrors((prev) => ({ ...prev, [errorKey]: `Image size (${sizeMB}MB) exceeds the 5MB limit. Please compress or resize the image.` }));
        return;
      }

      // Clear any previous image error
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });

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
      setErrors((prev) => {
        const next = { ...prev };
        delete next.thumbnailImage;
        return next;
      });
    } else {
      setDescriptionImageFile(null);
      setDescriptionImagePreview(null);
      setRemoveDescriptionImage(true);
      if (descriptionImageInputRef.current) {
        descriptionImageInputRef.current.value = '';
      }
      setErrors((prev) => {
        const next = { ...prev };
        delete next.descriptionImage;
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const schema = {
      title: { required: true, label: 'Course Title', minLength: 3, maxLength: 200 },
      description: { required: true, label: 'Description', minLength: 10 },
      category: { required: true, label: 'Category' },
      durationHours: { positive: true, label: 'Duration' },
      price: { positive: true, label: 'Price' },
      testLink: {
        custom: (value) => {
          if (value && value.trim() && !/^https?:\/\/.+/.test(value.trim())) {
            return 'Test link must be a valid URL (starting with http:// or https://)';
          }
          return null;
        },
      },
    };

    const validationErrors = validateForm(schema, formData);

    // Preserve image errors (they are set separately)
    if (errors.thumbnailImage) validationErrors.thumbnailImage = errors.thumbnailImage;
    if (errors.descriptionImage) validationErrors.descriptionImage = errors.descriptionImage;

    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      return;
    }

    // Filter out empty videos
    const validVideos = videos.filter(v => v.url && v.url.trim());

    // Filter out country prices with no amount
    const validCountryPrices = countryPrices
      .filter(cp => cp.countryCode && cp.amount && parseFloat(cp.amount) > 0)
      .map(cp => ({
        countryCode: cp.countryCode,
        currencyCode: cp.currencyCode,
        amount: parseFloat(cp.amount),
      }));

    // Filter out empty key components
    const validKeyComponents = keyComponents
      .filter(kc => kc.title && kc.title.trim())
      .map(kc => ({
        title: kc.title.trim(),
        points: kc.points.filter(p => p && p.trim()).map(p => p.trim()),
      }));

    // Filter out empty exam details
    const validExamDetails = examDetails.filter(ed => ed && ed.trim()).map(ed => ed.trim());

    const dataToSave = {
      title: formData.title,
      tagline: formData.tagline || null,
      courseCode: formData.courseCode || null,
      trainerName: formData.trainerName || null,
      shortDescription: formData.shortDescription || null,
      description: formData.description,
      keyComponents: validKeyComponents,
      targetAudience: formData.targetAudience || null,
      assessment: formData.assessment || null,
      outcome: formData.outcome || null,
      courseDurationText: formData.courseDurationText || null,
      examDetails: validExamDetails,
      category: formData.category,
      durationHours: formData.durationHours ? parseInt(formData.durationHours, 10) : null,
      price: formData.price ? parseFloat(formData.price) : null,
      published: formData.published,
      displayOrder: formData.displayOrder ? parseInt(formData.displayOrder, 10) : null,
      courseType: formData.courseType || null,
      testLink: formData.testLink || null,
      testDescription: formData.testDescription || null,
      reminderDays: formData.reminderDays ? parseInt(formData.reminderDays, 10) : null,
      countryPrices: validCountryPrices,
      videos: validVideos.map((v, index) => ({
        id: v.id || null,
        title: v.title || formData.title,
        url: v.url,
        orderIndex: index,
        durationSeconds: v.durationSeconds ? parseInt(v.durationSeconds, 10) : null,
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
                sx={{ mb: 1 }}
              >
                {thumbnailPreview ? 'Change Thumbnail' : 'Upload Thumbnail'}
              </Button>
              {errors.thumbnailImage ? (
                <Typography variant="body2" color="error" sx={{ display: 'block', mb: 1 }}>
                  {errors.thumbnailImage}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                  Recommended: 800x450 pixels (16:9 ratio). Max size: 5MB.
                </Typography>
              )}
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
                sx={{ mb: 1 }}
              >
                {descriptionImagePreview ? 'Change Image' : 'Upload Image'}
              </Button>
              {errors.descriptionImage ? (
                <Typography variant="body2" color="error" sx={{ display: 'block', mb: 1 }}>
                  {errors.descriptionImage}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                  Recommended: 1200x675 pixels (16:9 ratio). Max size: 5MB.
                </Typography>
              )}
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
            name="tagline"
            label="Tagline"
            value={formData.tagline}
            onChange={handleChange}
            placeholder="A short marketing tagline shown below the title (optional)"
            helperText="Max 300 characters"
            inputProps={{ maxLength: 300 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            name="courseCode"
            label="Course Code"
            value={formData.courseCode}
            onChange={handleChange}
            placeholder="e.g., BIO-101, COURSE-001"
            helperText="Unique course identifier (shown on certificate)"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormField
            name="trainerName"
            label="Trainer / Instructor Name"
            value={formData.trainerName}
            onChange={handleChange}
            placeholder="Enter trainer name"
            helperText="Will be displayed on the certificate"
          />
        </Grid>

        <Grid item xs={12}>
          <FormField
            name="shortDescription"
            label="Short Description"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="Brief description for certificate and previews"
            helperText="Max 500 characters - displayed on certificate"
            multiline
            rows={2}
            inputProps={{ maxLength: 500 }}
          />
        </Grid>

        {/* Structured Description Sections */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Course Description Sections
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Break down the course description into structured sections for a richer detail page. Only filled sections will be displayed.
          </Typography>
        </Grid>

        {/* 1. Overview (existing description field) */}
        <Grid item xs={12}>
          <FormField
            name="description"
            label="Overview"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            required
            multiline
            rows={4}
            placeholder="Provide an overview of the course - what it covers and why it matters"
          />
        </Grid>

        {/* 2. Key Components */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Key Components
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addKeyComponent} size="small">
              Add Component
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Each component has a title and bullet points describing what it covers.
          </Typography>
        </Grid>

        {keyComponents.map((comp, compIndex) => (
          <Grid item xs={12} key={`kc-${compIndex}`}>
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Component {compIndex + 1}
                </Typography>
                <IconButton size="small" color="error" onClick={() => removeKeyComponent(compIndex)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <FormField
                name={`kcTitle-${compIndex}`}
                label="Component Title"
                value={comp.title}
                onChange={(e) => handleKeyComponentTitleChange(compIndex, e.target.value)}
                placeholder="e.g., Introduction & Fundamentals"
                size="small"
                sx={{ mb: 2 }}
              />
              {comp.points.map((point, pointIndex) => (
                <Box key={`kcp-${compIndex}-${pointIndex}`} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <FormField
                    name={`kcPoint-${compIndex}-${pointIndex}`}
                    label={`Point ${pointIndex + 1}`}
                    value={point}
                    onChange={(e) => handleKeyComponentPointChange(compIndex, pointIndex, e.target.value)}
                    placeholder="Enter a bullet point"
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <IconButton size="small" color="error" onClick={() => removeKeyComponentPoint(compIndex, pointIndex)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              <Button variant="text" size="small" startIcon={<AddIcon />} onClick={() => addKeyComponentPoint(compIndex)}>
                Add Point
              </Button>
            </Box>
          </Grid>
        ))}

        {/* 3. Target Audience */}
        <Grid item xs={12}>
          <FormField
            name="targetAudience"
            label="Target Audience"
            value={formData.targetAudience}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="Who is this course designed for?"
          />
        </Grid>

        {/* 4. Assessment */}
        <Grid item xs={12}>
          <FormField
            name="assessment"
            label="Assessment"
            value={formData.assessment}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="Describe the assessment method and criteria"
          />
        </Grid>

        {/* 5. Outcome */}
        <Grid item xs={12}>
          <FormField
            name="outcome"
            label="Outcome"
            value={formData.outcome}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="What will participants achieve upon completion?"
          />
        </Grid>

        {/* 6. Course Duration */}
        <Grid item xs={12}>
          <FormField
            name="courseDurationText"
            label="Course Duration (Text)"
            value={formData.courseDurationText}
            onChange={handleChange}
            multiline
            rows={2}
            placeholder="e.g., Self-Paced Online Course. Flexible schedule."
            helperText="Detailed duration info shown on course detail page (separate from the numeric hours field)"
          />
        </Grid>

        {/* 7. Exam Details */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Exam Details
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addExamDetail} size="small">
              Add Detail
            </Button>
          </Box>
        </Grid>

        {examDetails.map((detail, index) => (
          <Grid item xs={12} key={`ed-${index}`}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <FormField
                name={`examDetail-${index}`}
                label={`Exam Detail ${index + 1}`}
                value={detail}
                onChange={(e) => handleExamDetailChange(index, e.target.value)}
                placeholder="e.g., Online MCQ examination (open book)"
                size="small"
                sx={{ flex: 1 }}
              />
              <IconButton size="small" color="error" onClick={() => removeExamDetail(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
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
          <Select
            name="courseType"
            label="Course Type"
            value={formData.courseType}
            onChange={handleChange}
            options={[
              { value: 'SELF_PACED', label: 'Self-Paced Learning' },
              { value: 'LIVE_ONLINE', label: 'Live Virtual Classroom' },
              { value: 'CLASSROOM', label: 'In-Person Classroom' },
            ]}
            placeholder="Select delivery mode"
            helperText="How the course is delivered to students"
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
          <FormField
            name="displayOrder"
            label="Display Order"
            type="number"
            value={formData.displayOrder}
            onChange={handleChange}
            placeholder="e.g., 1, 2, 3..."
            helperText="Lower number = shown first. Leave empty for default ordering."
            inputProps={{ min: 0, step: 1 }}
          />
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

        {/* Country Pricing Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Country Pricing (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Set prices for different countries. India (INR) uses the default price above.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addCountryPrice}
              size="small"
              disabled={countryPrices.length >= SUPPORTED_COUNTRIES.filter(c => c.code !== 'IN').length}
            >
              Add Country
            </Button>
          </Box>
        </Grid>

        {countryPrices.map((cp, index) => {
          const usedCodes = countryPrices.map(p => p.countryCode);
          const availableCountries = SUPPORTED_COUNTRIES.filter(
            c => c.code !== 'IN' && (c.code === cp.countryCode || !usedCodes.includes(c.code))
          );
          const selectedCountry = SUPPORTED_COUNTRIES.find(c => c.code === cp.countryCode) || null;

          return (
            <Grid item xs={12} key={index}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.default',
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <Autocomplete
                      options={availableCountries}
                      getOptionLabel={(option) => {
                        if (!option || typeof option === 'string') return option || '';
                        return `${option.name} (${option.currency})`;
                      }}
                      value={selectedCountry}
                      onChange={(_, newValue) => {
                        if (newValue) handleCountryPriceChange(index, 'countryCode', newValue.code);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Country" size="small" />
                      )}
                      isOptionEqualToValue={(option, value) => option?.code === value?.code}
                      disableClearable
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <FormField
                      name={`countryAmount-${index}`}
                      label={`Price (${selectedCountry?.currency || ''})`}
                      type="number"
                      value={cp.amount}
                      onChange={(e) => handleCountryPriceChange(index, 'amount', e.target.value)}
                      placeholder="Enter price"
                      size="small"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <IconButton
                      color="error"
                      onClick={() => removeCountryPrice(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          );
        })}

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

        <Grid item xs={12} sm={6}>
          <FormField
            name="reminderDays"
            label="Completion Reminder (days after enrollment)"
            type="number"
            value={formData.reminderDays}
            onChange={handleChange}
            placeholder="e.g., 7, 14, 30"
            helperText="Send a reminder email if the user hasn't completed the course after this many days. Leave empty to disable."
            inputProps={{ min: 1, step: 1 }}
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
                  <Grid item xs={6} sm={3}>
                    <FormField
                      name={`videoDuration-${index}`}
                      label="Duration (seconds)"
                      type="number"
                      value={video.durationSeconds}
                      onChange={(e) => handleVideoChange(index, 'durationSeconds', e.target.value)}
                      placeholder="e.g. 3600"
                      size="small"
                      helperText="For 80% completion tracking on Drive/Vimeo"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
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

      {hasErrors(errors) && (
        <Alert severity="error" sx={{ mt: 3 }}>
          Please fix the highlighted errors before submitting.
        </Alert>
      )}

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
