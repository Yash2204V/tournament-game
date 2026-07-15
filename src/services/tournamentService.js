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

    
    const scores = await Score.find({ tournamentId })
      .populate('playerId', 'name email country')
      .sort({ score: -1, updatedAt: 1 }); 

    
    let currentRank = 0;
    let lastScore = null;
    let count = 0;

    const leaderboard = scores.map((s) => {
      count++;
      if (s.score !== lastScore) {
        currentRank = count;
        lastScore = s.score;
      }
      return {
        rank: currentRank,
        playerId: s.playerId._id,
        name: s.playerId.name,
        email: s.playerId.email,
        country: s.playerId.country,
        score: s.score,
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

    if (!playerRankInfo) {
      throw new NotFoundError(`No score submitted by this player for this tournament`);
    }

    return {
      playerId: playerRankInfo.playerId,
      name: playerRankInfo.name,
      rank: playerRankInfo.rank,
      score: playerRankInfo.score,
    };
  }
}

module.exports = new TournamentService();
