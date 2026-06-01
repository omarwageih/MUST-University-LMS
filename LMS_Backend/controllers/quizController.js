const { sql, getPool } = require('../config/db');
const { success, error, badRequest, notFound } = require('../utils/responseHandler');

/**
 * Quiz Question Management
 */

const getQuizQuestions = async (req, res) => {
    try {
        const { quizId } = req.params;
        const pool = await getPool();
        const questions = await pool.request()
            .input('quizId', sql.Int, quizId)
            .query(`
                SELECT * FROM QuizQuestions
                WHERE QuizID = @quizId
                ORDER BY CreatedAt ASC
            `);

        const questionsWithOptions = [];
        for (const q of questions.recordset) {
            const options = await pool.request()
                .input('qId', sql.Int, q.QuestionID)
                .query(`SELECT * FROM QuestionOptions WHERE QuestionID = @qId`);
            questionsWithOptions.push({ ...q, options: options.recordset });
        }

        return success(res, questionsWithOptions);
    } catch (err) {
        return error(res, "Failed to fetch quiz questions", 500, err);
    }
};

const addQuestion = async (req, res) => {
    const { quizId, text, type, points, options } = req.body;
    if (!text || !options || options.length < 2) {
        return badRequest(res, "Question text and at least two options are required.");
    }

    try {
        const pool = await getPool();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);
            const qResult = await request
                .input('quizId', sql.Int, quizId)
                .input('text', sql.NVarChar, text)
                .input('type', sql.NVarChar, type || 'MCQ')
                .input('points', sql.Decimal(5, 2), points || 1.0)
                .query(`
                    INSERT INTO QuizQuestions (QuizID, QuestionText, QuestionType, Points)
                    OUTPUT INSERTED.QuestionID
                    VALUES (@quizId, @text, @type, @points)
                `);

            const questionId = qResult.recordset[0].QuestionID;

            for (const opt of options) {
                await new sql.Request(transaction)
                    .input('qId', sql.Int, questionId)
                    .input('text', sql.NVarChar, opt.text)
                    .input('isCorrect', sql.Bit, opt.isCorrect ? 1 : 0)
                    .query(`
                        INSERT INTO QuestionOptions (QuestionID, OptionText, IsCorrect)
                        VALUES (@qId, @text, @isCorrect)
                    `);
            }

            await transaction.commit();
            return success(res, { message: "Question added successfully", questionId }, "Created", 201);
        } catch (txErr) {
            await transaction.rollback();
            throw txErr;
        }
    } catch (err) {
        return error(res, "Failed to add question", 500, err);
    }
};

const deleteQuestion = async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM QuizQuestions WHERE QuestionID = @id');
        return success(res, { message: "Question deleted successfully" });
    } catch (err) {
        return error(res, "Failed to delete question", 500, err);
    }
};

/**
 * Student Quiz Submission
 */

const submitQuiz = async (req, res) => {
    const { quizId, answers } = req.body; // answers: [{questionId, selectedOptionId}]
    const studentId = req.user.id;

    try {
        const pool = await getPool();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            let totalScore = 0;

            for (const ans of answers) {
                // Check if correct
                const check = await pool.request()
                    .input('optId', sql.Int, ans.selectedOptionId)
                    .input('qId', sql.Int, ans.questionId)
                    .query(`
                        SELECT IsCorrect, (SELECT Points FROM QuizQuestions WHERE QuestionID = @qId) as Points
                        FROM QuestionOptions
                        WHERE OptionID = @optId AND QuestionID = @qId
                    `);

                const isCorrect = check.recordset[0]?.IsCorrect || false;
                const points = check.recordset[0]?.Points || 0;
                if (isCorrect) totalScore += points;

                await new sql.Request(transaction)
                    .input('quizId', sql.Int, quizId)
                    .input('studentId', sql.Int, studentId)
                    .input('qId', sql.Int, ans.questionId)
                    .input('optId', sql.Int, ans.selectedOptionId)
                    .input('isCorrect', sql.Bit, isCorrect)
                    .query(`
                        INSERT INTO StudentAnswers (QuizID, StudentID, QuestionID, SelectedOptionID, IsCorrect)
                        VALUES (@quizId, @studentId, @qId, @optId, @isCorrect)
                    `);
            }

            // Record result
            await new sql.Request(transaction)
                .input('quizId', sql.Int, quizId)
                .input('studentId', sql.Int, studentId)
                .input('score', sql.Decimal(5, 2), totalScore)
                .query(`
                    IF EXISTS (SELECT 1 FROM Quiz_Result WHERE QuizID = @quizId AND StudentID = @studentId)
                        UPDATE Quiz_Result SET Score = @score WHERE QuizID = @quizId AND StudentID = @studentId
                    ELSE
                        INSERT INTO Quiz_Result (QuizID, StudentID, Score) VALUES (@quizId, @studentId, @score)
                `);

            await transaction.commit();
            return success(res, { score: totalScore, message: "Quiz submitted successfully" });
        } catch (txErr) {
            await transaction.rollback();
            throw txErr;
        }
    } catch (err) {
        return error(res, "Failed to submit quiz", 500, err);
    }
};

module.exports = {
    getQuizQuestions,
    addQuestion,
    deleteQuestion,
    submitQuiz
};
