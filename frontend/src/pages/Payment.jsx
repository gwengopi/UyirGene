import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import { useToast } from '../store';
import { enrollmentService } from '../services';
import * as bundleService from '../services/bundleService';
import { confirmMultiBundlePayment, confirmGuestMultiBundlePayment, confirmAnonMultiBundlePayment } from '../services/bundleService';
import { flagshipService } from '../services/flagshipService';
import { formatCurrency } from '../utils/formatters';
import { ROUTES } from '../utils/constants';

function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [processing, setProcessing] = useState(false);
  const [failureDialog, setFailureDialog] = useState({ open: false, message: '' });
  const [successDialog, setSuccessDialog] = useState({ open: false, message: '', navigateTo: null });

  const order = state?.order;
  const courseId = state?.courseId;     // single-course enrollment OR standalone courseId in a multi-bundle payment
  const bundleId = state?.bundleId;
  const bundleIds = state?.bundleIds;   // array — multi-bundle enrollment
  const flagshipProgramId = state?.flagshipProgramId;
  const guestEmail = state?.guestEmail; // present for guest (unauthenticated) enrollment with modal
  const isAnonymous = !!state?.anonymous; // Razorpay-collect flow — no pre-collected email
  const courseName = state?.courseName || state?.bundleName || 'course';
  const isMultiBundle = Array.isArray(bundleIds) && bundleIds.length > 0;
  const isBundle = !!bundleId;
  const isFlagship = !!flagshipProgramId;
  const isGuest = !!guestEmail;

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
    if (isAnonymous) {
      // Anonymous flow — backend fetches contact details from Razorpay
      if (isFlagship) {
        await flagshipService.confirmAnonPayment(flagshipProgramId, paymentData);
      } else if (isMultiBundle) {
        await confirmAnonMultiBundlePayment(bundleIds, paymentData, courseId || null);
      } else {
        await enrollmentService.confirmAnonPayment(courseId, paymentData);
      }
    } else if (isGuest) {
      // Guest (unauthenticated) confirmation — use guest endpoints
      if (isFlagship) {
        await flagshipService.confirmGuestPayment(flagshipProgramId, paymentData, guestEmail);
      } else if (isMultiBundle) {
        await confirmGuestMultiBundlePayment(bundleIds, paymentData, guestEmail, courseId || null);
      } else {
        await enrollmentService.confirmGuestPayment(courseId, paymentData, guestEmail);
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
        const msg = isAnonymous
          ? 'Enrollment confirmed! Check your email (the one you entered in Razorpay) for your access link.'
          : `Enrollment confirmed! We've sent your access link to ${guestEmail}. Check your inbox.`;
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
      } else if (!isGuest && error.response?.status === 401) {
        showError('Session expired. Please login and try again.');
        navigate(ROUTES.LOGIN);
      } else {
        const msg = error.message || 'Payment failed. Please try again.';
        setFailureDialog({ open: true, message: msg });
        if (!isGuest) {
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

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handlePayNow} disabled={processing}>
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