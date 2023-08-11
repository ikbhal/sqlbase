// v2.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// const db = new sqlite3.Database('database.db');
const db = require('../db');

router.delete('/tables/:table_name/rows/:row_id', (req, res) => {
    const tableName = req.params.table_name;
    const rowId = req.params.row_id;

    const query = `DELETE FROM "${tableName}" WHERE id = ?`;

    db.run(query, [rowId], function(err) {
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


// Inside your router.put('/tables/:table_name/rows/:row_id') endpoint

router.put('/tables/:table_name/rows/:row_id', (req, res) => {
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


// TODO start with one operation equal, one value, later, multiple column, values, and operations
// Inside your router.get('/tables/:table_name/rows') endpoint

router.get('/tables/:table_name/rows', (req, res) => {
    const tableName = req.params.table_name;
    const { conditionColumn, conditionValue } = req.query;

    let query = `SELECT * FROM "${tableName}"`;

    if (conditionColumn && conditionValue) {
        query += ` WHERE "${conditionColumn}" = ?`;
    }

    db.all(query, [conditionValue], (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;
