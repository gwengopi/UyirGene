import React, { forwardRef } from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  Box,
} from '@mui/material';

/**
 * Accessible Select dropdown component
 */
const Select = forwardRef(function Select(
  {
    id,
    name,
    label,
    value,
    onChange,
    onBlur,
    options = [],
    error,
    helperText,
    required = false,
    disabled = false,
    fullWidth = true,
    placeholder,
    multiple = false,
    renderValue,
    sx,
    ...props
  },
  ref
) {
  const fieldId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;
  const labelId = `${fieldId}-label`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const hasError = Boolean(error);
  const describedBy = [hasError && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined;

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <FormControl fullWidth={fullWidth} error={hasError} required={required} disabled={disabled}>
        <InputLabel id={labelId}>{label}</InputLabel>
        <MuiSelect
          ref={ref}
          id={fieldId}
          name={name}
          labelId={labelId}
          label={label}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          multiple={multiple}
          renderValue={renderValue}
          inputProps={{
            'aria-describedby': describedBy,
            'aria-invalid': hasError,
            'aria-required': required,
          }}
          {...props}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              <em>{placeholder}</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>
        {hasError && (
          <FormHelperText id={errorId} error role="alert" aria-live="polite">
            {error}
          </FormHelperText>
        )}
        {helperText && !hasError && (
          <FormHelperText id={helperId}>{helperText}</FormHelperText>
        )}
      </FormControl>
    </Box>
  );
});

export default Select;
