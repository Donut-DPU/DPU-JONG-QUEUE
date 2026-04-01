import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import Category from "./Category.js";

class Service extends Model {}

Service.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    active: { type: DataTypes.BOOLEAN, defaultValue: true },

    dailyStartTime: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "09:00",
    },
    dailyEndTime: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "18:00",
    },

    slotDurationMin: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },

    slotCapacity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    image_url: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "Service",
    tableName: "services",
    underscored: true,
  }
);

// relation
Category.hasMany(Service, { foreignKey: "category_id" });
Service.belongsTo(Category, { foreignKey: "category_id" });

export default Service;