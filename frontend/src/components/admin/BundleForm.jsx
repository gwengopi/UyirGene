import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Autocomplete,
  Chip,
  Typography,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '../common';
import { formatCurrency } from '../../utils/formatters';
import { SUPPORTED_COUNTRIES } from '../../utils/constants';
import { getApiBaseUrl } from '../../services/api';
import { useConfig } from '../../store';

function BundleForm({ bundle, courses = [], onSave, onCancel, loading }) {
  const { getCategoryOptions } = useConfig();
  const categoryOptions = getCategoryOptions();

  const [formData, setFormData] = useState({
    bundleCode: '',
    title: '',
    description: '',
    price: '',
    displayOrder: 0,
    category: '',
  });
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [countryPrices, setCountryPrices] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeThumbnailImage, setRemoveThumbnailImage] = useState(false);

  // Populate form on edit
  useEffect(() => {
    if (bundle) {
      setFormData({
        bundleCode: bundle.bundleCode || '',
        title: bundle.title || '',
        description: bundle.description || '',
        price: bundle.price || '',
        displayOrder: bundle.displayOrder || 0,
        category: bundle.category || '',
      });
      setSelectedCourseIds(bundle.courses?.map((c) => c.id) || []);
      setCountryPrices(
        bundle.countryPrices?.map((cp) => ({
          countryCode: cp.countryCode,
          currencyCode: cp.currencyCode,
          amount: cp.amount,
        })) || []
      );
      if (bundle.hasThumbnailImage) {
        setImagePreview(`${getApiBaseUrl()}${bundle.thumbnailImageUrl}`);
      }
    }
  }, [bundle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Filter courses by selected category (when category is set)
  const filteredCourses = formData.category
    ? courses.filter((c) => c.category === formData.category)
    : courses;

  // Calculate original price from selected courses
  const originalPrice = selectedCourseIds.reduce((sum, id) => {
    const course = courses.find((c) => c.id === id);
    return sum + (course?.price || 0);
  }, 0);

  const savingsPercent =
    originalPrice > 0 && formData.price > 0
      ? Math.round((1 - formData.price / originalPrice) * 100)
      : 0;

  // For a given country code, sum the selected courses' stored price for that country
  const getCoursesTotalForCountry = (countryCode) => {
    if (!countryCode || selectedCourseIds.length === 0) return null;
    let total = 0;
    let currency = '';
    for (const courseId of selectedCourseIds) {
      const course = courses.find((c) => c.id === courseId);
      if (!course) continue;
      const cp = course.countryPrices?.find((p) => p.countryCode === countryCode);
      if (cp) { total += cp.amount; currency = cp.currencyCode; }
    }
    return total > 0 ? { amount: Math.round(total * 100) / 100, currency } : null;
  };

  // Country prices handlers
  const addCountryPrice = () => {
    setCountryPrices([...countryPrices, { countryCode: '', currencyCode: '', amount: '' }]);
  };

  const removeCountryPrice = (index) => {
    setCountryPrices(countryPrices.filter((_, i) => i !== index));
  };

  const handleCountryPriceChange = (index, field, value) => {
    const updated = [...countryPrices];
    updated[index][field] = value;

    // Auto-fill currency when country is selected
    if (field === 'countryCode') {
      const country = SUPPORTED_COUNTRIES.find((c) => c.code === value);
      if (country) {
        updated[index].currencyCode = country.currency;
      }
    }
    setCountryPrices(updated);
  };

  // Image handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setRemoveThumbnailImage(false);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveThumbnailImage(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.bundleCode.trim() || !formData.title.trim() || !formData.price) {
      return;
    }
    if (selectedCourseIds.length < 2) {
      return;
    }

    const validCountryPrices = countryPrices.filter(
      (cp) => cp.countryCode && cp.currencyCode && cp.amount > 0
    );

    const data = {
      ...formData,
      price: Number(formData.price),
      displayOrder: Number(formData.displayOrder) || 0,
      category: formData.category || null,
      courseIds: selectedCourseIds,
      countryPrices: validCountryPrices,
      removeThumbnailImage,
    };

    onSave(data, imageFile);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        {/* Basic Info */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Bundle Code"
            name="bundleCode"
            value={formData.bundleCode}
            onChange={handleChange}
            placeholder="COMBO-001"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            size="small"
          />
        </Grid>

        {/* Category */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              label="Category"
              value={formData.category}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, category: e.target.value }));
                // Clear selected courses when category changes to avoid cross-category selections
                setSelectedCourseIds([]);
              }}
            >
              <MenuItem value="">— Any category —</MenuItem>
              {categoryOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Course Selection */}
        <Grid item xs={12}>
          <Autocomplete
            multiple
            options={filteredCourses}
            getOptionLabel={(option) => option.title || ''}
            value={filteredCourses.filter((c) => selectedCourseIds.includes(c.id))}
            onChange={(_, newValue) => setSelectedCourseIds(newValue.map((c) => c.id))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Courses (min 2)"
                size="small"
                error={selectedCourseIds.length > 0 && selectedCourseIds.length < 2}
                helperText={
                  selectedCourseIds.length > 0 && selectedCourseIds.length < 2
                    ? 'Select at least 2 courses'
                    : ''
                }
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={`${option.title} (${formatCurrency(option.price, 'INR')})`}
                  size="small"
                />
              ))
            }
          />
        </Grid>

        {/* Pricing */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            type="number"
            label="Bundle Price (INR)"
            name="price"
            value={formData.price}
            onChange={handleChange}
            size="small"
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Original Price"
            value={formatCurrency(originalPrice, 'INR')}
            size="small"
            disabled
            helperText="Auto-calculated from courses"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Savings"
            value={savingsPercent > 0 ? `${savingsPercent}%` : '-'}
            size="small"
            disabled
            helperText="Discount percentage"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Display Order"
            name="displayOrder"
            value={formData.displayOrder}
            onChange={handleChange}
            size="small"
            helperText="Lower number = shown first"
          />
        </Grid>

        {/* Thumbnail Image */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Thumbnail Image
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {imagePreview && (
              <Box
                component="img"
                src={imagePreview}
                alt="Preview"
                sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 1 }}
              />
            )}
            <Button variant="outlined" component="label" size="small">
              {imagePreview ? 'Change' : 'Upload'} Image
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
            {imagePreview && (
              <Button size="small" color="error" onClick={handleRemoveImage}>
                Remove
              </Button>
            )}
          </Box>
        </Grid>

        {/* Country Prices */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Country-Specific Prices</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addCountryPrice}>
              Add Price
            </Button>
          </Box>
          {countryPrices.map((cp, index) => {
            const coursesTotal = getCoursesTotalForCountry(cp.countryCode);
            return (
              <Grid container spacing={1} key={index} sx={{ mb: 1 }}>
                <Grid item xs={3}>
                  <Autocomplete
                    size="small"
                    options={SUPPORTED_COUNTRIES}
                    getOptionLabel={(option) => `${option.name} (${option.code})`}
                    value={SUPPORTED_COUNTRIES.find((c) => c.code === cp.countryCode) || null}
                    onChange={(_, newVal) =>
                      handleCountryPriceChange(index, 'countryCode', newVal?.code || '')
                    }
                    renderInput={(params) => <TextField {...params} label="Country" />}
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField fullWidth size="small" label="Currency" value={cp.currencyCode} disabled />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Bundle Price"
                    value={cp.amount}
                    onChange={(e) => handleCountryPriceChange(index, 'amount', e.target.value)}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Courses Total"
                    value={coursesTotal ? formatCurrency(coursesTotal.amount, coursesTotal.currency) : '—'}
                    disabled
                    helperText="Sum of individual course prices"
                  />
                </Grid>
                <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton size="small" color="error" onClick={() => removeCountryPrice(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>
            );
          })}
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              loading={loading}
              disabled={loading || selectedCourseIds.length < 2 || !formData.title.trim() || !formData.price}
            >
              {bundle ? 'Update Bundle' : 'Create Bundle'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default BundleForm;
