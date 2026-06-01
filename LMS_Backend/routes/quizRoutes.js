const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validate, addQuizQuestionSchema, submitQuizSchema } = require('../middleware/validation');

/**
 * Quiz Question Management (Instructor/Assistant)
 */
router.get('/:quizId/questions', verifyToken, quizController.getQuizQuestions);
router.post('/questions', verifyToken, validate(addQuizQuestionSchema), quizController.addQuestion);
router.delete('/questions/:id', verifyToken, quizController.deleteQuestion);

/**
 * Student Submission
 */
router.post('/submit', verifyToken, validate(submitQuizSchema), quizController.submitQuiz);

module.exports = router;
