const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const userFilePath = path.join(__dirname, '../data/users.json');

// 회원가입 API
router.post('/signup', (req, res) => {
    try {
        const { email, password, nickname, profile } = req.body;

        // 유효성 검사
        if (!email || !password || !nickname) {
            return res.status(400).json({
                message: 'invalid_request',
                data: null,
            });
        }

        // user.json 파일 읽기
        fs.readFile(userFilePath, 'utf-8', (err, data) => {
            if (err) {
                console.error('Error reading user.json:', err);
                return res.status(500).json({
                    message: 'internal_server_error',
                    data: null,
                });
            }

            const users = JSON.parse(data || '[]');

            // 이메일 중복 확인
            if (users.some((user) => user.email === email)) {
                return res.status(409).json({
                    message: 'email_already_exists',
                    data: null,
                });
            }

            // 닉네임 중복 확인
            if (users.some((user) => user.nickname === nickname)) {
                return res.status(409).json({
                    message: 'nickname_already_exists',
                    data: null,
                });
            }

            // 새로운 유저 추가
            const newUser = {
                userId: users.length + 1,
                email,
                password,
                nickname,
                profile: profile || 'https://default.image.jpg',
            };

            users.push(newUser);

            // 업데이트된 유저 데이터 저장
            fs.writeFile(userFilePath, JSON.stringify(users, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to user.json:', writeErr);
                    return res.status(500).json({
                        message: 'internal_server_error',
                        data: null,
                    });
                }

                // 성공 응답
                res.status(201).json({
                    message: 'account_created',
                    data: { userId: newUser.userId },
                });
            });
        });
    } catch (error) {
        console.error('Error during signup:', error.message);
        res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
});

// 이메일 중복확인 API
router.get('/emailValid', (req, res) => {
    const email = req.query.email;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'invalid_request', data: null });
    }

    fs.readFile(userFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading user.json:', err);
            return res.status(500).json({ message: 'internal_server_error', data: null });
        }

        const users = JSON.parse(data || '[]');
        const emailExists = users.some((user) => user.email === email);

        if (emailExists) {
            return res.status(409).json({ message: 'already_exists', data: null });
        }

        res.status(200).json({ message: 'email_available', data: null });
    });
});


// 닉넹미 중복확인 API
router.get('/nicknameValid', (req, res) => {
    const nickname = req.query.nickname;

    if (!nickname || nickname.length > 10 || /\s/.test(nickname)) {
        return res.status(400).json({ message: 'invalid_request', data: null })
      }

    fs.readFile(userFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading user.json:', err);
            return res.status(500).json({ message: 'internal_server_error', data: null });
        }

        const users = JSON.parse(data || '[]');
        const nicknameExists = users.some((user) => user.nickname === nickname);

        if (nicknameExists) {
            return res.status(409).json({ message: 'already_exists', data: null });
        }
        res.status(200).json({ message: 'nickname_available', data: null });
    });
});


// 로그인 API
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        // 유효성 검사
        if (!email || !password) {
            return res.status(400).json({
                message: 'invalid_request',
                data: null,
            });
        }

        // user.json 파일 읽기
        fs.readFile(userFilePath, 'utf-8', (err, data) => {
            if (err) {
                console.error('Error reading user.json:', err);
                return res.status(500).json({
                    message: 'internal_server_error',
                    data: null,
                });
            }

            const users = JSON.parse(data || '[]');
            const user = users.find((user) => user.email === email);

            if (!user) { //이메일이 존재하지 않음
                return res.status(401).json({
                    message: 'invalid_account',
                    data: null,
                });
            }

            if (user.password !== password) {
                return res.status(401).json({
                    message: 'invalid_password',
                    data: null,
                });
            }

            return res.status(200).json({
                message: 'login_success',
                data: null,
            });

        });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
});

module.exports = router;
