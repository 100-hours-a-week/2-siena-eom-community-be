const postModel = require('../models/postModel');
const { getAllUsers} = require('../models/userModel');

// 게시글 작성 처리
const postWrite = async (req, res) => {
    try {
        //const userId = req.body.userId; //postman 테스트
        const userId = req.session.userId;
        const { title, content, postImage} = req.body;

        // 필수 필드 유효성 검사
        if (!userId || !title || !content) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const posts = await postModel.getAllPosts();

        // 날짜를 yyyy-mm-dd hh:mm:ss 형식으로 저장하기
        const formatDate = () => {
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');
            const ss = String(date.getSeconds()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
        };
        const postDate = formatDate();

        const generatePostId = (posts) => { // length + 1 대신
            if (posts.length === 0) {
                return 1;
            }
            return Math.max(...posts.map(post => post.postId)) + 1; // 가장 큰 ID + 1
        };        

        // 새 게시글 생성
        const newPost = {
            postId: generatePostId(posts),
            author: userId,
            title,
            content,
            postImage: postImage || null,
            postDate: postDate,
            like: 0,
            view: 0,
            commentsCount: 0,
        };

        posts.push(newPost);
        await postModel.savePosts(posts);

        return res.status(201).json({
            message: 'post_created',
            data: { postId: newPost.postId },
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
        const users = await getAllUsers();

         // 사용자 프로필이랑 닉네임을 게시글 목록페이지에서 표시하기 위해
        const postsWithAuthor = posts.map(post => {
            const author = users.find(user => user.userId === post.author);
            return {
                ...post,
                authorProfile: author?.profile || '../images/default-profile.png', // 프로필 이미지
                authorNickname: author?.nickname || 'Unknown' // 닉네임
            };
        });

        // 게시글 목록 반환 유저 닉네임, 프로필사진 포함
        return res.status(200).json({
            message: 'posts_loaded',
            data: postsWithAuthor,
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        return res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 게시글 상세 조회
const getPostById = async (req, res) => {
    try {
        const postId = parseInt(req.params.postId, 10);
        const posts = await postModel.getAllPosts();
        const users = await getAllUsers();
        const comments = await postModel.getAllComments();

        const post = posts.find((p) => p.postId === postId);
        if (!post) {
            return res.status(404).json({ message: 'post_not_found', data: null });
        }

        post.view = (post.view || 0) + 1; // 조회수 증가
        await postModel.savePosts(posts); // 변경된 데이터 저장(증가된 조회수 반영)

        // 게시글 작성자의 닉네임 및 프로필 추가
        const author = users.find((user) => user.userId === post.author);

        // 댓글 데이터 필터링 (postId 기준)
        const postComments = comments.filter((comment) => parseInt(comment.postId, 10) === postId);

        // 댓글에 작성자 정보 추가
        const commentsWithAuth = postComments.map((comment) => {
            const author = users.find((user) => String(user.userId) === String(comment.commentAuthor));
            return {
                ...comment,
                commentContent: comment.content, // 원래 댓글 내용 유지
                authorProfile: author?.profile || 'http://localhost:3001/images/default-profile.png',
                authorNickname: author?.nickname || 'Unknown',
            };
        });

        // 게시글 데이터에 댓글 추가
        const postWithAuthComm = {
            ...post,
            authorProfile: author?.profile || 'http://localhost:3001/images/default-profile.png',
            authorNickname: author?.nickname || 'Unknown',
            comments: commentsWithAuth, // 처리된 댓글 데이터 추가
        };

         res.status(200).json({ message: 'post_loaded', data: postWithAuthComm });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 게시글 수정 처리
const updatePost = async (req, res) => {
    try {
        const userId = req.session.userId;
        const postId = parseInt(req.params.postId, 10);

        const { title, content, postImage } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const posts = await postModel.getAllPosts();
        const post = posts.find((p) => p.postId === postId);
        if (!post) {
            return res.status(404).json({ message: 'post_not_found', data: null });
        }

        // 작성자랑 수정하려는 사용자가 같은지 확인
        if (post.author !== userId) {
            return res.status(403).json({ message: 'forbidden_action', data: null });
        }

        post.title = title;
        post.content = content;
        post.postImage = postImage || post.postImage;

        await postModel.savePosts(posts);

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
        const userId = parseInt(req.session.userId, 10);
        const postId = parseInt(req.params.postId, 10);

        if (isNaN(postId)) { // postId가 숫자가 아닌 타입으로 잘못전달되는 경우
            return res.status(400).json({
                message: 'invalid_request',
                data: null,
            });
        }

        const posts = await postModel.getAllPosts();
        const post = posts.find(post => post.postId === postId);
        if (!post) {
            return res.status(404).json({
                message: 'post_not_found',
                data: null,
            });
        }

        // 작성자랑 삭제하려는 사용자가 같은지 확인
        if (parseInt(post.author, 10) !== userId) {
            return res.status(403).json({ message: 'forbidden_action', data: null });
        }

        // 게시글 삭제
        await postModel.deletePostById(postId);

        res.status(200).json({
            message: 'post_deleted',
            data: null,
        });
    } catch (error) {
        console.error('Error deleting post:', error.message);
        res.status(500).json({
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

        const posts = await postModel.getAllPosts();
        const users = await getAllUsers();
        const comments = await postModel.getAllComments();

        const post = posts.find(post => post.postId === postId);
        if (!post) {
            return res.status(404).json({ message: 'post_not_found', data: null });
        }
        const user = users.find((user) => user.userId === userId);
        if (!user) {
            return res.status(404).json({ message: 'user_not_found', data: null });
        }

        const formatDate = () => {
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');
            const ss = String(date.getSeconds()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
        };
        const commentDate = formatDate();

        const generateCommentId = (comments) => {
            if (comments.length === 0) {
                return 1;
            }
            return Math.max(...comments.map(comment => comment.commentId)) + 1; // 가장 큰 ID + 1
        };
        
        // 새 댓글 생성
        const newComment = {
            postId: postId,
            commentId: generateCommentId(comments),
            commentAuthor: userId,
            content,
            commentDate: commentDate,
        };

        comments.push(newComment);
        post.commentsCount = (post.commentsCount || 0) + 1; // 댓글 수 증가
        await postModel.saveComments(comments); // 댓글 업데이트
        await postModel.savePosts(posts); // 게시글 업데이트 (댓글 수 반영)

        // 댓글 작성자 정보 추가 (작성자의 닉네임과 프로필을 띄워야함)
        const commentsWithAuth = comments.map(comment => {
            const author = users.find(user => user.userId === comment.commentAuthor);
            return {
                ...comment,
                authorProfile: author?.profile || '../images/default-profile.png', // 프로필 이미지
                authorNickname: author?.nickname || 'Unknown' // 닉네임
            };
        });

        return res.status(201).json({
            message: 'comment_created',
            data: { commentId: newComment.commentId,
                commentsWithAuth,
             },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};

// 댓글 수정 처리
const updateComment = async (req, res) => {
    try {
        const userId = req.session.userId;
        const postId = parseInt(req.params.postId, 10);
        const commentId = parseInt(req.params.commentId, 10);

        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const posts = await postModel.getAllPosts();
        const post = posts.find((p) => p.postId === postId);
        const comments = await postModel.getAllComments();
        const comment = comments.find((p) => p.commentId === commentId);

        if (!post) {
            return res.status(404).json({ message: 'post_not_found', data: null });
        }
        if (!comment) {
            return res.status(404).json({ message: 'comment_not_found', data: null });
        }

        // 댓글 작성자랑 수정하려는 사용자가 같은지 확인
        if (String(comment.commentAuthor) !== String(userId)) {
            return res.status(403).json({ message: 'forbidden_action', data: null });
        }        

        comment.content = content;
        await postModel.saveComments(comments);

        return res.status(200).json({
            message: 'comment_updated',
            data: null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
};

//특정 댓글 조회
const getCommentById = async (req, res) => {
    const { postId, commentId } = req.params;

    try {
        const comment = await postModel.getCommentById(postId, commentId);
        if (!comment) {
            return res.status(404).json({ message: "comment_not_found", data: null });
        }

        res.status(200).json({ message: "comment_loaded", data: comment });
    } catch (error) {
        res.status(500).json({ message: "internal_server_error", data: null });
    }
};

// 댓글 삭제
const deleteComment = async (req, res) => {
    try {
        const postId = Number(req.params.postId, 10);
        const commentId = parseInt(req.params.commentId, 10);

        if (isNaN(postId) || isNaN(commentId)) {
            console.error("invalid_postId_or_commentId");
            return res.status(400).json({
                message: 'invalid_request',
                data: null,
            });
        }

        const posts = await postModel.getAllPosts();
        const comments = await postModel.getAllComments();

        const post = posts.find((p) => p.postId === postId);
        const comment = await postModel.getCommentById(postId, commentId);
        if (!post) {
            return res.status(404).json({ message: 'post_not_found', data: null });
        }
        if (!comment) {
            return res.status(404).json({
                message: 'comment_not_found',
                data: null,
            });
        }

        const filteredComments = comments.filter((c) => c.commentId !== commentId);
        // 삭제할 댓글 제외하고 나머지로 새로운 comments 저장

        const userId = parseInt(req.session.userId, 10);
        if (parseInt(comment.commentAuthor, 10) !== userId) {
            return res.status(403).json({
                message: 'forbidden_action',
                data: null,
            });
        }

        await postModel.deleteCommentById(commentId);

        post.commentsCount = Math.max((post.commentsCount || 0) - 1, 0); 
        // 댓글 수 감소, 최소값 0 설정

        await postModel.saveComments(filteredComments);
        await postModel.savePosts(posts);

        return res.status(200).json({
            message: 'comment_deleted',
            data: null,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'internal_server_error',
            data: null,
        });
    }
};

// 좋아요 추가
const addLike = async (req, res) => {
    try {
        const postId = parseInt(req.params.postId, 10);
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(postId) || isNaN(userId)) {
            return res.status(400).json({ message: "invalid_request", data: null });
        }

        const posts = await postModel.getAllPosts();
        const post = posts.find((p) => p.postId === postId);
        if (!post) {
            return res.status(404).json({ message: "post_not_found", data: null });
        }

        post.likes = post.likes || []; // 초기 likes 배열
    
        // 이미 좋아요를 누른 경우
        if (post.likes.includes(userId)) {
            return res.status(409).json({ message: "like_already_exists", data: null });
        }

        post.likes.push(userId); // likes 배열에 좋아요를 누른 userId 추가
        post.like = post.likes.length; // 좋아요 수 업데이트

        await postModel.savePosts(posts);
        res.status(201).json({ message: "like_added", data: { likes: post.likes, likeCount: post.like } });
    } catch (error) {
        console.error("Error adding like:", error);
        res.status(500).json({ message: "internal_server_error", data: null });
    }
};

// 좋아요 삭제
const removeLike = async (req, res) => {
    try {
        const postId = parseInt(req.params.postId, 10);
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(postId) || isNaN(userId)) {
            return res.status(400).json({ message: "invalid_request", data: null });
        }

        const posts = await postModel.getAllPosts();
        const post = posts.find((p) => p.postId === postId);
        if (!post) {
            return res.status(404).json({ message: "post_not_found", data: null });
        }

        post.likes = post.likes || []; // 초기 likes 배열

        const index = post.likes.indexOf(userId); // likes배열에 userId 존재하는 지 확인

        if (index === -1) { // likes 배열에 userId 없음
            return res.status(404).json({ message: "like_not_found", data: null });
        }

        post.likes.splice(index, 1); // likes 배열에서 userId 제거
        post.like = post.likes.length; // 좋아요 수 업데이트

        await postModel.savePosts(posts);
        res.status(200).json({ message: "like_canceled", data: { likes: post.likes, likeCount: post.like } });
    } catch (error) {
        console.error("Error removing like:", error);
        res.status(500).json({ message: "internal_server_error", data: null });
    }
};

// 게시글 사진 업로드
const createPostImg = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                message: 'invalid_file',
                data: null,
            });
        }

        const filePath = `/uploads/${file.filename}`;
        return res.status(201).json({
            message: 'Image_upload_success',
            data: { filePath: `http://localhost:3001${filePath}` }, // 절대경로로저장
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }
};



module.exports = { 
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
};