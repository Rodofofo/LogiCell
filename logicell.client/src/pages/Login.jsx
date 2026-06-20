import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// Login: formulario de autenticación.
// Comentarios técnicos breves añadidos.
const Login = () => {
    // Estados: campos del formulario
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const navigate = useNavigate();

    // Enviar credenciales al API y redirigir según rol (mock de flujo)
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('https://localhost:7235/api/Auth/login', {
                correo: correo,
                contrasena: contrasena
            });

            // Si la conexión es exitosa, mostramos alerta y redirigimos
            if (response.status === 200) {
                const rolUsuario = response.data.rol;
                localStorage.setItem('userRol', rolUsuario);
                localStorage.setItem('userCorreo', correo);

                Swal.fire({
                    icon: 'success',
                    title: '¡Acceso Concedido!',
                    text: 'Bienvenido al sistema LogiCell',
                    background: '#212529',
                    color: '#fff',
                    confirmButtonColor: '#198754'
                });

                // Redirigir según rol
                if (rolUsuario === 'Tecnico') navigate('/tecnico');
                else if (rolUsuario === 'Logistico') navigate('/logistico');
                else if (rolUsuario === 'Admin') navigate('/admin');
                else navigate('/');
            }
        } catch (error) {
            // Error de autenticación
            Swal.fire({
                icon: 'error',
                title: 'Acceso Denegado',
                text: 'El correo o la contraseña son incorrectos.',
                background: '#212529',
                color: '#fff',
                confirmButtonColor: '#dc3545'
            });
            console.error("Error en la petición:", error);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
            <div className="card bg-secondary text-light shadow-lg" style={{ width: '22rem', border: 'none', borderRadius: '10px' }}>
                <div className="card-body p-4">

                    <div className="text-center mb-4">
                        <i className="bi bi-cpu-fill text-success" style={{ fontSize: '3rem' }}></i>
                        <h3 className="mt-2 text-uppercase fw-bold" style={{ letterSpacing: '2px' }}>LogiCell</h3>
                        <p className="text-light opacity-75 small">Control de Entrega de Repuestos</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label text-light small fw-bold">Usuario</label>
                            <div className="input-group">
                                <span className="input-group-text bg-dark text-success border-secondary">
                                    <i className="bi bi-person-fill"></i>
                                </span>
                                <input
                                    type="email"
                                    className="form-control bg-dark text-light border-secondary"
                                    placeholder="correo@ejemplo.com"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-light small fw-bold">Contraseña</label>
                            <div className="input-group">
                                <span className="input-group-text bg-dark text-success border-secondary">
                                    <i className="bi bi-lock-fill"></i>
                                </span>
                                <input
                                    type="password"
                                    className="form-control bg-dark text-light border-secondary"
                                    placeholder="••••••••"
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-success w-100 fw-bold shadow-sm">
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            INGRESAR
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;