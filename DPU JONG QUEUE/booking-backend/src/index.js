import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";

// MODELS
import "./models/User.js";
import "./models/Service.js";
import "./models/Booking.js";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import serviceRoutes from "./routes/services.js";
import bookingRoutes from "./routes/bookings.js";

import startAutoCancelJob from "./jobs/autoCancel.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // dev
    app.listen(process.env.PORT, () =>
      console.log(`Server running http://localhost:${process.env.PORT}`)
    );
    startAutoCancelJob(); // <<< เริ่มงานยกเลิกอัตโนมัติ
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
start();
