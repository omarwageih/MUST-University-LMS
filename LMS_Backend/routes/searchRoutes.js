const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getPool, sql } = require('../config/db');
const { success, error } = require('../utils/responseHandler');

router.get('/', verifyToken, async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return success(res, { courses: [], materials: [], users: [] });

    try {
        const pool = await getPool();
        const searchTerm = `%${q}%`;

        // 1. Search Courses
        const courses = await pool.request()
            .input('q', sql.VarChar, searchTerm)
            .query(`
                SELECT CourseID, Name, Description, 'course' as type
                FROM Course
                WHERE Name LIKE @q OR Description LIKE @q
            `);

        // 2. Search Materials
        const materials = await pool.request()
            .input('q', sql.VarChar, searchTerm)
            .query(`
                SELECT Material_ID, Title, Type, 'material' as type, Week_ID
                FROM Material
                WHERE Title LIKE @q
            `);

        // 3. Search Users
        const users = await pool.request()
            .input('q', sql.VarChar, searchTerm)
            .query(`
                SELECT UserID, FullName, UserType, ProfilePicture, 'user' as type
                FROM Users
                WHERE FullName LIKE @q AND IsActive = 1
            `);

        return success(res, {
            courses: courses.recordset,
            materials: materials.recordset,
            users: users.recordset
        });
    } catch (err) {
        return error(res, "Search failed", 500, err);
    }
});

module.exports = router;
