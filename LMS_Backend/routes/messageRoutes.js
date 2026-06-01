const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { 
    sendMessage, 
    getConversation, 
    getChatList,
    sendAttachment
} = require('../controllers/messageController');
const { messageUpload } = require('../middleware/upload');

router.use(verifyToken);

router.get('/conversations', getChatList);
router.get('/:userId', getConversation);
router.post('/', sendMessage);
router.post('/attachment', messageUpload.single('file'), sendAttachment);
router.get('/course/:courseId', verifyToken, messageController.getCourseMessages);
router.post('/course', verifyToken, messageController.sendCourseMessage);

module.exports = router;
