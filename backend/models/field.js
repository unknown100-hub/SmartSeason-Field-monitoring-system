const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Field = sequelize.define('Field', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    field_code: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    crop_type: {
        type: DataTypes.STRING(80),
        allowNull: false,
    },
    location: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    hectares: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    soil_type: {
        type: DataTypes.STRING(80),
        allowNull: false,
    },
    irrigation_type: {
        type: DataTypes.STRING(80),
        allowNull: false,
    },
    planting_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    harvest_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    stage: {
        type: DataTypes.STRING(60),
        defaultValue: 'Planted',
    },
    risk_level: {
        type: DataTypes.STRING(30),
        defaultValue: 'Moderate',
    },
    moisture: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 56.00,
    },
    ndvi: {
        type: DataTypes.DECIMAL(4, 2),
        defaultValue: 0.60,
    },
    completion: {
        type: DataTypes.INTEGER,
        defaultValue: 12,
    },
    assignee_id: {
        type: DataTypes.STRING(40),
        defaultValue: 'u-002',
    },
    status_label: {
        type: DataTypes.STRING(80),
        defaultValue: 'Active',
    },
    last_update: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'fields',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Field;
