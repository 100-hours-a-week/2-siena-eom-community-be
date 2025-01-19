import pool from '../db.js';

const userModel = {
    // 모든 사용자 데이터 가져오기
    async getAllUsers() {
        const [rows] = await pool.query('SELECT * FROM user');
        return rows;
    },

    // 사용자 저장 (업데이트 또는 삽입)
    async saveUser(user) {
        const { userId, email, password, nickname, profile } = user;
        if (userId) {
            // 업데이트
            await pool.query(
                'UPDATE user SET email = ?, password = ?, nickname = ?, profile = ? WHERE userId = ?',
                [email, password, nickname, profile, userId]
            );
        } else {
            // 삽입
            await pool.query(
                'INSERT INTO user (email, password, nickname, profile) VALUES (?, ?, ?, ?)',
                [email, password, nickname, profile]
            );
        }
    },

    // 특정 사용자 정보 조회
    async getUserById(userId) {
        const [[user]] = await pool.query('SELECT * FROM user WHERE userId = ?', [userId]);
        return user || null;
    },

    // 사용자 삭제
    // async deleteUserById(userId) {
    //     await pool.query('DELETE FROM user WHERE userId = ?', [userId]);
    // },
    
    // 사용자 삭제
    async deleteUserById(userId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // likes 테이블에서 해당 사용자의 데이터 삭제
            await connection.query('DELETE FROM likes WHERE userId = ?', [userId]);

            // 게시글 작성자 정보를 NULL로 설정
            await connection.query('UPDATE post SET author = NULL WHERE author = ?', [userId]);

            // 사용자 삭제
            await connection.query('DELETE FROM user WHERE userId = ?', [userId]);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // 특정 이메일로 사용자 조회
    async getUserByEmail(email) {
        const [[user]] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
        return user || null;
    },

    // 이메일 중복 확인
    async checkEmail(email) {
        const [[result]] = await pool.query('SELECT COUNT(*) as count FROM user WHERE email = ?', [email]);
        return result.count > 0;
    },

    // 닉네임 중복 확인
    async checkNickname(nickname) {
        const [[result]] = await pool.query('SELECT COUNT(*) as count FROM user WHERE nickname = ?', [nickname]);
        return result.count > 0;
    },

    // 닉네임 업데이트
    async updateNickname(userId, nickname) {
        await pool.query('UPDATE user SET nickname = ? WHERE userId = ?', [nickname, userId]);
    },

    // 프로필 이미지 업데이트
    async updateProfile(userId, profile) {
        await pool.query('UPDATE user SET profile = ? WHERE userId = ?', [profile, userId]);
    },

    // 비밀번호 업데이트
    async updatePassword(userId, hashedPassword) {
        await pool.query('UPDATE user SET password = ? WHERE userId = ?', [hashedPassword, userId]);
    },
};

export default userModel;
