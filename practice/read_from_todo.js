const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('todos.db');

// List all todos
function listTodos() {
    db.all('SELECT * FROM todos', (err, rows) => {
        if (err) {
            console.error('Error:', err.message);
            return;
        }
        console.log('Todos:');
        rows.forEach(row => {
            const status = row.completed ? '[x]' : '[ ]';
            console.log(`${status} ${row.task}`);
        });
    });
}

listTodos();

db.close();
