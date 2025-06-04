import axios from 'axios';
import config from '../config';

const API_URL = 'https://adultplatform.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 