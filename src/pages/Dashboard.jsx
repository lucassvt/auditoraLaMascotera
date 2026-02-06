import React, { useState } from 'react';
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Building2,
  DollarSign,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useAudit } from '../context/AuditContext';

const Dashboard = () => {
  const { auditData, getAllHallazgos } = useAudit();

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

  // Lista de sucursales
  const sucursalesList = [
    'LEGUIZAMON',
    'CATAMARCA',
    'CONGRESO',
    'ARENALES',
    'BELGRANO SUR',
    'LAPRIDA',
    'VILLA CRESPO',
    'DEPOSITO RUTA 9'
  ];

  // Datos históricos mock por mes
  const datosHistoricos = {
    '2025-11': {
      'LEGUIZAMON': { cumplimiento: 60, pilaresCumplidos: 3, totalPilares: 5, pendiente: false },
      'CATAMARCA': { cumplimiento: 80, pilaresCumplidos: 4, totalPilares: 5, pendiente: false },
      'CONGRESO': { cumplimiento: 40, pilaresCumplidos: 2, totalPilares: 5, pendiente: false },
      'ARENALES': { cumplimiento: 60, pilaresCumplidos: 3, totalPilares: 5, pendiente: false },
      'BELGRANO SUR': { cumplimiento: 20, pilaresCumplidos: 1, totalPilares: 5, pendiente: false },
      'LAPRIDA': { cumplimiento: 0, pilaresCumplidos: 0, totalPilares: 5, pendiente: true },
      'VILLA CRESPO': { cumplimiento: 80, pilaresCumplidos: 4, totalPilares: 5, pendiente: false },
      'DEPOSITO RUTA 9': { cumplimiento: 100, pilaresCumplidos: 5, totalPilares: 5, pendiente: false }
    },
    '2025-12': {
      'LEGUIZAMON': { cumplimiento: 80, pilaresCumplidos: 4, totalPilares: 5, pendiente: false },
      'CATAMARCA': { cumplimiento: 100, pilaresCumplidos: 5, totalPilares: 5, pendiente: false },
      'CONGRESO': { cumplimiento: 60, pilaresCumplidos: 3, totalPilares: 5, pendiente: false },
      'ARENALES': { cumplimiento: 40, pilaresCumplidos: 2, totalPilares: 5, pendiente: false },
      'BELGRANO SUR': { cumplimiento: 40, pilaresCumplidos: 2, totalPilares: 5, pendiente: false },
      'LAPRIDA': { cumplimiento: 20, pilaresCumplidos: 1, totalPilares: 5, pendiente: false },
      'VILLA CRESPO': { cumplimiento: 0, pilaresCumplidos: 0, totalPilares: 5, pendiente: true },
      'DEPOSITO RUTA 9': { cumplimiento: 80, pilaresCumplidos: 4, totalPilares: 5, pendiente: false }
    }
  };

  // Calcular desempeño por sucursal basado en datos reales o históricos
  const sucursalesDesempeno = sucursalesList.map(sucursal => {
    // Si hay datos históricos para este mes, usarlos
    if (datosHistoricos[mesKey] && datosHistoricos[mesKey][sucursal]) {
      const hist = datosHistoricos[mesKey][sucursal];
      return { nombre: sucursal, ...hist };
    }

    // Para el mes actual (Enero 2026) o meses sin datos, usar datos del contexto
    const sucursalData = auditData[sucursal];

    if (!sucursalData) {
      return {
        nombre: sucursal,
        pilaresCumplidos: 0,
        totalPilares: 5,
        cumplimiento: 0,
        pendiente: true
      };
    }

    const pilares = Object.values(sucursalData);
    const totalPilares = pilares.length;
    const pilaresCumplidos = pilares.filter(p => p.estado === true).length;
    const pilaresPendientes = pilares.filter(p => p.estado === null).length;
    const cumplimiento = totalPilares > 0 ? Math.round((pilaresCumplidos / totalPilares) * 100) : 0;

    return {
      nombre: sucursal,
      pilaresCumplidos,
      totalPilares,
      cumplimiento,
      pendiente: pilaresPendientes === totalPilares
    };
  }).sort((a, b) => b.cumplimiento - a.cumplimiento);

  // Calcular estadísticas generales
  const totalSucursales = sucursalesDesempeno.length;
  const sucursalesPendientes = sucursalesDesempeno.filter(s => s.pendiente).length;
  const sucursalesEvaluadas = totalSucursales - sucursalesPendientes;
  const pilaresCumplidosTotal = sucursalesDesempeno.filter(s => !s.pendiente).reduce((sum, s) => sum + s.pilaresCumplidos, 0);
  const pilaresPosibles = sucursalesEvaluadas > 0 ? sucursalesDesempeno.filter(s => !s.pendiente).reduce((sum, s) => sum + s.totalPilares, 0) : 0;
  const cumplimientoGeneral = pilaresPosibles > 0 ? Math.round((pilaresCumplidosTotal / pilaresPosibles) * 100) : 0;

  // Datos de ejemplo para las estadísticas
  const stats = [
    {
      title: 'Sucursales Evaluadas',
      value: `${sucursalesEvaluadas}/${totalSucursales}`,
      change: '+2',
      changeType: 'positive',
      icon: Building2,
      color: 'text-mascotera-accent'
    },
    {
      title: 'Sucursales Pendientes',
      value: `${sucursalesPendientes}`,
      change: '-1',
      changeType: 'positive',
      icon: Clock,
      color: 'text-mascotera-warning'
    },
    {
      title: 'Cumplimiento General',
      value: `${cumplimientoGeneral}%`,
      change: '+5%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'text-mascotera-success'
    },
    {
      title: 'Pilares Cumplidos',
      value: `${pilaresCumplidosTotal}/${pilaresPosibles}`,
      change: '+8',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-mascotera-accent'
    },
  ];

  // Calcular datos para gráfico de estado basado en auditorías reales
  const hallazgos = getAllHallazgos();
  const hallazgosCriticos = hallazgos.filter(h => h.criticidad === 'critica' || h.criticidad === 'alta');

  const statusData = [
    { name: 'Completadas', value: sucursalesEvaluadas, color: '#10b981' },
    { name: 'En Proceso', value: 0, color: '#00d4aa' },
    { name: 'Pendientes', value: sucursalesPendientes, color: '#f59e0b' },
    { name: 'Hallazgos Críticos', value: hallazgosCriticos.length, color: '#ef4444' },
  ];

  // Provincias por sucursal
  const provinciasPorSucursal = {
    'LEGUIZAMON': 'Buenos Aires',
    'CATAMARCA': 'Catamarca',
    'CONGRESO': 'CABA',
    'ARENALES': 'CABA',
    'BELGRANO SUR': 'CABA',
    'LAPRIDA': 'Buenos Aires',
    'VILLA CRESPO': 'CABA',
    'DEPOSITO RUTA 9': 'Buenos Aires'
  };

  // Auditorías recientes basadas en datos reales
  const recentAudits = sucursalesDesempeno
    .filter(s => !s.pendiente)
    .slice(0, 4)
    .map((s, idx) => ({
      id: `AUD-${selectedYear}-${String(idx + 1).padStart(3, '0')}`,
      sucursal: s.nombre,
      provincia: provinciasPorSucursal[s.nombre] || 'N/A',
      auditor: 'Sistema de Auditoría',
      fecha: `${String(Math.min(28, 10 + idx * 3)).padStart(2, '0')}/${String(selectedMonth + 1).padStart(2, '0')}/${selectedYear}`,
      estado: 'Completada',
      cumplimiento: s.cumplimiento
    }));

  // Agregar sucursales pendientes
  const pendientes = sucursalesDesempeno
    .filter(s => s.pendiente)
    .slice(0, 4 - recentAudits.length)
    .map((s, idx) => ({
      id: `AUD-${selectedYear}-${String(recentAudits.length + idx + 1).padStart(3, '0')}`,
      sucursal: s.nombre,
      provincia: provinciasPorSucursal[s.nombre] || 'N/A',
      auditor: 'Pendiente',
      fecha: '-',
      estado: 'Pendiente',
      cumplimiento: null
    }));

  const allRecentAudits = [...recentAudits, ...pendientes];

  const getStatusBadge = (status) => {
    const badges = {
      'Completada': 'badge-success',
      'En Proceso': 'badge-info',
      'Pendiente': 'badge-warning',
      'Vencida': 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="title-yellow text-2xl">Dashboard de Auditoría</h1>
          <p className="text-mascotera-text-muted mt-1">
            Resumen general del sistema de auditoría
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-mascotera-text-muted text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2 text-mascotera-text">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-mascotera-darker ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="w-4 h-4 text-mascotera-success" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-mascotera-danger" />
                )}
                <span className={stat.changeType === 'positive' ? 'text-mascotera-success' : 'text-mascotera-danger'}>
                  {stat.change}
                </span>
                <span className="text-mascotera-text-muted text-sm">vs mes anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Status Pie Chart */}
        <div className="card-mascotera">
          <h3 className="text-lg font-semibold text-mascotera-text mb-6">
            Estado de Auditorías
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1f35',
                    border: '1px solid #1a3a5c',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6">
            {statusData.map((item, index) => (
              <div key={index} className="text-center p-3 bg-mascotera-darker rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="font-bold text-2xl text-mascotera-text">{item.value}</span>
                </div>
                <span className="text-sm text-mascotera-text-muted">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance & Recent Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking de Sucursales por Desempeño */}
        <div className="card-mascotera">
          <h3 className="text-lg font-semibold text-mascotera-text mb-6">
            Ranking de Sucursales por Desempeño
          </h3>
          <div className="space-y-3">
            {sucursalesDesempeno.map((sucursal, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-mascotera-darker/50 hover:bg-mascotera-darker transition-colors">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                  index === 1 ? 'bg-gray-400/20 text-gray-400' :
                  index === 2 ? 'bg-orange-600/20 text-orange-600' :
                  'bg-mascotera-card text-mascotera-text-muted'
                }`}>
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-mascotera-text">{sucursal.nombre}</span>
                    {sucursal.pendiente ? (
                      <span className="text-sm text-mascotera-warning font-semibold">PENDIENTE</span>
                    ) : (
                      <span className="text-sm font-semibold text-mascotera-accent">
                        {sucursal.pilaresCumplidos}/{sucursal.totalPilares} Pilares
                      </span>
                    )}
                  </div>
                  <div className="h-2 bg-mascotera-card rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sucursal.pendiente
                          ? 'bg-mascotera-warning'
                          : sucursal.cumplimiento >= 80
                            ? 'bg-gradient-to-r from-mascotera-success to-green-400'
                            : sucursal.cumplimiento >= 50
                              ? 'bg-gradient-to-r from-mascotera-accent to-mascotera-accent-light'
                              : 'bg-gradient-to-r from-mascotera-danger to-red-400'
                      }`}
                      style={{ width: `${sucursal.pendiente ? 100 : sucursal.cumplimiento}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audits Table */}
        <div className="card-mascotera">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-mascotera-text">
              Auditorías Recientes
            </h3>
            <a href="/auditorias" className="text-mascotera-accent text-sm hover:underline">
              Ver todas
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="table-mascotera">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sucursal</th>
                  <th>Provincia</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {allRecentAudits.map((audit) => {
                  return (
                    <tr key={audit.id}>
                      <td className="font-mono text-sm">{audit.id}</td>
                      <td className="font-semibold">{audit.sucursal}</td>
                      <td>{audit.provincia}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(audit.estado)}`}>
                          {audit.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
