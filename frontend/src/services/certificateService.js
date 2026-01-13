import api from './api';

const CERTIFICATE_ENDPOINTS = {
  DOWNLOAD: (courseId) => `/api/courses/${courseId}/certificate`,
  VERIFY: (certificateId) => `/api/certificates/${certificateId}/verify`,
};

/**
 * Download certificate for a completed course
 * @param {number|string} courseId - Course ID
 * @returns {Promise<Blob>} PDF certificate blob
 */
export async function downloadCertificate(courseId) {
  const response = await api.get(CERTIFICATE_ENDPOINTS.DOWNLOAD(courseId), {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Download and save certificate as file
 * @param {number|string} courseId - Course ID
 * @param {string} courseName - Course name for filename
 */
export async function downloadAndSaveCertificate(courseId, courseName) {
  const blob = await downloadCertificate(courseId);

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${courseName.replace(/[^a-z0-9]/gi, '_')}_certificate.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Verify a certificate by ID
 * @param {string} certificateId - Certificate UUID
 * @returns {Promise<Object>} Certificate verification result
 */
export async function verifyCertificate(certificateId) {
  const response = await api.get(CERTIFICATE_ENDPOINTS.VERIFY(certificateId));
  return response.data;
}

/**
 * Check if certificate is available for a course
 * @param {Object} enrollment - Enrollment object
 * @returns {boolean} True if certificate is available
 */
export function isCertificateAvailable(enrollment) {
  return enrollment?.status === 'COMPLETED';
}

export default {
  downloadCertificate,
  downloadAndSaveCertificate,
  verifyCertificate,
  isCertificateAvailable,
};
