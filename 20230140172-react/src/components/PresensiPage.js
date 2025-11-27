import React, { useState } from "react";
import axios from "axios";

function PresensiPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  const handleCheckIn = async () => {
    setMessage(""); setError("");
    try {
      const config = {
        headers: { Authorization: `Bearer ${getToken()}` },
      };
      // Panggil API Check-in
      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-in",
        {}, // Body kosong karena userId diambil dari token di backend
        config
      );
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response ? err.response.data.message : "Check-in gagal");
    }
  };

  const handleCheckOut = async () => {
    setMessage(""); setError("");
    try {
      const config = {
        headers: { Authorization: `Bearer ${getToken()}` },
      };
      // Panggil API Check-out
      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-out",
        {}, 
        config
      );
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response ? err.response.data.message : "Check-out gagal");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', width: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Lakukan Presensi</h2>
        
        {message && <p style={{ color: 'green', marginBottom: '1rem' }}>{message}</p>}
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={handleCheckIn} 
            style={{ padding: '0.75rem 1.5rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Check-In
          </button>
          <button 
            onClick={handleCheckOut} 
            style={{ padding: '0.75rem 1.5rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Check-Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default PresensiPage;