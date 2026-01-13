import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8080' })

// Initialize default header from localStorage if present
const stored = localStorage.getItem('uyir_auth')
if (stored) api.defaults.headers.common['Authorization'] = stored

// Keep interceptor as fallback (useful if other code modifies localStorage)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('uyir_auth')
  if (token) config.headers['Authorization'] = token
  return config
})

export function setAuthHeader(token) {
  localStorage.setItem('uyir_auth', token)
  api.defaults.headers.common['Authorization'] = token
}

export function clearAuthHeader() {
  localStorage.removeItem('uyir_auth')
  delete api.defaults.headers.common['Authorization']
}

export default api
