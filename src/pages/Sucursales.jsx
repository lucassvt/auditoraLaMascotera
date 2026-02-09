import React, { useState } from 'react';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Repeat,
  ShieldAlert,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAudit } from '../context/AuditContext';

const Sucursales = () => {
  const { sucursalesNombres } = useAudit();
  const [selectedSucursal, setSelectedSucursal] = useState(null);

  // Meses a mostrar en el histórico (6 meses)
  const mesesHistorico = [
    { mes: 7, anio: 2025, label: 'Ago 2025' },
    { mes: 8, anio: 2025, label: 'Sep 2025' },
    { mes: 9, anio: 2025, label: 'Oct 2025' },
    { mes: 10, anio: 2025, label: 'Nov 2025' },
    { mes: 11, anio: 2025, label: 'Dic 2025' },
    { mes: 0, anio: 2026, label: 'Ene 2026' }
  ];

  const pilaresTradicionales = [
    { key: 'ordenLimpieza', nombre: 'Orden y Limpieza' },
    { key: 'serviciosClub', nombre: 'Servicios y Club' },
    { key: 'gestionAdministrativa', nombre: 'Gestión Administrativa' },
    { key: 'pedidosYa', nombre: 'Pedidos Ya / WhatsApp' },
    { key: 'stockCaja', nombre: 'Stock y Caja' }
  ];

  const pilaresDeposito = [
    { key: 'ordenLimpieza', nombre: 'Orden y Limpieza' },
    { key: 'gestionAdministrativa', nombre: 'Gestión Administrativa' },
    { key: 'stockCaja', nombre: 'Stock y Caja' },
    { key: 'gestionPedidos', nombre: 'Gestión de Pedidos' },
    { key: 'mantenimientoVehiculos', nombre: 'Mant. Vehículos' }
  ];

  // Datos históricos por sucursal: 6 meses de resultados por pilar
  // true = aprobado, false = desaprobado, null = pendiente/no evaluado
  const historico = {
    'LEGUIZAMON': {
      ordenLimpieza:          [true,  true,  true,  true,  true,  true],
      serviciosClub:          [true,  true,  false, false, true,  true],
      gestionAdministrativa:  [true,  true,  true,  true,  true,  true],
      pedidosYa:              [true,  false, true,  true,  true,  true],
      stockCaja:              [false, true,  true,  false, false, true]
    },
    'CATAMARCA': {
      ordenLimpieza:          [true,  true,  true,  true,  true,  true],
      serviciosClub:          [true,  true,  true,  true,  true,  true],
      gestionAdministrativa:  [false, true,  true,  true,  true,  true],
      pedidosYa:              [true,  true,  false, false, true,  true],
      stockCaja:              [true,  true,  true,  true,  true,  true]
    },
    'CONGRESO': {
      ordenLimpieza:          [false, true,  false, false, true,  true],
      serviciosClub:          [true,  true,  true,  true,  false, true],
      gestionAdministrativa:  [true,  false, true,  false, true,  true],
      pedidosYa:              [true,  true,  true,  true,  true,  true],
      stockCaja:              [false, false, false, false, false, false]
    },
    'ARENALES': {
      ordenLimpieza:          [true,  true,  true,  true,  false, true],
      serviciosClub:          [false, false, false, true,  true,  false],
      gestionAdministrativa:  [true,  true,  true,  true,  true,  true],
      pedidosYa:              [false, false, true,  true,  false, false],
      stockCaja:              [true,  true,  false, false, true,  true]
    },
    'BELGRANO SUR': {
      ordenLimpieza:          [false, false, false, false, false, false],
      serviciosClub:          [false, true,  false, false, true,  true],
      gestionAdministrativa:  [true,  false, true,  true,  false, true],
      pedidosYa:              [true,  true,  true,  true,  true,  true],
      stockCaja:              [false, false, false, false, false, false]
    },
    'LAPRIDA': {
      ordenLimpieza:          [false, false, false, false, false, false],
      serviciosClub:          [false, false, false, false, false, true],
      gestionAdministrativa:  [false, false, true,  false, false, false],
      pedidosYa:              [true,  false, false, false, true,  true],
      stockCaja:              [false, false, false, false, false, false]
    },
    'VILLA CRESPO': {
      ordenLimpieza:          [true,  true,  true,  true,  null,  null],
      serviciosClub:          [true,  true,  false, true,  null,  null],
      gestionAdministrativa:  [true,  true,  true,  true,  null,  null],
      pedidosYa:              [true,  true,  true,  true,  null,  null],
      stockCaja:              [false, true,  true,  false, null,  null]
    },
    'DEPOSITO RUTA 9': {
      ordenLimpieza:          [true,  true,  true,  true,  true,  true],
      gestionAdministrativa:  [true,  true,  true,  true,  true,  true],
      stockCaja:              [true,  false, true,  true,  false, true],
      gestionPedidos:         [true,  true,  true,  true,  true,  true],
      mantenimientoVehiculos: [true,  true,  false, true,  true,  true]
    }
  };

  // Analizar patrones de un pilar
  const analizarPatron = (resultados) => {
    const evaluados = resultados.filter(r => r !== null);
    if (evaluados.length === 0) return { tipo: 'sin_datos', label: 'Sin datos', color: 'text-mascotera-text-muted' };

    const aprobados = evaluados.filter(r => r === true).length;
    const total = evaluados.length;
    const ratio = aprobados / total;

    // Últimos 3 evaluados para ver tendencia
    const ultimos = evaluados.slice(-3);
    const todosUltimosAprobados = ultimos.every(r => r === true);
    const todosUltimosDesaprobados = ultimos.every(r => r === false);

    if (ratio === 1) return { tipo: 'siempre_aprueba', label: 'Siempre aprueba', color: 'text-mascotera-success', icon: ShieldCheck };
    if (ratio === 0) return { tipo: 'siempre_desaprueba', label: 'Siempre desaprueba', color: 'text-red-500', icon: ShieldAlert };

    // Detectar tendencia: comparar primera mitad vs segunda mitad
    const mitad = Math.floor(evaluados.length / 2);
    const primeraAprobados = evaluados.slice(0, mitad).filter(r => r === true).length;
    const segundaAprobados = evaluados.slice(mitad).filter(r => r === true).length;
    const primeraMitad = mitad > 0 ? primeraAprobados / mitad : 0;
    const segundaMitad = evaluados.slice(mitad).length > 0 ? segundaAprobados / evaluados.slice(mitad).length : 0;

    if (segundaMitad > primeraMitad && todosUltimosAprobados) return { tipo: 'mejorando', label: 'Mejorando', color: 'text-mascotera-accent', icon: TrendingUp };
    if (segundaMitad < primeraMitad && todosUltimosDesaprobados) return { tipo: 'empeorando', label: 'Empeorando', color: 'text-mascotera-danger', icon: TrendingDown };

    return { tipo: 'irregular', label: 'Irregular', color: 'text-mascotera-warning', icon: Repeat };
  };

  // Calcular resumen de sucursal
  const calcularResumen = (sucursalKey) => {
    const data = historico[sucursalKey];
    if (!data) {
      return {
        cumplimientoActual: 0,
        cumplimientoHistorico: 0,
        totalPilares: 5,
        aprobadosUltimo: 0,
        evaluadosUltimo: 0,
        patronesCriticos: 0,
        patronesPositivos: 0
      };
    }
    const pilares = Object.keys(data);
    const ultimoMes = {};
    let totalAprobadosUltimo = 0;
    let totalEvaluadosUltimo = 0;

    pilares.forEach(pilar => {
      const resultados = data[pilar];
      const ultimo = resultados[resultados.length - 1];
      ultimoMes[pilar] = ultimo;
      if (ultimo !== null) {
        totalEvaluadosUltimo++;
        if (ultimo === true) totalAprobadosUltimo++;
      }
    });

    // Calcular promedio histórico
    let totalAprobados = 0;
    let totalEvaluados = 0;
    pilares.forEach(pilar => {
      data[pilar].forEach(r => {
        if (r !== null) {
          totalEvaluados++;
          if (r === true) totalAprobados++;
        }
      });
    });

    const cumplimientoActual = totalEvaluadosUltimo > 0 ? Math.round((totalAprobadosUltimo / totalEvaluadosUltimo) * 100) : 0;
    const cumplimientoHistorico = totalEvaluados > 0 ? Math.round((totalAprobados / totalEvaluados) * 100) : 0;

    // Patrones críticos
    const patronesCriticos = pilares.filter(pilar => {
      const patron = analizarPatron(data[pilar]);
      return patron.tipo === 'siempre_desaprueba' || patron.tipo === 'empeorando';
    }).length;

    const patronesPositivos = pilares.filter(pilar => {
      const patron = analizarPatron(data[pilar]);
      return patron.tipo === 'siempre_aprueba';
    }).length;

    return {
      cumplimientoActual,
      cumplimientoHistorico,
      totalPilares: pilares.length,
      aprobadosUltimo: totalAprobadosUltimo,
      evaluadosUltimo: totalEvaluadosUltimo,
      patronesCriticos,
      patronesPositivos
    };
  };

  const sucursalesBase = sucursalesNombres.length > 0 ? sucursalesNombres : [
    'LEGUIZAMON', 'CATAMARCA', 'CONGRESO', 'ARENALES',
    'BELGRANO SUR', 'LAPRIDA'
  ];

  // Ordenar: más patrones críticos primero, luego menor cumplimiento
  const sucursalesList = [...sucursalesBase].sort((a, b) => {
    const ra = calcularResumen(a);
    const rb = calcularResumen(b);
    if (rb.patronesCriticos !== ra.patronesCriticos) return rb.patronesCriticos - ra.patronesCriticos;
    return ra.cumplimientoActual - rb.cumplimientoActual;
  });

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

  // Prioridad de patrón: peores primero
  const patronPrioridad = {
    'siempre_desaprueba': 0,
    'empeorando': 1,
    'irregular': 2,
    'sin_datos': 3,
    'mejorando': 4,
    'siempre_aprueba': 5
  };

  // Vista de detalle de una sucursal
  const renderDetalle = () => {
    const data = historico[selectedSucursal];
    if (!data) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedSucursal(null)}
              className="p-2 rounded-lg bg-mascotera-darker hover:bg-mascotera-card transition-colors text-mascotera-text"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="title-yellow text-2xl">{selectedSucursal}</h1>
              <p className="text-mascotera-text-muted mt-1">Sin datos historicos disponibles</p>
            </div>
          </div>
          <div className="card-mascotera h-64 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-mascotera-warning mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-mascotera-text mb-2">Sin Historico</h3>
              <p className="text-mascotera-text-muted">Esta sucursal aun no tiene datos de auditorias previas.</p>
            </div>
          </div>
        </div>
      );
    }
    const pilaresBase = selectedSucursal === 'DEPOSITO RUTA 9' ? pilaresDeposito : pilaresTradicionales;
    // Ordenar pilares: peores patrones primero
    const pilares = [...pilaresBase].sort((a, b) => {
      const pa = analizarPatron(data[a.key]);
      const pb = analizarPatron(data[b.key]);
      return (patronPrioridad[pa.tipo] ?? 3) - (patronPrioridad[pb.tipo] ?? 3);
    });
    const resumen = calcularResumen(selectedSucursal);

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header con botón volver */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedSucursal(null)}
            className="p-2 rounded-lg bg-mascotera-darker hover:bg-mascotera-card transition-colors text-mascotera-text"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="title-yellow text-2xl">{selectedSucursal}</h1>
            <p className="text-mascotera-text-muted mt-1">
              {provinciasPorSucursal[selectedSucursal]} — Histórico de desempeño por pilar
            </p>
          </div>
        </div>

        {/* Resumen de la sucursal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-mascotera-text-muted text-sm">Cumplimiento Actual</p>
            <p className={`text-3xl font-bold mt-2 ${
              resumen.cumplimientoActual >= 80 ? 'text-mascotera-success' :
              resumen.cumplimientoActual >= 50 ? 'text-mascotera-warning' :
              'text-mascotera-danger'
            }`}>{resumen.cumplimientoActual}%</p>
            <p className="text-xs text-mascotera-text-muted mt-1">{resumen.aprobadosUltimo}/{resumen.evaluadosUltimo} pilares aprobados</p>
          </div>
          <div className="stat-card">
            <p className="text-mascotera-text-muted text-sm">Promedio Histórico</p>
            <p className="text-3xl font-bold mt-2 text-mascotera-accent">{resumen.cumplimientoHistorico}%</p>
            <p className="text-xs text-mascotera-text-muted mt-1">Últimos 6 meses</p>
          </div>
          <div className="stat-card">
            <p className="text-mascotera-text-muted text-sm">Patrones Positivos</p>
            <p className="text-3xl font-bold mt-2 text-mascotera-success">{resumen.patronesPositivos}</p>
            <p className="text-xs text-mascotera-text-muted mt-1">Pilares consistentes</p>
          </div>
          <div className="stat-card">
            <p className="text-mascotera-text-muted text-sm">Patrones Críticos</p>
            <p className="text-3xl font-bold mt-2 text-mascotera-danger">{resumen.patronesCriticos}</p>
            <p className="text-xs text-mascotera-text-muted mt-1">Requieren atención</p>
          </div>
        </div>

        {/* Tabla histórica (heatmap) */}
        <div className="card-mascotera overflow-hidden">
          <h3 className="text-lg font-semibold text-mascotera-text mb-4 px-6 pt-4">
            Evolución Mensual por Pilar
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-mascotera-border">
                  <th className="px-4 py-3 text-left font-semibold text-mascotera-text bg-mascotera-darker min-w-[200px]">
                    Pilar
                  </th>
                  {mesesHistorico.map((m, idx) => (
                    <th key={idx} className="px-3 py-3 text-center font-semibold text-mascotera-text bg-mascotera-darker min-w-[80px]">
                      {m.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold text-mascotera-text bg-mascotera-darker min-w-[140px]">
                    Patrón
                  </th>
                </tr>
              </thead>
              <tbody>
                {pilares.map((pilar, pilarIdx) => {
                  const resultados = data[pilar.key];
                  const patron = analizarPatron(resultados);
                  const PatronIcon = patron.icon || Minus;

                  return (
                    <tr
                      key={pilar.key}
                      className={`border-b border-mascotera-border ${pilarIdx % 2 === 0 ? 'bg-mascotera-card' : ''}`}
                    >
                      <td className="px-4 py-4 font-semibold text-mascotera-text">
                        {pilar.nombre}
                      </td>
                      {resultados.map((resultado, mesIdx) => (
                        <td key={mesIdx} className="px-3 py-4 text-center">
                          {resultado === null ? (
                            <div className="flex justify-center">
                              <div className="w-8 h-8 rounded-lg bg-mascotera-warning/10 flex items-center justify-center">
                                <Minus className="w-4 h-4 text-mascotera-text-muted" />
                              </div>
                            </div>
                          ) : resultado ? (
                            <div className="flex justify-center">
                              <div className="w-8 h-8 rounded-lg bg-mascotera-success/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-mascotera-success" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="w-8 h-8 rounded-lg bg-mascotera-danger/20 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-mascotera-danger" />
                              </div>
                            </div>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-4">
                        <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          patron.tipo === 'siempre_aprueba' ? 'bg-mascotera-success/15 text-mascotera-success' :
                          patron.tipo === 'siempre_desaprueba' ? 'bg-red-500/15 text-red-500' :
                          patron.tipo === 'mejorando' ? 'bg-mascotera-accent/15 text-mascotera-accent' :
                          patron.tipo === 'empeorando' ? 'bg-mascotera-danger/15 text-mascotera-danger' :
                          patron.tipo === 'irregular' ? 'bg-mascotera-warning/15 text-mascotera-warning' :
                          'bg-mascotera-darker text-mascotera-text-muted'
                        }`}>
                          <PatronIcon className="w-3.5 h-3.5" />
                          {patron.label}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Análisis de patrones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pilares con problemas recurrentes */}
          <div className="card-mascotera">
            <h3 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-mascotera-danger" />
              Pilares con Problemas Recurrentes
            </h3>
            <div className="space-y-3">
              {pilares.filter(pilar => {
                const patron = analizarPatron(data[pilar.key]);
                return patron.tipo === 'siempre_desaprueba' || patron.tipo === 'empeorando' || patron.tipo === 'irregular';
              }).map(pilar => {
                const resultados = data[pilar.key];
                const patron = analizarPatron(resultados);
                const desaprobados = resultados.filter(r => r === false).length;
                const evaluados = resultados.filter(r => r !== null).length;

                return (
                  <div key={pilar.key} className="p-4 bg-mascotera-darker rounded-lg border-l-4 border-mascotera-danger">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-mascotera-text">{pilar.nombre}</p>
                        <p className="text-sm text-mascotera-text-muted mt-1">
                          Desaprobado {desaprobados} de {evaluados} meses evaluados
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        patron.tipo === 'siempre_desaprueba' ? 'bg-red-500/20 text-red-500' :
                        patron.tipo === 'empeorando' ? 'bg-mascotera-danger/20 text-mascotera-danger' :
                        'bg-mascotera-warning/20 text-mascotera-warning'
                      }`}>
                        {patron.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              {pilares.filter(pilar => {
                const patron = analizarPatron(data[pilar.key]);
                return patron.tipo === 'siempre_desaprueba' || patron.tipo === 'empeorando' || patron.tipo === 'irregular';
              }).length === 0 && (
                <div className="p-4 bg-mascotera-darker rounded-lg text-center">
                  <CheckCircle2 className="w-8 h-8 text-mascotera-success mx-auto mb-2" />
                  <p className="text-mascotera-text-muted">No hay pilares con problemas recurrentes</p>
                </div>
              )}
            </div>
          </div>

          {/* Pilares consistentes */}
          <div className="card-mascotera">
            <h3 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-mascotera-success" />
              Pilares Consistentemente Aprobados
            </h3>
            <div className="space-y-3">
              {pilares.filter(pilar => {
                const patron = analizarPatron(data[pilar.key]);
                return patron.tipo === 'siempre_aprueba' || patron.tipo === 'mejorando';
              }).map(pilar => {
                const resultados = data[pilar.key];
                const patron = analizarPatron(resultados);
                const aprobados = resultados.filter(r => r === true).length;
                const evaluados = resultados.filter(r => r !== null).length;

                return (
                  <div key={pilar.key} className="p-4 bg-mascotera-darker rounded-lg border-l-4 border-mascotera-success">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-mascotera-text">{pilar.nombre}</p>
                        <p className="text-sm text-mascotera-text-muted mt-1">
                          Aprobado {aprobados} de {evaluados} meses evaluados
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        patron.tipo === 'siempre_aprueba' ? 'bg-mascotera-success/20 text-mascotera-success' :
                        'bg-mascotera-accent/20 text-mascotera-accent'
                      }`}>
                        {patron.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              {pilares.filter(pilar => {
                const patron = analizarPatron(data[pilar.key]);
                return patron.tipo === 'siempre_aprueba' || patron.tipo === 'mejorando';
              }).length === 0 && (
                <div className="p-4 bg-mascotera-darker rounded-lg text-center">
                  <AlertCircle className="w-8 h-8 text-mascotera-warning mx-auto mb-2" />
                  <p className="text-mascotera-text-muted">Ningún pilar tiene aprobación consistente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tasa de aprobación por pilar (barras) */}
        <div className="card-mascotera">
          <h3 className="text-lg font-semibold text-mascotera-text mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-mascotera-accent" />
            Tasa de Aprobación por Pilar (6 meses)
          </h3>
          <div className="space-y-4">
            {pilares.map(pilar => {
              const resultados = data[pilar.key];
              const evaluados = resultados.filter(r => r !== null).length;
              const aprobados = resultados.filter(r => r === true).length;
              const porcentaje = evaluados > 0 ? Math.round((aprobados / evaluados) * 100) : 0;

              return (
                <div key={pilar.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-mascotera-text">{pilar.nombre}</span>
                    <span className={`text-sm font-bold ${
                      porcentaje >= 80 ? 'text-mascotera-success' :
                      porcentaje >= 50 ? 'text-mascotera-warning' :
                      'text-mascotera-danger'
                    }`}>{porcentaje}%</span>
                  </div>
                  <div className="h-3 bg-mascotera-darker rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        porcentaje >= 80 ? 'bg-gradient-to-r from-mascotera-success to-green-400' :
                        porcentaje >= 50 ? 'bg-gradient-to-r from-mascotera-warning to-yellow-400' :
                        'bg-gradient-to-r from-mascotera-danger to-red-400'
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-mascotera-text-muted mt-1">
                    {aprobados}/{evaluados} meses aprobados
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Vista principal: listado de sucursales
  const renderListado = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="title-yellow text-2xl">Sucursales</h1>
          <p className="text-mascotera-text-muted mt-1">
            Histórico de desempeño por sucursal — Identificación de patrones
          </p>
        </div>

        {/* Cards de sucursales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sucursalesList.map(sucursal => {
            const resumen = calcularResumen(sucursal);
            const diff = resumen.cumplimientoActual - resumen.cumplimientoHistorico;

            return (
              <div
                key={sucursal}
                onClick={() => setSelectedSucursal(sucursal)}
                className="card-mascotera hover:border-mascotera-accent/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-mascotera-accent/10">
                    <Building2 className="w-5 h-5 text-mascotera-accent" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-mascotera-text-muted group-hover:text-mascotera-accent transition-colors" />
                </div>

                <h3 className="font-semibold text-mascotera-text text-lg">{sucursal}</h3>
                <p className="text-xs text-mascotera-text-muted mb-4">{provinciasPorSucursal[sucursal]}</p>

                {/* Cumplimiento actual */}
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-xs text-mascotera-text-muted">Cumplimiento actual</p>
                    <p className={`text-2xl font-bold ${
                      resumen.cumplimientoActual >= 80 ? 'text-mascotera-success' :
                      resumen.cumplimientoActual >= 50 ? 'text-mascotera-warning' :
                      'text-mascotera-danger'
                    }`}>{resumen.cumplimientoActual}%</p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    diff > 0 ? 'text-mascotera-success' : diff < 0 ? 'text-mascotera-danger' : 'text-mascotera-text-muted'
                  }`}>
                    {diff > 0 ? <ArrowUpRight className="w-4 h-4" /> : diff < 0 ? <ArrowDownRight className="w-4 h-4" /> : null}
                    {diff !== 0 ? `${diff > 0 ? '+' : ''}${diff}%` : '—'}
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="h-2 bg-mascotera-darker rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      resumen.cumplimientoActual >= 80 ? 'bg-gradient-to-r from-mascotera-success to-green-400' :
                      resumen.cumplimientoActual >= 50 ? 'bg-gradient-to-r from-mascotera-warning to-yellow-400' :
                      'bg-gradient-to-r from-mascotera-danger to-red-400'
                    }`}
                    style={{ width: `${resumen.cumplimientoActual}%` }}
                  ></div>
                </div>

                {/* Mini indicadores de patrones */}
                <div className="flex items-center gap-3 text-xs">
                  {resumen.patronesPositivos > 0 && (
                    <span className="flex items-center gap-1 text-mascotera-success">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {resumen.patronesPositivos} estables
                    </span>
                  )}
                  {resumen.patronesCriticos > 0 && (
                    <span className="flex items-center gap-1 text-mascotera-danger">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {resumen.patronesCriticos} críticos
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabla resumen comparativa */}
        <div className="card-mascotera overflow-hidden">
          <h3 className="text-lg font-semibold text-mascotera-text mb-4 px-6 pt-4">
            Comparativa General — Último Mes vs Promedio Histórico
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-mascotera-border">
                  <th className="px-4 py-3 text-left font-semibold text-mascotera-text bg-mascotera-darker">Sucursal</th>
                  <th className="px-4 py-3 text-center font-semibold text-mascotera-text bg-mascotera-darker">Actual</th>
                  <th className="px-4 py-3 text-center font-semibold text-mascotera-text bg-mascotera-darker">Histórico</th>
                  <th className="px-4 py-3 text-center font-semibold text-mascotera-text bg-mascotera-darker">Tendencia</th>
                  <th className="px-4 py-3 text-center font-semibold text-mascotera-text bg-mascotera-darker">Patrones +</th>
                  <th className="px-4 py-3 text-center font-semibold text-mascotera-text bg-mascotera-darker">Patrones -</th>
                </tr>
              </thead>
              <tbody>
                {sucursalesList.map((sucursal, idx) => {
                  const resumen = calcularResumen(sucursal);
                  const diff = resumen.cumplimientoActual - resumen.cumplimientoHistorico;

                  return (
                    <tr
                      key={sucursal}
                      className={`border-b border-mascotera-border hover:bg-mascotera-darker/50 cursor-pointer ${idx % 2 === 0 ? 'bg-mascotera-card' : ''}`}
                      onClick={() => setSelectedSucursal(sucursal)}
                    >
                      <td className="px-4 py-4 font-semibold text-mascotera-text">{sucursal}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-bold text-lg ${
                          resumen.cumplimientoActual >= 80 ? 'text-mascotera-success' :
                          resumen.cumplimientoActual >= 50 ? 'text-mascotera-warning' :
                          'text-mascotera-danger'
                        }`}>{resumen.cumplimientoActual}%</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-semibold text-mascotera-accent">{resumen.cumplimientoHistorico}%</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 font-semibold ${
                          diff > 0 ? 'text-mascotera-success' : diff < 0 ? 'text-mascotera-danger' : 'text-mascotera-text-muted'
                        }`}>
                          {diff > 0 ? <TrendingUp className="w-4 h-4" /> : diff < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                          {diff > 0 ? '+' : ''}{diff}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-mascotera-success font-bold">{resumen.patronesPositivos}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-mascotera-danger font-bold">{resumen.patronesCriticos}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return selectedSucursal ? renderDetalle() : renderListado();
};

export default Sucursales;
