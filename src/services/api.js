import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Create axios instance with defaults
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Recursive function to map _id to id
const mapIds = (data) => {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
        return data.map(mapIds);
    }

    const mapped = { ...data };
    if (mapped._id && !mapped.id) {
        mapped.id = mapped._id.toString();
    }

    for (const key in mapped) {
        mapped[key] = mapIds(mapped[key]);
    }

    return mapped;
};

// Map _id to id in all responses
api.interceptors.response.use((response) => {
    if (response.data && response.data.data) {
        response.data.data = mapIds(response.data.data);
    }
    return response;
});

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

// Room API
export const roomAPI = {
    getRooms: () => api.get('/rooms'),
    createRoom: (data) => api.post('/rooms', data),
    getRoom: (id) => api.get(`/rooms/${id}`),
    updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
    deleteRoom: (id) => api.delete(`/rooms/${id}`),
    joinRoom: (id) => api.post(`/rooms/${id}/join`),
    leaveRoom: (id) => api.post(`/rooms/${id}/leave`),
};

// File API
export const fileAPI = {
    getFiles: (roomId) => api.get(`/rooms/${roomId}/files`),
    createFile: (roomId, data) => api.post(`/rooms/${roomId}/files`, data),
    getFile: (roomId, fileId) => api.get(`/rooms/${roomId}/files/${fileId}`),
    updateFile: (roomId, fileId, data) => api.put(`/rooms/${roomId}/files/${fileId}`, data),
    deleteFile: (roomId, fileId) => api.delete(`/rooms/${roomId}/files/${fileId}`),
};

export default api;
