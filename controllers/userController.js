const { getAllUsers, saveUsers, deleteUserById } = require('../models/userModel');
const userModel = require('../models/userModel');

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length >= 5;
const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/.test(password);
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

        const generateUserId = (users) => {
            if (users.length === 0) {
                return 1; // 유저가 없는 경우 ID를 1로 설정
            }
            return Math.max(...users.map(user => user.userId)) + 1; // 가장 큰 ID + 1
        };

        // 새 유저 생성
        const newUser = {
            userId: generateUserId(users),
            email,
            password,
            nickname,
            profile: profile && profile.trim() !== '' ? profile : 'http://localhost:3001/images/default-profile.png', // 기본값 설정
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

// 이메일 중복 확인
const emailValid = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const users = await getAllUsers();
        const emailExists = users.some((user) => user.email === email);

        if (emailExists) {
            return res.status(409).json({ message: 'already_exists', data: null });
        }

        res.status(200).json({ message: 'email_available', data: null });
    } catch (error) {
        console.error('Error during email validation:', error.message);
        res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 닉네임 중복 확인
const nicknameValid = async (req, res) => {
    try {
        const { nickname } = req.query;

        if (!nickname || nickname.length > 10 || /\s/.test(nickname)) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const users = await getAllUsers();
        const nicknameExists = users.some((user) => user.nickname === nickname);

        if (nicknameExists) {
            return res.status(409).json({ message: 'already_exists', data: null });
        }

        res.status(200).json({ message: 'nickname_available', data: null });
    } catch (error) {
        console.error('Error during nickname validation:', error.message);
        res.status(500).json({ message: 'internal_server_error', data: null });
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

        // 유저 정보 확인 로그
        console.log('로그인 요청: user', user);

        if (!user) {
            return res.status(401).json({
                message: 'invalid_account',
                data: null,
            });
        } else if (user.password !== password){
            return res.status(401).json({
                message: 'invalid_password',
                data: null,
            });
        }

        // 세션에 userId 저장
        req.session.userId = user.userId;
        console.log('user.userId:', user.userId); // userId 확인
        console.log('로그인 성공, 세션에 저장된 userId:', req.session.userId); // 디버깅용

        return res.status(200).json({
            message: 'login_success',
            data: { userId: user.userId },
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        return res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 로그아웃 처리
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                message: 'internal_server_error',
                data: null,
            });
        }
        res.status(200).json({
            message: 'logout_success',
            data: null,
        });
    });
};

// 특정 사용자 정보 조회
const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await userModel.getUserById(userId);
        console.log("서버 응답 데이터:", user);
        if (!user) {
            return res.status(404).json({ message: 'User not found', data: null });
        }

        // 프로필 경로를 절대 경로로 변환 (클라이언트가 바로 띄울수있게)
        user.profile = user.profile
            ? `http://localhost:3001${user.profile}`
            : "http://localhost:3001/images/default-profile.png";
        console.log("서버 응답 데이터 user.profile:", user.profile);

         res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', data: null });
    }
};

// 닉네임 변경 처리
const updateNickname = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { nickname } = req.body;

        if (!validateNickname(nickname)) {
            return res.status(400).json({
                message: 'invalid_request',
                data: null,
            });
        }

        const users = await getAllUsers();
        // 닉네임 중복 체크
        if (users.some((u) => u.nickname === nickname && u.userId !== userId)) {
            return res.status(409).json({
                message: 'nickname_already_exists',
                data: null,
            });
        }
        
        const user = users.find((u) => u.userId === userId);

        if (!user) {
            return res.status(404).json({ message: 'user_not_found', data: null });
        }

        user.nickname = nickname;
        await saveUsers(users);

        return res.status(200).json({
            message: 'nickname_updated',
            data: { nickname },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 프로필사진 변경 처리
// TODO: 새로운 이미지가 업로드됐을 때 이전 이미지 삭제 처리...??
const updateProfileImage = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { profile } = req.body;

        const users = await getAllUsers();
        const user = users.find((u) => u.userId === userId);

        if (!user) {
            return res.status(404).json({ message: 'user_not_found', data: null });
        }

        user.profile = profile;
        await saveUsers(users);

        return res.status(200).json({
            message: 'profile_updated',
            data: { profile },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { password } = req.body;

        const users = await getAllUsers();
        const user = users.find((u) => u.userId === userId);

        if (!user) {
            return res.status(404).json({ message: 'user_not_found', data: null });
        }

        user.password = password;
        await saveUsers(users);

        return res.status(201).json({
            message: 'password_changed',
            data: { password },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 회원 탈퇴
const deleteAccount = async (req, res) => {
    try {
        const { userId } = req.params;

        // 사용자가 존재하는지 확인
        const users = await getAllUsers();
        const user = users.find(user => user.userId === parseInt(userId, 10));

        if (!user) {
            return res.status(404).json({
                message: 'user_not_found',
                data: null,
            });
        }

        // 사용자 삭제
        await deleteUserById(userId);

        res.status(200).json({
            message: 'user_deleted',
            data: null,
        });
    } catch (error) {
        console.error('Error deleting account:', error.message);
        res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 프로필 사진 업로드
const createProfile = async (req, res) => {
    try {
        // //디버깅용
        // console.log("요청 본문:", req.body);
        // console.log("업로드된 파일:", req.file);

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
            data: { filePath: filePath },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};


module.exports = { 
    signup,
    emailValid,
    nicknameValid,
    login, 
    getUserById, 
    logout, 
    updateNickname, 
    updateProfileImage,
    deleteAccount,
    updatePassword,
    createProfile,
};
