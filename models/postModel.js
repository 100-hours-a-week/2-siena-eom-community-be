const fs = require('fs').promises;
const path = require('path');

 const filePath = path.join(__dirname, '../data/posts.json');

// 모든 게시글 데이터 가져오기
const getAllPosts = async () => {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data || '[]');
};
 
// 게시글 데이터 저장
const savePosts = async (posts) => {
    await fs.writeFile(filePath, JSON.stringify(posts, null, 2), 'utf-8');
};

module.exports = { getAllPosts, savePosts };
