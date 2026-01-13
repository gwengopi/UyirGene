import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, Alert } from '@mui/material';
import { useToast } from '../store';
import { enrollmentService } from '../services';
import { formatCurrency } from '../utils/formatters';
import { ROUTES } from '../utils/constants';

function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [processing, setProcessing] = useState(false);

  const order = state?.order;
  const courseId = state?.courseId;
  const courseName = state?.courseName || 'course';

  if (!order || !courseId) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Payment information missing. Please retry enrollment from the course page.</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate(ROUTES.COURSES)}>Back to Courses</Button>
        </Box>
      </Container>
    );
  }

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

      await enrollmentService.confirmPayment(courseId, paymentData);
      showSuccess('Payment successful! Enrollment completed.');
      navigate(ROUTES.MY_COURSES);
    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        showError(error.message || 'Payment failed');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulate = async () => {
    // Useful for dev with mock payment provider
    setProcessing(true);
    try {
      const mock = {
        razorpayPaymentId: `mock_pay_${Date.now()}`,
        razorpayOrderId: order.orderId,
        razorpaySignature: 'mock_signature',
      };
      await enrollmentService.confirmPayment(courseId, mock);
      showSuccess('Mock payment confirmed. Enrollment completed.');
      navigate(ROUTES.MY_COURSES);
    } catch (error) {
      showError(error.message || 'Failed to confirm mock payment');
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
            Pay Now
          </Button>
          <Button variant="outlined" onClick={handleSimulate} disabled={processing}>
            Simulate Payment
          </Button>
          <Button onClick={() => navigate(-1)} disabled={processing}>
            Cancel
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Payment;