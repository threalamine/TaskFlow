const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
    const { name, email, password } = req.body || {};

    const user = await User.create({ name, email, password });

    res.status(201).json({
        success: true,
        token: generateToken(user._id),
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};

const login = async (req, res) => {
    const { email, password } = req.body || {};

    if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email ||
        !password
    ) {
        const error = new Error('Please provide email and password');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOne({
        email: email.toLowerCase().trim(),
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    res.json({
        success: true,
        token: generateToken(user._id),
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};

const getMe = (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        },
    });
};

module.exports = { register, login, getMe };