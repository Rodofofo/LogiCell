import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';

const DashboardAdministrativo = () => {
    // 1. PESTAÑA ACTIVA
    const [tabActiva, setTabActiva] = useState('usuarios');

    // 2. MOCK DATA: Combinación de 'Usuarios' e 'InformacionPersonal' de tu BD
    const [usuarios, setUsuarios] = useState([
        { idUsuario: 1, correo: 'admin@logicell.com', rol: 'Administrador', estadoActivo: true, nombreCompleto: 'Admin Principal', telefono: '8888-0000', numeroEmpleado: 'ADM-001' },
        { idUsuario: 2, correo: 'juan.tecnico@logicell.com', rol: 'Técnico', estadoActivo: true, nombreCompleto: 'Juan Pérez', telefono: '8888-1111', numeroEmpleado: 'TEC-045' },
        { idUsuario: 3, correo: 'maria.logistica@logicell.com', rol: 'Logístico', estadoActivo: false, nombreCompleto: 'María Gómez', telefono: '8888-2222', numeroEmpleado: 'LOG-012' }
    ]);

    // 3. ESTADOS PARA EL MODAL DE CREACIÓN/EDICIÓN
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEdicion, setIdEdicion] = useState(null);

    // Campos del formulario
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [numeroEmpleado, setNumeroEmpleado] = useState('');
    const [rol, setRol] = useState('Técnico');
    const [password, setPassword] = useState(''); // Solo se exige al crear

    // --- FUNCIONES DEL CRUD DE USUARIOS ---
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
        setCorreo(user.correo);
        setTelefono(user.telefono || '');
        setNumeroEmpleado(user.numeroEmpleado || '');
        setRol(user.rol);
        setPassword('');
        setMostrarModal(true);
    };

    const handleSubmitUsuario = (e) => {
        e.preventDefault();

        if (modoEdicion) {
            setUsuarios(usuarios.map(u => u.idUsuario === idEdicion ? {
                ...u, nombreCompleto, correo, telefono, numeroEmpleado, rol
            } : u));
            Swal.fire({ icon: 'success', title: 'Usuario Actualizado', text: 'Los datos del colaborador han sido modificados.', background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
        } else {
            if (password.trim() === '') {
                Swal.fire({ icon: 'warning', title: 'Contraseña requerida', text: 'Debes asignar una contraseña inicial al nuevo usuario.', background: '#212529', color: '#fff' });
                return;
            }
            const nuevo = {
                idUsuario: Date.now(), correo, rol, estadoActivo: true, nombreCompleto, telefono, numeroEmpleado
            };
            setUsuarios([...usuarios, nuevo]);
            Swal.fire({ icon: 'success', title: 'Usuario Creado', text: 'El nuevo colaborador ya tiene acceso al sistema.', background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
        }
        setMostrarModal(false);
    };

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
            setUsuarios(usuarios.map(u => u.idUsuario === idUsuario ? { ...u, estadoActivo: !estadoActual } : u));
            Swal.fire({ icon: 'success', title: 'Estado Actualizado', text: `El usuario ha sido ${estadoActual ? 'desactivado' : 'activado'}.`, background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-dark">
            <Navbar />

            <div className="flex-grow-1 container-fluid p-4 text-light pb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2><i className="bi bi-shield-lock-fill text-primary me-2"></i>Panel de Administración</h2>
                </div>

                {/* MENÚ DE PESTAÑAS (Configuración eliminada) */}
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

                {/* CONTENIDO PESTAÑA: GESTIÓN DE PERSONAL */}
                {tabActiva === 'usuarios' && (
                    <div>
                        <div className="d-flex justify-content-end mb-3">
                            <button onClick={abrirModalCrear} className="btn btn-primary fw-bold shadow-sm">
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
                                            <th className="py-3 text-center">Acceso</th>
                                            <th className="py-3 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map((user) => (
                                            /* Se eliminó la clase opacity-50 */
                                            <tr key={user.idUsuario}>
                                                <td className="px-4 align-middle fw-bold text-info">{user.numeroEmpleado || 'N/A'}</td>
                                                <td className="align-middle fw-bold">{user.nombreCompleto}</td>
                                                <td className="align-middle small">
                                                    <div className="text-light"><i className="bi bi-envelope-fill text-white-50 me-1"></i>{user.correo}</div>
                                                    <div className="text-light mt-1"><i className="bi bi-telephone-fill text-white-50 me-1"></i>{user.telefono || 'Sin registrar'}</div>
                                                </td>
                                                <td className="align-middle">
                                                    <span className={`badge ${user.rol === 'Administrador' ? 'bg-primary' :
                                                            user.rol === 'Logístico' ? 'bg-warning text-dark' : 'bg-success'
                                                        }`}>
                                                        {user.rol}
                                                    </span>
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            {/* MODAL DE GESTIÓN DE USUARIOS */}
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
                                    <h6 className="text-primary border-bottom border-secondary pb-2 mb-3"><i className="bi bi-card-heading me-2"></i>Información Personal</h6>
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

                                    <h6 className="text-primary border-bottom border-secondary pb-2 mb-3"><i className="bi bi-shield-lock me-2"></i>Credenciales de Acceso</h6>
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
                                    {!modoEdicion && (
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Contraseña Temporal</label>
                                            <input type="password" className="form-control bg-secondary text-light border-dark" placeholder="Asigna una clave inicial..." value={password} onChange={(e) => setPassword(e.target.value)} />
                                            <div className="form-text text-white-50">El colaborador usará esta contraseña para su primer inicio de sesión.</div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-secondary">
                                    <button type="button" className="btn btn-outline-light" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                    <button type="submit" className={`btn ${modoEdicion ? 'btn-info' : 'btn-primary'} fw-bold`}>
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