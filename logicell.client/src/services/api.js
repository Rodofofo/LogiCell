import axios from 'axios';

// 1. CONFIGURACIÓN BASE
const api = axios.create({
    baseURL: 'https://localhost:7235/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. MÓDULO DE AUTENTICACIÓN
export const authService = {
    login: async (credenciales) => {
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

// 4. MÓDULO DE REPUESTOS (NUEVO)
export const repuestosService = {
    obtenerTodos: async () => {
        const response = await api.get('/Repuestos');
        return response.data;
    },
    crear: async (datos) => {
        const response = await api.post('/Repuestos', datos);
        return response.data;
    },
    editar: async (id, datos) => {
        const response = await api.put(`/Repuestos/${id}`, datos);
        return response.data;
    },
    darDeBaja: async (id) => {
        const response = await api.put(`/Repuestos/dar-baja/${id}`);
        return response.data;
    }
};

// 5. MÓDULO DE SOLICITUDES
export const solicitudesService = {
    obtenerTodas: async () => {
        const response = await api.get('/Solicitudes');
        return response.data;
    },
    crear: async (datos) => {
        const response = await api.post('/Solicitudes', datos);
        return response.data;
    },
    procesar: async (id, datos) => {
        const response = await api.put(`/Solicitudes/procesar/${id}`, datos);
        return response.data;
    },
    crearDevolucion: async (datos) => {
        const response = await api.post('/Solicitudes/devolucion', datos);
        return response.data;
    },
    crearImportacion: async (datos) => {
        const response = await api.post('/Solicitudes/importacion', datos);
        return response.data;
    }
};

export default api;