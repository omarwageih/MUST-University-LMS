const { sql, getPool } = require('../config/db');

/**
 * Migration script for Quiz Engine and Group Messaging
 */
const migrateQuizEngine = async () => {
    try {
        const pool = await getPool();
        console.log('Running Expanded Project migrations...');

        // 1. QuizQuestions Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'QuizQuestions')
            BEGIN
                CREATE TABLE QuizQuestions (
                    QuestionID INT IDENTITY(1,1) PRIMARY KEY,
                    QuizID INT NOT NULL FOREIGN KEY REFERENCES Quizzes(QuizID) ON DELETE CASCADE,
                    QuestionText NVARCHAR(MAX) NOT NULL,
                    QuestionType NVARCHAR(50) DEFAULT 'MCQ',
                    Points DECIMAL(5,2) DEFAULT 1.0,
                    CreatedAt DATETIME DEFAULT GETDATE()
                );
                PRINT 'Created QuizQuestions table.';
            END
        `);

        // 2. QuestionOptions Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'QuestionOptions')
            BEGIN
                CREATE TABLE QuestionOptions (
                    OptionID INT IDENTITY(1,1) PRIMARY KEY,
                    QuestionID INT NOT NULL FOREIGN KEY REFERENCES QuizQuestions(QuestionID) ON DELETE CASCADE,
                    OptionText NVARCHAR(MAX) NOT NULL,
                    IsCorrect BIT DEFAULT 0
                );
                PRINT 'Created QuestionOptions table.';
            END
        `);

        // 3. StudentAnswers Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'StudentAnswers')
            BEGIN
                CREATE TABLE StudentAnswers (
                    AnswerID INT IDENTITY(1,1) PRIMARY KEY,
                    QuizID INT NOT NULL FOREIGN KEY REFERENCES Quizzes(QuizID),
                    StudentID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
                    QuestionID INT NOT NULL FOREIGN KEY REFERENCES QuizQuestions(QuestionID),
                    SelectedOptionID INT FOREIGN KEY REFERENCES QuestionOptions(OptionID),
                    IsCorrect BIT,
                    CreatedAt DATETIME DEFAULT GETDATE(),
                    UNIQUE (StudentID, QuestionID)
                );
                PRINT 'Created StudentAnswers table.';
            END
        `);

        // 4. CourseGroupMessages Table
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CourseGroupMessages')
            BEGIN
                CREATE TABLE CourseGroupMessages (
                    MessageID INT IDENTITY(1,1) PRIMARY KEY,
                    CourseID INT NOT NULL FOREIGN KEY REFERENCES Course(CourseID) ON DELETE CASCADE,
                    SenderID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID),
                    Content NVARCHAR(MAX) NOT NULL,
                    CreatedAt DATETIME DEFAULT GETDATE()
                );
                PRINT 'Created CourseGroupMessages table.';
            END
        `);

        console.log('✅ Expanded Project migrations completed.');
    } catch (err) {
        console.error('Migration error:', err.message);
        throw err;
    }
};

module.exports = migrateQuizEngine;
