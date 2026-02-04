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

  // Datos de sucursales con desempeño por pilar
  const sucursales = [
    {
      nombre: 'LEGUIZAMON',
      pilares: {
        ordenLimpieza: true,
        serviciosClub: true,
        gestionAdministrativa: true,
        pedidosYa: true,
        stockCaja: true
      }
    },
    {
      nombre: 'CATAMARCA',
      pilares: {
        ordenLimpieza: true,
        serviciosClub: true,
        gestionAdministrativa: true,
        pedidosYa: true,
        stockCaja: true
      }
    },
    {
      nombre: 'CONGRESO',
      pilares: {
        ordenLimpieza: true,
        serviciosClub: true,
        gestionAdministrativa: false,
        pedidosYa: true,
        stockCaja: true
      }
    },
    {
      nombre: 'ARENALES',
      pilares: {
        ordenLimpieza: true,
        serviciosClub: false,
        gestionAdministrativa: true,
        pedidosYa: false,
        stockCaja: true
      }
    },
    {
      nombre: 'BELGRANO SUR',
      pilares: {
        ordenLimpieza: false,
        serviciosClub: true,
        gestionAdministrativa: true,
        pedidosYa: false,
        stockCaja: true
      }
    },
    {
      nombre: 'LAPRIDA',
      pilares: {
        ordenLimpieza: false,
        serviciosClub: true,
        gestionAdministrativa: false,
        pedidosYa: false,
        stockCaja: true
      }
    },
    {
      nombre: 'VILLA CRESPO',
      pilares: {
        ordenLimpieza: null,
        serviciosClub: null,
        gestionAdministrativa: null,
        pedidosYa: null,
        stockCaja: null
      }
    }
  ];

  // Plantillas de pilares predefinidas
  const checklistTemplates = {
    ordenLimpieza: {
      nombre: 'Orden y Limpieza',
      icon: Building2,
      color: 'text-mascotera-accent',
      bg: 'bg-mascotera-accent/10',
      checklists: [
        {
          id: 'OL-001',
          nombre: 'Local en Condiciones Óptimas',
          items: 2,
          descripcion: 'Verificación del estado general del local',
          ultimaActualizacion: '04/02/2026'
        },
        {
          id: 'OL-002',
          nombre: 'Indumentaria de Trabajo Presentable',
          items: 2,
          descripcion: 'Control de uniformes y presentación del personal',
          ultimaActualizacion: '04/02/2026'
        }
      ]
    },
    serviciosClub: {
      nombre: 'Servicios y Club la Mascotera',
      icon: ShieldCheck,
      color: 'text-mascotera-success',
      bg: 'bg-mascotera-success/10',
      checklists: [
        {
          id: 'SC-001',
          nombre: 'Servicio de Veterinaria',
          items: 1,
          descripcion: 'Evaluación del servicio veterinario ofrecido',
          ultimaActualizacion: '04/02/2026'
        },
        {
          id: 'SC-002',
          nombre: 'Servicio de Peluquería',
          items: 1,
          descripcion: 'Evaluación del servicio de peluquería canina',
          ultimaActualizacion: '04/02/2026'
        },
        {
          id: 'SC-003',
          nombre: 'Pregunta: ¿Suma puntos?',
          items: 1,
          descripcion: 'Control si se ofrece el programa de puntos al cliente',
          ultimaActualizacion: '04/02/2026'
        },
        {
          id: 'SC-004',
          nombre: 'Facturación a Consumidor Final < 30%',
          items: 1,
          descripcion: 'Control del ratio de facturación a consumidor final',
          ultimaActualizacion: '04/02/2026'
        }
      ]
    },
    gestionAdministrativa: {
      nombre: 'Gestión Administrativa y Sistema',
      icon: FileText,
      color: 'text-mascotera-warning',
      bg: 'bg-mascotera-warning/10',
      checklists: [
        {
          id: 'GA-001',
          nombre: 'Pedidos Pendientes de Facturar',
          items: 1,
          descripcion: 'Revisión de pedidos sin facturar en el sistema',
          ultimaActualizacion: '04/02/2026'
        },
        {
          id: 'GA-002',
          nombre: 'Carga Correcta de Remitos',
          items: 1,
          descripcion: 'Verificación de remitos cargados correctamente',
          ultimaActualizacion: '04/02/2026'
        },
        {
          id: 'GA-003',
          nombre: 'Transferencias Pendientes de Aceptar',
          items: 1,
          descripcion: 'Control de transferencias pendientes de confirmación',
          ultimaActualizacion: '04/02/2026'
        }
      ]
    },
    pedidosYa: {
      nombre: 'Pedidos Ya / Whatsapp WEB',
      icon: CheckSquare,
      color: 'text-mascotera-accent',
      bg: 'bg-mascotera-accent/10',
      checklists: [
        {
          id: 'PY-001',
          nombre: 'Tasa de Pedidos Rechazados',
          items: 1,
          descripcion: 'Control que la tasa sea menor al 3%',
          ultimaActualizacion: '04/02/2026'
        }
      ]
    },
    stockCaja: {
      nombre: 'Stock y Caja',
      icon: DollarSign,
      color: 'text-mascotera-danger',
      bg: 'bg-mascotera-danger/10',
      checklists: [
        {
          id: 'SC-001',
          nombre: 'Desviaciones de Stock Valorizadas',
          items: 1,
          descripcion: 'Control de ingresos, egresos y ajustes de stock',
          ultimaActualizacion: '04/02/2026'
        },
        {
          id: 'SC-002',
          nombre: 'Arqueos y Conciliaciones',
          items: 1,
          descripcion: 'Verificación de arqueos de efectivo y tarjetas bancarias',
          ultimaActualizacion: '04/02/2026'
        }
      ]
    }
  };

  // Ejemplo de pilar detallado
  const checklistDetalle = {
    id: 'OL-001',
    nombre: 'Orden y Limpieza',
    descripcion: 'Evaluación de las condiciones del local y la presentación del personal.',
    categorias: [
      {
        nombre: 'Local en Condiciones Óptimas',
        items: [
          { id: 1, texto: 'El local se encuentra limpio y ordenado', estado: 'cumple', observacion: '' },
          { id: 2, texto: 'Los espacios comunes están libres de obstrucciones', estado: 'cumple', observacion: '' },
        ]
      },
      {
        nombre: 'Indumentaria de Trabajo Presentable',
        items: [
          { id: 3, texto: 'El personal usa uniforme completo y en buen estado', estado: 'cumple', observacion: '' },
          { id: 4, texto: 'La presentación personal es adecuada', estado: 'cumple', observacion: '' },
        ]
      }
    ]
  };

  // Función para obtener el pilar correspondiente al checklist seleccionado
  const getPilarFromChecklist = (checklistId) => {
    if (!checklistId) return null;

    const prefix = checklistId.split('-')[0];

    switch (prefix) {
      case 'OL':
        return 'ordenLimpieza';
      case 'SC':
        return 'serviciosClub';
      case 'GA':
        return 'gestionAdministrativa';
      case 'PY':
        return 'pedidosYa';
      default:
        return 'stockCaja';
    }
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
          <h1 className="title-yellow text-2xl">Pilares de Auditoría</h1>
          <p className="text-mascotera-text-muted mt-1">
            Pilares de control y verificación para auditorías
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Pilar
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

              {/* Desempeño por Sucursal */}
              {(() => {
                const pilarActual = getPilarFromChecklist(selectedChecklist);
                if (!pilarActual) return null;

                return (
                  <div className="mb-6 p-4 bg-mascotera-darker rounded-lg">
                    <h3 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-mascotera-accent" />
                      Desempeño por Sucursal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sucursales.map((sucursal, idx) => {
                        const estado = sucursal.pilares[pilarActual];
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              estado === null
                                ? 'border-mascotera-warning bg-mascotera-warning/5'
                                : estado
                                  ? 'border-mascotera-success bg-mascotera-success/5'
                                  : 'border-mascotera-danger bg-mascotera-danger/5'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-mascotera-text">
                                {sucursal.nombre}
                              </span>
                              <span
                                className={`text-sm font-semibold ${
                                  estado === null
                                    ? 'text-mascotera-warning'
                                    : estado
                                      ? 'text-mascotera-success'
                                      : 'text-mascotera-danger'
                                }`}
                              >
                                {estado === null ? 'PENDIENTE' : estado ? 'APROBADO' : 'NO APROBADO'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

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
