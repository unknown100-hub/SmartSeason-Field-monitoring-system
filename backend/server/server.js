const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('../config/db');
const dbPromise = db.promise();

dotenv.config({ quiet: true });

const app = express();

app.use(cors());
app.use(express.json());

const STAGE_MAP = {
  planning: 'Planted',
  emergence: 'Planted',
  planted: 'Planted',
  vegetative: 'Growing',
  flowering: 'Growing',
  'grain fill': 'Growing',
  growing: 'Growing',
  'harvest ready': 'Ready',
  ready: 'Ready',
  harvested: 'Harvested',
};

function normalizeStage(stage) {
  if (!stage) {
    return 'Planted';
  }

  return STAGE_MAP[String(stage).trim().toLowerCase()] || 'Growing';
}

function computeFieldStatus(fieldLike) {
  const stage = normalizeStage(fieldLike.stage);
  const moisture = Number(fieldLike.moisture ?? 0);
  const ndvi = Number(fieldLike.ndvi ?? 0);
  const completion = Number(fieldLike.completion ?? 0);
  const harvestDate = fieldLike.harvestDate || fieldLike.harvest_date;
  const harvestTime = harvestDate ? new Date(harvestDate).getTime() : Number.POSITIVE_INFINITY;

  if (stage === 'Harvested' || completion >= 100) {
    return 'Completed';
  }

  if (moisture < 45 || ndvi < 0.6 || Date.now() > harvestTime) {
    return 'At Risk';
  }

  return 'Active';
}

function mapDatabaseField(row) {
  const stage = normalizeStage(row.stage);
  return {
    id: row.field_code,
    dbId: row.id,
    name: row.name,
    cropType: row.crop_type,
    location: row.location,
    hectares: Number(row.hectares),
    soilType: row.soil_type,
    irrigationType: row.irrigation_type,
    plantingDate: row.planting_date,
    harvestDate: row.harvest_date,
    stage,
    risk: row.risk_level,
    moisture: Number(row.moisture),
    ndvi: Number(row.ndvi),
    completion: Number(row.completion),
    assigneeId: row.assignee_id,
    status: computeFieldStatus({ ...row, stage }),
    lastUpdate: row.last_update,
  };
}

function mapFieldUpdate(row) {
  return {
    id: row.update_code,
    fieldId: row.field_code,
    agentId: row.agent_id,
    stage: normalizeStage(row.stage),
    note: row.note,
    createdAt: row.created_at,
    fieldName: row.field_name,
    agentName: row.agent_name,
  };
}

async function ensureFieldsTable() {
  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS fields (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      field_code VARCHAR(40) NOT NULL UNIQUE,
      name VARCHAR(120) NOT NULL,
      crop_type VARCHAR(80) NOT NULL,
      location VARCHAR(120) NOT NULL,
      hectares DECIMAL(10, 2) NOT NULL,
      soil_type VARCHAR(80) NOT NULL,
      irrigation_type VARCHAR(80) NOT NULL,
      planting_date DATE NOT NULL,
      harvest_date DATE NOT NULL,
      stage VARCHAR(60) NOT NULL DEFAULT 'Planted',
      risk_level VARCHAR(30) NOT NULL DEFAULT 'Moderate',
      moisture DECIMAL(5, 2) NOT NULL DEFAULT 56,
      ndvi DECIMAL(4, 2) NOT NULL DEFAULT 0.60,
      completion INT NOT NULL DEFAULT 12,
      assignee_id VARCHAR(40) NOT NULL DEFAULT 'u-002',
      status_label VARCHAR(80) NOT NULL DEFAULT 'Active',
      last_update DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

async function ensureFieldUpdatesTable() {
  await dbPromise.query(`
    CREATE TABLE IF NOT EXISTS field_updates (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      update_code VARCHAR(40) NOT NULL UNIQUE,
      field_code VARCHAR(40) NOT NULL,
      agent_id VARCHAR(40) NOT NULL,
      stage VARCHAR(60) NOT NULL,
      note TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_field_updates_field_code (field_code),
      CONSTRAINT fk_field_updates_field_code
        FOREIGN KEY (field_code) REFERENCES fields(field_code)
        ON DELETE CASCADE
    )
  `);
}

app.get('/', (req, res) => {
  res.json({ message: 'SmartSeason backend is running' });
});

app.get('/health', async (req, res) => {
  try {
    await dbPromise.query('SELECT 1 AS status');
    res.json({
      status: 'ok',
      message: 'Server and database are connected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

app.get('/api/fields', async (req, res) => {
  try {
    const [rows] = await dbPromise.query(
      'SELECT * FROM fields ORDER BY created_at DESC, id DESC',
    );
    res.json(rows.map(mapDatabaseField));
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch fields',
      error: error.message,
    });
  }
});

app.get('/api/field-updates', async (req, res) => {
  try {
    const [rows] = await dbPromise.query(
      `
        SELECT
          fu.*,
          f.name AS field_name,
          f.field_code,
          fu.agent_id AS agent_name
        FROM field_updates fu
        INNER JOIN fields f ON f.field_code = fu.field_code
        ORDER BY fu.created_at DESC, fu.id DESC
      `,
    );

    res.json(rows.map(mapFieldUpdate));
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch field updates',
      error: error.message,
    });
  }
});

app.post('/api/fields', async (req, res) => {
  console.log('POST /api/fields received:', req.body);

  const {
    id,
    name,
    cropType,
    location,
    hectares,
    soilType,
    irrigationType,
    plantingDate,
    harvestDate,
    assigneeId,
    stage = 'Planted',
    risk = 'Moderate',
    moisture = 56,
    ndvi = 0.6,
    completion = 12,
    status = 'Active',
    lastUpdate = new Date().toISOString(),
  } = req.body;

  if (
    !id ||
    !name ||
    !cropType ||
    !location ||
    !hectares ||
    !soilType ||
    !irrigationType ||
    !plantingDate ||
    !harvestDate
  ) {
    console.log('Validation failed. Missing fields:', { id, name, cropType, location, hectares, soilType, irrigationType, plantingDate, harvestDate });
    return res.status(400).json({
      message: 'Missing required field payload values',
    });
  }

  console.log('Validation passed. Proceeding with insert.');

  try {
    const normalizedStage = normalizeStage(stage);
    const computedStatus = computeFieldStatus({
      stage: normalizedStage,
      moisture,
      ndvi,
      completion,
      harvestDate,
    });

    await dbPromise.query(
      `
        INSERT INTO fields (
          field_code,
          name,
          crop_type,
          location,
          hectares,
          soil_type,
          irrigation_type,
          planting_date,
          harvest_date,
          stage,
          risk_level,
          moisture,
          ndvi,
          completion,
          assignee_id,
          status_label,
          last_update,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        name,
        cropType,
        location,
        hectares,
        soilType,
        irrigationType,
        plantingDate,
        harvestDate,
        normalizedStage,
        risk,
        moisture,
        ndvi,
        completion,
        assigneeId || 'u-002',
        computedStatus,
        new Date(lastUpdate),
        new Date(lastUpdate),
      ],
    );

    console.log('Insert completed successfully');

    const [rows] = await dbPromise.query(
      'SELECT * FROM fields WHERE field_code = ? LIMIT 1',
      [id],
    );

    console.log('Retrieved inserted field:', rows[0]);

    res.status(201).json(mapDatabaseField(rows[0]));
  } catch (error) {
    console.log('Error during field creation:', error);
    res.status(500).json({
      message: 'Failed to create field',
      error: error.message,
    });
  }
});

app.put('/api/fields/:fieldCode', async (req, res) => {
  const fieldCode = req.params.fieldCode;
  const {
    name,
    cropType,
    location,
    hectares,
    soilType,
    irrigationType,
    plantingDate,
    harvestDate,
    assigneeId,
    stage = 'Planted',
    risk = 'Moderate',
    moisture = 56,
    ndvi = 0.6,
    completion = 12,
    status = 'Active',
    lastUpdate = new Date().toISOString(),
  } = req.body;

  if (
    !name ||
    !cropType ||
    !location ||
    !hectares ||
    !soilType ||
    !irrigationType ||
    !plantingDate ||
    !harvestDate
  ) {
    return res.status(400).json({
      message: 'Missing required field payload values',
    });
  }

  try {
    const normalizedStage = normalizeStage(stage);
    const computedStatus = computeFieldStatus({
      stage: normalizedStage,
      moisture,
      ndvi,
      completion,
      harvestDate,
    });

    const [result] = await dbPromise.query(
      `
        UPDATE fields
        SET
          name = ?,
          crop_type = ?,
          location = ?,
          hectares = ?,
          soil_type = ?,
          irrigation_type = ?,
          planting_date = ?,
          harvest_date = ?,
          stage = ?,
          risk_level = ?,
          moisture = ?,
          ndvi = ?,
          completion = ?,
          assignee_id = ?,
          status_label = ?,
          last_update = ?
        WHERE field_code = ?
      `,
      [
        name,
        cropType,
        location,
        hectares,
        soilType,
        irrigationType,
        plantingDate,
        harvestDate,
        normalizedStage,
        risk,
        moisture,
        ndvi,
        completion,
        assigneeId || 'u-002',
        computedStatus,
        new Date(lastUpdate),
        fieldCode,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Field not found' });
    }

    const [rows] = await dbPromise.query(
      'SELECT * FROM fields WHERE field_code = ? LIMIT 1',
      [fieldCode],
    );

    res.json(mapDatabaseField(rows[0]));
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update field',
      error: error.message,
    });
  }
});

app.delete('/api/fields/:fieldCode', async (req, res) => {
  try {
    const [result] = await dbPromise.query(
      'DELETE FROM fields WHERE field_code = ?',
      [req.params.fieldCode],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Field not found' });
    }

    res.json({ message: 'Field deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete field',
      error: error.message,
    });
  }
});

app.post('/api/fields/:fieldCode/updates', async (req, res) => {
  const fieldCode = req.params.fieldCode;
  const {
    agentId,
    stage,
    note,
    createdAt = new Date().toISOString(),
  } = req.body;

  if (!agentId || !stage || !note) {
    return res.status(400).json({
      message: 'agentId, stage, and note are required',
    });
  }

  try {
    const [fields] = await dbPromise.query(
      'SELECT * FROM fields WHERE field_code = ? LIMIT 1',
      [fieldCode],
    );

    if (fields.length === 0) {
      return res.status(404).json({ message: 'Field not found' });
    }

    const updateCode = `upd-${Math.random().toString(36).slice(2, 8)}`;
    const normalizedStage = normalizeStage(stage);
    const computedStatus = computeFieldStatus({
      stage: normalizedStage,
      moisture: fields[0].moisture,
      ndvi: fields[0].ndvi,
      completion: fields[0].completion,
      harvestDate: fields[0].harvest_date,
    });

    await dbPromise.query(
      `
        INSERT INTO field_updates (
          update_code,
          field_code,
          agent_id,
          stage,
          note,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [updateCode, fieldCode, agentId, normalizedStage, note, new Date(createdAt)],
    );

    await dbPromise.query(
      `
        UPDATE fields
        SET
          stage = ?,
          status_label = ?,
          last_update = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE field_code = ?
      `,
      [normalizedStage, computedStatus, new Date(createdAt), fieldCode],
    );

    const [rows] = await dbPromise.query(
      `
        SELECT
          fu.*,
          f.name AS field_name,
          f.field_code,
          fu.agent_id AS agent_name
        FROM field_updates fu
        INNER JOIN fields f ON f.field_code = fu.field_code
        WHERE fu.update_code = ?
        LIMIT 1
      `,
      [updateCode],
    );

    const [updatedFieldRows] = await dbPromise.query(
      'SELECT * FROM fields WHERE field_code = ? LIMIT 1',
      [fieldCode],
    );

    res.status(201).json({
      update: mapFieldUpdate(rows[0]),
      field: mapDatabaseField(updatedFieldRows[0]),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create field update',
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

ensureFieldsTable()
  .then(() => ensureFieldUpdatesTable())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database tables:', error.message);
    process.exit(1);
  });
