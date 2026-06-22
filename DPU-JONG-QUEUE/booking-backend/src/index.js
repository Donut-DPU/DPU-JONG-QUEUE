import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/database.js";

// MODELS
import "./models/User.js";
import "./models/Category.js";
import "./models/Service.js";
import "./models/Booking.js";
import "./models/ServiceHoliday.js";
import "./models/ServiceWeeklyOff.js";

// ROUTES
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import serviceRoutes from "./routes/services.js";
import bookingRoutes from "./routes/bookings.js";
import categoryRoutes from "./routes/categories.js";
import uploadRoutes from "./routes/upload.js";

// JOBS
import startAutoCancelJob from "./jobs/autoCancel.js";
import startAutoConfirmJob from "./jobs/autoConfirmBookings.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://dpu-jong-queue.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);

const start = async () => {
  try {

    await sequelize.authenticate();
    console.log("✅ DB connected");

    await sequelize.sync({ alter: true });
    console.log("✅ DB synced");

    app.listen(process.env.PORT, () => {
      console.log(
        `🚀 Server running http://localhost:${process.env.PORT}`
      );
    });

    // ✅ START JOBS
    startAutoCancelJob();
    startAutoConfirmJob();

    console.log("✅ Auto Jobs Started");

  } catch (e) {

    console.error("🔥 ERROR:", e);

    process.exit(1);
  }
};

start();