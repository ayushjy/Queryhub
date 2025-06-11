import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// LangChain document loaders for different file types
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
 
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeStore } from '@langchain/community/vectorstores/pinecone';
import openaiEmbedding from '../utils/openaiEmbedding.js'; // Shared OpenAI embeddings instance
import pineconeIndex from '../utils/pineconeClient.js';

// ESM workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Handles file upload and ingestion into Pinecone with OpenAI embeddings.
 * Supports PDF, DOCX, and TXT files.
 */
export const uploadAndIngest = async (req, res) => {
    try {
        // 1. Ensure a file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // 2. Determine file path and loader based on mimetype
        const filePath = path.join(__dirname, '..', req.file.path);

        let loader;
        if (req.file.mimetype === 'application/pdf') {
            loader = new PDFLoader(filePath);
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            loader = new DocxLoader(filePath);
        } else if (req.file.mimetype === 'text/plain') {
            loader = new TextLoader(filePath);
        } else {
            return res.status(400).json({ message: 'Unsupported file type' });
        }

        // 3. Load and process the document into LangChain docs
        const docs = await loader.load();

        // 4. Split the document into chunks for embedding
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,      // Each chunk will be up to 1000 characters
            chunkOverlap: 200,    // Overlap between chunks for context
        });
        const splitDocs = await splitter.splitDocuments(docs);

        // 5. Ingest the split documents into Pinecone with OpenAI embeddings
        //    Uses the shared openaiEmbedding instance (text-embedding-3-small)
        await PineconeStore.fromDocuments(splitDocs, openaiEmbedding, {
            pineconeIndex,
        });

        // 6. List all uploaded files for the admin UI
        const uploadDir = path.join(__dirname, '../uploads');
        const files = await fs.promises.readdir(uploadDir);

        // 7. Respond with success and file info
        return res.json({ message: 'File ingested successfully', file: req.file.filename, files });
    } catch (err) {
        console.error('Ingestion error:', err);
        res.status(500).json({ message: 'Ingestion failed', error: err.message });
    }
};

/**
 * Lists all uploaded files in the uploads directory.
 */
export const getFiles = (req, res) => {
    const uploadDir = path.join(__dirname, '../uploads');
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to read files' });
        }
        res.json({ files });
    });
};

/**
 * Deletes a specific file from the uploads directory.
 */
export const deleteFile = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to delete file' });
        }
        res.json({ message: 'File deleted successfully' });
    });
};