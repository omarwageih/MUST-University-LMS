const express = require('express');
const router = express.Router();
const { verifyToken, requireEnrollment, requireCourseOwner } = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');
const { messageUpload } = require('../middleware/upload');

router.use(verifyToken);

router.get('/conversations', messageController.getChatList);
router.get('/:userId', messageController.getConversation);
router.post('/', messageController.sendMessage);
router.post('/attachment', messageUpload.single('file'), messageController.sendAttachment);

// Course Group Messaging (Secure: Must be enrolled or own the course)
router.get('/course/:courseId', (req, res, next) => {
    if (req.user.type === 'Instructor' || req.user.type === 'Assistant') {
        return requireCourseOwner(req, res, next);
    }
    return requireEnrollment(req, res, next);
}, messageController.getCourseMessages);

router.post('/course', messageUpload.single('file'), (req, res, next) => {
    // Middleware needs to extract courseId from body since it's a POST
    req.params.courseId = req.body.courseId;
    if (req.user.type === 'Instructor' || req.user.type === 'Assistant') {
        return requireCourseOwner(req, res, next);
    }
    return requireEnrollment(req, res, next);
}, messageController.sendCourseMessage);

module.exports = router;
