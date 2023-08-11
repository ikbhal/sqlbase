const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('todos.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY,
            task TEXT NOT NULL,
            completed INTEGER
        )
    `);

    // Insert dummy data
    const insert = db.prepare('INSERT INTO todos (task, completed) VALUES (?, ?)');
    insert.run('Buy groceries', 0); // 0 represents false
    insert.run('Finish homework', 0); // 0 represents false
    insert.run('Go for a run', 1); // 1 represents true
    insert.finalize();
});

// ... rest of the code
