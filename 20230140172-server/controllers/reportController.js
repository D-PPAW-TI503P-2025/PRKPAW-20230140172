const { Presensi, User } = require('../models');
const { Op } = require('sequelize');
const { startOfDay, endOfDay } = require('date-fns');

exports.getDailyReport = async (req, res) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // Ambil parameter pencarian nama dari URL (optional)
  const searchName = req.query.nama || "";

  try {
    const dailyReportData = await Presensi.findAll({
      where: {
        checkIn: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
      // Join dengan tabel User untuk mengambil nama
      include: [{
        model: User,
        as: 'user', // Sesuai alias di models/presensi.js
        attributes: ['nama'], // Hanya ambil kolom nama
        where: {
            nama: {
                [Op.like]: `%${searchName}%` // Fitur pencarian nama
            }
        }
      }],
      order: [
        ['checkIn', 'ASC'],
      ],
    });

    if (!dailyReportData || dailyReportData.length === 0) {
      // Jangan return 404 agar frontend tetap bisa render tabel kosong tanpa error
      return res.status(200).json({ message: 'Belum ada data presensi.', data: [] });
    }

    res.status(200).json({ message: 'Laporan harian berhasil diambil', data: dailyReportData });

  } catch (error) {
    console.error("Error Daily Report:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};