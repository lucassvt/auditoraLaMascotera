import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuditProvider } from './context/AuditContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Auditorias from './pages/Auditorias';
import Checklist from './pages/Checklist';
import Reportes from './pages/Reportes';
import Sucursales from './pages/Sucursales';
import NuevaAuditoria from './pages/NuevaAuditoria';
import InformeAuditoria from './pages/InformeAuditoria';

function App() {
  return (
    <AuditProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/auditorias" element={<Auditorias />} />
            <Route path="/auditorias/nueva" element={<NuevaAuditoria />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/sucursales" element={<Sucursales />} />
            <Route path="/informe" element={<InformeAuditoria />} />
          </Routes>
        </Layout>
      </Router>
    </AuditProvider>
  );
}

export default App;
