import { Router } from "express";
import { authRequired, adminOnly } from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

// POST /api/admin/users/promote  { userId }
router.post("/users/promote", authRequired, adminOnly, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.role = "admin";
    await user.save();
    res.json({ message: "Promoted to admin", user: { id: user.id, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
