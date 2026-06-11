import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import Swal from 'sweetalert2';

const DashboardAdmin = () => {
    const [usuarios, setUsuarios] = useState([]);

    // Esta función va al backend a traer los datos
    const cargarUsuarios = async () => {
        try {
            // Recuerda usar tu puerto 7235
            const response = await axios.get('https://localhost:7235/api/Usuarios');
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            Swal.fire('Error', 'No se pudo cargar la lista de usuarios', 'error');
        }
    };

    // useEffect ejecuta la función automáticamente al cargar la pantalla
    useEffect(() => {
        cargarUsuarios();
    }, []);

    return (
        <div className="bg-dark min-vh-100">
            <Navbar />

            <div className="container-fluid p-4 text-light">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2><i className="bi bi-people-fill text-success me-2"></i>Gestión de Usuarios</h2>
                    <button className="btn btn-success fw-bold shadow-sm">
                        <i className="bi bi-person-plus-fill me-2"></i>NUEVO USUARIO
                    </button>
                </div>

                <hr className="border-secondary" />

                {/* Tabla de Usuarios */}
                <div className="card bg-secondary border-0 shadow">
                    <div className="card-body p-0">
                        <table className="table table-dark table-hover mb-0">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="py-3">Correo Electrónico</th>
                                    <th className="py-3">Rol</th>
                                    <th className="py-3">Estado</th>
                                    <th className="py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((user) => (
                                    <tr key={user.idUsuario}>
                                        <td className="px-4 align-middle fw-bold">{user.idUsuario}</td>
                                        <td className="align-middle">{user.correoElectronico}</td>
                                        <td className="align-middle">
                                            <span className={`badge ${user.rol === 'Admin' ? 'bg-danger' : user.rol === 'Tecnico' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                                                {user.rol}
                                            </span>
                                        </td>
                                        <td className="align-middle">
                                            {user.estadoActivo ? (
                                                <span className="text-success"><i className="bi bi-circle-fill small me-1"></i>Activo</span>
                                            ) : (
                                                <span className="text-danger"><i className="bi bi-circle-fill small me-1"></i>Inactivo</span>
                                            )}
                                        </td>
                                        <td className="align-middle text-center">
                                            <button className="btn btn-sm btn-outline-light me-2" title="Editar">
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" title="Desactivar">
                                                <i className="bi bi-trash-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mensaje si no hay usuarios */}
                        {usuarios.length === 0 && (
                            <div className="text-center p-4 text-muted">
                                Cargando usuarios...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;