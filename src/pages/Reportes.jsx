import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Eye,
  Edit2,
  MessageSquare,
  Paperclip,
  Calendar,
  User,
  Building2,
  Clock,
  ChevronRight,
  X,
  Upload,
  Send
} from 'lucide-react';

const Reportes = () => {
  const [filterType, setFilterType] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHallazgo, setSelectedHallazgo] = useState(null);

  // Datos de ejemplo de hallazgos
  const hallazgos = [
    {
      id: 'HAL-2024-001',
      titulo: 'Ajuste de Stock Crítico - Desviación $45,000',
      descripcion: 'Se detectó una desviación significativa de $45,000 en el inventario valorizado. Ajustes de ingresos, egresos y transferencias mal registrados. Requiere auditoría profunda del sistema de stock.',
      tipo: 'no_conformidad',
      severidad: 'alta',
      categoria: 'stock',
      auditoria: 'AUD-2024-001',
      area: 'BELGRANO SUR',
      auditor: 'María García',
      fechaDeteccion: '16/12/2024',
      fechaLimite: '23/12/2024',
      estado: 'abierto',
      acciones: 2,
      comentarios: 3,
      evidencias: 2,
      monto: 45000
    },
    {
      id: 'HAL-2024-002',
      titulo: 'Tasa de Pedidos Ya Rechazados: 8.5%',
      descripcion: 'La sucursal presenta una tasa de rechazo de pedidos de Pedidos Ya del 8.5%, muy superior al límite del 3%. Esto impacta negativamente en la reputación y ventas del canal.',
      tipo: 'no_conformidad',
      severidad: 'alta',
      categoria: 'pedidos_ya',
      auditoria: 'AUD-2024-002',
      area: 'ARENALES',
      auditor: 'Carlos López',
      fechaDeteccion: '14/12/2024',
      fechaLimite: '21/12/2024',
      estado: 'abierto',
      acciones: 1,
      comentarios: 5,
      evidencias: 3,
      tasa: 8.5
    },
    {
      id: 'HAL-2024-003',
      titulo: 'Facturación a Consumidor Final: 42%',
      descripcion: 'La facturación a consumidor final representa el 42% del total de ventas, superando ampliamente el límite del 30%. Esto indica falta de cumplimiento en la consulta de CUIT/DNI para facturación.',
      tipo: 'no_conformidad',
      severidad: 'alta',
      categoria: 'facturacion',
      auditoria: 'AUD-2024-003',
      area: 'LAPRIDA',
      auditor: 'Ana Martínez',
      fechaDeteccion: '13/12/2024',
      fechaLimite: '27/12/2024',
      estado: 'en_proceso',
      acciones: 2,
      comentarios: 4,
      evidencias: 1,
      porcentaje: 42
    },
    {
      id: 'HAL-2024-004',
      titulo: 'Local con Deficiente Orden y Limpieza',
      descripcion: 'El local presenta graves deficiencias en orden y limpieza: pisos sucios, productos mal ubicados, áreas de depósito desordenadas y falta de mantenimiento general. Se adjuntan fotos como evidencia.',
      tipo: 'no_conformidad',
      severidad: 'alta',
      categoria: 'orden_limpieza',
      auditoria: 'AUD-2024-004',
      area: 'BELGRANO SUR',
      auditor: 'Roberto Díaz',
      fechaDeteccion: '15/12/2024',
      fechaLimite: '20/12/2024',
      estado: 'abierto',
      acciones: 3,
      comentarios: 2,
      evidencias: 8,
      tieneImagenes: true
    },
    {
      id: 'HAL-2024-005',
      titulo: 'Falta de Consulta de Programa de Puntos',
      descripcion: 'Los vendedores no están consultando al cliente si desea sumar puntos en el programa La Mascotera. Esto reduce la participación en el programa de fidelización.',
      tipo: 'no_conformidad',
      severidad: 'media',
      categoria: 'servicio_cliente',
      auditoria: 'AUD-2024-005',
      area: 'ARENALES',
      auditor: 'Juan Pérez',
      fechaDeteccion: '12/12/2024',
      fechaLimite: '26/12/2024',
      estado: 'en_proceso',
      acciones: 1,
      comentarios: 3,
      evidencias: 0
    },
    {
      id: 'HAL-2024-006',
      titulo: 'Transferencias Pendientes sin Aceptar - 12 Días',
      descripcion: 'Existen transferencias entre depósitos pendientes de aceptar por más de 12 días. Esto genera inconsistencias en el stock y bloquea mercadería.',
      tipo: 'no_conformidad',
      severidad: 'alta',
      categoria: 'gestion_admin',
      auditoria: 'AUD-2024-006',
      area: 'LAPRIDA',
      auditor: 'María García',
      fechaDeteccion: '11/12/2024',
      fechaLimite: '18/12/2024',
      estado: 'abierto',
      acciones: 1,
      comentarios: 2,
      evidencias: 2
    },
    {
      id: 'HAL-2024-007',
      titulo: 'Arqueo de Caja con Diferencia de $12,500',
      descripcion: 'El arqueo de caja reveló una diferencia de $12,500 sin justificar. No se realizaron conciliaciones diarias como establece el procedimiento.',
      tipo: 'no_conformidad',
      severidad: 'alta',
      categoria: 'caja',
      auditoria: 'AUD-2024-007',
      area: 'CONGRESO',
      auditor: 'Carlos López',
      fechaDeteccion: '10/12/2024',
      fechaLimite: '17/12/2024',
      estado: 'abierto',
      acciones: 2,
      comentarios: 6,
      evidencias: 3,
      monto: 12500
    },
    {
      id: 'HAL-2024-008',
      titulo: 'Acción Grave: Personal sin Capacitación en POS',
      descripcion: 'Se detectó que el personal nuevo no recibió la capacitación obligatoria sobre el uso del sistema POS y procedimientos de caja. Esto representa un riesgo operativo crítico.',
      tipo: 'no_conformidad',
      severidad: 'alta',
      categoria: 'accion_grave',
      auditoria: 'AUD-2024-008',
      area: 'CATAMARCA',
      auditor: 'Ana Martínez',
      fechaDeteccion: '09/12/2024',
      fechaLimite: '16/12/2024',
      estado: 'en_proceso',
      acciones: 2,
      comentarios: 1,
      evidencias: 1
    },
  ];

  const tipoConfig = {
    'no_conformidad': { label: 'No Conformidad', icon: AlertTriangle, color: 'text-mascotera-danger', bg: 'bg-mascotera-danger/10' },
    'observacion': { label: 'Observación', icon: Info, color: 'text-mascotera-warning', bg: 'bg-mascotera-warning/10' },
    'buena_practica': { label: 'Buena Práctica', icon: CheckCircle2, color: 'text-mascotera-success', bg: 'bg-mascotera-success/10' }
  };

  const severidadConfig = {
    'alta': { label: 'Alta', color: 'text-mascotera-danger', bg: 'bg-mascotera-danger/20' },
    'media': { label: 'Media', color: 'text-mascotera-warning', bg: 'bg-mascotera-warning/20' },
    'baja': { label: 'Baja', color: 'text-mascotera-info', bg: 'bg-mascotera-info/20' },
    'positivo': { label: 'Positivo', color: 'text-mascotera-success', bg: 'bg-mascotera-success/20' }
  };

  const estadoConfig = {
    'abierto': { label: 'Abierto', badge: 'badge-danger' },
    'en_proceso': { label: 'En Proceso', badge: 'badge-warning' },
    'cerrado': { label: 'Cerrado', badge: 'badge-success' }
  };

  const filteredHallazgos = filterType === 'todos'
    ? hallazgos
    : hallazgos.filter(h => h.tipo === filterType);

  const stats = [
    { label: 'Total Hallazgos', value: hallazgos.length, color: 'text-mascotera-text' },
    { label: 'Hallazgos Críticos', value: hallazgos.filter(h => h.severidad === 'alta').length, color: 'text-mascotera-danger' },
    { label: 'Orden y Limpieza', value: hallazgos.filter(h => h.categoria === 'orden_limpieza').length, color: 'text-mascotera-warning' },
    { label: 'Stock y Caja', value: hallazgos.filter(h => h.categoria === 'stock' || h.categoria === 'caja').length, color: 'text-mascotera-accent' },
    { label: 'Pedidos Ya', value: hallazgos.filter(h => h.categoria === 'pedidos_ya').length, color: 'text-mascotera-info' },
    { label: 'Acciones Graves', value: hallazgos.filter(h => h.categoria === 'accion_grave').length, color: 'text-mascotera-danger' },
  ];

  const openDetail = (hallazgo) => {
    setSelectedHallazgo(hallazgo);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="title-yellow text-2xl">Reportes y Hallazgos</h1>
          <p className="text-mascotera-text-muted mt-1">
            Gestión de hallazgos, no conformidades y observaciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Reporte
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nuevo Hallazgo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card-mascotera text-center">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-mascotera-text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-mascotera">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-mascotera-text-muted" />
            <input
              type="text"
              placeholder="Buscar por ID, título, área..."
              className="input-mascotera pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('todos')}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterType === 'todos'
                  ? 'bg-mascotera-accent text-mascotera-dark font-semibold'
                  : 'bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('no_conformidad')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                filterType === 'no_conformidad'
                  ? 'bg-mascotera-danger/20 text-mascotera-danger font-semibold'
                  : 'bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              No Conformidades
            </button>
            <button
              onClick={() => setFilterType('observacion')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                filterType === 'observacion'
                  ? 'bg-mascotera-warning/20 text-mascotera-warning font-semibold'
                  : 'bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text'
              }`}
            >
              <Info className="w-4 h-4" />
              Observaciones
            </button>
            <button
              onClick={() => setFilterType('buena_practica')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                filterType === 'buena_practica'
                  ? 'bg-mascotera-success/20 text-mascotera-success font-semibold'
                  : 'bg-mascotera-darker text-mascotera-text-muted hover:text-mascotera-text'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Buenas Prácticas
            </button>
          </div>
        </div>
      </div>

      {/* Hallazgos List */}
      <div className="space-y-4">
        {filteredHallazgos.map((hallazgo) => {
          const TipoIcon = tipoConfig[hallazgo.tipo].icon;

          return (
            <div
              key={hallazgo.id}
              className="card-mascotera hover:border-mascotera-accent/50 transition-all cursor-pointer"
              onClick={() => openDetail(hallazgo)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-lg ${tipoConfig[hallazgo.tipo].bg} flex-shrink-0`}>
                  <TipoIcon className={`w-6 h-6 ${tipoConfig[hallazgo.tipo].color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-mascotera-accent">{hallazgo.id}</span>
                        <span className={`badge ${estadoConfig[hallazgo.estado].badge}`}>
                          {estadoConfig[hallazgo.estado].label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${severidadConfig[hallazgo.severidad].bg} ${severidadConfig[hallazgo.severidad].color}`}>
                          {severidadConfig[hallazgo.severidad].label}
                        </span>
                      </div>
                      <h3 className="font-semibold text-mascotera-text mt-2">{hallazgo.titulo}</h3>
                      <p className="text-sm text-mascotera-text-muted mt-1 line-clamp-2">
                        {hallazgo.descripcion}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-mascotera-text-muted flex-shrink-0" />
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-6 mt-4 text-sm text-mascotera-text-muted flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {hallazgo.area}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {hallazgo.auditor}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {hallazgo.fechaDeteccion}
                    </span>
                    {hallazgo.fechaLimite && (
                      <span className="flex items-center gap-1 text-mascotera-warning">
                        <Clock className="w-4 h-4" />
                        Vence: {hallazgo.fechaLimite}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {hallazgo.comentarios}
                    </span>
                    <span className="flex items-center gap-1">
                      <Paperclip className="w-4 h-4" />
                      {hallazgo.evidencias}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalle */}
      {modalOpen && selectedHallazgo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-mascotera-dark border border-mascotera-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-mascotera-dark border-b border-mascotera-border p-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm text-mascotera-accent">{selectedHallazgo.id}</span>
                  <span className={`badge ${estadoConfig[selectedHallazgo.estado].badge}`}>
                    {estadoConfig[selectedHallazgo.estado].label}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-mascotera-text">{selectedHallazgo.titulo}</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-mascotera-text-muted hover:text-mascotera-text transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-mascotera-darker rounded-lg">
                  <p className="text-xs text-mascotera-text-muted mb-1">Tipo</p>
                  <p className={`font-semibold ${tipoConfig[selectedHallazgo.tipo].color}`}>
                    {tipoConfig[selectedHallazgo.tipo].label}
                  </p>
                </div>
                <div className="p-4 bg-mascotera-darker rounded-lg">
                  <p className="text-xs text-mascotera-text-muted mb-1">Severidad</p>
                  <p className={`font-semibold ${severidadConfig[selectedHallazgo.severidad].color}`}>
                    {severidadConfig[selectedHallazgo.severidad].label}
                  </p>
                </div>
                <div className="p-4 bg-mascotera-darker rounded-lg">
                  <p className="text-xs text-mascotera-text-muted mb-1">Área</p>
                  <p className="font-semibold text-mascotera-text">{selectedHallazgo.area}</p>
                </div>
                <div className="p-4 bg-mascotera-darker rounded-lg">
                  <p className="text-xs text-mascotera-text-muted mb-1">Auditoría</p>
                  <p className="font-mono font-semibold text-mascotera-accent">{selectedHallazgo.auditoria}</p>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h3 className="font-semibold text-mascotera-text mb-2">Descripción del Hallazgo</h3>
                <p className="text-mascotera-text-muted">{selectedHallazgo.descripcion}</p>
              </div>

              {/* Evidencias */}
              <div>
                <h3 className="font-semibold text-mascotera-text mb-3">Evidencias</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="aspect-video bg-mascotera-darker rounded-lg flex items-center justify-center border border-mascotera-border">
                      <FileText className="w-8 h-8 text-mascotera-text-muted" />
                    </div>
                  ))}
                  <button className="aspect-video bg-mascotera-darker rounded-lg flex flex-col items-center justify-center border border-dashed border-mascotera-border hover:border-mascotera-accent transition-colors">
                    <Upload className="w-6 h-6 text-mascotera-text-muted mb-2" />
                    <span className="text-xs text-mascotera-text-muted">Agregar</span>
                  </button>
                </div>
              </div>

              {/* Plan de Acción */}
              <div>
                <h3 className="font-semibold text-mascotera-text mb-3">Plan de Acción</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-mascotera-darker rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-mascotera-success mt-0.5" />
                    <div>
                      <p className="text-mascotera-text">Realizar conteo físico completo del inventario</p>
                      <p className="text-xs text-mascotera-text-muted mt-1">Responsable: Juan Pérez • Fecha: 18/12/2024</p>
                    </div>
                  </div>
                  <div className="p-4 bg-mascotera-darker rounded-lg flex items-start gap-3">
                    <Clock className="w-5 h-5 text-mascotera-warning mt-0.5" />
                    <div>
                      <p className="text-mascotera-text">Ajustar diferencias en sistema</p>
                      <p className="text-xs text-mascotera-text-muted mt-1">Responsable: María García • Fecha: 20/12/2024</p>
                    </div>
                  </div>
                  <button className="w-full p-3 border border-dashed border-mascotera-border rounded-lg text-mascotera-text-muted hover:border-mascotera-accent hover:text-mascotera-accent transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Agregar Acción
                  </button>
                </div>
              </div>

              {/* Comentarios */}
              <div>
                <h3 className="font-semibold text-mascotera-text mb-3">Comentarios</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-mascotera-accent/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-mascotera-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-mascotera-text">María García</span>
                        <span className="text-xs text-mascotera-text-muted">hace 2 horas</span>
                      </div>
                      <p className="text-sm text-mascotera-text-muted mt-1">
                        Se coordinó con el equipo de almacén para realizar el conteo este viernes.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe un comentario..."
                    className="input-mascotera flex-1"
                  />
                  <button className="btn-primary p-3">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-mascotera-dark border-t border-mascotera-border p-6 flex items-center justify-end gap-4">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">
                Cerrar
              </button>
              <button className="btn-primary flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Editar Hallazgo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;
