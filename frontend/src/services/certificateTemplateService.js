import api from './api';

const TEMPLATE_ENDPOINTS = {
  LIST: '/api/admin/certificate-templates',
  ACTIVE: '/api/admin/certificate-templates/active',
  GLOBAL: '/api/admin/certificate-templates/global',
  DETAIL: (id) => `/api/admin/certificate-templates/${id}`,
  FOR_COURSE: (courseId) => `/api/admin/certificate-templates/course/${courseId}`,
  SET_DEFAULT: (id) => `/api/admin/certificate-templates/${id}/set-default`,
  TEMPLATE_FILE: (id) => `/api/admin/certificate-templates/${id}/template-file`,
  BACKGROUND_IMAGE: (id) => `/api/admin/certificate-templates/${id}/background-image`,
};

export const CERTIFICATE_TYPES = {
  COMPLETION: 'COMPLETION',
  PARTICIPATION: 'PARTICIPATION',
};

/**
 * Get all certificate templates (Admin only)
 * @returns {Promise<Array>} List of templates
 */
export async function getAllTemplates() {
  const response = await api.get(TEMPLATE_ENDPOINTS.LIST);
  return response.data;
}

/**
 * Get all active certificate templates (Admin only)
 * @returns {Promise<Array>} List of active templates
 */
export async function getActiveTemplates() {
  const response = await api.get(TEMPLATE_ENDPOINTS.ACTIVE);
  return response.data;
}

/**
 * Get global templates (not course-specific)
 * @returns {Promise<Array>} List of global templates
 */
export async function getGlobalTemplates() {
  const response = await api.get(TEMPLATE_ENDPOINTS.GLOBAL);
  return response.data;
}

/**
 * Get a specific template by ID
 * @param {number|string} id - Template ID
 * @returns {Promise<Object>} Template details
 */
export async function getTemplate(id) {
  const response = await api.get(TEMPLATE_ENDPOINTS.DETAIL(id));
  return response.data;
}

/**
 * Get templates for a specific course
 * @param {number|string} courseId - Course ID
 * @returns {Promise<Array>} List of templates for the course
 */
export async function getTemplatesForCourse(courseId) {
  const response = await api.get(TEMPLATE_ENDPOINTS.FOR_COURSE(courseId));
  return response.data;
}

/**
 * Create a new certificate template
 * @param {FormData} formData - Template data including files
 * @returns {Promise<Object>} Created template
 */
export async function createTemplate(formData) {
  const response = await api.post(TEMPLATE_ENDPOINTS.LIST, formData);
  return response.data;
}

/**
 * Update an existing template
 * @param {number|string} id - Template ID
 * @param {FormData} formData - Updated template data
 * @returns {Promise<Object>} Updated template
 */
export async function updateTemplate(id, formData) {
  const response = await api.put(TEMPLATE_ENDPOINTS.DETAIL(id), formData);
  return response.data;
}

/**
 * Delete a certificate template
 * @param {number|string} id - Template ID
 * @returns {Promise<void>}
 */
export async function deleteTemplate(id) {
  await api.delete(TEMPLATE_ENDPOINTS.DETAIL(id));
}

/**
 * Set a template as the default for its type
 * @param {number|string} id - Template ID
 * @returns {Promise<Object>} Updated template
 */
export async function setAsDefault(id) {
  const response = await api.post(TEMPLATE_ENDPOINTS.SET_DEFAULT(id));
  return response.data;
}

/**
 * Get template file download URL
 * @param {number|string} id - Template ID
 * @returns {string} Download URL
 */
export function getTemplateFileUrl(id) {
  return TEMPLATE_ENDPOINTS.TEMPLATE_FILE(id);
}

/**
 * Get background image URL
 * @param {number|string} id - Template ID
 * @returns {string} Image URL
 */
export function getBackgroundImageUrl(id) {
  return TEMPLATE_ENDPOINTS.BACKGROUND_IMAGE(id);
}

/**
 * Download template file
 * @param {number|string} id - Template ID
 * @returns {Promise<Blob>} Template file blob
 */
