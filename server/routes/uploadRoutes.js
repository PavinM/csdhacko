import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// storage config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// filter for validation
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

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No file uploaded" });
    }
    res.send({
        url: `/uploads/${req.file.filename}`,
        name: req.file.originalname,
        type: 'file'
    });
});

export default router;
