import React, { useState } from 'react';
import {
  Plus,
  Search,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Building2,
  DollarSign,
  ShieldCheck,
  Edit2,
  Trash2,
  Copy,
  Eye,
  MoreVertical,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const Checklist = () => {
  const [expandedCategory, setExpandedCategory] = useState('operativa');
  const [selectedChecklist, setSelectedChecklist] = useState(null);

  // Plantillas de checklist predefinidas
  const checklistTemplates = {
    operativa: {
      nombre: 'Auditoría Operativa',
      icon: Building2,
      color: 'text-mascotera-accent',
      bg: 'bg-mascotera-accent/10',
      checklists: [
        {
          id: 'OP-001',
          nombre: 'Control de Inventario',
          items: 15,
          descripcion: 'Verificación de stock, rotación y almacenamiento',
          ultimaActualizacion: '10/12/2024'
        },
        {
          id: 'OP-002',
          nombre: 'Procesos de Venta',
          items: 20,
          descripcion: 'Evaluación del flujo de ventas y atención al cliente',
          ultimaActualizacion: '08/12/2024'
        },
        {
          id: 'OP-003',
          nombre: 'Gestión de Personal',
          items: 12,
          descripcion: 'Asistencia, horarios y cumplimiento de tareas',
          ultimaActualizacion: '05/12/2024'
        },
        {
          id: 'OP-004',
          nombre: 'Seguridad e Higiene',
          items: 18,
          descripcion: 'Normas de seguridad y limpieza del local',
          ultimaActualizacion: '01/12/2024'
        }
      ]
    },
    financiera: {
      nombre: 'Auditoría Financiera',
      icon: DollarSign,
      color: 'text-mascotera-warning',
      bg: 'bg-mascotera-warning/10',
      checklists: [
        {
          id: 'FIN-001',
          nombre: 'Cuentas por Cobrar',
          items: 10,
          descripcion: 'Revisión de facturas pendientes y antigüedad',
          ultimaActualizacion: '12/12/2024'
        },
        {
          id: 'FIN-002',
          nombre: 'Control de Caja',
          items: 14,
          descripcion: 'Arqueo de caja y conciliación diaria',
          ultimaActualizacion: '11/12/2024'
        },
        {
          id: 'FIN-003',
          nombre: 'Gastos Operativos',
          items: 16,
          descripcion: 'Revisión de gastos, comprobantes y autorizaciones',
          ultimaActualizacion: '09/12/2024'
        }
      ]
    },
    calidad: {
      nombre: 'Auditoría de Calidad',
      icon: ShieldCheck,
      color: 'text-mascotera-success',
      bg: 'bg-mascotera-success/10',
      checklists: [
        {
          id: 'CAL-001',
          nombre: 'Calidad de Productos',
          items: 22,
          descripcion: 'Estado de productos, fechas de vencimiento y almacenamiento',
          ultimaActualizacion: '14/12/2024'
        },
        {
          id: 'CAL-002',
          nombre: 'Satisfacción del Cliente',
          items: 12,
          descripcion: 'Encuestas, quejas y tiempo de respuesta',
          ultimaActualizacion: '13/12/2024'
        },
        {
          id: 'CAL-003',
          nombre: 'Estándares de Servicio',
          items: 18,
          descripcion: 'Protocolos de atención y presentación',
          ultimaActualizacion: '07/12/2024'
        }
      ]
    }
  };

  // Ejemplo de checklist detallado
  const checklistDetalle = {
    id: 'OP-001',
    nombre: 'Control de Inventario',
    descripcion: 'Verificación completa del sistema de inventario, incluyendo stock físico, rotación y condiciones de almacenamiento.',
    categorias: [
      {
        nombre: 'Verificación de Stock',
        items: [
          { id: 1, texto: 'El inventario físico coincide con el sistema', estado: 'pendiente', observacion: '' },
          { id: 2, texto: 'No hay productos con stock negativo', estado: 'cumple', observacion: '' },
          { id: 3, texto: 'Los productos de alta rotación están disponibles', estado: 'cumple', observacion: '' },
          { id: 4, texto: 'Se registran correctamente las entradas de mercadería', estado: 'no_cumple', observacion: 'Falta documentación en 3 ingresos' },
        ]
      },
      {
        nombre: 'Condiciones de Almacenamiento',
        items: [
          { id: 5, texto: 'Temperatura adecuada en áreas refrigeradas', estado: 'cumple', observacion: '' },
          { id: 6, texto: 'Productos organizados por categoría', estado: 'pendiente', observacion: '' },
          { id: 7, texto: 'Señalización correcta de pasillos', estado: 'cumple', observacion: '' },
          { id: 8, texto: 'Limpieza general del almacén', estado: 'cumple', observacion: '' },
        ]
      },
      {
        nombre: 'Control de Vencimientos',
        items: [
          { id: 9, texto: 'Sistema FIFO implementado correctamente', estado: 'pendiente', observacion: '' },
          { id: 10, texto: 'No hay productos vencidos en exhibición', estado: 'cumple', observacion: '' },
          { id: 11, texto: 'Alertas de vencimiento configuradas', estado: 'no_cumple', observacion: 'Sistema no tiene alertas activas' },
          { id: 12, texto: 'Registro de productos dados de baja', estado: 'cumple', observacion: '' },
        ]
      }
    ]
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'cumple':
        return <CheckCircle className="w-5 h-5 text-mascotera-success" />;
      case 'no_cumple':
        return <AlertCircle className="w-5 h-5 text-mascotera-danger" />;
      default:
        return <Clock className="w-5 h-5 text-mascotera-text-muted" />;
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'cumple':
        return 'badge-success';
      case 'no_cumple':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="title-yellow text-2xl">Checklist de Control</h1>
          <p className="text-mascotera-text-muted mt-1">
            Plantillas y listas de verificación para auditorías
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Checklist
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Plantillas */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-mascotera-text-muted" />
            <input
              type="text"
              placeholder="Buscar checklist..."
              className="input-mascotera pl-10 w-full"
            />
          </div>

          {/* Categories */}
          {Object.entries(checklistTemplates).map(([key, category]) => {
            const Icon = category.icon;
            const isExpanded = expandedCategory === key;

            return (
              <div key={key} className="card-mascotera">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : key)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.bg}`}>
                      <Icon className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-mascotera-text">{category.nombre}</h3>
                      <p className="text-xs text-mascotera-text-muted">
                        {category.checklists.length} plantillas
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-mascotera-text-muted" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-mascotera-text-muted" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-2 border-t border-mascotera-border pt-4">
                    {category.checklists.map((checklist) => (
                      <button
                        key={checklist.id}
                        onClick={() => setSelectedChecklist(checklist.id)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          selectedChecklist === checklist.id
                            ? 'bg-mascotera-accent/20 border border-mascotera-accent'
                            : 'bg-mascotera-darker hover:bg-mascotera-card'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-mascotera-text-muted">
                            {checklist.id}
                          </span>
                          <span className="text-xs text-mascotera-text-muted">
                            {checklist.items} items
                          </span>
                        </div>
                        <p className="font-medium text-mascotera-text mt-1">
                          {checklist.nombre}
                        </p>
                        <p className="text-xs text-mascotera-text-muted mt-1 line-clamp-1">
                          {checklist.descripcion}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content - Checklist Detail */}
        <div className="lg:col-span-2">
          {selectedChecklist ? (
            <div className="card-mascotera">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-mascotera-border">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-mascotera-accent">
                      {checklistDetalle.id}
                    </span>
                    <span className={`badge ${getEstadoBadge('pendiente')}`}>
                      En Revisión
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-mascotera-text">
                    {checklistDetalle.nombre}
                  </h2>
                  <p className="text-mascotera-text-muted mt-2">
                    {checklistDetalle.descripcion}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-mascotera-text-muted hover:text-mascotera-accent transition-colors" title="Duplicar">
                    <Copy className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-mascotera-text-muted hover:text-mascotera-warning transition-colors" title="Editar">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-mascotera-text-muted hover:text-mascotera-danger transition-colors" title="Eliminar">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6 p-4 bg-mascotera-darker rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-mascotera-text-muted">Progreso del checklist</span>
                  <span className="font-semibold text-mascotera-accent">7 de 12 items</span>
                </div>
                <div className="h-2 bg-mascotera-card rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-mascotera-accent to-mascotera-accent-light rounded-full" style={{ width: '58%' }}></div>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-mascotera-success" />
                    <span className="text-mascotera-text-muted">7 Cumplen</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-mascotera-danger" />
                    <span className="text-mascotera-text-muted">2 No cumplen</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-mascotera-warning" />
                    <span className="text-mascotera-text-muted">3 Pendientes</span>
                  </span>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-6">
                {checklistDetalle.categorias.map((categoria, catIndex) => (
                  <div key={catIndex}>
                    <h3 className="font-semibold text-mascotera-text mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-mascotera-accent" />
                      {categoria.nombre}
                    </h3>
                    <div className="space-y-3">
                      {categoria.items.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border transition-all ${
                            item.estado === 'cumple'
                              ? 'bg-mascotera-success/5 border-mascotera-success/30'
                              : item.estado === 'no_cumple'
                              ? 'bg-mascotera-danger/5 border-mascotera-danger/30'
                              : 'bg-mascotera-darker border-mascotera-border'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getEstadoIcon(item.estado)}
                            </div>
                            <div className="flex-1">
                              <p className="text-mascotera-text">{item.texto}</p>
                              {item.observacion && (
                                <p className="text-sm text-mascotera-danger mt-2 flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4" />
                                  {item.observacion}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={item.estado}
                                className="input-mascotera text-sm py-1 px-2"
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="cumple">Cumple</option>
                                <option value="no_cumple">No Cumple</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-mascotera-border flex items-center justify-end gap-4">
                <button className="btn-secondary">
                  Guardar Borrador
                </button>
                <button className="btn-primary">
                  Finalizar Checklist
                </button>
              </div>
            </div>
          ) : (
            <div className="card-mascotera h-full flex items-center justify-center">
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 text-mascotera-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-mascotera-text mb-2">
                  Selecciona un Checklist
                </h3>
                <p className="text-mascotera-text-muted max-w-sm">
                  Elige una plantilla de la barra lateral para ver y editar los items de verificación
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checklist;
