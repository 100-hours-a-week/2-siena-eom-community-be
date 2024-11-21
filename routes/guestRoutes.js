const express = require('express');
const {
    signup,
    emailValid,
    nicknameValid,
    login,
} = require('../controllers/userController');

const router = express.Router();

// 회원가입
router.post('/signup', signup);

// 이메일 중복 확인
router.get('/emailValid', emailValid);

// 닉네임 중복 확인
router.get('/nicknameValid', nicknameValid);

// 로그인
router.post('/login', login);

module.exports = router;
