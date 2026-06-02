const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyToken, requireRole, requireCourseOwner, requireEnrollment } = require('../middleware/authMiddleware');
const { validate, addQuizQuestionSchema, submitQuizSchema } = require('../middleware/validation');

/**
 * Quiz Question Management (Instructor/Assistant)
 */
router.get('/:quizId/questions', verifyToken, (req, res, next) => {
    if (req.user.type === 'Student') return requireEnrollment(req, res, next);
    return requireCourseOwner(req, res, next);
}, quizController.getQuizQuestions);

router.post('/questions', verifyToken, requireRole('Instructor', 'Assistant'), requireCourseOwner, validate(addQuizQuestionSchema), quizController.addQuestion);
router.delete('/questions/:id', verifyToken, requireRole('Instructor', 'Assistant'), requireCourseOwner, quizController.deleteQuestion);

/**
 * Student Submission
 */
router.post('/submit', verifyToken, requireRole('Student'), requireEnrollment, validate(submitQuizSchema), quizController.submitQuiz);

module.exports = router;
