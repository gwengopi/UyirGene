import React, { forwardRef } from 'react';
import { TextField, FormHelperText, Box } from '@mui/material';

/**
 * Accessible form field with label, error handling, and helper text
 */
const FormField = forwardRef(function FormField(
  {
    id,
    name,
    label,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    helperText,
    required = false,
    disabled = false,
    fullWidth = true,
    multiline = false,
    rows,
    maxRows,
    minRows,
    placeholder,
    autoComplete,
    autoFocus = false,
    InputProps,
    inputProps,
    sx,
    ...props
  },
  ref
) {
  const fieldId = id || name || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const hasError = Boolean(error);
  const describedBy = [hasError && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined;

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <TextField
        ref={ref}
        id={fieldId}
        name={name}
        label={label}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={hasError}
        required={required}
        disabled={disabled}
        fullWidth={fullWidth}
        multiline={multiline}
        rows={rows}
        maxRows={maxRows}
        minRows={minRows}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        InputProps={InputProps}
        inputProps={{
          'aria-describedby': describedBy,
          'aria-invalid': hasError,
          'aria-required': required,
          ...inputProps,
        }}
        {...props}
      />
      {hasError && (
        <FormHelperText
          id={errorId}
          error
          role="alert"
          aria-live="polite"
          sx={{ ml: 0 }}
        >
          {error}
        </FormHelperText>
      )}
      {helperText && !hasError && (
        <FormHelperText id={helperId} sx={{ ml: 0 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
});

export default FormField;
