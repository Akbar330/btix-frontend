import axios from 'axios';

export const asArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.tickets)) return value.tickets;
    if (Array.isArray(value?.transactions)) return value.transactions;
    return [];
};

export const asObject = (value, keys = []) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    for (const key of keys) {
        if (value[key] && typeof value[key] === 'object' && !Array.isArray(value[key])) {
            return value[key];
        }
    }
    if (value.data && typeof value.data === 'object' && !Array.isArray(value.data)) {
        return value.data;
    }
    return value;
};

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
