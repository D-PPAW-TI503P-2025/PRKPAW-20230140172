import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Icon Marker Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function PresensiPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);
  const [image, setImage] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const webcamRef = useRef(null);

  const getToken = () => localStorage.getItem("token");

  // Update waktu setiap detik
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setImage(imageSrc);
        } else {
            setError("Gagal mengambil gambar. Kamera belum siap.");
        }
    }
  }, [webcamRef]);

  const retake = () => {
      setImage(null);
      setError("");
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          setError("Gagal ambil lokasi: " + err.message);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setError("Geolocation tidak didukung browser ini.");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleCheckIn = async () => {
    setMessage(""); 
    setError("");
    
    if (!coords) {
        setError("Lokasi wajib ada! Tunggu sampai peta muncul.");
        return;
    }
    if (!image) {
        setError("Foto selfie wajib diambil!");
        return;
    }

    try {
      const blob = await (await fetch(image)).blob();
      const formData = new FormData();
      formData.append('latitude', coords.lat);
      formData.append('longitude', coords.lng);
      formData.append('image', blob, 'selfie.jpg');

      const response = await axios.post(
        "http://localhost:3001/api/presensi/check-in",
        formData, 
        { 
            headers: { 
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'multipart/form-data'
            } 
        }
      );
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response ? err.response.data.message : "Check-in gagal");
    }
  };

  const handleCheckOut = async () => {
     setMessage(""); 
     setError("");
     try {
        const config = {
          headers: { Authorization: `Bearer ${getToken()}` },
        };
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

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        


        {/* Alert Messages */}
        {message && (
          <div style={{ 
            background: '#d1fae5', 
            borderLeft: '4px solid #10b981', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            animation: 'pulse 2s infinite'
          }}>
            <p style={{ color: '#065f46', fontWeight: '600', margin: 0 }}>✅ {message}</p>
          </div>
        )}
        
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            borderLeft: '4px solid #ef4444', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem' 
          }}>
            <p style={{ color: '#991b1b', fontWeight: '600', margin: 0 }}>❌ {error}</p>
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          
          {/* Camera Section */}
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
            padding: '2rem' 
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              📸 Foto Selfie
            </h2>
            
            <div style={{ 
              position: 'relative',
              background: '#000', 
              borderRadius: '15px', 
              overflow: 'hidden', 
              aspectRatio: '4/3',
              marginBottom: '1rem',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
            }}>
              {image ? (
                <img 
                  src={image} 
                  alt="Selfie" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  mirrored={true}
                  onUserMediaError={(err) => setError("Gagal Akses Kamera: " + err)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              
              {/* Overlay Guide */}
              {!image && (
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}>
                  <div style={{ 
                    width: '200px', 
                    height: '280px', 
                    border: '4px dashed white', 
                    borderRadius: '50%', 
                    opacity: 0.3 
                  }}></div>
                </div>
              )}
            </div>

            {!image ? (
              <button 
                onClick={capture} 
                style={{ 
                  width: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'transform 0.2s',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                📸 Ambil Foto
              </button>
            ) : (
              <button 
                onClick={retake} 
                style={{ 
                  width: '100%',
                  background: '#6b7280',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#4b5563'}
                onMouseOut={(e) => e.target.style.background = '#6b7280'}
              >
                🔄 Foto Ulang
              </button>
            )}
          </div>

          {/* Location Section */}
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
            padding: '2rem' 
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              📍 Lokasi Anda
            </h2>
            
            {coords ? (
              <div>
                <div style={{ 
                  background: '#f9fafb', 
                  borderRadius: '12px', 
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <p style={{ color: '#6b7280', margin: '0 0 0.25rem 0' }}>Latitude</p>
                      <p style={{ fontFamily: 'monospace', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                        {coords.lat.toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#6b7280', margin: '0 0 0.25rem 0' }}>Longitude</p>
                      <p style={{ fontFamily: 'monospace', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                        {coords.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  height: '320px'
                }}>
                  <MapContainer 
                    center={[coords.lat, coords.lng]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[coords.lat, coords.lng]}>
                      <Popup>
                        <div style={{ textAlign: 'center', fontWeight: '600' }}>
                          📍 Lokasi Anda
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            ) : (
              <div style={{ 
                height: '420px', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  border: '4px solid #667eea',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '1rem'
                }}></div>
                <p style={{ color: '#4b5563', fontWeight: '600' }}>Mencari lokasi GPS...</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <button 
            onClick={handleCheckIn} 
            disabled={!coords || !image} 
            style={{ 
              background: (coords && image) ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#d1d5db',
              color: (coords && image) ? 'white' : '#9ca3af',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              cursor: (coords && image) ? 'pointer' : 'not-allowed',
              transition: 'transform 0.2s',
              boxShadow: (coords && image) ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none'
            }}
            onMouseOver={(e) => (coords && image) && (e.target.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            ✅ Check-In
          </button>
          
          <button 
            onClick={handleCheckOut} 
            style={{ 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            🚪 Check-Out
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export default PresensiPage;