const { sql, getPool } = require('../config/db');

/**
 * Migration script for Advanced Quiz Controls (Timers & Attempts)
 */
const migrateAdvancedQuizControls = async () => {
    try {
        const pool = await getPool();
        console.log('Running Advanced Quiz Controls migrations...');

        // 1. Add Duration and MaxAttempts to Quizzes
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Quizzes' AND COLUMN_NAME = 'Duration')
            BEGIN
                ALTER TABLE Quizzes ADD Duration INT DEFAULT 30; -- Minutes
                PRINT 'Added Duration column to Quizzes.';
            END

            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Quizzes' AND COLUMN_NAME = 'MaxAttempts')
            BEGIN
                ALTER TABLE Quizzes ADD MaxAttempts INT DEFAULT 1;
                PRINT 'Added MaxAttempts column to Quizzes.';
            END
        `);

        // 2. Add AttemptCount to Quiz_Result
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Quiz_Result' AND COLUMN_NAME = 'AttemptCount')
            BEGIN
                ALTER TABLE Quiz_Result ADD AttemptCount INT DEFAULT 0;
                PRINT 'Added AttemptCount column to Quiz_Result.';
            END

            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Quiz_Result' AND COLUMN_NAME = 'LastAttemptAt')
            BEGIN
                ALTER TABLE Quiz_Result ADD LastAttemptAt DATETIME;
                PRINT 'Added LastAttemptAt column to Quiz_Result.';
            END
        `);

        console.log('✅ Advanced Quiz Controls migrations completed.');
    } catch (err) {
        console.error('Migration error:', err.message);
        throw err;
    }
};

module.exports = migrateAdvancedQuizControls;
