import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  X,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const DescargosSection = () => {
  const { descargos, loadingDescargos, updateDescargoEstado, sucursalesNombres } = useAudit();

  const [filtroSucursal, setFiltroSucursal] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [expandedSucursales, setExpandedSucursales] = useState(new Set());
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedDescargo, setSelectedDescargo] = useState(null);
  const [comentario, setComentario] = useState('');
  const [updating, setUpdating] = useState(false);

  const filteredDescargos = useMemo(() => {
    let filtered = descargos;
    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(d => d.estado === filtroEstado);
    }
    if (filtroSucursal !== 'todas') {
      filtered = filtered.filter(d => {
        const nombre = d.sucursal_nombre ? d.sucursal_nombre.replace(/^SUCURSAL\s+/i, '') : `Sucursal #${d.sucursal_id}`;
        return nombre === filtroSucursal;
      });
    }
    return filtered;
  }, [descargos, filtroEstado, filtroSucursal]);

  const groupedDescargos = useMemo(() => {
    const groups = {};
    filteredDescargos.forEach(d => {
      const nombre = d.sucursal_nombre ? d.sucursal_nombre.replace(/^SUCURSAL\s+/i, '') : `Sucursal #${d.sucursal_id}`;
      if (!groups[nombre]) groups[nombre] = [];
      groups[nombre].push(d);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredDescargos]);

  const totalPendientes = descargos.filter(d => d.estado === 'pendiente').length;
  const totalResueltas = descargos.filter(d => d.estado === 'resuelta').length;

  const toggleSucursal = (nombre) => {
    setExpandedSucursales(prev => {
      const next = new Set(prev);
      if (next.has(nombre)) {
        next.delete(nombre);
      } else {
        next.add(nombre);
      }
      return next;
    });
  };

  const handleToggleEstado = (descargo) => {
    if (descargo.estado === 'pendiente') {
      setSelectedDescargo(descargo);
      setComentario('');
      setResolveModalOpen(true);
    } else {
      handleDirectUpdate(descargo.id, 'pendiente');
    }
  };

  const handleDirectUpdate = async (id, estado) => {
    setUpdating(true);
    await updateDescargoEstado(id, estado, null);
    setUpdating(false);
  };

  const handleConfirmResolve = async () => {
    if (!selectedDescargo) return;
    setUpdating(true);
    const success = await updateDescargoEstado(selectedDescargo.id, 'resuelta', comentario || null);
    setUpdating(false);
    if (success) {
      setResolveModalOpen(false);
      setSelectedDescargo(null);
      setComentario('');
    }
  };

  if (loadingDescargos) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-mascotera-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-mascotera-text-muted">Cargando descargos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-mascotera-darker rounded-xl p-4 border border-mascotera-border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-mascotera-text-muted" />
            <span className="text-sm font-semibold text-mascotera-text-muted">Filtros:</span>
          </div>
          <select
            value={filtroSucursal}
            onChange={(e) => setFiltroSucursal(e.target.value)}
            className="input-mascotera text-sm py-2 px-3"
          >
            <option value="todas">Todas las sucursales</option>
            {sucursalesNombres.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="input-mascotera text-sm py-2 px-3"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="resuelta">Resueltas</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-mascotera-card rounded-xl p-4 border border-mascotera-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-mascotera-accent/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-mascotera-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mascotera-text">{descargos.length}</p>
              <p className="text-xs text-mascotera-text-muted">Total Descargos</p>
            </div>
          </div>
        </div>
        <div className="bg-mascotera-card rounded-xl p-4 border border-mascotera-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-mascotera-warning/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-mascotera-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mascotera-warning">{totalPendientes}</p>
              <p className="text-xs text-mascotera-text-muted">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-mascotera-card rounded-xl p-4 border border-mascotera-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-mascotera-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-mascotera-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mascotera-success">{totalResueltas}</p>
              <p className="text-xs text-mascotera-text-muted">Resueltas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista agrupada por sucursal */}
      {descargos.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-mascotera-text-muted mx-auto mb-4" />
          <p className="text-mascotera-text-muted text-lg">No hay descargos registrados</p>
          <p className="text-mascotera-text-muted text-sm mt-1">Los descargos de sucursales apareceran aqui</p>
        </div>
      ) : groupedDescargos.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="w-12 h-12 text-mascotera-text-muted mx-auto mb-4" />
          <p className="text-mascotera-text-muted text-lg">Sin resultados para los filtros seleccionados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupedDescargos.map(([sucursal, items]) => {
            const isExpanded = expandedSucursales.has(sucursal);
            const pendientesCount = items.filter(d => d.estado === 'pendiente').length;

            return (
              <div key={sucursal} className="bg-mascotera-card rounded-xl border border-mascotera-border overflow-hidden">
                {/* Sucursal header */}
                <button
                  onClick={() => toggleSucursal(sucursal)}
                  className="w-full flex items-center justify-between p-4 hover:bg-mascotera-darker/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-mascotera-accent" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-mascotera-text-muted" />
                    )}
                    <span className="font-bold text-mascotera-text">{sucursal}</span>
                    <span className="text-sm text-mascotera-text-muted">({items.length})</span>
                  </div>
                  {pendientesCount > 0 && (
                    <span className="bg-mascotera-warning/20 text-mascotera-warning text-xs font-semibold px-2.5 py-1 rounded-full">
                      {pendientesCount} pendiente{pendientesCount > 1 ? 's' : ''}
                    </span>
                  )}
                </button>

                {/* Descargos list */}
                {isExpanded && (
                  <div className="border-t border-mascotera-border divide-y divide-mascotera-border/50">
                    {items.map(descargo => (
                      <div key={descargo.id} className="p-4 hover:bg-mascotera-darker/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-semibold text-mascotera-text">{descargo.titulo}</h4>
                              <span className="bg-mascotera-info/20 text-mascotera-info text-xs font-medium px-2 py-0.5 rounded">
                                {descargo.categoria}
                              </span>
                            </div>
                            <p className="text-sm text-mascotera-text-muted mb-2">{descargo.descripcion}</p>
                            <div className="flex items-center gap-4 text-xs text-mascotera-text-muted flex-wrap">
                              {descargo.creado_por_nombre && (
                                <span className="flex items-center gap-1 text-mascotera-text">
                                  {descargo.creado_por_nombre} {descargo.creado_por_apellido}
                                  {descargo.creado_por_puesto && (
                                    <span className="text-mascotera-text-muted">({descargo.creado_por_puesto})</span>
                                  )}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(descargo.fecha_descargo)}
                              </span>
                              {descargo.comentario_auditor && (
                                <span className="flex items-center gap-1 text-mascotera-accent">
                                  <MessageSquare className="w-3 h-3" />
                                  {descargo.comentario_auditor}
                                </span>
                              )}
                              {descargo.fecha_resolucion && (
                                <span className="text-mascotera-success">
                                  Resuelta: {formatDate(descargo.fecha_resolucion)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              descargo.estado === 'pendiente'
                                ? 'bg-mascotera-warning/20 text-mascotera-warning'
                                : 'bg-mascotera-success/20 text-mascotera-success'
                            }`}>
                              {descargo.estado === 'pendiente' ? 'Pendiente' : 'Resuelta'}
                            </span>
                            <button
                              onClick={() => handleToggleEstado(descargo)}
                              disabled={updating}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                                descargo.estado === 'pendiente'
                                  ? 'bg-mascotera-success/20 text-mascotera-success hover:bg-mascotera-success/30'
                                  : 'bg-mascotera-warning/20 text-mascotera-warning hover:bg-mascotera-warning/30'
                              } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {descargo.estado === 'pendiente' ? 'Resolver' : 'Reabrir'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para resolver descargo */}
      {resolveModalOpen && selectedDescargo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-mascotera-card rounded-xl border border-mascotera-border max-w-lg w-full shadow-2xl">
            <div className="bg-mascotera-darker p-5 border-b border-mascotera-border rounded-t-xl flex items-center justify-between">
              <h2 className="text-lg font-bold text-mascotera-text">Resolver Descargo</h2>
              <button
                onClick={() => { setResolveModalOpen(false); setSelectedDescargo(null); }}
                className="p-2 hover:bg-mascotera-card rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-mascotera-text-muted" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-mascotera-text-muted uppercase tracking-wider">Descargo</label>
                <p className="text-mascotera-text font-semibold mt-1">{selectedDescargo.titulo}</p>
                <p className="text-sm text-mascotera-text-muted mt-1">{selectedDescargo.descripcion}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-mascotera-text-muted uppercase tracking-wider block mb-2">
                  Comentario del Auditor (opcional)
                </label>
                <textarea
                  className="input-mascotera w-full h-24 resize-none"
                  placeholder="Agregar comentario sobre la resolucion..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => { setResolveModalOpen(false); setSelectedDescargo(null); }}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmResolve}
                  disabled={updating}
                  className={`btn-primary px-4 py-2 text-sm ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {updating ? 'Guardando...' : 'Confirmar Resolucion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescargosSection;
