const requireAuth = (req, res, next) => {
    console.log('Current Session:', req.session); // 디버깅용..

    if (!req.session.userId) {
        console.error('Unauthorized access attempt:', req.session);
        return res.status(401).json({
            message: 'unauthorized',
            data: null,
        });
    }
    next();
};

module.exports = requireAuth;
