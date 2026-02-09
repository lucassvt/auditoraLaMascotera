import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Package,
  Award,
  Target,
  BarChart3,
  AlertCircle,
  Truck,
  CheckSquare
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useAudit } from '../context/AuditContext';

const HISTORY_KEY = 'audit_pilar_history';

const pilarNombres = {
  ordenLimpieza: 'Orden y Limpieza',
  serviciosClub: 'Servicios y Club',
  gestionAdministrativa: 'Gestión Administrativa',
  pedidosYa: 'Pedidos Ya / WhatsApp',
  stockCaja: 'Stock y Caja',
  gestionPedidos: 'Gestión de Pedidos',
  mantenimientoVehiculos: 'Mantenimiento Vehículos'
};

const pilarIcons = {
  ordenLimpieza: Building2,
  serviciosClub: ShieldCheck,
  gestionAdministrativa: FileText,
  pedidosYa: CheckSquare,
  stockCaja: DollarSign,
  gestionPedidos: Package,
  mantenimientoVehiculos: Truck
};

const Dashboard = () => {
  const {
    auditData,
    sucursalesNombres,
    descargos,
    loadingDescargos,
    tareasResumen,
    conteosStock,
    fetchTareasResumen,
    fetchConteosStock
  } = useAudit();

  const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
  const prevMesKey = (() => {
    const pm = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const py = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    return `${py}-${String(pm + 1).padStart(2, '0')}`;
  })();

  // Refetch data when month changes
  useEffect(() => {
    fetchTareasResumen(mesKey);
    fetchConteosStock(mesKey);
  }, [mesKey]);

  // Read audit history from localStorage
  const getAuditHistory = () => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  };

  const history = getAuditHistory();
  const currentMonthData = history[mesKey] || {};
  const prevMonthData = history[prevMesKey] || {};

  // Lista de sucursales
  const sucursalesList = sucursalesNombres.length > 0 ? sucursalesNombres : [
    'LEGUIZAMON', 'CATAMARCA', 'CONGRESO', 'ARENALES',
    'BELGRANO SUR', 'LAPRIDA'
  ];

  // --- Calcular desempeño por sucursal ---
  const sucursalesDesempeno = sucursalesList.map(sucursal => {
    const histData = currentMonthData[sucursal];
    const contextData = auditData[sucursal];

    // Combinar: priorizar datos del contexto actual, luego historial
    let pilares = {};
    if (histData) {
      Object.entries(histData).forEach(([key, val]) => {
        pilares[key] = val;
      });
    }
    if (contextData) {
      Object.entries(contextData).forEach(([key, val]) => {
        if (val.estado !== null && val.estado !== undefined) {
          pilares[key] = {
            estado: val.estado,
            porcentaje: pilares[key]?.porcentaje || 0
          };
        }
      });
    }

    const pilarKeys = Object.keys(pilares);
    const totalEvaluados = pilarKeys.length;
    const aprobados = pilarKeys.filter(k => pilares[k].estado === true).length;
    const desaprobados = pilarKeys.filter(k => pilares[k].estado === false).length;
    const promPonderacion = totalEvaluados > 0
      ? pilarKeys.reduce((sum, k) => sum + (parseFloat(pilares[k].porcentaje) || 0), 0) / totalEvaluados
      : 0;

    return {
      nombre: sucursal,
      pilares,
      totalEvaluados,
      totalPilares: sucursal === 'DEPOSITO RUTA 9' ? 5 : 5,
      aprobados,
      desaprobados,
      promPonderacion: Math.round(promPonderacion * 10) / 10,
      auditada: totalEvaluados > 0
    };
  }).sort((a, b) => b.promPonderacion - a.promPonderacion);

  // --- KPIs ---
  const sucursalesAuditadas = sucursalesDesempeno.filter(s => s.auditada).length;
  const sucursalesPendientes = sucursalesDesempeno.filter(s => !s.auditada).length;
  const totalSucursales = sucursalesDesempeno.length;

  const cumplimientoPromedio = sucursalesAuditadas > 0
    ? Math.round(sucursalesDesempeno.filter(s => s.auditada).reduce((sum, s) => sum + s.promPonderacion, 0) / sucursalesAuditadas)
    : 0;

  // Comparar con mes anterior
  const prevSucDesempeno = sucursalesList.map(sucursal => {
    const histData = prevMonthData[sucursal];
    if (!histData) return null;
    const pilarKeys = Object.keys(histData);
    const promPond = pilarKeys.length > 0
      ? pilarKeys.reduce((sum, k) => sum + (parseFloat(histData[k].porcentaje) || 0), 0) / pilarKeys.length
      : 0;
    return { nombre: sucursal, promPonderacion: promPond };
  }).filter(Boolean);

  const prevCumplimiento = prevSucDesempeno.length > 0
    ? Math.round(prevSucDesempeno.reduce((sum, s) => sum + s.promPonderacion, 0) / prevSucDesempeno.length)
    : null;
  const prevAuditadas = Object.keys(prevMonthData).length;

  // Descargos
  const descargosPendientes = descargos.filter(d => d.estado === 'pendiente').length;
  const descargosResueltos = descargos.filter(d => d.estado === 'resuelta').length;

  // --- Análisis de pilares (puntos débiles) ---
  const pilarStats = {};
  sucursalesDesempeno.filter(s => s.auditada).forEach(suc => {
    Object.entries(suc.pilares).forEach(([key, val]) => {
      if (!pilarStats[key]) {
        pilarStats[key] = { nombre: pilarNombres[key] || key, total: 0, aprobados: 0, sumPct: 0 };
      }
      pilarStats[key].total++;
      if (val.estado === true) pilarStats[key].aprobados++;
      pilarStats[key].sumPct += parseFloat(val.porcentaje) || 0;
    });
  });

  const pilarAnalysis = Object.entries(pilarStats)
    .map(([key, data]) => ({
      key,
      nombre: data.nombre,
      tasaAprobacion: data.total > 0 ? Math.round((data.aprobados / data.total) * 100) : 0,
      promPonderacion: data.total > 0 ? Math.round(data.sumPct / data.total) : 0,
      evaluados: data.total
    }))
    .sort((a, b) => a.promPonderacion - b.promPonderacion);

  // Datos para gráfico de barras de pilares
  const pilarChartData = pilarAnalysis.map(p => ({
    name: p.nombre.length > 15 ? p.nombre.substring(0, 15) + '...' : p.nombre,
    fullName: p.nombre,
    ponderacion: p.promPonderacion,
    aprobacion: p.tasaAprobacion
  }));

  // Top y bottom performers
  const topPerformers = sucursalesDesempeno.filter(s => s.auditada).slice(0, 3);
  const bottomPerformers = [...sucursalesDesempeno].filter(s => s.auditada).sort((a, b) => a.promPonderacion - b.promPonderacion).slice(0, 3);

  // Tareas resumen
  const totalTareasSolicitadas = tareasResumen.reduce((sum, t) => sum + parseInt(t.solicitadas || 0), 0);
  const totalTareasCompletadas = tareasResumen.reduce((sum, t) => sum + parseInt(t.completadas || 0), 0);
  const totalTareasPendientes = tareasResumen.reduce((sum, t) => sum + parseInt(t.pendientes || 0), 0);
  const tareasPct = totalTareasSolicitadas > 0 ? Math.round((totalTareasCompletadas / totalTareasSolicitadas) * 100) : 0;

  // Conteos stock resumen
  const totalConteos = conteosStock.reduce((sum, c) => sum + parseInt(c.total_conteos || 0), 0);
  const netoDiferencia = conteosStock.reduce((sum, c) => sum + parseFloat(c.neto_diferencia || 0), 0);

  const hasData = sucursalesAuditadas > 0 || descargos.length > 0 || totalTareasSolicitadas > 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-mascotera-dark border border-mascotera-border rounded-lg p-3">
          <p className="text-mascotera-text font-semibold text-sm">{payload[0].payload.fullName}</p>
          <p className="text-mascotera-accent text-sm">Ponderacion: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="title-yellow text-2xl">Dashboard de Auditoría</h1>
          <p className="text-mascotera-text-muted mt-1">
            Resumen de desempeño y estado de auditorías
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrevMonth} className="p-2 rounded-lg bg-mascotera-darker hover:bg-mascotera-card transition-colors text-mascotera-text">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-mascotera-darker rounded-lg min-w-[180px] justify-center">
            <CalendarIcon className="w-4 h-4 text-mascotera-accent" />
            <span className="font-semibold text-mascotera-text">{mesesNombres[selectedMonth]} {selectedYear}</span>
          </div>
          <button onClick={handleNextMonth} className="p-2 rounded-lg bg-mascotera-darker hover:bg-mascotera-card transition-colors text-mascotera-text">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sucursales Auditadas */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-mascotera-text-muted text-sm">Sucursales Auditadas</p>
              <p className="text-3xl font-bold mt-2 text-mascotera-text">{sucursalesAuditadas}<span className="text-lg text-mascotera-text-muted">/{totalSucursales}</span></p>
            </div>
            <div className="p-3 rounded-lg bg-mascotera-darker text-mascotera-accent">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {prevAuditadas > 0 ? (
              <>
                {sucursalesAuditadas >= prevAuditadas ? (
                  <ArrowUpRight className="w-4 h-4 text-mascotera-success" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-mascotera-danger" />
                )}
                <span className={sucursalesAuditadas >= prevAuditadas ? 'text-mascotera-success' : 'text-mascotera-danger'}>
                  {prevAuditadas} mes ant.
                </span>
              </>
            ) : (
              <span className="text-mascotera-text-muted text-sm">Sin datos del mes anterior</span>
            )}
          </div>
        </div>

        {/* Cumplimiento Promedio */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-mascotera-text-muted text-sm">Cumplimiento Promedio</p>
              <p className={`text-3xl font-bold mt-2 ${cumplimientoPromedio >= 70 ? 'text-mascotera-success' : cumplimientoPromedio >= 50 ? 'text-mascotera-warning' : cumplimientoPromedio > 0 ? 'text-mascotera-danger' : 'text-mascotera-text'}`}>{cumplimientoPromedio}%</p>
            </div>
            <div className="p-3 rounded-lg bg-mascotera-darker text-mascotera-success">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {prevCumplimiento !== null ? (
              <>
                {cumplimientoPromedio >= prevCumplimiento ? (
                  <ArrowUpRight className="w-4 h-4 text-mascotera-success" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-mascotera-danger" />
                )}
                <span className={cumplimientoPromedio >= prevCumplimiento ? 'text-mascotera-success' : 'text-mascotera-danger'}>
                  {Math.abs(cumplimientoPromedio - prevCumplimiento)}%
                </span>
                <span className="text-mascotera-text-muted text-sm">vs mes anterior</span>
              </>
            ) : (
              <span className="text-mascotera-text-muted text-sm">Sin datos del mes anterior</span>
            )}
          </div>
        </div>

        {/* Descargos Pendientes */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-mascotera-text-muted text-sm">Descargos Pendientes</p>
              <p className={`text-3xl font-bold mt-2 ${descargosPendientes === 0 ? 'text-mascotera-success' : 'text-mascotera-warning'}`}>{descargosPendientes}</p>
            </div>
            <div className="p-3 rounded-lg bg-mascotera-darker text-mascotera-warning">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-mascotera-success" />
            <span className="text-mascotera-success">{descargosResueltos}</span>
            <span className="text-mascotera-text-muted text-sm">resueltos</span>
          </div>
        </div>

        {/* Tareas Mi Sucursal */}
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-mascotera-text-muted text-sm">Tareas Completadas</p>
              <p className={`text-3xl font-bold mt-2 ${tareasPct >= 80 ? 'text-mascotera-success' : tareasPct >= 50 ? 'text-mascotera-warning' : totalTareasSolicitadas > 0 ? 'text-mascotera-danger' : 'text-mascotera-text'}`}>
                {totalTareasSolicitadas > 0 ? `${tareasPct}%` : '-'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-mascotera-darker text-mascotera-accent">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-mascotera-text-muted text-sm">{totalTareasCompletadas}/{totalTareasSolicitadas} tareas</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!hasData ? (
        /* Empty State */
        <div className="card-mascotera h-64 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-mascotera-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-mascotera-text mb-2">Sin datos para este periodo</h3>
            <p className="text-mascotera-text-muted max-w-md">
              Realiza auditorías desde el módulo <a href="/checklist" className="text-mascotera-accent hover:underline">Pilares</a> para ver el desempeño aquí. Los resultados se guardan automáticamente.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Row 2: Ranking + Pilares Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ranking de Sucursales */}
            <div className="card-mascotera">
              <h3 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-mascotera-accent" />
                Ranking de Desempeño
              </h3>
              <div className="space-y-3">
                {sucursalesDesempeno.map((sucursal, index) => (
                  <div key={sucursal.nombre} className="flex items-center gap-3 p-3 rounded-lg bg-mascotera-darker/50 hover:bg-mascotera-darker transition-colors">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 ${
                      !sucursal.auditada ? 'bg-mascotera-card text-mascotera-text-muted' :
                      index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                      index === 1 ? 'bg-gray-400/20 text-gray-400' :
                      index === 2 ? 'bg-orange-600/20 text-orange-600' :
                      'bg-mascotera-card text-mascotera-text-muted'
                    }`}>
                      {sucursal.auditada ? `#${index + 1}` : '-'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-mascotera-text text-sm truncate">{sucursal.nombre}</span>
                        {sucursal.auditada ? (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-mascotera-text-muted">{sucursal.aprobados}/{sucursal.totalEvaluados} pilares</span>
                            <span className={`text-sm font-bold ${
                              sucursal.promPonderacion >= 70 ? 'text-mascotera-success' :
                              sucursal.promPonderacion >= 50 ? 'text-mascotera-warning' :
                              'text-mascotera-danger'
                            }`}>{sucursal.promPonderacion}%</span>
                          </div>
                        ) : (
                          <span className="badge badge-warning text-xs">PENDIENTE</span>
                        )}
                      </div>
                      <div className="h-2 bg-mascotera-card rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            !sucursal.auditada ? 'bg-mascotera-border' :
                            sucursal.promPonderacion >= 70 ? 'bg-gradient-to-r from-mascotera-success to-green-400' :
                            sucursal.promPonderacion >= 50 ? 'bg-gradient-to-r from-mascotera-warning to-yellow-400' :
                            'bg-gradient-to-r from-mascotera-danger to-red-400'
                          }`}
                          style={{ width: `${sucursal.auditada ? sucursal.promPonderacion : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Análisis por Pilar */}
            <div className="card-mascotera">
              <h3 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-mascotera-accent" />
                Ponderación Promedio por Pilar
              </h3>
              {pilarChartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={pilarChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a3a5c" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8899aa', fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" width={130} tick={{ fill: '#c0d0e0', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="ponderacion" radius={[0, 4, 4, 0]} barSize={20}>
                        {pilarChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.ponderacion >= 70 ? '#10b981' : entry.ponderacion >= 50 ? '#f59e0b' : '#ef4444'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 flex items-center justify-center gap-6 text-xs text-mascotera-text-muted">
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-mascotera-success"></span> Bueno (&ge;70%)</div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-mascotera-warning"></span> Regular (50-69%)</div>
                    <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-mascotera-danger"></span> Bajo (&lt;50%)</div>
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-mascotera-text-muted">
                  <p>Realiza auditorías para ver el análisis por pilar</p>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Reconocimiento + Puntos Débiles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reconocimiento y Alertas */}
            <div className="card-mascotera">
              <h3 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Reconocimiento y Alertas
              </h3>

              {/* Top performers */}
              {topPerformers.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-mascotera-success mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Mejor Desempeño
                  </h4>
                  <div className="space-y-2">
                    {topPerformers.map((suc, idx) => (
                      <div key={suc.nombre} className="flex items-center justify-between p-2.5 rounded-lg bg-mascotera-success/5 border border-mascotera-success/20">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg ${idx === 0 ? '' : 'opacity-60'}`}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                          <span className="font-semibold text-mascotera-text text-sm">{suc.nombre}</span>
                        </div>
                        <span className="text-mascotera-success font-bold text-sm">{suc.promPonderacion}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom performers */}
              {bottomPerformers.length > 0 && bottomPerformers[0].promPonderacion < 50 && (
                <div>
                  <h4 className="text-sm font-semibold text-mascotera-danger mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" /> Requieren Atención
                  </h4>
                  <div className="space-y-2">
                    {bottomPerformers.filter(s => s.promPonderacion < 50).map(suc => (
                      <div key={suc.nombre} className="flex items-center justify-between p-2.5 rounded-lg bg-mascotera-danger/5 border border-mascotera-danger/20">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-mascotera-danger" />
                          <span className="font-semibold text-mascotera-text text-sm">{suc.nombre}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-mascotera-text-muted">{suc.desaprobados} pilar(es) desaprobado(s)</span>
                          <span className="text-mascotera-danger font-bold text-sm">{suc.promPonderacion}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auditorías pendientes */}
              {sucursalesPendientes > 0 && (
                <div className="mt-5">
                  <h4 className="text-sm font-semibold text-mascotera-warning mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Auditorías Pendientes ({sucursalesPendientes})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sucursalesDesempeno.filter(s => !s.auditada).map(suc => (
                      <a key={suc.nombre} href="/checklist" className="px-3 py-1.5 rounded-lg bg-mascotera-warning/10 border border-mascotera-warning/30 text-mascotera-warning text-xs font-semibold hover:bg-mascotera-warning/20 transition-colors">
                        {suc.nombre}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {topPerformers.length === 0 && sucursalesPendientes === 0 && (
                <p className="text-mascotera-text-muted text-center py-8">Sin datos suficientes para mostrar</p>
              )}
            </div>

            {/* Puntos Débiles por Pilar */}
            <div className="card-mascotera">
              <h3 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-mascotera-warning" />
                Detalle por Pilar
              </h3>
              {pilarAnalysis.length > 0 ? (
                <div className="space-y-3">
                  {pilarAnalysis.map(pilar => {
                    const Icon = pilarIcons[pilar.key] || Target;
                    return (
                      <div key={pilar.key} className="p-3 rounded-lg bg-mascotera-darker/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-mascotera-accent" />
                            <span className="font-semibold text-mascotera-text text-sm">{pilar.nombre}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-mascotera-text-muted">{pilar.evaluados} evaluaciones</span>
                            <span className={`font-bold text-sm ${
                              pilar.promPonderacion >= 70 ? 'text-mascotera-success' :
                              pilar.promPonderacion >= 50 ? 'text-mascotera-warning' :
                              'text-mascotera-danger'
                            }`}>{pilar.promPonderacion}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-mascotera-card rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                pilar.promPonderacion >= 70 ? 'bg-mascotera-success' :
                                pilar.promPonderacion >= 50 ? 'bg-mascotera-warning' :
                                'bg-mascotera-danger'
                              }`}
                              style={{ width: `${pilar.promPonderacion}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-mascotera-text-muted flex-shrink-0">
                            {pilar.tasaAprobacion}% aprob.
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-mascotera-text-muted text-center py-8">Realiza auditorías para ver el detalle por pilar</p>
              )}
            </div>
          </div>

          {/* Row 4: Tareas + Descargos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumen de Tareas */}
            <div className="card-mascotera">
              <h3 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-mascotera-accent" />
                Tareas de Sucursales
              </h3>
              {totalTareasSolicitadas > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-mascotera-darker p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-mascotera-text">{totalTareasSolicitadas}</p>
                      <p className="text-xs text-mascotera-text-muted">Solicitadas</p>
                    </div>
                    <div className="bg-mascotera-darker p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-mascotera-success">{totalTareasCompletadas}</p>
                      <p className="text-xs text-mascotera-text-muted">Completadas</p>
                    </div>
                    <div className="bg-mascotera-darker p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-mascotera-warning">{totalTareasPendientes}</p>
                      <p className="text-xs text-mascotera-text-muted">Pendientes</p>
                    </div>
                  </div>
                  <div className="bg-mascotera-darker p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-mascotera-text-muted">Cumplimiento global</span>
                      <span className={`text-lg font-bold ${tareasPct >= 80 ? 'text-mascotera-success' : tareasPct >= 50 ? 'text-mascotera-warning' : 'text-mascotera-danger'}`}>{tareasPct}%</span>
                    </div>
                    <div className="h-3 bg-mascotera-card rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${tareasPct >= 80 ? 'bg-gradient-to-r from-mascotera-success to-green-400' : tareasPct >= 50 ? 'bg-gradient-to-r from-mascotera-warning to-yellow-400' : 'bg-gradient-to-r from-mascotera-danger to-red-400'}`}
                        style={{ width: `${tareasPct}%` }}
                      ></div>
                    </div>
                  </div>
                  {/* Tareas por categoría */}
                  <div className="mt-4 space-y-2">
                    {['ORDEN Y LIMPIEZA', 'MANTENIMIENTO SUCURSAL'].map(cat => {
                      const catData = tareasResumen.filter(t => t.categoria === cat);
                      const sol = catData.reduce((s, t) => s + parseInt(t.solicitadas || 0), 0);
                      const comp = catData.reduce((s, t) => s + parseInt(t.completadas || 0), 0);
                      const pct = sol > 0 ? Math.round((comp / sol) * 100) : 0;
                      if (sol === 0) return null;
                      return (
                        <div key={cat} className="flex items-center justify-between p-2 bg-mascotera-darker/50 rounded-lg">
                          <span className="text-xs font-semibold text-mascotera-text">{cat}</span>
                          <span className={`text-xs font-bold ${pct >= 80 ? 'text-mascotera-success' : pct >= 50 ? 'text-mascotera-warning' : 'text-mascotera-danger'}`}>{comp}/{sol} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-mascotera-text-muted text-center py-8">No hay tareas registradas para este periodo</p>
              )}

              {/* Stock resumen */}
              {totalConteos > 0 && (
                <div className="mt-4 pt-4 border-t border-mascotera-border">
                  <h4 className="text-sm font-semibold text-mascotera-text mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-mascotera-accent" /> Conteos de Stock
                  </h4>
                  <div className="flex items-center justify-between p-3 bg-mascotera-darker rounded-lg">
                    <div>
                      <span className="text-sm text-mascotera-text-muted">{totalConteos} conteo(s) realizados</span>
                    </div>
                    <span className={`text-lg font-bold ${netoDiferencia === 0 ? 'text-mascotera-success' : 'text-mascotera-warning'}`}>
                      ${Math.abs(netoDiferencia).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      {netoDiferencia !== 0 && <span className="text-xs ml-1">({netoDiferencia > 0 ? 'sobrante' : 'faltante'})</span>}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Descargos Recientes */}
            <div className="card-mascotera">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-mascotera-text flex items-center gap-2">
                  <FileText className="w-5 h-5 text-mascotera-accent" />
                  Descargos
                </h3>
                <a href="/auditorias" className="text-mascotera-accent text-sm hover:underline">Ver todos</a>
              </div>
              {descargos.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-mascotera-warning/10 border border-mascotera-warning/30 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-mascotera-warning">{descargosPendientes}</p>
                      <p className="text-xs text-mascotera-text-muted">Pendientes</p>
                    </div>
                    <div className="bg-mascotera-success/10 border border-mascotera-success/30 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-mascotera-success">{descargosResueltos}</p>
                      <p className="text-xs text-mascotera-text-muted">Resueltos</p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {descargos.slice(0, 8).map(descargo => (
                      <div key={descargo.id} className="p-3 rounded-lg bg-mascotera-darker/50 hover:bg-mascotera-darker transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-mascotera-text truncate">{descargo.titulo}</p>
                            <p className="text-xs text-mascotera-text-muted mt-0.5">
                              {descargo.sucursal_nombre?.replace(/^SUCURSAL\s+/i, '')} - {descargo.categoria}
                            </p>
                            {descargo.creado_por_nombre && (
                              <p className="text-xs text-mascotera-text-muted">
                                Por: {descargo.creado_por_nombre} {descargo.creado_por_apellido}
                              </p>
                            )}
                          </div>
                          <span className={`badge flex-shrink-0 ${descargo.estado === 'resuelta' ? 'badge-success' : 'badge-warning'}`}>
                            {descargo.estado === 'resuelta' ? 'Resuelta' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-mascotera-text-muted text-center py-8">
                  {loadingDescargos ? 'Cargando descargos...' : 'No hay descargos registrados'}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
