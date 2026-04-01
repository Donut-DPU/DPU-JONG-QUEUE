const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    cloudinary.uploader.upload_stream(
      { folder: 'services' },
      (error, result) => {
        if (error) return res.status(500).json(error);
        res.json({ url: result.secure_url });
      }
    ).end(req.file.buffer);
  } catch (err) {
    res.status(500).send('Upload error');
  }
});

module.exports = router;