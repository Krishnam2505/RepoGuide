import axios from 'axios';

// Create a configured instance of axios
const api = axios.create({
  // Pointing to our FastAPI backend running locally (using 127.0.0.1 to avoid IPv6 localhost issues)
  baseURL: 'http://127.0.0.1:8008',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
