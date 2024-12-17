const requireAuth = (req, res, next) => {

    if (!req.session.userId) {
        console.error('Unauthorized access attempt:', req.session);
        return res.status(401).json({
            message: 'unauthorized',
            data: null,
        });
    }
    next();
};

export default requireAuth;