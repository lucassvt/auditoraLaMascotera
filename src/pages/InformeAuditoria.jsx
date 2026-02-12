import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Building2,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Info,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import { API_BASE } from '../config';
import { useSearchParams, useNavigate } from 'react-router-dom';

const InformeAuditoria = () => {
  const { auditData, sucursalesNombres, descargos, generatedReports, getAuditoresSucursal } = useAudit();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedSucursal, setSelectedSucursal] = useState('');

  // Soporte para cargar informe desde la DB (para Mi Sucursal)
  const [dbReport, setDbReport] = useState(null);
  const [loadingDbReport, setLoadingDbReport] = useState(false);
  const dbId = searchParams.get('dbId');

  useEffect(() => {
    if (!dbId) return;
    setLoadingDbReport(true);
    fetch(`${API_BASE}/informes/${dbId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.data_json) {
          setDbReport(data.data_json);
        }
        setLoadingDbReport(false);
      })
      .catch(() => setLoadingDbReport(false));
  }, [dbId]);

  const reportId = searchParams.get('reportId');
  const viewingReport = dbReport || (reportId ? generatedReports.find(r => r.id === reportId) : null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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

  // Pilar definitions (same as Checklist)
  const pilaresTradicionales = {
    ordenLimpieza: {
      nombre: 'Orden y Limpieza',
      items: [
        { text: 'El local se encuentra limpio y ordenado', peso: 35 },
        { text: 'Los espacios comunes están libres de obstrucciones', peso: 25 },
        { text: 'El personal usa uniforme completo y en buen estado', peso: 25 },
        { text: 'La presentación personal es adecuada', peso: 15 }
      ]
    },
    serviciosClub: {
      nombre: 'Servicios y Club la Mascotera',
      items: [
        { text: 'Se ofrece correctamente el servicio de veterinaria', peso: 30 },
        { text: 'Se ofrece correctamente el servicio de peluquería', peso: 20 },
        { text: 'Se pregunta al cliente si desea sumar puntos', peso: 20 },
        { text: 'La facturación a consumidor final es menor al 30%', peso: 30 }
      ]
    },
    gestionAdministrativa: {
      nombre: 'Gestión Administrativa y Sistema',
      items: [
        { text: 'No hay pedidos pendientes de facturar', peso: 40 },
        { text: 'Los remitos están cargados correctamente', peso: 35 },
        { text: 'No hay transferencias pendientes de aceptar', peso: 25 }
      ]
    },
    pedidosYa: {
      nombre: 'Pedidos Ya / Whatsapp WEB',
      items: [
        { text: 'La tasa de pedidos rechazados es menor al 3%', peso: 100 }
      ]
    },
    stockCaja: {
      nombre: 'Stock y Caja',
      items: [
        { text: 'Las desviaciones de stock están dentro del rango permitido', peso: 60 },
        { text: 'Los arqueos de caja están correctamente realizados y conciliados', peso: 40 }
      ]
    }
  };

  const pilaresDeposito = {
    ordenLimpieza: {
      nombre: 'Orden y Limpieza',
      items: [
        { text: 'El depósito se encuentra limpio y ordenado', peso: 30 },
        { text: 'Las áreas de carga están libres de obstrucciones', peso: 30 },
        { text: 'El personal usa indumentaria de seguridad adecuada', peso: 25 },
        { text: 'Las áreas comunes están en condiciones óptimas', peso: 15 }
      ]
    },
    gestionAdministrativa: {
      nombre: 'Gestión Administrativa y Sistema',
      items: [
        { text: 'Los remitos están cargados correctamente', peso: 40 },
        { text: 'No hay transferencias pendientes de aceptar', peso: 30 },
        { text: 'La documentación está al día', peso: 30 }
      ]
    },
    stockCaja: {
      nombre: 'Stock y Caja',
      items: [
        { text: 'Las desviaciones de stock están dentro del rango permitido', peso: 60 },
        { text: 'Los inventarios están correctamente registrados', peso: 40 }
      ]
    },
    gestionPedidos: {
      nombre: 'Gestión de Pedidos',
      items: [
        { text: 'La preparación y despacho se realizan correctamente', peso: 40 },
        { text: 'Las incidencias y devoluciones se gestionan adecuadamente', peso: 30 },
        { text: 'Se cumple con los plazos comprometidos', peso: 30 }
      ]
    },
    mantenimientoVehiculos: {
      nombre: 'Mantenimiento de Vehículos',
      items: [
        { text: 'La flota está en buen estado y disponible', peso: 55 },
        { text: 'Se cumple con la documentación legal y seguridad', peso: 45 }
      ]
    }
  };

  const getPilaresFor = (sucursal) => {
    return sucursal === 'DEPOSITO RUTA 9' ? pilaresDeposito : pilaresTradicionales;
  };

  const criticidadConfig = {
    baja: { label: 'Baja', color: '#3b82f6' },
    media: { label: 'Media', color: '#f59e0b' },
    alta: { label: 'Alta', color: '#ef4444' },
    critica: { label: 'Crítica', color: '#dc2626' }
  };

  const sucursales = sucursalesNombres.length > 0 ? sucursalesNombres : [
    'LEGUIZAMON', 'CATAMARCA', 'CONGRESO', 'ARENALES',
    'BELGRANO SUR', 'LAPRIDA'
  ];

  // Check which sucursales have audit data (any period)
  const sucursalesConDatos = useMemo(() => {
    return Object.keys(auditData).filter(suc =>
      Object.keys(auditData[suc]).length > 0
    );
  }, [auditData]);

  // When viewing a report snapshot, override sucursal/data/descargos
  const activeSucursal = viewingReport ? viewingReport.sucursal : selectedSucursal;

  // Filter audit data by selected period (live mode)
  const liveActiveData = useMemo(() => {
    if (viewingReport) return null;
    if (!activeSucursal || !auditData[activeSucursal]) return null;
    const data = auditData[activeSucursal];
    const filtered = {};
    Object.entries(data).forEach(([key, pilarData]) => {
      if (pilarData.fecha) {
        const fecha = new Date(pilarData.fecha);
        if (fecha.getMonth() === selectedMonth && fecha.getFullYear() === selectedYear) {
          filtered[key] = pilarData;
        }
      }
    });
    return Object.keys(filtered).length > 0 ? filtered : null;
  }, [auditData, activeSucursal, selectedMonth, selectedYear, viewingReport]);

  // Active data: from snapshot or live
  const activeData = viewingReport ? viewingReport.pilaresData : liveActiveData;

  // Descargos: from snapshot or live
  const descargosForSucursal = useMemo(() => {
    if (viewingReport) return viewingReport.descargos || [];
    if (!activeSucursal) return [];
    return descargos.filter(d => {
      const nombre = d.sucursal_nombre ? d.sucursal_nombre.replace(/^SUCURSAL\s+/i, '') : '';
      return nombre === activeSucursal;
    });
  }, [descargos, activeSucursal, viewingReport]);

  // Calculate ponderación for a pilar using filtered data
  const calcPonderacion = (sucursalData, pilarKey, pilar) => {
    const data = sucursalData?.[pilarKey];
    if (!data) return null;

    const evaluados = pilar.items.filter((_, idx) => data.items[idx] !== null);
    if (evaluados.length === 0) return null;

    const pesoAprobado = pilar.items.reduce((sum, item, idx) => {
      if (data.items[idx] === true) return sum + item.peso;
      return sum;
    }, 0);

    const pesoTotal = pilar.items.reduce((sum, item) => sum + item.peso, 0);

    return {
      porcentaje: pesoTotal > 0 ? ((pesoAprobado / pesoTotal) * 100).toFixed(1) : 0,
      evaluados: evaluados.length,
      total: pilar.items.length
    };
  };

  // Calculate resumen using filtered data
  const getResumen = (sucursalData, sucursal) => {
    const pilares = getPilaresFor(sucursal);
    if (!sucursalData) return null;

    let totalPilares = 0, aprobados = 0, noAprobados = 0, pendientes = 0;
    let sumaPonderacion = 0, pilaresConPonderacion = 0;

    Object.entries(pilares).forEach(([key, pilar]) => {
      const pilarData = sucursalData[key];
      totalPilares++;
      if (!pilarData) { pendientes++; return; }
      if (pilarData.estado === true) aprobados++;
      else if (pilarData.estado === false) noAprobados++;
      else pendientes++;

      const pond = calcPonderacion(sucursalData, key, pilar);
      if (pond) {
        sumaPonderacion += parseFloat(pond.porcentaje);
        pilaresConPonderacion++;
      }
    });

    return {
      totalPilares, aprobados, noAprobados, pendientes,
      promedioPonderacion: pilaresConPonderacion > 0
        ? (sumaPonderacion / pilaresConPonderacion).toFixed(1) : 0
    };
  };

  const handlePrint = () => window.print();

  // Auditores: from report snapshot or from context
  const auditoresValidos = viewingReport
    ? (viewingReport.auditores || [])
    : (getAuditoresSucursal(activeSucursal) || []).filter(a => a.trim() !== '');
  // Periodo: from snapshot or selector
  const periodoFormateado = viewingReport
    ? (() => {
        const [y, m] = viewingReport.mesKey.split('-');
        return `${monthNames[parseInt(m) - 1]} ${y}`;
      })()
    : `${monthNames[selectedMonth]} ${selectedYear}`;
  const hasData = !!activeData;
  const hasSucursalData = !viewingReport && activeSucursal && auditData[activeSucursal] &&
    Object.keys(auditData[activeSucursal]).length > 0;
  const resumen = viewingReport
    ? viewingReport.resumen
    : (hasData ? getResumen(activeData, activeSucursal) : null);
  const hasAnythingToShow = hasData || descargosForSucursal.length > 0;

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  if (loadingDbReport) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mascotera-accent mx-auto mb-4"></div>
          <p className="text-mascotera-text-muted">Cargando informe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header - No Print */}
      <div className="no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="title-yellow text-2xl">Informe de Auditoría</h1>
            <p className="text-mascotera-text-muted mt-1">
              Informe generado automáticamente con los datos del módulo Pilares
            </p>
          </div>
          {hasAnythingToShow && (
            <button
              onClick={handlePrint}
              className="btn-primary flex items-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Imprimir / PDF
            </button>
          )}
        </div>
      </div>

      {/* Banner when viewing a generated report */}
      {viewingReport && (
        <div className="no-print card-mascotera border-mascotera-accent/50 bg-mascotera-accent/5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-mascotera-accent/20">
                <Lock className="w-5 h-5 text-mascotera-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm text-mascotera-accent font-bold">{viewingReport.id}</span>
                  <span className="bg-mascotera-accent/20 text-mascotera-accent text-xs font-semibold px-2.5 py-1 rounded-full">Solo lectura</span>
                </div>
                <p className="text-mascotera-text font-semibold mt-1">
                  Informe de Auditoría - {viewingReport.sucursal}
                </p>
                <div className="flex items-center gap-4 text-xs text-mascotera-text-muted mt-1 flex-wrap">
                  <span>Período: {periodoFormateado}</span>
                  <span>Generado: {formatDate(viewingReport.fechaGeneracion)}</span>
                  {auditoresValidos.length > 0 && (
                    <span>Auditores: {auditoresValidos.join(', ')}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/reportes')}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Reportes
            </button>
          </div>
        </div>
      )}

      {/* Config bar - only in live mode (not viewing report) */}
      {!viewingReport && (
        <div className="no-print space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selector de Sucursal */}
            <div className="card-mascotera">
              <h3 className="text-sm font-semibold text-mascotera-text mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-mascotera-accent" />
                Seleccionar Sucursal
              </h3>
              <div className="relative">
                <select
                  value={activeSucursal}
                  onChange={(e) => setSelectedSucursal(e.target.value)}
                  className="input-mascotera w-full appearance-none pr-10"
                >
                  <option value="">Seleccione una sucursal...</option>
                  {sucursales.map(suc => (
                    <option key={suc} value={suc}>
                      {suc}{sucursalesConDatos.includes(suc) ? ' - Auditada' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-mascotera-text-muted pointer-events-none" />
              </div>
              {sucursalesConDatos.length > 0 && (
                <p className="text-xs text-mascotera-text-muted mt-2">
                  {sucursalesConDatos.length} sucursal{sucursalesConDatos.length > 1 ? 'es' : ''} con datos de auditoría cargados
                </p>
              )}
            </div>

            {/* Selector de Período */}
            <div className="card-mascotera">
              <h3 className="text-sm font-semibold text-mascotera-text mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-mascotera-accent" />
                Período de Consulta
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2.5 rounded-lg bg-mascotera-darker hover:bg-mascotera-card border border-mascotera-border transition-colors text-mascotera-text"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-mascotera-darker rounded-lg border border-mascotera-border">
                  <Calendar className="w-4 h-4 text-mascotera-accent" />
                  <span className="font-semibold text-mascotera-text">{monthNames[selectedMonth]} {selectedYear}</span>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-2.5 rounded-lg bg-mascotera-darker hover:bg-mascotera-card border border-mascotera-border transition-colors text-mascotera-text"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-mascotera-text-muted mt-2">
                Muestra datos de auditoría del período seleccionado
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje: sucursal tiene datos pero no en este período (live mode only) */}
      {!viewingReport && activeSucursal && hasSucursalData && !hasData && (
        <div className="no-print card-mascotera border-mascotera-info/30">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-mascotera-info flex-shrink-0" />
            <div>
              <p className="text-mascotera-text font-semibold">Sin datos en este período</p>
              <p className="text-sm text-mascotera-text-muted">
                <strong>{activeSucursal}</strong> tiene datos de auditoría cargados, pero no para <strong>{periodoFormateado}</strong>.
                Ajustá el período de consulta para ver los datos disponibles.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay datos para la sucursal (live mode only) */}
      {!viewingReport && activeSucursal && !hasSucursalData && (
        <div className="no-print card-mascotera border-mascotera-warning/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-mascotera-warning flex-shrink-0" />
            <div>
              <p className="text-mascotera-text font-semibold">Sin datos de auditoría</p>
              <p className="text-sm text-mascotera-text-muted">
                No hay datos de auditoría cargados para <strong>{activeSucursal}</strong>.
                Primero completa la auditoría en el módulo <strong>Pilares</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state cuando no seleccionó sucursal (live mode only) */}
      {!viewingReport && !activeSucursal && (
        <div className="no-print card-mascotera h-48 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-mascotera-text-muted mx-auto mb-3" />
            <p className="text-mascotera-text-muted">
              Selecciona una sucursal para ver el informe de auditoría
            </p>
          </div>
        </div>
      )}

      {/* ===== SCREEN PREVIEW (visible on screen) ===== */}
      {hasAnythingToShow && activeSucursal && (
        <div className="no-print space-y-4">
          {/* Resumen cards */}
          {hasData && resumen && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-mascotera-darker rounded-lg p-3 text-center border border-mascotera-border">
                <p className="text-2xl font-bold text-mascotera-text">{resumen.totalPilares}</p>
                <p className="text-xs text-mascotera-text-muted">Pilares</p>
              </div>
              <div className="bg-mascotera-darker rounded-lg p-3 text-center border border-mascotera-success/30">
                <p className="text-2xl font-bold text-mascotera-success">{resumen.aprobados}</p>
                <p className="text-xs text-mascotera-text-muted">Aprobados</p>
              </div>
              <div className="bg-mascotera-darker rounded-lg p-3 text-center border border-mascotera-danger/30">
                <p className="text-2xl font-bold text-mascotera-danger">{resumen.noAprobados}</p>
                <p className="text-xs text-mascotera-text-muted">No Aprobados</p>
              </div>
              <div className="bg-mascotera-darker rounded-lg p-3 text-center border border-mascotera-warning/30">
                <p className="text-2xl font-bold text-mascotera-warning">{resumen.pendientes}</p>
                <p className="text-xs text-mascotera-text-muted">Pendientes</p>
              </div>
              <div className="bg-mascotera-darker rounded-lg p-3 text-center border border-mascotera-accent/30">
                <p className="text-2xl font-bold text-mascotera-accent">{resumen.promedioPonderacion}%</p>
                <p className="text-xs text-mascotera-text-muted">Ponderación</p>
              </div>
            </div>
          )}

          {/* Pilares detail on screen */}
          {hasData && Object.entries(getPilaresFor(activeSucursal)).map(([pilarKey, pilar]) => {
            const data = activeData?.[pilarKey];
            const pond = data ? calcPonderacion(activeData, pilarKey, pilar) : null;
            const pct = pond ? parseFloat(pond.porcentaje) : 0;

            return (
              <div key={pilarKey} className="card-mascotera space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-mascotera-text">{pilar.nombre}</h4>
                  {data ? (
                    <span className={`badge ${
                      data.estado === true ? 'badge-success'
                        : data.estado === false ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {data.estado === true ? 'APROBADO' : data.estado === false ? 'NO APROBADO' : 'PENDIENTE'}
                    </span>
                  ) : (
                    <span className="badge badge-warning">SIN EVALUAR</span>
                  )}
                </div>

                {pond && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-mascotera-darker rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pct >= 80 ? 'bg-mascotera-success' : pct >= 50 ? 'bg-mascotera-warning' : 'bg-mascotera-danger'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-bold ${
                      pct >= 80 ? 'text-mascotera-success' : pct >= 50 ? 'text-mascotera-warning' : 'text-mascotera-danger'
                    }`}>{pond.porcentaje}%</span>
                  </div>
                )}

                {data && data.tieneHallazgo && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-mascotera-danger" />
                    <span className="text-sm text-mascotera-danger font-semibold">
                      Hallazgo - Criticidad {criticidadConfig[data.criticidad]?.label}
                    </span>
                  </div>
                )}

                {data && (
                  <div className="space-y-1">
                    {pilar.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        {data.items[idx] === true ? (
                          <CheckCircle2 className="w-4 h-4 text-mascotera-success flex-shrink-0" />
                        ) : data.items[idx] === false ? (
                          <XCircle className="w-4 h-4 text-mascotera-danger flex-shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-mascotera-text-muted flex-shrink-0" />
                        )}
                        <span className={data.items[idx] === false ? 'text-mascotera-danger' : 'text-mascotera-text'}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {data?.observaciones && (
                  <div className="border-t border-mascotera-border pt-2">
                    <p className="text-sm text-mascotera-text-muted">
                      <strong className="text-mascotera-text">Observaciones:</strong> {data.observaciones}
                    </p>
                  </div>
                )}

                {data?.imagenes?.length > 0 && (
                  <div className="border-t border-mascotera-border pt-2">
                    <p className="text-sm text-mascotera-text mb-2">
                      <strong>Evidencia Fotográfica:</strong> {data.imagenes.length} imagen{data.imagenes.length > 1 ? 'es' : ''}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {data.imagenes.map((img, idx) => (
                        <img key={idx} src={img.preview} alt={img.name}
                          className="w-full h-20 object-cover rounded-lg border border-mascotera-border" />
                      ))}
                    </div>
                  </div>
                )}

                {!data && (
                  <p className="text-sm text-mascotera-text-muted italic">
                    Este pilar no fue evaluado en el período seleccionado
                  </p>
                )}
              </div>
            );
          })}

          {/* Descargos de la Sucursal */}
          {descargosForSucursal.length > 0 && (
            <div className="card-mascotera space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-mascotera-text flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-mascotera-accent" />
                  Descargos de la Sucursal
                </h4>
                <div className="flex items-center gap-2">
                  <span className="bg-mascotera-warning/20 text-mascotera-warning text-xs font-semibold px-2.5 py-1 rounded-full">
                    {descargosForSucursal.filter(d => d.estado === 'pendiente').length} pendientes
                  </span>
                  <span className="bg-mascotera-success/20 text-mascotera-success text-xs font-semibold px-2.5 py-1 rounded-full">
                    {descargosForSucursal.filter(d => d.estado === 'resuelta').length} resueltas
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {descargosForSucursal.map(descargo => (
                  <div key={descargo.id} className="bg-mascotera-darker rounded-lg p-3 border border-mascotera-border/50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-mascotera-text text-sm">{descargo.titulo}</span>
                          <span className="bg-mascotera-info/20 text-mascotera-info text-xs font-medium px-2 py-0.5 rounded">
                            {descargo.categoria}
                          </span>
                        </div>
                        <p className="text-sm text-mascotera-text-muted">{descargo.descripcion}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-mascotera-text-muted flex-wrap">
                          {descargo.creado_por_nombre && (
                            <span className="text-mascotera-text">
                              {descargo.creado_por_nombre} {descargo.creado_por_apellido}
                              {descargo.creado_por_puesto && (
                                <span className="text-mascotera-text-muted"> ({descargo.creado_por_puesto})</span>
                              )}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(descargo.fecha_descargo)}
                          </span>
                        </div>
                        {descargo.comentario_auditor && (
                          <p className="text-xs text-mascotera-accent mt-1">
                            Comentario auditor: {descargo.comentario_auditor}
                          </p>
                        )}
                        {descargo.fecha_resolucion && (
                          <p className="text-xs text-mascotera-success mt-1">
                            Resuelta el {formatDate(descargo.fecha_resolucion)}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                        descargo.estado === 'pendiente'
                          ? 'bg-mascotera-warning/20 text-mascotera-warning'
                          : 'bg-mascotera-success/20 text-mascotera-success'
                      }`}>
                        {descargo.estado === 'pendiente' ? 'Pendiente' : 'Resuelta'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Si solo hay descargos y no datos de pilares */}
          {!hasData && descargosForSucursal.length > 0 && (
            <div className="card-mascotera border-mascotera-info/30">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-mascotera-info flex-shrink-0" />
                <p className="text-sm text-mascotera-text-muted">
                  No hay datos de pilares para <strong>{periodoFormateado}</strong>, pero se muestran los descargos de la sucursal.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== PRINTABLE REPORT (hidden on screen, shown when printing) ===== */}
      {hasAnythingToShow && activeSucursal && (
        <div className="print-area hidden-on-screen">
          <div className="print-report">
            {/* Report Header */}
            <div className="print-header">
              <div className="print-header-top">
                <div>
                  <h1 className="print-title">INFORME DE AUDITORÍA</h1>
                  <p className="print-subtitle">La Mascotera - Sistema de Auditoría</p>
                </div>
                <div className="print-header-right">
                  <p className="print-date">{periodoFormateado}</p>
                  <p className="print-sucursal">Sucursal: {activeSucursal}</p>
                </div>
              </div>
              {auditoresValidos.length > 0 && (
                <div className="print-auditores">
                  <strong>Auditores:</strong> {auditoresValidos.join(', ')}
                </div>
              )}
            </div>

            {/* Resumen General */}
            {hasData && resumen && (
              <div className="print-section">
                <h2 className="print-section-title">Resumen General</h2>
                <div className="print-resumen-grid">
                  <div className="print-resumen-item">
                    <span className="print-resumen-value">{resumen.totalPilares}</span>
                    <span className="print-resumen-label">Pilares Evaluados</span>
                  </div>
                  <div className="print-resumen-item print-aprobado">
                    <span className="print-resumen-value">{resumen.aprobados}</span>
                    <span className="print-resumen-label">Aprobados</span>
                  </div>
                  <div className="print-resumen-item print-no-aprobado">
                    <span className="print-resumen-value">{resumen.noAprobados}</span>
                    <span className="print-resumen-label">No Aprobados</span>
                  </div>
                  <div className="print-resumen-item print-pendiente">
                    <span className="print-resumen-value">{resumen.pendientes}</span>
                    <span className="print-resumen-label">Pendientes</span>
                  </div>
                  <div className="print-resumen-item">
                    <span className="print-resumen-value">{resumen.promedioPonderacion}%</span>
                    <span className="print-resumen-label">Ponderación Promedio</span>
                  </div>
                </div>
              </div>
            )}

            {/* Detalle por Pilar */}
            {hasData && (
              <div className="print-section">
                <h2 className="print-section-title">Detalle por Pilar</h2>

                {Object.entries(getPilaresFor(activeSucursal)).map(([pilarKey, pilar]) => {
                  const data = activeData?.[pilarKey];
                  if (!data) return (
                    <div key={pilarKey} className="print-pilar">
                      <div className="print-pilar-header">
                        <h3 className="print-pilar-nombre">{pilar.nombre}</h3>
                        <span className="print-estado print-estado-pendiente">SIN EVALUAR</span>
                      </div>
                      <p className="print-sin-datos">Este pilar no fue evaluado en el período</p>
                    </div>
                  );

                  const pond = calcPonderacion(activeData, pilarKey, pilar);
                  const pct = pond ? parseFloat(pond.porcentaje) : 0;

                  return (
                    <div key={pilarKey} className="print-pilar">
                      <div className="print-pilar-header">
                        <h3 className="print-pilar-nombre">{pilar.nombre}</h3>
                        <span className={`print-estado ${
                          data.estado === true ? 'print-estado-aprobado'
                            : data.estado === false ? 'print-estado-no-aprobado'
                              : 'print-estado-pendiente'
                        }`}>
                          {data.estado === true ? 'APROBADO' : data.estado === false ? 'NO APROBADO' : 'PENDIENTE'}
                        </span>
                      </div>

                      {pond && (
                        <div className="print-ponderacion">
                          <div className="print-ponderacion-bar-container">
                            <div
                              className={`print-ponderacion-bar ${
                                pct >= 80 ? 'print-bar-success' : pct >= 50 ? 'print-bar-warning' : 'print-bar-danger'
                              }`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                          <span className="print-ponderacion-value">{pond.porcentaje}%</span>
                          <span className="print-ponderacion-detail">({pond.evaluados}/{pond.total} items)</span>
                        </div>
                      )}

                      {data.tieneHallazgo && (
                        <div className="print-criticidad" style={{ borderLeftColor: criticidadConfig[data.criticidad]?.color }}>
                          Hallazgo - Criticidad: <strong>{criticidadConfig[data.criticidad]?.label}</strong>
                        </div>
                      )}

                      <table className="print-items-table">
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}>N°</th>
                            <th>Item de Verificación</th>
                            <th style={{ width: '120px', textAlign: 'center' }}>Resultado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pilar.items.map((item, idx) => (
                            <tr key={idx} className={
                              data.items[idx] === true ? 'print-item-ok'
                                : data.items[idx] === false ? 'print-item-fail' : ''
                            }>
                              <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                              <td>{item.text}</td>
                              <td style={{ textAlign: 'center' }}>
                                {data.items[idx] === true ? 'CUMPLE'
                                  : data.items[idx] === false ? 'NO CUMPLE' : 'SIN EVALUAR'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {data.observaciones && (
                        <div className="print-observaciones">
                          <strong>Observaciones:</strong>
                          <p>{data.observaciones}</p>
                        </div>
                      )}

                      {data.imagenes && data.imagenes.length > 0 && (
                        <div className="print-imagenes">
                          <strong>Evidencia Fotográfica ({data.imagenes.length} imagen{data.imagenes.length > 1 ? 'es' : ''}):</strong>
                          <div className="print-imagenes-grid">
                            {data.imagenes.map((img, idx) => (
                              <img key={idx} src={img.preview} alt={img.name} className="print-imagen" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Descargos de la Sucursal */}
            {descargosForSucursal.length > 0 && (
              <div className="print-section">
                <h2 className="print-section-title">Descargos de la Sucursal</h2>
                <table className="print-items-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Categoría</th>
                      <th>Descripción</th>
                      <th style={{ width: '90px' }}>Fecha</th>
                      <th style={{ width: '90px', textAlign: 'center' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {descargosForSucursal.map(descargo => (
                      <tr key={descargo.id} className={descargo.estado === 'resuelta' ? 'print-item-ok' : 'print-item-fail'}>
                        <td style={{ fontWeight: 600 }}>{descargo.titulo}</td>
                        <td>{descargo.categoria}</td>
                        <td>{descargo.descripcion}</td>
                        <td>{formatDate(descargo.fecha_descargo)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          {descargo.estado === 'pendiente' ? 'PENDIENTE' : 'RESUELTA'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {descargosForSucursal.some(d => d.comentario_auditor) && (
                  <div className="print-observaciones" style={{ marginTop: '12px' }}>
                    <strong>Comentarios del Auditor:</strong>
                    {descargosForSucursal.filter(d => d.comentario_auditor).map(d => (
                      <p key={d.id} style={{ margin: '4px 0' }}>
                        <strong>{d.titulo}:</strong> {d.comentario_auditor}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="print-footer">
              <div className="print-footer-line"></div>
              <div className="print-footer-content">
                <p>Informe generado el {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p>Sistema de Auditoría - La Mascotera</p>
              </div>
              {auditoresValidos.length > 0 && (
                <div className="print-firmas">
                  {auditoresValidos.map((auditor, idx) => (
                    <div key={idx} className="print-firma">
                      <div className="print-firma-linea"></div>
                      <p className="print-firma-nombre">{auditor}</p>
                      <p className="print-firma-cargo">Auditor</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InformeAuditoria;
