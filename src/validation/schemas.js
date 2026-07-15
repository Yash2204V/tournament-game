const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = z.string({
  required_error: 'ID is required',
  invalid_type_error: 'ID must be a string',
}).refine((val) => objectIdRegex.test(val), {
  message: 'Invalid ID format. Must be a 24-character hexadecimal string.',
});

const createPlayerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required').trim(),
    email: z.string({ required_error: 'Email is required' }).min(1, 'Email is required').email('Invalid email address').trim().toLowerCase(),
    country: z.string({ required_error: 'Country is required' }).min(1, 'Country is required').trim(),
  }),
});

const createTournamentSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Tournament name is required' }).min(1, 'Tournament name is required').trim(),
    maxPlayers: z.number({ required_error: 'maxPlayers is required' }).int('maxPlayers must be an integer').gt(0, 'maxPlayers must be greater than 0'),
  }),
});

const registerPlayerSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    playerId: objectIdSchema,
  }),
});

const submitScoreSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    playerId: objectIdSchema,
    score: z.number({ required_error: 'Score is required' }).min(0, 'Score must be greater than or equal to 0'),
  }),
});

const leaderboardSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

const playerRankSchema = z.object({
  params: z.object({
    id: objectIdSchema,
    playerId: objectIdSchema,
  }),
});

module.exports = {
  createPlayerSchema,
  createTournamentSchema,
  registerPlayerSchema,
  submitScoreSchema,
  leaderboardSchema,
  playerRankSchema,
};
