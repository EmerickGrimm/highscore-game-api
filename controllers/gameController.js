const db = require('../config/db');

// Register a new player by name
exports.registerPlayer = async (req, res) => {
    const { player_name } = req.body;

    if (!player_name) {
        return res.status(400).json({ message: 'Player name is required' });
    }

    try {
        // Check if the player already exists
        const [existingPlayer] = await db.query('SELECT player_id FROM players WHERE player_name = ?', [player_name]);

        if (existingPlayer.length > 0) {
            // Player exists, return the player ID
            return res.status(200).json({ message: 'Player already exists', player_id: existingPlayer[0].player_id });
        }

        // Player does not exist, insert a new player
        const [insertResult] = await db.query('INSERT INTO players (player_name) VALUES (?)', [player_name]);
        return res.status(201).json({ message: 'Player registered successfully', player_id: insertResult.insertId });
    } catch (err) {
        console.error('Error registering player:', err);
        return res.status(500).json({ message: 'Database error' });
    }
};

// Add a new score for a player
exports.addScore = async (req, res) => {
    const { player_id, score_time, level_id } = req.body;

    // Validate that player_id, score_time, and level_id are provided
    if (!player_id || !score_time || !level_id) {
        return res.status(400).json({ message: 'Player ID, score time, and level ID are required' });
    }

    try {
        // Check if the level_id exists in the game_levels table
        const [levelExists] = await db.query('SELECT level_id FROM game_levels WHERE level_id = ?', [level_id]);

        // If level doesn't exist, create a new level
        let levelToUse = level_id;
        if (levelExists.length === 0) {
            const [insertLevelResult] = await db.query('INSERT INTO game_levels (level_name, difficulty) VALUES (?, ?)', [
                `Level ${level_id}`,
                1,  // Default difficulty, you can modify as needed
            ]);

            levelToUse = insertLevelResult.insertId; // Use the newly created level's ID
        }

        // Insert the score for the player
        const [scoreResult] = await db.query('INSERT INTO high_scores (player_id, score_time, level_id) VALUES (?, ?, ?)', [
            player_id,
            score_time,
            levelToUse,
        ]);

        return res.status(201).json({ message: 'Score added successfully', score_id: scoreResult.insertId });
    } catch (err) {
        console.error('Error adding score:', err);
        return res.status(500).json({ message: 'Error adding score' });
    }
};

// Get all scores, optionally filtered by level
exports.getAllScores = async (req, res) => {
    const level_id = req.query.level_id;  // Get level_id from query parameters

    // Base query to fetch scores, joining high_scores with players
    let getScoresQuery = 'SELECT s.score_id, p.player_name, s.score_time, s.level_id FROM high_scores s JOIN players p ON s.player_id = p.player_id';

    // If level_id is provided, add the WHERE clause to filter by level_id
    if (level_id) {
        getScoresQuery += ' WHERE s.level_id = ?';
    }

    // Add ordering by score_time (ascending for fastest score)
    getScoresQuery += ' ORDER BY s.score_time ASC';

    // Set the query parameters (either level_id or none)
    const queryParams = level_id ? [level_id] : [];

    try {
        // Execute the query using the promise-based pool
        const [results] = await db.query(getScoresQuery, queryParams);
        res.status(200).json(results);  // Return the results as a JSON response
    } catch (err) {
        console.error('Error retrieving scores:', err);
        return res.status(500).json({ message: 'Error retrieving scores' });
    }
};
