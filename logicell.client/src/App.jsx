import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importación de las páginas
import Login from './pages/Login';
import DashboardTecnico from './pages/DashboardTecnico';
import DashboardLogistico from './pages/DashboardLogistico';
import DashboardAdmin from './pages/DashboardAdmin';

function App() {
    return (
        <Router>
            <Routes>
                {/* Ruta principal: El Login */}
                <Route path="/" element={<Login />} />

                {/* Rutas de los perfiles */}
                <Route path="/tecnico" element={<DashboardTecnico />} />
                <Route path="/logistico" element={<DashboardLogistico />} />
                <Route path="/admin" element={<DashboardAdmin />} />
            </Routes>
        </Router>
    );
}

export default App;