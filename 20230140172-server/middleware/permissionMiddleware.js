// middleware/permissionMiddleware.js

// Data user dummy (gantilah dengan sistem autentikasi sebenarnya nanti)
const users = [
  { userId: 1, username: 'user1', role: 'user' },
  { userId: 2, username: 'admin', role: 'admin' },
];

exports.addUserData = (req, res, next) => {
  // Asumsi: userId dikirim di header 'x-user-id' untuk simulasi
  // Dalam aplikasi nyata, ini akan diambil dari token JWT atau session
  const userId = parseInt(req.headers['x-user-id'], 10);
  const user = users.find(u => u.userId === userId);

  if (!user) {
    // Jika tidak ada user id di header, coba set default ke user biasa untuk check-in/out
    // Tapi untuk report, harus ada user admin
     if (req.path.startsWith('/daily') && !userId) {
       return res.status(401).json({ message: 'Akses ditolak. Header x-user-id dibutuhkan.' });
     }
     // Set default user jika tidak ada header (untuk checkin/checkout)
     req.userData = users.find(u => u.role === 'user'); // default ke user pertama
  } else {
    req.userData = user; // Tambahkan data user ke request
  }

  if (!req.userData) {
     // Fallback jika user default tidak ditemukan
     return res.status(401).json({ message: 'User tidak ditemukan.' });
  }

  console.log('User Data Added:', req.userData); // Log untuk debugging
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.userData) {
     return res.status(401).json({ message: 'Data pengguna tidak tersedia.' });
  }
  console.log('Checking Admin Role:', req.userData); // Log untuk debugging
  if (req.userData.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa mengakses.' });
  }
  next();
};