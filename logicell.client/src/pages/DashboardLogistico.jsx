import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import { repuestosService, solicitudesService } from '../services/api'; // Importamos ambos servicios

const DashboardLogistico = () => {
    const [tabActiva, setTabActiva] = useState('solicitudes');

    // --- ESTADOS INICIALIZADOS VACÍOS PARA LLENAR DESDE LA BD ---
    const [repuestos, setRepuestos] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);

    // --- CARGA DE DATOS REALES ---
    const cargarRepuestos = async () => {
        try {
            const data = await repuestosService.obtenerTodos();
            setRepuestos(data);
        } catch (error) {
            console.error("Error al cargar repuestos:", error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el inventario.' });
        }
    };

    const cargarSolicitudes = async () => {
        try {
            const data = await solicitudesService.obtenerTodas();
            setSolicitudes(data);
        } catch (error) {
            console.error("Error al cargar solicitudes:", error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la bandeja de entrada.' });
        }
    };

    // Cargar ambas tablas al abrir la pantalla
    useEffect(() => {
        cargarRepuestos();
        cargarSolicitudes();
    }, []);


    // --- MODALES DE INVENTARIO ---
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [idEdicion, setIdEdicion] = useState(null);
    const [serial, setSerial] = useState('');
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [bodega, setBodega] = useState('Metro Este');

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setSerial('');
        setNombre('');
        setDescripcion('');
        setBodega('Metro Este');
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

    const handleSubmitRepuesto = async (e) => {
        e.preventDefault();
        const payload = {
            numeroSerial: serial,
            nombre: nombre,
            descripcion: descripcion,
            bodega: bodega
        };

        try {
            if (modoEdicion) {
                await repuestosService.editar(idEdicion, payload);
                Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Componente modificado.', background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
            } else {
                await repuestosService.crear(payload);
                Swal.fire({ icon: 'success', title: 'Registrado', text: 'Componente ingresado al inventario.', background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
            }
            setMostrarModal(false);
            cargarRepuestos();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.mensaje || 'Hubo un problema al procesar la solicitud.',
                background: '#212529', color: '#fff'
            });
        }
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
            try {
                await repuestosService.darDeBaja(idRepuesto);
                Swal.fire({ icon: 'success', title: 'Completado', text: 'Estado actualizado.', background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
                cargarRepuestos();
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo dar de baja el componente.' });
            }
        }
    };

    // --- PROCESAR SOLICITUDES (CONEXIÓN A C#) ---
    const handleProcesarSolicitud = async (solicitud, nuevoEstado) => {
        if (nuevoEstado === 'Rechazado') {
            const { value: motivo } = await Swal.fire({
                title: 'Rechazar Solicitud',
                text: 'Por favor, ingrese el motivo del rechazo para notificar al técnico:',
                input: 'text',
                inputPlaceholder: 'Ej. Ubicación incorrecta, datos de sitio erróneos...',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Confirmar Rechazo',
                cancelButtonText: 'Cancelar',
                background: '#212529',
                color: '#fff',
                inputValidator: (value) => {
                    if (!value) {
                        return '¡Debe ingresar un motivo para rechazar la solicitud!';
                    }
                }
            });

            if (motivo) {
                try {
                    await solicitudesService.procesar(solicitud.idSolicitud, {
                        estadoNuevo: 'Rechazado',
                        motivoRechazo: motivo,
                        correoLogistico: localStorage.getItem('userCorreo')
                    });

                    Swal.fire({ icon: 'error', title: 'Solicitud Rechazada', text: 'Se registró el motivo y se liberó el flujo.', background: '#212529', color: '#fff', timer: 2000, showConfirmButton: false });

                    cargarSolicitudes();
                    cargarRepuestos();
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al procesar el rechazo.' });
                }
            }
        } else {
            const confirmacion = await Swal.fire({
                title: '¿Aprobar esta transacción?',
                text: `La solicitud cambiará al estado de ${nuevoEstado}.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, aprobar',
                background: '#212529', color: '#fff'
            });

            if (confirmacion.isConfirmed) {
                try {
                    await solicitudesService.procesar(solicitud.idSolicitud, {
                        estadoNuevo: 'Aprobado',
                        motivoRechazo: null,
                        correoLogistico: localStorage.getItem('userCorreo')
                    });

                    Swal.fire({ icon: 'success', title: 'Aprobado', text: 'Transacción procesada correctamente.', background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });

                    // --- AQUÍ LLAMAMOS AL GENERADOR DE PDF ---
                    generarReporteAprobacion(solicitud);

                    cargarSolicitudes();
                    cargarRepuestos();
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al aprobar la solicitud.' });
                }
            }
        }
    };

    // --- NUEVO: Función para generar PDF (RF13) ---
    const generarReporteAprobacion = (solicitud) => {
        const doc = new jsPDF();

        // Título y Encabezado
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text('Comprobante de Despacho de Repuestos', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text('Sistema de Gestión LogiCell', 14, 30);
        doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 14, 36);
        doc.text(`Aprobado por: ${localStorage.getItem('userCorreo')}`, 14, 42);

        // Estructurar los datos para la tabla
        const tableData = [
            ['ID de Trámite', `#${solicitud.idSolicitud}`],
            ['Tipo de Trámite', solicitud.tipoSolicitud],
            ['Técnico Solicitante', solicitud.tecnico],
            ['Repuesto / Materiales', solicitud.materiales],
            ['Justificación y Sitio', solicitud.sitioMotivo],
            ['Fecha de Solicitud', solicitud.fecha],
            ['Fecha Límite Devolución', solicitud.fechaLimite !== "N/A" ? solicitud.fechaLimite : "1 Mes a partir de hoy"]
        ];

        // Dibujar la tabla
        doc.autoTable({
            startY: 50,
            head: [['Campo', 'Detalle de la Operación']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [25, 135, 84] }, // Verde success de Bootstrap
            styles: { fontSize: 10, cellPadding: 4 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
        });

        // Espacio para firmas
        const finalY = doc.lastAutoTable.finalY || 50;
        doc.setFontSize(10);
        doc.text('Firma Logística: _______________________', 14, finalY + 40);
        doc.text('Firma Técnico: _______________________', 110, finalY + 40);

        // Descargar el archivo
        doc.save(`Aprobacion_LogiCell_REQ${solicitud.idSolicitud}.pdf`);
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-dark">
            <Navbar />
            <div className="flex-grow-1 container-fluid p-4 text-light pb-5">

                {/* 1. DASHBOARD INFORMATIVO / CONTADORES */}
                <div className="row mb-4">
                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card bg-secondary border-0 shadow-sm text-light h-100">
                            <div className="card-body d-flex align-items-center justify-content-between p-4">
                                <div>
                                    <h6 className="text-white-50 text-uppercase small fw-bold">Total Repuestos</h6>
                                    <h3 className="fw-bold mb-0 text-white">{repuestos.length}</h3>
                                </div>
                                <i className="bi bi-box-seam fs-1 text-white"></i>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card bg-secondary border-0 shadow-sm text-light h-100">
                            <div className="card-body d-flex align-items-center justify-content-between p-4">
                                <div>
                                    <h6 className="text-white-50 text-uppercase small fw-bold">Despachos Pendientes</h6>
                                    <h3 className="fw-bold mb-0 text-warning">
                                        {solicitudes.filter(s => s.tipoSolicitud === 'Despacho' && s.estado === 'Pendiente').length}
                                    </h3>
                                </div>
                                <i className="bi bi-truck fs-1 text-warning"></i>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card bg-secondary border-0 shadow-sm text-light h-100">
                            <div className="card-body d-flex align-items-center justify-content-between p-4">
                                <div>
                                    <h6 className="text-white-50 text-uppercase small fw-bold">Devoluciones en Trámite</h6>
                                    <h3 className="fw-bold mb-0 text-danger">
                                        {solicitudes.filter(s => s.tipoSolicitud === 'Devolución' && s.estado === 'Pendiente').length}
                                    </h3>
                                </div>
                                <i className="bi bi-arrow-return-left fs-1 text-danger"></i>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card bg-secondary border-0 shadow-sm text-light h-100">
                            <div className="card-body d-flex align-items-center justify-content-between p-4">
                                <div>
                                    <h6 className="text-white-50 text-uppercase small fw-bold">Trámites Importación</h6>
                                    <h3 className="fw-bold mb-0 text-info">
                                        {solicitudes.filter(s => s.tipoSolicitud === 'Importación' && s.estado === 'Pendiente').length}
                                    </h3>
                                </div>
                                <i className="bi bi-globe fs-1 text-info"></i>
                            </div>
                        </div>
                    </div>
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

                {/* CONTENIDO PESTAÑA: BANDEJA DE SOLICITUDES */}
                {tabActiva === 'solicitudes' && (
                    <div className="card bg-secondary border-0 shadow">
                        <div className="card-body p-0">
                            <table className="table table-dark table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="py-3">Tipo</th>
                                        <th className="py-3">Técnico</th>
                                        <th className="py-3">Fecha</th>
                                        <th className="py-3">Justificación</th>
                                        <th className="py-3">Componente Solicitado</th>
                                        <th className="py-3 text-center">Estado</th>
                                        <th className="py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solicitudes.map((sol) => (
                                        <tr key={sol.idSolicitud}>
                                            <td className="px-4 align-middle fw-bold text-warning">#{sol.idSolicitud}</td>
                                            <td className="align-middle">
                                                <span className={`badge border ${
                                                    sol.tipoSolicitud === 'Despacho' ? 'border-warning text-warning' :
                                                    sol.tipoSolicitud === 'Importación' ? 'border-info text-info' :
                                                    sol.tipoSolicitud === 'Devolucion' ? 'border-danger text-danger' :
                                                    ``
                                                }`}>
                                                    {sol.tipoSolicitud}
                                                </span>
                                            </td>
                                            <td className="align-middle small">{sol.tecnico}</td>
                                            <td className="align-middle small">{sol.fecha}</td>
                                            <td className="align-middle fw-bold text-light">{sol.sitioMotivo}</td>
                                            <td className="align-middle text-info small fw-bold">
                                                {sol.tipoSolicitud === 'Importación' ? <i className="bi bi-airplane-fill me-1 text-white-50"></i> : null}
                                                {sol.materiales}
                                            </td>
                                            <td className="align-middle text-center">
                                                {sol.estado === 'Pendiente' ? (
                                                    <span className="badge bg-warning text-dark">{sol.estado}</span>
                                                ) : sol.estado === 'Completada' ? (
                                                    <span className="badge bg-transparent border border-light text-light">{sol.estado}</span>
                                                ) : sol.estado === 'Aprobado' ? (
                                                    <span className="badge bg-success">{sol.estado}</span>
                                                ) : (
                                                    <div className="d-flex flex-column align-items-center">
                                                        <span className="badge bg-danger mb-1">{sol.estado}</span>
                                                        <span className="text-white-50 text-center" style={{ fontSize: '0.75rem', maxWidth: '150px' }}>
                                                            {sol.motivoRechazo}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="align-middle text-center">
                                                {sol.estado === 'Pendiente' ? (
                                                    <div className="d-flex justify-content-center">
                                                        <button
                                                            onClick={() => handleProcesarSolicitud(sol, 'Aprobado')}
                                                            className="btn btn-sm btn-success me-2"
                                                            title={sol.tipoSolicitud === 'Importación' ? 'Autorizar Importación' : 'Aprobar Transacción'}
                                                        >
                                                            <i className="bi bi-check-lg"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleProcesarSolicitud(sol, 'Rechazado')}
                                                            className="btn btn-sm btn-danger"
                                                            title="Rechazar e ingresar motivo"
                                                        >
                                                            <i className="bi bi-x-lg"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-white-50 small fst-italic">Procesada</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {solicitudes.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4 text-white-50">No hay solicitudes en la bandeja...</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CONTENIDO PESTAÑA: INVENTARIO DE REPUESTOS */}
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
                                                    <span className={`badge ${
                                                        item.estadoOperativo === 'Disponible' ? 'bg-success' :
                                                        item.estadoOperativo === 'Dado de baja' ? 'bg-danger' :
                                                        item.estadoOperativo === 'Entregado' ? 'bg-primary' :
                                                        item.estadoOperativo === 'En Trámite' ? 'bg-info text-dark' :
                                                        'bg-warning text-dark'
                                                        }`}>
                                                        {item.estadoOperativo}
                                                    </span>
                                                </td>
                                                <td className="align-middle text-center">
                                                    <button onClick={() => abrirModalEditar(item)} className="btn btn-sm btn-outline-info me-2" title="Editar" disabled={item.estadoOperativo === 'Dado de baja' || item.estadoOperativo === 'Reservado' || item.estadoOperativo === 'Entregado'}><i className="bi bi-pencil-square"></i></button>
                                                    <button onClick={() => handleDarDeBaja(item.idRepuesto)} className="btn btn-sm btn-outline-danger" title="Dar de baja" disabled={item.estadoOperativo === 'Dado de baja' || item.estadoOperativo === 'Reservado' || item.estadoOperativo === 'Entregado'}><i className="bi bi-trash-fill"></i></button>
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
                                                <option value="Chorotega">Chorotega</option>
                                                <option value="Huetar">Huetar</option>
                                                <option value="Brunca">Brunca</option>
                                                <option value="Metro Este">Metro Este</option>
                                                <option value="Metro Oeste">Metro Oeste</option>
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