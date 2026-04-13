const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { Readable } = require('stream');

/**
 * @file gridfs.js
 * @description Multer storage engine using a custom GridFS implementation.
 * 
 * We use a custom multer StorageEngine instead of multer-gridfs-storage's
 * URL/db options to avoid race conditions at module load time. The GridFSBucket
 * is accessed lazily from the already-open Mongoose connection at the moment
 * of upload, guaranteeing it's always ready.
 */

const gridFsStorage = {
  _handleFile(req, file, cb) {
    const db = mongoose.connection.db;

    if (!db) {
      return cb(new Error('Database connection is not ready. Please try again.'));
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'event_images'
    });

    crypto.randomBytes(16, (err, buf) => {
      if (err) return cb(err);

      const filename = buf.toString('hex') + path.extname(file.originalname);

      const uploadStream = bucket.openUploadStream(filename, {
        metadata: { originalname: file.originalname, mimetype: file.mimetype }
      });

      file.stream.pipe(uploadStream)
        .on('error', (err) => {
          console.error('[GRIDFS UPLOAD ERROR]', err);
          cb(err);
        })
        .on('finish', () => {
          cb(null, {
            filename: filename,
            bucketName: 'event_images',
            id: uploadStream.id
          });
        });
    });
  },

  _removeFile(req, file, cb) {
    const db = mongoose.connection.db;
    if (!db || !file.id) return cb(null);
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'event_images' });
    bucket.delete(file.id, cb);
  }
};

const upload = multer({
  storage: gridFsStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, png, webp) are allowed!'));
  }
});

module.exports = upload;
