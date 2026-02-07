import express from 'express';
import multer from 'multer';
import path from 'path';
import { google } from 'googleapis';
import stream from 'stream';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Memory Storage (File is held in RAM Buffer, then streamed to Drive)
const storage = multer.memoryStorage();

// Filter for validation
const checkFileType = (file, cb) => {
    const filetypes = /jpg|jpeg|png|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images/Docs only!');
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

// Google Drive Setup (OAuth2)
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_DRIVE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const uploadToGoogleDrive = async (fileObject) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);

    const { data } = await drive.files.create({
        media: {
            mimeType: fileObject.mimetype,
            body: bufferStream,
        },
        requestBody: {
            name: `${Date.now()}-${fileObject.originalname}`,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Upload to specific folder
        },
        fields: 'id,name,webViewLink,webContentLink',
    });

    // Permission code removed as we rely on folder permissions or user account access
    return data;
};

router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No file uploaded" });
    }

    try {
        // Upload to Google Drive
        const result = await uploadToGoogleDrive(req.file);

        res.send({
            url: result.webViewLink, // Google Drive Link
            name: result.name,
            fileId: result.id,
            type: 'file'
        });

    } catch (error) {
        console.error("Google Drive Upload Error:", error);
        res.status(500).send({
            message: "File upload failed",
            error: error.message
        });
    }
});

export default router;
