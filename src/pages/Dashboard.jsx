import React from 'react';
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
  ArrowDownRight
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

const Dashboard = () => {
  // Datos de desempeño por sucursal (pilares cumplidos de 5)
  const sucursalesDesempeno = [
    { nombre: 'LEGUIZAMON', pilaresCumplidos: 5, totalPilares: 5, cumplimiento: 100 },
    { nombre: 'CATAMARCA', pilaresCumplidos: 5, totalPilares: 5, cumplimiento: 100 },
    { nombre: 'CONGRESO', pilaresCumplidos: 4, totalPilares: 5, cumplimiento: 80 },
    { nombre: 'ARENALES', pilaresCumplidos: 3, totalPilares: 5, cumplimiento: 60 },
    { nombre: 'BELGRANO SUR', pilaresCumplidos: 3, totalPilares: 5, cumplimiento: 60 },
    { nombre: 'LAPRIDA', pilaresCumplidos: 2, totalPilares: 5, cumplimiento: 40 },
    { nombre: 'VILLA CRESPO', pilaresCumplidos: 0, totalPilares: 5, cumplimiento: 0, pendiente: true },
  ].sort((a, b) => b.cumplimiento - a.cumplimiento);

  // Calcular estadísticas generales
  const totalSucursales = sucursalesDesempeno.length;
  const sucursalesPendientes = sucursalesDesempeno.filter(s => s.pendiente).length;
  const sucursalesEvaluadas = totalSucursales - sucursalesPendientes;
  const pilaresCumplidosTotal = sucursalesDesempeno.filter(s => !s.pendiente).reduce((sum, s) => sum + s.pilaresCumplidos, 0);
  const pilaresPosibles = sucursalesEvaluadas * 5;
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

  // Datos para gráfico de estado
  const statusData = [
    { name: 'Completadas', value: 45, color: '#10b981' },
    { name: 'En Proceso', value: 12, color: '#00d4aa' },
    { name: 'Pendientes', value: 8, color: '#f59e0b' },
    { name: 'Vencidas', value: 3, color: '#ef4444' },
  ];

  // Auditorías recientes
  const recentAudits = [
    {
      id: 'AUD-2026-001',
      sucursal: 'LEGUIZAMON',
      provincia: 'Buenos Aires',
      auditor: 'María García',
      fecha: '04/02/2026',
      estado: 'Completada',
      cumplimiento: 100
    },
    {
      id: 'AUD-2026-002',
      sucursal: 'CATAMARCA',
      provincia: 'Catamarca',
      auditor: 'Carlos López',
      fecha: '03/02/2026',
      estado: 'Completada',
      cumplimiento: 100
    },
    {
      id: 'AUD-2026-003',
      sucursal: 'CONGRESO',
      provincia: 'CABA',
      auditor: 'Ana Martínez',
      fecha: '02/02/2026',
      estado: 'Completada',
      cumplimiento: 80
    },
    {
      id: 'AUD-2026-004',
      sucursal: 'VILLA CRESPO',
      provincia: 'CABA',
      auditor: 'Juan Pérez',
      fecha: '01/02/2026',
      estado: 'Pendiente',
      cumplimiento: null
    },
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="title-yellow text-2xl">Dashboard de Auditoría</h1>
          <p className="text-mascotera-text-muted mt-1">
            Resumen general del sistema de auditoría
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" />
          Nueva Auditoría
        </button>
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
                {recentAudits.map((audit) => {
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
