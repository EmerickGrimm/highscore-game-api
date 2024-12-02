const mysql = require('mysql2');
const dotenv = require('dotenv');

// Hardcoding the path to the `.env` file
dotenv.config({ path: 'highscore-game-api/.env' });

const db = mysql.createConnection({
    host: process.env.DB_HOST,         
    user: process.env.DB_USER,        
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME      
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit();
    }
    console.log('Connected to the database');
});

module.exports = db;
