import api from './api';

export const getMailTemplates = () => api.get('/api/mail-templates/admin');
export const updateMailTemplate = (id, data) => api.put(`/api/mail-templates/admin/${id}`, data);
