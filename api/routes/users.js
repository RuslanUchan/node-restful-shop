const express = require('express')

const router = express.Router()

const UsersController = require('../controllers/usersController')

// Routes
router.post('/signup', UsersController.user_signup)
router.post('/login', UsersController.user_login)
router.delete('/:userId', UsersController.user_delete_user)

module.exports = router