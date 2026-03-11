import { DataTypes, Model, Op } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Service from "./Service.js";

class Booking extends Model {}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    bookingCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "booking_code",
    },

    date: {
      type: DataTypes.DATEONLY, // YYYY-MM-DD
      allowNull: false,
    },

    time: {
      type: DataTypes.STRING, // HH:mm
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "checked_in",
        "completed",
        "cancelled",
        "no_show"
      ),
      defaultValue: "pending",
    },

    note: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "Booking",
    tableName: "bookings",
    underscored: true,
  }
);

/* ---------------- Associations ---------------- */
User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

Service.hasMany(Booking, { foreignKey: "service_id" });
Booking.belongsTo(Service, { foreignKey: "service_id" });

/* ---------------- bookingCode generator ---------------- */
Booking.beforeValidate(async (booking) => {
  console.log("HOOK RUNNING");

  if (booking.bookingCode) return;

  if (!booking.date) {
    throw new Error("Booking date is missing");
  }

  const dateStr = booking.date; // ใช้ตรง ๆ ได้เลย

  /*const dateStr =
    typeof booking.date === "string"
      ? booking.date
      : booking.date.toISOString().split("T")[0];*/

  const [year, month] = dateStr.split("-");

  const startDate = `${year}-${month}-01`;

  const endDate = new Date(year, month, 0)
    .toISOString()
    .split("T")[0];

  const count = await Booking.count({
    where: {
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  const running = String(count + 1).padStart(4, "0");
  booking.bookingCode = `BK-${year}-${month}-${running}`;
});

export default Booking;
