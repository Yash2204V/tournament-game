const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
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
  score: {
    type: Number,
    required: true,
    min: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

scoreSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

scoreSchema.index({ tournamentId: 1, playerId: 1 }, { unique: true });

module.exports = mongoose.model('Score', scoreSchema);
