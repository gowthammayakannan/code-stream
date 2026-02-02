const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Auth Decoded ID:', decoded.id);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            console.warn('Auth: User not found for ID:', decoded.id);
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};

// Generate JWT Token
exports.getSignedJwtToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};
