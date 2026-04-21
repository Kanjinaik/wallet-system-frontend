import axios from 'axios';

// Create axios instance
const api = axios.create({
    // Use Vite proxy so browser stays on one port (frontend port).
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: false // Disable credentials to avoid CORS issues
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (!error.config?.skipErrorLog) {
            console.error('API Response Error:', error.response?.status, error.config?.url, error.response?.data);
        }
        
        if (error.response?.status === 401) {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Show user-friendly message
            if (window.location.pathname !== '/login') {
                alert('Your session has expired. Please login again.');
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
