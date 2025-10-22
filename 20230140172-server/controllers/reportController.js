// controllers/reportController.js
const { getAllPresensi } = require('./presensiController'); // Impor fungsi yang sudah diperbarui

exports.getDailyReport = (req, res) => {
  const allPresensi = getAllPresensi(); // Ini sekarang mengambil dari presensiData.js via presensiController
  const today = new Date().toDateString();

  // Filter presensi untuk hari ini
  const dailyReport = allPresensi.filter(p =>
    p.checkIn && new Date(p.checkIn).toDateString() === today
  );

  if (dailyReport.length === 0) {
    return res.status(404).json({ message: 'Belum ada data presensi untuk hari ini.' });
  }

  res.status(200).json({ message: 'Laporan harian berhasil diambil', data: dailyReport });
};