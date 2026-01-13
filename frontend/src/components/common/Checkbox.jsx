import React, { forwardRef } from 'react';
import {
  FormControlLabel,
  Checkbox as MuiCheckbox,
  FormHelperText,
  Box,
} from '@mui/material';

/**
 * Accessible Checkbox component with label
 */
const Checkbox = forwardRef(function Checkbox(
  {
    id,
    name,
    label,
    checked,
    onChange,
    onBlur,
    error,
    helperText,
    required = false,
    disabled = false,
    color = 'primary',
    size = 'medium',
    sx,
    ...props
  },
  ref
) {
  const fieldId = id || name || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const hasError = Boolean(error);
  const describedBy = [hasError && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined;

  return (
    <Box sx={{ mb: 1, ...sx }}>
      <FormControlLabel
        control={
          <MuiCheckbox
            ref={ref}
            id={fieldId}
            name={name}
            checked={checked}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            color={hasError ? 'error' : color}
            size={size}
            inputProps={{
              'aria-describedby': describedBy,
              'aria-invalid': hasError,
              'aria-required': required,
            }}
            {...props}
          />
        }
        label={
          <>
            {label}
            {required && <span aria-hidden="true"> *</span>}
          </>
        }
      />
      {hasError && (
        <FormHelperText
          id={errorId}
          error
          role="alert"
          aria-live="polite"
          sx={{ ml: 4 }}
        >
          {error}
        </FormHelperText>
      )}
      {helperText && !hasError && (
        <FormHelperText id={helperId} sx={{ ml: 4 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
});

export default Checkbox;
