import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Service extends Model {}

Service.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },

    // กำหนดช่วงเวลารับบริการต่อวัน (รูปแบบ HH:mm)
    dailyStartTime: { type: DataTypes.STRING, allowNull: false, defaultValue: "09:00" },
    dailyEndTime:   { type: DataTypes.STRING, allowNull: false, defaultValue: "18:00" },

    // ระยะเวลาต่อคิว (นาที)
    slotDurationMin: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },

    // จำนวนลูกค้าที่รับได้ "ต่อ 1 slot" (ถ้ารับทีละคน = 1)
    slotCapacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  },
  { sequelize, modelName: "Service", tableName: "services", underscored: true }
);

export default Service;
