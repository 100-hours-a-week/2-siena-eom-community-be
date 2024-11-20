const { getAllUsers, saveUsers } = require('../models/userModel');
const userModel = require('../models/userModel');


const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length >= 5;
const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/.test(password);
const validateNickname = (nickname) => nickname.length <= 10 && !/\s/.test(nickname);

// 회원가입 처리
const signup = async (req, res) => {
    try {
        const { email, password, nickname, profile } = req.body;

        // 필수 필드 유효성 검사
        if (!email || !password || !nickname || !validateEmail(email) || !validatePassword(password) || !validateNickname(nickname)) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const users = await getAllUsers();

        // 중복 이메일 검사
        if (users.some((user) => user.email === email)) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        // 새 유저 생성
        const newUser = {
            userId: users.length + 1,
            email,
            password,
            nickname,
            profile: profile || 'https://default.image.jpg', // 기본 이미지
        };

        users.push(newUser);
        await saveUsers(users);

        return res.status(201).json({
            message: 'account_created',
            data: { userId: newUser.userId },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }

};

// 로그인 처리
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || !validateEmail(email) || !validatePassword(password)) {
            return res.status(400).json({
                message: 'invalid_request',
                data: null,
            });
        }

        const users = await getAllUsers();
        const user = users.find((user) => user.email === email);

        if (!user || user.password !== password) {
            return res.status(401).json({
                message: 'invalid_account',
                data: null,
            });
        }

        return res.status(200).json({
            message: 'login_success',
            data: null,
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        return res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 특정 사용자 정보 조회
const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.getUserById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = { signup, login, getUserById };
