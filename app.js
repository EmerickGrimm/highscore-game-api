const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const gameRoutes = require('./routes/gameRoutes');
const { exec } = require('child_process');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();

// Logging Setup
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: logStream })); // Detailed HTTP request logging

app.use(cors());
app.use(bodyParser.json());

// Route Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Routes
app.use('/api', gameRoutes);

// Git Update Check
const checkForUpdates = () => {
    console.log('Checking for updates from Git repository...');
    exec('git fetch', (err, stdout, stderr) => {
        if (err) {
            console.error(`Error fetching updates: ${stderr}`);
            return;
        }

        exec('git status', (err, statusOutput) => {
            if (err) {
                console.error(`Error checking git status: ${stderr}`);
                return;
            }

            if (statusOutput.includes('behind')) {
                console.log('Updates found. Pulling updates...');
                exec('git pull && pm2 restart highscore-game-api', (err, pullOutput) => {
                    if (err) {
                        console.error(`Error pulling updates or restarting app: ${stderr}`);
                        return;
                    }
                    console.log('Application updated and restarted successfully:\n', pullOutput);
                });
            } else {
                console.log('No updates available.');
            }
        });
    });
};

// Schedule Git Update Check (every 5 minutes)
setInterval(checkForUpdates, 5 * 60 * 1000); // 5 minutes in milliseconds

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
