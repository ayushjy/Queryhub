import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PineconeStore } from '@langchain/community/vectorstores/pinecone';
import openaiEmbedding from '../utils/openaiEmbedding.js';
import pineconeIndex from '../utils/pineconeClient.js';
import { s3Client, uploadFileToS3, deleteFileFromS3, listFilesInS3, bucketName } from '../utils/s3Client.js';
import { PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Uploads a file to S3, downloads it temporarily, loads it into LangChain,
 * splits and ingests it into Pinecone, and deletes the local file afterward.
 */
export const uploadAndIngest = async (req, res) => {
  try {
    // 1. Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const fileKey = Date.now() + '-' + file.originalname;

    // 2. Upload to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // 3. Download from S3 (to use loaders that need disk file)
    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
    const localFilePath = path.join(__dirname, '..', 'temp', fileKey);

    // Ensure temp dir exists
    fs.mkdirSync(path.join(__dirname, '..', 'temp'), { recursive: true });

    const writer = fs.createWriteStream(localFilePath);
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // 4. Load the document using the correct loader
    let loader;
    if (file.mimetype === 'application/pdf') {
      loader = new PDFLoader(localFilePath);
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      loader = new DocxLoader(localFilePath);
    } else if (file.mimetype === 'text/plain') {
      loader = new TextLoader(localFilePath);
    } else {
      fs.unlinkSync(localFilePath); // Cleanup temp
      return res.status(400).json({ message: 'Unsupported file type' });
    }

    const docs = await loader.load();

    // 5. Split the document for better embedding context
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // 6. Ingest into Pinecone
    await PineconeStore.fromDocuments(splitDocs, openaiEmbedding, {
      pineconeIndex,
    });

    // 7. Cleanup: remove temp file and local multer upload
    fs.unlinkSync(localFilePath);
    fs.unlinkSync(file.path);

    // 8. List all files in S3 for updated file list
    const listResponse = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName }));
    const fileKeys = listResponse.Contents?.map((obj) => obj.Key) || [];

    return res.json({
      message: 'File uploaded and ingested successfully',
      file: fileKey,
      files: fileKeys,
    });
  } catch (err) {
    console.error('Ingestion error:', err);
    res.status(500).json({ message: 'Ingestion failed', error: err.message });
  }
};

/**
 * Lists all uploaded files stored in S3 bucket.
 */
export const getFiles = async (req, res) => {
  try {
    const data = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName }));
    const fileKeys = data.Contents?.map((obj) => obj.Key) || [];
    res.json({ files: fileKeys });
  } catch (err) {
    console.error('List files error:', err);
    res.status(500).json({ message: 'Failed to list files', error: err.message });
  }
};

/**
 * Deletes a specific file from S3 bucket.
 */
export const deleteFile = async (req, res) => {
  const filename = req.params.filename;

  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filename,
    }));

    // Fetch updated file list
    const data = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName }));
    const fileKeys = data.Contents?.map((obj) => obj.Key) || [];

    res.json({ message: 'File deleted successfully', files: fileKeys });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ message: 'Failed to delete file', error: err.message });
  }
};
