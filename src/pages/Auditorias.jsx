import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Building2,
  DollarSign,
  ShieldCheck,
  Calendar,
  User,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Auditorias = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('todos');

  // Datos de ejemplo de auditorías
  const auditorias = [
    {
      id: 'AUD-2024-001',
      tipo: 'Operativa',
      titulo: 'Auditoría de Procesos de Ventas',
      area: 'Sucursal Centro',
      auditor: 'María García',
      fechaInicio: '15/12/2024',
      fechaFin: '20/12/2024',
      estado: 'En Proceso',
      cumplimiento: 78,
      hallazgos: 5,
      prioridad: 'Alta'
    },
    {
      id: 'AUD-2024-002',
      tipo: 'Financiera',
      titulo: 'Revisión de Cuentas por Cobrar',
      area: 'Administración',
      auditor: 'Carlos López',
      fechaInicio: '10/12/2024',
      fechaFin: '14/12/2024',
      estado: 'Completada',
      cumplimiento: 92,
      hallazgos: 2,
      prioridad: 'Media'
    },
    {
      id: 'AUD-2024-003',
      tipo: 'Calidad',
      titulo: 'Control de Calidad de Productos',
      area: 'Almacén Principal',
      auditor: 'Ana Martínez',
      fechaInicio: '18/12/2024',
      fechaFin: null,
      estado: 'Pendiente',
      cumplimiento: null,
      hallazgos: 0,
      prioridad: 'Alta'
    },
    {
      id: 'AUD-2024-004',
      tipo: 'Operativa',
      titulo: 'Auditoría de Inventario',
      area: 'Sucursal Norte',
      auditor: 'Juan Pérez',
      fechaInicio: '05/12/2024',
      fechaFin: '10/12/2024',
      estado: 'Completada',
      cumplimiento: 85,
      hallazgos: 3,
      prioridad: 'Baja'
    },
    {
      id: 'AUD-2024-005',
      tipo: 'Financiera',
      titulo: 'Revisión de Gastos Operativos',
      area: 'Administración',
      auditor: 'Laura Sánchez',
      fechaInicio: '01/12/2024',
      fechaFin: '08/12/2024',
      estado: 'Completada',
      cumplimiento: 88,
      hallazgos: 4,
      prioridad: 'Media'
    },
    {
      id: 'AUD-2024-006',
      tipo: 'Calidad',
      titulo: 'Evaluación de Servicio al Cliente',
      area: 'Sucursal Sur',
      auditor: 'Roberto Díaz',
      fechaInicio: '12/12/2024',
      fechaFin: null,
      estado: 'En Proceso',
      cumplimiento: 65,
      hallazgos: 7,
      prioridad: 'Alta'
    },
  ];

  const tipoConfig = {
    'Operativa': { icon: Building2, color: 'text-mascotera-accent', bg: 'bg-mascotera-accent/10' },
    'Financiera': { icon: DollarSign, color: 'text-mascotera-warning', bg: 'bg-mascotera-warning/10' },
    'Calidad': { icon: ShieldCheck, color: 'text-mascotera-success', bg: 'bg-mascotera-success/10' }
  };

  const estadoConfig = {
    'Completada': 'badge-success',
    'En Proceso': 'badge-info',
    'Pendiente': 'badge-warning',
    'Vencida': 'badge-danger'
  };

  const prioridadConfig = {
    'Alta': 'text-mascotera-danger',
    'Media': 'text-mascotera-warning',
    'Baja': 'text-mascotera-success'
  };

  const filteredAuditorias = selectedFilter === 'todos'
    ? auditorias
    : auditorias.filter(a => a.tipo === selectedFilter);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="title-yellow text-2xl">Registro de Auditorías</h1>
          <p className="text-mascotera-text-muted mt-1">
            Gestiona todas las auditorías del sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <Link to="/auditorias/nueva" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nueva Auditoría
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card-mascotera">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-mascotera-text-muted" />
            <input
              type="text"
              placeholder="Buscar por ID, título, área o auditor..."
              className="input-mascotera pl-10 w-full"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFilter('todos')}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedFilter === 'todos'
                  ? 'bg-mascotera-accent text-mascotera-dark font-semibold'
                  : 'bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedFilter('Operativa')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                selectedFilter === 'Operativa'
                  ? 'bg-mascotera-accent text-mascotera-dark font-semibold'
                  : 'bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Operativas
            </button>
            <button
              onClick={() => setSelectedFilter('Financiera')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                selectedFilter === 'Financiera'
                  ? 'bg-mascotera-accent text-mascotera-dark font-semibold'
                  : 'bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Financieras
            </button>
            <button
              onClick={() => setSelectedFilter('Calidad')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                selectedFilter === 'Calidad'
                  ? 'bg-mascotera-accent text-mascotera-dark font-semibold'
                  : 'bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Calidad
            </button>
          </div>

          {/* More Filters */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Más Filtros
          </button>
        </div>

        {/* Extended Filters */}
        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-mascotera-border grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-mascotera-text-muted mb-2">Estado</label>
              <select className="input-mascotera w-full">
                <option value="">Todos</option>
                <option value="completada">Completada</option>
                <option value="proceso">En Proceso</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-mascotera-text-muted mb-2">Área</label>
              <select className="input-mascotera w-full">
                <option value="">Todas</option>
                <option value="centro">Sucursal Centro</option>
                <option value="norte">Sucursal Norte</option>
                <option value="sur">Sucursal Sur</option>
                <option value="admin">Administración</option>
                <option value="almacen">Almacén Principal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-mascotera-text-muted mb-2">Fecha Desde</label>
              <input type="date" className="input-mascotera w-full" />
            </div>
            <div>
              <label className="block text-sm text-mascotera-text-muted mb-2">Fecha Hasta</label>
              <input type="date" className="input-mascotera w-full" />
            </div>
          </div>
        )}
      </div>

      {/* Auditorías Table */}
      <div className="card-mascotera overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-mascotera">
            <thead>
              <tr>
                <th>ID / Título</th>
                <th>Tipo</th>
                <th>Área</th>
                <th>Auditor</th>
                <th>Fechas</th>
                <th>Estado</th>
                <th>Cumplimiento</th>
                <th>Hallazgos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuditorias.map((auditoria) => {
                const TipoIcon = tipoConfig[auditoria.tipo].icon;
                return (
                  <tr key={auditoria.id} className="hover:bg-mascotera-darker/50">
                    <td>
                      <div>
                        <p className="font-mono text-sm text-mascotera-accent">{auditoria.id}</p>
                        <p className="font-medium text-mascotera-text mt-1">{auditoria.titulo}</p>
                      </div>
                    </td>
                    <td>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${tipoConfig[auditoria.tipo].bg}`}>
                        <TipoIcon className={`w-4 h-4 ${tipoConfig[auditoria.tipo].color}`} />
                        <span className={tipoConfig[auditoria.tipo].color}>{auditoria.tipo}</span>
                      </div>
                    </td>
                    <td>{auditoria.area}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-mascotera-accent/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-mascotera-accent" />
                        </div>
                        {auditoria.auditor}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-mascotera-text-muted" />
                          {auditoria.fechaInicio}
                        </div>
                        {auditoria.fechaFin && (
                          <div className="text-mascotera-text-muted mt-1">
                            → {auditoria.fechaFin}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${estadoConfig[auditoria.estado]}`}>
                        {auditoria.estado}
                      </span>
                    </td>
                    <td>
                      {auditoria.cumplimiento !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-mascotera-darker rounded-full overflow-hidden">
                            <div
                              className="h-full bg-mascotera-accent rounded-full"
                              style={{ width: `${auditoria.cumplimiento}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{auditoria.cumplimiento}%</span>
                        </div>
                      ) : (
                        <span className="text-mascotera-text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`font-semibold ${auditoria.hallazgos > 0 ? 'text-mascotera-warning' : 'text-mascotera-text-muted'}`}>
                        {auditoria.hallazgos}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-mascotera-text-muted hover:text-mascotera-accent transition-colors" title="Ver detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-mascotera-text-muted hover:text-mascotera-warning transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-mascotera-text-muted hover:text-mascotera-danger transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t border-mascotera-border">
          <p className="text-sm text-mascotera-text-muted">
            Mostrando <span className="font-semibold text-mascotera-text">1-6</span> de{' '}
            <span className="font-semibold text-mascotera-text">24</span> auditorías
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 rounded-lg bg-mascotera-accent text-mascotera-dark font-semibold">1</button>
            <button className="px-4 py-2 rounded-lg bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text">2</button>
            <button className="px-4 py-2 rounded-lg bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text">3</button>
            <button className="px-4 py-2 rounded-lg bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text">4</button>
            <button className="p-2 rounded-lg bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auditorias;
