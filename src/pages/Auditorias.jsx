import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Download,
  Filter,
  Calendar
} from 'lucide-react';

const Auditorias = () => {
  // Datos de cumplimiento por sucursal y pilar (true = cumple, false = no cumple, null = pendiente)
  const sucursales = [
    {
      nombre: 'ARENALES',
      pilares: {
        ordenLimpieza: true,
        serviciosClub: false,
        gestionAdministrativa: true,
        pedidosYa: false,
        stockCaja: true
      }
    },
    {
      nombre: 'BELGRANO SUR',
      pilares: {
        ordenLimpieza: false,
        serviciosClub: true,
        gestionAdministrativa: true,
        pedidosYa: true,
        stockCaja: false
      }
    },
    {
      nombre: 'CATAMARCA',
      pilares: {
        ordenLimpieza: true,
        serviciosClub: true,
        gestionAdministrativa: true,
        pedidosYa: true,
        stockCaja: true
      }
    },
    {
      nombre: 'LEGUIZAMON',
      pilares: {
        ordenLimpieza: true,
        serviciosClub: true,
        gestionAdministrativa: true,
        pedidosYa: true,
        stockCaja: true
      }
    },
    {
      nombre: 'CONGRESO',
      pilares: {
        ordenLimpieza: true,
        serviciosClub: true,
        gestionAdministrativa: true,
        pedidosYa: true,
        stockCaja: false
      }
    },
    {
      nombre: 'LAPRIDA',
      pilares: {
        ordenLimpieza: false,
        serviciosClub: true,
        gestionAdministrativa: false,
        pedidosYa: true,
        stockCaja: false
      }
    },
    {
      nombre: 'VILLA CRESPO',
      pilares: {
        ordenLimpieza: null,
        serviciosClub: null,
        gestionAdministrativa: null,
        pedidosYa: null,
        stockCaja: null
      }
    }
  ];

  const pilares = [
    { key: 'ordenLimpieza', nombre: 'Orden y Limpieza' },
    { key: 'serviciosClub', nombre: 'Servicios y Club la Mascotera' },
    { key: 'gestionAdministrativa', nombre: 'Gestión administrativa y sistema' },
    { key: 'pedidosYa', nombre: 'Pedidos Ya/ Whatsapp WEB' },
    { key: 'stockCaja', nombre: 'Stock y Caja' }
  ];

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
          <button className="btn-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Enero 2026
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <Link to="/auditorias/nueva" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nueva Auditoría
          </Link>
        </div>
      </div>

      {/* Tabla de Resumen */}
      <div className="card-mascotera overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mascotera-border">
                <th className="px-4 py-3 text-left font-semibold text-mascotera-text bg-mascotera-darker">
                  Sucursales
                </th>
                {pilares.map((pilar) => (
                  <th key={pilar.key} className="px-4 py-3 text-center font-semibold text-mascotera-text bg-mascotera-darker">
                    {pilar.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sucursales.map((sucursal, index) => (
                <tr
                  key={sucursal.nombre}
                  className={`border-b border-mascotera-border hover:bg-mascotera-darker/50 ${
                    index % 2 === 0 ? 'bg-mascotera-card' : ''
                  }`}
                >
                  <td className="px-4 py-4 font-semibold text-mascotera-text">
                    {sucursal.nombre}
                  </td>
                  {pilares.map((pilar) => (
                    <td key={pilar.key} className="px-4 py-4 text-center">
                      <span
                        className={`font-bold text-lg ${
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

      {/* Estadísticas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {pilares.map((pilar) => {
          const cumplimiento = sucursales.filter(s => s.pilares[pilar.key] === true).length;
          const noCumplimiento = sucursales.filter(s => s.pilares[pilar.key] === false).length;
          const pendientes = sucursales.filter(s => s.pilares[pilar.key] === null).length;
          const evaluados = cumplimiento + noCumplimiento;
          const porcentaje = evaluados > 0 ? Math.round((cumplimiento / evaluados) * 100) : 0;

          return (
            <div key={pilar.key} className="card-mascotera">
              <h3 className="text-sm font-semibold text-mascotera-text-muted mb-2">
                {pilar.nombre}
              </h3>
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
                <div className="w-16 h-16 rounded-full border-4 border-mascotera-accent/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-mascotera-accent">
                    {porcentaje}%
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 bg-mascotera-darker rounded-full overflow-hidden">
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
  );
};

export default Auditorias;
