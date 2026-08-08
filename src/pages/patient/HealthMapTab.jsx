import React, { useState, useEffect } from 'react';
import { FiMapPin, FiNavigation, FiPhoneCall, FiExternalLink, FiClock, FiShield } from 'react-icons/fi';
import { hospitalAPI } from '../../services/api';
import './HealthMapTab.css';

export default function HealthMapTab({ profileData, user }) {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [directions, setDirections] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'campus', 'city'
  const [loading, setLoading] = useState(true);

  const isFaculty =
    user?.role === 'FACULTY' ||
    profileData?.role === 'FACULTY' ||
    profileData?.isFaculty ||
    localStorage.getItem('user_type') === 'FACULTY';

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospital) {
      fetchDirections(selectedHospital.id);
    } else {
      setDirections(null);
    }
  }, [selectedHospital]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await hospitalAPI.getAll();
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setHospitals(list);
      if (list.length > 0) {
        setSelectedHospital(list[0]);
      }
    } catch (err) {
      console.error('Error fetching hospitals for map:', err);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDirections = async (id) => {
    try {
      const res = await hospitalAPI.getDirections(id, {
        userRole: isFaculty ? 'FACULTY' : 'PATIENT',
      });
      setDirections(res?.data || res || null);
    } catch (err) {
      console.error('Error fetching hospital directions:', err);
      setDirections(null);
    }
  };

  const openGoogleMapsNavigation = (hospital) => {
    if (!hospital) return;
    const lat = hospital.latitude || 30.7673;
    const lng = hospital.longitude || 76.5754;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const filteredHospitals = (Array.isArray(hospitals) ? hospitals : []).filter((h) => {
    if (filter === 'campus') return h.address && h.address.toLowerCase().includes('campus');
    if (filter === 'city') return !h.address || !h.address.toLowerCase().includes('campus');
    return true;
  });

  const getMapCoordinates = (id) => {
    switch (id) {
      case 1: // CU Health Center (Main Campus Center)
        return { x: 280, y: 160 };
      case 4: // CU Emergency Dispensary South Campus
        return { x: 340, y: 260 };
      case 2: // Max Hospital Mohali
        return { x: 500, y: 80 };
      case 3: // Fortis Hospital Mohali
        return { x: 530, y: 290 };
      default:
        return { x: 300, y: 190 };
    }
  };

  return (
    <div className="health-map-container animate-fade-in">
      {/* Header */}
      <div className="health-map-header">
        <div className="health-map-title-group">
          <h2>
            <FiMapPin /> Campus &amp; Regional Health Map
          </h2>
          <div className="health-map-subtitle">
            {isFaculty ? 'Faculty & Staff Health Navigation Hub' : 'Student Medical Support & Emergency Directory'}
            {' • '} Live GPS Coordinates &amp; Step-by-Step Directions
          </div>
        </div>
        <div className="health-map-controls">
          <button
            type="button"
            className={`map-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Health Centers ({hospitals.length})
          </button>
          <button
            type="button"
            className={`map-filter-btn ${filter === 'campus' ? 'active' : ''}`}
            onClick={() => setFilter('campus')}
          >
            On-Campus Only
          </button>
          <button
            type="button"
            className={`map-filter-btn ${filter === 'city' ? 'active' : ''}`}
            onClick={() => setFilter('city')}
          >
            Mohali &amp; City Care
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar List + Interactive Canvas */}
      <div className="health-map-body">
        {/* Left List */}
        <div className="health-centers-sidebar">
          <div className="sidebar-section-title">Available Facilities</div>
          {loading ? (
            <div style={{ color: '#94a3b8', padding: '20px', textAlign: 'center' }}>Loading health centers...</div>
          ) : (
            filteredHospitals.map((center) => {
              const isSelected = selectedHospital && selectedHospital.id === center.id;
              return (
                <div
                  key={center.id}
                  className={`health-center-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedHospital(center)}
                >
                  <div className="center-card-top">
                    <div>
                      <div className="center-name">{center.name}</div>
                      <div className="center-address">{center.address}, {center.city}</div>
                    </div>
                    <span className="center-badge">{center.distance || '0.5 km'}</span>
                  </div>
                  <div className="center-meta-row">
                    <span>🛌 {center.availableBeds || 10} Beds Available</span>
                    <span>⭐ {center.rating || '4.8'}</span>
                  </div>
                  <button
                    type="button"
                    className="center-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openGoogleMapsNavigation(center);
                    }}
                  >
                    <FiNavigation /> View on Map (Google Maps)
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Right Interactive SVG Map + Directions Panel */}
        <div className="map-canvas-wrapper">
          <svg viewBox="0 0 600 380" className="map-svg-viewport">
            {/* Base Background schematic roads */}
            <g stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none">
              <path d="M 50,0 L 50,380" />
              <path d="M 0,190 L 600,190" />
              <path d="M 280,0 L 280,380" />
              <path d="M 0,120 Q 300,100 600,80" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="6" />
              <path d="M 180,380 Q 300,240 540,290" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="6" />
            </g>

            {/* Campus Zone Indicator */}
            <rect x="180" y="90" width="200" height="200" rx="16" fill="rgba(30, 41, 59, 0.4)" stroke="rgba(56, 189, 248, 0.25)" strokeDasharray="6 6" />
            <text x="195" y="115" fill="#64748b" fontSize="12" fontWeight="700">CHANDIGARH UNIVERSITY CAMPUS</text>

            {/* User Location Marker (Origin) */}
            <g transform="translate(210, 200)">
              <circle r="8" fill="#1d467c" />
              <circle r="16" fill="none" stroke="#1d467c" strokeWidth="2" opacity="0.6" />
              <text x="12" y="4" fill="#fcd34d" fontSize="11" fontWeight="600">
                {isFaculty ? 'Faculty Block' : 'Student Hostel'}
              </text>
            </g>

            {/* Route path to selected hospital */}
            {selectedHospital && (
              (() => {
                const target = getMapCoordinates(selectedHospital.id);
                return (
                  <line
                    x1="210"
                    y1="200"
                    x2={target.x}
                    y2={target.y}
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeDasharray="8 4"
                  />
                );
              })()
            )}

            {/* Hospital Markers */}
            {filteredHospitals.map((h) => {
              const pos = getMapCoordinates(h.id);
              const isSelected = selectedHospital && selectedHospital.id === h.id;
              return (
                <g
                  key={h.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="map-marker-pin"
                  onClick={() => setSelectedHospital(h)}
                >
                  {isSelected && (
                    <circle r="24" fill="rgba(56, 189, 248, 0.2)" className="pulse-circle" />
                  )}
                  <circle
                    r={isSelected ? "11" : "8"}
                    fill={isSelected ? "#38bdf8" : "#00b4b6"}
                    stroke="#0f172a"
                    strokeWidth="3"
                  />
                  <text
                    x="14"
                    y="4"
                    fill={isSelected ? "#38bdf8" : "#e2e8f0"}
                    fontSize="12"
                    fontWeight={isSelected ? "800" : "600"}
                  >
                    {h.name}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="map-watermark">
            <FiShield /> Live MedAstraX GIS Map • Sector 140413
          </div>

          {/* Slide-in Step-by-Step Directions Panel */}
          {selectedHospital && (
            <div className="directions-panel">
              <div className="directions-header">
                <div className="directions-title">
                  <FiNavigation /> Route to {selectedHospital.name}
                </div>
                <div className="directions-stats">
                  <span>🚗 {directions?.distanceKm || selectedHospital.distance || '0.5 km'}</span>
                  <span>⏱️ {directions?.estimatedTime || '8 mins walk (2 mins by Car)'}</span>
                </div>
              </div>

              <div className="directions-timeline">
                {(directions?.steps || [
                  `Step 1: Depart from ${isFaculty ? 'Faculty Academic Block' : 'Student Hostel'} towards the main avenue.`,
                  `Step 2: Follow signs towards ${selectedHospital.name} (${selectedHospital.address}).`,
                  `Step 3: Continue straight for approx. ${directions?.distanceKm || selectedHospital.distance || '0.5 km'}.`,
                  `Step 4: Arrive at ${selectedHospital.name} main reception area.`,
                ]).map((step, idx) => (
                  <div key={idx} className="direction-step">
                    {step}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <button
                  type="button"
                  className="google-maps-btn-large"
                  onClick={() => openGoogleMapsNavigation(selectedHospital)}
                  style={{ flex: 1 }}
                >
                  <FiExternalLink /> Open Step-by-Step Navigation in Google Maps
                </button>
                <button
                  type="button"
                  onClick={() => alert(`Calling Emergency Reception at ${selectedHospital.phone || '+91 172 233 4455'}...`)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    color: '#fca5a5',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  <FiPhoneCall /> Call Center
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

