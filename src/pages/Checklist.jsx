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
  Download,
  Check,
  ChevronDown,
  Calendar as CalendarIcon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Users,
  Plus,
  Trash2,
  FileCheck
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import { useNavigate } from 'react-router-dom';

const Checklist = () => {
  const { auditData, setAuditData, sucursalesNombres, sucursalesDB, tareasResumen, conteosStock, fetchTareasResumen, fetchTareasSucursal, fetchConteosStock, updateAuditoresSucursal, getAuditoresSucursal, generateReport } = useAudit();
  const navigate = useNavigate();
  const [tareasDetalle, setTareasDetalle] = useState([]);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [auditoresLocal, setAuditoresLocal] = useState(['']);
  const [generandoInforme, setGenerandoInforme] = useState(false);

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
        criticidad: 'media', // baja, media, alta, critica
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

  // Exportar informe
  const exportarInforme = () => {
    if (!selectedSucursal || !auditData[selectedSucursal]) {
      alert('No hay datos de auditoría para exportar');
      return;
    }

    const pilares = getPilares();
    const data = auditData[selectedSucursal];

    let informe = `INFORME DE AUDITORÍA\n`;
    informe += `Sucursal: ${selectedSucursal}\n`;
    informe += `Fecha: ${selectedDate.toLocaleDateString()}\n`;
    informe += `\n${'='.repeat(50)}\n\n`;

    Object.entries(pilares).forEach(([key, pilar]) => {
      const pilarData = data[key];
      if (!pilarData) return;

      informe += `${pilar.nombre}\n`;
      informe += `-`.repeat(50) + '\n';
      informe += `Estado: ${pilarData.estado === null ? 'PENDIENTE' : (pilarData.estado ? 'APROBADO' : 'NO APROBADO')}\n`;

      if (pilarData.tieneHallazgo) {
        informe += `Criticidad: ${pilarData.criticidad.toUpperCase()}\n`;
      }

      informe += `\nItems de verificación:\n`;
      pilar.items.forEach((item, idx) => {
        const estado = pilarData.items[idx];
        informe += `${estado === true ? '[✓]' : estado === false ? '[✗]' : '[ ]'} ${item.text}\n`;
      });

      // Ponderación ponderada
      const pond = calcPonderacion(key, pilar);
      if (pond) {
        informe += `\nPonderación del Pilar: ${pond.porcentaje}% (${pond.evaluados}/${pond.total} items evaluados)\n`;
      }

      if (pilarData.observaciones) {
        informe += `\nObservaciones: ${pilarData.observaciones}\n`;
      }

      if (pilarData.imagenes.length > 0) {
        informe += `\nImágenes adjuntas: ${pilarData.imagenes.length}\n`;
      }

      informe += '\n' + '='.repeat(50) + '\n\n';
    });

    // Crear y descargar archivo
    const blob = new Blob([informe], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Auditoria_${selectedSucursal}_${selectedDate.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  // Verificar si todos los pilares tienen estado definido (no null)
  const allPilaresComplete = () => {
    if (!selectedSucursal || !auditData[selectedSucursal]) return false;
    const pilaresKeys = Object.keys(getPilares());
    return pilaresKeys.every(key => {
      const data = auditData[selectedSucursal]?.[key];
      return data && data.estado !== null;
    });
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

  // Generar informe snapshot
  const handleGenerarInforme = () => {
    const auditoresValidos = auditoresLocal.filter(a => a.trim());
    if (auditoresValidos.length === 0) {
      alert('Debe ingresar al menos un auditor antes de generar el informe.');
      return;
    }

    setGenerandoInforme(true);
    const pilaresData = auditData[selectedSucursal];
    const resumen = calcResumen();
    const report = generateReport(selectedSucursal, mesKey, pilaresData, resumen);
    setGenerandoInforme(false);

    if (report) {
      const goToReport = confirm(`Informe ${report.id} generado exitosamente.\n\n¿Desea ir a Reportes para verlo?`);
      if (goToReport) {
        navigate('/reportes');
      }
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
        {selectedSucursal && (
          <button
            onClick={exportarInforme}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Exportar TXT
          </button>
        )}
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

          {/* Card de Auditores */}
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
                  {data.tieneHallazgo && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-5 h-5 ${criticidadConfig[data.criticidad].color}`} />
                      <span className={`text-sm font-semibold ${criticidadConfig[data.criticidad].color}`}>
                        Hallazgo {criticidadConfig[data.criticidad].label}
                      </span>
                    </div>
                  )}
                </div>

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

                {/* Nivel de Criticidad */}
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-mascotera-text mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-mascotera-warning" />
                    Nivel de Criticidad del Pilar
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
                  {data.estado === false && (
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

                {/* Observaciones */}
                <div>
                  <h5 className="text-sm font-semibold text-mascotera-text mb-3">Observaciones</h5>
                  <textarea
                    value={data.observaciones}
                    onChange={(e) => updateObservaciones(pilarKey, e.target.value)}
                    placeholder="Agrega observaciones o comentarios adicionales..."
                    rows={3}
                    className="input-mascotera w-full resize-none"
                  />
                </div>
              </div>
            );
          })}

          {/* Botón Generar Informe */}
          {allPilaresComplete() && (
            <div className="card-mascotera border-mascotera-success/50 bg-mascotera-success/5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-mascotera-success/20">
                  <FileCheck className="w-8 h-8 text-mascotera-success" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-mascotera-success">Auditoría Completa</h3>
                  <p className="text-sm text-mascotera-text-muted mt-1">
                    Todos los pilares han sido evaluados. Puede generar el informe oficial de auditoría.
                  </p>
                </div>
                <button
                  onClick={handleGenerarInforme}
                  disabled={generandoInforme}
                  className={`btn-primary flex items-center gap-2 ${generandoInforme ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FileCheck className="w-5 h-5" />
                  {generandoInforme ? 'Generando...' : 'Generar Informe'}
                </button>
              </div>
            </div>
          )}
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
    </div>
  );
};

export default Checklist;
