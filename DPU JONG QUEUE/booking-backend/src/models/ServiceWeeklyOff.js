// booking-backend/src/models/ServiceWeeklyOff.js
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import Service from "./Service.js";

class ServiceWeeklyOff extends Model {}

ServiceWeeklyOff.init(
  {
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "services", key: "id" },
    },
    weekday: {
      type: DataTypes.SMALLINT, // 0-6
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ServiceWeeklyOff",
    tableName: "service_weekly_off",
    timestamps: false,
  }
);

// (จะ set association เพิ่มก็ได้)
Service.hasMany(ServiceWeeklyOff, { foreignKey: "service_id" });
ServiceWeeklyOff.belongsTo(Service, { foreignKey: "service_id" });

export default ServiceWeeklyOff;
