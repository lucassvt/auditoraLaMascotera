import { useState, useEffect } from 'react';
import {
  CheckSquare,
  Building2,
  DollarSign,
  ShieldCheck,
  FileText,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Truck,
  Upload,
  X,
  Check,
  ChevronDown,
  Calendar as CalendarIcon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Users,
  Plus,
  Trash2,
  FileCheck,
  MessageSquare,
  Send,
  Image,
  ThumbsUp,
  ThumbsDown,
  User
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import { useNavigate } from 'react-router-dom';

const Checklist = () => {
  const {
    auditData, setAuditData, sucursalesNombres, sucursalesDB, tareasResumen, conteosStock,
    fetchTareasResumen, fetchTareasSucursal, fetchConteosStock, updateAuditoresSucursal,
    getAuditoresSucursal, generateReport, getReportTypesForSucursalMes,
    observaciones, fetchObservaciones, createObservacion, updateObservacionEstado, deleteObservacion,
    currentUser, isAuditor, userDisplayName
  } = useAudit();
  const navigate = useNavigate();
  const [tareasDetalle, setTareasDetalle] = useState([]);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [auditoresLocal, setAuditoresLocal] = useState(['']);
  const [generandoInforme, setGenerandoInforme] = useState(false);
  const [tipoInformeModal, setTipoInformeModal] = useState(false);
  const [tipoInformeSeleccionado, setTipoInformeSeleccionado] = useState(null);
  const [autoEvaluatedItems, setAutoEvaluatedItems] = useState({});

  // Observaciones UI state
  const [obsExpandedPilars, setObsExpandedPilars] = useState({});
  const [obsTexto, setObsTexto] = useState({});
  const [obsCriticidad, setObsCriticidad] = useState({});
  const [obsImagenes, setObsImagenes] = useState({});
  const [obsImagePreviews, setObsImagePreviews] = useState({});
  const [obsSending, setObsSending] = useState({});
  const [obsComentarioAuditor, setObsComentarioAuditor] = useState({});

  // Umbral de aprobación automática de stock (valor absoluto en pesos)
  const STOCK_THRESHOLD = 150000;

  // Lista de sucursales desde la base de datos
  const sucursales = sucursalesNombres.length > 0 ? sucursalesNombres : [
    'LEGUIZAMON', 'CATAMARCA', 'CONGRESO', 'ARENALES',
    'BELGRANO SUR', 'LAPRIDA'
  ];

  // Pilares para sucursales tradicionales
  const pilaresTradicionales = {
    ordenLimpieza: {
      nombre: 'Orden y Limpieza',
      icon: Building2,
      color: 'text-mascotera-accent',
      bg: 'bg-mascotera-accent/10',
      items: [
        { text: 'El local se encuentra limpio y ordenado', peso: 35 },
        { text: 'Los espacios comunes están libres de obstrucciones', peso: 25 },
        { text: 'El personal usa uniforme completo y en buen estado', peso: 25 },
        { text: 'La presentación personal es adecuada', peso: 15 }
      ]
    },
    serviciosClub: {
      nombre: 'Servicios y Club la Mascotera',
      icon: ShieldCheck,
      color: 'text-mascotera-success',
      bg: 'bg-mascotera-success/10',
      items: [
        { text: 'Se ofrece correctamente el servicio de veterinaria', peso: 30 },
        { text: 'Se ofrece correctamente el servicio de peluquería', peso: 20 },
        { text: 'Se pregunta al cliente si desea sumar puntos', peso: 20 },
        { text: 'La facturación a consumidor final es menor al 30%', peso: 30 }
      ]
    },
    gestionAdministrativa: {
      nombre: 'Gestión Administrativa y Sistema',
      icon: FileText,
      color: 'text-mascotera-warning',
      bg: 'bg-mascotera-warning/10',
      items: [
        { text: 'No hay pedidos pendientes de facturar', peso: 40 },
        { text: 'Los remitos están cargados correctamente', peso: 35 },
        { text: 'No hay transferencias pendientes de aceptar', peso: 25 }
      ]
    },
    pedidosYa: {
      nombre: 'Pedidos Ya / Whatsapp WEB',
      icon: CheckSquare,
      color: 'text-mascotera-accent',
      bg: 'bg-mascotera-accent/10',
      items: [
        { text: 'La tasa de pedidos rechazados es menor al 3%', peso: 100 }
      ]
    },
    stockCaja: {
      nombre: 'Stock y Caja',
      icon: DollarSign,
      color: 'text-mascotera-danger',
      bg: 'bg-mascotera-danger/10',
      items: [
        { text: 'Las desviaciones de stock están dentro del rango permitido', peso: 60 },
        { text: 'Los arqueos de caja están correctamente realizados y conciliados', peso: 40 }
      ]
    }
  };

  // Pilares para DEPOSITO RUTA 9
  const pilaresDeposito = {
    ordenLimpieza: {
      nombre: 'Orden y Limpieza',
      icon: Building2,
      color: 'text-mascotera-accent',
      bg: 'bg-mascotera-accent/10',
      items: [
        { text: 'El depósito se encuentra limpio y ordenado', peso: 30 },
        { text: 'Las áreas de carga están libres de obstrucciones', peso: 30 },
        { text: 'El personal usa indumentaria de seguridad adecuada', peso: 25 },
        { text: 'Las áreas comunes están en condiciones óptimas', peso: 15 }
      ]
    },
    gestionAdministrativa: {
      nombre: 'Gestión Administrativa y Sistema',
      icon: FileText,
      color: 'text-mascotera-warning',
      bg: 'bg-mascotera-warning/10',
      items: [
        { text: 'Los remitos están cargados correctamente', peso: 40 },
        { text: 'No hay transferencias pendientes de aceptar', peso: 30 },
        { text: 'La documentación está al día', peso: 30 }
      ]
    },
    stockCaja: {
      nombre: 'Stock y Caja',
      icon: DollarSign,
      color: 'text-mascotera-danger',
      bg: 'bg-mascotera-danger/10',
      items: [
        { text: 'Las desviaciones de stock están dentro del rango permitido', peso: 60 },
        { text: 'Los inventarios están correctamente registrados', peso: 40 }
      ]
    },
    gestionPedidos: {
      nombre: 'Gestión de Pedidos',
      icon: Package,
      color: 'text-mascotera-info',
      bg: 'bg-mascotera-info/10',
      items: [
        { text: 'La preparación y despacho se realizan correctamente', peso: 40 },
        { text: 'Las incidencias y devoluciones se gestionan adecuadamente', peso: 30 },
        { text: 'Se cumple con los plazos comprometidos', peso: 30 }
      ]
    },
    mantenimientoVehiculos: {
      nombre: 'Mantenimiento de Vehículos',
      icon: Truck,
      color: 'text-mascotera-accent',
      bg: 'bg-mascotera-accent/10',
      items: [
        { text: 'La flota está en buen estado y disponible', peso: 55 },
        { text: 'Se cumple con la documentación legal y seguridad', peso: 45 }
      ]
    }
  };

  // Obtener pilares según la sucursal seleccionada
  const getPilares = () => {
    return selectedSucursal === 'DEPOSITO RUTA 9' ? pilaresDeposito : pilaresTradicionales;
  };

  const changeMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Inicializar datos de auditoría para una sucursal y pilar
  const initPilarData = (pilarKey) => {
    const pilares = getPilares();
    const pilar = pilares[pilarKey];

    if (!auditData[selectedSucursal]) {
      auditData[selectedSucursal] = {};
    }

    if (!auditData[selectedSucursal][pilarKey]) {
      auditData[selectedSucursal][pilarKey] = {
        nombre: pilar.nombre,
        estado: null, // true = APROBADO, false = NO APROBADO, null = PENDIENTE
        items: pilar.items.map(() => null), // null = sin evaluar, true = cumple, false = no cumple
        imagenes: [],
        observaciones: '',
        criticidad: null, // baja, media, alta, critica (obligatorio)
        tieneHallazgo: false,
        fecha: new Date().toISOString()
      };
    }

    return auditData[selectedSucursal][pilarKey];
  };

  // Actualizar estado del pilar
  const updatePilarEstado = (pilarKey, estado) => {
    if (!auditData[selectedSucursal]) {
      auditData[selectedSucursal] = {};
    }

    const data = initPilarData(pilarKey);
    data.estado = estado;

    // Si se marca como NO APROBADO, automáticamente tiene hallazgo
    if (estado === false) {
      data.tieneHallazgo = true;
    }

    setAuditData({ ...auditData });
  };

  // Actualizar criticidad del pilar
  const updateCriticidad = (pilarKey, criticidad) => {
    const data = initPilarData(pilarKey);
    data.criticidad = criticidad;
    setAuditData({ ...auditData });
  };

  // Actualizar item del pilar (true = cumple, false = no cumple, null = sin evaluar)
  const setPilarItem = (pilarKey, itemIndex, value) => {
    const data = initPilarData(pilarKey);
    // Si ya tiene ese valor, lo resetea a null (sin evaluar)
    data.items[itemIndex] = data.items[itemIndex] === value ? null : value;

    // Si el auditor modifica manualmente un item auto-evaluado, quitar flag auto
    if (pilarKey === 'stockCaja' && itemIndex === 0) {
      setAutoEvaluatedItems(prev => ({ ...prev, 'stockCaja-0': false }));
    }

    // Auto-determinar estado cuando TODOS los items están evaluados
    const pilares = getPilares();
    const pilar = pilares[pilarKey];
    const allEvaluated = data.items.every(item => item !== null);

    if (allEvaluated) {
      const pesoTotal = pilar.items.reduce((sum, item) => sum + item.peso, 0);
      const pesoAprobado = pilar.items.reduce((sum, item, idx) => {
        return data.items[idx] === true ? sum + item.peso : sum;
      }, 0);
      const porcentaje = pesoTotal > 0 ? (pesoAprobado / pesoTotal) * 100 : 0;

      if (porcentaje > 50) {
        data.estado = true; // APROBADO
        data.tieneHallazgo = false;
      } else if (porcentaje < 50) {
        data.estado = false; // NO APROBADO
        data.tieneHallazgo = true;
      } else {
        // Exactamente 50% - definir según historial de meses anteriores
        const prevEstado = getPreviousMonthEstado(selectedSucursal, pilarKey);
        if (prevEstado === true) {
          // Venía aprobando → se considera aprobado
          data.estado = true;
          data.tieneHallazgo = false;
        } else {
          // Venía desaprobando o sin historial → se considera no aprobado
          data.estado = false;
          data.tieneHallazgo = true;
        }
      }

      // Guardar en historial
      saveAuditHistory(selectedSucursal, pilarKey, data.estado, porcentaje);
    }

    setAuditData({ ...auditData });
  };

  // Agregar imagen al pilar
  const handleImageSelect = (pilarKey, e) => {
    const files = Array.from(e.target.files);
    const data = initPilarData(pilarKey);

    const imageFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    data.imagenes = [...data.imagenes, ...imageFiles];
    setAuditData({ ...auditData });
  };

  // Remover imagen del pilar
  const removeImage = (pilarKey, imageIndex) => {
    const data = initPilarData(pilarKey);
    URL.revokeObjectURL(data.imagenes[imageIndex].preview);
    data.imagenes.splice(imageIndex, 1);
    setAuditData({ ...auditData });
  };

  // Actualizar observaciones
  const updateObservaciones = (pilarKey, observaciones) => {
    const data = initPilarData(pilarKey);
    data.observaciones = observaciones;
    setAuditData({ ...auditData });
  };

  const pilares = getPilares();

  // Mes key para filtrar datos
  const mesKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;

  // Refetch tareas y conteos cuando cambia el mes
  useEffect(() => {
    fetchTareasResumen(mesKey);
    fetchConteosStock(mesKey);
  }, [mesKey]);

  // Cargar tareas detalle cuando cambia la sucursal
  useEffect(() => {
    if (!selectedSucursal) return;
    const sucDB = sucursalesDB.find(s => s.nombre.replace(/^SUCURSAL\s+/i, '') === selectedSucursal);
    if (sucDB) {
      setLoadingTareas(true);
      fetchTareasSucursal(sucDB.id, mesKey).then(tareas => {
        setTareasDetalle(Array.isArray(tareas) ? tareas : []);
        setLoadingTareas(false);
      });
    }
  }, [selectedSucursal, mesKey]);

  // Auto-evaluar item 0 de stockCaja basándose en conteos_stock
  // Si |neto_diferencia| >= $150.000 → item NO CUMPLE y pilar NO APROBADO automáticamente
  // Si |neto_diferencia| < $150.000 → item CUMPLE
  useEffect(() => {
    if (!selectedSucursal) return;
    const sucDB = sucursalesDB.find(s => s.nombre.replace(/^SUCURSAL\s+/i, '') === selectedSucursal);
    if (!sucDB) return;

    const conteos = conteosStock.filter(c => c.sucursal_id === sucDB.id);
    if (conteos.length === 0) return;

    const netoDiferencia = conteos.reduce((sum, c) => sum + parseFloat(c.neto_diferencia || 0), 0);
    const cumple = Math.abs(netoDiferencia) < STOCK_THRESHOLD;

    const data = initPilarData('stockCaja');
    const itemKey = 'stockCaja-0';
    const wasAutoEvaluated = autoEvaluatedItems[itemKey];

    // Solo auto-evaluar si: no fue evaluado aún, o fue auto-evaluado previamente
    if (data.items[0] === null || wasAutoEvaluated) {
      data.items[0] = cumple;
      setAutoEvaluatedItems(prev => ({ ...prev, [itemKey]: true }));

      // Si excede el umbral, desaprobar el pilar completo automáticamente
      if (!cumple) {
        data.estado = false;
        data.tieneHallazgo = true;
      }

      setAuditData({ ...auditData });
    }
  }, [conteosStock, selectedSucursal, sucursalesDB]);

  // Helper: get tareas resumen for current sucursal
  const getTareasResumen = () => {
    const sucDB = sucursalesDB.find(s => s.nombre.replace(/^SUCURSAL\s+/i, '') === selectedSucursal);
    if (!sucDB) return { ordenLimpieza: null, mantenimiento: null };
    const ordenLimpieza = tareasResumen.find(t => t.sucursal_id === sucDB.id && t.categoria === 'ORDEN Y LIMPIEZA');
    const mantenimiento = tareasResumen.find(t => t.sucursal_id === sucDB.id && t.categoria === 'MANTENIMIENTO SUCURSAL');
    return { ordenLimpieza, mantenimiento };
  };

  // Helper: get conteos for current sucursal
  const getConteos = () => {
    const sucDB = sucursalesDB.find(s => s.nombre.replace(/^SUCURSAL\s+/i, '') === selectedSucursal);
    if (!sucDB) return [];
    return conteosStock.filter(c => c.sucursal_id === sucDB.id);
  };

  // --- Historial de auditorías en localStorage ---
  const HISTORY_KEY = 'audit_pilar_history';

  const getAuditHistory = () => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  };

  const saveAuditHistory = (sucursal, pilarKey, estado, porcentaje) => {
    const history = getAuditHistory();
    if (!history[mesKey]) history[mesKey] = {};
    if (!history[mesKey][sucursal]) history[mesKey][sucursal] = {};
    history[mesKey][sucursal][pilarKey] = { estado, porcentaje };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  };

  const getPreviousMonthEstado = (sucursal, pilarKey) => {
    const history = getAuditHistory();
    // Buscar hacia atrás hasta 6 meses el último resultado registrado
    for (let i = 1; i <= 6; i++) {
      const prevDate = new Date(selectedDate);
      prevDate.setMonth(prevDate.getMonth() - i);
      const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      const prevEstado = history[prevKey]?.[sucursal]?.[pilarKey]?.estado;
      if (prevEstado !== undefined && prevEstado !== null) {
        return prevEstado; // true = aprobado, false = no aprobado
      }
    }
    return null; // sin historial
  };

  const criticidadConfig = {
    baja: { label: 'Baja', color: 'text-mascotera-info', bg: 'bg-mascotera-info/20', border: 'border-mascotera-info' },
    media: { label: 'Media', color: 'text-mascotera-warning', bg: 'bg-mascotera-warning/20', border: 'border-mascotera-warning' },
    alta: { label: 'Alta', color: 'text-mascotera-danger', bg: 'bg-mascotera-danger/20', border: 'border-mascotera-danger' },
    critica: { label: 'Crítica', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500' }
  };

  // ========== OBSERVACIONES ==========

  // Fetch observaciones al cambiar sucursal o mes
  useEffect(() => {
    if (!selectedSucursal) return;
    const sucDB = sucursalesDB.find(s => s.nombre.replace(/^SUCURSAL\s+/i, '') === selectedSucursal);
    if (sucDB) {
      fetchObservaciones(sucDB.id, null, mesKey);
    }
  }, [selectedSucursal, mesKey]);

  // Observaciones filtradas por pilar
  const getObservacionesPilar = (pilarKey) => {
    const sucDB = sucursalesDB.find(s => s.nombre.replace(/^SUCURSAL\s+/i, '') === selectedSucursal);
    if (!sucDB) return [];
    return observaciones.filter(o => o.sucursal_id === sucDB.id && o.pilar_key === pilarKey && o.periodo === mesKey);
  };

  // Toggle expandir/colapsar sección de observaciones
  const toggleObsExpanded = (pilarKey) => {
    setObsExpandedPilars(prev => ({ ...prev, [pilarKey]: !prev[pilarKey] }));
  };

  // Enviar nueva observación
  const handleEnviarObservacion = async (pilarKey) => {
    const texto = obsTexto[pilarKey]?.trim();
    if (!texto) return;

    const sucDB = sucursalesDB.find(s => s.nombre.replace(/^SUCURSAL\s+/i, '') === selectedSucursal);
    if (!sucDB || !currentUser) return;

    setObsSending(prev => ({ ...prev, [pilarKey]: true }));

    const imageFiles = obsImagenes[pilarKey] || [];
    const criticidad = obsCriticidad[pilarKey] || 'media';

    await createObservacion(sucDB.id, pilarKey, mesKey, texto, criticidad, userDisplayName, imageFiles);

    // Limpiar form
    setObsTexto(prev => ({ ...prev, [pilarKey]: '' }));
    setObsCriticidad(prev => ({ ...prev, [pilarKey]: 'media' }));
    // Limpiar imágenes y previews
    (obsImagePreviews[pilarKey] || []).forEach(url => URL.revokeObjectURL(url));
    setObsImagenes(prev => ({ ...prev, [pilarKey]: [] }));
    setObsImagePreviews(prev => ({ ...prev, [pilarKey]: [] }));
    setObsSending(prev => ({ ...prev, [pilarKey]: false }));
  };

  // Agregar imágenes a observación en progreso
  const handleObsImageSelect = (pilarKey, e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => URL.createObjectURL(f));
    setObsImagenes(prev => ({ ...prev, [pilarKey]: [...(prev[pilarKey] || []), ...files] }));
    setObsImagePreviews(prev => ({ ...prev, [pilarKey]: [...(prev[pilarKey] || []), ...previews] }));
  };

  // Remover imagen de observación en progreso
  const handleObsImageRemove = (pilarKey, idx) => {
    const previews = [...(obsImagePreviews[pilarKey] || [])];
    URL.revokeObjectURL(previews[idx]);
    previews.splice(idx, 1);
    const files = [...(obsImagenes[pilarKey] || [])];
    files.splice(idx, 1);
    setObsImagenes(prev => ({ ...prev, [pilarKey]: files }));
    setObsImagePreviews(prev => ({ ...prev, [pilarKey]: previews }));
  };

  // Aprobar/desaprobar observación (auditor)
  const handleObsEstado = async (obsId, estado, pilarKey) => {
    const comentario = obsComentarioAuditor[obsId] || null;
    await updateObservacionEstado(obsId, estado, comentario);
    setObsComentarioAuditor(prev => ({ ...prev, [obsId]: '' }));
  };

  const estadoObsConfig = {
    pendiente: { label: 'Pendiente', color: 'text-mascotera-warning', bg: 'bg-mascotera-warning/20' },
    aprobada: { label: 'Aprobada', color: 'text-mascotera-success', bg: 'bg-mascotera-success/20' },
    desaprobada: { label: 'Desaprobada', color: 'text-mascotera-danger', bg: 'bg-mascotera-danger/20' }
  };

  // Sincronizar auditores con context al cambiar sucursal
  useEffect(() => {
    if (selectedSucursal) {
      const saved = getAuditoresSucursal(selectedSucursal);
      setAuditoresLocal(saved.length > 0 ? [...saved] : ['']);
    }
  }, [selectedSucursal]);

  const addAuditor = () => {
    const updated = [...auditoresLocal, ''];
    setAuditoresLocal(updated);
  };

  const removeAuditor = (idx) => {
    if (auditoresLocal.length <= 1) return;
    const updated = auditoresLocal.filter((_, i) => i !== idx);
    setAuditoresLocal(updated);
    if (selectedSucursal) updateAuditoresSucursal(selectedSucursal, updated.filter(a => a.trim()));
  };

  const updateAuditorName = (idx, value) => {
    const updated = [...auditoresLocal];
    updated[idx] = value;
    setAuditoresLocal(updated);
    if (selectedSucursal) updateAuditoresSucursal(selectedSucursal, updated.filter(a => a.trim()));
  };

  // Verificar si un pilar individual está completo (estado + criticidad definidos)
  const isPilarComplete = (pilarKey) => {
    const data = auditData[selectedSucursal]?.[pilarKey];
    return data && data.estado !== null && data.criticidad !== null;
  };

  // Verificar si todos los pilares tienen estado y criticidad definidos
  const allPilaresComplete = () => {
    if (!selectedSucursal || !auditData[selectedSucursal]) return false;
    const pilaresKeys = Object.keys(getPilares());
    return pilaresKeys.every(key => isPilarComplete(key));
  };

  // Calcular resumen para el informe
  const calcResumen = () => {
    const pilaresObj = getPilares();
    const pilaresKeys = Object.keys(pilaresObj);
    let aprobados = 0, noAprobados = 0, pendientes = 0;
    let sumaPonderacion = 0, countPonderacion = 0;

    pilaresKeys.forEach(key => {
      const data = auditData[selectedSucursal]?.[key];
      if (!data) { pendientes++; return; }
      if (data.estado === true) aprobados++;
      else if (data.estado === false) noAprobados++;
      else pendientes++;

      const pond = calcPonderacion(key, pilaresObj[key]);
      if (pond) {
        sumaPonderacion += parseFloat(pond.porcentaje);
        countPonderacion++;
      }
    });

    return {
      totalPilares: pilaresKeys.length,
      aprobados,
      noAprobados,
      pendientes,
      promedioPonderacion: countPonderacion > 0 ? (sumaPonderacion / countPonderacion).toFixed(1) : '0'
    };
  };

  // Abrir modal de selección de tipo de informe
  const handleAbrirTipoInforme = () => {
    const auditoresValidos = auditoresLocal.filter(a => a.trim());
    if (auditoresValidos.length === 0) {
      alert('Debe ingresar al menos un auditor antes de generar el informe.');
      return;
    }
    setTipoInformeModal(true);
    setTipoInformeSeleccionado(null);
  };

  // Generar informe snapshot con tipo seleccionado
  const handleGenerarInforme = async (tipoInforme) => {
    setTipoInformeModal(false);
    setGenerandoInforme(true);
    const pilaresData = auditData[selectedSucursal];
    const resumen = calcResumen();

    // Calcular puntajes individuales por pilar para persistir en DB
    const pilaresObj = getPilares();
    const pilarScores = {};
    Object.keys(pilaresObj).forEach(key => {
      const pond = calcPonderacion(key, pilaresObj[key]);
      pilarScores[key] = pond ? parseFloat(pond.porcentaje) : null;
    });

    try {
      const report = await generateReport(selectedSucursal, mesKey, pilaresData, resumen, pilarScores, tipoInforme);
      setGenerandoInforme(false);

      if (report) {
        const tipoLabel = tipoInforme === 'preliminar' ? 'Preliminar' : 'Final';
        const goToReport = confirm(`Informe ${tipoLabel} (${report.id}) generado exitosamente.\n\n¿Desea ir a Reportes para verlo?`);
        if (goToReport) {
          navigate('/reportes');
        }
      }
    } catch (err) {
      console.error('Error generando informe:', err);
      alert(err.message || 'Error al generar el informe.');
      setGenerandoInforme(false);
    }
  };

  // Calcular ponderación del pilar basada en pesos de los items
  const calcPonderacion = (pilarKey, pilar) => {
    const data = auditData[selectedSucursal]?.[pilarKey];
    if (!data) return null;

    const evaluados = pilar.items.filter((_, idx) => data.items[idx] !== null);
    if (evaluados.length === 0) return null;

    const pesoEvaluado = evaluados.reduce((sum, item, i) => {
      const realIdx = pilar.items.indexOf(item);
      return sum + item.peso;
    }, 0);

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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="title-yellow text-2xl">Auditoría de Pilares</h1>
          <p className="text-mascotera-text-muted mt-1">
            Realiza auditorías y registra hallazgos por nivel de criticidad
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-mascotera-card rounded-lg border border-mascotera-border">
            <User className="w-4 h-4 text-mascotera-accent" />
            <span className="text-sm text-mascotera-text font-medium">{userDisplayName}</span>
            {isAuditor && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-mascotera-accent/20 text-mascotera-accent">AUDITOR</span>
            )}
          </div>
        </div>
      </div>

      {/* Selector de Sucursal y Calendario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selector de Sucursal */}
        <div className="card-mascotera">
          <h3 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-mascotera-accent" />
            Seleccionar Sucursal
          </h3>
          <div className="relative">
            <select
              value={selectedSucursal || ''}
              onChange={(e) => setSelectedSucursal(e.target.value)}
              className="input-mascotera w-full appearance-none pr-10"
            >
              <option value="">Seleccione una sucursal...</option>
              {sucursales.map((sucursal) => (
                <option key={sucursal} value={sucursal}>
                  {sucursal}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-mascotera-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Selector de Mes */}
        <div className="card-mascotera">
          <h3 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-mascotera-accent" />
            Mes de Auditoría
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeMonth(-1)}
              className="p-3 hover:bg-mascotera-darker rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-mascotera-text">
                {monthNames[selectedDate.getMonth()]}
              </p>
              <p className="text-sm text-mascotera-text-muted mt-1">
                {selectedDate.getFullYear()}
              </p>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-3 hover:bg-mascotera-darker rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pilares de Auditoría */}
      {selectedSucursal && (
        <div className="space-y-6">
          {/* Estado de Informes del Período */}
          {(() => {
            const reportStatus = getReportTypesForSucursalMes(selectedSucursal, mesKey);
            const step = reportStatus.hasFinal ? 3 : reportStatus.hasPreliminar ? 2 : 1;
            return (
              <div className={`card-mascotera border-l-4 ${
                step === 3 ? 'border-l-mascotera-success' : step === 2 ? 'border-l-mascotera-accent' : 'border-l-mascotera-warning'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-mascotera-text uppercase tracking-wider">
                    Estado de Informes - {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                  </h3>
                  <span className="text-xs text-mascotera-text-muted">Máximo 2 informes por mes</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Step 1: Preliminar */}
                  <div className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                    step === 1
                      ? 'border-mascotera-warning bg-mascotera-warning/10'
                      : 'border-mascotera-success/50 bg-mascotera-success/5'
                  }`}>
                    <div className={`text-xs font-bold ${step === 1 ? 'text-mascotera-warning' : 'text-mascotera-success'}`}>
                      {step === 1 ? 'PENDIENTE' : 'ENVIADO'}
                    </div>
                    <div className="text-sm font-semibold text-mascotera-text mt-1">Informe Preliminar</div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className={`w-5 h-5 flex-shrink-0 ${step >= 2 ? 'text-mascotera-accent' : 'text-mascotera-text-muted'}`} />

                  {/* Step 2: Final */}
                  <div className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                    step === 3
                      ? 'border-mascotera-success/50 bg-mascotera-success/5'
                      : step === 2
                        ? 'border-mascotera-warning bg-mascotera-warning/10'
                        : 'border-mascotera-border bg-mascotera-darker/30'
                  }`}>
                    <div className={`text-xs font-bold ${
                      step === 3 ? 'text-mascotera-success' : step === 2 ? 'text-mascotera-warning' : 'text-mascotera-text-muted'
                    }`}>
                      {step === 3 ? 'ENVIADO' : step === 2 ? 'PENDIENTE' : 'BLOQUEADO'}
                    </div>
                    <div className={`text-sm font-semibold mt-1 ${step >= 2 ? 'text-mascotera-text' : 'text-mascotera-text-muted'}`}>Informe Final</div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className={`w-5 h-5 flex-shrink-0 ${step === 3 ? 'text-mascotera-success' : 'text-mascotera-text-muted'}`} />

                  {/* Step 3: Complete */}
                  <div className={`flex-1 p-3 rounded-lg border-2 text-center transition-all ${
                    step === 3
                      ? 'border-mascotera-success bg-mascotera-success/10'
                      : 'border-mascotera-border bg-mascotera-darker/30'
                  }`}>
                    <div className={`text-xs font-bold ${step === 3 ? 'text-mascotera-success' : 'text-mascotera-text-muted'}`}>
                      {step === 3 ? 'COMPLETO' : '-'}
                    </div>
                    <div className={`text-sm font-semibold mt-1 ${step === 3 ? 'text-mascotera-success' : 'text-mascotera-text-muted'}`}>Auditoría Cerrada</div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="card-mascotera">
            <h3 className="text-lg font-semibold text-mascotera-text mb-4">
              Auditoría de Pilares - {selectedSucursal}
            </h3>
            <p className="text-sm text-mascotera-text-muted">
              {selectedSucursal === 'DEPOSITO RUTA 9'
                ? 'Evalúa los 5 pilares específicos del depósito y asigna nivel de criticidad a los hallazgos'
                : 'Evalúa los 5 pilares tradicionales de la sucursal y asigna nivel de criticidad a los hallazgos'}
            </p>
          </div>

          {/* Card de Auditores (solo auditor) */}
          {isAuditor && (
          <div className="card-mascotera">
            <h3 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-mascotera-accent" />
              Auditores Participantes
            </h3>
            <div className="space-y-3">
              {auditoresLocal.map((auditor, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={auditor}
                    onChange={(e) => updateAuditorName(idx, e.target.value)}
                    placeholder={`Nombre del auditor ${idx + 1}...`}
                    className="input-mascotera flex-1"
                  />
                  {auditoresLocal.length > 1 && (
                    <button
                      onClick={() => removeAuditor(idx)}
                      className="p-2 text-mascotera-danger hover:bg-mascotera-danger/10 rounded-lg transition-colors"
                      title="Quitar auditor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addAuditor}
                className="flex items-center gap-2 text-sm text-mascotera-accent hover:text-mascotera-accent-light transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar otro auditor
              </button>
            </div>
          </div>
          )}

          {/* Progreso de Pilares */}
          {(() => {
            const pilaresKeys = Object.keys(pilares);
            const completados = pilaresKeys.filter(k => isPilarComplete(k)).length;
            const total = pilaresKeys.length;
            return (
              <div className="card-mascotera">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-mascotera-text">Progreso de evaluación</span>
                  <span className="text-sm font-bold text-mascotera-accent">{completados}/{total} pilares completos</span>
                </div>
                <div className="h-2.5 bg-mascotera-darker rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-mascotera-accent to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${total > 0 ? (completados / total) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-mascotera-text-muted mt-2">
                  Los datos se guardan automáticamente. Cada pilar requiere estado y criticidad para estar completo.
                </p>
              </div>
            );
          })()}

          {/* Lista de Pilares */}
          {Object.entries(pilares).map(([pilarKey, pilar]) => {
            const Icon = pilar.icon;
            const data = initPilarData(pilarKey);

            return (
              <div key={pilarKey} className="card-mascotera">
                {/* Header del Pilar */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-mascotera-border">
                  <div className={`p-3 rounded-lg ${pilar.bg}`}>
                    <Icon className={`w-6 h-6 ${pilar.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-mascotera-text">{pilar.nombre}</h4>
                    <p className="text-sm text-mascotera-text-muted mt-1">{pilar.items.length} items de verificación</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPilarComplete(pilarKey) ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-mascotera-success/20 text-mascotera-success">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Guardado
                      </span>
                    ) : data.estado !== null || data.criticidad !== null ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-mascotera-warning/20 text-mascotera-warning">
                        <Clock className="w-3.5 h-3.5" />
                        Incompleto
                      </span>
                    ) : null}
                    {data.tieneHallazgo && data.criticidad && (
                      <>
                        <AlertTriangle className={`w-5 h-5 ${criticidadConfig[data.criticidad].color}`} />
                        <span className={`text-sm font-semibold ${criticidadConfig[data.criticidad].color}`}>
                          Hallazgo {criticidadConfig[data.criticidad].label}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Secciones de auditoría (solo auditor) */}
                {isAuditor && (<>
                {/* Dato Anexo - Orden y Limpieza */}
                {pilarKey === 'ordenLimpieza' && (() => {
                  const tareasInfo = getTareasResumen();
                  const resumenOL = tareasInfo.ordenLimpieza;
                  const resumenMS = tareasInfo.mantenimiento;
                  const totalSolicitadas = (resumenOL ? parseInt(resumenOL.solicitadas) : 0) + (resumenMS ? parseInt(resumenMS.solicitadas) : 0);
                  const totalCompletadas = (resumenOL ? parseInt(resumenOL.completadas) : 0) + (resumenMS ? parseInt(resumenMS.completadas) : 0);
                  const totalPendientes = (resumenOL ? parseInt(resumenOL.pendientes) : 0) + (resumenMS ? parseInt(resumenMS.pendientes) : 0);
                  const pctTotal = totalSolicitadas > 0 ? ((totalCompletadas / totalSolicitadas) * 100).toFixed(1) : 0;
                  const tareasOL = tareasDetalle.filter(t => t.categoria === 'ORDEN Y LIMPIEZA');
                  const tareasMS = tareasDetalle.filter(t => t.categoria === 'MANTENIMIENTO SUCURSAL');

                  return (
                    <div className="mb-6 border-2 border-mascotera-accent/30 rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-mascotera-accent animate-pulse"></div>
                        <h5 className="text-sm font-bold text-mascotera-accent uppercase tracking-wider">
                          Dato Anexo - Mi Sucursal: Tareas
                        </h5>
                      </div>

                      {totalSolicitadas > 0 ? (
                        <>
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

                          {resumenOL && (
                            <div className="bg-mascotera-darker p-3 rounded-lg flex items-center justify-between">
                              <span className="text-sm font-semibold text-mascotera-text">Orden y Limpieza</span>
                              <span className="text-sm text-mascotera-accent font-bold">{resumenOL.completadas}/{resumenOL.solicitadas} ({resumenOL.porcentaje_completado}%)</span>
                            </div>
                          )}
                          {resumenMS && (
                            <div className="bg-mascotera-darker p-3 rounded-lg flex items-center justify-between">
                              <span className="text-sm font-semibold text-mascotera-text">Mantenimiento Sucursal</span>
                              <span className="text-sm text-mascotera-accent font-bold">{resumenMS.completadas}/{resumenMS.solicitadas} ({resumenMS.porcentaje_completado}%)</span>
                            </div>
                          )}

                          {loadingTareas ? (
                            <div className="text-center py-3">
                              <div className="w-5 h-5 border-2 border-mascotera-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                          ) : tareasDetalle.length > 0 && (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {tareasDetalle.map((tarea) => (
                                <div key={tarea.id} className="flex items-center justify-between p-2.5 bg-mascotera-darker rounded-lg">
                                  <div className="flex items-center gap-2">
                                    {tarea.estado === 'completada' ? (
                                      <CheckCircle2 className="w-4 h-4 text-mascotera-success flex-shrink-0" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-mascotera-warning flex-shrink-0" />
                                    )}
                                    <span className="text-mascotera-text text-xs">{tarea.titulo}</span>
                                    <span className="text-xs text-mascotera-text-muted">({tarea.categoria})</span>
                                  </div>
                                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${tarea.estado === 'completada' ? 'bg-mascotera-success/20 text-mascotera-success' : 'bg-mascotera-warning/20 text-mascotera-warning'}`}>
                                    {tarea.estado}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-mascotera-text-muted text-center py-3">No hay tareas registradas para este periodo</p>
                      )}
                    </div>
                  );
                })()}

                {/* Dato Anexo - Stock y Caja */}
                {pilarKey === 'stockCaja' && (() => {
                  const conteos = getConteos();
                  const totalConteos = conteos.reduce((sum, c) => sum + parseInt(c.total_conteos || 0), 0);
                  const netoDiferencia = conteos.reduce((sum, c) => sum + parseFloat(c.neto_diferencia || 0), 0);
                  const totalProductos = conteos.reduce((sum, c) => sum + parseInt(c.total_productos || 0), 0);
                  const productosContados = conteos.reduce((sum, c) => sum + parseInt(c.productos_contados || 0), 0);
                  const productosConDiferencia = conteos.reduce((sum, c) => sum + parseInt(c.productos_con_diferencia || 0), 0);
                  const pctContados = totalProductos > 0 ? ((productosContados / totalProductos) * 100).toFixed(1) : 0;

                  return (
                    <div className="mb-6 border-2 border-mascotera-accent/30 rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-mascotera-accent animate-pulse"></div>
                        <h5 className="text-sm font-bold text-mascotera-accent uppercase tracking-wider">
                          Dato Anexo - Mi Sucursal: Conteos de Stock
                        </h5>
                      </div>

                      {totalConteos > 0 ? (
                        <>
                          <div className={`flex items-center justify-between p-3 rounded-lg border ${Math.abs(netoDiferencia) < STOCK_THRESHOLD ? 'border-mascotera-success/50 bg-mascotera-success/10' : 'border-mascotera-danger/50 bg-mascotera-danger/10'}`}>
                            <span className="text-xs text-mascotera-text-muted">
                              Umbral auto-aprobación: <strong className="text-mascotera-text">${STOCK_THRESHOLD.toLocaleString('es-AR')}</strong>
                            </span>
                            <span className="text-xs">
                              Diferencia neta: <strong className="text-mascotera-text">${Math.abs(netoDiferencia).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
                              {' → '}
                              {Math.abs(netoDiferencia) < STOCK_THRESHOLD
                                ? <span className="font-bold text-mascotera-success">CUMPLE</span>
                                : <span className="font-bold text-mascotera-danger">NO CUMPLE</span>
                              }
                            </span>
                          </div>
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

                          <div className="bg-mascotera-darker p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-mascotera-text-muted">Neto ajustes de stock (valorizado)</span>
                              <span className={`text-2xl font-bold ${netoDiferencia === 0 ? 'text-mascotera-success' : netoDiferencia > 0 ? 'text-mascotera-warning' : 'text-mascotera-danger'}`}>
                                ${Math.abs(netoDiferencia).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                {netoDiferencia !== 0 && <span className="text-sm ml-1">({netoDiferencia > 0 ? 'sobrante' : 'faltante'})</span>}
                              </span>
                            </div>
                          </div>

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

                          {conteos.map((conteo, idx) => (
                            <div key={idx} className="bg-mascotera-darker p-3 rounded-lg flex items-center justify-between">
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
                          ))}
                        </>
                      ) : (
                        <p className="text-sm text-mascotera-text-muted text-center py-3">No hay conteos de stock registrados para este periodo</p>
                      )}
                    </div>
                  );
                })()}

                {/* Estado del Pilar */}
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-mascotera-text mb-3">Estado del Pilar</h5>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updatePilarEstado(pilarKey, true)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all font-semibold ${
                        data.estado === true
                          ? 'border-mascotera-success bg-mascotera-success/20 text-mascotera-success'
                          : 'border-mascotera-border bg-mascotera-darker text-mascotera-text-muted hover:border-mascotera-success/50'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                      APROBADO
                    </button>
                    <button
                      onClick={() => updatePilarEstado(pilarKey, false)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all font-semibold ${
                        data.estado === false
                          ? 'border-mascotera-danger bg-mascotera-danger/20 text-mascotera-danger'
                          : 'border-mascotera-border bg-mascotera-darker text-mascotera-text-muted hover:border-mascotera-danger/50'
                      }`}
                    >
                      <X className="w-5 h-5 mx-auto mb-1" />
                      NO APROBADO
                    </button>
                    <button
                      onClick={() => updatePilarEstado(pilarKey, null)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all font-semibold ${
                        data.estado === null
                          ? 'border-mascotera-warning bg-mascotera-warning/20 text-mascotera-warning'
                          : 'border-mascotera-border bg-mascotera-darker text-mascotera-text-muted hover:border-mascotera-warning/50'
                      }`}
                    >
                      <Clock className="w-5 h-5 mx-auto mb-1" />
                      PENDIENTE
                    </button>
                  </div>
                </div>

                {/* Nivel de Criticidad (OBLIGATORIO) */}
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-mascotera-text mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-mascotera-warning" />
                    Nivel de Criticidad del Pilar <span className="text-mascotera-danger">*</span>
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(criticidadConfig).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => updateCriticidad(pilarKey, key)}
                        className={`p-2 rounded-lg border-2 transition-all text-sm font-semibold ${
                          data.criticidad === key
                            ? `${config.border} ${config.bg} ${config.color}`
                            : 'border-mascotera-border bg-mascotera-darker text-mascotera-text-muted hover:border-mascotera-accent/50'
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                  {!data.criticidad && (
                    <p className="text-xs text-mascotera-danger mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Debe seleccionar un nivel de criticidad para este pilar
                    </p>
                  )}
                  {data.estado === false && data.criticidad && (
                    <p className="text-xs text-mascotera-text-muted mt-2">
                      Este pilar generará un hallazgo con nivel de criticidad: <span className={`font-semibold ${criticidadConfig[data.criticidad].color}`}>{criticidadConfig[data.criticidad].label}</span>
                    </p>
                  )}
                </div>

                {/* Items de Verificación */}
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-mascotera-text mb-3">Items de Verificación</h5>
                  <div className="space-y-2">
                    {pilar.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          data.items[idx] === true
                            ? 'border-mascotera-success/50 bg-mascotera-success/5'
                            : data.items[idx] === false
                              ? 'border-mascotera-danger/50 bg-mascotera-danger/5'
                              : 'border-mascotera-border bg-mascotera-darker/50'
                        }`}
                      >
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => setPilarItem(pilarKey, idx, true)}
                            className={`p-1.5 rounded-lg border-2 transition-all ${
                              data.items[idx] === true
                                ? 'border-mascotera-success bg-mascotera-success/20'
                                : 'border-mascotera-border hover:border-mascotera-success/50'
                            }`}
                            title="Cumple"
                          >
                            <CheckCircle2 className={`w-4 h-4 ${data.items[idx] === true ? 'text-mascotera-success' : 'text-mascotera-text-muted'}`} />
                          </button>
                          <button
                            onClick={() => setPilarItem(pilarKey, idx, false)}
                            className={`p-1.5 rounded-lg border-2 transition-all ${
                              data.items[idx] === false
                                ? 'border-mascotera-danger bg-mascotera-danger/20'
                                : 'border-mascotera-border hover:border-mascotera-danger/50'
                            }`}
                            title="No cumple"
                          >
                            <XCircle className={`w-4 h-4 ${data.items[idx] === false ? 'text-mascotera-danger' : 'text-mascotera-text-muted'}`} />
                          </button>
                        </div>
                        <span className={`flex-1 text-sm ${
                          data.items[idx] === true
                            ? 'text-mascotera-text'
                            : data.items[idx] === false
                              ? 'text-mascotera-danger'
                              : 'text-mascotera-text-muted'
                        }`}>
                          {item.text}
                        </span>
                        {data.items[idx] === true && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-mascotera-success/20 text-mascotera-success">CUMPLE</span>
                        )}
                        {data.items[idx] === false && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-mascotera-danger/20 text-mascotera-danger">NO CUMPLE</span>
                        )}
                        {autoEvaluatedItems[`${pilarKey}-${idx}`] && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-mascotera-accent/20 text-mascotera-accent ml-1" title="Evaluado automáticamente desde datos de conteos de stock">
                            AUTO
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ponderación del Pilar */}
                {(() => {
                  const pond = calcPonderacion(pilarKey, pilar);
                  if (!pond) return null;
                  const pct = parseFloat(pond.porcentaje);
                  const allDone = pond.evaluados === pond.total;
                  const is50 = allDone && pct === 50;
                  const prevEstado = is50 ? getPreviousMonthEstado(selectedSucursal, pilarKey) : null;
                  return (
                    <div className={`mb-6 border-2 rounded-lg p-4 ${
                      allDone
                        ? (data.estado === true ? 'border-mascotera-success/50' : 'border-mascotera-danger/50')
                        : 'border-mascotera-accent/30'
                    }`}>
                      <h5 className="text-sm font-semibold text-mascotera-text mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-mascotera-accent" />
                        Ponderación del Pilar
                        <span className="text-xs text-mascotera-text-muted font-normal">({pond.evaluados}/{pond.total} items evaluados)</span>
                      </h5>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="h-4 bg-mascotera-darker rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                pct >= 80 ? 'bg-gradient-to-r from-mascotera-success to-green-400'
                                  : pct >= 50 ? 'bg-gradient-to-r from-mascotera-warning to-yellow-400'
                                    : 'bg-gradient-to-r from-mascotera-danger to-red-400'
                              }`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className={`text-2xl font-bold min-w-[80px] text-right ${
                          pct >= 80 ? 'text-mascotera-success'
                            : pct >= 50 ? 'text-mascotera-warning'
                              : 'text-mascotera-danger'
                        }`}>
                          {pond.porcentaje}%
                        </span>
                      </div>
                      {pond.evaluados < pond.total && (
                        <p className="text-xs text-mascotera-text-muted mt-2">
                          Faltan evaluar {pond.total - pond.evaluados} item(s) para completar la ponderación
                        </p>
                      )}
                      {allDone && (
                        <div className={`mt-3 p-3 rounded-lg ${data.estado === true ? 'bg-mascotera-success/10' : 'bg-mascotera-danger/10'}`}>
                          <div className="flex items-center gap-2">
                            {data.estado === true ? (
                              <CheckCircle2 className="w-5 h-5 text-mascotera-success" />
                            ) : (
                              <XCircle className="w-5 h-5 text-mascotera-danger" />
                            )}
                            <span className={`text-sm font-bold ${data.estado === true ? 'text-mascotera-success' : 'text-mascotera-danger'}`}>
                              Resultado: {data.estado === true ? 'APROBADO' : 'NO APROBADO'}
                            </span>
                          </div>
                          <p className="text-xs text-mascotera-text-muted mt-1">
                            {pct > 50
                              ? 'Ponderación superior al 50% - Pilar aprobado automáticamente'
                              : pct < 50
                                ? 'Ponderación inferior al 50% - Pilar no aprobado automáticamente'
                                : is50 && prevEstado === true
                                  ? 'Ponderación exacta del 50% - Aprobado por historial favorable en meses anteriores'
                                  : is50 && prevEstado === false
                                    ? 'Ponderación exacta del 50% - No aprobado por historial desfavorable en meses anteriores'
                                    : 'Ponderación exacta del 50% - No aprobado por no contar con historial previo favorable'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Adjuntar Imágenes */}
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-mascotera-text mb-3">Evidencia Fotográfica</h5>
                  <div className="space-y-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageSelect(pilarKey, e)}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-mascotera-border hover:border-mascotera-accent rounded-lg p-4 transition-colors flex items-center justify-center gap-2">
                        <Upload className="w-5 h-5 text-mascotera-text-muted" />
                        <span className="text-sm text-mascotera-text">
                          <span className="text-mascotera-accent font-semibold">Haz clic para subir</span> imágenes
                        </span>
                      </div>
                    </label>

                    {data.imagenes.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {data.imagenes.map((imagen, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={imagen.preview}
                              alt={imagen.name}
                              className="w-full h-24 object-cover rounded-lg border border-mascotera-border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(pilarKey, idx)}
                              className="absolute top-1 right-1 p-1 bg-mascotera-danger rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                </>)}

                {/* Notas del Auditor */}
                {isAuditor && (
                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-mascotera-text mb-3">Notas del Auditor</h5>
                    <textarea
                      value={data.observaciones}
                      onChange={(e) => updateObservaciones(pilarKey, e.target.value)}
                      placeholder="Notas internas del auditor..."
                      rows={3}
                      className="input-mascotera w-full resize-none"
                    />
                  </div>
                )}

                {/* Observaciones Colaborativas */}
                <div className="border-2 border-mascotera-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleObsExpanded(pilarKey)}
                    className="w-full flex items-center justify-between p-4 bg-mascotera-darker/50 hover:bg-mascotera-darker transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-mascotera-accent" />
                      <h5 className="text-sm font-semibold text-mascotera-text">Observaciones</h5>
                      {getObservacionesPilar(pilarKey).length > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-mascotera-accent/20 text-mascotera-accent">
                          {getObservacionesPilar(pilarKey).length}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-mascotera-text-muted transition-transform ${obsExpandedPilars[pilarKey] ? 'rotate-180' : ''}`} />
                  </button>

                  {obsExpandedPilars[pilarKey] && (
                    <div className="p-4 space-y-4">
                      {/* Formulario nueva observación */}
                      <div className="bg-mascotera-darker/30 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-mascotera-accent" />
                          <span className="text-xs font-semibold text-mascotera-text">{userDisplayName}</span>
                          <span className="text-xs text-mascotera-text-muted">- Nueva observación</span>
                        </div>
                        <textarea
                          value={obsTexto[pilarKey] || ''}
                          onChange={(e) => setObsTexto(prev => ({ ...prev, [pilarKey]: e.target.value }))}
                          placeholder="Escribe tu observación..."
                          rows={2}
                          className="input-mascotera w-full resize-none text-sm"
                        />

                        {/* Criticidad de la observación */}
                        <div>
                          <label className="text-xs text-mascotera-text-muted mb-1 block">Nivel de criticidad:</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {Object.entries(criticidadConfig).map(([key, config]) => (
                              <button
                                key={key}
                                onClick={() => setObsCriticidad(prev => ({ ...prev, [pilarKey]: key }))}
                                className={`p-1.5 rounded border text-xs font-semibold transition-all ${
                                  (obsCriticidad[pilarKey] || 'media') === key
                                    ? `${config.border} ${config.bg} ${config.color}`
                                    : 'border-mascotera-border bg-mascotera-darker text-mascotera-text-muted'
                                }`}
                              >
                                {config.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Imágenes opcionales */}
                        <div>
                          <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-mascotera-accent hover:text-mascotera-accent-light transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleObsImageSelect(pilarKey, e)}
                              className="hidden"
                            />
                            <Image className="w-3.5 h-3.5" />
                            Adjuntar imágenes (opcional)
                          </label>
                          {(obsImagePreviews[pilarKey] || []).length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {obsImagePreviews[pilarKey].map((preview, idx) => (
                                <div key={idx} className="relative group">
                                  <img src={preview} alt="" className="w-16 h-16 object-cover rounded border border-mascotera-border" />
                                  <button
                                    onClick={() => handleObsImageRemove(pilarKey, idx)}
                                    className="absolute -top-1 -right-1 p-0.5 bg-mascotera-danger rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-2.5 h-2.5 text-white" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Botón enviar */}
                        <button
                          onClick={() => handleEnviarObservacion(pilarKey)}
                          disabled={!(obsTexto[pilarKey]?.trim()) || obsSending[pilarKey]}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            obsTexto[pilarKey]?.trim() && !obsSending[pilarKey]
                              ? 'bg-mascotera-accent text-mascotera-darker hover:bg-mascotera-accent-light'
                              : 'bg-mascotera-border text-mascotera-text-muted cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-4 h-4" />
                          {obsSending[pilarKey] ? 'Enviando...' : 'Enviar Observación'}
                        </button>
                      </div>

                      {/* Lista de observaciones existentes */}
                      {getObservacionesPilar(pilarKey).length > 0 ? (
                        <div className="space-y-3">
                          {getObservacionesPilar(pilarKey).map(obs => {
                            const estadoConf = estadoObsConfig[obs.estado] || estadoObsConfig.pendiente;
                            const obsImages = obs.imagenes || [];
                            return (
                              <div key={obs.id} className={`rounded-lg border p-4 ${
                                obs.estado === 'aprobada' ? 'border-mascotera-success/30 bg-mascotera-success/5' :
                                obs.estado === 'desaprobada' ? 'border-mascotera-danger/30 bg-mascotera-danger/5' :
                                'border-mascotera-border bg-mascotera-darker/30'
                              }`}>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-mascotera-accent" />
                                    <span className="text-sm font-semibold text-mascotera-text">{obs.creado_por}</span>
                                    <span className="text-[10px] text-mascotera-text-muted">
                                      {new Date(obs.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${criticidadConfig[obs.criticidad]?.bg || 'bg-mascotera-warning/20'} ${criticidadConfig[obs.criticidad]?.color || 'text-mascotera-warning'}`}>
                                      {criticidadConfig[obs.criticidad]?.label || obs.criticidad}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${estadoConf.bg} ${estadoConf.color}`}>
                                      {estadoConf.label}
                                    </span>
                                  </div>
                                </div>

                                {/* Texto */}
                                <p className="text-sm text-mascotera-text mb-2">{obs.texto}</p>

                                {/* Imágenes adjuntas */}
                                {obsImages.length > 0 && (
                                  <div className="flex gap-2 mb-3 flex-wrap">
                                    {obsImages.map((img, imgIdx) => (
                                      <a key={imgIdx} href={img.url} target="_blank" rel="noopener noreferrer">
                                        <img
                                          src={img.url}
                                          alt={img.originalname || `Imagen ${imgIdx + 1}`}
                                          className="w-20 h-20 object-cover rounded border border-mascotera-border hover:border-mascotera-accent transition-colors"
                                        />
                                      </a>
                                    ))}
                                  </div>
                                )}

                                {/* Comentario del auditor */}
                                {obs.comentario_auditor && (
                                  <div className="bg-mascotera-darker/50 rounded p-2 mb-2">
                                    <p className="text-[10px] font-bold text-mascotera-accent mb-0.5">Comentario del Auditor:</p>
                                    <p className="text-xs text-mascotera-text">{obs.comentario_auditor}</p>
                                  </div>
                                )}

                                {/* Controles del auditor */}
                                {isAuditor && obs.estado === 'pendiente' && (
                                  <div className="mt-3 pt-3 border-t border-mascotera-border/50 space-y-2">
                                    <input
                                      type="text"
                                      value={obsComentarioAuditor[obs.id] || ''}
                                      onChange={(e) => setObsComentarioAuditor(prev => ({ ...prev, [obs.id]: e.target.value }))}
                                      placeholder="Comentario del auditor (opcional)..."
                                      className="input-mascotera w-full text-xs"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleObsEstado(obs.id, 'aprobada', pilarKey)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-mascotera-success/20 text-mascotera-success hover:bg-mascotera-success/30 border border-mascotera-success/30 transition-all"
                                      >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        Aprobar
                                      </button>
                                      <button
                                        onClick={() => handleObsEstado(obs.id, 'desaprobada', pilarKey)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-mascotera-danger/20 text-mascotera-danger hover:bg-mascotera-danger/30 border border-mascotera-danger/30 transition-all"
                                      >
                                        <ThumbsDown className="w-3.5 h-3.5" />
                                        Desaprobar
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Eliminar (solo el creador o auditor) */}
                                {(isAuditor || obs.creado_por === userDisplayName) && (
                                  <div className="mt-2 flex justify-end">
                                    <button
                                      onClick={() => {
                                        if (confirm('¿Eliminar esta observación?')) {
                                          deleteObservacion(obs.id);
                                        }
                                      }}
                                      className="text-[10px] text-mascotera-text-muted hover:text-mascotera-danger transition-colors flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <MessageSquare className="w-6 h-6 text-mascotera-text-muted mx-auto mb-1 opacity-40" />
                          <p className="text-xs text-mascotera-text-muted">No hay observaciones para este pilar</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Botón Generar Informe (solo auditor) */}
          {isAuditor && allPilaresComplete() && (() => {
            const reportStatus = getReportTypesForSucursalMes(selectedSucursal, mesKey);
            const canGenerate = reportStatus.count < 2;
            return (
            <div className={`card-mascotera ${canGenerate ? 'border-mascotera-success/50 bg-mascotera-success/5' : 'border-mascotera-warning/50 bg-mascotera-warning/5'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${canGenerate ? 'bg-mascotera-success/20' : 'bg-mascotera-warning/20'}`}>
                  <FileCheck className={`w-8 h-8 ${canGenerate ? 'text-mascotera-success' : 'text-mascotera-warning'}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${canGenerate ? 'text-mascotera-success' : 'text-mascotera-warning'}`}>
                    {canGenerate ? 'Auditoría Completa' : 'Límite de Informes Alcanzado'}
                  </h3>
                  <p className="text-sm text-mascotera-text-muted mt-1">
                    {canGenerate
                      ? `Todos los pilares han sido evaluados. Puede generar el informe ${!reportStatus.hasPreliminar ? 'preliminar' : 'final'}.`
                      : 'Ya se generaron los 2 informes permitidos para este período (preliminar y final).'
                    }
                  </p>
                  {reportStatus.count > 0 && (
                    <div className="flex gap-2 mt-2">
                      {reportStatus.hasPreliminar && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-mascotera-info/20 text-mascotera-info">Preliminar generado</span>
                      )}
                      {reportStatus.hasFinal && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-mascotera-accent/20 text-mascotera-accent">Final generado</span>
                      )}
                    </div>
                  )}
                </div>
                {canGenerate && (
                  <button
                    onClick={handleAbrirTipoInforme}
                    disabled={generandoInforme}
                    className={`btn-primary flex items-center gap-2 ${generandoInforme ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <FileCheck className="w-5 h-5" />
                    {generandoInforme ? 'Generando...' : 'Generar Informe'}
                  </button>
                )}
              </div>
            </div>
            );
          })()}
        </div>
      )}

      {/* Empty State */}
      {!selectedSucursal && (
        <div className="card-mascotera h-96 flex items-center justify-center">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-mascotera-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-mascotera-text mb-2">
              Selecciona una Sucursal
            </h3>
            <p className="text-mascotera-text-muted max-w-sm">
              Elige una sucursal del menú desplegable para comenzar la auditoría de pilares
            </p>
          </div>
        </div>
      )}

      {/* Modal Selección Tipo de Informe */}
      {tipoInformeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-mascotera-card rounded-xl max-w-md w-full border border-mascotera-border shadow-2xl">
            <div className="p-6 border-b border-mascotera-border">
              <h2 className="text-xl font-bold text-mascotera-text">Seleccionar Tipo de Informe</h2>
              <p className="text-sm text-mascotera-text-muted mt-1">
                Se permiten 2 informes por mes: uno preliminar y uno final.
              </p>
            </div>
            <div className="p-6 space-y-3">
              {(() => {
                const reportStatus = getReportTypesForSucursalMes(selectedSucursal, mesKey);
                return (
                  <>
                    <button
                      onClick={() => setTipoInformeSeleccionado('preliminar')}
                      disabled={reportStatus.hasPreliminar}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        reportStatus.hasPreliminar
                          ? 'border-mascotera-border bg-mascotera-darker/30 opacity-50 cursor-not-allowed'
                          : tipoInformeSeleccionado === 'preliminar'
                            ? 'border-mascotera-info bg-mascotera-info/10'
                            : 'border-mascotera-border bg-mascotera-darker hover:border-mascotera-info/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold ${reportStatus.hasPreliminar ? 'text-mascotera-text-muted' : 'text-mascotera-text'}`}>
                            Informe Preliminar
                          </h4>
                          <p className="text-xs text-mascotera-text-muted mt-1">
                            {reportStatus.hasPreliminar
                              ? 'Ya fue generado para este período'
                              : 'Primera evaluación del período - puede ser seguido por el informe final'
                            }
                          </p>
                        </div>
                        {reportStatus.hasPreliminar && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-mascotera-info/20 text-mascotera-info">Generado</span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => setTipoInformeSeleccionado('final')}
                      disabled={reportStatus.hasFinal}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        reportStatus.hasFinal
                          ? 'border-mascotera-border bg-mascotera-darker/30 opacity-50 cursor-not-allowed'
                          : tipoInformeSeleccionado === 'final'
                            ? 'border-mascotera-accent bg-mascotera-accent/10'
                            : 'border-mascotera-border bg-mascotera-darker hover:border-mascotera-accent/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold ${reportStatus.hasFinal ? 'text-mascotera-text-muted' : 'text-mascotera-text'}`}>
                            Informe Final
                          </h4>
                          <p className="text-xs text-mascotera-text-muted mt-1">
                            {reportStatus.hasFinal
                              ? 'Ya fue generado para este período'
                              : 'Evaluación definitiva del período - cierre de la auditoría mensual'
                            }
                          </p>
                        </div>
                        {reportStatus.hasFinal && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-mascotera-accent/20 text-mascotera-accent">Generado</span>
                        )}
                      </div>
                    </button>
                  </>
                );
              })()}
            </div>
            <div className="p-6 border-t border-mascotera-border flex items-center justify-end gap-3">
              <button
                onClick={() => setTipoInformeModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => tipoInformeSeleccionado && handleGenerarInforme(tipoInformeSeleccionado)}
                disabled={!tipoInformeSeleccionado}
                className={`btn-primary flex items-center gap-2 ${!tipoInformeSeleccionado ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FileCheck className="w-5 h-5" />
                Generar Informe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checklist;
