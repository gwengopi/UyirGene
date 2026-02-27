import api from './api';

const BASE = '/api/marketing';

const marketingService = {
  triggerCampaign: (data) => api.post(`${BASE}/campaigns`, data).then(r => r.data),
  getHistory: () => api.get(`${BASE}/campaigns`).then(r => r.data),
  getActive: () => api.get(`${BASE}/campaigns/active`).then(r => r.data),
  getEstimate: () => api.get(`${BASE}/campaigns/estimate`).then(r => r.data),
  lookupCode: (code) => api.get(`${BASE}/campaigns/lookup-code`, { params: { code } }).then(r => r.data),
  cancelCampaign: (id) => api.post(`${BASE}/campaigns/${id}/cancel`).then(r => r.data),
  unsubscribe: (token) => api.get(`${BASE}/unsubscribe`, { params: { token } }).then(r => r.data),
  getSettings: () => api.get(`${BASE}/settings`).then(r => r.data),
};

export default marketingService;
