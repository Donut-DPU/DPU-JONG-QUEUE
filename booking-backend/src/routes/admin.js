import { Router } from "express";
import bcrypt from "bcrypt";

import User from "../models/User.js";

import {
  authRequired,
  adminOnly
} from "../middleware/auth.js";

const router = Router();

/**
 * =========================
 * GET USERS
 * =========================
 */
router.get(
  "/users",
  authRequired,
  adminOnly,
  async (req, res) => {

    try {

      const { role } = req.query;

      const where = {};

      if (role) {
        where.role = role;
      }

      const users =
        await User.findAll({

          where,

          attributes: {
            exclude: ["password"]
          },

          order: [["id", "DESC"]],
        });

      res.json(users);

    } catch (e) {

      console.error(e);

      res.status(500).json({
        message: "โหลด users ไม่สำเร็จ"
      });

    }

  }
);

/**
 * =========================
 * GET ADMINS
 * =========================
 */
router.get(
  "/admins",
  authRequired,
  adminOnly,
  async (req, res) => {

    try {

      const admins =
        await User.findAll({

          where: {
            role: "admin"
          },

          attributes: {
            exclude: ["password"]
          },

          order: [["id", "DESC"]],
        });

      res.json(admins);

    } catch (e) {

      console.error(e);

      res.status(500).json({
        message: "โหลด admin ไม่สำเร็จ"
      });

    }

  }
);

/**
 * =========================
 * CREATE ADMIN
 * =========================
 */
router.post(
  "/users/create-admin",
  authRequired,
  adminOnly,
  async (req, res) => {

    try {

      const {
        fullName,
        email,
        password
      } = req.body;

      if (
        !fullName ||
        !email ||
        !password
      ) {

        return res.status(400).json({
          message: "กรอกข้อมูลไม่ครบ"
        });

      }

      const exists =
        await User.findOne({
          where: { email }
        });

      if (exists) {

        return res.status(400).json({
          message: "Email นี้ถูกใช้แล้ว"
        });

      }

      const hashed =
        await bcrypt.hash(password, 10);

      const names = fullName.trim().split(" ");

      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ") || "";

      const user =
        await User.create({

          fullName,
          firstName,
          lastName,

          email,

          passwordHash: hashed,

          role: "admin"
        });

      res.json({
        message: "สร้าง admin สำเร็จ",
        user
      });

    } catch (e) {

      console.error(e);

      res.status(500).json({
        message: e.message || "สร้าง admin ไม่สำเร็จ"
      });

    }

  }
);

/**
 * =========================
 * UPDATE USER
 * =========================
 */
router.put(
  "/users/:id",
  authRequired,
  adminOnly,
  async (req, res) => {

    try {

      const user =
        await User.findByPk(req.params.id);

      if (!user) {

        return res.status(404).json({
          message: "ไม่พบ user"
        });

      }

      const {
        fullName,
        email
      } = req.body;

      const names = fullName.trim().split(" ");

      const firstName = names[0] || "";
      const lastName = names.slice(1).join(" ") || "";

      await user.update({

        fullName,
        firstName,
        lastName,

        email

      });

      res.json({
        message: "อัปเดตสำเร็จ",
        user
      });

    } catch (e) {

      console.error(e);

      res.status(500).json({
        message: "อัปเดตไม่สำเร็จ"
      });

    }

  }
);

/**
 * =========================
 * RESET PASSWORD
 * =========================
 */
router.put(
  "/users/:id/reset-password",
  authRequired,
  adminOnly,
  async (req, res) => {

    try {

      const {
        newPassword
      } = req.body;

      if (!newPassword) {

        return res.status(400).json({
          message: "กรุณากรอกรหัสผ่าน"
        });

      }

      const user =
        await User.findByPk(req.params.id);

      if (!user) {

        return res.status(404).json({
          message: "ไม่พบ user"
        });

      }

      const hashed =
        await bcrypt.hash(newPassword, 10);

      await user.update({
        passwordHash: hashed
      });

      res.json({
        message: "รีเซ็ตรหัสผ่านสำเร็จ"
      });

    } catch (e) {

      console.error(e);

      res.status(500).json({
        message: "รีเซ็ตรหัสไม่สำเร็จ"
      });

    }

  }
);

/**
 * =========================
 * DELETE USER
 * =========================
 */
router.delete(
  "/users/:id",
  authRequired,
  adminOnly,
  async (req, res) => {

    try {

      const user =
        await User.findByPk(req.params.id);

      if (!user) {

        return res.status(404).json({
          message: "ไม่พบ user"
        });

      }

      /**
       * 🔥 กัน admin ลบตัวเอง
       */
      if (user.id === req.user.id) {

        return res.status(400).json({
          message: "ไม่สามารถลบบัญชีตัวเองได้"
        });

      }

      await user.destroy();

      res.json({
        message: "ลบสำเร็จ"
      });

    } catch (e) {

      console.error(e);

      res.status(500).json({
        message: "ลบไม่สำเร็จ"
      });

    }

  }
);

export default router;