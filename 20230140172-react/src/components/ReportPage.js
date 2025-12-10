import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State untuk Modal Foto
  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate();

  const fetchReports = async (query = "") => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // URL backend untuk mengambil semua data (history)
      const url = query ? `http://localhost:3001/api/reports/daily?nama=${query}` : "http://localhost:3001/api/reports/daily";
      const response = await axios.get(url, config);
      setReports(response.data.data || []); 
      setError(null);
    } catch (err) {
       if (err.response && err.response.status === 403) setError("Akses ditolak. Anda bukan admin.");
       else setError("Gagal mengambil laporan.");
    }
  };

  useEffect(() => { fetchReports(""); }, [navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports(searchTerm);
  };

  // Helper untuk link Google Maps
  const getMapLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

  // Helper untuk URL Foto dari Backend
  const getPhotoUrl = (filename) => `http://localhost:3001/uploads/${filename}`;

  // Komponen Modal untuk menampilkan foto ukuran penuh
  const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
      }} onClick={onClose}>
        <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
           <img src={imageUrl} alt="Bukti Full" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', boxShadow: '0 0 20px rgba(255,255,255,0.2)' }} />
           <button onClick={onClose} style={{
             position: 'absolute', top: '-15px', right: '-15px', background: 'white', border: 'none', color: 'black', fontSize: '1.5rem', cursor: 'pointer', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
           }}>×</button>
        </div>
      </div>
    );
  };

  // CSS Style untuk sel tabel agar isinya di tengah
  const centerCellStyle = { padding: '1rem', textAlign: 'center', verticalAlign: 'middle', color: '#6b7280' };
  // CSS Style untuk sel tabel biasa (kiri)
  const leftCellStyle = { padding: '1rem', textAlign: 'left', verticalAlign: 'middle', color: '#6b7280' };
  // CSS Style untuk header
  const headerStyle = { padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', verticalAlign: 'middle' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>Laporan Presensi Harian</h1>

      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <input type="text" placeholder="Cari nama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flexGrow: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <button type="submit" style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cari</button>
      </form>

      {error && <p style={{ color: 'red', background: '#fee2e2', padding: '1rem', borderRadius: '4px' }}>{error}</p>}

      {!error && (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ ...headerStyle, textAlign: 'left' }}>Nama</th>
                <th style={headerStyle}>Check-In</th>
                <th style={headerStyle}>Check-Out</th>
                {/* Header Lokasi dipisah dan di-tengah */}
                <th style={headerStyle}>Latitude</th>
                <th style={headerStyle}>Longitude</th>
                <th style={headerStyle}>Bukti Foto</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((presensi) => (
                  <tr key={presensi.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ ...leftCellStyle, color: '#111827' }}>{presensi.user ? presensi.user.nama : "N/A"}</td>
                    <td style={centerCellStyle}>{new Date(presensi.checkIn).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</td>
                    <td style={centerCellStyle}>{presensi.checkOut ? new Date(presensi.checkOut).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "-"}</td>
                    
                    {/* --- KOLOM LATITUDE (Tengah) --- */}
                    <td style={{ ...centerCellStyle, fontSize: '0.85rem' }}>
                      {presensi.latitude ? (
                        <a href={getMapLink(presensi.latitude, presensi.longitude)} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                          {presensi.latitude}
                        </a>
                      ) : "-"}
                    </td>

                    {/* --- KOLOM LONGITUDE (Tengah) --- */}
                    <td style={{ ...centerCellStyle, fontSize: '0.85rem' }}>
                      {presensi.longitude ? (
                        <a href={getMapLink(presensi.latitude, presensi.longitude)} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                          {presensi.longitude}
                        </a>
                      ) : "-"}
                    </td>

                    {/* --- KOLOM BUKTI FOTO (Tengah) --- */}
                    <td style={{ ...centerCellStyle, padding: '0.5rem' }}>
                        {presensi.buktiFoto ? (
                            // Pembungkus div untuk memastikan gambar benar-benar di tengah
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <img 
                                    src={getPhotoUrl(presensi.buktiFoto)} 
                                    alt="Bukti" 
                                    title="Klik untuk memperbesar"
                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ddd', display: 'block' }}
                                    onClick={() => setSelectedImage(getPhotoUrl(presensi.buktiFoto))}
                                />
                            </div>
                        ) : (
                            <span style={{fontSize: '0.8rem', color: '#ccc'}}>No Photo</span>
                        )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Tidak ada data ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Render Modal jika ada gambar yang dipilih */}
      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
    </div>
  );
}

export default ReportPage;