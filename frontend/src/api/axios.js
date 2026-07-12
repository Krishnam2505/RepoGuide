import axios from 'axios';

// Create a configured instance of axios
const api = axios.create({
  // Pointing to our FastAPI backend running locally
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
