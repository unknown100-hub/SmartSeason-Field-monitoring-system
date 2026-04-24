const express = require('express');
const router = express.Router();
const{register,getusers,createUser,loginUser} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', loginUser);
router.get('/users', getusers);
router.post('/users', createUser); 