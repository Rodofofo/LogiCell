import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    // Leemos los datos de la memoria del navegador
    const rol = localStorage.getItem('userRol') || 'Desconocido';
    const correo = localStorage.getItem('userCorreo') || 'Usuario';

    const handleLogout = () => {
        // Borramos los datos y regresamos al login
        localStorage.clear();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary shadow-sm">
            <div className="container-fluid px-4">
                {/* Marca / Logo */}
                <span className="navbar-brand d-flex align-items-center fw-bold" style={{ letterSpacing: '1px' }}>
                    <i className="bi bi-cpu-fill text-success me-2" style={{ fontSize: '1.5rem' }}></i>
                    LOGICELL
                </span>

                {/* Información del usuario y botón de salir */}
                <div className="d-flex align-items-center">
                    <div className="text-end me-4 d-none d-sm-block">
                        <span className="text-light d-block small fw-bold">{correo}</span>
                        <span className="text-success small" style={{ fontSize: '0.8rem' }}>
                            <i className="bi bi-person-badge me-1"></i>Perfil: {rol}
                        </span>
                    </div>

                    <button onClick={handleLogout} className="btn btn-outline-danger btn-sm fw-bold">
                        <i className="bi bi-box-arrow-left me-2"></i>
                        SALIR
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;