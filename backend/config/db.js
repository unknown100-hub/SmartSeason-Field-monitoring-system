const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from the backend folder
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

console.log('DB Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD ? '***set***' : '***empty***'
});

pool.getConnection((error, connection) => {
    if (error) {
        console.error('Error connecting to MySQL:', error.message);
        return;
    }

    console.log('Connected to MySQL database');
    connection.release();
});

module.exports = pool;
