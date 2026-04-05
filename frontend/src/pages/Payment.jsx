import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  TextField,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useToast } from '../store';
import { enrollmentService } from '../services';
import api from '../services/api';
import * as bundleService from '../services/bundleService';
import { confirmMultiBundlePayment, confirmGuestMultiBundlePayment } from '../services/bundleService';
import { flagshipService } from '../services/flagshipService';
import { formatCurrency } from '../utils/formatters';
import { ROUTES } from '../utils/constants';

async function checkGuestEnrollment({ email, courseId, bundleIds, flagshipProgramId }) {
  const res = await api.post('/api/guest/check-enrollment', { email, courseId, bundleIds, flagshipProgramId });
  return res.data.enrolled;
}

function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [processing, setProcessing] = useState(false);
  const [anonEmail, setAnonEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [failureDialog, setFailureDialog] = useState({ open: false, message: '' });
  const [successDialog, setSuccessDialog] = useState({ open: false, message: '', navigateTo: null });

  const order = state?.order;
  const courseId = state?.courseId;
  const bundleId = state?.bundleId;
  const bundleIds = state?.bundleIds;
  const flagshipProgramId = state?.flagshipProgramId;
  const guestEmail = state?.guestEmail;
  const isAnonymous = !!state?.anonymous;
  const courseName = state?.courseName || state?.bundleName || 'course';
  const isMultiBundle = Array.isArray(bundleIds) && bundleIds.length > 0;
  const isBundle = !!bundleId;
  const isFlagship = !!flagshipProgramId;
  const isGuest = !!guestEmail;

  const effectiveEmail = isAnonymous ? anonEmail : guestEmail;

  if (!order || (!courseId && !bundleId && !bundleIds && !flagshipProgramId)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Payment information missing. Please retry enrollment from the course page.</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate(ROUTES.COURSES)}>Back to Courses</Button>
        </Box>
      </Container>
    );
  }

  const confirmPayment = async (paymentData) => {
    if (isAnonymous || isGuest) {
      const email = effectiveEmail;
      if (isFlagship) {
        await flagshipService.confirmGuestPayment(flagshipProgramId, paymentData, email);
      } else if (isMultiBundle) {
        await confirmGuestMultiBundlePayment(bundleIds, paymentData, email, courseId || null);
      } else {
        await enrollmentService.confirmGuestPayment(courseId, paymentData, email);
      }
    } else if (isMultiBundle) {
      await confirmMultiBundlePayment(bundleIds, paymentData, courseId || null);
    } else if (isBundle) {
      await bundleService.confirmBundlePayment(bundleId, paymentData);
    } else if (isFlagship) {
      await flagshipService.confirmPayment(flagshipProgramId, paymentData);
    } else {
      await enrollmentService.confirmPayment(courseId, paymentData);
    }
  };

  const handlePayNow = async () => {
    if (isAnonymous) {
      if (!anonEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(anonEmail.trim())) {
        setEmailError('Please enter a valid email address.');
        return;
      }
      setEmailError('');

      // Check if already enrolled before opening Razorpay
      try {
        const enrolled = await checkGuestEnrollment({
          email: anonEmail.trim(),
          courseId: courseId ? Number(courseId) : null,
          bundleIds: isMultiBundle ? bundleIds : bundleId ? [Number(bundleId)] : null,
          flagshipProgramId: flagshipProgramId ? Number(flagshipProgramId) : null,
        });
        if (enrolled) {
          setAlreadyEnrolled(true);
          return;
        }
      } catch {
        // If check fails, proceed — don't block payment over a non-critical check
      }
    }

    setProcessing(true);
    try {
      const paymentData = await enrollmentService.processRazorpayPayment({
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        keyId: order.keyId,
        courseName,
      });

      await confirmPayment(paymentData);
      if (isAnonymous || isGuest) {
        const email = effectiveEmail;
        const msg = `Enrollment confirmed! We've sent your access link to ${email}. Check your inbox to access your courses.`;
        setSuccessDialog({ open: true, message: msg, navigateTo: ROUTES.COURSES });
      } else {
        const msg = isMultiBundle
          ? 'Payment successful! You are now enrolled in all selected value pack courses. A confirmation email has been sent.'
          : isBundle
            ? 'Payment successful! You are now enrolled in all value pack courses. A confirmation email has been sent.'
            : 'Payment successful! Enrollment completed. A confirmation email has been sent.';
        setSuccessDialog({ open: true, message: msg, navigateTo: ROUTES.MY_COURSES });
      }
    } catch (error) {
      if (error.message === 'Payment cancelled') {
        // User cancelled - no message needed
      } else if (!isGuest && !isAnonymous && error.response?.status === 401) {
        showError('Session expired. Please login and try again.');
        navigate(ROUTES.LOGIN);
      } else {
        const msg = error.message || 'Payment failed. Please try again.';
        setFailureDialog({ open: true, message: msg });
        if (!isGuest && !isAnonymous) {
          enrollmentService.notifyPaymentFailed(
            courseId ? Number(courseId) : null,
            isMultiBundle ? bundleIds[0] : bundleId ? Number(bundleId) : null,
            msg,
            flagshipProgramId ? Number(flagshipProgramId) : null
          );
        }
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          Payment for {courseName}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Order ID: <strong>{order.orderId}</strong>
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Amount: {formatCurrency(order.amount / 100, order.currency)}
        </Typography>

        {isAnonymous && (
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={anonEmail}
              onChange={(e) => {
                setAnonEmail(e.target.value);
                setEmailError('');
                setAlreadyEnrolled(false);
              }}
              error={!!emailError}
              helperText={emailError || 'This email will be used to create your account and access your courses.'}
              disabled={processing}
              required
            />
            {alreadyEnrolled && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This email is already enrolled in this course.{' '}
                <RouterLink to={ROUTES.LOGIN} style={{ fontWeight: 600 }}>Log in to your account</RouterLink>
                {' '}or{' '}
                <RouterLink to="/forgot-password" style={{ fontWeight: 600 }}>reset your password</RouterLink>
                {' '}to access it.
              </Alert>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handlePayNow}
            disabled={processing || (isAnonymous && !anonEmail.trim()) || alreadyEnrolled}
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </Button>
          <Button onClick={() => navigate(-1)} disabled={processing}>
            Cancel
          </Button>
        </Box>
      </Paper>

      {/* Payment Success Dialog */}
      <Dialog open={successDialog.open} onClose={() => {}} disableEscapeKeyDown>
        <DialogTitle sx={{ color: 'success.main' }}>Enrollment Successful!</DialogTitle>
        <DialogContent>
          <DialogContentText>{successDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setSuccessDialog({ open: false, message: '', navigateTo: null });
              if (successDialog.navigateTo) navigate(successDialog.navigateTo);
            }}
          >
            {(isGuest || isAnonymous) ? 'OK' : 'Go to My Courses'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Failure Dialog */}
      <Dialog open={failureDialog.open} onClose={(e, reason) => { if (reason !== 'backdropClick') setFailureDialog({ open: false, message: '' }); }} disableEscapeKeyDown>
        <DialogTitle sx={{ color: 'error.main' }}>Payment Failed</DialogTitle>
        <DialogContent>
          <DialogContentText>{failureDialog.message}</DialogContentText>
          <DialogContentText sx={{ mt: 1 }}>
            If any amount was deducted from your account, it will be automatically refunded within 5–7 business days. If you do not receive a refund within this period, please contact your bank with the transaction reference details.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setFailureDialog({ open: false, message: '' });
              handlePayNow();
            }}
          >
            Try Again
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Payment;
