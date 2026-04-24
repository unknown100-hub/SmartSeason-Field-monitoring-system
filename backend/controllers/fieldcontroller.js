//create the field controller
const Field = require('../models/field');
const FieldUpdate = require('../models/fieldUpdate');
const FieldAssignment = require('../models/fieldassignment');
const User = require('../models/user');

const createField = async (req, res) => {
    try {
        const { name, croptype, location, size, soilType, irrigationType, plantingDate, harvestDate } = req.body;
        const field = await Field.create({
            name,
            croptype,
            location,
            size,
            soilType,
            irrigationType,
            plantingDate,
            harvestDate
        });
        res.status(201).json({ message: 'Field created successfully', field });
    } catch (error) {
        res.status(500).json({ message: 'Error creating field', error: error.message || 'Unknown error' });
    }
};

const getFields = async (req, res) => {
    try {
        const fields = await Field.findAll();
        res.status(200).json(fields);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fields', error: error.message });
    }
};

const getFieldById = async (req, res) => {
    try {
        const field = await Field.findByPk(req.params.id);
        if (!field) {
            return res.status(404).json({ message: 'Field not found' });
        }
        res.status(200).json(field);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching field', error: error.message });
    }
};

const updateField = async (req, res) => {
    try {
        const [updatedRowsCount] = await Field.update(req.body, { where: { id: req.params.id } });
        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: 'Field not found' });
        }
        const updatedField = await Field.findByPk(req.params.id);
        res.status(200).json({ message: 'Field updated successfully', field: updatedField });
    } catch (error) {
        res.status(500).json({ message: 'Error updating field', error: error.message });
    }
};

const deleteField = async (req, res) => {
    try {
        const deletedRowsCount = await Field.destroy({ where: { id: req.params.id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'Field not found' });
        }
        res.status(200).json({ message: 'Field deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting field', error: error.message });
    }
};

module.exports = {
    createField,
    getFields,
    getFieldById,
    updateField,
    deleteField
};