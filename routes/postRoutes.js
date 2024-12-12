const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const { postWrite,
        getPostList,
        getPostById,
        updatePost,
        deletePost,
        commentWrite,
        updateComment,
        getCommentById,
        deleteComment,
        addLike,
        removeLike,
        createPostImg,
        increaseView,
        getCommentsByPostId,
    } = require('../controllers/postController');
const upload = require("../middleware/multer");

const router = express.Router();

//좋아요 추가
router.post('/:postId/likes/:userId', requireAuth, addLike);

// 좋아요 삭제
router.delete("/:postId/likes/:userId", requireAuth, removeLike);

// 특정 게시글의 댓글 목록 조회
router.get('/:postId/comments', getCommentsByPostId);

// 댓글 삭제
router.delete('/:postId/comments/:commentId', requireAuth, deleteComment);

// 댓글 수정
router.patch('/:postId/comments/:commentId', requireAuth, updateComment);

// 댓글 조회
router.get('/:postId/comments/:commentId', requireAuth, getCommentById);

// 댓글 작성
router.post('/:postId/comments', requireAuth, commentWrite);

// 게시글 이미지 업로드
router.post('/:postId/postImage', upload.single('postImage'), createPostImg);

// 게시글 조회수 증가
router.post('/:postId/viewCount', requireAuth, increaseView);

// 게시글 상세 조회
router.get('/:postId', requireAuth, getPostById);
// router.get('/:postId', getPostById); // 포스트맨 테스트용

// 게시글 수정
router.patch('/:postId', requireAuth, updatePost);

// 게시글 삭제
router.delete('/:postId', requireAuth, deletePost);

// 게시글 작성
router.post('/', requireAuth, postWrite);

// 게시글 목록 조회
router.get('/', getPostList);

module.exports = router;