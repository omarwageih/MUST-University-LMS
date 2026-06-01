const express = require('express');
const router = express.Router();
const { register, login, updateProfile, updateProfilePicture, getMe, getUserProfile, forgotPassword, resetPassword, refreshAccessToken } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../middleware/validation');
const { profileUpload } = require('../middleware/upload');

const rateLimit = require('express-rate-limit');

// Rate limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // increased for dev
    message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 uploads per hour
    message: { message: "Too many uploads from this IP, please try again after an hour" }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const allowedMimeTypes = ['image/png', 'image/jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PNG and JPG files are allowed for profile pictures.'), false);
    }
};

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/refresh-token', authLimiter, refreshAccessToken);
router.post('/profile-picture', verifyToken, uploadLimiter, profileUpload.single('profilePic'), updateProfilePicture);
router.get('/me', verifyToken, getMe);
router.get('/profile/:id', verifyToken, getUserProfile);
router.put('/update-profile', verifyToken, updateProfile);

module.exports = router;