export async function downloadTemplateFile(id) {
  const response = await api.get(TEMPLATE_ENDPOINTS.TEMPLATE_FILE(id), {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Helper to create FormData for template
 * @param {Object} data - Template data
 * @returns {FormData} FormData object
 */
export function createTemplateFormData(data) {
  const formData = new FormData();

  if (data.name) formData.append('name', data.name);
  if (data.type) formData.append('type', data.type);
  if (data.courseId) formData.append('courseId', data.courseId);
  if (data.headerText) formData.append('headerText', data.headerText);
  if (data.bodyTemplate) formData.append('bodyTemplate', data.bodyTemplate);
  if (data.templateConfig) formData.append('templateConfig', data.templateConfig);
  if (data.isDefault !== undefined) formData.append('isDefault', data.isDefault);
  if (data.active !== undefined) formData.append('active', data.active);
  if (data.templateFile) formData.append('templateFile', data.templateFile);
  if (data.backgroundImage) formData.append('backgroundImage', data.backgroundImage);
  if (data.removeTemplateFile) formData.append('removeTemplateFile', data.removeTemplateFile);
  if (data.removeBackgroundImage) formData.append('removeBackgroundImage', data.removeBackgroundImage);

  return formData;
}

/**
 * Default template configuration for PDF certificates
 * Coordinates are in PDF points (1 point = 1/72 inch)
 * Origin (0,0) is at bottom-left of the page
 * A4 page size: 595 x 842 points
 */
export const DEFAULT_TEMPLATE_CONFIG = {
  certificateType: {
    x: 297.5, y: 600, fontSize: 28, fontColor: '#2C3E50',
    centered: true, visible: true, fontStyle: 'normal', fontFamily: 'anton',
  },
  studentName: {
    x: 297.5, y: 500, fontSize: 24, fontColor: '#2980B9',
    centered: true, visible: true, fontStyle: 'normal', fontFamily: 'anton',
  },
  courseTitle: {
    x: 297.5, y: 420, fontSize: 20, fontColor: '#2C3E50',
    centered: true, visible: true, fontStyle: 'normal', fontFamily: 'anton',
  },
  courseCode: {
    x: 297.5, y: 395, fontSize: 10, fontColor: '#969696',
    centered: true, visible: true, fontStyle: 'normal', fontFamily: 'oswald',
    label: 'Course Number :',
  },
  trainerName: {
    x: 297.5, y: 280, fontSize: 12, fontColor: '#636363',
    centered: true, visible: true, fontStyle: 'normal', fontFamily: 'oswald',
    label: 'Lead Trainer :',
  },
  shortDescription: {
    x: 297.5, y: 260, fontSize: 10, fontColor: '#636363',
    centered: true, visible: false, fontStyle: 'normal', fontFamily: 'oswald',
  },
  trainingDuration: {
    x: 297.5, y: 242, fontSize: 10, fontColor: '#636363',
    centered: true, visible: false, fontStyle: 'normal', fontFamily: 'oswald',
    label: 'Duration of Training :',
  },
  issueDate: {
    x: 297.5, y: 350, fontSize: 12, fontColor: '#636363',
    centered: true, visible: true, fontStyle: 'italic', fontFamily: 'oswald',
    label: 'Issued Date :',
  },
  certificateId: {
    x: 297.5, y: 320, fontSize: 10, fontColor: '#969696',
    centered: true, visible: true, fontStyle: 'normal', fontFamily: 'oswald',
    label: 'Certificate Number :',
  },
  marks: {
    x: 297.5, y: 380, fontSize: 12, fontColor: '#636363',
    centered: true, visible: true, fontStyle: 'normal', fontFamily: 'oswald',
  },
  qrCode: {
    x: 262.5, y: 150, size: 70, visible: true,
  },
  scanText: {
    x: 297.5, y: 135, fontSize: 8, fontColor: '#969696',
    centered: true, visible: true, fontStyle: 'normal', fontFamily: 'oswald',
  },
  certifyText: {
    x: 297.5, y: 540, fontSize: 14, fontColor: '#636363',
    centered: true, visible: true, text: 'This is to certify that',
    fontStyle: 'normal', fontFamily: 'oswald',
  },
  completedText: {
    x: 297.5, y: 460, fontSize: 14, fontColor: '#636363',
    centered: true, visible: true, fontStyle: 'normal', fontFamily: 'oswald',
  },
};

export default {
  getAllTemplates,
  getActiveTemplates,
  getGlobalTemplates,
  getTemplate,
  getTemplatesForCourse,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  setAsDefault,
  getTemplateFileUrl,
  getBackgroundImageUrl,
  downloadTemplateFile,
  createTemplateFormData,
  CERTIFICATE_TYPES,
  DEFAULT_TEMPLATE_CONFIG,
};
