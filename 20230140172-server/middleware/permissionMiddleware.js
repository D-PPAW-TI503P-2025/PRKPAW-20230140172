const jwt = require("jsonwebtoken");
const JWT_SECRET = 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN'; 

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Token biasanya dikirim dengan format "Bearer <token>", jadi kita split spasi
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak disediakan." });
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res.status(403).json({ message: "Token tidak valid atau kedaluwarsa." });
    }
    // Simpan data user dari token ke req.user agar bisa dipakai di controller
    req.user = userPayload; 
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  // Cek apakah role user adalah admin
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Akses ditolak. Hanya untuk admin." });
  }
};