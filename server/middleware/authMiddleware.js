const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const error = new Error('Not authorized, no token');
        error.statusCode = 401;
        throw error;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
        const error = new Error('Not authorized, user no longer exists');
        error.statusCode = 401;
        throw error;
    }

    req.user = user;
    next();
};

module.exports = { protect };