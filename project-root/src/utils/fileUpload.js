import multer from 'multer';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';

// Configure local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/videos');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  const filetypes = /mp4|mov|avi|wmv|flv|mkv/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: Videos Only!'));
};

// Configure multer for local upload
export const uploadLocal = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

/**
 * Uploads a file to cloud storage if configured, otherwise keeps it local
 * @param {string} filePath - Path to the local file
 * @param {string} fileName - Name to use for the file in cloud storage
 * @returns {Promise<string>} - URL of the uploaded file
 */
export const uploadToCloud = async (filePath, fileName) => {
  // Check if cloud storage is configured
  if (!process.env.CLOUD_STORAGE_KEY) {
    console.log('Cloud storage not configured. Using local storage.');
    return `${process.env.BASE_URL || 'http://localhost:' + process.env.PORT}/videos/${path.basename(filePath)}`;
  }

  try {
    // Initialize storage
    const storage = new Storage({
      credentials: JSON.parse(process.env.CLOUD_STORAGE_KEY),
    });

    const bucketName = process.env.STORAGE_BUCKET || 'video-management-app';
    const bucket = storage.bucket(bucketName);

    // Upload file to cloud storage
    await bucket.upload(filePath, {
      destination: fileName,
      metadata: {
        contentType: 'video/mp4',
      },
    });

    // Make the file public
    await bucket.file(fileName).makePublic();

    // Delete local file after upload
    fs.unlinkSync(filePath);

    // Return public URL
    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to cloud storage:', error);
    
    // Fallback to local storage
    return `${process.env.BASE_URL || 'http://localhost:' + process.env.PORT}/videos/${path.basename(filePath)}`;
  }
};

/**
 * Processes a video to generate thumbnail and get duration
 * @param {string} filePath - Path to the video file
 * @returns {Promise<Object>} - Object containing thumbnail path and duration
 */
export const processVideo = async (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      // Generate a unique filename for the thumbnail
      const thumbnailFilename = `${uuidv4()}.jpg`;
      const thumbnailPath = path.join('public/thumbnails', thumbnailFilename);

      // Create thumbnails directory if it doesn't exist
      const thumbnailDir = path.join('public/thumbnails');
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }

      // Generate thumbnail
      ffmpeg(filePath)
        .screenshots({
          count: 1,
          folder: 'public/thumbnails',
          filename: thumbnailFilename,
          size: '320x240',
        });

      // Get video duration and other metadata
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          return reject(err);
        }

        const duration = metadata.format.duration;

        resolve({
          thumbnailPath: `${process.env.BASE_URL || 'http://localhost:' + process.env.PORT}/thumbnails/${thumbnailFilename}`,
          duration,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};