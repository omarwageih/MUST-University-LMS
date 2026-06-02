/**
 * Main Entry Point for the LMS Backend API
 * This file initializes the Express server, applies middleware, and sets up routes.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const morgan = require('morgan');
const logger = require('./utils/logger');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Initialize Express application
const app = express();

// ===== Security Middleware =====
// Helmet helps secure the app by setting various HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration to allow requests from the frontend
app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

// Body parsers for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// ===== Rate Limiting (Optional/Disabled for Dev) =====
// Prevents brute force and DoS attacks by limiting requests per IP
// const globalLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 10000, // Increased for dev
//     message: { message: 'General API limit reached. Please try again later.' },
//     standardHeaders: true,
//     legacyHeaders: false
// });
// app.use('/api/', globalLimiter);

// ===== Static File Hosting =====
// Serve uploaded files (assignments, submissions) so they can be accessed via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== Route Definitions =====
// Import routes for different modules
const authRoutes = require('./routes/authRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const studentRoutes = require('./routes/studentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const searchRoutes = require('./routes/searchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const quizRoutes = require('./routes/quizRoutes');

// Mount routes to the API path
app.use('/api/auth', authRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/quizzes', quizRoutes);

// ===== Swagger Documentation =====
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mini LMS API',
            version: '1.0.0',
            description: 'API Documentation for Mini LMS',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
            },
        ],
    },
    apis: ['./routes/*.js', './controllers/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[UNHANDLED ERROR] ${req.method} ${req.url}:`, {
        message: err.message,
        stack: err.stack,
        code: err.code || err.number
    });

    // Handle Multer and Upload errors specifically
    if (err instanceof require('multer').MulterError || err.message.includes('File type not allowed') || err.message.includes('Only PDF')) {
        return res.status(400).json({ 
            message: err.message,
            code: err.code || 'UPLOAD_ERROR'
        });
    }

    res.status(err.status || 500).json({
        message: err.message || "An unexpected internal server error occurred.",
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// ===== Server & Socket Initialization =====
const runMigrations = require('./database/migrate');
const http = require('http');
const { initSocket } = require('./socket');

// Create HTTP server instance
const server = http.createServer(app);

// Initialize WebSockets for real-time notifications/updates
initSocket(server);

// Start the server and run database migrations
server.listen(process.env.PORT || 3000, async () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
    await runMigrations(); // Ensures the database schema is up-to-date

    // Run expanded project migrations
    const migrateQuizEngine = require('./database/migrate_quiz_engine');
    await migrateQuizEngine();

    // Run advanced quiz controls migrations
    const migrateAdvancedQuiz = require('./database/migrate_advanced_quiz');
    await migrateAdvancedQuiz();

    // Run course messaging attachments migrations
    const migrateCourseAttachments = require('./database/migrate_course_attachments');
    await migrateCourseAttachments();
});