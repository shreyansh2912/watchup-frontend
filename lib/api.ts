import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token and channel ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeChannelId = localStorage.getItem('activeChannelId');
    if (activeChannelId) {
      config.headers['X-Channel-Id'] = activeChannelId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
