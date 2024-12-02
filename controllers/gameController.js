const db = require('../config/db');

// Register a new player by name
exports.registerPlayer = (req, res) => {
    const { player_name } = req.body;

    if (!player_name) {
        return res.status(400).json({ message: 'Player name is required' });
    }

    // Check if the player already exists
    const checkPlayerQuery = 'SELECT player_id FROM players WHERE player_name = ?';
    db.query(checkPlayerQuery, [player_name], (err, results) => {
        if (err) {
            console.error('Error checking player:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            // Player exists, return the player ID
            return res.status(200).json({ message: 'Player already exists', player_id: results[0].player_id });
        }

        // Player does not exist, insert a new player
        const insertPlayerQuery = 'INSERT INTO players (player_name) VALUES (?)';
        db.query(insertPlayerQuery, [player_name], (err, results) => {
            if (err) {
                console.error('Error inserting player:', err);
                return res.status(500).json({ message: 'Error registering player' });
            }

            res.status(201).json({ message: 'Player registered successfully', player_id: results.insertId });
        });
    });
};

// Add a new score for a player
exports.addScore = (req, res) => {
    const { player_id, score_time, level_id } = req.body;

    // Validate that player_id, score_time, and level_id are provided
    if (!player_id || !score_time || !level_id) {
        return res.status(400).json({ message: 'Player ID, score time, and level ID are required' });
    }

    // Check if the level_id exists in the game_levels table
    const checkLevelQuery = 'SELECT level_id FROM game_levels WHERE level_id = ?';
    db.query(checkLevelQuery, [level_id], (err, results) => {
        if (err) {
            console.error('Error checking level:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            const insertLevelQuery = 'INSERT INTO game_levels (level_name, difficulty) VALUES (?, ?)';
            const defaultLevelName = 'Level ' + level_id;
            const defaultDifficulty = 1; 

            db.query(insertLevelQuery, [defaultLevelName, defaultDifficulty], (err, results) => {
                if (err) {
                    console.error('Error inserting level:', err);
                    return res.status(500).json({ message: 'Error adding level to the database' });
                }

                const newLevelId = results.insertId;

                const insertScoreQuery = 'INSERT INTO high_scores (player_id, score_time, level_id) VALUES (?, ?, ?)';
                db.query(insertScoreQuery, [player_id, score_time, newLevelId], (err, results) => {
                    if (err) {
                        console.error('Error inserting score:', err);
                        return res.status(500).json({ message: 'Error adding score' });
                    }

                    res.status(201).json({ message: 'Score added successfully', score_id: results.insertId });
                });
            });
        } else {
            const insertScoreQuery = 'INSERT INTO high_scores (player_id, score_time, level_id) VALUES (?, ?, ?)';
            db.query(insertScoreQuery, [player_id, score_time, level_id], (err, results) => {
                if (err) {
                    console.error('Error inserting score:', err);
                    return res.status(500).json({ message: 'Error adding score' });
                }

                res.status(201).json({ message: 'Score added successfully', score_id: results.insertId });
            });
        }
    });
};

exports.getAllScores = (req, res) => {
    const level_id = req.query.level_id;  

    let getScoresQuery = 'SELECT s.score_id, p.player_name, s.score, s.level_id FROM high_scores s JOIN players p ON s.player_id = p.player_id';

   
    if (level_id) {
        getScoresQuery += ' WHERE s.level_id = ?';
    }

    getScoresQuery += ' ORDER BY s.score DESC';

    const queryParams = level_id ? [level_id] : []; 

    db.query(getScoresQuery, queryParams, (err, results) => {
        if (err) {
            console.error('Error retrieving scores:', err);
            return res.status(500).json({ message: 'Error retrieving scores' });
        }

        res.status(200).json(results);
    });
};
