import express from 'express';
import multer from 'multer';
import { uploadAndIngest, getFiles, deleteFile } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup multer for file uploads

// Configure multer to store files temporarily in 'uploads/' (before uploading to S3)
const upload = multer({ dest: 'uploads/' });

// POST /api/admin/upload → upload a new file and ingest
router.post('/upload', protect, adminOnly, upload.single('file'), uploadAndIngest);

// GET /api/admin/files → get list of uploaded files
router.get('/files', protect, adminOnly, getFiles);

// DELETE /api/admin/files/:filename → delete a specific file
router.delete('/files/:filename', protect, adminOnly, deleteFile);

export default router;
