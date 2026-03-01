import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Checkbox, Divider, Chip, CircularProgress, Alert,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Button } from '../common';
import { getBundlesByCourse } from '../../services/bundleService';
import { formatCurrency } from '../../utils/formatters';

/**
 * Resolves the display price for a bundle based on country.
 * Returns { amount, currency }.
 */
function resolveBundlePrice(bundle, countryCode) {
  if (!countryCode || countryCode === 'IN') {
    return { amount: bundle.price, currency: 'INR' };
  }
  const cp = bundle.countryPrices?.find((p) => p.countryCode === countryCode);
  if (cp) return { amount: cp.amount, currency: cp.currencyCode };
  return { amount: bundle.price, currency: 'INR' };
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
  selectedCountry,
  displayPrice,
  enrolledCourseIds = new Set(),
  onEnrollSingle,
  onEnrollBundles,
}) {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Fetch bundles whenever dialog opens
  useEffect(() => {
    if (!open || !course?.id) return;
    let cancelled = false;
    setLoading(true);
    setSelectedIds(new Set());
    getBundlesByCourse(course.id)
      .then((data) => { if (!cancelled) setBundles(data || []); })
      .catch(() => { if (!cancelled) setBundles([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, course?.id]);

  const toggleBundle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Compute total for selected bundles
  const selectedBundles = bundles.filter((b) => selectedIds.has(b.id));
  const totalInfo = selectedBundles.reduce(
    (acc, bundle) => {
      const { amount, currency } = resolveBundlePrice(bundle, selectedCountry);
      return { amount: acc.amount + amount, currency };
    },
    { amount: 0, currency: displayPrice?.currency || 'INR' }
  );

  const handleConfirmBundles = () => {
    onEnrollBundles([...selectedIds]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalOfferIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>Bundle Deals Available</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Save more by enrolling in a bundle that includes <strong>{course?.title}</strong>
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : bundles.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="info">No bundle deals available for this course right now.</Alert>
          </Box>
        ) : (
          <Box>
            {bundles.map((bundle, idx) => {
              const { amount: bundleAmount, currency: bundleCurrency } = resolveBundlePrice(bundle, selectedCountry);
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
        {/* Running total */}
        {selectedIds.size > 0 && (
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
              {selectedIds.size} bundle{selectedIds.size > 1 ? 's' : ''} selected
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {formatCurrency(totalInfo.amount, totalInfo.currency)}
            </Typography>
          </Box>
        )}

        {/* Confirm bundles */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleConfirmBundles}
          disabled={selectedIds.size === 0}
        >
          {selectedIds.size > 0
            ? `Enroll in ${selectedIds.size} bundle${selectedIds.size > 1 ? 's' : ''} — ${formatCurrency(totalInfo.amount, totalInfo.currency)}`
            : 'Select a bundle above'}
        </Button>

        {/* Skip — single course */}
        <Button
          variant="outlined"
          fullWidth
          onClick={onEnrollSingle}
        >
          {displayPrice?.amount
            ? `Just enroll in this course — ${formatCurrency(displayPrice.amount, displayPrice.currency)}`
            : 'Just enroll in this course (Free)'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EnrollmentUpsellDialog;
