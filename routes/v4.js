// v3.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const getDatabase = require('../util/db_util').getDatabase;


router.use(cors());
router.use(express.json());

// Create Table API
router.post('/files/:filename/tables', (req, res) => {
    // get filname from path 
    const filename = req.params.filename;
    const db  = getDatabase(filename);
    const { table_name, columns } = req.body;
  
    if (!table_name || !columns || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
  
    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${table_name} (${columns.map(col => {
      let colDef = `${col.name} ${col.type}`;
      if (col.primary_key) {
        colDef += ' PRIMARY KEY';
        if (col.auto_increment) {
          colDef += ' AUTOINCREMENT';
        }
      }
      if (col.default !== undefined) {
        colDef += ` DEFAULT ${JSON.stringify(col.default)}`;
      }
      return colDef;
    }).join(', ')})`;
  
    db.run(createTableSQL, (err) => {
        db.close();
      if (err) {
        return res.status(500).json({ error: 'Table creation failed' });
      }
      return res.status(201).json({ message: 'Table created successfully' });
    });
  });

// Insert Row API
router.post('/files/:filename/tables/:table_name/rows', (req, res) => {
    // get filname from path 
    const filename = req.params.filename;
    const db  = getDatabase(filename);

    const tableName = req.params.table_name;
    const { columns } = req.body;

    if (!Array.isArray(columns)) {
        return res.status(400).json({ error: "Columns should be an array." });
    }

    const columnsStr = columns.map(col => `"${col.name}"`).join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map(col => col.value);

    const query = `INSERT INTO "${tableName}" (${columnsStr}) VALUES (${placeholders})`;

    db.run(query, values, function (err) {
        db.close();
        if (err) {
            console.error('Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Row inserted successfully', rowId: this.lastID });
    });
});

// List Rows API
router.get('/files/:filename/tables/:table_name/rows', (req, res) => {

    const filename = req.params.filename;
    const db  = getDatabase(filename);

    const tableName = req.params.table_name;

    const query = `SELECT * FROM "${tableName}"`;

    db.all(query, (err, rows) => {
        db.close();
        if (err) {
            console.error('Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// delete row 
router.delete('/files/:filename/tables/:table_name/rows/:row_id', (req, res) => {
  const filename = req.params.filename;
  const db  = getDatabase(filename);
  const tableName = req.params.table_name;
  const rowId = req.params.row_id;

  const query = `DELETE FROM "${tableName}" WHERE id = ?`;

  db.run(query, [rowId], function(err) {
      db.close();
      if (err) {
          console.error('Error:', err.message);
          return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
          return res.status(404).json({ error: 'Row not found' });
      }
      res.json({ message: 'Row deleted successfully' });
  });
});

// update row
router.put('/files/:filename/tables/:table_name/rows/:row_id', (req, res) => {
  const filename = req.params.filename;
  const db  = getDatabase(filename);
  const tableName = req.params.table_name;
  const rowId = req.params.row_id;
  const { columns } = req.body;

  if (!Array.isArray(columns)) {
      return res.status(400).json({ error: "Columns should be an array." });
  }

  const updateColumns = columns.map(col => `"${col.name}" = ?`).join(', ');
  const values = columns.map(col => col.value);

  const query = `UPDATE "${tableName}" SET ${updateColumns} WHERE id = ?`;

  values.push(rowId);

  db.run(query, values, function(err) {
      db.close();
      if (err) {
          console.error('Error:', err.message);
          return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
          return res.status(404).json({ error: 'Row not found' });
      }
      res.json({ message: 'Row updated successfully' });
  });
});

// select row by condition column, value
router.get('/files/:filename/tables/:table_name/rows', (req, res) => {
  const filename = req.params.filename;
  const db  = getDatabase(filename);
  const tableName = req.params.table_name;
  const { conditionColumn, conditionValue } = req.query;

  let query = `SELECT * FROM "${tableName}"`;

  if (conditionColumn && conditionValue) {
      query += ` WHERE "${conditionColumn}" = ?`;
  }

  db.all(query, [conditionValue], (err, rows) => {
      db.close();
      if (err) {
          console.error('Error:', err.message);
          return res.status(500).json({ error: err.message });
      }
      res.json(rows);
  });
});

// Drop Table API
router.delete('/files/:filename/tables/:table_name', (req, res) => {
  const filename = req.params.filename;
  const db  = getDatabase(filename);
  const tableName = req.params.table_name;

  const query = `DROP TABLE IF EXISTS "${tableName}"`;

  db.run(query, function(err) {
      db.close();    
      if (err) {
          console.error('Error:', err.message);
          return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Table dropped successfully' });
  });
});

// Add Column to Table API
router.post('/files/:filename/tables/:table_name/columns', (req, res) => {
  const filename = req.params.filename;
  const db  = getDatabase(filename);
  const tableName = req.params.table_name;
  const { name, type, defaultValue } = req.body;

  let query = `ALTER TABLE "${tableName}" ADD COLUMN "${name}" ${type}`;

  if (defaultValue !== undefined) {
      if (type.toUpperCase() === 'TEXT') {
          // If the data type is TEXT, add single quotes around the default value
          query += ` DEFAULT '${defaultValue}'`;
      } else {
          query += ` DEFAULT ${defaultValue}`;
      }
  }

  db.run(query, function(err) {
      db.close();
      if (err) {
          console.error('Error:', err.message);
          return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Column added successfully' });
  });
});

module.exports = router;