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
  ChevronRight
} from 'lucide-react';

const Auditorias = () => {
  const [selectedPilarDetail, setSelectedPilarDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
  const sucursales = cumplimientoPorMes[mesKey] || [
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

  const handlePilarClick = (sucursal, pilarKey) => {
    const datos = datosIntegracion[sucursal];
    if (datos && (pilarKey === 'ordenLimpieza' || pilarKey === 'stockCaja')) {
      setSelectedPilarDetail({
        sucursal,
        pilar: pilarKey,
        datos: datos[pilarKey]
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
                  {pilaresTradicionales.map((pilar) => (
                    <td
                      key={pilar.key}
                      className="px-4 py-4 text-center"
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
                    </td>
                  ))}
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
                  {pilaresDeposito.map((pilar) => (
                    <td
                      key={pilar.key}
                      className="px-4 py-4 text-center"
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
                    </td>
                  ))}
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

                  {/* Origen de datos */}
                  <div className="bg-mascotera-darker p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-mascotera-text-muted mb-2">Origen de Datos</h3>
                    <div className="space-y-1">
                      {selectedPilarDetail.datos.origen.map((fuente, idx) => (
                        <p key={idx} className="text-sm text-mascotera-accent">{fuente}</p>
                      ))}
                    </div>
                  </div>

                  {/* Tareas de Orden y Limpieza */}
                  <div>
                    <h3 className="text-lg font-semibold text-mascotera-text mb-4">
                      Tareas de Orden y Limpieza
                    </h3>
                    <div className="bg-mascotera-darker p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-mascotera-text-muted">Ratio de cumplimiento</span>
                        <span className="text-2xl font-bold text-mascotera-accent">
                          {selectedPilarDetail.datos.tareasOrdenLimpieza.realizadas} / {selectedPilarDetail.datos.tareasOrdenLimpieza.solicitadas}
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-mascotera-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-mascotera-accent to-mascotera-accent-light"
                          style={{
                            width: `${selectedPilarDetail.datos.tareasOrdenLimpieza.solicitadas > 0
                              ? (selectedPilarDetail.datos.tareasOrdenLimpieza.realizadas / selectedPilarDetail.datos.tareasOrdenLimpieza.solicitadas) * 100
                              : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {selectedPilarDetail.datos.tareasOrdenLimpieza.tareas.map((tarea) => (
                        <div key={tarea.id} className="flex items-center justify-between p-3 bg-mascotera-darker rounded-lg">
                          <div className="flex items-center gap-3">
                            {tarea.realizada ? (
                              <CheckCircle2 className="w-5 h-5 text-mascotera-success" />
                            ) : (
                              <XCircle className="w-5 h-5 text-mascotera-danger" />
                            )}
                            <span className="text-mascotera-text">{tarea.titulo}</span>
                          </div>
                          {tarea.tieneImagen && (
                            <div className="flex items-center gap-2 text-mascotera-accent text-sm">
                              <ImageIcon className="w-4 h-4" />
                              <span>Con imagen</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tareas de Mantenimiento */}
                  <div>
                    <h3 className="text-lg font-semibold text-mascotera-text mb-4">
                      Tareas de Mantenimiento Sucursal
                    </h3>
                    <div className="bg-mascotera-darker p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-mascotera-text-muted">Ratio de cumplimiento</span>
                        <span className="text-2xl font-bold text-mascotera-accent">
                          {selectedPilarDetail.datos.tareasMantenimiento.realizadas} / {selectedPilarDetail.datos.tareasMantenimiento.solicitadas}
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-mascotera-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-mascotera-accent to-mascotera-accent-light"
                          style={{
                            width: `${selectedPilarDetail.datos.tareasMantenimiento.solicitadas > 0
                              ? (selectedPilarDetail.datos.tareasMantenimiento.realizadas / selectedPilarDetail.datos.tareasMantenimiento.solicitadas) * 100
                              : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {selectedPilarDetail.datos.tareasMantenimiento.tareas.map((tarea) => (
                        <div key={tarea.id} className="flex items-center justify-between p-3 bg-mascotera-darker rounded-lg">
                          <div className="flex items-center gap-3">
                            {tarea.realizada ? (
                              <CheckCircle2 className="w-5 h-5 text-mascotera-success" />
                            ) : (
                              <XCircle className="w-5 h-5 text-mascotera-danger" />
                            )}
                            <span className="text-mascotera-text">{tarea.titulo}</span>
                          </div>
                          {tarea.tieneImagen && (
                            <div className="flex items-center gap-2 text-mascotera-accent text-sm">
                              <ImageIcon className="w-4 h-4" />
                              <span>Con imagen</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decisión del Auditor */}
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

                  {/* Desviaciones de Stock */}
                  <div>
                    <h3 className="text-lg font-semibold text-mascotera-text mb-4">
                      Desviaciones de Stock Valorizadas
                    </h3>
                    <div className="bg-mascotera-darker p-4 rounded-lg">
                      <p className="text-xs text-mascotera-text-muted mb-3">
                        Origen: {selectedPilarDetail.datos.desviacionesStock.origen}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-mascotera-text-muted">Desviación valorizada</p>
                          <p className="text-2xl font-bold text-mascotera-text">
                            ${selectedPilarDetail.datos.desviacionesStock.valorizado.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-mascotera-text-muted">Límite permitido</p>
                          <p className="text-2xl font-bold text-mascotera-accent">
                            ${selectedPilarDetail.datos.desviacionesStock.permitido.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedPilarDetail.datos.desviacionesStock.cumple === null ? (
                          <AlertCircle className="w-5 h-5 text-mascotera-warning" />
                        ) : selectedPilarDetail.datos.desviacionesStock.cumple ? (
                          <CheckCircle2 className="w-5 h-5 text-mascotera-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-mascotera-danger" />
                        )}
                        <span className="text-sm text-mascotera-text">{selectedPilarDetail.datos.desviacionesStock.detalle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Arqueos y Conciliaciones */}
                  <div>
                    <h3 className="text-lg font-semibold text-mascotera-text mb-4">
                      Arqueos y Conciliaciones
                    </h3>
                    <div className="bg-mascotera-darker p-4 rounded-lg">
                      <p className="text-xs text-mascotera-text-muted mb-3">
                        Origen: {selectedPilarDetail.datos.arqueoCaja.origen}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-mascotera-text-muted">Diferencia detectada</p>
                          <p className="text-2xl font-bold text-mascotera-text">
                            ${selectedPilarDetail.datos.arqueoCaja.diferencia.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-mascotera-text-muted">Límite permitido</p>
                          <p className="text-2xl font-bold text-mascotera-accent">
                            ${selectedPilarDetail.datos.arqueoCaja.permitido.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedPilarDetail.datos.arqueoCaja.cumple === null ? (
                          <AlertCircle className="w-5 h-5 text-mascotera-warning" />
                        ) : selectedPilarDetail.datos.arqueoCaja.cumple ? (
                          <CheckCircle2 className="w-5 h-5 text-mascotera-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-mascotera-danger" />
                        )}
                        <span className="text-sm text-mascotera-text">{selectedPilarDetail.datos.arqueoCaja.detalle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Decisión del Auditor */}
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auditorias;
