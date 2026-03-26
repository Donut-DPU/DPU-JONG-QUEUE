import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Service from "./Service.js";

const ServiceHoliday = sequelize.define("ServiceHoliday", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
});

Service.hasMany(ServiceHoliday, { foreignKey: "service_id" });
ServiceHoliday.belongsTo(Service, { foreignKey: "service_id" });

export default ServiceHoliday;