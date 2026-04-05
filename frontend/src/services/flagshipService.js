import api from './api';

const BASE = '/api/flagship';

export const flagshipService = {
  // ── Public ────────────────────────────────────────────────────────────────
  getActivePrograms: () => api.get(BASE, { cache: true, cacheTTL: 60_000 }).then((r) => r.data),
  getProgramById: (id) => api.get(`${BASE}/${id}`).then((r) => r.data),
  getProgramBySlug: (slug) => api.get(`${BASE}/slug/${slug}`).then((r) => r.data),

  // ── Enrollment ────────────────────────────────────────────────────────────
  startEnrollment: (id, countryCode) =>
    api.post(`${BASE}/${id}/enroll`, countryCode ? { countryCode } : {}).then((r) => r.data),

  confirmPayment: (id, paymentData) =>
    api.post(`${BASE}/${id}/enroll/confirm`, paymentData).then((r) => r.data),

  // ── Guest enrollment (unauthenticated) ───────────────────────────────────
  startGuestEnrollment: (id, guestInfo, countryCode) =>
    api.post(`/api/guest/flagship/${id}/enroll`, { ...guestInfo, countryCode: countryCode || null }).then((r) => r.data),

  confirmGuestPayment: (id, paymentData, email) =>
    api.post(`/api/guest/flagship/${id}/enroll/confirm`, { email, ...paymentData }).then((r) => r.data),

  // ── Anonymous enrollment (Razorpay collects contact details) ──────────────
  startAnonEnrollment: (id, countryCode) =>
    api.post(`/api/guest/flagship/${id}/anon-enroll`, { countryCode: countryCode || null }).then((r) => r.data),

  confirmAnonPayment: (id, paymentData) =>
    api.post(`/api/guest/flagship/${id}/anon-confirm`, paymentData).then((r) => r.data),

  getEnrolledPrograms: () => api.get(`${BASE}/enrolled`).then((r) => r.data),

  unenroll: (id) => api.delete(`${BASE}/${id}/enroll`).then((r) => r.data),

  isEnrolledInProgram: (programId, enrolledPrograms) => {
    if (!enrolledPrograms || !Array.isArray(enrolledPrograms)) return false;
    return enrolledPrograms.some((p) => p.id === Number(programId));
  },

  // ── Certificate (enrolled users only) ────────────────────────────────────
  downloadCertificate: (id) =>
    api.get(`${BASE}/${id}/certificate/download`, { responseType: 'blob' }).then((r) => r.data),

  downloadAndSaveCertificate: async (id, programName) => {
    const blob = await flagshipService.downloadCertificate(id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${programName.replace(/[^a-z0-9]/gi, '_')}_certificate.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // ── Videos (enrolled users only) ─────────────────────────────────────────
  getVideos: (id) => api.get(`${BASE}/${id}/videos`).then((r) => r.data),

  // ── Flagship video progress ───────────────────────────────────────────────
  updateVideoProgress: (videoId, lastPositionSeconds, completed) => {
    const payload = { lastPositionSeconds };
    if (completed) payload.completed = true;
    return api.post(`/api/flagship-videos/${videoId}/progress`, payload).then((r) => r.data);
  },

  getVideoProgress: async (videoId) => {
    try {
      const r = await api.get(`/api/flagship-videos/${videoId}/progress`);
      return r.data;
    } catch (e) {
      if (e.response?.status === 404 || e.response?.status === 401) return null;
      throw e;
    }
  },

  getMultipleVideoProgress: async (videoIds) => {
    const progressMap = {};
    await Promise.all(
      videoIds.map(async (videoId) => {
        const p = await flagshipService.getVideoProgress(videoId);
        if (p) progressMap[videoId] = p;
      })
    );
    return progressMap;
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  getAllPrograms: () => api.get(`${BASE}/admin`).then((r) => r.data),

  createProgram: (formData) =>
    api
      .post(`${BASE}/admin`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),

  updateProgram: (id, formData) =>
    api
      .put(`${BASE}/admin/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),

  deleteProgram: (id) => api.delete(`${BASE}/admin/${id}`),

  toggleActive: (id) => api.patch(`${BASE}/admin/${id}/toggle-active`).then((r) => r.data),
};
