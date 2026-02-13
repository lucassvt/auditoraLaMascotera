const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createTunnel, LOCAL_PORT } = require('./ssh-tunnel');

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3002;

initDB().then(async () => {
  await initObservacionesTable();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API corriendo en puerto ${PORT}`);
  });
});
