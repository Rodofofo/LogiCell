import React from 'react';
import { Navigate } from 'react-router-dom';

// ProtectedRoute: componente guardian de rutas por rol.
// Breve: verifica existencia de sesión (localStorage) y que el rol tenga permiso.
const ProtectedRoute = ({ children, rolPermitido }) => {
    // Leemos el rol actual guardado en la memoria
    const userRol = localStorage.getItem('userRol');

    // 1. Si no hay usuario logueado, lo expulsamos al Login
    if (!userRol) {
        return <Navigate to="/" />;
    }

    // 2. Si intenta entrar a una pantalla que no es de su rol
    if (rolPermitido && rolPermitido !== userRol) {
        // Lo devolvemos a la fuerza a su panel correspondiente
        if (userRol === 'Tecnico') return <Navigate to="/tecnico" />;
        if (userRol === 'Logistico') return <Navigate to="/logistico" />;
        if (userRol === 'Admin') return <Navigate to="/admin" />;
    }

    // 3. Si todo esta correcto, le permitimos ver la pantalla
    return children;
};

export default ProtectedRoute;
