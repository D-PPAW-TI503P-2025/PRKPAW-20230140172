// controllers/presensiController.js
const presensiData = require('../data/presensiData'); // Impor data manager

exports.CheckIn = (req, res) => {
  const { userId } = req.userData;
  const now = new Date();

  // Cek apakah user sudah check-in hari ini menggunakan findPresensi
  const todayCheckIn = presensiData.findPresensi(p =>
    p.userId === userId &&
    p.checkIn &&
    new Date(p.checkIn).toDateString() === now.toDateString()
  );

  if (todayCheckIn) {
    return res.status(400).json({ message: 'Anda sudah melakukan check-in hari ini.' });
  }

  // Gunakan addPresensi untuk menambahkan data baru
  const newPresensi = presensiData.addPresensi({
    userId: userId,
    checkIn: now,
    checkOut: null,
  });

  res.status(201).json({ message: 'Check-in berhasil', data: newPresensi });
};

exports.CheckOut = (req, res) => {
  const { userId } = req.userData;
  const now = new Date();

  // Cari data check-in user hari ini yang belum checkout
  const checkInData = presensiData.findPresensi(p =>
    p.userId === userId &&
    p.checkIn &&
    !p.checkOut &&
    new Date(p.checkIn).toDateString() === now.toDateString()
  );

  if (!checkInData) {
    return res.status(400).json({ message: 'Anda belum melakukan check-in hari ini atau sudah check-out.' });
  }

  // Gunakan updatePresensi untuk mengisi waktu checkOut
  const updatedPresensi = presensiData.updatePresensi(checkInData.id, { checkOut: now });

  if (!updatedPresensi) {
     // Seharusnya tidak terjadi jika checkInData ditemukan, tapi sebagai pengaman
     return res.status(500).json({ message: 'Gagal memperbarui data check-out.' });
  }

  res.status(200).json({ message: 'Check-out berhasil', data: updatedPresensi });
};

// Fungsi getAllPresensi sekarang hanya memanggil dari presensiData
exports.getAllPresensi = () => {
  return presensiData.getAllPresensi();
};