const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FieldAssignment = sequelize.define('FieldAssignment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fieldId: {
        type: DataTypes.STRING(40),
        allowNull: false,
    },
    agentId: {
        type: DataTypes.STRING(40),
        allowNull: false,
    },
    assignedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.ENUM('assigned', 'in_progress', 'completed'),
        defaultValue: 'assigned',
    },
}, {
    tableName: 'field_assignments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = FieldAssignment;    