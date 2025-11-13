import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Service from "./Service.js";

class Booking extends Model {}

Booking.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    // วันที่และเวลา (แยกเก็บเพื่อ query ง่าย)
    date: { type: DataTypes.DATEONLY, allowNull: false }, // YYYY-MM-DD
    time: { type: DataTypes.STRING, allowNull: false },   // HH:mm (คือ slot เริ่มต้น)

    status: {
      type: DataTypes.ENUM("pending","confirmed","checked_in","completed","cancelled","no_show"),
      defaultValue: "pending",
    },
    note: { type: DataTypes.STRING },
  },
  { sequelize, modelName: "Booking", tableName: "bookings", underscored: true }
);

// Associations
User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

Service.hasMany(Booking, { foreignKey: "service_id" });
Booking.belongsTo(Service, { foreignKey: "service_id" });

export default Booking;
