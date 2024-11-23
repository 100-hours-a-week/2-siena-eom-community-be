const { getAllPosts, savePosts } = require('../models/postModel');

// 게시글 작성 처리
const postWrite = async (req, res) => {
    try {
        //const userId = req.body.userId; //postman 테스트할라고 요청에서 유저아이디받아옴
        const userId = req.session.userId;
        const { title, content, postImage} = req.body;
        console.log('Request Body:', req.body); // 요청 Body 출력, 포스트맨 디버깅용..
        console.log('userId:', userId, 'title:', title, 'content:', content); // 각 필드 값 출력

        
        // 필수 필드 유효성 검사
        if (!userId || !title || !content) {
            return res.status(400).json({ message: 'invalid_request', data: null });
        }

        const posts = await getAllPosts();

        // 새 게시글 생성
        const newPost = {
            postId: posts.length + 1,
            author: userId,
            title,
            content,
            postImage: postImage || null, // 이미지 URL 없을 시 null
            postDate: new Date().toISOString(),
            like: 0,
            view: 0,
            commentsCount: 0,
        };

        posts.push(newPost);
        await savePosts(posts);

        return res.status(201).json({
            message: 'post_created',
            data: { postId: newPost.postId },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'internal_server_error', data: null });
    }

};

module.exports = { 
    postWrite,
};
