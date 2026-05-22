import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const b64 =
      Buffer.from(req.file.buffer).toString("base64");

    const dataURI =
      "data:" +
      req.file.mimetype +
      ";base64," +
      b64;

    const result =
      await cloudinary.uploader.upload(dataURI);

    res.json({
      url: result.secure_url
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Upload failed"
    });

  }
});

export default router;