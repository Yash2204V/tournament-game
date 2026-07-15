const Player = require('../models/Player');
const { ConflictError } = require('../utils/errors');

class PlayerService {
  
  async createPlayer(playerData) {
    const { name, email, country } = playerData;

    const existingPlayer = await Player.findOne({ email });
    if (existingPlayer) {
      throw new ConflictError(`Email '${email}' is already registered.`);
    }

    const player = new Player({ name, email, country });
    await player.save();
    return player;
  }
}

module.exports = new PlayerService();
