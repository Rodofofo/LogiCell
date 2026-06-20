import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import { usuariosService } from '../services/api'; // Importamos el servicio real

const DashboardAdministrativo = () => {
    const [tabActiva, setTabActiva] = useState('usuarios');

    // 1. EL ESTADO INICIA VACÍO, SE LLENARÁ DESDE LA BASE DE DATOS
    const [usuarios, setUsuarios] = useState([]);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEdicion, setIdEdicion] = useState(null);

    const [nombreCompleto, setNombreCompleto] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [numeroEmpleado, setNumeroEmpleado] = useState('');
    const [rol, setRol] = useState('Técnico');
    const [password, setPassword] = useState('');

    // --- NUEVO: FUNCIÓN PARA CARGAR DATOS DESDE C# ---
    const cargarUsuarios = async () => {
        try {
            const data = await usuariosService.obtenerTodos();
            setUsuarios(data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo cargar la lista de personal.' });
        }
    };

    // Al abrir la pantalla, dispara la carga de datos
    useEffect(() => {
        cargarUsuarios();
    }, []);

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setNombreCompleto('');
        setCorreo('');
        setTelefono('');
        setNumeroEmpleado('');
        setRol('Técnico');
        setPassword('');
        setMostrarModal(true);
    };

    const abrirModalEditar = (user) => {
        setModoEdicion(true);
        setIdEdicion(user.idUsuario);
        setNombreCompleto(user.nombreCompleto);
        setCorreo(user.correoElectronico); // Ajustado al nombre que devuelve el GET de C#
        setTelefono(user.telefono || '');
        setNumeroEmpleado(user.numeroEmpleado || '');
        setRol(user.rol);
        setPassword('');
        setMostrarModal(true);
    };

    // --- CONECTADO AL SERVICIO DE CREAR/EDITAR ---
    const handleSubmitUsuario = async (e) => {
        e.preventDefault();

        // Armamos el paquete EXACTAMENTE con los nombres que pide tu DTO en C#
        const payload = {
            correoElectronico: correo,
            rol: rol,
            nombreCompleto: nombreCompleto,
            telefono: telefono,
            numeroEmpleado: numeroEmpleado
        };

        try {
            if (modoEdicion) {
                // Si escribieron algo en el campo de contraseña, lo incluimos para editar
                if (password.trim() !== '') {
                    payload.contrasena = password;
                }

                await usuariosService.editar(idEdicion, payload);
                Swal.fire({ icon: 'success', title: 'Usuario Actualizado', text: 'Los datos del colaborador han sido modificados.', background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
            } else {
                if (password.trim() === '') {
                    Swal.fire({ icon: 'warning', title: 'Contraseña requerida', text: 'Debes asignar una contraseña inicial al nuevo usuario.', background: '#212529', color: '#fff' });
                    return;
                }
                payload.contrasena = password; // Agregamos la clave al crear

                await usuariosService.crear(payload);
                Swal.fire({ icon: 'success', title: 'Usuario Creado', text: 'El nuevo colaborador ya tiene acceso al sistema.', background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
            }

            setMostrarModal(false);
            cargarUsuarios(); // Recargamos la tabla para ver los cambios de BD

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.mensaje || 'Hubo un problema al procesar la solicitud.',
                background: '#212529', color: '#fff'
            });
        }
    };

    // --- CONECTADO AL SERVICIO DE ACTIVAR/DESACTIVAR ---
    const handleToggleEstado = async (idUsuario, estadoActual) => {
        const accion = estadoActual ? 'desactivar' : 'activar';
        const confirmacion = await Swal.fire({
            title: `¿Deseas ${accion} este usuario?`,
            text: estadoActual ? "No podrá iniciar sesión, pero su historial se mantendrá intacto." : "El usuario recuperará el acceso al sistema.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: estadoActual ? '#dc3545' : '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            background: '#212529', color: '#fff'
        });

        if (confirmacion.isConfirmed) {
            try {
                await usuariosService.toggleEstado(idUsuario);
                Swal.fire({ icon: 'success', title: 'Estado Actualizado', text: `El usuario ha sido ${estadoActual ? 'desactivado' : 'activado'}.`, background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
                cargarUsuarios(); // Refrescar para ver el cambio de estado
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado del usuario.' });
            }
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-dark">
            <Navbar />

            <div className="flex-grow-1 container-fluid p-4 text-light pb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2><i className="bi bi-shield-lock-fill text-primary me-2"></i>Panel de Administración</h2>
                </div>

                <ul className="nav nav-tabs border-secondary mb-4">
                    <li className="nav-item">
                        <button
                            className={`nav-link text-uppercase fw-bold ${tabActiva === 'usuarios' ? 'active bg-secondary text-light border-secondary' : 'text-white-50'}`}
                            onClick={() => setTabActiva('usuarios')}
                        >
                            <i className="bi bi-people-fill me-2"></i>Gestión de Personal
                        </button>
                    </li>
                </ul>

                {tabActiva === 'usuarios' && (
                    <div>
                        <div className="d-flex justify-content-end mb-3">
                            <button onClick={abrirModalCrear} className="btn btn-success fw-bold shadow-sm">
                                <i className="bi bi-person-plus-fill me-2"></i>NUEVO COLABORADOR
                            </button>
                        </div>
                        <div className="card bg-secondary border-0 shadow">
                            <div className="card-body p-0">
                                <table className="table table-dark table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3">Núm. Empleado</th>
                                            <th className="py-3">Nombre Completo</th>
                                            <th className="py-3">Contacto</th>
                                            <th className="py-3">Rol / Perfil</th>
                                            <th className="py-3 text-center">Estado</th>
                                            <th className="py-3 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-white-50">Cargando usuarios desde la base de datos...</td>
                                            </tr>
                                        ) : (
                                            usuarios.map((user) => (
                                                <tr key={user.idUsuario}>
                                                    <td className="px-4 align-middle fw-bold text-info">{user.numeroEmpleado || 'N/A'}</td>
                                                    <td className="align-middle fw-bold">{user.nombreCompleto}</td>
                                                    <td className="align-middle small">
                                                        <div className="text-light"><i className="bi bi-envelope-fill text-white-50 me-1"></i>{user.correoElectronico}</div>
                                                        <div className="text-light mt-1"><i className="bi bi-telephone-fill text-white-50 me-1"></i>{user.telefono || 'Sin registrar'}</div>
                                                    </td>
                                                    <td className="align-middle text-white">
                                                        {user.rol}
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        <span className={`badge ${user.estadoActivo ? 'bg-success' : 'bg-danger'}`}>
                                                            {user.estadoActivo ? 'Activo' : 'Desactivado'}
                                                        </span>
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        <button
                                                            onClick={() => abrirModalEditar(user)}
                                                            className="btn btn-sm btn-outline-info me-2"
                                                            title="Editar Datos"
                                                        >
                                                            <i className="bi bi-pencil-square"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleEstado(user.idUsuario, user.estadoActivo)}
                                                            className={`btn btn-sm ${user.estadoActivo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                            title={user.estadoActivo ? 'Desactivar Usuario' : 'Reactivar Usuario'}
                                                        >
                                                            <i className={`bi ${user.estadoActivo ? 'bi-person-fill-slash' : 'bi-person-check-fill'}`}></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            {mostrarModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content bg-dark text-light border-secondary">
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title fw-bold">
                                    <i className={`bi ${modoEdicion ? 'bi-pencil-square text-info' : 'bi-person-plus-fill text-primary'} me-2`}></i>
                                    {modoEdicion ? 'Editar Datos del Colaborador' : 'Registrar Nuevo Colaborador'}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmitUsuario}>
                                <div className="modal-body">
                                    <h6 className="text-primary border-bottom border-secondary pb-2 mb-3"><i className></i>Información Personal</h6>
                                    <div className="row">
                                        <div className="col-md-8 mb-3">
                                            <label className="form-label small fw-bold">Nombre Completo</label>
                                            <input type="text" className="form-control bg-secondary text-light border-dark" placeholder="Ej. Juan Pérez" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label small fw-bold">Núm. de Empleado</label>
                                            <input type="text" className="form-control bg-secondary text-light border-dark text-uppercase" placeholder="Ej. TEC-001" value={numeroEmpleado} onChange={(e) => setNumeroEmpleado(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold">Teléfono de Contacto</label>
                                        <input type="text" className="form-control bg-secondary text-light border-dark" placeholder="Ej. 8888-8888" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
                                    </div>

                                    <h6 className="text-primary border-bottom border-secondary pb-2 mb-3"><i className></i>Credenciales de Acceso</h6>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-bold">Correo Electrónico</label>
                                            <input type="email" className="form-control bg-secondary text-light border-dark" placeholder="correo@logicell.com" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-bold">Rol en el Sistema</label>
                                            <select className="form-select bg-secondary text-light border-dark" value={rol} onChange={(e) => setRol(e.target.value)}>
                                                <option value="Administrador">Administrador</option>
                                                <option value="Técnico">Técnico de Campo</option>
                                                <option value="Logístico">Especialista Logístico</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">
                                            {modoEdicion ? 'Nueva Contraseña (Opcional)' : 'Contraseña Temporal'}
                                        </label>
                                        <input type="password" className="form-control bg-secondary text-light border-dark" placeholder={modoEdicion ? "Dejar en blanco para no cambiar..." : "Asigna una clave inicial..."} value={password} onChange={(e) => setPassword(e.target.value)} />
                                        {!modoEdicion && <div className="form-text text-white-50">El colaborador usará esta contraseña para su primer inicio de sesión.</div>}
                                    </div>
                                </div>
                                <div className="modal-footer border-secondary">
                                    <button type="button" className="btn btn-outline-light" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                    <button type="submit" className={`btn ${modoEdicion ? 'btn-info' : 'btn-success'} fw-bold`}>
                                        {modoEdicion ? 'Guardar Cambios' : 'Registrar Colaborador'}
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

export default DashboardAdministrativo;