const User = require('../models/user');

const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const newUser = await User.create({ name, email, password_hash: password, role });
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message || 'Unknown error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const [updatedRowsCount] = await User.update(req.body, { where: { id: req.params.id } });
        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await User.findByPk(req.params.id);
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const deletedRowsCount = await User.destroy({ where: { id: req.params.id } });
        if (deletedRowsCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};
