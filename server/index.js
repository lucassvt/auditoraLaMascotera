const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { createTunnel, LOCAL_PORT } = require('./ssh-tunnel');

// Default access level config (fallback if DB table not populated)
const DEFAULT_AUDITOR_IDS = [50]; // Santiago Rivero
const DEFAULT_PILARES_ONLY_IDS = [1681, 1689]; // Mayra Fernanda Alias Rita, Maia Sol Gongora

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configurar almacenamiento de imágenes
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `obs-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
});

// Servir imágenes subidas
app.use('/api/uploads', express.static(UPLOADS_DIR));

let poolMiSucursal;
let poolDuxIntegrada;

async function initDB() {
  if (process.env.DATABASE_URL) {
    poolMiSucursal = new Pool({ connectionString: process.env.DATABASE_URL });
    console.log('Conectando a PostgreSQL via DATABASE_URL');
    return;
  }

  try {
    await createTunnel();
    const commonConfig = {
      host: '127.0.0.1',
      port: LOCAL_PORT,
      user: 'dux_user',
      password: 'Pm2480856!'
    };
    poolMiSucursal = new Pool({ ...commonConfig, database: 'mi_sucursal' });
    poolDuxIntegrada = new Pool({ ...commonConfig, database: 'dux_integrada' });
    console.log(`Conectando a PostgreSQL via SSH tunnel (puerto ${LOCAL_PORT})`);
  } catch (err) {
    console.error('Error creando SSH tunnel:', err.message);
    poolMiSucursal = new Pool({
      connectionString: 'postgresql://dux_user:Pm2480856!@localhost:5432/mi_sucursal'
    });
    poolDuxIntegrada = new Pool({
      connectionString: 'postgresql://dux_user:Pm2480856!@localhost:5432/dux_integrada'
    });
  }
}

// GET /api/sucursales - obtener sucursales activas de dux_integrada
app.get('/api/sucursales', async (req, res) => {
  try {
    const result = await poolDuxIntegrada.query(`
      SELECT id, nombre, codigo, tiene_veterinaria, tiene_peluqueria, activo as activa
      FROM sucursales
      WHERE activo = true
        AND codigo LIKE 'SUC%'
        AND nombre NOT ILIKE '%pets plus%'
        AND nombre NOT ILIKE '%contact center%'
      ORDER BY nombre
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error consultando sucursales:', err.message);
    res.status(500).json({ error: 'Error al consultar sucursales' });
  }
});

