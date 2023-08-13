
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
// write function get database for given file name which will create file at data folder , add suffix of .db 
// and return the database object
function getDatabase(filename) {
    const dbPath = path.join(__dirname, '..', 'data', `${filename}.db`);
    const db = new sqlite3.Database(dbPath);
    return db;
}

module.exports = {
    getDatabase
}