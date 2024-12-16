const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const { getUserById, 
        updateNickname, 
        updateProfileImage,
        nicknameValid,
        updatePassword,
        logout,
        deleteAccount,
        createProfile, 
    } = require('../controllers/userController');
const upload = require("../middleware/multer");

const router = express.Router();

// 닉네임 수정
router.patch('/:userId/nickname', requireAuth, updateNickname);

//닉네임 중복확인
router.get('/:userId/nicknameValid', requireAuth, nicknameValid);

// 프로필 이미지 수정
router.put('/:userId/profile', requireAuth, updateProfileImage);
router.post('/:userId/profile', upload.single('profile'), createProfile);

// 비밀번호 수정
router.patch('/:userId/password', requireAuth, updatePassword);

// 특정 회원 정보 조회
router.get('/:userId', requireAuth, getUserById);

// 회원 탈퇴
router.delete('/:userId', requireAuth, deleteAccount);

// 로그아웃
router.post('/logout', requireAuth, logout);

module.exports = router;