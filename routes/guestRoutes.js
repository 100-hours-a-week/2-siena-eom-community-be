import express from 'express';
import {
    signup,
    emailValid,
    nicknameValid,
    login,
    createProfile,
} from '../controllers/userController.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// 회원가입
router.post('/signup', signup);

// 이메일 중복 확인
router.post('/emailValid', emailValid);

// 닉네임 중복 확인
router.get('/nicknameValid', nicknameValid);

// 로그인
router.post('/login', login);

// 프로필 사진 업로드
router.post('/profile', upload.single('profile'), createProfile);

export default router;