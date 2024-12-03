const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: '/root/highscore-game-api/.env' });

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Set a limit to the pool size
    queueLimit: 0
});

// Get a promise-based interface for the pool
const promisePool = pool.promise();

module.exports = promisePool;
