import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Checkbox, Divider, Chip, IconButton,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SchoolIcon from '@mui/icons-material/School';
import { Button } from '../common';
// bundles are passed in as a prop — no internal fetch needed
import { formatCurrency } from '../../utils/formatters';

/**
 * Resolves the display price for a bundle based on country.
 * Returns { amount, currency }.
 *
 * fallbackCurrency — used when no country-specific price is configured for the bundle.
 * Defaults to 'INR' (the base price currency), but callers pass the course's display
 * currency so that all prices in the dialog are shown in the same currency.
 */
function resolveBundlePrice(bundle, countryCode, fallbackCurrency = 'INR') {
  if (!countryCode || countryCode === 'IN') {
    return { amount: bundle.price, currency: 'INR' };
  }
  const cp = bundle.countryPrices?.find((p) => p.countryCode === countryCode);
  if (cp) return { amount: cp.amount, currency: cp.currencyCode };
  // No country-specific price → treat the base price as being in the fallback currency
  // (typically the same currency the individual course is priced in).
  return { amount: bundle.price, currency: fallbackCurrency };
}

/**
 * Dialog shown after clicking Enroll when bundles are available for the course.
 *
 * Props:
 *   open              — dialog visibility
 *   onClose           — called when user dismisses
 *   course            — course object { id, title }
 *   selectedCountry   — ISO country code selected by user
 *   displayPrice      — { amount, currency } for the single course
 *   enrolledCourseIds — Set<number> of course IDs the user already owns
 *   onEnrollSingle    — callback: proceed with single-course enrollment
 *   onEnrollBundles   — callback(bundleIds: number[]): proceed with multi-bundle enrollment
 */
