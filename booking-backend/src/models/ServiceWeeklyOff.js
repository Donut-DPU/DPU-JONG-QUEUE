import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Service from "./Service.js";

const ServiceWeeklyOff = sequelize.define("ServiceWeeklyOff", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  day_of_week: {
    type: DataTypes.INTEGER, // 0=Sunday ... 6=Saturday
    allowNull: false,
  },
});

Service.hasMany(ServiceWeeklyOff, { foreignKey: "service_id" });
ServiceWeeklyOff.belongsTo(Service, { foreignKey: "service_id" });

export default ServiceWeeklyOff;