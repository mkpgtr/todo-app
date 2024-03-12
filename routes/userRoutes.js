const express = require('express');
const { getCurrentUser } = require('../controllers/userController');
const authenticateUser = require('../middlewares/authMiddleware');

const router = express.Router();


router.get('/current-user',authenticateUser,getCurrentUser);

module.exports = router;