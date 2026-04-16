import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, CircularProgress, Button, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { enrollmentService } from '../services';
import { flagshipService } from '../services/flagshipService';
import * as bundleService from '../services/bundleService';
import { confirmMultiBundlePayment, confirmGuestMultiBundlePayment } from '../services/bundleService';
import api from '../services/api';
import { ROUTES } from '../utils/constants';

/**
 * Landing page for Razorpay redirect-based payments (e.g. international 3DS/PSD2).
 * Razorpay redirects here with payment params in the URL after the user completes
 * authentication on their bank's page. We read the payment context from sessionStorage
 * (stored before Razorpay was opened) and call the appropriate confirm endpoint.
 */
function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const razorpayPaymentId = searchParams.get('razorpay_payment_id');
    const razorpayOrderId = searchParams.get('razorpay_order_id');
    const razorpaySignature = searchParams.get('razorpay_signature');

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      setStatus('error');
      setMessage('Payment information missing. If you were charged, please contact support.');
      return;
    }

    const ctxRaw = sessionStorage.getItem('ug_payment_ctx');
    if (!ctxRaw) {
      // No context — webhook should have already handled this. Show a friendly message.
      setStatus('success');
      setMessage('Payment received! Your enrollment is being processed. Check your email for access details.');
      sessionStorage.removeItem('ug_payment_ctx');
      return;
    }

    const ctx = JSON.parse(ctxRaw);
    sessionStorage.removeItem('ug_payment_ctx');

    const paymentData = { razorpayPaymentId, razorpayOrderId, razorpaySignature };

    const confirm = async () => {
      const { courseId, flagshipProgramId, bundleId, bundleIds, guestEmail, isAnonymous, isGuest } = ctx;
      const isMultiBundle = Array.isArray(bundleIds) && bundleIds.length > 0;

      if (isAnonymous) {
        // Anonymous flow — no email collected upfront; backend fetches it from Razorpay
        if (flagshipProgramId) {
          await flagshipService.confirmAnonPayment(flagshipProgramId, paymentData);
        } else if (isMultiBundle) {
          await confirmGuestMultiBundlePayment(bundleIds, paymentData, '', courseId || null);
        } else {
          await enrollmentService.confirmAnonPayment(courseId, paymentData);
        }
      } else if (isGuest) {
        const email = guestEmail || '';
        if (flagshipProgramId) {
          await flagshipService.confirmGuestPayment(flagshipProgramId, paymentData, email);
        } else if (isMultiBundle) {
          await confirmGuestMultiBundlePayment(bundleIds, paymentData, email, courseId || null);
        } else {
          await enrollmentService.confirmGuestPayment(courseId, paymentData, email);
        }
      } else if (isMultiBundle) {
        await confirmMultiBundlePayment(bundleIds, paymentData, courseId || null);
      } else if (bundleId) {
        await bundleService.confirmBundlePayment(bundleId, paymentData);
      } else if (flagshipProgramId) {
        await flagshipService.confirmPayment(flagshipProgramId, paymentData);
      } else {
        await enrollmentService.confirmPayment(courseId, paymentData);
      }
    };

    confirm()
      .then(() => {
        const isGuestFlow = ctx.isAnonymous || ctx.isGuest;
        if (isGuestFlow) {
          setMessage(`Enrollment confirmed! We've sent your access link to ${ctx.guestEmail || 'your email'}. Check your inbox.`);
        } else {
          setMessage('Payment successful! You are now enrolled. A confirmation email has been sent.');
        }
        setStatus('success');
      })
      .catch((err) => {
        // Confirm failed — webhook may still save them. Show a soft message.
        const msg = err?.response?.data?.message || err?.message || '';
        if (msg.toLowerCase().includes('already enrolled')) {
          setStatus('success');
          setMessage('You are already enrolled in this course. Check your email for access.');
        } else {
          setStatus('error');
          setMessage(
            'We received your payment but could not confirm enrollment automatically. ' +
            'Please contact support with your payment ID: ' + razorpayPaymentId
          );
          // Notify backend so admin is aware
          api.post('/api/payment/failed', {
            courseId: ctx.courseId,
            bundleId: Array.isArray(ctx.bundleIds) ? ctx.bundleIds[0] : ctx.bundleId,
            flagshipId: ctx.flagshipProgramId,
            reason: 'Callback confirm failed: ' + msg,
          }).catch(() => {});
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Paper sx={{ p: 5, textAlign: 'center' }}>
        {status === 'processing' && (
          <>
            <CircularProgress size={56} sx={{ mb: 3 }} />
            <Typography variant="h6">Confirming your enrollment…</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please wait, do not close this page.
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>Enrollment Confirmed!</Typography>
            <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>{message}</Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" onClick={() => navigate(ROUTES.MY_COURSES)}>
                Go to My Courses
              </Button>
              <Button variant="outlined" onClick={() => navigate(ROUTES.HOME)}>
                Home
              </Button>
            </Box>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" fontWeight={700} gutterBottom>Action Required</Typography>
            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>{message}</Alert>
            <Button variant="contained" onClick={() => navigate(ROUTES.HOME)}>
              Go to Home
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default PaymentCallback;
