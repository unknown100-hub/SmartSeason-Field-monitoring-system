const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Middleware to protect routes and check for roles
const { protect } = require('./authMiddleware');
// Middleware to check for admin role
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }   
    next();
};

module.exports = { adminOnly };