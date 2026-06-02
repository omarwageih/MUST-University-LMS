const { sql, getPool } = require('../config/db');

/**
 * Migration script for Course Messaging Attachments
 */
const migrateCourseAttachments = async () => {
    try {
        const pool = await getPool();
        console.log('Running Course Messaging Attachments migrations...');

        // 1. Add AttachmentURL to CourseGroupMessages
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'CourseGroupMessages' AND COLUMN_NAME = 'AttachmentURL')
            BEGIN
                ALTER TABLE CourseGroupMessages ADD AttachmentURL NVARCHAR(500);
                PRINT 'Added AttachmentURL column to CourseGroupMessages.';
            END

            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'CourseGroupMessages' AND COLUMN_NAME = 'AttachmentName')
            BEGIN
                ALTER TABLE CourseGroupMessages ADD AttachmentName NVARCHAR(255);
                PRINT 'Added AttachmentName column to CourseGroupMessages.';
            END
        `);

        console.log('✅ Course Messaging Attachments migrations completed.');
    } catch (err) {
        console.error('Migration error:', err.message);
        throw err;
    }
};

module.exports = migrateCourseAttachments;
