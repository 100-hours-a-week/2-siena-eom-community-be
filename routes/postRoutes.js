const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const { postWrite,
    } = require('../controllers/postController');

const router = express.Router();

// 게시글 작성
router.post('/', requireAuth, postWrite);

module.exports = router;