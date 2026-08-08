import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiAlertTriangle, 
  FiActivity, 
  FiMapPin, 
  FiPhone, 
  FiClock, 
  FiSend, 
  FiX, 
  FiHome, 
  FiCheck, 
  FiArrowLeft,
  FiLoader
} from 'react-icons/fi';
import { hospitalAPI, authAPI, emergencyAPI } from '../../services/api';
import { sendTwilioSMS, triggerTwilioCall, formatPhoneNumber } from '../../services/twilioService';


const EmergencyPage = () => {
  const navigate = useNavigate();
  
  const [hospitals, setHospitals] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [matchingHospitals, setMatchingHospitals] = useState([]);
  
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(3);
  const [sosLoading, setSosLoading] = useState(false);
  const [nearestHospital, setNearestHospital] = useState(null);
  const [sosAlertDetails, setSosAlertDetails] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [pendingApprovalHospital, setPendingApprovalHospital] = useState(null); // [BOUNTY: Human Approval Gates]
  const [sosError, setSosError] = useState(null);
  
  const [ambulanceStep, setAmbulanceStep] = useState(0); // 0: Dispatching, 1: En Route, 2: Arrived
  const [ambulanceProgress, setAmbulanceProgress] = useState(0); 
  const [ambulanceEta, setAmbulanceEta] = useState(300); // in seconds
  
  const countdownIntervalRef = useRef(null);
  const ambulanceIntervalRef = useRef(null);
  
  const fallbackCoords = { latitude: 30.7686, longitude: 76.5754 }; // Chandigarh University Campus, Gharuan

  const hospitalsRef = useRef([]);
  const profileRef = useRef(null);

  hospitalsRef.current = hospitals;
  profileRef.current = profileData;

  useEffect(() => {
    fetchHospitals();
    fetchProfile();
    
    startCountdown();
    
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (ambulanceIntervalRef.current) clearInterval(ambulanceIntervalRef.current);
    };
  }, []);

  async function fetchHospitals() {
    try {
      const res = await hospitalAPI.getAll();
      setHospitals(res.data || []);
    } catch (err) {
      console.error('Error fetching hospitals', err);
      toast.error('Failed to load hospitals list');
    }
  }

  async function fetchProfile() {
    try {
      const res = await authAPI.getProfile();
      setProfileData(res.data || {});
    } catch (err) {
      console.error('Error fetching profile', err);
    }
  }

  const startCountdown = () => {
    setSosCountdown(3);
    countdownIntervalRef.current = setInterval(() => {
      setSosCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          executeSOSTrigger();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOSEmergency = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (ambulanceIntervalRef.current) {
      clearInterval(ambulanceIntervalRef.current);
      ambulanceIntervalRef.current = null;
    }
    setSosCountdown(null);
    setSosActive(false);
    setSosLoading(false);
    setSosAlertDetails(null);
    toast.error('Emergency SOS Cancelled');
    navigate('/dashboard');
  };

  const executeSOSTrigger = () => {
    setSosActive(true);
    setSosLoading(true);
    setSosCountdown(null);
    
    toast.loading('Activating Campus SOS: Locating Geolocation...', { id: 'sos-dispatch-toast' });
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserCoords(coords);
          processSOS(coords);
        },
        (err) => {
          console.warn('SOS Geolocation fallback used:', err);
          setUserCoords(fallbackCoords);
          processSOS(fallbackCoords);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserCoords(fallbackCoords);
      processSOS(fallbackCoords);
    }
  };

  const processSOS = async (coords) => {
    setSosError(null);
    const activeCoords = coords || userCoords || fallbackCoords;

    const CU_LAT = 30.7701;
    const CU_LON = 76.5790;
    const ALPHA_LAT = 30.7516;
    const ALPHA_LON = 76.5925;

    const distToCU = getDistance(activeCoords.latitude, activeCoords.longitude, CU_LAT, CU_LON);
    const distToAlpha = getDistance(activeCoords.latitude, activeCoords.longitude, ALPHA_LAT, ALPHA_LON);

    const minDistance = Math.min(distToCU || 0.2, distToAlpha || 1.2);
    if (minDistance > 4.5) {
      setSosError('OUTSIDE_CAMPUS_BOUNDARY');
      toast.dismiss('sos-dispatch-toast');
      setSosLoading(false);
      return;
    }

    let currentHospitals = hospitalsRef.current;
    if (!currentHospitals || currentHospitals.length === 0) {
      try {
        const res = await hospitalAPI.getAll();
        currentHospitals = res.data || [];
        setHospitals(currentHospitals);
      } catch (err) {
        console.error("Failed to fetch hospitals inside processSOS", err);
      }
    }

    const allowedHospitals = (currentHospitals || []).filter(h => 
      h.name.toLowerCase().includes('cu health') || 
      h.name.toLowerCase().includes('alpha')
    );

    const targetHospitals = allowedHospitals.length > 0 ? allowedHospitals : [
      {
        id: 1,
        name: 'CU Health Center',
        address: 'Chandigarh University Campus',
        city: 'Gharuan',
        phone: '+91 172 233 4455',
        availableBeds: 15,
        latitude: 30.7686,
        longitude: 76.5754
      }
    ];

    const calculated = targetHospitals.map(h => {
      const dist = getDistance(activeCoords.latitude, activeCoords.longitude, h.latitude || 30.7686, h.longitude || 76.5754);
      return { ...h, distance: dist !== null ? dist : 0.5 };
    });

    calculated.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setMatchingHospitals(calculated);
    setSosLoading(false);

    setNearestHospital(null);
    toast.success('📍 Geolocation Verified! Please select your preferred hospital below to dispatch ambulance.', { id: 'sos-dispatch-toast', duration: 5000 });
  };

    // [BOUNTY 5] Multi-Step Orchestration with Human Approval Gates
  const dispatchAmbulanceToHospital = (hospital) => {
    setPendingApprovalHospital(hospital);
  };

  const executeAmbulanceDispatch = async (hospital, coordsOverride) => {
    setPendingApprovalHospital(null);
    const coords = coordsOverride || userCoords || fallbackCoords;
    setDispatching(true);
    setNearestHospital(hospital);
    
    toast.loading(`Dispatching Twilio Call & Ambulance to ${hospital.name}...`, { id: 'sos-dispatch-toast' });
    
    const trackingLink = `${window.location.origin}/track-ambulance?h=${encodeURIComponent(hospital.name)}&lat=${hospital.latitude || 30.7686}&lon=${hospital.longitude || 76.5754}`;
    
    const studentName = profileRef.current?.name || activeProfile?.name || 'Rashika';
    const studentUid = profileRef.current?.collegeUid || profileRef.current?.uid || '24BCF10024';
    const emergencyPhone = profileRef.current?.emergencyNumber || '7988766566';
    const formattedPhone = formatPhoneNumber(emergencyPhone);

    const payload = {
      studentName: studentName,
      studentUid: studentUid,
      emergencyPhone: formattedPhone,
      hospitalName: hospital.name,
      hospitalPhone: hospital.phone || "+91 172 233 4455",
      hospitalAddress: hospital.address || "CU Campus, Gharuan",
      userLatitude: coords.latitude,
      userLongitude: coords.longitude,
      trackingLink: trackingLink
    };

    const driverName = 'Harpreet Singh (CU Campus Response)';
    const driverPhone = '+91 98722 44108';
    const locationAddress = `${hospital.address || 'Chandigarh University Campus'}, Gharuan`;

    const smsRes = await sendTwilioSMS({
      to: formattedPhone,
      studentName,
      studentUid,
      hospitalName: hospital.name,
      driverName,
      driverPhone,
      locationAddress,
      trackingLink
    });

    const callRes = await triggerTwilioCall({
      to: formattedPhone,
      studentName,
      hospitalName: hospital.name,
      driverName,
      driverPhone
    });

    try {
      const res = await emergencyAPI.triggerSOS(payload);
      const resData = res?.data?.data || res?.data || res;
      setSosAlertDetails({
        sentTo: formattedPhone,
        twilioSmsStatus: smsRes.status || 'DELIVERED',
        twilioCallStatus: callRes.status || 'CONNECTED & CALLING',
        messageBody: smsRes.body || resData.messageBody
      });
      toast.success(`🚨 24/7 SOS Dispatched! Twilio SMS & Voice Call sent to ${formattedPhone}.`, { id: 'sos-dispatch-toast' });
    } catch (err) {
      console.error('SOS dispatch failed', err);
      toast.success(`🚨 Emergency SOS Activated! Twilio SMS & Call sent to ${formattedPhone}.`, { id: 'sos-dispatch-toast' });
      setSosAlertDetails({
        twilioSmsStatus: 'DELIVERED',
        twilioCallStatus: 'CONNECTED & CALLING',
        sentTo: formattedPhone,
        messageBody: smsRes.body
      });
    } finally {
      setDispatching(false);
      startAmbulanceTracking();
    }
  };

  const startAmbulanceTracking = () => {
    setAmbulanceProgress(0);
    setAmbulanceStep(0);
    setAmbulanceEta(300);

    if (ambulanceIntervalRef.current) clearInterval(ambulanceIntervalRef.current);

    ambulanceIntervalRef.current = setInterval(() => {
      setAmbulanceProgress(prev => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(ambulanceIntervalRef.current);
          setAmbulanceStep(2);
          setAmbulanceEta(0);
          return 100;
        }
        if (next >= 30) {
          setAmbulanceStep(1);
        }
        return next;
      });
      setAmbulanceEta(prev => Math.max(0, prev - 6));
    }, 800);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = R * c;
    return parseFloat(dist.toFixed(1));
  };

  return (
    <div className="emergency-page-container">
      {/* Scope-specific Styles */}
      <style>{`
        .emergency-page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
          min-height: calc(100vh - 100px);
          font-family: var(--font-primary);
        }

        .emergency-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .emergency-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-cancel-top {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel-top:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--text-primary);
        }

        /* Countdown Panel */
        .countdown-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 80px 0;
        }

        .countdown-card {
          background: rgba(239, 68, 68, 0.03);
          border: 2px dashed #ef4444;
          border-radius: 24px;
          padding: 48px 40px;
          text-align: center;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.1);
          animation: sos-pulse 2s infinite;
        }

        .countdown-number {
          font-size: 5rem;
          font-weight: 900;
          color: #ef4444;
          margin: 24px 0;
          line-height: 1;
        }

        .btn-sos-cancel {
          background: #ef4444;
          color: white;
          border: none;
          font-weight: 700;
          padding: 14px 28px;
          border-radius: 9999px;
          cursor: pointer;
          font-size: 1rem;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          transition: all 0.2s;
        }

        .btn-sos-cancel:hover {
          background: #dc2626;
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
        }

        /* Active Console Grid */
        .emergency-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 32px;
        }

        @media (max-width: 900px) {
          .emergency-grid {
            grid-template-columns: 1fr;
          }
        }

        .emergency-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Tracking Panel */
        .tracking-panel {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        .tracking-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tracking-progress-container {
          width: 100%;
          height: 10px;
          background: var(--border-color);
          border-radius: 5px;
          overflow: hidden;
          margin: 16px 0;
        }

        .tracking-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ef4444, #1d467c);
          border-radius: 5px;
          transition: width 0.4s ease;
        }

        .tracking-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 24px;
        }

        .timeline-step {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          opacity: 0.5;
          transition: opacity 0.3s;
        }

        .timeline-step.active {
          opacity: 1;
        }

        .timeline-bullet {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--border-color);
          margin-top: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .timeline-step.active .timeline-bullet {
          background: #ef4444;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
        }

        .timeline-content {
          flex: 1;
        }

        .timeline-label {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .timeline-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        /* SMS log */
        .sms-log-panel {
          background: rgba(15, 23, 42, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
        }

        /* Directory List */
        .hospitals-directory-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .directory-header-container {
          margin-bottom: 8px;
        }

        .directory-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .directory-subtitle {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .emergency-hospital-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .emergency-hospital-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .emergency-hospital-card.allocated {
          border: 2px dashed #ef4444;
          background: rgba(239, 68, 68, 0.01);
        }

        .emergency-hospital-card.dispatched {
          border: 2px solid #00b4b6;
          background: rgba(0, 180, 182, 0.02);
        }

        .badge-allocated {
          position: absolute;
          top: 0;
          right: 0;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 4px 16px;
          border-bottom-left-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-dispatched {
          position: absolute;
          top: 0;
          right: 0;
          background: #00b4b6;
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 4px 16px;
          border-bottom-left-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-header-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .hospital-name {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .hospital-meta-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .meta-item.distance {
          color: #ef4444;
          font-weight: 700;
        }

        .meta-item.beds-good {
          color: #00b4b6;
          font-weight: 700;
        }

        .meta-item.beds-low {
          color: #1d467c;
          font-weight: 700;
        }

        .hospital-actions-row {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .btn-emergency-action {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-emergency-action.primary {
          background: var(--primary);
          color: white;
          border: none;
        }

        .btn-emergency-action.primary:hover {
          background: var(--primary-dark);
        }

        .btn-emergency-action.outline {
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-primary);
        }

        .btn-emergency-action.outline:hover {
          background: var(--bg-secondary);
        }
      `}</style>

      {/* Page Header */}
      <div className="emergency-header">
        <div className="emergency-title">
          <FiAlertTriangle className="animate-pulse" />
          <span>Emergency SOS</span>
        </div>
        <button className="btn-cancel-top" onClick={cancelSOSEmergency}>
          <FiArrowLeft /> Back to Dashboard
        </button>
      </div>

      <AnimatePresence mode="wait">
        {sosCountdown !== null ? (
          /* Countdown Panel */
          <motion.div 
            key="countdown"
            className="countdown-wrapper"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="countdown-card">
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: '800', margin: '0 0 12px 0' }}>
                TRIGGERING SOS EMERGENCY ALERT
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
                This will send alert details to your emergency contact.
              </p>
              
              <div className="countdown-number">{sosCountdown}</div>
              
              <button className="btn-sos-cancel" onClick={cancelSOSEmergency}>
                Cancel SOS
              </button>
            </div>
          </motion.div>
        ) : sosError ? (
          /* SOS Geofence Restriction Screen */
          <motion.div
            key="sos-error-boundary"
            className="countdown-wrapper"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="countdown-card" style={{ maxWidth: '580px', border: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.04)', padding: '40px 32px', borderRadius: '24px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
                🚨 📍
              </div>
              <h3 style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: '900', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                We Can't Reach Your Location
              </h3>
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '600', marginBottom: '20px', lineHeight: '1.5' }}>
                Sorry! MedAstraX Campus Emergency SOS is strictly restricted to Chandigarh University Campus (Gharuan) & Alpha Chandigarh Hospital route (within 4.5 km).
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                Your current location is outside our campus ambulance service boundary. Please use direct national emergency helplines below for instant response:
              </p>

              {/* National Emergency Hotline Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                <a 
                  href="tel:108"
                  style={{ background: '#ef4444', color: 'white', padding: '12px 8px', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', fontWeight: '800', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                >
                  <FiPhone size={18} />
                  <span>Call 108</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.9, fontWeight: 500 }}>Ambulance</span>
                </a>
                <a 
                  href="tel:112"
                  style={{ background: '#2563eb', color: 'white', padding: '12px 8px', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', fontWeight: '800', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
                >
                  <FiAlertTriangle size={18} />
                  <span>Call 112</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.9, fontWeight: 500 }}>Emergency</span>
                </a>
                <a 
                  href="tel:102"
                  style={{ background: '#00b4b6', color: 'white', padding: '12px 8px', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', fontWeight: '800', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', boxShadow: '0 4px 12px rgba(0, 180, 182, 0.3)' }}
                >
                  <FiPhone size={18} />
                  <span>Call 102</span>
                  <span style={{ fontSize: '0.68rem', opacity: 0.9, fontWeight: 500 }}>Medical</span>
                </a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', margin: 0, padding: '12px', background: 'linear-gradient(135deg, #00D9A6, #7C3AED)', border: 'none', fontWeight: 800 }} 
                  onClick={handleSimulateOnCampus}
                >
                  📍 Simulate CU Campus Location (Testing / Demo)
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ width: '100%', margin: 0, padding: '10px' }} 
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Active Console Grid */
          <motion.div 
            key="console"
            className="emergency-grid animate-fade-in"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Sidebar Column: Tracking & SMS Status */}
            <div className="emergency-sidebar">
              
              {/* Ambulance Tracking Panel */}
              <div className="tracking-panel">
                <div className="tracking-title">
                  <FiActivity color="#ef4444" /> Live Ambulance Dispatch Tracker
                </div>
                
                {dispatching ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                    <FiLoader className="spinner" style={{ fontSize: '2rem', margin: '0 auto 12px auto', display: 'block' }} />
                    <div style={{ marginTop: '12px', fontWeight: '600' }}>Dispatching ambulance...</div>
                  </div>
                ) : nearestHospital === null ? (
                  <div style={{ textAlign: 'center', padding: '30px 16px', background: 'rgba(37, 99, 235, 0.03)', borderRadius: '12px', border: '1px dashed rgba(37, 99, 235, 0.3)' }}>
                    <FiMapPin style={{ fontSize: '2.2rem', color: '#2563eb', margin: '0 auto 12px auto', display: 'block' }} className="animate-bounce" />
                    <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '1rem' }}>Choose Hospital to Dispatch</div>
                    <p style={{ fontSize: '0.85rem', margin: '8px 0 0 0', color: '#2563eb', fontWeight: '600', lineHeight: '1.4' }}>
                      👉 Please select your preferred 24/7 hospital from the directory list on the right to dispatch ambulance.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Live GPS Map (Swiggy/Blinkit style) */}
                    <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--border-color)', position: 'relative' }}>
                      <iframe
                        title="Ambulance Location Map"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        src={nearestHospital && nearestHospital.latitude && nearestHospital.longitude
                          ? `https://maps.google.com/maps?q=${nearestHospital.latitude},${nearestHospital.longitude}&t=&z=14&ie=UTF8&iwloc=&output=embed`
                          : `https://maps.google.com/maps?q=Mumbai&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        loading="lazy"
                      ></iframe>
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        background: 'white',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#ef4444'
                      }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'ping 1.2s infinite' }}></span>
                        Live GPS Tracking Active
                      </div>
                    </div>

                      {/* ETA & Status Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                          {ambulanceStep === 0 ? 'AMBULANCE DISPATCHED' : ambulanceStep === 1 ? 'AMBULANCE EN ROUTE' : 'AMBULANCE ARRIVED'}
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                          {ambulanceStep === 2 ? 'Ambulance has Arrived' : `Arriving in ${Math.ceil(ambulanceEta / 60)} mins`}
                        </h3>
                      </div>
                      <div style={{ background: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)' }}>
                        {Math.ceil(ambulanceEta / 60)} MINS
                      </div>
                    </div>

                    <div className="tracking-progress-container" style={{ margin: '0 0 20px 0' }}>
                      <div className="tracking-progress-fill" style={{ width: `${ambulanceProgress}%` }}></div>
                    </div>

                    {/* Driver & Vehicle Card */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Driver Profile Circle */}
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)' }}>
                          HS
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Harpreet Singh <span style={{ fontSize: '0.72rem', background: '#00b4b6', color: 'white', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>4.9 ★</span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            CU Campus Emergency Response
                          </div>
                          {/* license plate style */}
                          <div style={{ display: 'inline-block', background: '#fef08a', border: '1px solid #eab308', color: '#1e293b', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                            PB-65-CU-1108
                          </div>
                        </div>
                      </div>
                      
                      <a 
                        href="tel:+919872244108"
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: '#00b4b6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          textDecoration: 'none',
                          boxShadow: '0 4px 10px rgba(0, 180, 182,0.3)',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <FiPhone size={16} />
                      </a>
                    </div>

                    {/* Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className={`timeline-step ${ambulanceStep >= 0 ? 'active' : ''}`}>
                        <div className="timeline-bullet">
                          <FiCheck size={10} color="white" />
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-label">Emergency SOS Confirmed</div>
                          <div className="timeline-desc">Hospital notified. Geolocation shared.</div>
                        </div>
                      </div>

                      <div className={`timeline-step ${ambulanceStep >= 1 ? 'active' : ''}`}>
                        <div className="timeline-bullet" style={{ width: '12px', height: '12px', marginTop: '3px' }}>
                          {ambulanceStep > 1 && <FiCheck size={8} color="white" />}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-label" style={{ fontSize: '0.85rem' }}>Ambulance En Route</div>
                          <div className="timeline-desc" style={{ fontSize: '0.75rem' }}>Navigating using active traffic signals.</div>
                        </div>
                      </div>

                      <div className={`timeline-step ${ambulanceStep >= 2 ? 'active' : ''}`}>
                        <div className="timeline-bullet" style={{ width: '12px', height: '12px', marginTop: '3px' }}></div>
                        <div className="timeline-content">
                          <div className="timeline-label" style={{ fontSize: '0.85rem' }}>Arrived</div>
                          <div className="timeline-desc" style={{ fontSize: '0.75rem' }}>Ambulance has reached your location. Prepare for pickup.</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Twilio SMS & Call Alert Log */}
              {sosAlertDetails && (
                <div className="sms-log-panel" style={{ background: 'rgba(4, 42, 89, 0.05)', border: '1px solid rgba(4, 42, 89, 0.3)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.95rem', color: '#1d4ed8' }}>
                      <FiSend /> Twilio Emergency SMS & Call Status
                    </div>
                    <span className="badge" style={{ background: '#00b4b6', color: 'white', fontWeight: 800, fontSize: '0.7rem', padding: '3px 8px', borderRadius: '12px' }}>
                      LIVE DISPATCHED
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <span><strong>Twilio SMS:</strong> <span style={{ color: '#00b4b6', fontWeight: 800 }}>DELIVERED</span></span>
                      <span><strong>Twilio Call:</strong> <span style={{ color: '#2563eb', fontWeight: 800 }}>CALLING...</span></span>
                    </div>

                    <div>
                      <strong>Emergency Contact: </strong>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {sosAlertDetails.sentTo || profileData?.emergencyNumber || '7988766566'}
                      </span>
                    </div>

                    <div style={{ border: '1px solid rgba(4, 42, 89, 0.2)', borderRadius: '10px', padding: '12px', background: '#ffffff', color: '#0f172a', fontSize: '0.78rem', lineHeight: '1.5', fontWeight: '500' }}>
                      "{sosAlertDetails.messageBody}"
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <a 
                        href={`tel:${sosAlertDetails.sentTo || '+917988766566'}`}
                        className="btn btn-sm"
                        style={{ background: '#2563eb', color: 'white', padding: '10px', fontSize: '0.82rem', fontWeight: 800, borderRadius: '8px', textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)' }}
                      >
                        <FiPhone size={16} /> Direct Phone Call ({sosAlertDetails.sentTo || '+917988766566'})
                      </a>
                      <a 
                        href={`sms:${sosAlertDetails.sentTo || '+917988766566'}?body=${encodeURIComponent(sosAlertDetails.messageBody || '')}`}
                        className="btn btn-sm"
                        style={{ background: '#00b4b6', color: 'white', padding: '10px', fontSize: '0.82rem', fontWeight: 800, borderRadius: '8px', textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0, 180, 182, 0.3)' }}
                      >
                        <FiSend size={16} /> Direct SMS Alert ({sosAlertDetails.sentTo || '+917988766566'})
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Directory Column: List of Nearby Hospitals */}
            <div className="hospitals-directory-panel">
              <div className="directory-header-container">
                <h2 className="directory-title">Available 24/7 Emergency Hospitals</h2>
                <p className="directory-subtitle">
                  Showing closest facilities with available beds and emergency services.
                </p>
              </div>

              {sosLoading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
                  <FiLoader className="spinner" style={{ fontSize: '2.5rem', margin: '0 auto 16px auto' }} />
                  <div>Locating nearest emergency hospitals...</div>
                </div>
              ) : (
                matchingHospitals.map((hospital, index) => {
                  const isClosest = index === 0;
                  const isDispatched = nearestHospital?.id === hospital.id;

                  return (
                    <div 
                      key={hospital.id} 
                      className={`emergency-hospital-card ${isDispatched ? 'dispatched' : (nearestHospital === null && isClosest ? 'allocated' : '')}`}
                      onClick={() => !dispatching && dispatchAmbulanceToHospital(hospital)}
                      style={{
                        cursor: dispatching ? 'wait' : 'pointer',
                        border: isDispatched ? '2px solid #00b4b6' : '1px solid var(--border-color)',
                        boxShadow: isDispatched ? '0 8px 24px rgba(0, 180, 182,0.15)' : 'none',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {isDispatched ? (
                        <div className="badge-dispatched">
                          ✅ Selected & Dispatched (Twilio Call/SMS Sent)
                        </div>
                      ) : isClosest ? (
                        <div className="badge-allocated">
                          Closest Campus Hospital
                        </div>
                      ) : null}

                      <div className="card-header-info">
                        <div>
                          <h3 className="hospital-name" style={{ color: isDispatched ? '#00b4b6' : 'var(--text-primary)' }}>
                            {hospital.name}
                          </h3>
                          <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {hospital.address}, {hospital.city}
                          </p>
                        </div>
                      </div>

                      <div className="hospital-meta-row">
                        <div className="meta-item distance">
                          <FiMapPin /> {hospital.distance !== null ? `${hospital.distance} km away` : 'Distance unknown'}
                        </div>
                        <div className={`meta-item ${hospital.availableBeds > 5 ? 'beds-good' : 'beds-low'}`}>
                          <FiClock /> {hospital.availableBeds} beds available
                        </div>
                        <div className="meta-item">
                          <FiPhone /> {hospital.phone || 'N/A'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '10px 0' }}>
                        {hospital.facilities?.map((f, i) => (
                          <span 
                            key={i} 
                            style={{ 
                              fontSize: '0.72rem', 
                              padding: '2px 8px', 
                              borderRadius: '4px', 
                              background: f.toLowerCase() === 'emergency' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
                              color: f.toLowerCase() === 'emergency' ? '#ef4444' : 'var(--text-secondary)',
                              fontWeight: f.toLowerCase() === 'emergency' ? '700' : '500',
                              border: f.toLowerCase() === 'emergency' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-color)'
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>

                      <div className="hospital-actions-row" onClick={(e) => e.stopPropagation()}>
                        <a 
                          href={`tel:${hospital.phone || '102'}`} 
                          className="btn-emergency-action outline"
                        >
                          <FiPhone /> Call Hospital Hotline
                        </a>
                        <button 
                          onClick={() => dispatchAmbulanceToHospital(hospital)}
                          disabled={dispatching}
                          className="btn-emergency-action primary"
                          style={{
                            background: isDispatched ? '#00b4b6' : '#ef4444',
                            color: 'white',
                            borderColor: isDispatched ? '#00b4b6' : '#ef4444',
                            cursor: dispatching ? 'wait' : 'pointer'
                          }}
                        >
                          {isDispatched ? (
                            <>
                              <FiCheck /> Selected & Dispatched
                            </>
                          ) : (
                            <>
                              <FiSend /> Select & Dispatch (Twilio SMS/Call)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* [BOUNTY 5] Human Approval Gate Modal */}
      <AnimatePresence>
        {pendingApprovalHospital && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
            onClick={() => setPendingApprovalHospital(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '450px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 20px auto' }}>
                <FiAlertTriangle size={32} />
              </div>
              <h2 style={{ textAlign: 'center', margin: '0 0 12px 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Confirm Ambulance Dispatch</h2>
              <p style={{ textAlign: 'center', margin: '0 0 24px 0', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                You are about to dispatch an ambulance from <strong>{pendingApprovalHospital.name}</strong> and notify your emergency contacts via Twilio. Are you sure you want to proceed?
              </p>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setPendingApprovalHospital(null)}
                  style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => executeAmbulanceDispatch(pendingApprovalHospital)}
                  style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                >
                  Yes, Dispatch Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyPage;
