import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname( fileURLToPath(import.meta.url) );
const filePath = path.join(__dirname, '../data/users.json');

// 모든 사용자 데이터 가져오기
const getAllUsers = async () => {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data || '[]');
};

// 사용자 데이터 저장
const saveUsers = async (users) => {
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf-8');
};

// 사용자 삭제
const deleteUserById = async (userId) => {
    try {
        const users = await getAllUsers();

        // `userId`와 일치하는 사용자 필터링하여 제거
        const filteredUsers = users.filter(user => user.userId !== parseInt(userId, 10));
        if (filteredUsers.length === users.length) {
            throw new Error(`userId: ${userId} not found`);
        }

        // 변경된 userId.json 저장
        await saveUsers(filteredUsers);
        console.log(`userId ${userId} has been deleted.`);
    } catch (error) {
        console.error(`Error deleting user: ${error.message}`);
        throw error;
    }
};

// 특정 사용자 정보 조회
const getUserById = async (userId) => {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const users = JSON.parse(data);
        
        const user = users.find(user => user.userId === parseInt(userId, 10));
        return user || null;
    } catch (error) {
        console.error(`Error reading user data: ${error.message}`);
        throw new Error('Unable to read user data');
    }
};

const userModel = {
    getAllUsers,
    saveUsers,
    getUserById,
    deleteUserById
}
export default userModel;