import api from './api';

const courseBase = (courseId) => `/api/courses/${courseId}/manuals`;
const flagshipBase = (programId) => `/api/flagship/${programId}/manuals`;

// ── Course manuals ────────────────────────────────────────────────────────────

export async function getCourseManuals(courseId) {
  const res = await api.get(courseBase(courseId));
  return res.data;
}

export async function uploadCourseManual(courseId, label, file, displayOrder = 0) {
  const fd = new FormData();
  fd.append('label', label);
  fd.append('displayOrder', displayOrder);
  fd.append('file', file);
  const res = await api.post(courseBase(courseId), fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteCourseManual(courseId, manualId) {
  await api.delete(`${courseBase(courseId)}/${manualId}`);
}

export function getCourseManualDownloadUrl(courseId, manualId) {
  return `${api.defaults.baseURL || ''}${courseBase(courseId)}/${manualId}/download`;
}

// ── Flagship manuals ──────────────────────────────────────────────────────────

export async function getFlagshipManuals(programId) {
  const res = await api.get(flagshipBase(programId));
  return res.data;
}

export async function uploadFlagshipManual(programId, label, file, displayOrder = 0) {
  const fd = new FormData();
  fd.append('label', label);
  fd.append('displayOrder', displayOrder);
  fd.append('file', file);
  const res = await api.post(flagshipBase(programId), fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteFlagshipManual(programId, manualId) {
  await api.delete(`${flagshipBase(programId)}/${manualId}`);
}

export function getFlagshipManualDownloadUrl(programId, manualId) {
  return `${api.defaults.baseURL || ''}${flagshipBase(programId)}/${manualId}/download`;
}

export default {
  getCourseManuals,
  uploadCourseManual,
  deleteCourseManual,
  getCourseManualDownloadUrl,
  getFlagshipManuals,
  uploadFlagshipManual,
  deleteFlagshipManual,
  getFlagshipManualDownloadUrl,
};
