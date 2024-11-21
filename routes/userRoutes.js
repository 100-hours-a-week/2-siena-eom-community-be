const express = require('express');
const userController = require('../controllers/userController');
const requireAuth = require('../middleware/authMiddleware');
const { getUserById, 
        updateNickname, 
        updateProfileImage, 
        nicknameValid,
        updatePassword,
        logout,
        deleteAccount, 
    } = require('../controllers/userController');

const router = express.Router();

// 특정 사용자 조회
router.get('/:userId', userController.getUserById);

// 회원 정보 조회
router.get('/:userId', requireAuth, getUserById);

// 닉네임 수정
router.patch('/:userId/nickname', requireAuth, updateNickname);

//닉네임 중복확인
router.get('/:userId/nicknameValid', requireAuth, nicknameValid);

// 프로필 이미지 수정
router.put('/:userId/profile', requireAuth, updateProfileImage);

// 비밀번호 수정
router.patch('/:userId/password', requireAuth, updatePassword);

// 로그아웃
router.post('/logout', requireAuth, logout);

// 회원 탈퇴
router.delete('/:userId', deleteAccount);

module.exports = router;