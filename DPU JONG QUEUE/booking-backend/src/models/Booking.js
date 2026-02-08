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
Booking.beforeCreate(async (booking) => {
  // booking.date = YYYY-MM-DD
  const [year, month] = booking.date.split("-");

  const count = await Booking.count({
    where: {
      date: {
        [Op.between]: [
          `${year}-${month}-01`,
          `${year}-${month}-31`,
        ],
      },
    },
  });

  const running = String(count + 1).padStart(4, "0");
  booking.bookingCode = `BK-${year}-${month}-${running}`;
});

export default Booking;
