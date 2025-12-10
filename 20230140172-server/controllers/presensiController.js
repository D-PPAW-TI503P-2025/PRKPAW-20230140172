const { Presensi } = require('../models');
const { Op } = require('sequelize');
const { startOfDay, endOfDay } = require('date-fns');
const multer = require('multer');
const path = require('path');

// --- Konfigurasi Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Nama file: userId-timestamp.jpg
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

exports.upload = multer({ storage: storage, fileFilter: fileFilter });

// --- Fungsi Check-In Baru ---
exports.CheckIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude } = req.body;
    // Ambil path foto dari req.file (jika ada)
    const buktiFoto = req.file ? req.file.filename : null;

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const existingCheckIn = await Presensi.findOne({
      where: {
        userId: userId,
        checkIn: { [Op.between]: [todayStart, todayEnd] },
      },
    });

    if (existingCheckIn) {
      return res.status(400).json({ message: 'Anda sudah melakukan check-in hari ini.' });
    }

    const newPresensi = await Presensi.create({
      userId: userId,
      checkIn: now,
      latitude: latitude,
      longitude: longitude,
      buktiFoto: buktiFoto, // Simpan nama file ke DB
      checkOut: null,
    });

    res.status(201).json({
      message: 'Check-in berhasil',
      data: newPresensi
    });

  } catch (error) {
    console.error("Error CheckIn:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.CheckOut = async (req, res) => {
    // Logika CheckOut tetap sama
    try {
        const userId = req.user.id;
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
    
        const checkInData = await Presensi.findOne({
          where: { userId: userId, checkOut: null, checkIn: { [Op.between]: [todayStart, todayEnd] } },
        });
    
        if (!checkInData) {
          return res.status(400).json({ message: 'Anda belum check-in atau sudah check-out.' });
        }
    
        checkInData.checkOut = now;
        await checkInData.save();
    
        res.status(200).json({ message: 'Check-out berhasil', data: checkInData });
      } catch (error) {
        res.status(500).json({ message: "Error server", error: error.message });
      }
};