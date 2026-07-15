const tournamentService = require('../services/tournamentService');
const asyncHandler = require('../utils/asyncHandler');

const createTournament = asyncHandler(async (req, res) => {
  const tournament = await tournamentService.createTournament(req.body);
  res.status(201).json({
    status: 'success',
    data: tournament,
  });
});

const registerPlayer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { playerId } = req.body;
  const registration = await tournamentService.registerPlayer(id, playerId);
  res.status(201).json({
    status: 'success',
    data: registration,
  });
});

const submitScore = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { playerId, score } = req.body;
  const scoreEntry = await tournamentService.submitScore(id, playerId, score);
  res.status(200).json({
    status: 'success',
    data: scoreEntry,
  });
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const leaderboard = await tournamentService.getLeaderboard(id);
  res.status(200).json({
    status: 'success',
    data: leaderboard,
  });
});

const getPlayerRank = asyncHandler(async (req, res) => {
  const { id, playerId } = req.params;
  const rankInfo = await tournamentService.getPlayerRank(id, playerId);
  res.status(200).json({
    status: 'success',
    data: rankInfo,
  });
});

module.exports = {
  createTournament,
  registerPlayer,
  submitScore,
  getLeaderboard,
  getPlayerRank,
};
