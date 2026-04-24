const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Field = sequelize.define('Field', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    croptype: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    size: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    soilType: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    irrigationType: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    plantingDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    harvestDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'fields',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Field;
