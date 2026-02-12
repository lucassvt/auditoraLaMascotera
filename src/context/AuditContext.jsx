import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config';

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
  const [sucursalesDB, setSucursalesDB] = useState([]);
  const [loadingSucursales, setLoadingSucursales] = useState(true);
  const [descargos, setDescargos] = useState([]);
  const [loadingDescargos, setLoadingDescargos] = useState(true);
  const [tareasResumen, setTareasResumen] = useState([]);
  const [conteosStock, setConteosStock] = useState([]);

  // Auditores por sucursal (persistido en localStorage)
  const [auditoresPorSucursal, setAuditoresPorSucursal] = useState(() => {
    try {
      const stored = localStorage.getItem('audit_auditores_por_sucursal');
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  // Informes generados (persistido en localStorage)
  const [generatedReports, setGeneratedReports] = useState(() => {
    try {
      const stored = localStorage.getItem('audit_generated_reports');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Persistir auditoresPorSucursal
  useEffect(() => {
    localStorage.setItem('audit_auditores_por_sucursal', JSON.stringify(auditoresPorSucursal));
  }, [auditoresPorSucursal]);

  // Persistir generatedReports
  useEffect(() => {
    localStorage.setItem('audit_generated_reports', JSON.stringify(generatedReports));
  }, [generatedReports]);

  // Fetch sucursales desde la API
  useEffect(() => {
    fetch(`${API_BASE}/sucursales`)
      .then(res => res.json())
      .then(data => {
        setSucursalesDB(data);
        setLoadingSucursales(false);
      })
      .catch(err => {
        console.error('Error cargando sucursales:', err);
        setLoadingSucursales(false);
      });
  }, []);

  // Fetch descargos desde la API
  const fetchDescargos = () => {
    setLoadingDescargos(true);
    fetch(`${API_BASE}/descargos`)
      .then(res => res.json())
      .then(data => {
        setDescargos(data);
        setLoadingDescargos(false);
      })
      .catch(err => {
        console.error('Error cargando descargos:', err);
        setLoadingDescargos(false);
      });
  };

  useEffect(() => {
    fetchDescargos();
  }, []);

  // Actualizar estado de un descargo
  const updateDescargoEstado = async (id, estado, comentarioAuditor = null) => {
    try {
      const response = await fetch(`${API_BASE}/descargos/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado,
          comentario_auditor: comentarioAuditor
        })
      });
      if (!response.ok) throw new Error('Error al actualizar descargo');
      await fetchDescargos();
      return true;
    } catch (err) {
      console.error('Error actualizando descargo:', err);
      return false;
    }
  };

  // Fetch tareas por sucursal (Orden y Limpieza + Mantenimiento)
  const fetchTareasResumen = (mes) => {
    const query = mes ? `?mes=${mes}` : '';
    fetch(`${API_BASE}/tareas-sucursal${query}`)
      .then(res => res.json())
      .then(data => setTareasResumen(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error cargando tareas:', err));
  };

  // Fetch tareas individuales de una sucursal
  const fetchTareasSucursal = async (sucursalId, mes) => {
    try {
      const query = mes ? `?mes=${mes}` : '';
      const res = await fetch(`${API_BASE}/tareas-sucursal/${sucursalId}${query}`);
      return await res.json();
    } catch (err) {
      console.error('Error cargando tareas sucursal:', err);
      return [];
    }
  };

  // Fetch conteos de stock
  const fetchConteosStock = (mes) => {
    const query = mes ? `?mes=${mes}` : '';
    fetch(`${API_BASE}/conteos-stock${query}`)
      .then(res => res.json())
      .then(data => setConteosStock(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error cargando conteos:', err));
  };

  useEffect(() => {
    fetchTareasResumen();
    fetchConteosStock();
  }, []);

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

  // Nombres de sucursales desde la DB (sin el prefijo "SUCURSAL ")
  const sucursalesNombres = sucursalesDB.map(s => s.nombre.replace(/^SUCURSAL\s+/i, ''));

  // --- Funciones de auditores por sucursal ---
  const updateAuditoresSucursal = (sucursal, auditores) => {
    setAuditoresPorSucursal(prev => ({ ...prev, [sucursal]: auditores }));
  };

  const getAuditoresSucursal = (sucursal) => {
    return auditoresPorSucursal[sucursal] || [];
  };

  // --- Funciones de informes generados ---
  const generateReport = async (sucursal, mesKey, pilaresData, resumen, pilarScores = {}) => {
    const descargosFiltered = descargos.filter(d => {
      const nombre = d.sucursal_nombre ? d.sucursal_nombre.replace(/^SUCURSAL\s+/i, '') : `Sucursal #${d.sucursal_id}`;
      return nombre === sucursal;
    });

    const report = {
      id: `RPT-${Date.now()}`,
      sucursal,
      mesKey,
      auditores: [...(auditoresPorSucursal[sucursal] || [])],
      pilaresData: JSON.parse(JSON.stringify(pilaresData)),
      resumen,
      descargos: JSON.parse(JSON.stringify(descargosFiltered)),
      fechaGeneracion: new Date().toISOString(),
      estado: 'generado'
    };

    setGeneratedReports(prev => [report, ...prev]);

    // Persistir en la base de datos para que Mi Sucursal pueda consultarlo
    const sucDB = sucursalesDB.find(s => s.nombre.replace(/^SUCURSAL\s+/i, '') === sucursal);
    if (sucDB) {
      try {
        const dbResponse = await fetch(`${API_BASE}/informes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sucursal_id: sucDB.id,
            periodo: mesKey,
            orden_limpieza: pilarScores.ordenLimpieza ?? null,
            pedidos: pilarScores.pedidosYa ?? null,
            gestion_administrativa: pilarScores.gestionAdministrativa ?? null,
            club_mascotera: pilarScores.serviciosClub ?? null,
            control_stock_caja: pilarScores.stockCaja ?? null,
            puntaje_total: parseFloat(resumen.promedioPonderacion) || null,
            data_json: report
          })
        });
        if (dbResponse.ok) {
          const dbRecord = await dbResponse.json();
          report.dbId = dbRecord.id;
        }
      } catch (err) {
        console.error('Error persistiendo informe en DB:', err);
      }
    }

    return report;
  };

  const deleteReport = async (reportId) => {
    // Find the report to get dbId before removing
    const report = generatedReports.find(r => r.id === reportId);
    setGeneratedReports(prev => prev.filter(r => r.id !== reportId));

    // Also delete from database if it was persisted
    if (report?.dbId) {
      try {
        await fetch(`${API_BASE}/informes/${report.dbId}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Error eliminando informe de DB:', err);
      }
    }
  };

  const getReportsByMes = (mesKey) => {
    return generatedReports.filter(r => r.mesKey === mesKey);
  };

  const value = {
    auditData,
    setAuditData,
    getAllHallazgos,
    getHallazgosByCriticidad,
    getHallazgosBySucursal,
    sucursalesDB,
    sucursalesNombres,
    loadingSucursales,
    descargos,
    loadingDescargos,
    updateDescargoEstado,
    fetchDescargos,
    tareasResumen,
    conteosStock,
    fetchTareasResumen,
    fetchTareasSucursal,
    fetchConteosStock,
    auditoresPorSucursal,
    updateAuditoresSucursal,
    getAuditoresSucursal,
    generatedReports,
    generateReport,
    deleteReport,
    getReportsByMes
  };

  return (
    <AuditContext.Provider value={value}>
      {children}
    </AuditContext.Provider>
  );
};
