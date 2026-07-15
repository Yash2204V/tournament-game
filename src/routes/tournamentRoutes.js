const express = require('express');
const tournamentController = require('../controllers/tournamentController');
const validate = require('../middlewares/validate');
const {
  createTournamentSchema,
  registerPlayerSchema,
  submitScoreSchema,
  leaderboardSchema,
  playerRankSchema,
} = require('../validation/schemas');

const router = express.Router();

router.post('/', validate(createTournamentSchema), tournamentController.createTournament);

router.post('/:id/register', validate(registerPlayerSchema), tournamentController.registerPlayer);

router.post('/:id/score', validate(submitScoreSchema), tournamentController.submitScore);

router.get('/:id/leaderboard', validate(leaderboardSchema), tournamentController.getLeaderboard);

router.get('/:id/player/:playerId', validate(playerRankSchema), tournamentController.getPlayerRank);

module.exports = router;
