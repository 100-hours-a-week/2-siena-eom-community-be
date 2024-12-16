const fs = require('fs').promises;
const path = require('path');
const filePath = path.join(__dirname, '../data/posts.json');
const commentFilePath = path.join(__dirname, '../data/comments.json');

// 모든 게시글 데이터 가져오기
const getAllPosts = async () => {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data || '[]');
};
 
// 게시글 데이터 저장
const savePosts = async (posts) => {
    await fs.writeFile(filePath, JSON.stringify(posts, null, 2), 'utf-8');
};

// 게시글 상세 조회
const getPostById = async (postId) => {
    try {
        const posts = await getAllPosts();
        const post = posts.find(post => post.postId === parseInt(postId, 10));
        
        return post || null;
    } catch (error) {
        console.error(`Error reading post data: ${error.message}`);
    }
};

// 게시글 삭제
const deletePostById = async (postId) => {
    try {
        const posts = await getAllPosts();
        const filteredPosts = posts.filter(post => post.postId !== postId);

        await savePosts(filteredPosts);
        console.log(`postId ${postId} has been deleted.`);
    } catch (error) {
        console.error(`Error deleting post: ${error.message}`);
    }
};

// 모든 댓글 가져오기
const getAllComments = async () => {
    try {
        const data = await fs.readFile(commentFilePath, 'utf-8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error(`Error reading comments data: ${error.message}`);
    }
};

// 댓글 데이터 저장
const saveComments = async (comments) => {
    await fs.writeFile(commentFilePath, JSON.stringify(comments, null, 2), 'utf-8');
};

// 특정 댓글 조회
const getCommentById = async (postId, commentId) => {
    try {
        const parsedPostId = parseInt(postId, 10);
        const parsedCommentId = parseInt(commentId, 10);

        const data = await fs.readFile(commentFilePath, 'utf-8');
        const comments = JSON.parse(data);

        const comment = comments.find(
            (comment) =>
                parseInt(comment.postId, 10) === parsedPostId &&
                parseInt(comment.commentId, 10) === parsedCommentId
        );

        console.log("Comment found:", comment || "Not found");
        return comment || null;
    } catch (error) {
        console.error(`Error in getCommentById: ${error.message}`);
        throw new Error('Unable to read comment data');
    }
};

// 댓글 삭제
const deleteCommentById = async (commentId) => {
    try {
        const parsedCommentId = parseInt(commentId, 10);
        if (isNaN(parsedCommentId)) {
            throw new Error(`Invalid commentId: ${commentId}`);
        }

        const comments = await getAllComments();
        const filteredComments = comments.filter(
            (comment) => parseInt(comment.commentId, 10) !== parsedCommentId
        );

        if (comments.length === filteredComments.length) {
            throw new Error(`commentId ${parsedCommentId} not found`);
        }

        await saveComments(filteredComments);
    } catch (error) {
        throw error;
    }
};

module.exports = { 
    getAllPosts, 
    savePosts, 
    getPostById, 
    deletePostById,
    getAllComments,
    saveComments,
    getCommentById,
    deleteCommentById,
};
