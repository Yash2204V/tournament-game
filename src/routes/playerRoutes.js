const express = require('express');
const playerController = require('../controllers/playerController');
const validate = require('../middlewares/validate');
const { createPlayerSchema } = require('../validation/schemas');

const router = express.Router();

router.post('/', validate(createPlayerSchema), playerController.createPlayer);

module.exports = router;
