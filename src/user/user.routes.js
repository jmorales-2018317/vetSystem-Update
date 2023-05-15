'use strict'

const userController = require('./user.controller');
const express = require('express');
const api = express.Router();
const { ensureAuth } = require('../services/authenticated');

api.get('/', ensureAuth , userController.test);
api.post('/register', userController.register);
api.post('/login', userController.login);
api.put('/update/:id', ensureAuth, userController.updateUser);
api.put('/updatePassword/:id', ensureAuth, userController.updatePassword);
api.delete('/delete/:id', ensureAuth, userController.deleteUser);

module.exports = api;