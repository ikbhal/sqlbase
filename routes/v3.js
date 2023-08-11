// v3.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// const db = new sqlite3.Database('database.db');
const db = require('../db');

// Drop Table API
router.delete('/tables/:table_name', (req, res) => {
    const tableName = req.params.table_name;

    const query = `DROP TABLE IF EXISTS "${tableName}"`;

    db.run(query, function(err) {
        if (err) {
            console.error('Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Table dropped successfully' });
    });
});

// Add Column to Table API
router.post('/tables/:table_name/columns', (req, res) => {
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
        if (err) {
            console.error('Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Column added successfully' });
    });
});

// Select Rows with Limit API
router.get('/tables/:table_name/rows', (req, res) => {
    const tableName = req.params.table_name;
    const { limit } = req.query;

    let query = `SELECT * FROM "${tableName}"`;

    if (limit) {
        query += ` LIMIT ${limit}`;
    }

    db.all(query, (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;
