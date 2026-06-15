import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';

const DashboardLogistico = () => {
    // 1. PESTAÑA ACTIVA ('inventario' o 'solicitudes')
    const [tabActiva, setTabActiva] = useState('solicitudes');

    // 2. MOCK DATA: INVENTARIO DE REPUESTOS
    const [repuestos, setRepuestos] = useState([
        { idRepuesto: 1, numeroSerial: 'RBS-TX-001', nombre: 'Transceptor RBS 6000', descripcion: 'Módulo de radiofrecuencia principal', bodega: 'Bodega Central', estadoOperativo: 'Disponible' },
        { idRepuesto: 2, numeroSerial: 'BTS-ANT-045', nombre: 'Antena Sectorial 65°', descripcion: 'Antena para panel BTS', bodega: 'Bodega Central', estadoOperativo: 'Reservado' },
        { idRepuesto: 3, numeroSerial: 'CAB-FO-100', nombre: 'Bobina Fibra Óptica 100m', descripcion: 'Cable monomodo para conexiones de sitio', bodega: 'Bodega Norte', estadoOperativo: 'Disponible' }
    ]);

    // 3. MOCK DATA: BANDEJA DE SOLICITUDES (NUEVO)
    const [solicitudes, setSolicitudes] = useState([
        {
            idSolicitud: 101,
            tecnico: 'juan.tecnico@logicell.com',
            fecha: '10/06/2026',
            sitioMotivo: 'BTS-SJ-045 (Falla de Tx)',
            materiales: '1x Transceptor RBS 6000',
            estado: 'Pendiente'
        },
        {
            idSolicitud: 102,
            tecnico: 'maria.tecnico@logicell.com',
            fecha: '09/06/2026',
            sitioMotivo: 'RBS-A-102 (Ampliación)',
            materiales: '2x Bobina Fibra Óptica 100m',
            estado: 'Aprobado'
        }
    ]);

    // 4. ESTADOS PARA EL MODAL DE REPUESTOS
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEdicion, setIdEdicion] = useState(null);
    const [serial, setSerial] = useState('');
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [bodega, setBodega] = useState('Bodega Central');

    // 5. FUNCIONES PARA MODAL DE INVENTARIO
    const abrirModalCrear = () => {
        setModoEdicion(false);
        setSerial('');
        setNombre('');
        setDescripcion('');
        setBodega('Bodega Central');
        setMostrarModal(true);
    };

    const abrirModalEditar = (item) => {
        setModoEdicion(true);
        setIdEdicion(item.idRepuesto);
        setSerial(item.numeroSerial);
        setNombre(item.nombre);
        setDescripcion(item.descripcion);
        setBodega(item.bodega);
        setMostrarModal(true);
    };

    const handleSubmitRepuesto = (e) => {
        e.preventDefault();
        if (modoEdicion) {
            setRepuestos(repuestos.map(rep => rep.idRepuesto === idEdicion ? { ...rep, numeroSerial: serial, nombre: nombre, descripcion: descripcion, bodega: bodega } : rep));
            Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Componente modificado.', background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
        } else {
            const nuevo = { idRepuesto: Date.now(), numeroSerial: serial, nombre: nombre, descripcion: descripcion, bodega: bodega, estadoOperativo: 'Disponible' };
            setRepuestos([...repuestos, nuevo]);
            Swal.fire({ icon: 'success', title: 'Registrado', text: 'Componente ingresado al inventario.', background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
        }
        setMostrarModal(false);
    };

    const handleDarDeBaja = async (idRepuesto) => {
        const confirmacion = await Swal.fire({
            title: '¿Dar de baja este componente?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, dar de baja',
            background: '#212529', color: '#fff'
        });
        if (confirmacion.isConfirmed) {
            setRepuestos(repuestos.map(rep => rep.idRepuesto === idRepuesto ? { ...rep, estadoOperativo: 'Dado de baja' } : rep));
            Swal.fire({ icon: 'success', title: 'Completado', text: 'Estado actualizado.', background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
        }
    };

    // 6. FUNCIONES DE LA BANDEJA DE SOLICITUDES (NUEVO)
    const handleProcesarSolicitud = async (idSolicitud, nuevoEstado) => {
        const accion = nuevoEstado === 'Aprobado' ? 'aprobar' : 'rechazar';
        const colorBoton = nuevoEstado === 'Aprobado' ? '#198754' : '#dc3545';

        const confirmacion = await Swal.fire({
            title: `¿Deseas ${accion} esta solicitud?`,
            text: `La solicitud cambiará al estado de ${nuevoEstado}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: colorBoton,
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar',
            background: '#212529',
            color: '#fff'
        });

        if (confirmacion.isConfirmed) {
            setSolicitudes(solicitudes.map(sol =>
                sol.idSolicitud === idSolicitud ? { ...sol, estado: nuevoEstado } : sol
            ));
            Swal.fire({ icon: 'success', title: 'Procesado', text: `Solicitud ${nuevoEstado} con éxito.`, background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-dark">
            <Navbar />

            <div className="flex-grow-1 container-fluid p-4 text-light pb-5">
                {/* Encabezado Principal */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2><i className="bi bi-building-gear text-success me-2"></i>Centro de Control Logístico</h2>
                </div>

                {/* MENÚ DE PESTAÑAS (TABS) */}
                <ul className="nav nav-tabs border-secondary mb-4">
                    <li className="nav-item">
                        <button
                            className={`nav-link text-uppercase fw-bold position-relative ${tabActiva === 'solicitudes' ? 'active bg-secondary text-light border-secondary' : 'text-white-50'}`}
                            onClick={() => setTabActiva('solicitudes')}
                        >
                            <i className="bi bi-inbox-fill me-2"></i>Bandeja de Solicitudes
                            {solicitudes.filter(s => s.estado === 'Pendiente').length > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {solicitudes.filter(s => s.estado === 'Pendiente').length}
                                </span>
                            )}
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link text-uppercase fw-bold ${tabActiva === 'inventario' ? 'active bg-secondary text-light border-secondary' : 'text-white-50'}`}
                            onClick={() => setTabActiva('inventario')}
                        >
                            <i className="bi bi-box-seam me-2"></i>Inventario de Repuestos
                        </button>
                    </li>
                </ul>

                {/* CONTENIDO PESTAÑA 1: INVENTARIO DE REPUESTOS */}
                {tabActiva === 'inventario' && (
                    <div>
                        <div className="d-flex justify-content-end mb-3">
                            <button onClick={abrirModalCrear} className="btn btn-success fw-bold shadow-sm">
                                <i className="bi bi-plus-circle-fill me-2"></i>NUEVO REPUESTO
                            </button>
                        </div>
                        <div className="card bg-secondary border-0 shadow">
                            <div className="card-body p-0">
                                <table className="table table-dark table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3">Serial</th>
                                            <th className="py-3">Componente</th>
                                            <th className="py-3">Descripción</th>
                                            <th className="py-3">Ubicación</th>
                                            <th className="py-3">Estado</th>
                                            <th className="py-3 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {repuestos.map((item) => (
                                            <tr key={item.idRepuesto}>
                                                <td className="px-4 align-middle fw-bold text-info">{item.numeroSerial}</td>
                                                <td className="align-middle fw-bold">{item.nombre}</td>
                                                <td className="align-middle text-light small">{item.descripcion}</td>
                                                <td className="align-middle">
                                                    <i className="bi bi-geo-alt-fill text-danger me-2"></i>{item.bodega}
                                                </td>
                                                <td className="align-middle">
                                                    <span className={`badge ${item.estadoOperativo === 'Disponible' ? 'bg-success' : item.estadoOperativo === 'Dado de baja' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                        {item.estadoOperativo}
                                                    </span>
                                                </td>
                                                <td className="align-middle text-center">
                                                    <button onClick={() => abrirModalEditar(item)} className="btn btn-sm btn-outline-info me-2" title="Editar" disabled={item.estadoOperativo === 'Dado de baja'}><i className="bi bi-pencil-square"></i></button>
                                                    <button onClick={() => handleDarDeBaja(item.idRepuesto)} className="btn btn-sm btn-outline-danger" title="Dar de baja" disabled={item.estadoOperativo === 'Dado de baja'}><i className="bi bi-trash-fill"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENIDO PESTAÑA 2: BANDEJA DE SOLICITUDES (NUEVO) */}
                {tabActiva === 'solicitudes' && (
                    <div className="card bg-secondary border-0 shadow">
                        <div className="card-body p-0">
                            <table className="table table-dark table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3">ID Pedido</th>
                                        <th className="py-3">Técnico Solicitante</th>
                                        <th className="py-3">Fecha</th>
                                        <th className="py-3">Sitio / Motivo</th>
                                        <th className="py-3">Materiales Pedidos</th>
                                        <th className="py-3 text-center">Estado</th>
                                        <th className="py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solicitudes.map((sol) => (
                                        <tr key={sol.idSolicitud}>
                                            <td className="px-4 align-middle fw-bold text-warning">#{sol.idSolicitud}</td>
                                            <td className="align-middle small">{sol.tecnico}</td>
                                            <td className="align-middle small">{sol.fecha}</td>
                                            <td className="align-middle fw-bold text-light">{sol.sitioMotivo}</td>
                                            <td className="align-middle text-info small fw-bold">{sol.materiales}</td>
                                            <td className="align-middle text-center">
                                                <span className={`badge ${sol.estado === 'Pendiente' ? 'bg-warning text-dark' :
                                                        sol.estado === 'Aprobado' ? 'bg-success' : 'bg-danger'
                                                    }`}>
                                                    {sol.estado}
                                                </span>
                                            </td>
                                            <td className="align-middle text-center">
                                                {sol.estado === 'Pendiente' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleProcesarSolicitud(sol.idSolicitud, 'Aprobado')}
                                                            className="btn btn-sm btn-success me-2"
                                                            title="Aprobar Solicitud"
                                                        >
                                                            <i className="bi bi-check-lg"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleProcesarSolicitud(sol.idSolicitud, 'Rechazado')}
                                                            className="btn btn-sm btn-danger"
                                                            title="Rechazar Solicitud"
                                                        >
                                                            <i className="bi bi-xl-lg"></i>
                                                            <i className="bi bi-x-lg"></i>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-muted small italic">Procesada</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            {/* MODAL DE REPUESTOS */}
            {mostrarModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content bg-dark text-light border-secondary">
                            <div className="modal-header border-secondary">
                                <h5 className="modal-title fw-bold"><i className={`bi ${modoEdicion ? 'bi-pencil-square text-info' : 'bi-box-arrow-in-down text-success'} me-2`}></i>{modoEdicion ? 'Editar Repuesto' : 'Ingresar Nuevo Repuesto'}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmitRepuesto}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-bold">Número de Serial</label>
                                            <input type="text" className="form-control bg-secondary text-light border-dark text-uppercase" placeholder="Ej. RBS-000" value={serial} onChange={(e) => setSerial(e.target.value)} required />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-bold">Bodega de Destino</label>
                                            <select className="form-select bg-secondary text-light border-dark" value={bodega} onChange={(e) => setBodega(e.target.value)}>
                                                <option value="Bodega Central">Bodega Central (San José)</option>
                                                <option value="Bodega Norte">Bodega Norte (Alajuela)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Nombre del Componente</label>
                                        <input type="text" className="form-control bg-secondary text-light border-dark" placeholder="Nombre corto y descriptivo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Descripción Técnica</label>
                                        <textarea className="form-control bg-secondary text-light border-dark" rows="2" placeholder="Detalles adicionales del componente..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-secondary">
                                    <button type="button" className="btn btn-outline-light" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                    <button type="submit" className={`btn ${modoEdicion ? 'btn-info' : 'btn-success'} fw-bold`}>{modoEdicion ? 'Guardar Cambios' : 'Ingresar al Inventario'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardLogistico;