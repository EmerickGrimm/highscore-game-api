const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/register', gameController.registerPlayer);

router.post('/score', gameController.addScore);

router.get('/scores', gameController.getAllScores);

module.exports = router;
