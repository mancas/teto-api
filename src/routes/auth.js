'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/login', authController.authenticate);
router.post('/authenticate', authController.isAuthenticated);

module.exports = router;
