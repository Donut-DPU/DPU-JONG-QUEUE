// booking-backend/src/models/ServiceHoliday.js
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import Service from "./Service.js";

class ServiceHoliday extends Model {}

ServiceHoliday.init(
  {
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "services", key: "id" },
    },
    date: {
      type: DataTypes.DATEONLY,  // YYYY-MM-DD
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ServiceHoliday",
    tableName: "service_holidays",
    timestamps: false,
  }
);

Service.hasMany(ServiceHoliday, { foreignKey: "service_id" });
ServiceHoliday.belongsTo(Service, { foreignKey: "service_id" });

export default ServiceHoliday;
