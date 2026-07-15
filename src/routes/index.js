const express = require('express');
const playerRoutes = require('./playerRoutes');
const tournamentRoutes = require('./tournamentRoutes');

const router = express.Router();

router.use('/players', playerRoutes);
router.use('/tournaments', tournamentRoutes);

module.exports = router;
