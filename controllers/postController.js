import postModel from '../models/postModel.js';
import userModel from '../models/userModel.js';
const BASE_IP = process.env.BASE_IP;

const formatDate = (date = new Date() ) => {
    const formatter = new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const parts = formatter.formatToParts(new Date(date));
    const yyyy = parts.find(part => part.type === 'year').value;
    const mm = parts.find(part => part.type === 'month').value;
    const dd = parts.find(part => part.type === 'day').value;
    const hh = parts.find(part => part.type === 'hour').value;
    const min = parts.find(part => part.type === 'minute').value;
    const ss = parts.find(part => part.type === 'second').value;

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

// 게시글 작성 처리
const postWrite = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { title, content, postImage } = req.body;

        if (!userId || !title || !content) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const postDate = formatDate();

        const newPost = {
            author: userId,
            title,
            content,
            postImage: postImage || null,
            postDate,
            likeCount: 0,
            view: 0,
            commentsCount: 0,
        };

        const postId = await postModel.savePost(newPost);

        return res.status(201).json({
            message: 'post_created',
            data: { postId },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 게시글 목록 조회
const getPostList = async (req, res) => {
    try {
        const posts = await postModel.getAllPosts();
        const users = await userModel.getAllUsers();

        const postsWithAuthor = posts.map(post => {
            const author = users.find(user => user.userId === post.author);

            // postDate 포맷팅
            if (post.postDate) {
                const utcDate = new Date(post.postDate);
                post.postDate = formatDate(utcDate);
            }

            return {
                ...post,
                authorProfile: author?.profile || `${BASE_IP}/images/default-profile.png`,
                authorNickname: author?.nickname || 'Unknown',
            };
        });

        return res.status(200).json({
            message: 'posts_loaded',
            data: postsWithAuthor,
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 게시글 상세 조회
const getPostById = async (req, res) => {
    try {
        const postId = parseInt(req.params.postId, 10);
        const post = await postModel.getPostById(postId);
        if (!post) {
            return res.status(404).json({ message: 'post_not_found', data: null });
        }
        
        // postDate 포맷팅
        if (post.postDate) {
            const utcDate = new Date(post.postDate);
            post.postDate = formatDate(utcDate);
        }
        
        const users = await userModel.getAllUsers();
        const comments = await postModel.getAllComments();
        const likes = await postModel.getLikesByPostId(postId);

        const author = users.find(user => user.userId === post.author);
        const commentsWithAuth = comments
            .filter(comment => comment.postId === postId)
            .map(comment => {
                const commentAuthor = users.find(user => user.userId === comment.commentAuthor);
                // commentDate 포맷팅
                if (comment.commentDate) {
                    const utcDate = new Date(comment.commentDate);
                    comment.commentDate = formatDate(utcDate);
                }
                return {
                    ...comment,
                    authorProfile: commentAuthor?.profile || `${BASE_IP}/images/default-profile.png`,
                    authorNickname: commentAuthor?.nickname || 'Unknown',
                };
            });

        return res.status(200).json({
            message: 'post_loaded',
            data: {
                ...post,
                postImage: post.postImage,
                authorProfile: author?.profile || `${BASE_IP}/images/default-profile.png`,
                authorNickname: author?.nickname || 'Unknown',
                likes,
                likeCount: post.likeCount,
                commentsCount: post.commentsCount || 0, // 기본값 추가
                comments: commentsWithAuth,
            },
        });
    } catch (error) {
        console.error('Error loading post:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 게시글 수정 처리
const updatePost = async (req, res) => {
    try {
        const userId = req.session.userId;
        const postId = parseInt(req.params.postId, 10);
        const { title, content, postImage } = req.body;

        const post = await postModel.getPostById(postId);
        if (!post) {
            return res.status(404).json({ message: 'post_not_found', data: null });
        }

        if (post.author !== userId) {
            return res.status(403).json({ message: 'forbidden_action', data: null });
        }

        await postModel.savePost({
            ...post,
            title,
            content,
            postImage: postImage || post.postImage,
        });

        return res.status(200).json({
            message: 'post_updated',
            data: { postId },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 게시글 삭제
const deletePost = async (req, res) => {
    try {
        const userId = req.session.userId;
        const postId = parseInt(req.params.postId, 10);

        const post = await postModel.getPostById(postId);
        if (!post) {
            return res.status(404).json({ message: 'post_not_found', data: null });
        }

        if (post.author !== userId) {
            return res.status(403).json({ message: 'forbidden_action', data: null });
        }

        await postModel.deletePostById(postId);

        return res.status(200).json({
            message: 'post_deleted',
            data: null,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 댓글 작성
const commentWrite = async (req, res) => {
    try {
        const userId = req.session.userId;
        const postId = parseInt(req.params.postId, 10);
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const post = await postModel.getPostById(postId);
        if (!post) {
            return res.status(404).json({ message: 'post_not_found', data: null });
        }

        const commentDate = formatDate();
        const commentId = await postModel.saveComment({
            postId,
            commentAuthor: userId,
            content,
            commentDate,
        });

        // 댓글 수 증가
        await postModel.incrementCommentsCount(postId);

        return res.status(201).json({
            message: 'comment_created',
            data: { commentId },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 댓글 수정
const updateComment = async (req, res) => {
    try {
        const userId = req.session.userId;
        const commentId = parseInt(req.params.commentId, 10);
        const postId = parseInt(req.params.postId,10);

        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const comment = await postModel.getCommentById(postId, commentId);
        if (!comment) {
            return res.status(404).json({ message: 'comment_not_found', data: null });
        }

        // 댓글 작성자 확인
        if (comment.commentAuthor !== userId) {
            return res.status(403).json({ message: 'forbidden_action', data: null });
        }

        const updatedComment = {
            ...comment,
            content,
            commentDate: formatDate(), // 수정 시간 업데이트
        };

        await postModel.saveComment(updatedComment);

        return res.status(200).json({
            message: 'comment_updated',
            data: null,
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 댓글 삭제
const deleteComment = async (req, res) => {
    try {
        const userId = req.session.userId;
        const commentId = parseInt(req.params.commentId, 10);
        const postId = parseInt(req.params.postId,10);

        const comment = await postModel.getCommentById(postId, commentId);
        if (!comment) {
            return res.status(404).json({ message: 'comment_not_found', data: null });
        }

        if (comment.commentAuthor !== userId) {
            return res.status(403).json({ message: 'forbidden_action', data: null });
        }

        await postModel.deleteCommentById(commentId);
        await postModel.decrementCommentsCount(comment.postId); // 댓글 수 감소

        return res.status(200).json({
            message: 'comment_deleted',
            data: null,
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 댓글 조회
const getCommentById = async (req, res) => {
    try {
        const { postId, commentId } = req.params;

        const comment = await postModel.getCommentById(postId, commentId);
        if (!comment) {
            return res.status(404).json({ message: 'comment_not_found', data: null });
        }

        // commentDate 포맷팅
        if (comment.commentDate) {
            const utcDate = new Date(comment.commentDate);
            comment.commentDate = formatDate(utcDate);
        }

        return res.status(200).json({ message: 'comment_loaded', data: comment });
    } catch (error) {
        console.error('Error loading comment:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};


// 좋아요 추가
const addLike = async (req, res) => {
    try {
        const userId = req.session.userId;
        const postId = parseInt(req.params.postId, 10);

        const post = await postModel.getPostById(postId);
        if (!post) {
            return res.status(404).json({ message: 'post_not_found', data: null });
        }

        const likeExists = await postModel.checkLike(postId, userId);
        if (likeExists) {
            return res.status(409).json({ message: 'like_already_exists', data: null });
        }

        await postModel.addLike(postId, userId);

        const updatePost = await postModel.getPostById(postId);

        return res.status(201).json({
            message: 'like_added',
            data: updatePost.likeCount,
        });
    } catch (error) {
        console.error('Error adding like:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 좋아요 삭제
const removeLike = async (req, res) => {
    try {
        const userId = req.session.userId;
        const postId = parseInt(req.params.postId, 10);

        const post = await postModel.getPostById(postId);
        if (!post) {
            return res.status(404).json({ message: 'post_not_found', data: null });
        }

        const likeExists = await postModel.checkLike(postId, userId);
        if (!likeExists) {
            return res.status(404).json({ message: 'like_not_found', data: null });
        }

        await postModel.removeLike(postId, userId);

        const updatePost = await postModel.getPostById(postId);

        return res.status(200).json({
            message: 'like_removed',
            data: updatePost.likeCount,
        });
    } catch (error) {
        console.error('Error removing like:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 게시글 이미지 업로드
const createPostImg = async (req, res) => {
    try {

        if (req.file) {
            return res.status(201).json({
                message: "Image_upload_success",
                data: { filePath: req.file.location }, // S3 URL 반환
            });
        } else {
            return res.status(400).json({ message: "Image_upload_failed" });
        }
    } catch (error) {
        console.error("이미지 업로드 중 오류 발생:", error);
        return res.status(500).json({ message: "internal_server_error" });
    }
};


// 게시글 조회수 증가
const increaseView = async (req, res) => {
    try {
        const postId = parseInt(req.params.postId, 10);

        const post = await postModel.getPostById(postId);
        if (!post) {
            return res.status(404).json({ message: 'post_not_found', data: null });
        }

        await postModel.incrementViewCount(postId);

        return res.status(200).json({
            message: 'view_count_increased',
            data: null,
        });
    } catch (error) {
        console.error('Error increasing view count:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 특정 게시글의 댓글 조회
const getCommentsByPostId = async (req, res) => {
    try {
        const postId = parseInt(req.params.postId, 10);
        if (isNaN(postId)) {
            return res.status(400).json({ message: 'invalid_post_id', data: null });
        }

        const comments = await postModel.getCommentsByPostId(postId);
        console.log('Comments from DB:', comments);

        const users = await userModel.getAllUsers();

        const commentsWithAuth = comments.map(comment => {
            const author = users.find(user => user.userId === comment.commentAuthor);
            
            // commentDate 포맷팅
            if (comment.commentDate) {
                const utcDate = new Date(comment.commentDate);
                comment.commentDate = formatDate(utcDate);
            }

            return {
                ...comment,
                authorProfile: author?.profile || `${BASE_IP}/images/default-profile.png`,
                authorNickname: author?.nickname || 'Unknown',
            };
        });
        console.log('Formatted comments:', commentsWithAuth); // 디버깅용
        return res.status(200).json({
            message: 'comments_loaded',
            data: commentsWithAuth,
        });
        
    } catch (error) {
        console.error('Error loading comments:', error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

export {
    postWrite,
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
};
