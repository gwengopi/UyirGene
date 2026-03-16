import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Grid, Card, CardMedia, IconButton, Divider, Alert, Autocomplete, TextField, CircularProgress, InputAdornment, Collapse } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { FormField, Select, Checkbox, Button } from '../common';
import ManualSection from '../course/ManualSection';
import { validateForm, hasErrors } from '../../utils/validators';
import { useConfig, useToast } from '../../store';
import { COURSE_CATEGORIES, SUPPORTED_COUNTRIES } from '../../utils/constants';
import { getApiBaseUrl } from '../../services/api';

/**
 * Course Form for creating/editing courses
 */
function CourseForm({ course, onSave, onCancel, loading = false }) {
  const { getCategoryOptions } = useConfig();
  const { showError } = useToast();
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
    reminderDays: '',
  });

  // Key Components state - array of {title, points[]}
  const [keyComponents, setKeyComponents] = useState([]);
  // Exam Details state - array of strings
  const [examDetails, setExamDetails] = useState([]);
  // Assessment Links state - array of {title, url}
  const [assessmentLinks, setAssessmentLinks] = useState([]);
  // Pre-Assessment Links state - array of {title, url}
  const [preAssessmentLinks, setPreAssessmentLinks] = useState([]);
  const [preAssessmentInstructions, setPreAssessmentInstructions] = useState('Complete the pre-assessment before starting your learning journey. This helps us understand your baseline knowledge and customize your learning experience.');

  // Country pricing state - array of { countryCode, currencyCode, amount }
  const [countryPrices, setCountryPrices] = useState([]);
  const [convertingPrices, setConvertingPrices] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
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

  // Pending manuals (for new course — uploaded after course is created)
  const [pendingManuals, setPendingManuals] = useState([]);
  const [newManualLabel, setNewManualLabel] = useState('');
  const [newManualFile, setNewManualFile] = useState(null);
  const newManualFileRef = useRef(null);

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

      // Set existing assessment links
      if (course.assessmentLinks) {
        try {
          const parsed = JSON.parse(course.assessmentLinks);
          setAssessmentLinks(Array.isArray(parsed) ? parsed.map(l => ({ title: l.title || '', url: l.url || '' })) : []);
        } catch { setAssessmentLinks([]); }
      } else {
        setAssessmentLinks([]);
      }

      // Set existing pre-assessment links
      if (course.preAssessmentLinks) {
        try {
          const parsed = JSON.parse(course.preAssessmentLinks);
          setPreAssessmentLinks(Array.isArray(parsed) ? parsed.map(l => ({ title: l.title || '', url: l.url || '' })) : []);
        } catch { setPreAssessmentLinks([]); }
      } else {
        setPreAssessmentLinks([]);
      }
      setPreAssessmentInstructions(course.preAssessmentInstructions || '');

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
      setVideos([{ title: '', url: '', durationSeconds: '' }]);
    } else {
      setVideos(videos.filter((_, i) => i !== index));
    }
  };

  const moveVideo = (index, direction) => {
    const next = index + direction;
    if (next < 0 || next >= videos.length) return;
    const reordered = [...videos];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    setVideos(reordered);
  };

  // Country price handlers
  const addCountryPrice = () => {
    const usedCodes = countryPrices.map(cp => cp.countryCode);
    const available = SUPPORTED_COUNTRIES.filter(c => c.code !== 'IN' && c.code !== 'US' && !usedCodes.includes(c.code));
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

  // USD price helpers
  const usdAmount = countryPrices.find(cp => cp.countryCode === 'US')?.amount || '';
  const handleUsdPriceChange = (val) => {
    const entry = { countryCode: 'US', currencyCode: 'USD', amount: val };
    setCountryPrices(prev => [...prev.filter(cp => cp.countryCode !== 'US'), entry]);
  };

  const roundForCurrency = (amount, currency) => {
    if (['JPY', 'KRW', 'IDR', 'VND', 'CLP', 'ISK', 'HUF', 'TWD', 'COP', 'IQD', 'IRR'].includes(currency))
      return Math.round(amount).toString();
    if (['BHD', 'KWD', 'JOD', 'OMR'].includes(currency))
      return (Math.round(amount * 1000) / 1000).toString();
    return (Math.round(amount * 100) / 100).toString();
  };

  const handleConvertAll = async () => {
    const usd = parseFloat(usdAmount);
    if (!usd || usd <= 0) return;
    setConvertingPrices(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      const rates = data.rates;
      const newPrices = SUPPORTED_COUNTRIES
        .filter(c => c.code !== 'IN')
        .map(c => {
          const rate = rates[c.currency];
          if (!rate) return null;
          return { countryCode: c.code, currencyCode: c.currency, amount: roundForCurrency(usd * rate, c.currency) };
        })
        .filter(Boolean);
      setCountryPrices(newPrices);
      const inrRate = rates['INR'];
      if (inrRate) setFormData(prev => ({ ...prev, price: Math.round(usd * inrRate).toString() }));
      setShowCountries(true);
      setCountrySearch('');
    } catch {
      alert('Failed to fetch exchange rates. Please check your connection and try again.');
    } finally {
      setConvertingPrices(false);
    }
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

  // Assessment Link handlers
  const addAssessmentLink = () => {
    setAssessmentLinks([...assessmentLinks, { title: '', url: '' }]);
  };

  const removeAssessmentLink = (index) => {
    setAssessmentLinks(assessmentLinks.filter((_, i) => i !== index));
  };

  const handleAssessmentLinkChange = (index, field, value) => {
    const updated = [...assessmentLinks];
    updated[index] = { ...updated[index], [field]: value };
    setAssessmentLinks(updated);
  };

  // Pre-Assessment Link handlers
  const addPreAssessmentLink = () => {
    setPreAssessmentLinks([...preAssessmentLinks, { title: '', url: '' }]);
  };

  const removePreAssessmentLink = (index) => {
    setPreAssessmentLinks(preAssessmentLinks.filter((_, i) => i !== index));
  };

  const handlePreAssessmentLinkChange = (index, field, value) => {
    const updated = [...preAssessmentLinks];
    updated[index] = { ...updated[index], [field]: value };
    setPreAssessmentLinks(updated);
  };

  const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;  // 5MB
  const MAX_DETAIL_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

  // Image handlers
  const handleImageSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      const errorKey = type === 'thumbnail' ? 'thumbnailImage' : 'descriptionImage';
      const maxSize = type === 'thumbnail' ? MAX_THUMBNAIL_SIZE : MAX_DETAIL_IMAGE_SIZE;
      const maxSizeMBLabel = type === 'thumbnail' ? '5MB' : '10MB';

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, [errorKey]: 'Please select a valid image file (JPG, PNG, etc.)' }));
        return;
      }
      // Validate file size
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setErrors((prev) => ({ ...prev, [errorKey]: `Image size (${sizeMB}MB) exceeds the ${maxSizeMBLabel} limit. Please compress or resize the image.` }));
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

  const MAX_MANUAL_SIZE = 20 * 1024 * 1024; // 20 MB

  const addPendingManual = () => {
    if (!newManualFile || !newManualLabel.trim()) return;
    if (newManualFile.size > MAX_MANUAL_SIZE) {
      showError(`File size (${(newManualFile.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 20 MB limit. Please compress the file and try again.`);
      return;
    }
    setPendingManuals((prev) => [...prev, { label: newManualLabel.trim(), file: newManualFile }]);
    setNewManualLabel('');
    setNewManualFile(null);
    if (newManualFileRef.current) newManualFileRef.current.value = '';
  };

  const removePendingManual = (idx) => {
    setPendingManuals((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const schema = {
      title: { required: true, label: 'Course Title', minLength: 3, maxLength: 200 },
      description: { required: true, label: 'Description', minLength: 10 },
      category: { required: true, label: 'Category' },
      durationHours: { positive: true, label: 'Duration' },
      price: { positive: true, label: 'Price' },
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

    // Filter out assessment links with no URL
    const validAssessmentLinks = assessmentLinks
      .filter(l => l.url && l.url.trim())
      .map(l => ({ title: l.title.trim(), url: l.url.trim() }));

    // Filter out pre-assessment links with no URL
    const validPreAssessmentLinks = preAssessmentLinks
      .filter(l => l.url && l.url.trim())
      .map(l => ({ title: l.title.trim(), url: l.url.trim() }));

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
      assessmentLinks: JSON.stringify(validAssessmentLinks),
      preAssessmentLinks: JSON.stringify(validPreAssessmentLinks),
      preAssessmentInstructions: preAssessmentInstructions.trim() || null,
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
      pendingManuals,
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
                  Recommended: 1200x675 pixels (16:9 ratio). Max size: 10MB.
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
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Pricing</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap', mb: 2 }}>
            <TextField
              label="US Price (USD)"
              type="number"
              value={usdAmount}
              onChange={(e) => handleUsdPriceChange(e.target.value)}
              size="small"
              sx={{ width: 180 }}
              placeholder="e.g. 99"
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
            <TextField
              label="India Price (INR)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              size="small"
              sx={{ width: 180 }}
              placeholder="e.g. 8299"
              inputProps={{ min: 0, step: 1 }}
              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            />
            <Button
              variant="contained"
              color="secondary"
              size="medium"
              startIcon={convertingPrices ? <CircularProgress size={14} color="inherit" /> : <PublicIcon />}
              onClick={handleConvertAll}
              disabled={!usdAmount || convertingPrices}
            >
              {convertingPrices ? 'Converting…' : 'Convert to all countries'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addCountryPrice}
              size="medium"
              disabled={countryPrices.filter(cp => cp.countryCode !== 'US').length >= SUPPORTED_COUNTRIES.filter(c => c.code !== 'IN').length - 1}
            >
              Add Country
            </Button>
          </Box>
        </Grid>

        {/* Country prices collapsible panel */}
        {countryPrices.filter(cp => cp.countryCode !== 'US').length > 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Panel header */}
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: 2, py: 1.5, bgcolor: 'background.default', cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => setShowCountries(v => !v)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PublicIcon fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight={600}>
                    {countryPrices.filter(cp => cp.countryCode !== 'US').length} countries configured
                  </Typography>
                </Box>
                <IconButton size="small">
                  {showCountries ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              </Box>

              <Collapse in={showCountries}>
                {/* Search bar */}
                <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                  <TextField
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  />
                </Box>

                {/* Scrollable list */}
                <Box sx={{ maxHeight: 360, overflowY: 'auto', px: 2, pb: 1.5 }}>
                  {countryPrices
                    .filter(cp => cp.countryCode !== 'US')
                    .filter(cp => {
                      if (!countrySearch.trim()) return true;
                      const q = countrySearch.toLowerCase();
                      const country = SUPPORTED_COUNTRIES.find(c => c.code === cp.countryCode);
                      return (
                        country?.name.toLowerCase().includes(q) ||
                        cp.countryCode.toLowerCase().includes(q) ||
                        cp.currencyCode.toLowerCase().includes(q)
                      );
                    })
                    .map((cp) => {
                      const realIndex = countryPrices.findIndex(p => p === cp);
                      const country = SUPPORTED_COUNTRIES.find(c => c.code === cp.countryCode);
                      return (
                        <Box
                          key={realIndex}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            py: 0.75, borderBottom: '1px solid', borderColor: 'divider',
                            '&:last-child': { borderBottom: 'none' },
                          }}
                        >
                          <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                            {country?.name || cp.countryCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ width: 36, flexShrink: 0 }}>
                            {cp.currencyCode}
                          </Typography>
                          <TextField
                            type="number"
                            value={cp.amount}
                            onChange={(e) => handleCountryPriceChange(realIndex, 'amount', e.target.value)}
                            size="small"
                            sx={{ width: 110, flexShrink: 0 }}
                            inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right' } }}
                          />
                          <IconButton size="small" color="error" onClick={() => removeCountryPrice(realIndex)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                  {countryPrices
                    .filter(cp => cp.countryCode !== 'US')
                    .filter(cp => {
                      if (!countrySearch.trim()) return false;
                      const q = countrySearch.toLowerCase();
                      const country = SUPPORTED_COUNTRIES.find(c => c.code === cp.countryCode);
                      return !(
                        country?.name.toLowerCase().includes(q) ||
                        cp.countryCode.toLowerCase().includes(q) ||
                        cp.currencyCode.toLowerCase().includes(q)
                      );
                    }).length === countryPrices.filter(cp => cp.countryCode !== 'US').length && countrySearch.trim() && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No countries match "{countrySearch}"
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Box>
          </Grid>
        )}

        {/* Assessment Links Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Assessment Links (Optional)
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addAssessmentLink} size="small">
              Add Link
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Each link appears as a separate "Take Assessment" button on the course detail page.
          </Typography>
        </Grid>

        {assessmentLinks.map((link, index) => (
          <Grid item xs={12} key={`al-${index}`}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
              <FormField
                name={`alTitle-${index}`}
                label="Button Label"
                value={link.title}
                onChange={(e) => handleAssessmentLinkChange(index, 'title', e.target.value)}
                placeholder="e.g. Pre-Assessment"
                size="small"
                sx={{ width: 200 }}
              />
              <FormField
                name={`alUrl-${index}`}
                label="URL"
                value={link.url}
                onChange={(e) => handleAssessmentLinkChange(index, 'url', e.target.value)}
                placeholder="https://forms.google.com/..."
                size="small"
                sx={{ flex: 1 }}
              />
              <IconButton size="small" color="error" onClick={() => removeAssessmentLink(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}

        {/* Pre-Assessment Links Section */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Pre-Assessment Links (Practice)
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={addPreAssessmentLink} size="small">
              Add Link
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Practice links shown below the video player. Students complete these before the main assessment.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormField
            name="preAssessmentInstructions"
            label="Pre-Assessment Instructions"
            value={preAssessmentInstructions}
            onChange={(e) => setPreAssessmentInstructions(e.target.value)}
            placeholder="e.g. Complete the pre-assessment before starting your learning journey. This helps us understand your baseline knowledge."
            helperText="Shown above the pre-assessment buttons. Leave blank to use the default instruction."
            multiline
            rows={2}
          />
        </Grid>

        {preAssessmentLinks.map((link, index) => (
          <Grid item xs={12} key={`pal-${index}`}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
              <FormField
                name={`palTitle-${index}`}
                label="Button Label"
                value={link.title}
                onChange={(e) => handlePreAssessmentLinkChange(index, 'title', e.target.value)}
                placeholder="e.g. Pre-Assessment"
                size="small"
                sx={{ width: 200 }}
              />
              <FormField
                name={`palUrl-${index}`}
                label="URL"
                value={link.url}
                onChange={(e) => handlePreAssessmentLinkChange(index, 'url', e.target.value)}
                placeholder="https://forms.google.com/..."
                size="small"
                sx={{ flex: 1 }}
              />
              <IconButton size="small" color="error" onClick={() => removePreAssessmentLink(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        ))}

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
                  display: 'flex',
                  gap: 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                  transition: 'box-shadow 0.15s',
                  '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                }}
              >
                {/* Order strip */}
                <Box
                  sx={{
                    width: 42,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.100',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    py: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => moveVideo(index, -1)}
                    disabled={index === 0}
                    sx={{ p: 0.3, color: index === 0 ? 'action.disabled' : 'text.secondary' }}
                  >
                    <ArrowUpwardIcon sx={{ fontSize: 15 }} />
                  </IconButton>

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <DragIndicatorIcon sx={{ fontSize: 16, color: 'action.disabled' }} />
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.disabled', lineHeight: 1 }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => moveVideo(index, 1)}
                    disabled={index === videos.length - 1}
                    sx={{ p: 0.3, color: index === videos.length - 1 ? 'action.disabled' : 'text.secondary' }}
                  >
                    <ArrowDownwardIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Box>

                {/* Fields */}
                <Box sx={{ flex: 1, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
                        helperText="For 80% completion tracking"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormField
                        name={`videoUrl-${index}`}
                        label="Video URL"
                        value={video.url}
                        onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                        placeholder="YouTube / Google Drive / direct URL"
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>

      {/* Manuals & Documents */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
          Manuals &amp; Documents
        </Typography>

        {course?.id ? (
          /* Editing: live upload / delete via ManualSection */
          <ManualSection courseId={course.id} isAdmin title="Manuals &amp; Documents" />
        ) : (
          /* Creating: queue files locally — uploaded after course is saved */
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add manuals below. They will be uploaded once the course is created.
            </Typography>

            {/* Queued list */}
            {pendingManuals.map((m, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  py: 1, borderBottom: '1px solid', borderColor: 'divider',
                }}
              >
                {m.file.type?.includes('pdf')
                  ? <PictureAsPdfIcon color="error" sx={{ fontSize: 20, flexShrink: 0 }} />
                  : <DescriptionIcon color="action" sx={{ fontSize: 20, flexShrink: 0 }} />}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500} noWrap>{m.label}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{m.file.name}</Typography>
                </Box>
                <IconButton size="small" color="error" onClick={() => removePendingManual(idx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}

            {/* Add row */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 2 }}>
              <TextField
                size="small"
                label="Document label"
                value={newManualLabel}
                onChange={(e) => setNewManualLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPendingManual(); } }}
                sx={{ minWidth: 180, flex: 1 }}
              />
              <Button
                size="small"
                variant="outlined"
                component="label"
                sx={{ whiteSpace: 'nowrap' }}
              >
                {newManualFile ? newManualFile.name : 'Choose file'}
                <input
                  ref={newManualFileRef}
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={(e) => {
                    const f = e.target.files[0] || null;
                    if (f && f.size > MAX_MANUAL_SIZE) {
                      showError(`File size (${(f.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 20 MB limit. Please compress the file and try again.`);
                      e.target.value = '';
                      return;
                    }
                    setNewManualFile(f);
                  }}
                />
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addPendingManual}
                disabled={!newManualFile || !newManualLabel.trim()}
              >
                Add
              </Button>
            </Box>
          </Box>
        )}
      </Box>

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