function EnrollmentUpsellDialog({
  open,
  onClose,
  course,
  availableBundles = [],
  selectedCountry,
  displayPrice,
  enrolledCourseIds = new Set(),
  onEnrollSingle,
  onEnrollBundles,
}) {
  const bundles = availableBundles;
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [courseSelected, setCourseSelected] = useState(true);

  // Reset selection whenever dialog opens
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setCourseSelected(true);
    }
  }, [open]);

  const toggleBundle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ---- PRICE COMPUTATION ----

  const selectedBundles = bundles.filter((b) => selectedIds.has(b.id));
  // Use the course's display currency throughout the dialog so every price is consistent.
  // Bundles without a country-specific price fall back to this same currency.
  const effectiveCurrency = displayPrice?.currency || 'INR';

  // Bundle total — each bundle resolves to either its country price or the course's currency
  const bundleTotalAmount = selectedBundles.reduce((sum, b) => {
    const { amount } = resolveBundlePrice(b, selectedCountry, effectiveCurrency);
    return sum + amount;
  }, 0);

  // Is the current course already inside one of the selected bundles?
  const courseInSelectedBundles = selectedBundles.some((b) =>
    b.courses?.some((c) => Number(c.id) === Number(course?.id))
  );

  // Course contribution — always in the same effective currency
  const courseAmountInEffective = displayPrice?.amount || 0;

  const courseContribution = courseSelected && !courseInSelectedBundles
    ? courseAmountInEffective
    : 0;

  // Grand total — always in a single consistent currency
  const grandTotal = {
    amount: bundleTotalAmount + courseContribution,
    currency: effectiveCurrency,
  };

  // true when user wants the course enrolled separately (not covered by any bundle)
  const courseIsStandalone = courseSelected && !courseInSelectedBundles && selectedIds.size > 0;

  const nothingSelected = !courseSelected && selectedIds.size === 0;

  let confirmLabel;
  if (nothingSelected) {
    confirmLabel = 'Select an option above';
  } else if (selectedIds.size > 0) {
    const bundlePart = `${selectedIds.size} bundle${selectedIds.size > 1 ? 's' : ''}`;
    const totalStr = formatCurrency(grandTotal.amount, grandTotal.currency);
    confirmLabel = courseIsStandalone
      ? `Enroll in ${bundlePart} + this course — ${totalStr}`
      : `Enroll in ${bundlePart} — ${totalStr}`;
  } else {
    // Only the course is selected
    confirmLabel = courseAmountInEffective
      ? `Enroll in this course — ${formatCurrency(courseAmountInEffective, effectiveCurrency)}`
      : 'Enroll in this course (Free)';
  }

  // If bundles selected → bundle enrollment (also enroll standalone course if needed);
  // otherwise → single course enrollment
  const handleConfirm = () => {
    if (selectedIds.size > 0) {
      onEnrollBundles([...selectedIds], courseIsStandalone);
    } else {
      onEnrollSingle();
    }
  };

  return (
    <Dialog open={open} onClose={(e, reason) => { if (reason !== 'backdropClick') onClose(e, reason); }} disableEscapeKeyDown maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalOfferIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>Bundle Deals Available</Typography>
          <IconButton
            aria-label="Close dialog"
            onClick={onClose}
            sx={{ ml: 'auto', color: 'text.secondary' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Save more by enrolling in a bundle that includes <strong>{course?.title}</strong>
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Current course row — always shown at the top */}
        <Box
          sx={{
            p: 2.5,
            cursor: courseInSelectedBundles ? 'default' : 'pointer',
            opacity: courseInSelectedBundles ? 0.75 : 1,
            bgcolor: courseSelected && !courseInSelectedBundles && selectedIds.size === 0
              ? 'action.selected'
              : 'transparent',
            transition: 'background-color 0.15s',
            '&:hover': courseInSelectedBundles ? {} : { bgcolor: 'action.hover' },
          }}
          onClick={() => !courseInSelectedBundles && setCourseSelected((v) => !v)}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Checkbox
              checked={courseSelected}
              disabled={courseInSelectedBundles}
              onClick={(e) => e.stopPropagation()}
              onChange={() => !courseInSelectedBundles && setCourseSelected((v) => !v)}
              sx={{ mt: -0.5, p: 0 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                <SchoolIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={700}>{course?.title}</Typography>
                <Chip
                  label="Your selection"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
                {courseInSelectedBundles && (
                  <Chip
                    label="Included in bundle"
                    size="small"
                    color="success"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {courseInSelectedBundles ? (
                  <>
                    <Typography
                      variant="h6"
                      color="text.disabled"
                      fontWeight={700}
                      sx={{ textDecoration: 'line-through' }}
                    >
                      {displayPrice?.amount
                        ? formatCurrency(displayPrice.amount, displayPrice.currency)
                        : 'Free'}
                    </Typography>
                    <Typography variant="caption" color="success.main" fontWeight={600}>
                      Free with bundle
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      {courseAmountInEffective
                        ? formatCurrency(courseAmountInEffective, effectiveCurrency)
                        : 'Free'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">(single course)</Typography>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {bundles.length > 0 && (
          <Divider>
            <Chip label="or upgrade to a bundle deal" size="small" sx={{ fontSize: '0.7rem' }} />
          </Divider>
        )}

        {bundles.length > 0 && (
          <Box>
            {bundles.map((bundle, idx) => {
              const { amount: bundleAmount, currency: bundleCurrency } = resolveBundlePrice(bundle, selectedCountry, effectiveCurrency);
              const isChecked = selectedIds.has(bundle.id);

              // Which courses in this bundle does user already own?
              const ownedInBundle = bundle.courses?.filter((c) => enrolledCourseIds.has(c.id)) || [];
              const hasOwned = ownedInBundle.length > 0;
              const allOwned = ownedInBundle.length === bundle.courses?.length;

              return (
                <Box key={bundle.id}>
                  {idx > 0 && <Divider />}
                  <Box
                    sx={{
                      p: 2.5,
                      cursor: allOwned ? 'not-allowed' : 'pointer',
                      opacity: allOwned ? 0.5 : 1,
                      bgcolor: isChecked ? 'action.selected' : 'transparent',
                      transition: 'background-color 0.15s',
                      '&:hover': allOwned ? {} : { bgcolor: 'action.hover' },
                    }}
                    onClick={() => !allOwned && toggleBundle(bundle.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Checkbox
                        checked={isChecked}
                        disabled={allOwned}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => !allOwned && toggleBundle(bundle.id)}
                        sx={{ mt: -0.5, p: 0 }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Bundle header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight={700}>{bundle.title}</Typography>
                          {bundle.savingsPercent > 0 && (
                            <Chip
                              label={`Save ${bundle.savingsPercent}%`}
                              size="small"
                              color="success"
                              sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                          {allOwned && (
                            <Chip label="Already owned" size="small" color="default" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                        </Box>

                        {/* Ownership warning */}
                        {hasOwned && !allOwned && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <WarningAmberIcon sx={{ fontSize: 15, color: 'warning.main' }} />
                            <Typography variant="caption" color="warning.main">
                              You already own: {ownedInBundle.map((c) => c.title).join(', ')}
                            </Typography>
                          </Box>
                        )}

                        {/* Courses list */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mb: 1.5 }}>
                          {bundle.courses?.map((c) => (
                            <Box key={c.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <CheckCircleOutlineIcon
                                sx={{ fontSize: 14, color: enrolledCourseIds.has(c.id) ? 'success.main' : 'text.disabled' }}
                              />
                              <Typography
                                variant="caption"
                                color={enrolledCourseIds.has(c.id) ? 'text.primary' : 'text.secondary'}
                                fontWeight={enrolledCourseIds.has(c.id) ? 600 : 400}
                              >
                                {c.title}
                                {enrolledCourseIds.has(c.id) && (
                                  <Typography component="span" variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                                    (owned)
                                  </Typography>
                                )}
                              </Typography>
                            </Box>
                          ))}
                        </Box>

                        {/* Price */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="h6" color="primary" fontWeight={700}>
                            {formatCurrency(bundleAmount, bundleCurrency)}
                          </Typography>
                          {bundle.originalPrice > bundle.price && (
                            <Typography
                              variant="body2"
                              color="text.disabled"
                              sx={{ textDecoration: 'line-through' }}
                            >
                              {formatCurrency(bundle.originalPrice, bundleCurrency)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, flexDirection: 'column', gap: 1, alignItems: 'stretch' }}>
        {/* Running total — always shown when anything is selected */}
        {!nothingSelected && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 2,
              py: 1,
              borderRadius: 1,
              mb: 0.5,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {selectedIds.size > 0 && courseIsStandalone
                ? `${selectedIds.size} bundle${selectedIds.size > 1 ? 's' : ''} + this course`
                : selectedIds.size > 0
                  ? `${selectedIds.size} bundle${selectedIds.size > 1 ? 's' : ''} selected`
                  : 'This course'}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {formatCurrency(grandTotal.amount, grandTotal.currency)}
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleConfirm}
          disabled={nothingSelected}
        >
          {confirmLabel}
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={onClose}
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EnrollmentUpsellDialog;
