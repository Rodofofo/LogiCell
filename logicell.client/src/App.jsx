import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importacion de las paginas
import Login from './pages/Login';
import DashboardTecnico from './pages/DashboardTecnico';
import DashboardLogistico from './pages/DashboardLogistico';
import DashboardAdmin from './pages/DashboardAdmin';

// Importacion del guardian de rutas
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                {/* Ruta publica: El Login */}
                <Route path="/" element={<Login />} />

                {/* Rutas protegidas por el guardian */}
                <Route path="/tecnico" element={
                    <ProtectedRoute rolPermitido="Tecnico">
                        <DashboardTecnico />
                    </ProtectedRoute>
                } />

                <Route path="/logistico" element={
                    <ProtectedRoute rolPermitido="Logistico">
                        <DashboardLogistico />
                    </ProtectedRoute>
                } />

                <Route path="/admin" element={
                    <ProtectedRoute rolPermitido="Admin">
                        <DashboardAdmin />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;