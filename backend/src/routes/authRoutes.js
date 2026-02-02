const express = require('express');
const { register, login, getMe, googleLogin, githubLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/github', githubLogin);
router.get('/me', protect, getMe);

module.exports = router;
