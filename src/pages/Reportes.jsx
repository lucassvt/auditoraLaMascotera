import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
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
  ChevronLeft,
  X,
  Upload,
  Send,
  ShieldAlert,
  TrendingDown,
  Repeat,
  XCircle,
  FileCheck,
  Printer,
  Trash2,
  Users
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

const Reportes = () => {
  const { getAllHallazgos, sucursalesNombres, generatedReports, getReportsByMes, deleteReport } = useAudit();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hallazgos');
  const [filterType, setFilterType] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHallazgo, setSelectedHallazgo] = useState(null);
  const [nuevoHallazgoModalOpen, setNuevoHallazgoModalOpen] = useState(false);
  const [nuevoHallazgo, setNuevoHallazgo] = useState({
    titulo: '',
    descripcion: '',
    pilar: '',
    sucursal: '',
    tipo: 'no_conformidad',
    severidad: 'media',
    fechaLimite: '',
    imagenes: []
  });

  // Observaciones de DB para hallazgos
  const [observacionesDB, setObservacionesDB] = useState([]);

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

  // Fetch observaciones de DB para el período seleccionado
  useEffect(() => {
    fetch(`${API_BASE}/observaciones?periodo=${mesKey}`)
      .then(res => res.json())
      .then(data => setObservacionesDB(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error cargando observaciones para hallazgos:', err);
        setObservacionesDB([]);
      });
  }, [mesKey]);

  // Hallazgos manuales (sin datos mock - se gestionaran desde el backend)
  const hallazgosManuales = [];

  // Filtrar hallazgos por mes seleccionado
  const hallazgos = hallazgosManuales;

  const tipoConfig = {
    'no_conformidad': { label: 'No Conformidad', icon: AlertTriangle, color: 'text-mascotera-danger', bg: 'bg-mascotera-danger/10' },
    'observacion': { label: 'Observación', icon: MessageSquare, color: 'text-mascotera-warning', bg: 'bg-mascotera-warning/10' },
    'buena_practica': { label: 'Buena Práctica', icon: CheckCircle2, color: 'text-mascotera-success', bg: 'bg-mascotera-success/10' }
  };

  const severidadConfig = {
    'critica': { label: 'Crítica', color: 'text-red-500', bg: 'bg-red-500/20' },
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

  // Mapear criticidad de auditoría a severidad de reportes
  const criticidadToSeveridad = {
    'baja': 'baja',
    'media': 'media',
    'alta': 'alta',
    'critica': 'critica'
  };

  // Obtener hallazgos de auditorías (pilar-level: NO APROBADO)
  const auditHallazgos = getAllHallazgos().map(h => ({
    id: h.id,
    titulo: `${h.pilar} - Hallazgo de Auditoría`,
    descripcion: h.observaciones || 'No se proporcionaron observaciones adicionales',
    tipo: 'no_conformidad',
    severidad: criticidadToSeveridad[h.criticidad],
    categoria: 'auditoria',
    auditoria: `AUD-${new Date(h.fecha).getFullYear()}-${h.sucursal}`,
    area: h.sucursal,
    auditor: 'Sistema de Auditoría',
    fechaDeteccion: new Date(h.fecha).toLocaleDateString('es-AR'),
    fechaLimite: new Date(new Date(h.fecha).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR'),
    estado: h.estado,
    acciones: 0,
    comentarios: 0,
    evidencias: h.imagenes?.length || 0,
    tieneImagenes: (h.imagenes?.length || 0) > 0,
    criticidadOriginal: h.criticidad
  }));

  // Obtener hallazgos de observaciones de DB (cada observación es un hallazgo individual)
  const observacionesHallazgos = observacionesDB.map(obs => {
    const sucNombre = obs.sucursal_nombre ? obs.sucursal_nombre.replace(/^SUCURSAL\s+/i, '') : `Sucursal #${obs.sucursal_id}`;
    const pilarNombre = pilaresNombres[obs.pilar_key] || obs.pilar_key;
    const obsImages = obs.imagenes || [];
    return {
      id: `OBS-${obs.id}`,
      titulo: `${pilarNombre} - Observación`,
      descripcion: obs.texto,
      tipo: 'observacion',
      severidad: criticidadToSeveridad[obs.criticidad] || 'media',
      categoria: 'observacion_pilar',
      auditoria: `OBS-${obs.periodo}-${sucNombre}`,
      area: sucNombre,
      auditor: obs.creado_por || 'Sistema',
      fechaDeteccion: new Date(obs.created_at).toLocaleDateString('es-AR'),
      fechaLimite: null,
      estado: obs.estado === 'aprobada' ? 'cerrado' : obs.estado === 'desaprobada' ? 'abierto' : 'en_proceso',
      acciones: 0,
      comentarios: obs.comentario_auditor ? 1 : 0,
      evidencias: obsImages.length,
      tieneImagenes: obsImages.length > 0,
      criticidadOriginal: obs.criticidad,
      esObservacionDB: true
    };
  });

  // Combinar hallazgos manuales + pilar-level + observaciones DB
  const todosHallazgos = [...hallazgos, ...auditHallazgos, ...observacionesHallazgos];

  const filteredHallazgos = filterType === 'todos'
    ? todosHallazgos
    : todosHallazgos.filter(h => h.tipo === filterType);

  const stats = [
    { label: 'Total Hallazgos', value: todosHallazgos.length, color: 'text-mascotera-text' },
    { label: 'Críticos / Altos', value: todosHallazgos.filter(h => h.severidad === 'alta' || h.severidad === 'critica').length, color: 'text-mascotera-danger' },
    { label: 'De Auditorías', value: auditHallazgos.length, color: 'text-mascotera-accent' },
    { label: 'Observaciones', value: observacionesHallazgos.length, color: 'text-mascotera-warning' },
    { label: 'Abiertos', value: todosHallazgos.filter(h => h.estado === 'abierto').length, color: 'text-mascotera-danger' },
    { label: 'Cerrados', value: todosHallazgos.filter(h => h.estado === 'cerrado').length, color: 'text-mascotera-success' },
  ];

  const openDetail = (hallazgo) => {
    setSelectedHallazgo(hallazgo);
    setModalOpen(true);
  };

  // --- Datos históricos para detección de patrones negativos ---
  const pilaresNombres = {
    ordenLimpieza: 'Orden y Limpieza',
    serviciosClub: 'Servicios y Club',
    gestionAdministrativa: 'Gestión Administrativa',
    pedidosYa: 'Pedidos Ya / WhatsApp',
    stockCaja: 'Stock y Caja',
    gestionPedidos: 'Gestión de Pedidos',
    mantenimientoVehiculos: 'Mant. Vehículos'
  };


  const historicoPatrones = {};
  const analizarPatron = (resultados) => {
    const evaluados = resultados.filter(r => r !== null);
    if (evaluados.length === 0) return { tipo: 'sin_datos', label: 'Sin datos' };
    const aprobados = evaluados.filter(r => r === true).length;
    const total = evaluados.length;
    const ratio = aprobados / total;
    const ultimos = evaluados.slice(-3);
    const todosUltimosDesaprobados = ultimos.every(r => r === false);
    if (ratio === 0) return { tipo: 'siempre_desaprueba', label: 'Siempre desaprueba' };
    const mitad = Math.floor(evaluados.length / 2);
    const primeraMitad = mitad > 0 ? evaluados.slice(0, mitad).filter(r => r === true).length / mitad : 0;
    const segundaMitad = evaluados.slice(mitad).length > 0 ? evaluados.slice(mitad).filter(r => r === true).length / evaluados.slice(mitad).length : 0;
    if (segundaMitad < primeraMitad && todosUltimosDesaprobados) return { tipo: 'empeorando', label: 'Empeorando' };
    if (ratio < 0.5) return { tipo: 'irregular', label: 'Irregular negativo' };
    return null; // no es patrón negativo
  };

  // Generar alertas de patrones negativos por sucursal
  const alertasPatrones = [];
  Object.entries(historicoPatrones).forEach(([sucursal, pilaresData]) => {
    Object.entries(pilaresData).forEach(([pilarKey, resultados]) => {
      const patron = analizarPatron(resultados);
      if (patron) {
        const desaprobados = resultados.filter(r => r === false).length;
        const evaluados = resultados.filter(r => r !== null).length;
        alertasPatrones.push({
          sucursal,
          pilar: pilaresNombres[pilarKey] || pilarKey,
          patron,
          desaprobados,
          evaluados,
          ultimos3: resultados.slice(-3)
        });
      }
    });
  });

  // Ordenar: siempre_desaprueba > empeorando > irregular
  const patronOrden = { siempre_desaprueba: 0, empeorando: 1, irregular: 2 };
  alertasPatrones.sort((a, b) => (patronOrden[a.patron.tipo] ?? 9) - (patronOrden[b.patron.tipo] ?? 9));

  // Datos de pilares y sucursales
  const pilares = [
    { key: 'ordenLimpieza', nombre: 'Orden y Limpieza' },
    { key: 'serviciosClub', nombre: 'Servicios y Club la Mascotera' },
    { key: 'gestionAdministrativa', nombre: 'Gestión Administrativa y Sistema' },
    { key: 'pedidosYa', nombre: 'Pedidos Ya / Whatsapp WEB' },
    { key: 'stockCaja', nombre: 'Stock y Caja' },
    { key: 'gestionPedidos', nombre: 'Gestión de Pedidos' },
    { key: 'mantenimientoVehiculos', nombre: 'Mantenimiento de Vehículos' }
  ];


  const sucursales = sucursalesNombres;

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setNuevoHallazgo({
      ...nuevoHallazgo,
      imagenes: [...nuevoHallazgo.imagenes, ...imageFiles]
    });
  };

  const handleRemoveImage = (index) => {
    const newImagenes = [...nuevoHallazgo.imagenes];
    // Liberar la URL del objeto para evitar fugas de memoria
    URL.revokeObjectURL(newImagenes[index].preview);
    newImagenes.splice(index, 1);
    setNuevoHallazgo({
      ...nuevoHallazgo,
      imagenes: newImagenes
    });
  };

  const handleNuevoHallazgoSubmit = (e) => {
    e.preventDefault();
    // Aquí se agregaría la lógica para guardar el hallazgo
    console.log('Nuevo hallazgo:', nuevoHallazgo);
    setNuevoHallazgoModalOpen(false);
    // Limpiar URLs de objetos para evitar fugas de memoria
    nuevoHallazgo.imagenes.forEach(img => URL.revokeObjectURL(img.preview));
    // Resetear formulario
    setNuevoHallazgo({
      titulo: '',
      descripcion: '',
      pilar: '',
      sucursal: '',
      tipo: 'no_conformidad',
      severidad: 'media',
      fechaLimite: '',
      imagenes: []
    });
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
        <div className="flex items-center gap-3 flex-wrap">
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
          <button
            onClick={() => setNuevoHallazgoModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Hallazgo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-mascotera-darker p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('hallazgos')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'hallazgos'
              ? 'bg-mascotera-card text-mascotera-accent shadow'
              : 'text-mascotera-text-muted hover:text-mascotera-text'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Hallazgos
        </button>
        <button
          onClick={() => setActiveTab('informes')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'informes'
              ? 'bg-mascotera-card text-mascotera-accent shadow'
              : 'text-mascotera-text-muted hover:text-mascotera-text'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Informes Generados
          {generatedReports.length > 0 && (
            <span className="bg-mascotera-accent/20 text-mascotera-accent text-xs font-bold px-2 py-0.5 rounded-full">
              {generatedReports.length}
            </span>
          )}
        </button>
      </div>

      {/* ===== TAB: Hallazgos ===== */}
      {activeTab === 'hallazgos' && (<>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card-mascotera text-center">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-mascotera-text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Alertas de Patrones Negativos */}
      {alertasPatrones.length > 0 && (
        <div className="card-mascotera">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-mascotera-danger" />
            <h3 className="text-lg font-semibold text-mascotera-text">Alertas de Patrones Negativos</h3>
            <span className="text-xs text-mascotera-text-muted ml-2">Últimos 6 meses</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alertasPatrones.map((alerta, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 bg-mascotera-darker ${
                  alerta.patron.tipo === 'siempre_desaprueba' ? 'border-red-500' :
                  alerta.patron.tipo === 'empeorando' ? 'border-mascotera-danger' :
                  'border-mascotera-warning'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-mascotera-text text-sm">{alerta.sucursal}</p>
                    <p className="text-xs text-mascotera-text-muted">{alerta.pilar}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    alerta.patron.tipo === 'siempre_desaprueba' ? 'bg-red-500/20 text-red-500' :
                    alerta.patron.tipo === 'empeorando' ? 'bg-mascotera-danger/20 text-mascotera-danger' :
                    'bg-mascotera-warning/20 text-mascotera-warning'
                  }`}>
                    {alerta.patron.tipo === 'siempre_desaprueba' && <XCircle className="w-3 h-3" />}
                    {alerta.patron.tipo === 'empeorando' && <TrendingDown className="w-3 h-3" />}
                    {alerta.patron.tipo === 'irregular' && <Repeat className="w-3 h-3" />}
                    {alerta.patron.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs text-mascotera-text-muted mr-1">Últimos 3:</span>
                  {alerta.ultimos3.map((r, i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded flex items-center justify-center ${
                        r === null ? 'bg-mascotera-card' :
                        r ? 'bg-mascotera-success/20' : 'bg-mascotera-danger/20'
                      }`}
                    >
                      {r === null ? (
                        <span className="text-mascotera-text-muted text-xs">-</span>
                      ) : r ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-mascotera-success" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-mascotera-danger" />
                      )}
                    </div>
                  ))}
                  <span className="text-xs text-mascotera-text-muted ml-auto">
                    {alerta.desaprobados}/{alerta.evaluados} desaprobados
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <MessageSquare className="w-4 h-4" />
              Observaciones
            </button>
          </div>
        </div>
      </div>

      {/* Hallazgos List */}
      <div className="space-y-4">
        {filteredHallazgos.map((hallazgo) => {
          const tipoConf = tipoConfig[hallazgo.tipo] || tipoConfig['no_conformidad'];
          const TipoIcon = tipoConf.icon;
          const estadoConf = estadoConfig[hallazgo.estado] || estadoConfig['abierto'];
          const sevConf = severidadConfig[hallazgo.severidad] || severidadConfig['media'];

          return (
            <div
              key={hallazgo.id}
              className="card-mascotera hover:border-mascotera-accent/50 transition-all cursor-pointer"
              onClick={() => openDetail(hallazgo)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-lg ${tipoConf.bg} flex-shrink-0`}>
                  <TipoIcon className={`w-6 h-6 ${tipoConf.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm text-mascotera-accent">{hallazgo.id}</span>
                        <span className={`badge ${estadoConf.badge}`}>
                          {estadoConf.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${sevConf.bg} ${sevConf.color}`}>
                          {sevConf.label}
                        </span>
                        {hallazgo.criticidadOriginal === 'critica' && (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-500 border border-red-500 animate-pulse">
                            CRÍTICO
                          </span>
                        )}
                        {hallazgo.categoria === 'auditoria' && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-mascotera-accent/20 text-mascotera-accent">
                            Auditoría
                          </span>
                        )}
                        {hallazgo.categoria === 'observacion_pilar' && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-mascotera-warning/20 text-mascotera-warning">
                            Observación
                          </span>
                        )}
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
        {filteredHallazgos.length === 0 && (
          <div className="card-mascotera text-center py-12">
            <AlertTriangle className="w-12 h-12 text-mascotera-text-muted mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-semibold text-mascotera-text mb-1">No hay hallazgos</h3>
            <p className="text-sm text-mascotera-text-muted">
              No se encontraron hallazgos ni observaciones para este período.
            </p>
          </div>
        )}
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
                  <span className={`badge ${(estadoConfig[selectedHallazgo.estado] || estadoConfig['abierto']).badge}`}>
                    {(estadoConfig[selectedHallazgo.estado] || estadoConfig['abierto']).label}
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
                  <p className={`font-semibold ${(tipoConfig[selectedHallazgo.tipo] || tipoConfig['no_conformidad']).color}`}>
                    {(tipoConfig[selectedHallazgo.tipo] || tipoConfig['no_conformidad']).label}
                  </p>
                </div>
                <div className="p-4 bg-mascotera-darker rounded-lg">
                  <p className="text-xs text-mascotera-text-muted mb-1">Severidad</p>
                  <p className={`font-semibold ${(severidadConfig[selectedHallazgo.severidad] || severidadConfig['media']).color}`}>
                    {(severidadConfig[selectedHallazgo.severidad] || severidadConfig['media']).label}
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

      {/* Modal Nuevo Hallazgo (dentro de tab hallazgos) */}
      {nuevoHallazgoModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-mascotera-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-mascotera-darker p-6 border-b border-mascotera-border flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-mascotera-text">Nuevo Hallazgo</h2>
                <p className="text-sm text-mascotera-text-muted mt-1">
                  Registrar un nuevo hallazgo vinculado a un pilar
                </p>
              </div>
              <button
                onClick={() => setNuevoHallazgoModalOpen(false)}
                className="p-2 hover:bg-mascotera-card rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-mascotera-text" />
              </button>
            </div>

            <form onSubmit={handleNuevoHallazgoSubmit} className="p-6 space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-mascotera-text mb-2">
                  Título del Hallazgo *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoHallazgo.titulo}
                  onChange={(e) => setNuevoHallazgo({ ...nuevoHallazgo, titulo: e.target.value })}
                  placeholder="Ej: Desviación en arqueo de caja"
                  className="input-mascotera w-full"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-mascotera-text mb-2">
                  Descripción *
                </label>
                <textarea
                  required
                  value={nuevoHallazgo.descripcion}
                  onChange={(e) => setNuevoHallazgo({ ...nuevoHallazgo, descripcion: e.target.value })}
                  placeholder="Describe el hallazgo en detalle..."
                  rows={4}
                  className="input-mascotera w-full resize-none"
                />
              </div>

              {/* Pilar y Sucursal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-mascotera-text mb-2">
                    Pilar *
                  </label>
                  <select
                    required
                    value={nuevoHallazgo.pilar}
                    onChange={(e) => setNuevoHallazgo({ ...nuevoHallazgo, pilar: e.target.value })}
                    className="input-mascotera w-full"
                  >
                    <option value="">Seleccionar pilar</option>
                    {pilares.map((pilar) => (
                      <option key={pilar.key} value={pilar.key}>
                        {pilar.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-mascotera-text mb-2">
                    Sucursal *
                  </label>
                  <select
                    required
                    value={nuevoHallazgo.sucursal}
                    onChange={(e) => setNuevoHallazgo({ ...nuevoHallazgo, sucursal: e.target.value })}
                    className="input-mascotera w-full"
                  >
                    <option value="">Seleccionar sucursal</option>
                    {sucursales.map((sucursal) => (
                      <option key={sucursal} value={sucursal}>
                        {sucursal}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tipo y Severidad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-mascotera-text mb-2">
                    Tipo de Hallazgo *
                  </label>
                  <select
                    required
                    value={nuevoHallazgo.tipo}
                    onChange={(e) => setNuevoHallazgo({ ...nuevoHallazgo, tipo: e.target.value })}
                    className="input-mascotera w-full"
                  >
                    <option value="no_conformidad">No Conformidad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-mascotera-text mb-2">
                    Severidad *
                  </label>
                  <select
                    required
                    value={nuevoHallazgo.severidad}
                    onChange={(e) => setNuevoHallazgo({ ...nuevoHallazgo, severidad: e.target.value })}
                    className="input-mascotera w-full"
                  >
                    <option value="critica">Crítica</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>

              {/* Fecha Límite */}
              <div>
                <label className="block text-sm font-semibold text-mascotera-text mb-2">
                  Fecha Límite de Resolución
                </label>
                <input
                  type="date"
                  value={nuevoHallazgo.fechaLimite}
                  onChange={(e) => setNuevoHallazgo({ ...nuevoHallazgo, fechaLimite: e.target.value })}
                  className="input-mascotera w-full"
                />
              </div>

              {/* Adjuntar Imágenes */}
              <div>
                <label className="block text-sm font-semibold text-mascotera-text mb-2">
                  Adjuntar Imágenes
                </label>
                <div className="space-y-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-mascotera-border hover:border-mascotera-accent rounded-lg p-6 transition-colors flex flex-col items-center justify-center gap-2">
                      <Upload className="w-8 h-8 text-mascotera-text-muted" />
                      <p className="text-sm text-mascotera-text">
                        <span className="text-mascotera-accent font-semibold">Haz clic para subir</span> o arrastra imágenes
                      </p>
                      <p className="text-xs text-mascotera-text-muted">PNG, JPG, JPEG hasta 10MB</p>
                    </div>
                  </label>

                  {/* Preview de imágenes */}
                  {nuevoHallazgo.imagenes.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {nuevoHallazgo.imagenes.map((imagen, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imagen.preview}
                            alt={imagen.name}
                            className="w-full h-32 object-cover rounded-lg border border-mascotera-border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-mascotera-danger rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                          <p className="text-xs text-mascotera-text-muted mt-1 truncate" title={imagen.name}>
                            {imagen.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-mascotera-border">
                <button
                  type="button"
                  onClick={() => setNuevoHallazgoModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Crear Hallazgo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </>)}

      {/* ===== TAB: Informes Generados ===== */}
      {activeTab === 'informes' && (
        <div className="space-y-6">
          {/* Stats de informes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card-mascotera text-center">
              <p className="text-3xl font-bold text-mascotera-text">{generatedReports.length}</p>
              <p className="text-sm text-mascotera-text-muted mt-1">Total Informes</p>
            </div>
            <div className="card-mascotera text-center">
              <p className="text-3xl font-bold text-mascotera-accent">{getReportsByMes(mesKey).length}</p>
              <p className="text-sm text-mascotera-text-muted mt-1">Este Período</p>
            </div>
            <div className="card-mascotera text-center">
              <p className="text-3xl font-bold text-mascotera-success">
                {generatedReports.reduce((sum, r) => sum + (r.resumen?.aprobados || 0), 0)}
              </p>
              <p className="text-sm text-mascotera-text-muted mt-1">Pilares Aprobados</p>
            </div>
            <div className="card-mascotera text-center">
              <p className="text-3xl font-bold text-mascotera-danger">
                {generatedReports.reduce((sum, r) => sum + (r.resumen?.noAprobados || 0), 0)}
              </p>
              <p className="text-sm text-mascotera-text-muted mt-1">Pilares No Aprobados</p>
            </div>
          </div>

          {/* Lista de informes filtrados por mes */}
          {(() => {
            const reportesMes = getReportsByMes(mesKey);
            return reportesMes.length === 0 ? (
            <div className="card-mascotera text-center py-16">
              <FileCheck className="w-16 h-16 text-mascotera-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-mascotera-text mb-2">No hay informes para {mesesNombres[selectedMonth]} {selectedYear}</h3>
              <p className="text-mascotera-text-muted max-w-md mx-auto">
                Los informes se generan desde el módulo de Pilares una vez que todos los pilares de una sucursal han sido evaluados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportesMes.map(report => {
                const fecha = new Date(report.fechaGeneracion);
                return (
                  <div
                    key={report.id}
                    className="card-mascotera hover:border-mascotera-accent/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/informe?reportId=${report.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-mascotera-accent/10 flex-shrink-0">
                        <FileCheck className="w-6 h-6 text-mascotera-accent" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm text-mascotera-accent">{report.id}</span>
                              <span className="badge badge-success">Generado</span>
                              {report.tipoInforme && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                  report.tipoInforme === 'final'
                                    ? 'bg-mascotera-accent/20 text-mascotera-accent'
                                    : 'bg-mascotera-info/20 text-mascotera-info'
                                }`}>
                                  {report.tipoInforme === 'final' ? 'FINAL' : 'PRELIMINAR'}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-mascotera-text mt-2">
                              Informe {report.tipoInforme === 'final' ? 'Final' : 'Preliminar'} de Auditoría - {report.sucursal}
                            </h3>
                            <p className="text-sm text-mascotera-text-muted mt-1">
                              Período: {report.mesKey} | {report.resumen?.totalPilares || 0} pilares evaluados
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-mascotera-text-muted flex-shrink-0" />
                        </div>

                        {/* Resumen */}
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <span className="flex items-center gap-1.5 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-mascotera-success" />
                            <span className="text-mascotera-success font-semibold">{report.resumen?.aprobados || 0}</span>
                            <span className="text-mascotera-text-muted">aprobados</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-sm">
                            <XCircle className="w-4 h-4 text-mascotera-danger" />
                            <span className="text-mascotera-danger font-semibold">{report.resumen?.noAprobados || 0}</span>
                            <span className="text-mascotera-text-muted">no aprobados</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-sm">
                            <span className="text-mascotera-accent font-semibold">{report.resumen?.promedioPonderacion || '0'}%</span>
                            <span className="text-mascotera-text-muted">ponderación</span>
                          </span>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-6 mt-3 text-sm text-mascotera-text-muted flex-wrap">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {report.sucursal}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {(report.auditores || []).join(', ') || 'Sin auditores'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {report.descargos?.length > 0 && (
                            <span className="flex items-center gap-1 text-mascotera-warning">
                              <MessageSquare className="w-4 h-4" />
                              {report.descargos.length} descargo(s)
                            </span>
                          )}
                          {report.observacionesInforme?.length > 0 && (
                            <span className="flex items-center gap-1 text-mascotera-accent">
                              <MessageSquare className="w-4 h-4" />
                              {report.observacionesInforme.length} observación(es)
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿Eliminar informe ${report.id}?`)) {
                            deleteReport(report.id);
                          }
                        }}
                        className="p-2 text-mascotera-text-muted hover:text-mascotera-danger hover:bg-mascotera-danger/10 rounded-lg transition-colors flex-shrink-0"
                        title="Eliminar informe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
          })()}
        </div>
      )}
    </div>
  );
};

export default Reportes;
