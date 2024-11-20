const express = require('express');
const fs = require('fs');
const path = require('path');
const userController = require('../controllers/userController');

const router = express.Router();

const userFilePath = path.join(__dirname, '../data/users.json');

// 특정 사용자 조회
router.get('/:userId', userController.getUserById);

module.exports = router;