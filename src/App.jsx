import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Auditorias from './pages/Auditorias';
import Checklist from './pages/Checklist';
import Reportes from './pages/Reportes';
import NuevaAuditoria from './pages/NuevaAuditoria';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auditorias" element={<Auditorias />} />
          <Route path="/auditorias/nueva" element={<NuevaAuditoria />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
