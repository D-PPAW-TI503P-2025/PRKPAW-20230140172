// data/presensiData.js
const presensi = []; // Array untuk menyimpan data presensi di memori
let idCounter = 1; // Counter untuk ID unik

const addPresensi = (newPresensiData) => {
  const presensiEntry = {
    id: idCounter++,
    ...newPresensiData, // userId, checkIn, checkOut
  };
  presensi.push(presensiEntry);
  return presensiEntry;
};

const findPresensi = (criteria) => {
  // criteria bisa berupa fungsi callback, contoh: p => p.userId === userId && ...
  return presensi.find(criteria);
};

const updatePresensi = (id, updatedData) => {
  const index = presensi.findIndex(p => p.id === id);
  if (index !== -1) {
    presensi[index] = { ...presensi[index], ...updatedData };
    return presensi[index];
  }
  return null;
};

const getAllPresensi = () => {
  return [...presensi]; // Kembalikan salinan array agar data asli tidak termodifikasi
};

const resetPresensi = () => {
  // Fungsi ini berguna untuk testing, hapus semua data
  presensi.length = 0;
  idCounter = 1;
}

module.exports = {
  addPresensi,
  findPresensi,
  updatePresensi,
  getAllPresensi,
  resetPresensi // Ekspor jika perlu untuk testing
};