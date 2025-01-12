import pool from '../db.js';

const postModel = {
    // 모든 게시글 데이터 가져오기
    async getAllPosts() {
        const [rows] = await pool.query('SELECT * FROM post');
        return rows;
    },

    // 게시글 저장
    async savePost(post) {
        const { postId, author, title, content, postImage, postDate, likeCount, view, commentsCount } = post;
        if (postId) {
            // 업데이트
            await pool.query(
                'UPDATE post SET author = ?, title = ?, content = ?, postImage = ?, postDate = ?, likeCount = ?, view = ?, commentsCount = ? WHERE postId = ?',
                [author, title, content, postImage, postDate, likeCount, view, commentsCount, postId]
            );
        } else {
            // 삽입
            await pool.query(
                'INSERT INTO post (author, title, content, postImage, postDate, likeCount, view, commentsCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [author, title, content, postImage, postDate, likeCount || 0, view || 0, commentsCount || 0]
            );
        }
    },

    // 게시글 상세 조회
    async getPostById(postId) {
        const [[post]] = await pool.query('SELECT * FROM post WHERE postId = ?', [postId]);
        return post || null;
    },

    // 게시글 삭제
    async deletePostById(postId) {
        await pool.query('DELETE FROM likes WHERE postId = ?', [postId]);
        await pool.query('DELETE FROM comment WHERE postId = ?', [postId]);
        await pool.query('DELETE FROM post WHERE postId = ?', [postId]);
    },

    // 조회수 증가
    async incrementViewCount(postId) {
        try {
            await pool.query('UPDATE post SET view = view + 1 WHERE postId = ?', [postId]);
        } catch (error) {
            console.error('Error incrementing view count:', error);
            throw new Error('Database query failed');
        }
    },

    // 모든 댓글 데이터 가져오기
    async getAllComments() {
        const [rows] = await pool.query('SELECT * FROM comment');
        return rows;
    },

    // 댓글 저장
    async saveComment(comment) {
        const { commentId, postId, commentAuthor, content, commentDate } = comment;
        if (commentId) {
            // 업데이트
            await pool.query(
                'UPDATE comment SET postId = ?, commentAuthor = ?, content = ?, commentDate = ? WHERE commentId = ?',
                [postId, commentAuthor, content, commentDate, commentId]
            );
        } else {
            // 삽입
            await pool.query(
                'INSERT INTO comment (postId, commentAuthor, content, commentDate) VALUES (?, ?, ?, ?)',
                [postId, commentAuthor, content, commentDate]
            );
        }
    },

    // 특정 댓글 조회
    async getCommentById(postId, commentId) {
        const [[comment]] = await pool.query(
            'SELECT * FROM comment WHERE postId = ? AND commentId = ?',
            [postId, commentId]
        );
        return comment || null;
    },

    // 특정 게시글에 달린 댓글 조회
    async getCommentsByPostId(postId) {
        const [rows] = await pool.query('SELECT * FROM comment WHERE postId = ?', [postId]);
        return rows;
    },

    // 댓글 삭제
    async deleteCommentById(commentId) {
        await pool.query('DELETE FROM comment WHERE commentId = ?', [commentId]);
    },

    // 댓글 수 증가
    async incrementCommentsCount(postId) {
        await pool.query('UPDATE post SET commentsCount = commentsCount + 1 WHERE postId = ?', [postId]);
    },

    // 댓글 수 감소
    async decrementCommentsCount(postId) {
        await pool.query('UPDATE post SET commentsCount = GREATEST(commentsCount - 1, 0) WHERE postId = ?', [postId]);
    },

    // 좋아요 누른 사용자 userId 반환
    async getLikesByPostId(postId) {
        const [rows] = await pool.query('SELECT userId FROM likes WHERE postId = ?', [postId]);
        return rows.map(row => row.userId); // userId 배열 반환
    },
    
    // 좋아요 존재 여부 확인
    async checkLike(postId, userId) {
        const [[like]] = await pool.query('SELECT * FROM likes WHERE postId = ? AND userId = ?', [postId, userId]);
        return !!like; // like가 존재하면 true 반환
    },

    // 좋아요 추가
    async addLike(postId, userId) {
        await pool.query('INSERT INTO likes (postId, userId) VALUES (?, ?)', [postId, userId]);
        await pool.query('UPDATE post SET likeCount = likeCount + 1 WHERE postId = ?', [postId]);
    },

    // 좋아요 삭제
    async removeLike(postId, userId) {
        await pool.query('DELETE FROM likes WHERE postId = ? AND userId = ?', [postId, userId]);
        await pool.query('UPDATE post SET likeCount = GREATEST(likeCount - 1, 0) WHERE postId = ?', [postId]);
    },

};

export default postModel;
