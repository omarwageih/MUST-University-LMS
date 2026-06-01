const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const messageController = require('../controllers/messageController');
const { messageUpload } = require('../middleware/upload');

router.use(verifyToken);

router.get('/conversations', messageController.getChatList);
router.get('/:userId', messageController.getConversation);
router.post('/', messageController.sendMessage);
router.post('/attachment', messageUpload.single('file'), messageController.sendAttachment);
router.get('/course/:courseId', messageController.getCourseMessages);
router.post('/course', messageController.sendCourseMessage);

module.exports = router;
