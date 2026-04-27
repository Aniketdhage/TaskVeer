import axios from 'axios';

// Always use the same-origin /api proxy (see next.config.ts rewrites).
// This ensures cookies are set on the frontend domain — fixing cross-domain
// cookie blocking that prevents the middleware from reading the auth token.
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export default api;
