import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useConfig } from '../../store';
import { COURSE_CATEGORIES } from '../../utils/constants';

/**
 * Course Filters component for search and filtering
 */
function CourseFilters({
  search = '',
  category = '',
  sortBy = '',
  onSearchChange,
  onCategoryChange,
  onSortByChange,
  onClearFilters,
}) {
  const { getCategoryOptions } = useConfig();
  const hasFilters = search || category || sortBy;

  // Use dynamic categories from master data, fallback to static list
  const dynamicCategories = getCategoryOptions();
  const categoryOptions = dynamicCategories.length > 0
    ? dynamicCategories
    : COURSE_CATEGORIES.map((cat) => ({ value: cat, label: cat }));

  const sortOptions = [
    { value: '', label: 'Default' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'price_low', label: 'Price (Low to High)' },
    { value: 'price_high', label: 'Price (High to Low)' },
    { value: 'duration', label: 'Duration' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        mb: 3,
        alignItems: { md: 'center' },
      }}
    >
      {/* Search */}
      <TextField
        placeholder="Search courses..."
        value={search}
        onChange={(e) => onSearchChange?.(e.target.value)}
        size="small"
        sx={{ flex: 1, minWidth: 200 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: search && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onSearchChange?.('')} aria-label="Clear search">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        aria-label="Search courses"
      />

      {/* Category filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="category-filter-label">Category</InputLabel>
        <Select
          labelId="category-filter-label"
          value={category}
          onChange={(e) => onCategoryChange?.(e.target.value)}
          label="Category"
        >
          <MenuItem value="">All Categories</MenuItem>
          {categoryOptions.map((cat) => (
            <MenuItem key={cat.value} value={cat.value}>
              {cat.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Sort by */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="sort-by-label">Sort By</InputLabel>
        <Select
          labelId="sort-by-label"
          value={sortBy}
          onChange={(e) => onSortByChange?.(e.target.value)}
          label="Sort By"
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Clear filters */}
      {hasFilters && (
        <Chip
          label="Clear filters"
          onDelete={onClearFilters}
          onClick={onClearFilters}
          variant="outlined"
          sx={{ height: 40 }}
        />
      )}
    </Box>
  );
}

export default CourseFilters;
