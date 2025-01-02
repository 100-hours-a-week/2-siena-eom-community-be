const requireAuth = (req, res, next) => {

    if (!req.session.userId) {
        return res.status(401).json({
            message: 'unauthorized',
            data: null,
        });
    }
    next();
};

export default requireAuth;