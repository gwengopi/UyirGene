import api from './api';

const ENROLLMENT_ENDPOINTS = {
  ENROLL: (courseId) => `/api/courses/${courseId}/enroll`,
  CONFIRM: (courseId) => `/api/courses/${courseId}/enroll/confirm`,
  ENROLLED: '/api/courses/enrolled',
  UNENROLL: (courseId) => `/api/courses/${courseId}/enroll`,
  COMPLETE: (courseId) => `/api/courses/${courseId}/complete`,
};

/**
 * Start enrollment process for a course
 * For free courses: immediately enrolls the user
 * For paid courses: returns Razorpay order details
 * @param {number|string} courseId - Course ID
 * @param {string} [countryCode] - Country code for multi-currency pricing (e.g. "US", "GB")
 * @returns {Promise<Object>} Enrollment result or payment order details
 */
export async function startEnrollment(courseId, countryCode) {
  const body = countryCode ? { countryCode } : {};
  const response = await api.post(ENROLLMENT_ENDPOINTS.ENROLL(courseId), body);
  return response.data;
}

/**
 * Confirm payment for course enrollment
 * @param {number|string} courseId - Course ID
 * @param {Object} paymentData - Razorpay payment confirmation data
 * @param {string} paymentData.razorpayPaymentId - Razorpay payment ID
 * @param {string} paymentData.razorpayOrderId - Razorpay order ID
 * @param {string} paymentData.razorpaySignature - Razorpay signature
 * @returns {Promise<void>}
 */
export async function confirmPayment(courseId, paymentData) {
  await api.post(ENROLLMENT_ENDPOINTS.CONFIRM(courseId), paymentData);
}

/**
 * Get all enrolled courses for current user
 * @returns {Promise<Array>} List of enrolled courses
 */
export async function getEnrolledCourses() {
  const response = await api.get(ENROLLMENT_ENDPOINTS.ENROLLED);
  return response.data;
}

export async function unenroll(courseId) {
  await api.delete(ENROLLMENT_ENDPOINTS.UNENROLL(courseId));
}

export async function markComplete(courseId) {
  await api.post(ENROLLMENT_ENDPOINTS.COMPLETE(courseId));
}

/**
 * Check if user is enrolled in a specific course
 * @param {number|string} courseId - Course ID
 * @param {Array} enrolledCourses - List of enrolled courses
 * @returns {boolean} True if enrolled
 */
export function isEnrolledInCourse(courseId, enrolledCourses) {
  if (!enrolledCourses || !Array.isArray(enrolledCourses)) return false;
  return enrolledCourses.some((course) => course.id === Number(courseId));
}

/**
 * Load Razorpay script dynamically
 * @returns {Promise<boolean>} True if script loaded successfully
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      // Verify Razorpay object exists after load
      resolve(typeof window.Razorpay === 'function');
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Process Razorpay payment
 * @param {Object} options - Payment options
 * @param {string} options.orderId - Razorpay order ID
 * @param {number} options.amount - Amount in paise
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.keyId - Razorpay key ID
 * @param {string} options.courseName - Course name for description
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<void>}
 */
/**
 * Restore body scroll after Razorpay modal closes
 * Razorpay adds overflow:hidden to body which sometimes isn't removed on failure
 */
function cleanupRazorpay() {
  // Restore body scroll
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
  document.body.style.height = '';
  document.documentElement.style.overflow = '';

  // Remove all Razorpay-injected DOM elements
  document.querySelectorAll(
    '.razorpay-container, .razorpay-backdrop, iframe[src*="razorpay"], [class*="razorpay"]'
  ).forEach((el) => el.remove());

  // Remove the script tag and clear window.Razorpay so it reloads fresh next time
  document.querySelectorAll('script[src*="razorpay"]').forEach((el) => el.remove());
  delete window.Razorpay;
}

export async function processRazorpayPayment(options) {
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: options.keyId,
      amount: options.amount,
      currency: options.currency || 'INR',
      order_id: options.orderId,
      name: 'Uyirgene',
      description: `Enrollment for ${options.courseName || 'course'}`,
      handler: function (response) {
        cleanupRazorpay();
        resolve({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          cleanupRazorpay();
          reject(new Error('Payment cancelled'));
        },
      },
      theme: {
        color: '#4f6672',
      },
    });

    rzp.on('payment.failed', function (response) {
      cleanupRazorpay();
      reject(new Error(response.error.description || 'Payment failed'));
    });

    rzp.open();
  });
}

/**
 * Notify backend of a payment failure so a failure email can be sent to the user.
 * Non-throwing — failure to notify should not block the UI.
 */
export async function notifyPaymentFailed(courseId, bundleId, reason) {
  try {
    await api.post('/api/payment/failed', { courseId, bundleId, reason });
  } catch (e) {
    // Non-critical — don't propagate
  }
}

export default {
  startEnrollment,
  confirmPayment,
  getEnrolledCourses,
  isEnrolledInCourse,
  loadRazorpayScript,
  processRazorpayPayment,
  notifyPaymentFailed,
  unenroll,
  markComplete,
};
