const fs = require('fs').promises;
const path = require('path');

 const filePath = path.join(__dirname, '../data/users.json');
//const filePath = './data/users.json';

// 모든 사용자 데이터 가져오기
const getAllUsers = async () => {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data || '[]');
};

// 사용자 데이터 저장
const saveUsers = async (users) => {
    await fs.writeFile(filePath, JSON.stringify(users, null, 2), 'utf-8');
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

module.exports = { getAllUsers, saveUsers, getUserById };