// GET /api/descargos - descargos de mi_sucursal con datos de employees de dux_integrada
app.get('/api/descargos', async (req, res) => {
  try {
    // Get descargos from mi_sucursal
    const descargosResult = await poolMiSucursal.query(`
      SELECT id, sucursal_id, creado_por_id, categoria, titulo, descripcion,
             estado, fecha_descargo, resuelto_por_id, fecha_resolucion,
             comentario_auditor, created_at
      FROM descargos_auditoria
      ORDER BY fecha_descargo DESC
    `);

    if (descargosResult.rows.length === 0) {
      return res.json([]);
    }

    // Get sucursales and employees from dux_integrada for enrichment
    const sucursalIds = [...new Set(descargosResult.rows.map(d => d.sucursal_id))];
    const employeeIds = [...new Set(descargosResult.rows.map(d => d.creado_por_id))];

    const [sucursalesResult, employeesResult] = await Promise.all([
      poolDuxIntegrada.query(`SELECT id, nombre FROM sucursales WHERE id = ANY($1)`, [sucursalIds]),
      poolDuxIntegrada.query(`SELECT id, nombre, apellido, puesto, sucursal_id FROM employees WHERE id = ANY($1)`, [employeeIds])
    ]);

    const sucursalesMap = {};
    sucursalesResult.rows.forEach(s => { sucursalesMap[s.id] = s.nombre; });

    const employeesMap = {};
    employeesResult.rows.forEach(e => { employeesMap[e.id] = e; });

    // Also get sucursal names for employees (fallback)
    const empSucursalIds = [...new Set(employeesResult.rows.map(e => e.sucursal_id).filter(Boolean))];
    let empSucursalesMap = {};
    if (empSucursalIds.length > 0) {
      const empSucResult = await poolDuxIntegrada.query(
        `SELECT id, nombre FROM sucursales WHERE id = ANY($1)`, [empSucursalIds]
      );
      empSucResult.rows.forEach(s => { empSucursalesMap[s.id] = s.nombre; });
    }

    // Enrich descargos
    const enriched = descargosResult.rows.map(d => {
      const emp = employeesMap[d.creado_por_id];
      const sucNombre = sucursalesMap[d.sucursal_id]
        || (emp ? empSucursalesMap[emp.sucursal_id] : null)
        || `Sucursal #${d.sucursal_id}`;

      return {
        ...d,
        sucursal_nombre: sucNombre,
        creado_por_nombre: emp ? emp.nombre : null,
        creado_por_apellido: emp ? emp.apellido : null,
        creado_por_puesto: emp ? emp.puesto : null
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('Error consultando descargos:', err.message);
    res.status(500).json({ error: 'Error al consultar descargos' });
  }
});

// PATCH /api/descargos/:id/estado - actualizar estado de un descargo
app.patch('/api/descargos/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado, comentario_auditor } = req.body;

  if (!estado || !['pendiente', 'resuelta'].includes(estado)) {
    return res.status(400).json({ error: 'Estado debe ser "pendiente" o "resuelta"' });
  }

  try {
    const fecha_resolucion = estado === 'resuelta' ? new Date().toISOString() : null;
    const resuelto_por_id = estado === 'resuelta' ? 1 : null;

    const result = await poolMiSucursal.query(`
      UPDATE descargos_auditoria
      SET estado = $1,
          comentario_auditor = $2,
          resuelto_por_id = $3,
          fecha_resolucion = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [estado, comentario_auditor || null, resuelto_por_id, fecha_resolucion, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Descargo no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error actualizando descargo:', err.message);
    res.status(500).json({ error: 'Error al actualizar descargo' });
  }
});

// GET /api/tareas-sucursal - tareas agrupadas por sucursal y categoria
app.get('/api/tareas-sucursal', async (req, res) => {
  try {
    const { mes } = req.query; // formato: 2026-01
    let dateFilter = '';
    const params = [];

    if (mes) {
      const [year, month] = mes.split('-');
      const startDate = `${year}-${month}-01`;
      const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
      const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
      dateFilter = ` AND t.fecha_asignacion >= $1 AND t.fecha_asignacion < $2`;
      params.push(startDate, endDate);
    }

    const result = await poolDuxIntegrada.query(`
      SELECT
        t.sucursal_id,
        s.nombre AS sucursal_nombre,
        t.categoria,
        COUNT(*) AS solicitadas,
        COUNT(*) FILTER (WHERE t.estado = 'completada') AS completadas,
        COUNT(*) FILTER (WHERE t.estado = 'pendiente') AS pendientes,
        ROUND(
          CASE WHEN COUNT(*) > 0
            THEN (COUNT(*) FILTER (WHERE t.estado = 'completada')::numeric / COUNT(*)::numeric) * 100
            ELSE 0
          END, 1
        ) AS porcentaje_completado
      FROM tareas_sucursal t
      JOIN sucursales s ON t.sucursal_id = s.id
      WHERE t.categoria IN ('ORDEN Y LIMPIEZA', 'MANTENIMIENTO SUCURSAL')${dateFilter}
      GROUP BY t.sucursal_id, s.nombre, t.categoria
      ORDER BY s.nombre, t.categoria
    `, params);

    res.json(result.rows);
  } catch (err) {
    console.error('Error consultando tareas:', err.message);
    res.status(500).json({ error: 'Error al consultar tareas' });
  }
});

// GET /api/tareas-sucursal/:sucursalId - tareas individuales de una sucursal
app.get('/api/tareas-sucursal/:sucursalId', async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const { mes } = req.query;
    let dateFilter = '';
    const params = [sucursalId];

    if (mes) {
      const [year, month] = mes.split('-');
      const startDate = `${year}-${month}-01`;
      const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
      const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
      dateFilter = ` AND t.fecha_asignacion >= $2 AND t.fecha_asignacion < $3`;
      params.push(startDate, endDate);
    }

    const result = await poolDuxIntegrada.query(`
      SELECT t.id, t.titulo, t.descripcion, t.categoria, t.estado,
             t.fecha_asignacion, t.fecha_vencimiento, t.fecha_completado,
             e.nombre AS completado_por_nombre, e.apellido AS completado_por_apellido
      FROM tareas_sucursal t
      LEFT JOIN employees e ON t.completado_por = e.id
      WHERE t.sucursal_id = $1
        AND t.categoria IN ('ORDEN Y LIMPIEZA', 'MANTENIMIENTO SUCURSAL')${dateFilter}
      ORDER BY t.categoria, t.fecha_asignacion DESC
    `, params);

    res.json(result.rows);
  } catch (err) {
    console.error('Error consultando tareas sucursal:', err.message);
    res.status(500).json({ error: 'Error al consultar tareas de sucursal' });
  }
});

// GET /api/conteos-stock - resumen de conteos/ajustes de stock por sucursal
app.get('/api/conteos-stock', async (req, res) => {
  try {
    const { mes } = req.query;
    let dateFilter = '';
    const params = [];

    if (mes) {
      const [year, month] = mes.split('-');
      const startDate = `${year}-${month}-01`;
      const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
      const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
      dateFilter = ` WHERE c.fecha_conteo >= $1 AND c.fecha_conteo < $2`;
      params.push(startDate, endDate);
    }

    const result = await poolMiSucursal.query(`
      SELECT
        c.sucursal_id,
        c.estado,
        COUNT(*) AS total_conteos,
        COALESCE(SUM(c.valorizacion_diferencia), 0) AS neto_diferencia,
        COALESCE(SUM(c.total_productos), 0) AS total_productos,
        COALESCE(SUM(c.productos_contados), 0) AS productos_contados,
        COALESCE(SUM(c.productos_con_diferencia), 0) AS productos_con_diferencia
      FROM conteos_stock c${dateFilter}
      GROUP BY c.sucursal_id, c.estado
      ORDER BY c.sucursal_id
    `, params);

    // Enrich with sucursal names from dux_integrada
    if (result.rows.length > 0) {
      const sucIds = [...new Set(result.rows.map(r => r.sucursal_id))];
      const sucResult = await poolDuxIntegrada.query(
        `SELECT id, nombre FROM sucursales WHERE id = ANY($1)`, [sucIds]
      );
      const sucMap = {};
      sucResult.rows.forEach(s => { sucMap[s.id] = s.nombre; });
      result.rows.forEach(r => { r.sucursal_nombre = sucMap[r.sucursal_id] || `Sucursal #${r.sucursal_id}`; });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error consultando conteos stock:', err.message);
    res.status(500).json({ error: 'Error al consultar conteos de stock' });
  }
});

// GET /api/conteos-stock/pendientes - conteos finalizados sin revisar por auditor
app.get('/api/conteos-stock/pendientes', async (req, res) => {
  try {
    const result = await poolMiSucursal.query(`
      SELECT c.id, c.tarea_id, c.sucursal_id, c.empleado_id, c.estado,
             c.fecha_conteo, c.valorizacion_diferencia, c.total_productos,
             c.productos_contados, c.productos_con_diferencia, c.created_at
      FROM conteos_stock c
      WHERE c.estado = 'finalizado' AND c.revisado_por IS NULL
      ORDER BY c.created_at DESC
    `);

    // Enrich with sucursal names
    if (result.rows.length > 0) {
      const sucIds = [...new Set(result.rows.map(r => r.sucursal_id))];
      const sucResult = await poolDuxIntegrada.query(
        `SELECT id, nombre FROM sucursales WHERE id = ANY($1)`, [sucIds]
      );
      const sucMap = {};
      sucResult.rows.forEach(s => { sucMap[s.id] = s.nombre; });

      // Enrich with employee names
      const empIds = [...new Set(result.rows.map(r => r.empleado_id))];
      const empResult = await poolDuxIntegrada.query(
        `SELECT id, nombre, apellido FROM employees WHERE id = ANY($1)`, [empIds]
      );
      const empMap = {};
      empResult.rows.forEach(e => { empMap[e.id] = `${e.nombre} ${e.apellido}`; });

      result.rows.forEach(r => {
        r.sucursal_nombre = sucMap[r.sucursal_id] || `Sucursal #${r.sucursal_id}`;
        r.empleado_nombre = empMap[r.empleado_id] || `Empleado #${r.empleado_id}`;
      });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error consultando conteos pendientes:', err.message);
    res.status(500).json({ error: 'Error al consultar conteos pendientes' });
  }
});

// PATCH /api/conteos-stock/:id/ajustar - marcar conteo como ajustado por auditor
app.patch('/api/conteos-stock/:id/ajustar', async (req, res) => {
  const { id } = req.params;
  const { revisado_por, comentarios_auditor } = req.body;

  try {
    // Obtener el conteo para saber su tarea_id
    const conteoResult = await poolMiSucursal.query(
      `SELECT id, tarea_id, sucursal_id FROM conteos_stock WHERE id = $1`, [id]
    );

    if (conteoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conteo no encontrado' });
    }

    const conteo = conteoResult.rows[0];

    // Marcar conteo como revisado
    await poolMiSucursal.query(`
      UPDATE conteos_stock
      SET revisado_por = $1,
          fecha_revision = CURRENT_TIMESTAMP,
          comentarios_auditor = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [revisado_por || null, comentarios_auditor || null, id]);

    // Completar la tarea asociada en tareas_sucursal (dux_integrada)
    if (conteo.tarea_id) {
      try {
        await poolDuxIntegrada.query(`
          UPDATE tareas_sucursal
          SET estado = 'completada',
              completado_por = $1,
              fecha_completado = CURRENT_TIMESTAMP
          WHERE id = $2 AND estado != 'completada'
        `, [revisado_por || null, conteo.tarea_id]);
      } catch (tareaErr) {
        console.error('Error completando tarea asociada:', tareaErr.message);
        // No fallar la operación principal si la tarea no se puede completar
      }
    }

    res.json({ success: true, conteo_id: parseInt(id), tarea_id: conteo.tarea_id });
  } catch (err) {
    console.error('Error ajustando conteo:', err.message);
    res.status(500).json({ error: 'Error al ajustar conteo de stock' });
  }
});

// POST /api/informes - guardar informe de auditoría en la base de datos
app.post('/api/informes', async (req, res) => {
  const {
    sucursal_id, periodo, orden_limpieza, pedidos,
    gestion_administrativa, club_mascotera, control_stock_caja,
    puntaje_total, observaciones, data_json
  } = req.body;

  if (!sucursal_id || !periodo) {
    return res.status(400).json({ error: 'sucursal_id y periodo son requeridos' });
  }

  try {
    const result = await poolMiSucursal.query(`
      INSERT INTO auditoria_mensual
        (sucursal_id, periodo, orden_limpieza, pedidos, gestion_administrativa,
         club_mascotera, control_stock_caja, puntaje_total, observaciones,
         data_json, estado, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'generado', CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      sucursal_id, periodo,
      orden_limpieza || null, pedidos || null, gestion_administrativa || null,
      club_mascotera || null, control_stock_caja || null,
      puntaje_total || null, observaciones || null,
      data_json ? JSON.stringify(data_json) : null
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error guardando informe:', err.message);
    res.status(500).json({ error: 'Error al guardar informe' });
  }
});

// GET /api/informes - obtener informes de auditoría (filtrable por sucursal_id y periodo)
app.get('/api/informes', async (req, res) => {
  try {
    const { sucursal_id, periodo } = req.query;
    let query = `SELECT * FROM auditoria_mensual`;
    const conditions = [];
    const params = [];

    if (sucursal_id) {
      conditions.push(`sucursal_id = $${params.length + 1}`);
      params.push(sucursal_id);
    }
    if (periodo) {
      conditions.push(`periodo = $${params.length + 1}`);
      params.push(periodo);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await poolMiSucursal.query(query, params);

    // Enrich with sucursal names from dux_integrada
    if (result.rows.length > 0) {
      const sucIds = [...new Set(result.rows.map(r => r.sucursal_id))];
      const sucResult = await poolDuxIntegrada.query(
        `SELECT id, nombre FROM sucursales WHERE id = ANY($1)`, [sucIds]
      );
      const sucMap = {};
      sucResult.rows.forEach(s => { sucMap[s.id] = s.nombre; });
      result.rows.forEach(r => {
        r.sucursal_nombre = sucMap[r.sucursal_id] || `Sucursal #${r.sucursal_id}`;
      });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error consultando informes:', err.message);
    res.status(500).json({ error: 'Error al consultar informes' });
  }
});

// GET /api/informes/:id - obtener un informe específico por ID
app.get('/api/informes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await poolMiSucursal.query(
      `SELECT * FROM auditoria_mensual WHERE id = $1`, [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    // Enrich with sucursal name
    const row = result.rows[0];
    const sucResult = await poolDuxIntegrada.query(
      `SELECT nombre FROM sucursales WHERE id = $1`, [row.sucursal_id]
    );
    row.sucursal_nombre = sucResult.rows[0]?.nombre || `Sucursal #${row.sucursal_id}`;

    res.json(row);
  } catch (err) {
    console.error('Error consultando informe:', err.message);
    res.status(500).json({ error: 'Error al consultar informe' });
  }
});

// DELETE /api/informes/:id - eliminar un informe de auditoría
app.delete('/api/informes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await poolMiSucursal.query(
      `DELETE FROM auditoria_mensual WHERE id = $1 RETURNING id`, [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    res.json({ deleted: true, id: result.rows[0].id });
  } catch (err) {
    console.error('Error eliminando informe:', err.message);
    res.status(500).json({ error: 'Error al eliminar informe' });
  }
});

// ========== PEDIDOS PENDIENTES (Gestión Administrativa) ==========

// GET /api/pedidos-pendientes - resumen de pedidos pendientes de facturar y transferencias pendientes por sucursal
app.get('/api/pedidos-pendientes', async (req, res) => {
  try {
    const { mes } = req.query; // formato: 2026-01
    if (!mes) {
      return res.status(400).json({ error: 'El parámetro mes es requerido (formato: YYYY-MM)' });
    }

    const [year, month] = mes.split('-');
    const startDate = `${year}-${month}-01`;
    const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

    const result = await poolDuxIntegrada.query(`
      SELECT
        id_sucursal AS sucursal_id,
        COUNT(*) FILTER (WHERE estado_facturacion IN ('PENDIENTE', 'FACTURADO_PARCIAL')) AS pendientes_facturar,
        COALESCE(SUM(CASE WHEN estado_facturacion IN ('PENDIENTE', 'FACTURADO_PARCIAL') THEN CAST(NULLIF(total, '') AS numeric) ELSE 0 END), 0) AS monto_pendiente_facturar,
        COUNT(*) FILTER (WHERE estado_remito IN ('PENDIENTE', 'REMITO_PARCIAL')) AS transferencias_pendientes,
        COALESCE(SUM(CASE WHEN estado_remito IN ('PENDIENTE', 'REMITO_PARCIAL') THEN CAST(NULLIF(total, '') AS numeric) ELSE 0 END), 0) AS monto_transferencias_pendientes
      FROM pedidos
      WHERE (anulado_boolean IS NOT TRUE OR anulado_boolean IS NULL)
        AND fecha::timestamp >= $1
        AND fecha::timestamp < $2
      GROUP BY id_sucursal
      ORDER BY id_sucursal
    `, [startDate, endDate]);

    // Enrich with sucursal names
    if (result.rows.length > 0) {
      const sucIds = [...new Set(result.rows.map(r => r.sucursal_id))];
      const sucResult = await poolDuxIntegrada.query(
        `SELECT id, nombre FROM sucursales WHERE id = ANY($1)`, [sucIds]
      );
      const sucMap = {};
      sucResult.rows.forEach(s => { sucMap[s.id] = s.nombre; });
      result.rows.forEach(r => {
        r.sucursal_nombre = sucMap[r.sucursal_id] || `Sucursal #${r.sucursal_id}`;
      });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error consultando pedidos pendientes:', err.message);
    res.status(500).json({ error: 'Error al consultar pedidos pendientes' });
  }
});

// ========== PEDIDOS YA - CANCELADOS (Gestión de Pedidos) ==========

// GET /api/pedidos-ya - porcentaje de pedidos cancelados de Pedidos Ya por sucursal en un mes
app.get('/api/pedidos-ya', async (req, res) => {
  try {
    const { mes } = req.query; // formato: 2026-01
    if (!mes) {
      return res.status(400).json({ error: 'El parámetro mes es requerido (formato: YYYY-MM)' });
    }

    const [year, month] = mes.split('-');
    const startDate = `${year}-${month}-01`;
    const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

    // Solo pedidos del cliente "PEDIDOS YA", separando cancelados vs total
    const result = await poolDuxIntegrada.query(`
      SELECT
        id_sucursal AS sucursal_id,
        COUNT(*) AS total_pedidos_ya,
        COUNT(*) FILTER (WHERE anulado_boolean = true) AS cancelados,
        COALESCE(SUM(CAST(NULLIF(total, '') AS numeric)), 0) AS monto_total,
        COALESCE(SUM(CASE WHEN anulado_boolean = true THEN CAST(NULLIF(total, '') AS numeric) ELSE 0 END), 0) AS monto_cancelados,
        ROUND(
          CASE WHEN COUNT(*) > 0
            THEN (COUNT(*) FILTER (WHERE anulado_boolean = true))::numeric / COUNT(*)::numeric * 100
            ELSE 0
          END, 1
        ) AS porcentaje_cancelados
      FROM pedidos
      WHERE UPPER(cliente) LIKE '%PEDIDOS YA%'
        AND fecha::timestamp >= $1
        AND fecha::timestamp < $2
      GROUP BY id_sucursal
      ORDER BY id_sucursal
    `, [startDate, endDate]);

    // Enrich with sucursal names
    if (result.rows.length > 0) {
      const sucIds = [...new Set(result.rows.map(r => r.sucursal_id))];
      const sucResult = await poolDuxIntegrada.query(
        `SELECT id, nombre FROM sucursales WHERE id = ANY($1)`, [sucIds]
      );
      const sucMap = {};
      sucResult.rows.forEach(s => { sucMap[s.id] = s.nombre; });
      result.rows.forEach(r => {
        r.sucursal_nombre = sucMap[r.sucursal_id] || `Sucursal #${r.sucursal_id}`;
      });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error consultando pedidos ya:', err.message);
    res.status(500).json({ error: 'Error al consultar pedidos ya' });
  }
});

// ========== PRODUCTOS VENCIDOS ==========

// GET /api/productos-vencidos - resumen de productos vencidos por sucursal para un mes
app.get('/api/productos-vencidos', async (req, res) => {
  try {
    const { mes } = req.query; // formato: 2026-01
    if (!mes) {
      return res.status(400).json({ error: 'El parámetro mes es requerido (formato: YYYY-MM)' });
    }

    const [year, month] = mes.split('-');
    const startDate = `${year}-${month}-01`;
    const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

    // Productos cuya fecha_vencimiento cae en el mes seleccionado
    // y que NO fueron vendidos/movidos (quedaron vencidos sin acción)
    const result = await poolMiSucursal.query(`
      SELECT
        sucursal_id,
        COUNT(*) AS total_productos,
        SUM(cantidad) AS total_unidades,
        COALESCE(SUM(valor_total), 0) AS monto_total
      FROM productos_vencimientos
      WHERE fecha_vencimiento >= $1
        AND fecha_vencimiento < $2
        AND (tiene_accion_comercial = false OR tiene_accion_comercial IS NULL)
        AND sucursal_destino_id IS NULL
        AND estado NOT IN ('vendido', 'retirado', 'movido')
      GROUP BY sucursal_id
      ORDER BY sucursal_id
    `, [startDate, endDate]);

    // Enrich with sucursal names
    if (result.rows.length > 0) {
      const sucIds = [...new Set(result.rows.map(r => r.sucursal_id))];
      const sucResult = await poolDuxIntegrada.query(
        `SELECT id, nombre FROM sucursales WHERE id = ANY($1)`, [sucIds]
      );
      const sucMap = {};
      sucResult.rows.forEach(s => { sucMap[s.id] = s.nombre; });
      result.rows.forEach(r => {
        r.sucursal_nombre = sucMap[r.sucursal_id] || `Sucursal #${r.sucursal_id}`;
      });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error consultando productos vencidos:', err.message);
    res.status(500).json({ error: 'Error al consultar productos vencidos' });
  }
});

// GET /api/productos-vencidos/:sucursalId - detalle de productos vencidos de una sucursal
app.get('/api/productos-vencidos/:sucursalId', async (req, res) => {
  try {
    const { sucursalId } = req.params;
    const { mes } = req.query;
    if (!mes) {
      return res.status(400).json({ error: 'El parámetro mes es requerido (formato: YYYY-MM)' });
    }

    const [year, month] = mes.split('-');
    const startDate = `${year}-${month}-01`;
    const endMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
    const endYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

    const result = await poolMiSucursal.query(`
      SELECT id, producto, cantidad, precio_unitario, valor_total,
             fecha_vencimiento, estado, notas
      FROM productos_vencimientos
      WHERE sucursal_id = $1
        AND fecha_vencimiento >= $2
        AND fecha_vencimiento < $3
        AND (tiene_accion_comercial = false OR tiene_accion_comercial IS NULL)
        AND sucursal_destino_id IS NULL
        AND estado NOT IN ('vendido', 'retirado', 'movido')
      ORDER BY valor_total DESC
    `, [sucursalId, startDate, endDate]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error consultando productos vencidos por sucursal:', err.message);
    res.status(500).json({ error: 'Error al consultar productos vencidos' });
  }
});

// ========== OBSERVACIONES POR PILAR ==========

// Crear tabla si no existe (se ejecuta al iniciar)
async function initObservacionesTable() {
  try {
    await poolMiSucursal.query(`
      CREATE TABLE IF NOT EXISTS observaciones_pilar (
        id SERIAL PRIMARY KEY,
        sucursal_id INTEGER NOT NULL,
        pilar_key VARCHAR(50) NOT NULL,
        periodo VARCHAR(7) NOT NULL,
        texto TEXT NOT NULL,
        criticidad VARCHAR(20) DEFAULT 'media',
        imagenes JSONB DEFAULT '[]',
        creado_por VARCHAR(100) NOT NULL,
        estado VARCHAR(20) DEFAULT 'pendiente',
        comentario_auditor TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla observaciones_pilar verificada/creada');
  } catch (err) {
    console.error('Error creando tabla observaciones_pilar:', err.message);
  }
}

// GET /api/observaciones - obtener observaciones (filtrable por sucursal_id, pilar_key, periodo)
app.get('/api/observaciones', async (req, res) => {
  try {
    const { sucursal_id, pilar_key, periodo } = req.query;
    let query = `SELECT * FROM observaciones_pilar`;
    const conditions = [];
    const params = [];

    if (sucursal_id) {
      conditions.push(`sucursal_id = $${params.length + 1}`);
      params.push(sucursal_id);
    }
    if (pilar_key) {
      conditions.push(`pilar_key = $${params.length + 1}`);
      params.push(pilar_key);
    }
    if (periodo) {
      conditions.push(`periodo = $${params.length + 1}`);
      params.push(periodo);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';

    const result = await poolMiSucursal.query(query, params);

    // Enrich with sucursal names
    if (result.rows.length > 0) {
      const sucIds = [...new Set(result.rows.map(r => r.sucursal_id))];
      const sucResult = await poolDuxIntegrada.query(
        `SELECT id, nombre FROM sucursales WHERE id = ANY($1)`, [sucIds]
      );
      const sucMap = {};
      sucResult.rows.forEach(s => { sucMap[s.id] = s.nombre; });
      result.rows.forEach(r => {
        r.sucursal_nombre = sucMap[r.sucursal_id] || `Sucursal #${r.sucursal_id}`;
      });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error consultando observaciones:', err.message);
    res.status(500).json({ error: 'Error al consultar observaciones' });
  }
});

// POST /api/observaciones - crear nueva observación con imágenes opcionales
app.post('/api/observaciones', upload.array('imagenes', 10), async (req, res) => {
  try {
    const { sucursal_id, pilar_key, periodo, texto, criticidad, creado_por } = req.body;

    if (!sucursal_id || !pilar_key || !periodo || !texto || !creado_por) {
      return res.status(400).json({ error: 'sucursal_id, pilar_key, periodo, texto y creado_por son requeridos' });
    }

    // Procesar imágenes subidas
    const imagenes = (req.files || []).map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      url: `/api/uploads/${file.filename}`,
      size: file.size
    }));

    const result = await poolMiSucursal.query(`
      INSERT INTO observaciones_pilar
        (sucursal_id, pilar_key, periodo, texto, criticidad, imagenes, creado_por, estado, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      sucursal_id, pilar_key, periodo, texto,
      criticidad || 'media',
      JSON.stringify(imagenes),
      creado_por
    ]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creando observación:', err.message);
    res.status(500).json({ error: 'Error al crear observación' });
  }
});

// PATCH /api/observaciones/:id/estado - auditor aprueba o desaprueba una observación
app.patch('/api/observaciones/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado, comentario_auditor } = req.body;

  if (!estado || !['pendiente', 'aprobada', 'desaprobada'].includes(estado)) {
    return res.status(400).json({ error: 'Estado debe ser "pendiente", "aprobada" o "desaprobada"' });
  }

  try {
    const result = await poolMiSucursal.query(`
      UPDATE observaciones_pilar
      SET estado = $1,
          comentario_auditor = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [estado, comentario_auditor || null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Observación no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error actualizando observación:', err.message);
    res.status(500).json({ error: 'Error al actualizar observación' });
  }
});

// DELETE /api/observaciones/:id - eliminar una observación
app.delete('/api/observaciones/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get observation to delete its images
    const obsResult = await poolMiSucursal.query(
      `SELECT imagenes FROM observaciones_pilar WHERE id = $1`, [id]
    );

    if (obsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Observación no encontrada' });
    }

    // Delete image files
    const imagenes = obsResult.rows[0].imagenes || [];
    imagenes.forEach(img => {
      const filePath = path.join(UPLOADS_DIR, img.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await poolMiSucursal.query(`DELETE FROM observaciones_pilar WHERE id = $1`, [id]);
    res.json({ deleted: true, id: parseInt(id) });
  } catch (err) {
    console.error('Error eliminando observación:', err.message);
    res.status(500).json({ error: 'Error al eliminar observación' });
  }
});

// ========== AUTENTICACIÓN Y GESTIÓN DE ACCESOS ==========

// Crear tabla de roles de auditoría si no existe
async function initRolesTable() {
  try {
    await poolMiSucursal.query(`
      CREATE TABLE IF NOT EXISTS auditoria_roles (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL UNIQUE,
        access_level VARCHAR(20) NOT NULL DEFAULT 'full',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed con roles por defecto si la tabla está vacía
    const countResult = await poolMiSucursal.query(`SELECT COUNT(*) FROM auditoria_roles`);
    if (parseInt(countResult.rows[0].count) === 0) {
      // Insertar auditor por defecto
      for (const id of DEFAULT_AUDITOR_IDS) {
        await poolMiSucursal.query(
          `INSERT INTO auditoria_roles (employee_id, access_level) VALUES ($1, 'auditor') ON CONFLICT (employee_id) DO NOTHING`,
          [id]
        );
      }
      // Insertar pilares_only por defecto
      for (const id of DEFAULT_PILARES_ONLY_IDS) {
        await poolMiSucursal.query(
          `INSERT INTO auditoria_roles (employee_id, access_level) VALUES ($1, 'pilares_only') ON CONFLICT (employee_id) DO NOTHING`,
          [id]
        );
      }
      console.log('Roles por defecto insertados en auditoria_roles');
    }

    console.log('Tabla auditoria_roles verificada/creada');
  } catch (err) {
    console.error('Error creando tabla auditoria_roles:', err.message);
  }
}

// Helper: obtener access level de un employee
async function getAccessLevel(employeeId) {
  try {
    const result = await poolMiSucursal.query(
      `SELECT access_level FROM auditoria_roles WHERE employee_id = $1`,
      [employeeId]
    );
    if (result.rows.length > 0) return result.rows[0].access_level;

    // Fallback a defaults hardcodeados
    if (DEFAULT_AUDITOR_IDS.includes(employeeId)) return 'auditor';
    if (DEFAULT_PILARES_ONLY_IDS.includes(employeeId)) return 'pilares_only';
    return 'full';
  } catch {
    // Fallback si la tabla no existe
    if (DEFAULT_AUDITOR_IDS.includes(employeeId)) return 'auditor';
    if (DEFAULT_PILARES_ONLY_IDS.includes(employeeId)) return 'pilares_only';
    return 'full';
  }
}

// GET /api/auth/users - listar todos los usuarios con acceso a Auditoría
app.get('/api/auth/users', async (req, res) => {
  try {
    // Obtener todos los employees con permiso para sistema_id=11
    const permResult = await poolDuxIntegrada.query(`
      SELECT p.employee_id
      FROM permisos_usuario_sistema p
      WHERE p.sistema_id = 11 AND p.activo = true
    `);

    if (permResult.rows.length === 0) return res.json([]);

    const empIds = permResult.rows.map(r => r.employee_id);

    // Obtener datos de los employees
    const empResult = await poolDuxIntegrada.query(
      `SELECT id, nombre, apellido, usuario, rol, puesto, sucursal_id, activo
       FROM employees WHERE id = ANY($1) ORDER BY nombre`,
      [empIds]
    );

    // Obtener roles de auditoría
    const rolesResult = await poolMiSucursal.query(
      `SELECT employee_id, access_level FROM auditoria_roles WHERE employee_id = ANY($1)`,
      [empIds]
    );
    const rolesMap = {};
    rolesResult.rows.forEach(r => { rolesMap[r.employee_id] = r.access_level; });

    // Obtener nombres de sucursales
    const sucIds = [...new Set(empResult.rows.map(e => e.sucursal_id).filter(Boolean))];
    let sucMap = {};
    if (sucIds.length > 0) {
      const sucResult = await poolDuxIntegrada.query(
        `SELECT id, nombre FROM sucursales WHERE id = ANY($1)`, [sucIds]
      );
      sucResult.rows.forEach(s => { sucMap[s.id] = s.nombre.replace(/^SUCURSAL\s+/i, ''); });
    }

    const users = empResult.rows.map(emp => {
      let accessLevel = rolesMap[emp.id] || 'full';
      // Fallback para roles no guardados en DB
      if (!rolesMap[emp.id]) {
        if (DEFAULT_AUDITOR_IDS.includes(emp.id)) accessLevel = 'auditor';
        else if (DEFAULT_PILARES_ONLY_IDS.includes(emp.id)) accessLevel = 'pilares_only';
      }
      return {
        id: emp.id,
        nombre: emp.nombre,
        apellido: emp.apellido,
        usuario: emp.usuario,
        rol: emp.rol,
        puesto: emp.puesto,
        sucursal: sucMap[emp.sucursal_id] || null,
        activo: emp.activo,
        accessLevel
      };
    });

    res.json(users);
  } catch (err) {
    console.error('Error listando usuarios:', err.message);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

// PATCH /api/auth/users/:id/role - cambiar nivel de acceso de un usuario
app.patch('/api/auth/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { access_level } = req.body;

  if (!access_level || !['auditor', 'full', 'pilares_only'].includes(access_level)) {
    return res.status(400).json({ error: 'access_level debe ser "auditor", "full" o "pilares_only"' });
  }

  try {
    // Upsert en auditoria_roles
    await poolMiSucursal.query(`
      INSERT INTO auditoria_roles (employee_id, access_level, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (employee_id)
      DO UPDATE SET access_level = $2, updated_at = CURRENT_TIMESTAMP
    `, [parseInt(id), access_level]);

    res.json({ success: true, employee_id: parseInt(id), access_level });
  } catch (err) {
    console.error('Error actualizando rol:', err.message);
    res.status(500).json({ error: 'Error al actualizar nivel de acceso' });
  }
});

// POST /api/auth/login - login contra employees + permisos de Auditoría
app.post('/api/auth/login', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    const empResult = await poolDuxIntegrada.query(
      `SELECT id, nombre, apellido, usuario, password_hash, rol, puesto, nivel, sucursal_id, activo
       FROM employees WHERE LOWER(usuario) = $1`,
      [usuario.toLowerCase().trim()]
    );

    if (empResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const employee = empResult.rows[0];

    if (!employee.activo) {
      return res.status(401).json({ error: 'Usuario desactivado' });
    }

    const passwordValid = await bcrypt.compare(password, employee.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Verificar permiso para Auditoría (sistema_id = 11)
    const permResult = await poolDuxIntegrada.query(
      `SELECT activo FROM permisos_usuario_sistema WHERE employee_id = $1 AND sistema_id = 11`,
      [employee.id]
    );

    if (permResult.rows.length === 0 || !permResult.rows[0].activo) {
      return res.status(403).json({ error: 'No tienes permiso para acceder al sistema de Auditoría' });
    }

    // Determinar nivel de acceso desde DB
    const accessLevel = await getAccessLevel(employee.id);

    res.json({
      id: employee.id,
      nombre: employee.nombre,
      apellido: employee.apellido,
      usuario: employee.usuario,
      rol: employee.rol,
      puesto: employee.puesto,
      sucursal_id: employee.sucursal_id,
      accessLevel
    });
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3002;

initDB().then(async () => {
  await initObservacionesTable();
  await initRolesTable();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API corriendo en puerto ${PORT}`);
  });
});
