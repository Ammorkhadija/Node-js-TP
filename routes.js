const express = require('express');
const router = express.Router();
const requestHandlers = require('./requestHandlers');

// Routes
router.get('/', requestHandlers.start);
router.get('/start', requestHandlers.start);
router.post('/register', requestHandlers.register);
router.get('/upload', requestHandlers.uploadPage);
router.post('/upload', requestHandlers.upload);
router.get('/find', requestHandlers.find);
router.get('/show', requestHandlers.show);
router.get('/login', requestHandlers.loginPage);
router.post('/login', requestHandlers.login);
router.get('/logout', requestHandlers.logout);
router.get('/profile', requestHandlers.profilePage);

module.exports = router;
