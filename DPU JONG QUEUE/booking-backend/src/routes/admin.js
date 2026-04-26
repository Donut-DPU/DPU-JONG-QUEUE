import { Router } from "express";
import { authRequired, adminOnly } from "../middleware/auth.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = Router();

// POST /api/admin/users/promote
router.post("/users/promote", authRequired, adminOnly, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "admin";
    await user.save();

    res.json({
      message: "Promoted to admin",
      user: { id: user.id, role: user.role }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ✅ CREATE ADMIN (ไม่มี username แล้ว)
router.post("/users/create-admin", authRequired, adminOnly, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      email,
      passwordHash: hashedPassword, // ✅ ต้องใช้ชื่อนี้
      fullName: `${firstName} ${lastName}`, // ✅ ต้องใช้ชื่อนี้
      role: "admin"
    });

    res.json({
      message: "Admin created successfully",
      user: newAdmin
    });

  } catch (e) {
    console.error("🔥 CREATE ADMIN ERROR:", e);
    res.status(500).json({ message: e.message });
  }
});

// GET /api/admin/users
router.get("/users", authRequired, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "admin" }
    });

    const result = users.map(u => {
      const [firstName, ...rest] = (u.fullName || "").split(" ");
      return {
        ...u.toJSON(),
        firstName,
        lastName: rest.join(" ")
      };
    });

    res.json(result);

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

export default router;