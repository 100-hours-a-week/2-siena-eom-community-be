import userModel from '../models/userModel.js';
//import BASE_IP from '../config.js';
import bcrypt from 'bcrypt';
const BASE_IP = process.env.BASE_IP;

const saltRounds = 10;
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length >= 5;
const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/.test(password);
const validateNickname = (nickname) => nickname.length <= 10 && !/\s/.test(nickname);

// 회원가입 처리
const signup = async (req, res) => {
    try {
        const { email, password, nickname, profile } = req.body;

        if (!email || !password || !nickname || !validateEmail(email) || !validatePassword(password) || !validateNickname(nickname)) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const emailExists = await userModel.checkEmail(email);

        if (emailExists) {
            return res.status(400).json({ message: 'email_already_exists', data: null });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = {
            email,
            password: hashedPassword,
            nickname,
            profile: profile && profile.trim() !== '' ? profile : `${BASE_IP}/images/default-profile.png`,
        };

        const userId = await userModel.saveUser(newUser);

        return res.status(201).json({
            message: 'account_created',
            data: { userId },
        });
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 이메일 중복 확인
const emailValid = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !validateEmail(email)) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const emailExists = await userModel.checkEmail(email);

        if (emailExists) {
            return res.status(409).json({ message: 'already_exists', data: null });
        }

        res.status(200).json({ message: 'email_available', data: null });
    } catch (error) {
        console.error('Error during email validation:', error);
        res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 닉네임 중복 확인
const nicknameValid = async (req, res) => {
    try {
        const { nickname } = req.query;
        if (!nickname || !validateNickname(nickname)) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const nicknameExists = await userModel.checkNickname(nickname);

        if (nicknameExists) {
            return res.status(409).json({ message: 'already_exists', data: null });
        }

        res.status(200).json({ message: 'nickname_available', data: null });
    } catch (error) {
        console.error('Error during nickname validation:', error);
        res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 로그인 처리
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || !validateEmail(email) || !validatePassword(password)) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const user = await userModel.getUserByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'invalid_account', data: null });
        }

        const isPassword = await bcrypt.compare(password, user.password);
        if (!isPassword) {
            return res.status(401).json({ message: 'invalid_password', data: null });
        }

        req.session.userId = user.userId;

        return res.status(200).json({
            message: 'login_success',
            data: { userId: user.userId },
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 로그아웃 처리
const logout = (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: 'unauthorized', data: null });
    }

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'internal_server_error', data: null });
        }
        res.status(200).json({ message: 'logout_success', data: null });
    });
};

// 특정 사용자 정보 조회
const getUserBySession = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ message: 'unauthorized', data: null });
        }

        const user = await userModel.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'user_not_found', data: null });
        }

        return res.status(200).json({
            message: 'success',
            data: {
                userId: user.userId,
                email: user.email,
                nickname: user.nickname,
                profile: user.profile,
            },
        });
    } catch (error) {
        console.error('Error during user session retrieval:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 닉네임 변경 처리
const updateNickname = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { nickname } = req.body;

        if (!nickname || !validateNickname(nickname)) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const nicknameExists = await userModel.checkNickname(nickname);
        if (nicknameExists) {
            return res.status(409).json({ message: 'nickname_already_exists', data: null });
        }

        await userModel.updateNickname(userId, nickname);

        return res.status(200).json({
            message: 'nickname_updated',
            data: { nickname },
        });
    } catch (error) {
        console.error('Error updating nickname:', error);
        res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 프로필사진 변경 처리
const updateProfileImage = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { profile } = req.body;

        if (!profile) {
            return res.status(400).json({ message: 'invalid_profile_path', data: null });
        }

        await userModel.updateProfile(userId, profile);

        return res.status(200).json({
            message: 'profile_updated',
            data: { profile },
        });
    } catch (error) {
        console.error('Error updating profile image:', error);
        res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 비밀번호 변경 처리
const updatePassword = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { password } = req.body;

        if (!password || !validatePassword(password)) {
            return res.status(400).json({ message: 'invalid_password', data: null });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await userModel.updatePassword(userId, hashedPassword);

        return res.status(200).json({
            message: 'password_updated',
            data: null,
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 회원 탈퇴
const deleteAccount = async (req, res) => {
    try {
        const userId = req.session.userId;

        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'user_not_found', data: null });
        }

        await userModel.deleteUserById(userId);

        req.session.destroy((err) => {
            if (err) {
                throw new Error('Failed to destroy session');
            }
        });

        return res.status(200).json({
            message: 'account_deleted',
            data: null,
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 프로필사진 업로드
const createProfile = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                message: 'invalid_file',
                data: null,
            });
        }

        const filePath = `/uploads/${file.filename}`;
        return res.status(201).json({
            message: 'profile_upload_success',
            data: { filePath: `${BASE_IP}${filePath}` },
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

export {
    signup,
    emailValid,
    nicknameValid,
    login,
    logout,
    getUserBySession,
    updateNickname,
    updateProfileImage,
    updatePassword,
    deleteAccount,
    createProfile,
};
