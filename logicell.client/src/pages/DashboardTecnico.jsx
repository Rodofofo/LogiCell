import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';

// DashboardTecnico: panel operativo para técnicos.
// Comentarios técnicos breves añadidos.
const DashboardTecnico = () => {
    // Estado: pestaña activa (historial | nueva | devoluciones | importaciones)
    const [tabActiva, setTabActiva] = useState('historial');

    // Catálogo mock (disponible en bodegas)
    const [catalogo] = useState([
        { idRepuesto: 1, numeroSerial: 'RBS-TX-001', nombre: 'Transceptor RBS 6000', bodega: 'Metro Este' },
        { idRepuesto: 3, numeroSerial: 'CAB-FO-100', nombre: 'Bobina Fibra Óptica 100m', bodega: 'Huetar' },
        { idRepuesto: 4, numeroSerial: 'PWR-SUP-48V', nombre: 'Fuente de Poder 48V DC', bodega: 'Metro Oeste' },
        { idRepuesto: 5, numeroSerial: 'ANT-SEC-065', nombre: 'Antena Sectorial 65°', bodega: 'Chorotega' }
    ]);

    // Historial mock de pedidos del técnico
    const [historial] = useState([
        { idSolicitud: 101, fecha: '10/06/2026', sitioMotivo: 'BTS-SJ-045 (Falla de Tx)', materiales: '1x Transceptor RBS 6000', estado: 'Pendiente' },
        { idSolicitud: 102, fecha: '09/06/2026', sitioMotivo: 'RBS-A-102 (Ampliación)', materiales: '2x Bobina Fibra Óptica 100m', estado: 'Aprobado' }
    ]);

    // Equipos asignados al técnico (para devoluciones)
    const [equiposAsignados, setEquiposAsignados] = useState([
        { idAsignacion: 1, numeroSerial: 'ANT-OLD-99', nombre: 'Antena Sectorial Dañada', fechaPrestamo: '01/06/2026', fechaDevolucion: '15/06/2026', estado: 'Pendiente de Devolución' },
        { idAsignacion: 2, numeroSerial: 'RBS-TX-002', nombre: 'Transceptor Temporal', fechaPrestamo: '05/06/2026', fechaDevolucion: '20/06/2026', estado: 'En uso' }
    ]);

    // Estados de formularios y selección
    const [carrito, setCarrito] = useState([]);
    const [destino, setDestino] = useState('');
    const [descripcionImportacion, setDescripcionImportacion] = useState('');
    const [motivoImportacion, setMotivoImportacion] = useState('');

    // Estados de filtros para catálogo
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroUbicacion, setFiltroUbicacion] = useState('');

    // --- NUEVO: LÓGICA DE FILTRADO ---
    const catalogoFiltrado = catalogo.filter(item => {
        const coincideTexto = item.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            item.numeroSerial.toLowerCase().includes(filtroTexto.toLowerCase());
        const coincideUbicacion = filtroUbicacion === '' || item.bodega === filtroUbicacion;

        return coincideTexto && coincideUbicacion;
    });

    // Funciones de carrito: agregar / quitar
    const agregarAlCarrito = (repuesto) => {
        if (!carrito.find(item => item.idRepuesto === repuesto.idRepuesto)) setCarrito([...carrito, repuesto]);
    };

    const quitarDelCarrito = (idRepuesto) => {
        setCarrito(carrito.filter(item => item.idRepuesto !== idRepuesto));
    };

    // Enviar solicitud: valida y notifica (mock)
    const handleEnviarSolicitud = () => {
        if (carrito.length === 0 || destino.trim() === '') {
            Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Selecciona un repuesto y escribe el destino.', background: '#212529', color: '#fff' });
            return;
        }
        Swal.fire({ icon: 'success', title: 'Solicitud Enviada', text: 'El logístico evaluará la solicitud y reservará los equipos.', background: '#212529', color: '#fff', timer: 2000, showConfirmButton: false });
        setCarrito([]);
        setDestino('');
        setTabActiva('historial');
    };

    // Solicitud de devolución: confirmación y cambio de estado (mock)
    const handleSolicitarDevolucion = async (idAsignacion) => {
        const confirmacion = await Swal.fire({
            title: '¿Generar solicitud de devolución?',
            text: "El equipo logístico será notificado para recibir esta pieza.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#198754',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, devolver',
            background: '#212529', color: '#fff'
        });

        if (confirmacion.isConfirmed) {
            setEquiposAsignados(equiposAsignados.map(eq =>
                eq.idAsignacion === idAsignacion ? { ...eq, estado: 'Devolución en Trámite' } : eq
            ));
            Swal.fire({ icon: 'success', title: 'En Trámite', text: 'Solicitud de devolución generada con éxito.', background: '#212529', color: '#fff', timer: 1500, showConfirmButton: false });
        }
    };

    // Solicitud de importación: envía formulario (mock)
    const handleSolicitarImportacion = (e) => {
        e.preventDefault();
        Swal.fire({
            icon: 'success',
            title: 'Solicitud de Importación Enviada',
            text: 'El departamento de logística evaluará la compra de este repuesto internacional.',
            background: '#212529', color: '#fff'
        });
        setDescripcionImportacion('');
        setMotivoImportacion('');
        setTabActiva('historial');
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-dark">
            <Navbar />

            <div className="flex-grow-1 container-fluid p-4 text-light pb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2><i className="bi bi-tools text-success me-2"></i>Panel Operativo</h2>
                </div>

                {/* MENÚ DE PESTAÑAS */}
                <ul className="nav nav-tabs border-secondary mb-4">
                    <li className="nav-item">
                        <button
                            className={`nav-link text-uppercase fw-bold ${tabActiva === 'historial' ? 'active bg-secondary text-light border-secondary' : 'text-white-50'}`}
                            onClick={() => setTabActiva('historial')}
                        >
                            <i className="bi bi-clock-history me-2"></i>Mis Pedidos
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link text-uppercase fw-bold ${tabActiva === 'nueva' ? 'active bg-secondary text-light border-secondary' : 'text-white-50'}`}
                            onClick={() => setTabActiva('nueva')}
                        >
                            <i className="bi bi-cart-plus me-2"></i>Nueva Solicitud
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link text-uppercase fw-bold position-relative ${tabActiva === 'devoluciones' ? 'active bg-secondary text-light border-secondary' : 'text-white-50'}`}
                            onClick={() => setTabActiva('devoluciones')}
                        >
                            <i className="bi bi-arrow-return-left me-2"></i>Devoluciones
                            {equiposAsignados.filter(e => e.estado === 'Pendiente de Devolución').length > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {equiposAsignados.filter(e => e.estado === 'Pendiente de Devolución').length}
                                </span>
                            )}
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link text-uppercase fw-bold ${tabActiva === 'importaciones' ? 'active bg-secondary text-light border-secondary' : 'text-white-50'}`}
                            onClick={() => setTabActiva('importaciones')}
                        >
                            <i className="bi bi-globe me-2"></i>Importación
                        </button>
                    </li>
                </ul>

                {/* PESTAÑA: MIS PEDIDOS */}
                {tabActiva === 'historial' && (
                    <div className="card bg-secondary border-0 shadow">
                        <div className="card-header bg-dark text-light fw-bold py-3">
                            <i className></i>Histórico de Pedidos
                        </div>
                        <div className="card-body p-0">
                            <table className="table table-dark table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3">ID Pedido</th>
                                        <th className="py-3">Fecha</th>
                                        <th className="py-3">Justificación</th>
                                        <th className="py-3">Materiales Pedidos</th>
                                        <th className="py-3 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historial.map((pedido) => (
                                        <tr key={pedido.idSolicitud}>
                                            <td className="px-4 align-middle fw-bold text-info">#{pedido.idSolicitud}</td>
                                            <td className="align-middle small">{pedido.fecha}</td>
                                            <td className="align-middle fw-bold">{pedido.sitioMotivo}</td>
                                            <td className="align-middle text-light small">{pedido.materiales}</td>
                                            <td className="align-middle text-center">
                                                <span className={`badge ${pedido.estado === 'Pendiente' ? 'bg-warning text-dark' : 'bg-success'}`}>{pedido.estado}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* PESTAÑA: NUEVA SOLICITUD */}
                {tabActiva === 'nueva' && (
                    <div className="row">
                        <div className="col-lg-8 mb-4">
                            <div className="card bg-secondary border-0 shadow">
                                <div className="card-header bg-dark text-light fw-bold py-3 d-flex justify-content-between align-items-center">
                                    <span><i className></i>Catálogo Disponible</span>
                                    <span className="badge bg-info text-dark">{catalogoFiltrado.length} repuestos encontrados</span>
                                </div>

                                {/* NUEVO: BARRA DE FILTROS */}
                                <div className="card-body bg-dark border-bottom border-secondary py-2 px-3">
                                    <div className="row g-2">
                                        <div className="col-md-7">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-secondary text-light border-dark">
                                                    <i className="bi bi-search"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control bg-secondary text-light border-dark"
                                                    placeholder="Buscar por Nombre o Serial..."
                                                    value={filtroTexto}
                                                    onChange={(e) => setFiltroTexto(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-5">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-secondary text-light border-dark">
                                                    <i className="bi bi-geo-alt-fill text-danger"></i>
                                                </span>
                                                <select
                                                    className="form-select bg-secondary text-light border-dark"
                                                    value={filtroUbicacion}
                                                    onChange={(e) => setFiltroUbicacion(e.target.value)}
                                                >
                                                    {/* Opciones actualizadas con las Zonas Definitivas */}
                                                    <option value="">Todas las ubicaciones</option>
                                                    <option value="Chorotega">Chorotega</option>
                                                    <option value="Huetar">Huetar</option>
                                                    <option value="Brunca">Brunca</option>
                                                    <option value="Metro Este">Metro Este</option>
                                                    <option value="Metro Oeste">Metro Oeste</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body p-0">
                                    <table className="table table-dark table-hover mb-0">
                                        <thead><tr><th className="px-4 py-3">Serial</th><th className="py-3">Componente</th><th className="py-3">Ubicación</th><th className="py-3 text-center">Acción</th></tr></thead>
                                        <tbody>
                                            {catalogoFiltrado.length > 0 ? (
                                                catalogoFiltrado.map(item => {
                                                    const enCarrito = carrito.find(c => c.idRepuesto === item.idRepuesto);
                                                    return (
                                                        <tr key={item.idRepuesto}>
                                                            <td className="px-4 align-middle fw-bold text-info">{item.numeroSerial}</td>
                                                            <td className="align-middle fw-bold">{item.nombre}</td>
                                                            <td className="align-middle text-light small"><i className="bi bi-geo-alt-fill text-danger me-1"></i>{item.bodega}</td>
                                                            <td className="align-middle text-center">
                                                                {enCarrito ? <button className="btn btn-sm btn-outline-secondary" disabled><i className="bi bi-check2-all me-1"></i>Seleccionado</button> : <button onClick={() => agregarAlCarrito(item)} className="btn btn-sm btn-outline-success"><i className="bi bi-cart-plus me-1"></i>Agregar</button>}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-4 text-muted">
                                                        No se encontraron repuestos con esos filtros.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 mb-4">
                            <div className="card bg-dark border-secondary shadow h-100">
                                <div className="card-header bg-dark text-light fw-bold py-3"><i className="bi bi-cart-check-fill text-success me-2"></i>Tu Solicitud</div>
                                <div className="card-body d-flex flex-column">
                                    <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: '250px' }}>
                                        {carrito.length === 0 ? <div className="text-center text-white mt-4">Aún no has agregado repuestos.</div> : (
                                            <ul className="list-group list-group-flush">
                                                {carrito.map(item => (
                                                    <li key={item.idRepuesto} className="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center px-0">
                                                        <div><span className="fw-bold text-info d-block">{item.numeroSerial}</span><span className="small text-muted">{item.nombre}</span></div>
                                                        <button onClick={() => quitarDelCarrito(item.idRepuesto)} className="btn btn-sm btn-link text-danger p-0"><i className="bi bi-x-circle-fill fs-5"></i></button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="mt-auto border-top border-secondary pt-3">
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-light">Justificación Solicitud:</label>
                                            <input type="text" className="form-control bg-secondary text-light border-dark" value={destino} onChange={(e) => setDestino(e.target.value)} />
                                        </div>
                                        <button onClick={handleEnviarSolicitud} className="btn btn-success fw-bold w-100" disabled={carrito.length === 0}>ENVIAR SOLICITUD</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PESTAÑA: DEVOLUCIONES (RF6) */}
                {tabActiva === 'devoluciones' && (
                    <div className="card bg-secondary border-0 shadow">
                        <div className="card-header bg-dark text-light fw-bold py-3">
                            <i className ></i>Mis Equipos a Cargo
                        </div>
                        <div className="card-body p-0">
                            <table className="table table-dark table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3">Serial</th>
                                        <th className="py-3">Componente</th>
                                        <th className="py-3">Fecha Préstamo</th>
                                        <th className="py-3">Límite Devolución</th>
                                        <th className="py-3 text-center">Estado</th>
                                        <th className="py-3 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equiposAsignados.map((eq) => (
                                        <tr key={eq.idAsignacion}>
                                            <td className="px-4 align-middle fw-bold text-info">{eq.numeroSerial}</td>
                                            <td className="align-middle">{eq.nombre}</td>
                                            <td className="align-middle text-small">{eq.fechaPrestamo}</td>
                                            <td className="align-middle fw-bold text-danger">{eq.fechaDevolucion}</td>
                                            <td className="align-middle text-center">
                                                <span className={`badge ${eq.estado === 'Devolución en Trámite' ? 'bg-primary' : eq.estado === 'En uso' ? 'bg-success' : 'bg-warning text-dark'}`}>{eq.estado}</span>
                                            </td>
                                            <td className="align-middle text-center">
                                                <button
                                                    onClick={() => handleSolicitarDevolucion(eq.idAsignacion)}
                                                    className="btn btn-sm btn-outline-warning"
                                                    disabled={eq.estado === 'Devolución en Trámite'}
                                                >
                                                    <i className="bi bi-arrow-return-left me-1"></i>Devolver
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* PESTAÑA: IMPORTACIONES (RF5) */}
                {tabActiva === 'importaciones' && (
                    <div className="card bg-secondary border-0 shadow">
                        <div className="card-header bg-dark text-light fw-bold py-3">
                            <i className></i>Solicitud de Importación Especial
                        </div>
                        <div className="card-body p-4">
                            <p className="text-white-50 small mb-4">
                                Utiliza este formulario únicamente cuando requieras un componente que no figura en el catálogo local de nuestras bodegas.
                            </p>
                            <form onSubmit={handleSolicitarImportacion}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-light">Descripción / Modelo del Repuesto Requerido:</label>
                                    <input
                                        type="text"
                                        className="form-control bg-dark text-light border-secondary"
                                        placeholder="Ej. Transceptor Ericsson Baseband 6630"
                                        value={descripcionImportacion}
                                        onChange={(e) => setDescripcionImportacion(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-light">Justificación Técnica (Sitio / Urgencia):</label>
                                    <textarea
                                        className="form-control bg-dark text-light border-secondary"
                                        rows="4"
                                        placeholder="Indica para qué sitio se necesita y por qué es crítico..."
                                        value={motivoImportacion}
                                        onChange={(e) => setMotivoImportacion(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <button type="submit" className="btn btn-success fw-bold shadow-sm">
                                        <i className></i>ENVIAR SOLICITUD A LOGÍSTICA
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default DashboardTecnico;