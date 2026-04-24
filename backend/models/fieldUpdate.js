const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FieldUpdate = sequelize.define('FieldUpdate', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    update_code: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
    },
    field_code: {
        type: DataTypes.STRING(40),
        allowNull: false,
    },
    agent_id: {
        type: DataTypes.STRING(40),
        allowNull: false,
    },
    stage: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    tableName: 'field_updates',
    timestamps: false, // Uses created_at manually
    createdAt: 'created_at',
    updatedAt: false,
});

module.exports = FieldUpdate;