import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

router.post(
  "/",
  upload.single("image"),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded"
        });
      }

      const base64 =
        req.file.buffer.toString("base64");

      const dataURI =
        `data:${req.file.mimetype};base64,${base64}`;

      const result =
        await cloudinary.uploader.upload(dataURI, {
          folder: "services"
        });

      res.json({
        url: result.secure_url
      });

    } catch (err) {

      console.error("UPLOAD ERROR:", err);

      res.status(500).json({
        message: err.message || "Upload failed"
      });

    }

  }
);

export default router;