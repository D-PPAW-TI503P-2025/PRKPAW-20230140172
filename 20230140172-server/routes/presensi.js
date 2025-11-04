// routes/presensi.js
const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { addUserData } = require('../middleware/permissionMiddleware'); // Impor middleware

// Terapkan middleware addUserData ke semua rute di bawah ini
router.use(addUserData);

router.post('/check-in', presensiController.CheckIn);
router.post('/check-out', presensiController.CheckOut);

router.delete("/:id", presensiController.deletePresensi);
router.put("/:id", presensiController.updatePresensi);

module.exports = router;