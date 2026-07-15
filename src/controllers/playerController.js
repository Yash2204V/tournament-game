const playerService = require('../services/playerService');
const asyncHandler = require('../utils/asyncHandler');

const createPlayer = asyncHandler(async (req, res) => {
  const player = await playerService.createPlayer(req.body);
  res.status(201).json({
    status: 'success',
    data: player,
  });
});

module.exports = {
  createPlayer,
};
