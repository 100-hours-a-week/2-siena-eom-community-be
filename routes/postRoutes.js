import express from 'express';
import requireAuth from '../middleware/authMiddleware.js';
import { postWrite,
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
} from '../controllers/postController.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

//좋아요 추가
router.post('/:postId/likes/:userId', requireAuth, addLike);

// 좋아요 삭제
router.delete("/:postId/likes/:userId", requireAuth, removeLike);

// 댓글 삭제
router.delete('/:postId/comments/:commentId', requireAuth, deleteComment);

// 댓글 수정
router.patch('/:postId/comments/:commentId', requireAuth, updateComment);

// 댓글 조회
router.get('/:postId/comments/:commentId', requireAuth, getCommentById);

// 특정 게시글의 댓글 목록 조회
router.get('/:postId/comments', getCommentsByPostId);

// 댓글 작성
router.post('/:postId/comments', requireAuth, commentWrite);

// 게시글 이미지 업로드
router.post('/:postId/postImage', upload.single('postImage'), createPostImg);

// 게시글 조회수 증가
router.post('/:postId/viewCount', requireAuth, increaseView);

// 게시글 상세 조회
router.get('/:postId', requireAuth, getPostById);

// 게시글 수정
router.patch('/:postId', requireAuth, updatePost);

// 게시글 삭제
router.delete('/:postId', requireAuth, deletePost);

// 게시글 작성
router.post('/', requireAuth, postWrite);

// 게시글 목록 조회
router.get('/', getPostList);

export default router;