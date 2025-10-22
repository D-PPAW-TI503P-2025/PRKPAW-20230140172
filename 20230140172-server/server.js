// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;
const morgan = require("morgan"); // Middleware logging

// Impor router
const ruteBuku = require("./routes/books"); // Router dari pertemuan sebelumnya
const presensiRoutes = require("./routes/presensi"); // Router baru
const reportRoutes = require("./routes/reports");   // Router baru

// Middleware Global
app.use(cors()); // Mengizinkan request dari origin berbeda
app.use(express.json()); // Mem-parsing body request JSON
app.use(morgan("dev")); // Logging request ke console (format 'dev')

// Middleware logging custom (opsional, contoh dari modul)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next(); // Lanjutkan ke middleware/route selanjutnya
});

// Rute Dasar
app.get("/", (req, res) => {
  res.send("Home Page for API presensi dan buku");
});

// Gunakan Router
app.use("/api/books", ruteBuku); // Rute untuk buku
app.use("/api/presensi", presensiRoutes); // Rute untuk presensi
app.use("/api/reports", reportRoutes);   // Rute untuk reports

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});