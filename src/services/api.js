import axios from 'axios';

const api = axios.create({
    // Vercel deployment me environment variable set karenge, locally 5000 use hoga
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
