const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Load environment variables for Cloudinary
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

if (useCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// Ensure local upload directories exist (fallback)
const submissionsDir = path.join(__dirname, '..', 'uploads', 'submissions');
const materialsDir = path.join(__dirname, '..', 'uploads', 'materials');
const profilesDir = path.join(__dirname, '..', 'uploads', 'profiles');
const messagesDir = path.join(__dirname, '..', 'uploads', 'messages');

if (!useCloudinary) {
    [submissionsDir, materialsDir, profilesDir, messagesDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

// Configure storage for Submissions
let submissionStorage;
if (useCloudinary) {
    submissionStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'lms/submissions',
            resource_type: 'auto',
            public_id: (req, file) => `${req.user.id}_${Date.now()}`
        }
    });
} else {
    submissionStorage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, submissionsDir),
        filename: (req, file, cb) => {
            const uniqueName = `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    });
}

// Configure storage for Materials
let materialsStorage;
if (useCloudinary) {
    materialsStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'lms/materials',
            resource_type: 'auto',
            public_id: (req, file) => `material_${Date.now()}`
        }
    });
} else {
    materialsStorage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, materialsDir),
        filename: (req, file, cb) => {
            const uniqueName = `material_${Date.now()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    });
}

// File filter for Submissions
const submissionFilter = (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.zip'];
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'application/zip', 'application/x-zip-compressed'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, JPG, and ZIP files are allowed for submissions.'), false);
    }
};

const upload = multer({
    storage: submissionStorage,
    fileFilter: submissionFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

const materialsUpload = multer({ 
    storage: materialsStorage, 
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.jpg', '.jpeg', '.png'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed for course materials.'), false);
        }
    }
});

// Message Storage
let messageFileStorage;
if (useCloudinary) {
    messageFileStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'lms/messages',
            resource_type: 'auto',
            public_id: (req, file) => `msg_${Date.now()}`
        }
    });
} else {
    messageFileStorage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, messagesDir),
        filename: (req, file, cb) => {
            const uniqueName = `msg_${Date.now()}_${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    });
}

const messageUpload = multer({
    storage: messageFileStorage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// Profile Storage
let profileStorage;
if (useCloudinary) {
    profileStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'lms/profiles',
            resource_type: 'image',
            public_id: (req, file) => `profile_${req.user.id}_${Date.now()}`
        }
    });
} else {
    profileStorage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, profilesDir),
        filename: (req, file, cb) => {
            const uniqueName = `profile_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    });
}

const profileUpload = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.png', '.jpg', '.jpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PNG and JPG files are allowed for profile pictures.'), false);
        }
    }
});

module.exports = { upload, materialsUpload, messageUpload, profileUpload };
