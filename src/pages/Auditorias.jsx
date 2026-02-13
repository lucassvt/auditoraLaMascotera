import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calendar,
  X,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  MessageSquare,
  Package,
  Check
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import DescargosSection from '../components/DescargosSection';

const Auditorias = () => {
  const routeLocation = useLocation();
  const { sucursalesNombres, sucursalesDB, tareasResumen, conteosStock, fetchTareasResumen, fetchTareasSucursal, fetchConteosStock, conteosPendientes, fetchConteosPendientes, ajustarConteoStock, currentUser } = useAudit();
  const [selectedPilarDetail, setSelectedPilarDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('auditorias');

  // Abrir pestaña correspondiente si se navega desde notificaciones
  useEffect(() => {
    if (routeLocation.state?.openDescargos) {
      setActiveTab('descargos');
      window.history.replaceState({}, document.title);
    } else if (routeLocation.state?.openConteos) {
      setActiveTab('conteos');
      window.history.replaceState({}, document.title);
    }
  }, [routeLocation.state]);

  const [ajustandoId, setAjustandoId] = useState(null);
  const [comentarioAjuste, setComentarioAjuste] = useState('');
  const [ajusteModalOpen, setAjusteModalOpen] = useState(false);
  const [selectedConteo, setSelectedConteo] = useState(null);
  const [tareasDetalle, setTareasDetalle] = useState([]);
  const [loadingTareas, setLoadingTareas] = useState(false);

  const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const [selectedMonth, setSelectedMonth] = useState(0); // Enero
  const [selectedYear, setSelectedYear] = useState(2026);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const mesKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  // Generar lista de sucursales desde la DB, todas con pilares pendientes
  const sucursales = sucursalesNombres.map(nombre => ({
    nombre,
    pilares: nombre === 'DEPOSITO RUTA 9'
      ? { ordenLimpieza: null, gestionAdministrativa: null, stockCaja: null, gestionPedidos: null, mantenimientoVehiculos: null }
      : { ordenLimpieza: null, serviciosClub: null, gestionAdministrativa: null, pedidosYa: null, stockCaja: null }
  }));

  // Pilares para sucursales tradicionales
  const pilaresTradicionales = [
    { key: 'ordenLimpieza', nombre: 'Orden y Limpieza' },
    { key: 'serviciosClub', nombre: 'Servicios y Club la Mascotera' },
    { key: 'gestionAdministrativa', nombre: 'Gestión administrativa y sistema' },
    { key: 'pedidosYa', nombre: 'Pedidos Ya/ Whatsapp WEB' },
    { key: 'stockCaja', nombre: 'Stock y Caja' }
  ];

  // Pilares para DEPOSITO RUTA 9
  const pilaresDeposito = [
    { key: 'ordenLimpieza', nombre: 'Orden y Limpieza' },
    { key: 'gestionAdministrativa', nombre: 'Gestión administrativa y sistema' },
    { key: 'stockCaja', nombre: 'Stock y Caja' },
    { key: 'gestionPedidos', nombre: 'Gestión de Pedidos' },
    { key: 'mantenimientoVehiculos', nombre: 'Mantenimiento de Vehículos' }
  ];

  // Separar sucursales tradicionales y depósito
  const sucursalesTradicionales = sucursales.filter(s => s.nombre !== 'DEPOSITO RUTA 9');
  const depositoRuta9 = sucursales.find(s => s.nombre === 'DEPOSITO RUTA 9');

  // Refetch tareas y conteos cuando cambia el mes
  React.useEffect(() => {
    fetchTareasResumen(mesKey);
    fetchConteosStock(mesKey);
  }, [mesKey]);

  // Helper: get tareas resumen for a sucursal
  const getTareasForSucursal = (sucursalNombre) => {
    const sucDB = sucursalesDB.find(s => s.nombre.replace(/^SUCURSAL\s+/i, '') === sucursalNombre);
    if (!sucDB) return { ordenLimpieza: null, mantenimiento: null };
    const ordenLimpieza = tareasResumen.find(t => t.sucursal_id === sucDB.id && t.categoria === 'ORDEN Y LIMPIEZA');
    const mantenimiento = tareasResumen.find(t => t.sucursal_id === sucDB.id && t.categoria === 'MANTENIMIENTO SUCURSAL');
    return { ordenLimpieza, mantenimiento };
  };

  // Helper: get conteos for a sucursal
  const getConteosForSucursal = (sucursalNombre) => {
    const sucDB = sucursalesDB.find(s => s.nombre.replace(/^SUCURSAL\s+/i, '') === sucursalNombre);
    if (!sucDB) return null;
    return conteosStock.filter(c => c.sucursal_id === sucDB.id);
  };

  const handlePilarClick = async (sucursal, pilarKey) => {
    if (pilarKey === 'ordenLimpieza' || pilarKey === 'stockCaja') {
      const sucDB = sucursalesDB.find(s => s.nombre.replace(/^SUCURSAL\s+/i, '') === sucursal);
      if (sucDB && pilarKey === 'ordenLimpieza') {
        setLoadingTareas(true);
        const tareas = await fetchTareasSucursal(sucDB.id, mesKey);
        setTareasDetalle(Array.isArray(tareas) ? tareas : []);
        setLoadingTareas(false);
      }

      setSelectedPilarDetail({
        sucursal,
        pilar: pilarKey,
        tareasDB: getTareasForSucursal(sucursal),
        conteosDB: getConteosForSucursal(sucursal)
      });
      setModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="title-yellow text-2xl">Resumen de Auditorías</h1>
          <p className="text-mascotera-text-muted mt-1">
            Estado de cumplimiento por sucursal y pilar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrevMonth} className="p-2 rounded-lg bg-mascotera-darker hover:bg-mascotera-card transition-colors text-mascotera-text">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-mascotera-darker rounded-lg min-w-[180px] justify-center">
            <Calendar className="w-4 h-4 text-mascotera-accent" />
            <span className="font-semibold text-mascotera-text">{mesesNombres[selectedMonth]} {selectedYear}</span>
          </div>
          <button onClick={handleNextMonth} className="p-2 rounded-lg bg-mascotera-darker hover:bg-mascotera-card transition-colors text-mascotera-text">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-mascotera-darker rounded-lg p-1">
        <button
          onClick={() => setActiveTab('auditorias')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'auditorias'
              ? 'bg-mascotera-accent text-mascotera-dark'
              : 'text-mascotera-text-muted hover:text-mascotera-text hover:bg-mascotera-card'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          Auditorias
        </button>
        <button
          onClick={() => setActiveTab('descargos')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'descargos'
              ? 'bg-mascotera-accent text-mascotera-dark'
              : 'text-mascotera-text-muted hover:text-mascotera-text hover:bg-mascotera-card'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Descargos
        </button>
        <button
          onClick={() => setActiveTab('conteos')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'conteos'
              ? 'bg-mascotera-accent text-mascotera-dark'
              : 'text-mascotera-text-muted hover:text-mascotera-text hover:bg-mascotera-card'
          }`}
        >
          <Package className="w-4 h-4" />
          Control de Stock
          {conteosPendientes.length > 0 && (
            <span className="bg-mascotera-danger text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {conteosPendientes.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'descargos' && <DescargosSection />}

      {/* Tab: Control de Stock */}
      {activeTab === 'conteos' && (
        <div className="space-y-4">
          <div className="card-mascotera">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-mascotera-text flex items-center gap-2">
                <Package className="w-5 h-5 text-mascotera-accent" />
                Conteos de Stock Pendientes de Revisión
              </h3>
              <span className="bg-mascotera-accent/20 text-mascotera-accent text-xs font-semibold px-2.5 py-1 rounded-full">
                {conteosPendientes.length} pendiente{conteosPendientes.length !== 1 ? 's' : ''}
              </span>
            </div>

            {conteosPendientes.length === 0 ? (
              <div className="text-center py-12">
                <Check className="w-12 h-12 text-mascotera-success mx-auto mb-3 opacity-60" />
                <h4 className="text-lg font-semibold text-mascotera-text mb-1">Todo al día</h4>
                <p className="text-sm text-mascotera-text-muted">No hay conteos de stock pendientes de revisión</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conteosPendientes.map(conteo => {
                  const sucNombre = conteo.sucursal_nombre
                    ? conteo.sucursal_nombre.replace(/^SUCURSAL\s+/i, '')
                    : `Sucursal #${conteo.sucursal_id}`;
                  const dif = parseFloat(conteo.valorizacion_diferencia) || 0;
                  const fecha = conteo.fecha_conteo ? new Date(conteo.fecha_conteo).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

                  return (
                    <div key={conteo.id} className="bg-mascotera-darker rounded-xl p-4 border border-mascotera-border/50 hover:border-mascotera-accent/30 transition-colors">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            Math.abs(dif) >= 150000 ? 'bg-mascotera-danger/20' : 'bg-mascotera-success/20'
                          }`}>
                            <Package className={`w-5 h-5 ${Math.abs(dif) >= 150000 ? 'text-mascotera-danger' : 'text-mascotera-success'}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-mascotera-text">{sucNombre}</p>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-mascotera-accent/20 text-mascotera-accent">
                                {conteo.estado?.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-mascotera-text-muted flex-wrap">
                              <span>Fecha: {fecha}</span>
                              <span>Realizado por: {conteo.empleado_nombre || '-'}</span>
                              <span>{conteo.productos_contados} productos contados</span>
                              <span>{conteo.productos_con_diferencia} con diferencia</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-mascotera-text-muted">Diferencia Neta</p>
                            <p className={`text-lg font-bold ${dif < 0 ? 'text-mascotera-danger' : dif > 0 ? 'text-mascotera-success' : 'text-mascotera-text'}`}>
                              ${Math.abs(dif).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedConteo(conteo);
                              setComentarioAjuste('');
                              setAjusteModalOpen(true);
                            }}
                            className="btn-primary flex items-center gap-2 px-4 py-2"
                          >
                            <Check className="w-4 h-4" />
                            Ajustado
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Confirmar Ajuste de Stock */}
      {ajusteModalOpen && selectedConteo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-mascotera-card rounded-xl border border-mascotera-border max-w-lg w-full shadow-2xl">
            <div className="bg-mascotera-darker p-5 border-b border-mascotera-border rounded-t-xl flex items-center justify-between">
              <h2 className="text-lg font-bold text-mascotera-text">Confirmar Ajuste de Stock</h2>
              <button
                onClick={() => { setAjusteModalOpen(false); setSelectedConteo(null); }}
                className="p-2 hover:bg-mascotera-card rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-mascotera-text-muted" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-mascotera-text-muted uppercase tracking-wider">Sucursal</label>
                <p className="text-mascotera-text font-semibold mt-1">
                  {selectedConteo.sucursal_nombre?.replace(/^SUCURSAL\s+/i, '') || `Sucursal #${selectedConteo.sucursal_id}`}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-mascotera-text-muted uppercase tracking-wider">Productos Contados</label>
                  <p className="text-mascotera-text font-semibold mt-1">{selectedConteo.productos_contados}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-mascotera-text-muted uppercase tracking-wider">Diferencia Neta</label>
                  <p className={`font-semibold mt-1 ${parseFloat(selectedConteo.valorizacion_diferencia) < 0 ? 'text-mascotera-danger' : 'text-mascotera-success'}`}>
                    ${Math.abs(parseFloat(selectedConteo.valorizacion_diferencia) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-mascotera-text-muted uppercase tracking-wider block mb-2">
                  Comentario del Auditor (opcional)
                </label>
                <textarea
                  className="input-mascotera w-full h-24 resize-none"
                  placeholder="Agregar comentario sobre el ajuste..."
                  value={comentarioAjuste}
                  onChange={(e) => setComentarioAjuste(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => { setAjusteModalOpen(false); setSelectedConteo(null); }}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    setAjustandoId(selectedConteo.id);
                    const success = await ajustarConteoStock(selectedConteo.id, comentarioAjuste || null);
                    setAjustandoId(null);
                    if (success) {
                      setAjusteModalOpen(false);
                      setSelectedConteo(null);
                      setComentarioAjuste('');
                    }
                  }}
                  disabled={ajustandoId === selectedConteo.id}
                  className={`btn-primary px-4 py-2 text-sm flex items-center gap-2 ${ajustandoId === selectedConteo.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Check className="w-4 h-4" />
                  {ajustandoId === selectedConteo.id ? 'Guardando...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'auditorias' && <>
      {/* Tabla de Resumen - Sucursales Tradicionales */}
      <div className="card-mascotera overflow-hidden">
        <h3 className="text-lg font-semibold text-mascotera-text mb-4 px-6 pt-4">
          Sucursales Tradicionales
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mascotera-border">
                <th className="px-4 py-3 text-left font-semibold text-mascotera-text bg-mascotera-darker">
                  Sucursales
                </th>
                {pilaresTradicionales.map((pilar) => (
                  <th key={pilar.key} className="px-4 py-3 text-center font-semibold text-mascotera-text bg-mascotera-darker">
                    {pilar.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sucursalesTradicionales.map((sucursal, index) => (
                <tr
                  key={sucursal.nombre}
                  className={`border-b border-mascotera-border hover:bg-mascotera-darker/50 ${
                    index % 2 === 0 ? 'bg-mascotera-card' : ''
                  }`}
                >
                  <td className="px-4 py-4 font-semibold text-mascotera-text">
                    {sucursal.nombre}
                  </td>
                  {pilaresTradicionales.map((pilar) => {
                    const tareasInfo = pilar.key === 'ordenLimpieza' ? getTareasForSucursal(sucursal.nombre) : null;
                    const conteosInfo = pilar.key === 'stockCaja' ? getConteosForSucursal(sucursal.nombre) : null;

                    // Calcular datos de tareas
                    let tareasSolicitadas = 0, tareasCompletadas = 0, tareasPct = 0;
                    if (tareasInfo) {
                      tareasSolicitadas = (tareasInfo.ordenLimpieza ? parseInt(tareasInfo.ordenLimpieza.solicitadas) : 0) + (tareasInfo.mantenimiento ? parseInt(tareasInfo.mantenimiento.solicitadas) : 0);
                      tareasCompletadas = (tareasInfo.ordenLimpieza ? parseInt(tareasInfo.ordenLimpieza.completadas) : 0) + (tareasInfo.mantenimiento ? parseInt(tareasInfo.mantenimiento.completadas) : 0);
                      tareasPct = tareasSolicitadas > 0 ? Math.round((tareasCompletadas / tareasSolicitadas) * 100) : 0;
                    }

                    // Calcular datos de conteos
                    let netoDif = 0, totalConteos = 0;
                    if (conteosInfo && conteosInfo.length > 0) {
                      netoDif = conteosInfo.reduce((sum, c) => sum + parseFloat(c.neto_diferencia || 0), 0);
                      totalConteos = conteosInfo.reduce((sum, c) => sum + parseInt(c.total_conteos || 0), 0);
                    }

                    return (
                    <td
                      key={pilar.key}
                      className="px-4 py-3 text-center"
                      onClick={() => handlePilarClick(sucursal.nombre, pilar.key)}
                    >
                      <span
                        className={`font-bold text-lg cursor-pointer hover:opacity-80 transition-opacity ${
                          sucursal.pilares[pilar.key] === null
                            ? 'text-mascotera-warning'
                            : sucursal.pilares[pilar.key]
                            ? 'text-mascotera-success'
                            : 'text-mascotera-danger'
                        }`}
                      >
                        {sucursal.pilares[pilar.key] === null
                          ? 'PENDIENTE'
                          : sucursal.pilares[pilar.key]
                          ? 'SI'
                          : 'NO'}
                      </span>
                      {/* Dato anexo Orden y Limpieza */}
                      {pilar.key === 'ordenLimpieza' && tareasSolicitadas > 0 && (
                        <div className="mt-1">
                          <div className="text-xs text-mascotera-text-muted">{tareasCompletadas}/{tareasSolicitadas} tareas</div>
                          <div className="w-full h-1.5 bg-mascotera-darker rounded-full mt-1 mx-auto max-w-[80px]">
                            <div className={`h-full rounded-full ${tareasPct >= 80 ? 'bg-mascotera-success' : tareasPct >= 50 ? 'bg-mascotera-warning' : 'bg-mascotera-danger'}`} style={{ width: `${tareasPct}%` }}></div>
                          </div>
                          <div className={`text-xs font-semibold mt-0.5 ${tareasPct >= 80 ? 'text-mascotera-success' : tareasPct >= 50 ? 'text-mascotera-warning' : 'text-mascotera-danger'}`}>{tareasPct}%</div>
                        </div>
                      )}
                      {/* Dato anexo Stock y Caja */}
                      {pilar.key === 'stockCaja' && totalConteos > 0 && (
                        <div className="mt-1">
                          <div className={`text-xs font-semibold ${netoDif === 0 ? 'text-mascotera-success' : 'text-mascotera-warning'}`}>
                            ${Math.abs(netoDif).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </div>
                          <div className="text-xs text-mascotera-text-muted">{totalConteos} conteo{totalConteos !== 1 ? 's' : ''}</div>
                        </div>
                      )}
                    </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de Resumen - Depósito Ruta 9 */}
      {depositoRuta9 && (
        <div className="card-mascotera overflow-hidden">
          <h3 className="text-lg font-semibold text-mascotera-text mb-4 px-6 pt-4">
            Depósito Ruta 9
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-mascotera-border">
                  <th className="px-4 py-3 text-left font-semibold text-mascotera-text bg-mascotera-darker">
                    Sucursal
                  </th>
                  {pilaresDeposito.map((pilar) => (
                    <th key={pilar.key} className="px-4 py-3 text-center font-semibold text-mascotera-text bg-mascotera-darker">
                      {pilar.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-mascotera-border hover:bg-mascotera-darker/50 bg-mascotera-card">
                  <td className="px-4 py-4 font-semibold text-mascotera-text">
                    {depositoRuta9.nombre}
                  </td>
                  {pilaresDeposito.map((pilar) => {
                    const tareasInfo = pilar.key === 'ordenLimpieza' ? getTareasForSucursal(depositoRuta9.nombre) : null;
                    const conteosInfo = pilar.key === 'stockCaja' ? getConteosForSucursal(depositoRuta9.nombre) : null;

                    let tareasSolicitadas = 0, tareasCompletadas = 0, tareasPct = 0;
                    if (tareasInfo) {
                      tareasSolicitadas = (tareasInfo.ordenLimpieza ? parseInt(tareasInfo.ordenLimpieza.solicitadas) : 0) + (tareasInfo.mantenimiento ? parseInt(tareasInfo.mantenimiento.solicitadas) : 0);
                      tareasCompletadas = (tareasInfo.ordenLimpieza ? parseInt(tareasInfo.ordenLimpieza.completadas) : 0) + (tareasInfo.mantenimiento ? parseInt(tareasInfo.mantenimiento.completadas) : 0);
                      tareasPct = tareasSolicitadas > 0 ? Math.round((tareasCompletadas / tareasSolicitadas) * 100) : 0;
                    }

                    let netoDif = 0, totalConteos = 0;
                    if (conteosInfo && conteosInfo.length > 0) {
                      netoDif = conteosInfo.reduce((sum, c) => sum + parseFloat(c.neto_diferencia || 0), 0);
                      totalConteos = conteosInfo.reduce((sum, c) => sum + parseInt(c.total_conteos || 0), 0);
                    }

                    return (
                    <td
                      key={pilar.key}
                      className="px-4 py-3 text-center"
                      onClick={() => handlePilarClick(depositoRuta9.nombre, pilar.key)}
                    >
                      <span
                        className={`font-bold text-lg cursor-pointer hover:opacity-80 transition-opacity ${
                          depositoRuta9.pilares[pilar.key] === null
                            ? 'text-mascotera-warning'
                            : depositoRuta9.pilares[pilar.key]
                            ? 'text-mascotera-success'
                            : 'text-mascotera-danger'
                        }`}
                      >
                        {depositoRuta9.pilares[pilar.key] === null
                          ? 'PENDIENTE'
                          : depositoRuta9.pilares[pilar.key]
                          ? 'SI'
                          : 'NO'}
                      </span>
                      {pilar.key === 'ordenLimpieza' && tareasSolicitadas > 0 && (
                        <div className="mt-1">
                          <div className="text-xs text-mascotera-text-muted">{tareasCompletadas}/{tareasSolicitadas} tareas</div>
                          <div className="w-full h-1.5 bg-mascotera-darker rounded-full mt-1 mx-auto max-w-[80px]">
                            <div className={`h-full rounded-full ${tareasPct >= 80 ? 'bg-mascotera-success' : tareasPct >= 50 ? 'bg-mascotera-warning' : 'bg-mascotera-danger'}`} style={{ width: `${tareasPct}%` }}></div>
                          </div>
                          <div className={`text-xs font-semibold mt-0.5 ${tareasPct >= 80 ? 'text-mascotera-success' : tareasPct >= 50 ? 'text-mascotera-warning' : 'text-mascotera-danger'}`}>{tareasPct}%</div>
                        </div>
                      )}
                      {pilar.key === 'stockCaja' && totalConteos > 0 && (
                        <div className="mt-1">
                          <div className={`text-xs font-semibold ${netoDif === 0 ? 'text-mascotera-success' : 'text-mascotera-warning'}`}>
                            ${Math.abs(netoDif).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </div>
                          <div className="text-xs text-mascotera-text-muted">{totalConteos} conteo{totalConteos !== 1 ? 's' : ''}</div>
                        </div>
                      )}
                    </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estadísticas Resumen - Sucursales Tradicionales */}
      <div className="card-mascotera">
        <h3 className="text-lg font-semibold text-mascotera-text mb-4">
          Estadísticas - Sucursales Tradicionales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pilaresTradicionales.map((pilar) => {
            const cumplimiento = sucursalesTradicionales.filter(s => s.pilares[pilar.key] === true).length;
            const noCumplimiento = sucursalesTradicionales.filter(s => s.pilares[pilar.key] === false).length;
            const pendientes = sucursalesTradicionales.filter(s => s.pilares[pilar.key] === null).length;
            const evaluados = cumplimiento + noCumplimiento;
            const porcentaje = evaluados > 0 ? Math.round((cumplimiento / evaluados) * 100) : 0;

            return (
              <div key={pilar.key} className="p-4 bg-mascotera-darker rounded-lg">
                <h4 className="text-sm font-semibold text-mascotera-text-muted mb-2">
                  {pilar.nombre}
                </h4>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-mascotera-accent">
                      {cumplimiento}/{evaluados}
                    </p>
                    <p className="text-sm text-mascotera-text-muted mt-1">
                      {porcentaje}% cumplimiento
                    </p>
                    {pendientes > 0 && (
                      <p className="text-xs text-mascotera-warning mt-1">
                        {pendientes} pendiente{pendientes > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-mascotera-accent/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-mascotera-accent">
                      {porcentaje}%
                    </span>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-mascotera-card rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-mascotera-accent to-mascotera-accent-light rounded-full"
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estadísticas Resumen - Depósito Ruta 9 */}
      {depositoRuta9 && (
        <div className="card-mascotera">
          <h3 className="text-lg font-semibold text-mascotera-text mb-4">
            Estadísticas - Depósito Ruta 9
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pilaresDeposito.map((pilar) => {
              const cumple = depositoRuta9.pilares[pilar.key] === true;
              const noCumple = depositoRuta9.pilares[pilar.key] === false;
              const pendiente = depositoRuta9.pilares[pilar.key] === null;

              return (
                <div key={pilar.key} className="p-4 bg-mascotera-darker rounded-lg">
                  <h4 className="text-sm font-semibold text-mascotera-text-muted mb-2">
                    {pilar.nombre}
                  </h4>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className={`text-3xl font-bold ${
                        pendiente ? 'text-mascotera-warning' :
                        cumple ? 'text-mascotera-success' :
                        'text-mascotera-danger'
                      }`}>
                        {pendiente ? 'PENDIENTE' : (cumple ? 'SI' : 'NO')}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center ${
                      pendiente ? 'border-mascotera-warning/20' :
                      cumple ? 'border-mascotera-success/20' :
                      'border-mascotera-danger/20'
                    }`}>
                      <span className={`text-sm font-bold ${
                        pendiente ? 'text-mascotera-warning' :
                        cumple ? 'text-mascotera-success' :
                        'text-mascotera-danger'
                      }`}>
                        {pendiente ? '-' : (cumple ? '✓' : '✗')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-mascotera-card rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cumple ? 'bg-gradient-to-r from-mascotera-success to-green-400' :
                        noCumple ? 'bg-gradient-to-r from-mascotera-danger to-red-400' :
                        'bg-mascotera-warning'
                      }`}
                      style={{ width: pendiente ? '50%' : '100%' }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {modalOpen && selectedPilarDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-mascotera-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-mascotera-darker p-6 border-b border-mascotera-border flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-mascotera-text">
                  {selectedPilarDetail.sucursal} - {selectedPilarDetail.pilar === 'ordenLimpieza' ? 'Orden y Limpieza' : 'Stock y Caja'}
                </h2>
                <p className="text-sm text-mascotera-text-muted mt-1">
                  Datos de integración con módulos del sistema
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-mascotera-card rounded-lg transition-colors">
                <X className="w-6 h-6 text-mascotera-text" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedPilarDetail.pilar === 'ordenLimpieza' && (
                <>
                  {/* Desempeño por Sucursal */}
                  <div>
                    <h3 className="text-lg font-semibold text-mascotera-text mb-4">
                      Desempeño por Sucursal - Orden y Limpieza
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sucursales.map((suc, idx) => {
                        const estado = suc.pilares.ordenLimpieza;
                        return (
                          <div key={idx} className={`p-3 rounded-lg border-2 ${
                            estado === null
                              ? 'border-mascotera-warning bg-mascotera-warning/5'
                              : estado
                                ? 'border-mascotera-success bg-mascotera-success/5'
                                : 'border-mascotera-danger bg-mascotera-danger/5'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-mascotera-text">{suc.nombre}</span>
                              <span className={`font-bold text-lg ${
                                estado === null
                                  ? 'text-mascotera-warning'
                                  : estado
                                    ? 'text-mascotera-success'
                                    : 'text-mascotera-danger'
                              }`}>
                                {estado === null ? 'PENDIENTE' : estado ? 'APROBADO' : 'NO APROBADO'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dato Anexo: Tareas desde Mi Sucursal (DB real) */}
                  {(() => {
                    const tareasOL = tareasDetalle.filter(t => t.categoria === 'ORDEN Y LIMPIEZA');
                    const tareasMS = tareasDetalle.filter(t => t.categoria === 'MANTENIMIENTO SUCURSAL');
                    const resumenOL = selectedPilarDetail.tareasDB?.ordenLimpieza;
                    const resumenMS = selectedPilarDetail.tareasDB?.mantenimiento;
                    const totalSolicitadas = (resumenOL ? parseInt(resumenOL.solicitadas) : 0) + (resumenMS ? parseInt(resumenMS.solicitadas) : 0);
                    const totalCompletadas = (resumenOL ? parseInt(resumenOL.completadas) : 0) + (resumenMS ? parseInt(resumenMS.completadas) : 0);
                    const totalPendientes = (resumenOL ? parseInt(resumenOL.pendientes) : 0) + (resumenMS ? parseInt(resumenMS.pendientes) : 0);
                    const pctTotal = totalSolicitadas > 0 ? ((totalCompletadas / totalSolicitadas) * 100).toFixed(1) : 0;

                    return (
                      <div className="border-2 border-mascotera-accent/30 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-mascotera-accent animate-pulse"></div>
                          <h3 className="text-sm font-bold text-mascotera-accent uppercase tracking-wider">
                            Dato Anexo - Mi Sucursal: Tareas
                          </h3>
                        </div>

                        {/* Resumen general */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-mascotera-darker p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-mascotera-text">{totalSolicitadas}</p>
                            <p className="text-xs text-mascotera-text-muted">Solicitadas</p>
                          </div>
                          <div className="bg-mascotera-darker p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-mascotera-success">{totalCompletadas}</p>
                            <p className="text-xs text-mascotera-text-muted">Completadas</p>
                          </div>
                          <div className="bg-mascotera-darker p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-mascotera-warning">{totalPendientes}</p>
                            <p className="text-xs text-mascotera-text-muted">Pendientes</p>
                          </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="bg-mascotera-darker p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-mascotera-text-muted">Cumplimiento total</span>
                            <span className="text-lg font-bold text-mascotera-accent">{pctTotal}%</span>
                          </div>
                          <div className="h-3 bg-mascotera-card rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${parseFloat(pctTotal) >= 80 ? 'bg-gradient-to-r from-mascotera-success to-green-400' : parseFloat(pctTotal) >= 50 ? 'bg-gradient-to-r from-mascotera-warning to-yellow-400' : 'bg-gradient-to-r from-mascotera-danger to-red-400'}`}
                              style={{ width: `${pctTotal}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Desglose por categoria */}
                        {resumenOL && (
                          <div className="bg-mascotera-darker p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-mascotera-text">Orden y Limpieza</span>
                              <span className="text-sm text-mascotera-accent font-bold">{resumenOL.completadas}/{resumenOL.solicitadas} ({resumenOL.porcentaje_completado}%)</span>
                            </div>
                          </div>
                        )}
                        {resumenMS && (
                          <div className="bg-mascotera-darker p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-mascotera-text">Mantenimiento Sucursal</span>
                              <span className="text-sm text-mascotera-accent font-bold">{resumenMS.completadas}/{resumenMS.solicitadas} ({resumenMS.porcentaje_completado}%)</span>
                            </div>
                          </div>
                        )}

                        {/* Listado de tareas individuales */}
                        {loadingTareas ? (
                          <div className="text-center py-4">
                            <div className="w-6 h-6 border-2 border-mascotera-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                          </div>
                        ) : tareasDetalle.length > 0 ? (
                          <div className="space-y-2">
                            {tareasDetalle.map((tarea) => (
                              <div key={tarea.id} className="flex items-center justify-between p-3 bg-mascotera-darker rounded-lg">
                                <div className="flex items-center gap-3">
                                  {tarea.estado === 'completada' ? (
                                    <CheckCircle2 className="w-5 h-5 text-mascotera-success flex-shrink-0" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-mascotera-warning flex-shrink-0" />
                                  )}
                                  <div>
                                    <span className="text-mascotera-text text-sm">{tarea.titulo}</span>
                                    <span className="text-xs text-mascotera-text-muted ml-2">({tarea.categoria})</span>
                                  </div>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${tarea.estado === 'completada' ? 'bg-mascotera-success/20 text-mascotera-success' : 'bg-mascotera-warning/20 text-mascotera-warning'}`}>
                                  {tarea.estado}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-mascotera-text-muted text-center py-4">No hay tareas registradas para este periodo</p>
                        )}
                      </div>
                    );
                  })()}

                </>
              )}

              {selectedPilarDetail.pilar === 'stockCaja' && (
                <>
                  {/* Desempeño por Sucursal */}
                  <div>
                    <h3 className="text-lg font-semibold text-mascotera-text mb-4">
                      Desempeño por Sucursal - Stock y Caja
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sucursales.map((suc, idx) => {
                        const estado = suc.pilares.stockCaja;
                        return (
                          <div key={idx} className={`p-3 rounded-lg border-2 ${
                            estado === null
                              ? 'border-mascotera-warning bg-mascotera-warning/5'
                              : estado
                                ? 'border-mascotera-success bg-mascotera-success/5'
                                : 'border-mascotera-danger bg-mascotera-danger/5'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-mascotera-text">{suc.nombre}</span>
                              <span className={`font-bold text-lg ${
                                estado === null
                                  ? 'text-mascotera-warning'
                                  : estado
                                    ? 'text-mascotera-success'
                                    : 'text-mascotera-danger'
                              }`}>
                                {estado === null ? 'PENDIENTE' : estado ? 'APROBADO' : 'NO APROBADO'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dato Anexo: Conteos de Stock desde Mi Sucursal (DB real) */}
                  {(() => {
                    const conteos = selectedPilarDetail.conteosDB || [];
                    const totalConteos = conteos.reduce((sum, c) => sum + parseInt(c.total_conteos || 0), 0);
                    const netoDiferencia = conteos.reduce((sum, c) => sum + parseFloat(c.neto_diferencia || 0), 0);
                    const totalProductos = conteos.reduce((sum, c) => sum + parseInt(c.total_productos || 0), 0);
                    const productosContados = conteos.reduce((sum, c) => sum + parseInt(c.productos_contados || 0), 0);
                    const productosConDiferencia = conteos.reduce((sum, c) => sum + parseInt(c.productos_con_diferencia || 0), 0);
                    const pctContados = totalProductos > 0 ? ((productosContados / totalProductos) * 100).toFixed(1) : 0;

                    return (
                      <div className="border-2 border-mascotera-accent/30 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-mascotera-accent animate-pulse"></div>
                          <h3 className="text-sm font-bold text-mascotera-accent uppercase tracking-wider">
                            Dato Anexo - Mi Sucursal: Conteos de Stock
                          </h3>
                        </div>

                        {totalConteos > 0 ? (
                          <>
                            {/* Resumen general */}
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-mascotera-darker p-3 rounded-lg text-center">
                                <p className="text-2xl font-bold text-mascotera-text">{totalConteos}</p>
                                <p className="text-xs text-mascotera-text-muted">Conteos realizados</p>
                              </div>
                              <div className="bg-mascotera-darker p-3 rounded-lg text-center">
                                <p className="text-2xl font-bold text-mascotera-text">{totalProductos}</p>
                                <p className="text-xs text-mascotera-text-muted">Total productos</p>
                              </div>
                              <div className="bg-mascotera-darker p-3 rounded-lg text-center">
                                <p className="text-2xl font-bold text-mascotera-warning">{productosConDiferencia}</p>
                                <p className="text-xs text-mascotera-text-muted">Con diferencia</p>
                              </div>
                            </div>

                            {/* Neto de diferencias */}
                            <div className="bg-mascotera-darker p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-mascotera-text-muted">Neto ajustes de stock (valorizado)</span>
                                <span className={`text-2xl font-bold ${netoDiferencia === 0 ? 'text-mascotera-success' : netoDiferencia > 0 ? 'text-mascotera-warning' : 'text-mascotera-danger'}`}>
                                  ${Math.abs(netoDiferencia).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                  {netoDiferencia !== 0 && <span className="text-sm ml-1">({netoDiferencia > 0 ? 'sobrante' : 'faltante'})</span>}
                                </span>
                              </div>
                            </div>

                            {/* Progreso de conteo */}
                            <div className="bg-mascotera-darker p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-mascotera-text-muted">Productos contados</span>
                                <span className="text-lg font-bold text-mascotera-accent">{productosContados}/{totalProductos} ({pctContados}%)</span>
                              </div>
                              <div className="h-3 bg-mascotera-card rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${parseFloat(pctContados) >= 80 ? 'bg-gradient-to-r from-mascotera-success to-green-400' : parseFloat(pctContados) >= 50 ? 'bg-gradient-to-r from-mascotera-warning to-yellow-400' : 'bg-gradient-to-r from-mascotera-danger to-red-400'}`}
                                  style={{ width: `${pctContados}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Desglose por estado */}
                            {conteos.map((conteo, idx) => (
                              <div key={idx} className="bg-mascotera-darker p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${conteo.estado === 'finalizado' ? 'bg-mascotera-success/20 text-mascotera-success' : conteo.estado === 'en_proceso' ? 'bg-mascotera-warning/20 text-mascotera-warning' : 'bg-mascotera-accent/20 text-mascotera-accent'}`}>
                                      {conteo.estado}
                                    </span>
                                    <span className="text-sm text-mascotera-text">{conteo.total_conteos} conteo(s)</span>
                                  </div>
                                  <span className={`text-sm font-bold ${parseFloat(conteo.neto_diferencia) === 0 ? 'text-mascotera-success' : 'text-mascotera-warning'}`}>
                                    Dif: ${parseFloat(conteo.neto_diferencia).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <p className="text-sm text-mascotera-text-muted text-center py-4">No hay conteos de stock registrados para este periodo</p>
                        )}
                      </div>
                    );
                  })()}

                </>
              )}
            </div>
          </div>
        </div>
      )}
      </>}
    </div>
  );
};

export default Auditorias;
