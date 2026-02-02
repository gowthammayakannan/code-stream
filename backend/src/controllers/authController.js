const axios = require('axios');
const User = require('../models/User');
const { getSignedJwtToken } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

let client;
if (process.env.GOOGLE_CLIENT_ID) {
    client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(`📝 Registration attempt for: ${email}`);

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`⚠️ User already exists: ${email}`);
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        const user = await User.create({ name, email, password });
        console.log(`✅ User created successfully: ${user.email}`);

        // Generate token
        const token = getSignedJwtToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                color: user.color,
            },
        });
    } catch (error) {
        console.error('❌ Registration Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        console.log(`🔍 Login attempt for: ${email}, User found: ${!!user}`);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        console.log(`🔑 Password match result: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Update last active
        user.lastActive = Date.now();
        await user.save();

        // Generate token
        const token = getSignedJwtToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                color: user.color,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                color: user.color,
                lastActive: user.lastActive,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: 'ID Token is required' });
        }

        let name, email, picture, sub;

        if (!client) {
            return res.status(500).json({ success: false, message: 'Google Auth not configured on server' });
        }

        // Verify real token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        name = payload.name;
        email = payload.email;
        picture = payload.picture;
        sub = payload.sub;

        // 1. Check if user exists with this googleId
        let user = await User.findOne({ googleId: sub });

        if (!user) {
            // 2. Check if user exists with this email (if they registered with password before)
            user = await User.findOne({ email });

            if (user) {
                // Link account
                user.googleId = sub;
                if (!user.avatar) user.avatar = picture;
                await user.save();
            } else {
                // 3. Create new user
                user = await User.create({
                    name,
                    email,
                    googleId: sub,
                    avatar: picture,
                });
            }
        }

        // Update last active
        user.lastActive = Date.now();
        await user.save();

        // Generate token
        const token = getSignedJwtToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                color: user.color,
            },
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ success: false, message: 'Google authentication failed' });
    }
};

// @desc    GitHub Login
// @route   POST /api/auth/github
// @access  Public
exports.githubLogin = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            console.log('❌ GitHub Auth Error: Code is missing in request body');
            return res.status(400).json({ success: false, message: 'Code is required' });
        }

        console.log(`🔐 Processing GitHub login...`);

        // 1. Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: process.env.CORS_ORIGIN + '/login'
        }, {
            headers: { Accept: 'application/json' }
        });

        console.log('📡 GitHub Token Response:', JSON.stringify(tokenResponse.data));

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            console.log('❌ GitHub Auth Error: Failed to obtain access token', tokenResponse.data);
            return res.status(401).json({ success: false, message: 'GitHub authentication failed: No access token' });
        }

        // 2. Fetch user data
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        console.log(`✅ GitHub User fetched: ${userResponse.data.login}`);

        const { id, name, login, email, avatar_url } = userResponse.data;

        // 3. Find or create user
        let user = await User.findOne({ githubId: id.toString() });

        if (!user) {
            // Check by email
            if (email) {
                user = await User.findOne({ email });
            }

            if (user) {
                user.githubId = id.toString();
                if (!user.avatar) user.avatar = avatar_url;
                await user.save();
            } else {
                user = await User.create({
                    name: name || login,
                    email: email || `${login}@github.com`, // Fallback email
                    githubId: id.toString(),
                    avatar: avatar_url,
                });
            }
        }

        // Update last active
        user.lastActive = Date.now();
        await user.save();

        // Generate token
        const token = getSignedJwtToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                color: user.color,
            },
        });
    } catch (error) {
        console.error('GitHub Auth Error:', error.response?.data || error.message);
        res.status(401).json({
            success: false,
            message: `GitHub Auth Error: ${error.response?.data?.error_description || error.message}`
        });
    }
};
