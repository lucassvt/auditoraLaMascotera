import React, { useState } from 'react';
import {
  Download,
  Filter,
  Calendar,
  X,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  MessageSquare
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';
import DescargosSection from '../components/DescargosSection';

const Auditorias = () => {
  const { sucursalesNombres, sucursalesDB, tareasResumen, conteosStock, fetchTareasResumen, fetchTareasSucursal, fetchConteosStock } = useAudit();
  const [selectedPilarDetail, setSelectedPilarDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('auditorias');
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

  // Datos mock que simulan la integración con "Mi Sucursal -> Tareas" y "Finanzas"
  const datosIntegracion = {
    'ARENALES': {
      ordenLimpieza: {
        origen: ['Mi Sucursal -> Tareas -> Orden y limpieza', 'Mi Sucursal -> Tareas -> Mantenimiento sucursal'],
        tareasOrdenLimpieza: {
          solicitadas: 5,
          realizadas: 5,
          tareas: [
            { id: 1, titulo: 'Limpieza de vitrinas', realizada: true, tieneImagen: true },
            { id: 2, titulo: 'Orden en depósito', realizada: true, tieneImagen: true },
            { id: 3, titulo: 'Limpieza de pisos', realizada: true, tieneImagen: false },
            { id: 4, titulo: 'Organización de estantes', realizada: true, tieneImagen: true },
            { id: 5, titulo: 'Limpieza de baños', realizada: true, tieneImagen: false }
          ]
        },
        tareasMantenimiento: {
          solicitadas: 3,
          realizadas: 3,
          tareas: [
            { id: 1, titulo: 'Reparación de puerta', realizada: true, tieneImagen: true },
            { id: 2, titulo: 'Mantenimiento de aire acondicionado', realizada: true, tieneImagen: false },
            { id: 3, titulo: 'Pintura de fachada', realizada: true, tieneImagen: true }
          ]
        },
        decision: true,
        observaciones: 'Todas las tareas completadas satisfactoriamente'
      },
      stockCaja: {
        desviacionesStock: {
          origen: 'Mi Sucursal -> Tareas -> Control y gestión de stock',
          valorizado: 1250,
          permitido: 5000,
          porcentaje: 0.8,
          cumple: true,
          detalle: 'Desviación dentro del rango permitido'
        },
        arqueoCaja: {
          origen: 'Finanzas -> Arqueos y conciliaciones',
          diferencia: 150,
          permitido: 500,
          porcentaje: 0.3,
          cumple: true,
          detalle: 'Arqueo diario realizado correctamente'
        },
        decision: true
      }
    },
    'BELGRANO SUR': {
      ordenLimpieza: {
        origen: ['Mi Sucursal -> Tareas -> Orden y limpieza', 'Mi Sucursal -> Tareas -> Mantenimiento sucursal'],
        tareasOrdenLimpieza: {
          solicitadas: 6,
          realizadas: 3,
          tareas: [
            { id: 1, titulo: 'Limpieza de vitrinas', realizada: true, tieneImagen: true },
            { id: 2, titulo: 'Orden en depósito', realizada: false, tieneImagen: false },
            { id: 3, titulo: 'Limpieza de pisos', realizada: true, tieneImagen: false },
            { id: 4, titulo: 'Organización de estantes', realizada: false, tieneImagen: false },
            { id: 5, titulo: 'Limpieza de baños', realizada: false, tieneImagen: false },
            { id: 6, titulo: 'Limpieza de entrada', realizada: true, tieneImagen: true }
          ]
        },
        tareasMantenimiento: {
          solicitadas: 2,
          realizadas: 0,
          tareas: [
            { id: 1, titulo: 'Reparación de luminarias', realizada: false, tieneImagen: false },
            { id: 2, titulo: 'Mantenimiento de heladera', realizada: false, tieneImagen: false }
          ]
        },
        decision: false,
        observaciones: 'Múltiples tareas pendientes de completar. No cumple con el estándar.'
      },
      stockCaja: {
        desviacionesStock: {
          origen: 'Mi Sucursal -> Tareas -> Control y gestión de stock',
          valorizado: 8500,
          permitido: 5000,
          porcentaje: 1.7,
          cumple: false,
          detalle: 'Desviación excede el límite permitido'
        },
        arqueoCaja: {
          origen: 'Finanzas -> Arqueos y conciliaciones',
          diferencia: 200,
          permitido: 500,
          porcentaje: 0.4,
          cumple: true,
          detalle: 'Arqueo dentro del rango'
        },
        decision: false
      }
    },
    'CATAMARCA': {
      ordenLimpieza: {
        origen: ['Mi Sucursal -> Tareas -> Orden y limpieza', 'Mi Sucursal -> Tareas -> Mantenimiento sucursal'],
        tareasOrdenLimpieza: {
          solicitadas: 4,
          realizadas: 4,
          tareas: [
            { id: 1, titulo: 'Limpieza general', realizada: true, tieneImagen: true },
            { id: 2, titulo: 'Orden en góndolas', realizada: true, tieneImagen: true },
            { id: 3, titulo: 'Limpieza de vidrios', realizada: true, tieneImagen: false },
            { id: 4, titulo: 'Desinfección de áreas', realizada: true, tieneImagen: true }
          ]
        },
        tareasMantenimiento: {
          solicitadas: 2,
          realizadas: 2,
          tareas: [
            { id: 1, titulo: 'Mantenimiento preventivo', realizada: true, tieneImagen: false },
            { id: 2, titulo: 'Reparación de estantes', realizada: true, tieneImagen: true }
          ]
        },
        decision: true,
        observaciones: 'Excelente cumplimiento de todas las tareas'
      },
      stockCaja: {
        desviacionesStock: {
          origen: 'Mi Sucursal -> Tareas -> Control y gestión de stock',
          valorizado: 850,
          permitido: 5000,
          porcentaje: 0.17,
          cumple: true,
          detalle: 'Control de stock óptimo'
        },
        arqueoCaja: {
          origen: 'Finanzas -> Arqueos y conciliaciones',
          diferencia: 50,
          permitido: 500,
          porcentaje: 0.1,
          cumple: true,
          detalle: 'Arqueo perfecto'
        },
        decision: true
      }
    },
    'LEGUIZAMON': {
      ordenLimpieza: {
        origen: ['Mi Sucursal -> Tareas -> Orden y limpieza', 'Mi Sucursal -> Tareas -> Mantenimiento sucursal'],
        tareasOrdenLimpieza: {
          solicitadas: 5,
          realizadas: 5,
          tareas: [
            { id: 1, titulo: 'Limpieza completa', realizada: true, tieneImagen: true },
            { id: 2, titulo: 'Orden general', realizada: true, tieneImagen: true },
            { id: 3, titulo: 'Mantenimiento de áreas comunes', realizada: true, tieneImagen: true },
            { id: 4, titulo: 'Limpieza profunda', realizada: true, tieneImagen: false },
            { id: 5, titulo: 'Organización de productos', realizada: true, tieneImagen: true }
          ]
        },
        tareasMantenimiento: {
          solicitadas: 1,
          realizadas: 1,
          tareas: [
            { id: 1, titulo: 'Mantenimiento general', realizada: true, tieneImagen: true }
          ]
        },
        decision: true,
        observaciones: 'Cumplimiento perfecto de todas las actividades'
      },
      stockCaja: {
        desviacionesStock: {
          origen: 'Mi Sucursal -> Tareas -> Control y gestión de stock',
          valorizado: 450,
          permitido: 5000,
          porcentaje: 0.09,
          cumple: true,
          detalle: 'Gestión de stock excelente'
        },
        arqueoCaja: {
          origen: 'Finanzas -> Arqueos y conciliaciones',
          diferencia: 0,
          permitido: 500,
          porcentaje: 0,
          cumple: true,
          detalle: 'Sin diferencias'
        },
        decision: true
      }
    },
    'CONGRESO': {
      ordenLimpieza: {
        origen: ['Mi Sucursal -> Tareas -> Orden y limpieza', 'Mi Sucursal -> Tareas -> Mantenimiento sucursal'],
        tareasOrdenLimpieza: {
          solicitadas: 4,
          realizadas: 4,
          tareas: [
            { id: 1, titulo: 'Limpieza diaria', realizada: true, tieneImagen: true },
            { id: 2, titulo: 'Orden de mercadería', realizada: true, tieneImagen: false },
            { id: 3, titulo: 'Limpieza de depósito', realizada: true, tieneImagen: true },
            { id: 4, titulo: 'Mantenimiento de exhibidores', realizada: true, tieneImagen: false }
          ]
        },
        tareasMantenimiento: {
          solicitadas: 2,
          realizadas: 2,
          tareas: [
            { id: 1, titulo: 'Reparación menor', realizada: true, tieneImagen: true },
            { id: 2, titulo: 'Mantenimiento de equipos', realizada: true, tieneImagen: false }
          ]
        },
        decision: true,
        observaciones: 'Todo en orden'
      },
      stockCaja: {
        desviacionesStock: {
          origen: 'Mi Sucursal -> Tareas -> Control y gestión de stock',
          valorizado: 3200,
          permitido: 5000,
          porcentaje: 0.64,
          cumple: true,
          detalle: 'Control adecuado'
        },
        arqueoCaja: {
          origen: 'Finanzas -> Arqueos y conciliaciones',
          diferencia: 650,
          permitido: 500,
          porcentaje: 1.3,
          cumple: false,
          detalle: 'Diferencia supera el límite permitido'
        },
        decision: false
      }
    },
    'LAPRIDA': {
      ordenLimpieza: {
        origen: ['Mi Sucursal -> Tareas -> Orden y limpieza', 'Mi Sucursal -> Tareas -> Mantenimiento sucursal'],
        tareasOrdenLimpieza: {
          solicitadas: 7,
          realizadas: 2,
          tareas: [
            { id: 1, titulo: 'Limpieza básica', realizada: true, tieneImagen: false },
            { id: 2, titulo: 'Orden mínimo', realizada: false, tieneImagen: false },
            { id: 3, titulo: 'Limpieza de vidrios', realizada: false, tieneImagen: false },
            { id: 4, titulo: 'Organización', realizada: false, tieneImagen: false },
            { id: 5, titulo: 'Limpieza profunda', realizada: false, tieneImagen: false },
            { id: 6, titulo: 'Mantenimiento áreas', realizada: false, tieneImagen: false },
            { id: 7, titulo: 'Desinfección', realizada: true, tieneImagen: true }
          ]
        },
        tareasMantenimiento: {
          solicitadas: 3,
          realizadas: 0,
          tareas: [
            { id: 1, titulo: 'Reparaciones urgentes', realizada: false, tieneImagen: false },
            { id: 2, titulo: 'Mantenimiento crítico', realizada: false, tieneImagen: false },
            { id: 3, titulo: 'Arreglos varios', realizada: false, tieneImagen: false }
          ]
        },
        decision: false,
        observaciones: 'Alto incumplimiento. Requiere acción correctiva inmediata.'
      },
      stockCaja: {
        desviacionesStock: {
          origen: 'Mi Sucursal -> Tareas -> Control y gestión de stock',
          valorizado: 12500,
          permitido: 5000,
          porcentaje: 2.5,
          cumple: false,
          detalle: 'Desviación crítica'
        },
        arqueoCaja: {
          origen: 'Finanzas -> Arqueos y conciliaciones',
          diferencia: 890,
          permitido: 500,
          porcentaje: 1.78,
          cumple: false,
          detalle: 'Diferencias significativas sin justificar'
        },
        decision: false
      }
    },
    'VILLA CRESPO': {
      ordenLimpieza: {
        origen: ['Mi Sucursal -> Tareas -> Orden y limpieza', 'Mi Sucursal -> Tareas -> Mantenimiento sucursal'],
        tareasOrdenLimpieza: {
          solicitadas: 0,
          realizadas: 0,
          tareas: []
        },
        tareasMantenimiento: {
          solicitadas: 0,
          realizadas: 0,
          tareas: []
        },
        decision: null,
        observaciones: 'Auditoría pendiente de realizar'
      },
      stockCaja: {
        desviacionesStock: {
          origen: 'Mi Sucursal -> Tareas -> Control y gestión de stock',
          valorizado: 0,
          permitido: 5000,
          porcentaje: 0,
          cumple: null,
          detalle: 'Pendiente de evaluación'
        },
        arqueoCaja: {
          origen: 'Finanzas -> Arqueos y conciliaciones',
          diferencia: 0,
          permitido: 500,
          porcentaje: 0,
          cumple: null,
          detalle: 'Pendiente de evaluación'
        },
        decision: null
      }
    },
    'DEPOSITO RUTA 9': {
      ordenLimpieza: {
        origen: ['Mi Sucursal -> Tareas -> Orden y limpieza', 'Mi Sucursal -> Tareas -> Mantenimiento sucursal'],
        tareasOrdenLimpieza: {
          solicitadas: 4,
          realizadas: 4,
          tareas: [
            { id: 1, titulo: 'Limpieza de áreas de carga', realizada: true, tieneImagen: true },
            { id: 2, titulo: 'Orden en depósito', realizada: true, tieneImagen: true },
            { id: 3, titulo: 'Limpieza de oficinas', realizada: true, tieneImagen: false },
            { id: 4, titulo: 'Orden en áreas comunes', realizada: true, tieneImagen: true }
          ]
        },
        tareasMantenimiento: {
          solicitadas: 2,
          realizadas: 2,
          tareas: [
            { id: 1, titulo: 'Mantenimiento de montacargas', realizada: true, tieneImagen: true },
            { id: 2, titulo: 'Revisión de instalaciones eléctricas', realizada: true, tieneImagen: false }
          ]
        },
        decision: true,
        observaciones: 'Todas las tareas completadas satisfactoriamente'
      },
      stockCaja: {
        desviacionesStock: {
          origen: 'Mi Sucursal -> Tareas -> Control y gestión de stock',
          valorizado: 2800,
          permitido: 5000,
          porcentaje: 0.56,
          cumple: true,
          detalle: 'Desviación dentro del rango permitido'
        },
        arqueoCaja: {
          origen: 'Finanzas -> Arqueos y conciliaciones',
          diferencia: 200,
          permitido: 500,
          porcentaje: 0.4,
          cumple: true,
          detalle: 'Arqueo diario realizado correctamente'
        },
        decision: true
      }
    }
  };

  // Datos históricos de cumplimiento por mes
  const cumplimientoPorMes = {
    '2025-11': [
      { nombre: 'ARENALES', pilares: { ordenLimpieza: true, serviciosClub: true, gestionAdministrativa: false, pedidosYa: true, stockCaja: false } },
      { nombre: 'BELGRANO SUR', pilares: { ordenLimpieza: false, serviciosClub: false, gestionAdministrativa: true, pedidosYa: true, stockCaja: false } },
      { nombre: 'CATAMARCA', pilares: { ordenLimpieza: true, serviciosClub: true, gestionAdministrativa: true, pedidosYa: false, stockCaja: true } },
      { nombre: 'LEGUIZAMON', pilares: { ordenLimpieza: true, serviciosClub: false, gestionAdministrativa: true, pedidosYa: true, stockCaja: false } },
      { nombre: 'CONGRESO', pilares: { ordenLimpieza: false, serviciosClub: true, gestionAdministrativa: false, pedidosYa: true, stockCaja: false } },
      { nombre: 'LAPRIDA', pilares: { ordenLimpieza: false, serviciosClub: false, gestionAdministrativa: false, pedidosYa: false, stockCaja: false } },
      { nombre: 'VILLA CRESPO', pilares: { ordenLimpieza: true, serviciosClub: true, gestionAdministrativa: true, pedidosYa: true, stockCaja: false } },
      { nombre: 'DEPOSITO RUTA 9', pilares: { ordenLimpieza: true, gestionAdministrativa: true, stockCaja: true, gestionPedidos: true, mantenimientoVehiculos: true } }
    ],
    '2025-12': [
      { nombre: 'ARENALES', pilares: { ordenLimpieza: false, serviciosClub: true, gestionAdministrativa: true, pedidosYa: false, stockCaja: true } },
      { nombre: 'BELGRANO SUR', pilares: { ordenLimpieza: false, serviciosClub: true, gestionAdministrativa: false, pedidosYa: true, stockCaja: false } },
      { nombre: 'CATAMARCA', pilares: { ordenLimpieza: true, serviciosClub: true, gestionAdministrativa: true, pedidosYa: true, stockCaja: true } },
      { nombre: 'LEGUIZAMON', pilares: { ordenLimpieza: true, serviciosClub: true, gestionAdministrativa: true, pedidosYa: true, stockCaja: false } },
      { nombre: 'CONGRESO', pilares: { ordenLimpieza: true, serviciosClub: false, gestionAdministrativa: true, pedidosYa: true, stockCaja: false } },
      { nombre: 'LAPRIDA', pilares: { ordenLimpieza: false, serviciosClub: false, gestionAdministrativa: false, pedidosYa: true, stockCaja: false } },
      { nombre: 'VILLA CRESPO', pilares: { ordenLimpieza: null, serviciosClub: null, gestionAdministrativa: null, pedidosYa: null, stockCaja: null } },
      { nombre: 'DEPOSITO RUTA 9', pilares: { ordenLimpieza: true, gestionAdministrativa: true, stockCaja: false, gestionPedidos: true, mantenimientoVehiculos: true } }
    ]
  };

  // Datos de cumplimiento por sucursal y pilar (selección por mes)
  const sucursalesMockMesActual = [
    {
      nombre: 'ARENALES',
      pilares: {
        ordenLimpieza: datosIntegracion['ARENALES'].ordenLimpieza.decision,
        serviciosClub: false,
        gestionAdministrativa: true,
        pedidosYa: false,
        stockCaja: datosIntegracion['ARENALES'].stockCaja.decision
      }
    },
    {
      nombre: 'BELGRANO SUR',
      pilares: {
        ordenLimpieza: datosIntegracion['BELGRANO SUR'].ordenLimpieza.decision,
        serviciosClub: true,
        gestionAdministrativa: true,
        pedidosYa: true,
        stockCaja: datosIntegracion['BELGRANO SUR'].stockCaja.decision
      }
    },
    {
      nombre: 'CATAMARCA',
      pilares: {
        ordenLimpieza: datosIntegracion['CATAMARCA'].ordenLimpieza.decision,
        serviciosClub: true,
        gestionAdministrativa: true,
        pedidosYa: true,
        stockCaja: datosIntegracion['CATAMARCA'].stockCaja.decision
      }
    },
    {
      nombre: 'LEGUIZAMON',
      pilares: {
        ordenLimpieza: datosIntegracion['LEGUIZAMON'].ordenLimpieza.decision,
        serviciosClub: true,
        gestionAdministrativa: true,
        pedidosYa: true,
        stockCaja: datosIntegracion['LEGUIZAMON'].stockCaja.decision
      }
    },
    {
      nombre: 'CONGRESO',
      pilares: {
        ordenLimpieza: datosIntegracion['CONGRESO'].ordenLimpieza.decision,
        serviciosClub: true,
        gestionAdministrativa: true,
        pedidosYa: true,
        stockCaja: datosIntegracion['CONGRESO'].stockCaja.decision
      }
    },
    {
      nombre: 'LAPRIDA',
      pilares: {
        ordenLimpieza: datosIntegracion['LAPRIDA'].ordenLimpieza.decision,
        serviciosClub: true,
        gestionAdministrativa: false,
        pedidosYa: true,
        stockCaja: datosIntegracion['LAPRIDA'].stockCaja.decision
      }
    },
    {
      nombre: 'VILLA CRESPO',
      pilares: {
        ordenLimpieza: datosIntegracion['VILLA CRESPO'].ordenLimpieza.decision,
        serviciosClub: null,
        gestionAdministrativa: null,
        pedidosYa: null,
        stockCaja: datosIntegracion['VILLA CRESPO'].stockCaja.decision
      }
    },
    {
      nombre: 'DEPOSITO RUTA 9',
      pilares: {
        ordenLimpieza: datosIntegracion['DEPOSITO RUTA 9'].ordenLimpieza.decision,
        gestionAdministrativa: true,
        stockCaja: datosIntegracion['DEPOSITO RUTA 9'].stockCaja.decision,
        gestionPedidos: true,
        mantenimientoVehiculos: true
      }
    }
  ];

  // Agregar sucursales de la DB que no tienen datos mock
  const nombresConMock = new Set(sucursalesMockMesActual.map(s => s.nombre));
  const sucursalesNuevasDB = sucursalesNombres
    .filter(nombre => !nombresConMock.has(nombre))
    .map(nombre => ({
      nombre,
      pilares: { ordenLimpieza: null, serviciosClub: null, gestionAdministrativa: null, pedidosYa: null, stockCaja: null }
    }));

  const sucursales = cumplimientoPorMes[mesKey] || [...sucursalesMockMesActual, ...sucursalesNuevasDB];

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
    const datos = datosIntegracion[sucursal];
    if (pilarKey === 'ordenLimpieza' || pilarKey === 'stockCaja') {
      // Load real task details for this sucursal
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
        datos: datos ? datos[pilarKey] : null,
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
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
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
      </div>

      {activeTab === 'descargos' && <DescargosSection />}

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

                  {/* Decisión del Auditor */}
                  {selectedPilarDetail.datos && (
                  <div className="bg-mascotera-darker p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-mascotera-text-muted mb-2">Decisión del Auditor</h3>
                    <div className="flex items-center gap-3 mb-2">
                      {selectedPilarDetail.datos.decision === null ? (
                        <AlertCircle className="w-6 h-6 text-mascotera-warning" />
                      ) : selectedPilarDetail.datos.decision ? (
                        <CheckCircle2 className="w-6 h-6 text-mascotera-success" />
                      ) : (
                        <XCircle className="w-6 h-6 text-mascotera-danger" />
                      )}
                      <span className={`text-lg font-semibold ${
                        selectedPilarDetail.datos.decision === null
                          ? 'text-mascotera-warning'
                          : selectedPilarDetail.datos.decision
                            ? 'text-mascotera-success'
                            : 'text-mascotera-danger'
                      }`}>
                        {selectedPilarDetail.datos.decision === null ? 'PENDIENTE' : selectedPilarDetail.datos.decision ? 'APROBADO' : 'NO APROBADO'}
                      </span>
                    </div>
                    <p className="text-sm text-mascotera-text-muted">{selectedPilarDetail.datos.observaciones}</p>
                  </div>
                  )}
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

                  {/* Decisión del Auditor */}
                  {selectedPilarDetail.datos && (
                  <div className="bg-mascotera-darker p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-mascotera-text-muted mb-2">Decisión del Auditor</h3>
                    <div className="flex items-center gap-3">
                      {selectedPilarDetail.datos.decision === null ? (
                        <AlertCircle className="w-6 h-6 text-mascotera-warning" />
                      ) : selectedPilarDetail.datos.decision ? (
                        <CheckCircle2 className="w-6 h-6 text-mascotera-success" />
                      ) : (
                        <XCircle className="w-6 h-6 text-mascotera-danger" />
                      )}
                      <span className={`text-lg font-semibold ${
                        selectedPilarDetail.datos.decision === null
                          ? 'text-mascotera-warning'
                          : selectedPilarDetail.datos.decision
                            ? 'text-mascotera-success'
                            : 'text-mascotera-danger'
                      }`}>
                        {selectedPilarDetail.datos.decision === null ? 'PENDIENTE' : selectedPilarDetail.datos.decision ? 'APROBADO' : 'NO APROBADO'}
                      </span>
                    </div>
                  </div>
                  )}
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
