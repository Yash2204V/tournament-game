const Tournament = require('../models/Tournament');
const Player = require('../models/Player');
const Registration = require('../models/Registration');
const Score = require('../models/Score');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors');

class TournamentService {
  
  async createTournament(tournamentData) {
    const { name, maxPlayers } = tournamentData;
    const tournament = new Tournament({ name, maxPlayers });
    await tournament.save();
    return tournament;
  }

  async registerPlayer(tournamentId, playerId) {
    
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new NotFoundError(`Tournament not found`);
    }
    
    const player = await Player.findById(playerId);
    if (!player) {
      throw new NotFoundError(`Player not found`);
    }
    
    const existingRegistration = await Registration.findOne({ tournamentId, playerId });
    if (existingRegistration) {
      throw new ConflictError(`Player is already registered for this tournament`);
    }
    
    const currentRegistrationCount = await Registration.countDocuments({ tournamentId });
    if (currentRegistrationCount >= tournament.maxPlayers) {
      throw new BadRequestError(`Tournament has reached its capacity limit of ${tournament.maxPlayers} players`);
    }

    const registration = new Registration({ tournamentId, playerId });
    await registration.save();
    return registration;
  }
  
  async submitScore(tournamentId, playerId, score) {
    
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new NotFoundError(`Tournament not found`);
    }
    
    const player = await Player.findById(playerId);
    if (!player) {
      throw new NotFoundError(`Player not found`);
    }
    
    const registration = await Registration.findOne({ tournamentId, playerId });
    if (!registration) {
      throw new BadRequestError(`Player is not registered for this tournament`);
    }
    
    let scoreEntry = await Score.findOne({ tournamentId, playerId });
    if (scoreEntry) {
      scoreEntry.score = score;
      await scoreEntry.save();
    } else {
      scoreEntry = new Score({ tournamentId, playerId, score });
      await scoreEntry.save();
    }

    return scoreEntry;
  }
  
  async getLeaderboard(tournamentId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new NotFoundError(`Tournament not found`);
    }

    const registrations = await Registration.find({ tournamentId })
      .populate('playerId', 'name email country');

    const scores = await Score.find({ tournamentId });

    const scoreMap = new Map();
    scores.forEach(s => {
      scoreMap.set(s.playerId.toString(), {
        score: s.score,
        updatedAt: s.updatedAt
      });
    });

    const combined = registrations
      .filter(reg => reg.playerId)
      .map(reg => {
        const player = reg.playerId;
        const scoreInfo = scoreMap.get(player._id.toString()) || { score: 0, updatedAt: reg.createdAt };
        return {
          playerId: player._id,
          name: player.name,
          email: player.email,
          country: player.country,
          score: scoreInfo.score,
          updatedAt: scoreInfo.updatedAt
        };
      });

    combined.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.updatedAt) - new Date(b.updatedAt);
    });

    let currentRank = 0;
    let lastScore = null;
    let count = 0;

    const leaderboard = combined.map((entry) => {
      count++;
      if (entry.score !== lastScore) {
        currentRank = count;
        lastScore = entry.score;
      }
      return {
        rank: currentRank,
        playerId: entry.playerId,
        name: entry.name,
        email: entry.email,
        country: entry.country,
        score: entry.score,
      };
    });

    return leaderboard;
  }

  async getPlayerRank(tournamentId, playerId) {
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new NotFoundError(`Tournament not found`);
    }

    const player = await Player.findById(playerId);
    if (!player) {
      throw new NotFoundError(`Player not found`);
    }

    const registration = await Registration.findOne({ tournamentId, playerId });
    if (!registration) {
      throw new BadRequestError(`Player is not registered for this tournament`);
    }

    const leaderboard = await this.getLeaderboard(tournamentId);
    const playerRankInfo = leaderboard.find(
      (entry) => entry.playerId.toString() === playerId.toString()
    );

    return {
      playerId: playerRankInfo.playerId,
      name: playerRankInfo.name,
      rank: playerRankInfo.rank,
      score: playerRankInfo.score,
    };
  }
}

module.exports = new TournamentService();
