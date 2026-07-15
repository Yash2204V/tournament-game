const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

registrationSchema.index({ tournamentId: 1, playerId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
