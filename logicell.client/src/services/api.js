import axios from 'axios';

// 1. CONFIGURACIÓN BASE
// Aquí definimos la ruta principal. Solo la escribimos una vez.
const api = axios.create({
    baseURL: 'https://localhost:7235/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. MÓDULO DE AUTENTICACIÓN
export const authService = {
    login: async (credenciales) => {
        // Axios automáticamente une la baseURL con '/Auth/login'
        const response = await api.post('/Auth/login', credenciales);
        return response;
    }
};

// 3. MÓDULO DE USUARIOS
export const usuariosService = {
    obtenerTodos: async () => {
        const response = await api.get('/Usuarios');
        return response.data;
    },
    crear: async (datos) => {
        const response = await api.post('/Usuarios', datos);
        return response.data;
    },
    editar: async (id, datos) => {
        const response = await api.put(`/Usuarios/${id}`, datos);
        return response.data;
    },
    toggleEstado: async (id) => {
        const response = await api.put(`/Usuarios/toggle-estado/${id}`);
        return response.data;
    }
};


export default api;