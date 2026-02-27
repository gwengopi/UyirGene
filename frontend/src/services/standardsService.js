import api from './api';

const BASE = '/api/standards';

const standardsService = {
  getAll: (q) => api.get(BASE, { params: q ? { q } : {} }).then((r) => r.data),

  download: async (id, fileName) => {
    const response = await api.get(`${BASE}/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'document');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Admin
  create: (fd) => api.post(`${BASE}/admin`, fd).then((r) => r.data),
  update: (id, fd) => api.put(`${BASE}/admin/${id}`, fd).then((r) => r.data),
  delete: (id) => api.delete(`${BASE}/admin/${id}`).then((r) => r.data),
};

export default standardsService;
