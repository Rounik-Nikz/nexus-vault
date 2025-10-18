// backend/db/init.js

const sqlite3 = require('sqlite3').verbose();
const DB_SOURCE = './db/database.sqlite';

const initializeDb = () => {
    return new Promise((resolve, reject) => {
        // Connect to the database file
        const db = new sqlite3.Database(DB_SOURCE, (err) => {
            if (err) {
                console.error('Error opening database', err.message);
                return reject(err);
            }
            console.log('Connected to the SQLite database.');
        });

        // Use serialize to ensure table creation happens in order
        db.serialize(() => {
            // Create 'files' table
            db.run(`
                CREATE TABLE IF NOT EXISTS files (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cid TEXT NOT NULL UNIQUE,
                    filename TEXT NOT NULL,
                    uploader_address TEXT NOT NULL,
                    timestamp INTEGER NOT NULL
                )
            `, (err) => {
                if (err) {
                    console.error("Error creating 'files' table", err);
                    return reject(err);
                }
            });

            // Create 'admins' table
            db.run(`
                CREATE TABLE IF NOT EXISTS admins (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    address TEXT NOT NULL UNIQUE
                )
            `, (err) => {
                if (err) {
                    console.error("Error creating 'admins' table", err);
                    return reject(err);
                }
                
                // If both tables are created successfully, resolve the promise with the db instance
                console.log("✅ Database tables are ready.");
                resolve(db);
            });
        });
    });
};

module.exports = initializeDb;