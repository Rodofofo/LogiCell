import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import { usuariosService } from '../services/api';

const DashboardAdmin = () => {
    const [usuarios, setUsuarios] = useState([]);

    // Estados del Modal
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [usuarioIdEdicion, setUsuarioIdEdicion] = useState(null);

    // Estados del Formulario
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [rolId, setRolId] = useState(2);

    const URL_API = 'https://localhost:7235/api/Usuarios';

    const cargarUsuarios = async () => {
        try {
            const data = await usuariosService.obtenerTodos();
            setUsuarios(data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    // Preparar el modal para CREAR
    const abrirModalCrear = () => {
        setModoEdicion(false);
        setCorreo('');
        setContrasena('');
        setRolId(2);
        setMostrarModal(true);
    };

    // Preparar el modal para EDITAR
    const abrirModalEditar = (user) => {
        setModoEdicion(true);
        setUsuarioIdEdicion(user.idUsuario);
        setCorreo(user.correoElectronico);
        setContrasena(''); // La dejamos vacía por si no quiere cambiarla

        // Convertimos el texto del rol al ID correspondiente
        const idDelRol = user.rol === 'Admin' ? 1 : user.rol === 'Tecnico' ? 2 : 3;
        setRolId(idDelRol);

        setMostrarModal(true);
    };

    // Función principal para GUARDAR (Crea o Edita según el modo)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modoEdicion) {
                // Llamamos al servicio de editar
                await usuariosService.editar(usuarioIdEdicion, {
                    correoElectronico: correo,
                    contrasena: contrasena,
                    idRol: parseInt(rolId)
                });
                Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Usuario editado correctamente.', background: '#212529', color: '#fff' });
            } else {
                // Llamamos al servicio de crear
                await usuariosService.crear({
                    correoElectronico: correo,
                    contrasena: contrasena,
                    idRol: parseInt(rolId)
                });
                Swal.fire({ icon: 'success', title: 'Creado', text: 'Colaborador registrado.', background: '#212529', color: '#fff' });
            }

            setMostrarModal(false);
            cargarUsuarios();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.mensaje || 'Error en la operación', background: '#212529', color: '#fff' });
        }
    };

    // Función para ACTIVAR / DESACTIVAR
    const handleToggleEstado = async (idUsuario, estadoActual) => {
        const accion = estadoActual ? 'desactivar' : 'reactivar';
        const confirmacion = await Swal.fire({
            title: `¿Deseas ${accion} este usuario?`,
            text: estadoActual ? "El usuario no podrá iniciar sesión." : "El usuario recuperará el acceso al sistema.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: estadoActual ? '#dc3545' : '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar',
            background: '#212529',
            color: '#fff'
        });

        if (confirmacion.isConfirmed) {
            try {
                // Llamamos al servicio de estado
                await usuariosService.toggleEstado(idUsuario);
                cargarUsuarios();
                Swal.fire({ icon: 'success', title: 'Completado', text: `Usuario ${accion}do con éxito.`, background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
            } catch (error) {
                console.error(error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado.', background: '#212529', color: '#fff' });
            }
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-dark">
            <Navbar />

            <div className="container-fluid p-4 text-light">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2><i className="bi bi-people-fill text-success me-2"></i>Gestión de Usuarios</h2>
                    <button onClick={abrirModalCrear} className="btn btn-success fw-bold shadow-sm">
                        <i className="bi bi-person-plus-fill me-2"></i>NUEVO USUARIO
                    </button>
                </div>

                <hr className="border-secondary" />

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
                                                <span className="text-success fw-bold"><i className="bi bi-check-circle-fill small me-1"></i>Activo</span>
                                            ) : (
                                                <span className="text-danger fw-bold"><i className="bi bi-x-circle-fill small me-1"></i>Inactivo</span>
                                            )}
                                        </td>
                                        <td className="align-middle text-center">
                                            {/* Botón EDITAR */}
                                            <button onClick={() => abrirModalEditar(user)} className="btn btn-sm btn-outline-info me-2" title="Editar">
                                                <i className="bi bi-pencil-square"></i>
                                            </button>

                                            {/* Botón CAMBIAR ESTADO */}
                                            {user.estadoActivo ? (
                                                <button onClick={() => handleToggleEstado(user.idUsuario, true)} className="btn btn-sm btn-outline-danger" title="Desactivar">
                                                    <i className="bi bi-trash-fill"></i>
                                                </button>
                                            ) : (
                                                <button onClick={() => handleToggleEstado(user.idUsuario, false)} className="btn btn-sm btn-outline-success" title="Reactivar">
                                                    <i className="bi bi-arrow-repeat"></i>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Footer />

            {/* MODAL (Dinámico para Crear o Editar) */}
            {mostrarModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content bg-dark text-light border-secondary">
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title fw-bold">
                                    <i className={`bi ${modoEdicion ? 'bi-pencil-square text-info' : 'bi-person-badge text-success'} me-2`}></i>
                                    {modoEdicion ? 'Editar Colaborador' : 'Registrar Colaborador'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            className="form-control bg-secondary text-light border-dark"
                                            value={correo}
                                            onChange={(e) => setCorreo(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">
                                            {modoEdicion ? 'Nueva Contraseña (Opcional)' : 'Contraseña Temporal'}
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control bg-secondary text-light border-dark"
                                            placeholder={modoEdicion ? 'Dejar en blanco para mantener la actual' : 'Asignar contraseña'}
                                            value={contrasena}
                                            onChange={(e) => setContrasena(e.target.value)}
                                            required={!modoEdicion}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Perfil del Sistema</label>
                                        <select
                                            className="form-select bg-secondary text-light border-dark"
                                            value={rolId}
                                            onChange={(e) => setRolId(e.target.value)}
                                        >
                                            <option value={1}>Administrador</option>
                                            <option value={2}>Técnico</option>
                                            <option value={3}>Logístico</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-secondary">
                                    <button type="button" className="btn btn-outline-light" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                    <button type="submit" className={`btn ${modoEdicion ? 'btn-info' : 'btn-success'} fw-bold`}>
                                        {modoEdicion ? 'Guardar Cambios' : 'Registrar Usuario'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAdmin;