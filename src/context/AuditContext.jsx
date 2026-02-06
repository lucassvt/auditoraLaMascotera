import React, { createContext, useContext, useState } from 'react';

const AuditContext = createContext();

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit debe ser usado dentro de un AuditProvider');
  }
  return context;
};

export const AuditProvider = ({ children }) => {
  const [auditData, setAuditData] = useState({});

  // Obtener todos los hallazgos de las auditorías
  const getAllHallazgos = () => {
    const hallazgos = [];

    Object.entries(auditData).forEach(([sucursal, pilares]) => {
      Object.entries(pilares).forEach(([pilarKey, pilarData]) => {
        if (pilarData.tieneHallazgo && pilarData.estado === false) {
          hallazgos.push({
            id: `${sucursal}-${pilarKey}-${Date.now()}`,
            sucursal,
            pilar: pilarData.nombre || pilarKey,
            criticidad: pilarData.criticidad,
            observaciones: pilarData.observaciones,
            imagenes: pilarData.imagenes,
            fecha: pilarData.fecha || new Date().toISOString(),
            estado: 'abierto'
          });
        }
      });
    });

    return hallazgos;
  };

  // Obtener hallazgos por nivel de criticidad
  const getHallazgosByCriticidad = (criticidad) => {
    return getAllHallazgos().filter(h => h.criticidad === criticidad);
  };

  // Obtener hallazgos por sucursal
  const getHallazgosBySucursal = (sucursal) => {
    return getAllHallazgos().filter(h => h.sucursal === sucursal);
  };

  const value = {
    auditData,
    setAuditData,
    getAllHallazgos,
    getHallazgosByCriticidad,
    getHallazgosBySucursal
  };

  return (
    <AuditContext.Provider value={value}>
      {children}
    </AuditContext.Provider>
  );
};
