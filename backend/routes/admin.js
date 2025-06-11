import express from 'express';
import multer from 'multer';
import { uploadAndIngest, getFiles, deleteFile } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST /api/admin/upload → upload a new file and ingest
router.post('/upload', protect, adminOnly, upload.single('file'), uploadAndIngest);

// GET /api/admin/files → get list of uploaded files
router.get('/files', protect, adminOnly, getFiles);

// DELETE /api/admin/files/:filename → delete a specific file
router.delete('/files/:filename', protect, adminOnly, deleteFile);

export default router;
