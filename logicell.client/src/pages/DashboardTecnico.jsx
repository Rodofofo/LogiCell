import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';

const DashboardTecnico = () => {
    // 1. PESTAÑA ACTIVA ('nueva' o 'historial')
    const [tabActiva, setTabActiva] = useState('historial');

    // 2. MOCK DATA: CATÁLOGO DISPONIBLE
    const [catalogo] = useState([
        { idRepuesto: 1, numeroSerial: 'RBS-TX-001', nombre: 'Transceptor RBS 6000', bodega: 'Bodega Central' },
        { idRepuesto: 3, numeroSerial: 'CAB-FO-100', nombre: 'Bobina Fibra Óptica 100m', bodega: 'Bodega Norte' },
        { idRepuesto: 4, numeroSerial: 'PWR-SUP-48V', nombre: 'Fuente de Poder 48V DC', bodega: 'Bodega Central' }
    ]);

    // 3. MOCK DATA: HISTORIAL DE PEDIDOS DEL TÉCNICO
    const [historial] = useState([
        { idSolicitud: 101, fecha: '10/06/2026', sitioMotivo: 'BTS-SJ-045 (Falla de Tx)', materiales: '1x Transceptor RBS 6000', estado: 'Pendiente' },
        { idSolicitud: 102, fecha: '09/06/2026', sitioMotivo: 'RBS-A-102 (Ampliación)', materiales: '2x Bobina Fibra Óptica 100m', estado: 'Aprobado' },
        { idSolicitud: 99, fecha: '01/06/2026', sitioMotivo: 'Reparación Antena', materiales: '1x Antena Sectorial 65°', estado: 'Rechazado' }
    ]);

    // 4. ESTADOS DEL CARRITO Y SOLICITUD
    const [carrito, setCarrito] = useState([]);
    const [destino, setDestino] = useState('');

    const agregarAlCarrito = (repuesto) => {
        if (!carrito.find(item => item.idRepuesto === repuesto.idRepuesto)) {
            setCarrito([...carrito, repuesto]);
        }
    };

    const quitarDelCarrito = (idRepuesto) => {
        setCarrito(carrito.filter(item => item.idRepuesto !== idRepuesto));
    };

    const handleEnviarSolicitud = () => {
        if (carrito.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Carrito vacío', text: 'Selecciona al menos un repuesto.', background: '#212529', color: '#fff' });
            return;
        }
        if (destino.trim() === '') {
            Swal.fire({ icon: 'warning', title: 'Falta destino', text: 'Indica el código del sitio o motivo.', background: '#212529', color: '#fff' });
            return;
        }

        Swal.fire({
            icon: 'success', title: 'Solicitud Enviada',
            text: `Se solicitaron ${carrito.length} repuesto(s) para el sitio ${destino}.`,
            background: '#212529', color: '#fff', confirmButtonColor: '#198754'
        });

        setCarrito([]);
        setDestino('');

        // Opcional: Cambiamos a la pestaña de historial automáticamente después de pedir
        setTabActiva('historial');
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-dark">
            <Navbar />

            <div className="flex-grow-1 container-fluid p-4 text-light pb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2><i className="bi bi-tools text-success me-2"></i>Panel Operativo</h2>
                </div>

                {/* MENÚ DE PESTAÑAS (TABS) */}
                {/* MENÚ DE PESTAÑAS (TABS) */}
                <ul className="nav nav-tabs border-secondary mb-4">
                    <li className="nav-item">
                        <button
                            className={`nav-link text-uppercase fw-bold ${tabActiva === 'historial' ? 'active bg-secondary text-light border-secondary' : 'text-white-50'}`}
                            onClick={() => setTabActiva('historial')}
                        >
                            <i className="bi bi-clock-history me-2"></i>Mis Pedidos Anteriores
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
                </ul>

                {/* CONTENIDO PESTAÑA 1: NUEVA SOLICITUD (CATÁLOGO + CARRITO) */}
                {tabActiva === 'nueva' && (
                    <div className="row mt-2">
                        <div className="col-lg-8 mb-4">
                            <div className="card bg-secondary border-0 shadow h-100">
                                <div className="card-header border-secondary bg-dark text-light fw-bold py-3">
                                    <i className="bi bi-list-ul text-info me-2"></i>Catálogo de Componentes Disponibles
                                </div>
                                <div className="card-body p-0">
                                    <table className="table table-dark table-hover mb-0">
                                        <thead>
                                            <tr>
                                                <th className="px-4 py-3">Serial</th>
                                                <th className="py-3">Componente</th>
                                                <th className="py-3">Ubicación</th>
                                                <th className="py-3 text-center">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {catalogo.map((item) => {
                                                const enCarrito = carrito.find(c => c.idRepuesto === item.idRepuesto);
                                                return (
                                                    <tr key={item.idRepuesto}>
                                                        <td className="px-4 align-middle fw-bold text-info">{item.numeroSerial}</td>
                                                        <td className="align-middle fw-bold">{item.nombre}</td>
                                                        <td className="align-middle text-light small"><i className="bi bi-geo-alt-fill text-danger me-1"></i>{item.bodega}</td>
                                                        <td className="align-middle text-center">
                                                            {enCarrito ? (
                                                                <button className="btn btn-sm btn-outline-secondary" disabled><i className="bi bi-check2-all me-1"></i>Seleccionado</button>
                                                            ) : (
                                                                <button onClick={() => agregarAlCarrito(item)} className="btn btn-sm btn-outline-success"><i className="bi bi-cart-plus me-1"></i>Agregar</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4 mb-4">
                            <div className="card bg-dark border-secondary shadow h-100">
                                <div className="card-header border-secondary bg-dark text-light fw-bold py-3">
                                    <i className="bi bi-cart-check-fill text-success me-2"></i>Tu Solicitud
                                    <span className="badge bg-success float-end">{carrito.length}</span>
                                </div>
                                <div className="card-body d-flex flex-column">
                                    <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: '250px' }}>
                                        {carrito.length === 0 ? (
                                            <div className="text-center text-muted mt-4">
                                                <i className="bi bi-cart-x fs-1 d-block mb-2"></i>Aún no has agregado repuestos.
                                            </div>
                                        ) : (
                                            <ul className="list-group list-group-flush">
                                                {carrito.map(item => (
                                                    <li key={item.idRepuesto} className="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center px-0">
                                                        <div>
                                                            <span className="fw-bold text-info d-block" style={{ fontSize: '0.9rem' }}>{item.numeroSerial}</span>
                                                            <span className="small text-muted">{item.nombre}</span>
                                                        </div>
                                                        <button onClick={() => quitarDelCarrito(item.idRepuesto)} className="btn btn-sm btn-link text-danger p-0" title="Quitar">
                                                            <i className="bi bi-x-circle-fill fs-5"></i>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="mt-auto border-top border-secondary pt-3">
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold text-light">Código del Sitio / Motivo:</label>
                                            <input type="text" className="form-control bg-secondary text-light border-dark" placeholder="Ej: BTS-SJ-045, Mantenimiento..." value={destino} onChange={(e) => setDestino(e.target.value)} />
                                        </div>
                                        <button onClick={handleEnviarSolicitud} className="btn btn-success fw-bold w-100 py-2 shadow-sm" disabled={carrito.length === 0}>
                                            <i className="bi bi-send-fill me-2"></i>ENVIAR SOLICITUD
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENIDO PESTAÑA 2: HISTORIAL DE PEDIDOS */}
                {tabActiva === 'historial' && (
                    <div className="card bg-secondary border-0 shadow mt-2">
                        <div className="card-body p-0">
                            <table className="table table-dark table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3">ID Pedido</th>
                                        <th className="py-3">Fecha</th>
                                        <th className="py-3">Sitio / Motivo</th>
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
                                                <span className={`badge ${pedido.estado === 'Pendiente' ? 'bg-warning text-dark' :
                                                        pedido.estado === 'Aprobado' ? 'bg-success' : 'bg-danger'
                                                    }`}>
                                                    {pedido.estado}
                                                </span>
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
        </div>
    );
};

export default DashboardTecnico;