import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from './useToast.jsx';

export function usePayment(auth) {
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const enrollInCourse = async (courseId, onSuccess) => {
    if (!auth?.token) {
      navigate('/login');
      return;
    }

    setProcessing(true);
    try {
      const res = await api.post(`/api/courses/${courseId}/enroll`);
      const data = res.data;

      if (data && data.order && data.order.orderId) {
        // Paid course - mock payment flow
        showToast('Processing mock payment...', 'info');

        // Simulate payment delay (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate mock payment credentials
        const mockPaymentId = `pay_mock_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        const mockSignature = `mock_signature_${Math.random().toString(36).substring(2)}`;

        // Confirm payment with backend
        await api.post(`/api/courses/${courseId}/enroll/confirm`, {
          razorpayPaymentId: mockPaymentId,
          razorpayOrderId: data.order.orderId,
          razorpaySignature: mockSignature
        });

        showToast('Payment successful! Enrollment complete.', 'success');
        if (onSuccess) onSuccess();
      } else {
        // Free course
        showToast('Successfully enrolled in free course!', 'success');
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      const errorMessage = e.response?.data?.message || e.message || 'Enrollment failed';
      showToast(`Enrollment failed: ${errorMessage}`, 'error');
    } finally {
      setProcessing(false);
    }
  };

  return { enrollInCourse, processing };
}
