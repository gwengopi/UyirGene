import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, fireEvent } from '../testUtils';
import { FormField } from '../../components/common';

describe('FormField', () => {
  it('renders with label', () => {
    renderWithProviders(
      <FormField label="Email" name="email" value="" onChange={() => {}} />
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    renderWithProviders(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        error="Invalid email"
      />
    );
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('marks input as invalid when error is present', () => {
    renderWithProviders(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        error="Invalid email"
      />
    );
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('calls onChange when input value changes', () => {
    const handleChange = vi.fn();
    renderWithProviders(
      <FormField label="Email" name="email" value="" onChange={handleChange} />
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders as required when required prop is true', () => {
    renderWithProviders(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        required
      />
    );
    expect(screen.getByLabelText(/email/i)).toBeRequired();
  });

  it('renders different input types', () => {
    renderWithProviders(
      <FormField
        label="Password"
        name="password"
        type="password"
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
  });

  it('shows helper text when provided', () => {
    renderWithProviders(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        helperText="Enter your email address"
      />
    );
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });
});
