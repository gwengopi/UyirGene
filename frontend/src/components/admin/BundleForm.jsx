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
  InputAdornment,
  CircularProgress,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PublicIcon from '@mui/icons-material/Public';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
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
    ? courses.filter((c) => (c.categories || []).includes(formData.category))
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

  // ── Currency conversion ─────────────────────────────────────────────────────
  const [convertingPrices, setConvertingPrices] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const usdAmount = countryPrices.find((cp) => cp.countryCode === 'US')?.amount || '';

  const roundForCurrency = (amount, currency) => {
    if (['JPY', 'KRW', 'IDR', 'VND', 'CLP', 'ISK', 'HUF', 'TWD', 'COP', 'IQD', 'IRR'].includes(currency))
      return Math.round(amount).toString();
    if (['BHD', 'KWD', 'JOD', 'OMR'].includes(currency))
      return (Math.round(amount * 1000) / 1000).toString();
    return (Math.round(amount * 100) / 100).toString();
  };

  const handleUsdAmountChange = (val) => {
    setCountryPrices((prev) => {
      const without = prev.filter((cp) => cp.countryCode !== 'US');
      if (!val) return without;
      return [...without, { countryCode: 'US', currencyCode: 'USD', amount: val }];
    });
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
        .filter((c) => c.code !== 'IN')
        .map((c) => {
          const rate = rates[c.currency];
          if (!rate) return null;
          return { countryCode: c.code, currencyCode: c.currency, amount: roundForCurrency(usd * rate, c.currency) };
        })
        .filter(Boolean);
      setCountryPrices(newPrices);
      const inrRate = rates['INR'];
      if (inrRate) setFormData((prev) => ({ ...prev, price: Math.round(usd * inrRate).toString() }));
    } catch {
      alert('Failed to fetch exchange rates. Please check your connection and try again.');
    } finally {
      setConvertingPrices(false);
    }
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
    <Box component="form" onSubmit={handleSubmit} noValidate>
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
            label="Courses Total (INR)"
            value={formatCurrency(originalPrice, 'INR')}
            size="small"
            disabled
            helperText="Sum of individual course prices"
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
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Country-Specific Prices</Typography>

          {/* USD + convert row */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mb: 2, flexWrap: 'wrap' }}>
            <TextField
              label="US Price (USD)"
              type="number"
              value={usdAmount}
              onChange={(e) => handleUsdAmountChange(e.target.value)}
              size="small"
              sx={{ width: 160 }}
              placeholder="e.g. 99"
              inputProps={{ min: 0, step: 0.01 }}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
            {(() => {
              const usdTotal = getCoursesTotalForCountry('US');
              return usdTotal ? (
                <TextField
                  label="Courses Total (USD)"
                  value={formatCurrency(usdTotal.amount, usdTotal.currency)}
                  size="small"
                  sx={{ width: 160 }}
                  disabled
                  helperText="Sum of individual course prices"
                />
              ) : null;
            })()}
            <Button
              variant="outlined"
              size="small"
              startIcon={convertingPrices ? <CircularProgress size={14} color="inherit" /> : <PublicIcon />}
              onClick={handleConvertAll}
              disabled={!usdAmount || convertingPrices}
              sx={{ alignSelf: 'center', mt: 1 }}
            >
              {convertingPrices ? 'Converting…' : 'Convert to all countries'}
            </Button>
          </Box>
          {countryPrices.filter((cp) => cp.countryCode !== 'US').length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No country prices set. Enter a USD price and click "Convert to all countries".
            </Typography>
          ) : (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
              {/* Panel header */}
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: 2, py: 1.5, bgcolor: 'background.default', cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => setShowCountries((v) => !v)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PublicIcon fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight={600}>
                    {countryPrices.filter((cp) => cp.countryCode !== 'US').length} countries configured
                  </Typography>
                </Box>
                <IconButton size="small">
                  {showCountries ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
              </Box>

              <Collapse in={showCountries}>
                {/* Search + Add row */}
                <Box sx={{ display: 'flex', gap: 1, px: 2, pt: 1.5, pb: 1 }}>
                  <TextField
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  />
                  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addCountryPrice} sx={{ whiteSpace: 'nowrap' }}>
                    Add
                  </Button>
                </Box>

                {/* Scrollable list */}
                <Box sx={{ maxHeight: 360, overflowY: 'auto', px: 2, pb: 1.5 }}>
                  {countryPrices
                    .filter((cp) => cp.countryCode !== 'US')
                    .filter((cp) => {
                      if (!countrySearch.trim()) return true;
                      const q = countrySearch.toLowerCase();
                      const country = SUPPORTED_COUNTRIES.find((c) => c.code === cp.countryCode);
                      return (
                        country?.name.toLowerCase().includes(q) ||
                        cp.countryCode.toLowerCase().includes(q) ||
                        cp.currencyCode.toLowerCase().includes(q)
                      );
                    })
                    .map((cp) => {
                      const index = countryPrices.indexOf(cp);
                      const country = SUPPORTED_COUNTRIES.find((c) => c.code === cp.countryCode);
                      const coursesTotal = getCoursesTotalForCountry(cp.countryCode);
                      return (
                        <Box
                          key={index}
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
                            onChange={(e) => handleCountryPriceChange(index, 'amount', e.target.value)}
                            size="small"
                            sx={{ width: 110, flexShrink: 0 }}
                            inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right' } }}
                          />
                          {coursesTotal && (
                            <Typography variant="caption" color="text.secondary" sx={{ width: 90, textAlign: 'right', flexShrink: 0 }} noWrap>
                              {formatCurrency(coursesTotal.amount, coursesTotal.currency)}
                            </Typography>
                          )}
                          <IconButton size="small" color="error" onClick={() => removeCountryPrice(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                </Box>
              </Collapse>
            </Box>
          )}
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
