const express = require('express');
const { register, login, getMe, googleLogin, githubLogin, cleanupDB } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/github', githubLogin);
router.get('/me', protect, getMe);
router.get('/cleanup-db', cleanupDB);

module.exports = router;
