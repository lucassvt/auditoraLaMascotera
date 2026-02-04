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
  // Datos de ejemplo para las estadísticas
  const stats = [
    {
      title: 'Auditorías Activas',
      value: '12',
      change: '+3',
      changeType: 'positive',
      icon: ClipboardCheck,
      color: 'text-mascotera-accent'
    },
    {
      title: 'Hallazgos Pendientes',
      value: '24',
      change: '-5',
      changeType: 'positive',
      icon: AlertTriangle,
      color: 'text-mascotera-warning'
    },
    {
      title: 'Cumplimiento General',
      value: '87%',
      change: '+2.5%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'text-mascotera-success'
    },
    {
      title: 'Próximas a Vencer',
      value: '5',
      change: '+2',
      changeType: 'negative',
      icon: Clock,
      color: 'text-mascotera-danger'
    },
  ];

  // Datos para gráfico de tendencia
  const trendData = [
    { mes: 'Jul', operativas: 8, financieras: 4, calidad: 6 },
    { mes: 'Ago', operativas: 12, financieras: 6, calidad: 8 },
    { mes: 'Sep', operativas: 10, financieras: 8, calidad: 7 },
    { mes: 'Oct', operativas: 15, financieras: 10, calidad: 12 },
    { mes: 'Nov', operativas: 14, financieras: 9, calidad: 10 },
    { mes: 'Dic', operativas: 18, financieras: 12, calidad: 14 },
  ];

  // Datos para gráfico de estado
  const statusData = [
    { name: 'Completadas', value: 45, color: '#10b981' },
    { name: 'En Proceso', value: 12, color: '#00d4aa' },
    { name: 'Pendientes', value: 8, color: '#f59e0b' },
    { name: 'Vencidas', value: 3, color: '#ef4444' },
  ];

  // Datos de cumplimiento por área
  const complianceByArea = [
    { area: 'Sucursal Centro', cumplimiento: 92 },
    { area: 'Sucursal Norte', cumplimiento: 88 },
    { area: 'Sucursal Sur', cumplimiento: 85 },
    { area: 'Almacén Principal', cumplimiento: 95 },
    { area: 'Administración', cumplimiento: 90 },
  ];

  // Auditorías recientes
  const recentAudits = [
    {
      id: 'AUD-2024-001',
      tipo: 'Operativa',
      area: 'Sucursal Centro',
      auditor: 'María García',
      fecha: '15/12/2024',
      estado: 'En Proceso',
      cumplimiento: 78
    },
    {
      id: 'AUD-2024-002',
      tipo: 'Financiera',
      area: 'Administración',
      auditor: 'Carlos López',
      fecha: '14/12/2024',
      estado: 'Completada',
      cumplimiento: 92
    },
    {
      id: 'AUD-2024-003',
      tipo: 'Calidad',
      area: 'Almacén Principal',
      auditor: 'Ana Martínez',
      fecha: '12/12/2024',
      estado: 'Pendiente',
      cumplimiento: null
    },
    {
      id: 'AUD-2024-004',
      tipo: 'Operativa',
      area: 'Sucursal Norte',
      auditor: 'Juan Pérez',
      fecha: '10/12/2024',
      estado: 'Completada',
      cumplimiento: 85
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

  const getTipoBadge = (tipo) => {
    const badges = {
      'Operativa': { icon: Building2, color: 'text-mascotera-accent' },
      'Financiera': { icon: DollarSign, color: 'text-mascotera-warning' },
      'Calidad': { icon: ShieldCheck, color: 'text-mascotera-success' }
    };
    return badges[tipo] || { icon: ClipboardCheck, color: 'text-mascotera-text-muted' };
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 card-mascotera">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-mascotera-text">
              Tendencia de Auditorías
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-mascotera-accent"></span>
                Operativas
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-mascotera-warning"></span>
                Financieras
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-mascotera-success"></span>
                Calidad
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorOperativas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFinancieras" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCalidad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3a5c" />
              <XAxis dataKey="mes" stroke="#6b8299" />
              <YAxis stroke="#6b8299" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0d1f35',
                  border: '1px solid #1a3a5c',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="operativas"
                stroke="#00d4aa"
                fillOpacity={1}
                fill="url(#colorOperativas)"
              />
              <Area
                type="monotone"
                dataKey="financieras"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#colorFinancieras)"
              />
              <Area
                type="monotone"
                dataKey="calidad"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorCalidad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie Chart */}
        <div className="card-mascotera">
          <h3 className="text-lg font-semibold text-mascotera-text mb-6">
            Estado de Auditorías
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
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
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-mascotera-text-muted">{item.name}</span>
                <span className="font-semibold text-mascotera-text">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance & Recent Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance by Area */}
        <div className="card-mascotera">
          <h3 className="text-lg font-semibold text-mascotera-text mb-6">
            Cumplimiento por Área
          </h3>
          <div className="space-y-4">
            {complianceByArea.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-mascotera-text">{item.area}</span>
                  <span className="font-semibold text-mascotera-accent">
                    {item.cumplimiento}%
                  </span>
                </div>
                <div className="h-2 bg-mascotera-darker rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-mascotera-accent to-mascotera-accent-light rounded-full transition-all duration-500"
                    style={{ width: `${item.cumplimiento}%` }}
                  ></div>
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
                  <th>Tipo</th>
                  <th>Área</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentAudits.map((audit) => {
                  const TipoIcon = getTipoBadge(audit.tipo).icon;
                  return (
                    <tr key={audit.id}>
                      <td className="font-mono text-sm">{audit.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <TipoIcon className={`w-4 h-4 ${getTipoBadge(audit.tipo).color}`} />
                          {audit.tipo}
                        </div>
                      </td>
                      <td>{audit.area}</td>
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
