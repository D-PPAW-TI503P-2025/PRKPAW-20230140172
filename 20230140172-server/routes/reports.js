// routes/reports.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { addUserData, isAdmin } = require('../middleware/permissionMiddleware'); // Impor middleware

// Terapkan middleware addUserData dan isAdmin HANYA untuk rute ini
router.get('/daily', [addUserData, isAdmin], reportController.getDailyReport);

module.exports = router;