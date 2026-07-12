import axios from 'axios';

// Create a configured instance of axios
const api = axios.create({
  // Pointing to our deployed backend OR falling back to local dev
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8008',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
