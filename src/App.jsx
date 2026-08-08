import { useState, useEffect, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { campAPI } from './services/api';

import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import GlobalQueryBot from './components/common/GlobalQueryBot';
import VoiceAssistant from './components/common/VoiceAssistant';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', maxWidth: '540px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ color: '#0f172a', marginBottom: '8px', fontSize: '1.4rem' }}>Portal Dashboard Refresh Required</h2>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.88rem', lineHeight: '1.5' }}>
              {this.state.error?.message || 'A render update occurred. Click below to reload the dashboard.'}
            </p>
            <button 
              type="button" 
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/dashboard';
              }}
              style={{
                background: '#0f766e',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HelpCenterPage from './pages/HelpCenterPage';
import SupportPage from './pages/SupportPage';
import FAQPage from './pages/FAQPage';

import PatientDashboard from './pages/patient/PatientDashboard';
import CarePlan from './pages/patient/CarePlan';
import BookingPage from './pages/patient/BookingPage';
import MyBookings from './pages/patient/MyBookings';
import MyPrescriptions from './pages/patient/MyPrescriptions';
import PharmacyOrderFlow from './pages/patient/PharmacyOrderFlow';
import DiagnosticOrderFlow from './pages/patient/DiagnosticOrderFlow';
import EmergencyPage from './pages/patient/EmergencyPage';
import TrackAmbulancePage from './pages/patient/TrackAmbulancePage';
import ActivityHistoryPage from './pages/patient/ActivityHistoryPage';

import DoctorDashboard from './pages/doctor/DoctorDashboard';

import ConsultationRoom from './pages/ConsultationRoom';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import LabDashboard from './pages/lab/LabDashboard';

import HospitalDashboard from './pages/hospital/HospitalDashboard';

import AdminDashboard from './pages/admin/AdminDashboard';
import ObservabilityDashboard from './pages/admin/ObservabilityDashboard';
import BackgroundJobsDashboard from './pages/admin/BackgroundJobsDashboard';

function BroadcastBanner() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    const checkBroadcast = () => {
      const active = localStorage.getItem('MedAstraX_global_broadcast') || localStorage.getItem('MedAstraX_global_broadcast');
      setMsg(active || '');
    };
    checkBroadcast();
    window.addEventListener('storage', checkBroadcast);
    const interval = setInterval(checkBroadcast, 2500);
    return () => {
      window.removeEventListener('storage', checkBroadcast);
      clearInterval(interval);
    };
  }, []);

  if (!msg) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #EF4444, #1d467c)',
      color: '#FFFFFF',
      padding: '10px 16px',
      fontSize: '0.88rem',
      fontWeight: '700',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.25)',
      position: 'relative',
      zIndex: 99999,
      fontFamily: 'sans-serif',
      letterSpacing: '0.3px'
    }}>
      <span>⚠️ SYSTEM ANNOUNCEMENT: {msg}</span>
      <button 
        onClick={() => {
          localStorage.removeItem('MedAstraX_global_broadcast');
          localStorage.removeItem('MedAstraX_global_broadcast');
          setMsg('');
        }}
        style={{
          background: 'rgba(255, 255, 255, 0.25)',
          border: 'none',
          color: '#FFFFFF',
          borderRadius: '50%',
          width: '22px',
          height: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
      >
        ✕
      </button>
    </div>
  );
}

function HealthCampPopupModal() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [camp, setCamp] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const publicPaths = ['/', '/login', '/signup', '/about', '/contact', '/help', '/support', '/faq', '/track-ambulance'];
  const isPublicAuthPage = !isAuthenticated || publicPaths.includes(location.pathname);

  const checkCamp = async (forceOpen = false) => {
    try {
      let campData = null;
      const raw = localStorage.getItem('MedAstraX_latest_camp') || localStorage.getItem('MedAstraX_latest_camp');
      if (raw) {
        campData = JSON.parse(raw);
      } else {
        const res = await campAPI.getAll();
        const list = res?.data || res;
        if (Array.isArray(list) && list.length > 0) {
          campData = list[0];
          localStorage.setItem('MedAstraX_latest_camp', JSON.stringify(campData));
        }
      }

      if (campData) {
        setCamp(campData);
        if (forceOpen) {
          setIsOpen(true);
        } else {
          const sessionShown = sessionStorage.getItem('MedAstraX_camp_shown_session') || sessionStorage.getItem('MedAstraX_camp_shown_session');
          const isDismissed = localStorage.getItem('MedAstraX_dismissed_camp_' + campData.id) || 
                              localStorage.getItem('MedAstraX_dismissed_camp_' + campData.id) ||
                              sessionStorage.getItem('MedAstraX_dismissed_camp_' + campData.id) ||
                              localStorage.getItem('MedAstraX_registered_camp_' + campData.id);
          if (!sessionShown && !isDismissed) {
            setIsOpen(true);
            sessionStorage.setItem('MedAstraX_camp_shown_session', 'true');
          } else {
            setIsOpen(false);
          }
        }
      }
    } catch (e) {
      console.error('Error checking latest health camp', e);
    }
  };

  useEffect(() => {
    if (!isPublicAuthPage) {
      checkCamp();
    }

    const handleUpdated = () => {
      try {
        const raw = localStorage.getItem('MedAstraX_latest_camp') || localStorage.getItem('MedAstraX_latest_camp');
        if (raw) {
          const parsed = JSON.parse(raw);
          sessionStorage.removeItem('MedAstraX_dismissed_camp_' + parsed.id);
          localStorage.removeItem('MedAstraX_dismissed_camp_' + parsed.id);
          setCamp(parsed);
          setIsOpen(true);
        } else {
          checkCamp(true);
        }
      } catch (e) {}
    };

    const handleReopen = () => {
      checkCamp(true);
    };

    window.addEventListener('medastrax_camp_updated', handleUpdated);
    window.addEventListener('medastrax_camp_updated', handleUpdated);
    window.addEventListener('medastrax_reopen_camp_popup', handleReopen);
    window.addEventListener('medastrax_reopen_camp_popup', handleReopen);

    return () => {
      window.removeEventListener('medastrax_camp_updated', handleUpdated);
      window.removeEventListener('medastrax_camp_updated', handleUpdated);
      window.removeEventListener('medastrax_reopen_camp_popup', handleReopen);
      window.removeEventListener('medastrax_reopen_camp_popup', handleReopen);
    };
  }, [isAuthenticated, isPublicAuthPage]);

  if (isPublicAuthPage || !camp) return null;

  const handleClose = () => {
    if (camp?.id) {
      sessionStorage.setItem('MedAstraX_dismissed_camp_' + camp.id, 'true');
      localStorage.setItem('MedAstraX_dismissed_camp_' + camp.id, 'true');
    }
    setIsOpen(false);
  };

  const handleRegister = () => {
    if (camp?.id) {
      localStorage.setItem('MedAstraX_registered_camp_' + camp.id, 'true');
      localStorage.setItem('MedAstraX_dismissed_camp_' + camp.id, 'true');
      sessionStorage.setItem('MedAstraX_dismissed_camp_' + camp.id, 'true');
    }
    toast.success(`You are successfully registered for "${camp.title}"! 🎉`, { duration: 5000 });
    setIsOpen(false);
  };

  const rawEligibility = camp.targetAudience || '';
  const cleanEligibility = rawEligibility
    .replace(/all portals/gi, '')
    .replace(/\(\s*\)/g, '')
    .replace(/^[\s,:-]+|[\s,:-]+$/g, '')
    .trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '84px',
            right: '24px',
            zIndex: 999999,
            maxWidth: '450px',
            width: 'calc(100vw - 48px)',
            pointerEvents: 'auto'
          }}
        >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                borderRadius: '20px',
                border: '2px solid #0d9488',
                boxShadow: '0 20px 50px rgba(13, 148, 136, 0.25), 0 10px 20px rgba(0, 0, 0, 0.1)',
                padding: '24px',
                fontFamily: 'Outfit, sans-serif',
                color: '#0f172a',
                position: 'relative'
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(15, 23, 42, 0.06)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '14px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.06)'}
              >
                ✕
              </button>

              {/* Badge & Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  CAMP ANNOUNCEMENT
                </span>
                <span style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: '700' }}>
                  {camp.category || 'General Health'}
                </span>
              </div>

              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.18rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>
                🏥 {camp.title}
              </h3>

              {/* Details Grid */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px 12px',
                fontSize: '0.82rem',
                marginBottom: '14px'
              }}>
                <div>
                  <span style={{ color: '#64748b', fontWeight: '600', display: 'block', fontSize: '0.74rem' }}>DATE</span>
                  <strong style={{ color: '#0f172a' }}>📅 {camp.date}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontWeight: '600', display: 'block', fontSize: '0.74rem' }}>TIME</span>
                  <strong style={{ color: '#0f172a' }}>⏰ {camp.timeSlot || '09:00 AM - 04:00 PM'}</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b', fontWeight: '600', display: 'block', fontSize: '0.74rem' }}>VENUE</span>
                  <strong style={{ color: '#0f766e' }}>📍 {camp.venue}</strong>
                </div>
                {cleanEligibility ? (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b', fontWeight: '600', display: 'block', fontSize: '0.74rem' }}>ELIGIBILITY</span>
                    <span style={{ color: '#334155', fontWeight: '500' }}>👥 {cleanEligibility}</span>
                  </div>
                ) : null}
              </div>

              {camp.description && (
                <p style={{ margin: '0 0 16px 0', fontSize: '0.83rem', color: '#475569', lineHeight: '1.4' }}>
                  {camp.description}
                </p>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleRegister}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)',
                    transition: 'transform 0.2s'
                  }}
                >
                  ✓ Attend / Register Interest
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
              },
              success: {
                iconTheme: {
                  primary: '#0D9488',
                  secondary: '#fff',
                },
              },
            }}
          />
          <BroadcastBanner />
          <HealthCampPopupModal />
          <Navbar />
          
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/track-ambulance" element={<TrackAmbulancePage />} />

              {/* Patient/Student Routes */}
              <Route element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <ErrorBoundary>
                    <PatientDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={null} />
                <Route path="/emergency" element={null} />
                <Route path="/care-plan" element={null} />
                <Route path="/my-bookings" element={null} />
                <Route path="/my-prescriptions" element={null} />
                <Route path="/medical-leave" element={null} />
                <Route path="/faculty-portal" element={null} />
                <Route path="/analytics" element={null} />
                <Route path="/medicine-trends" element={null} />
                <Route path="/wellness-score" element={null} />
                <Route path="/wellness-center" element={null} />
                <Route path="/vaccinations" element={null} />
                <Route path="/symptom-checker" element={null} />
                <Route path="/refer-a-student" element={null} />
                <Route path="/student-health-portal" element={null} />
                <Route path="/health-map" element={null} />
              </Route>
              
              {/* Standalone Patient Routes */}
              <Route path="/activity-history" element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <ErrorBoundary>
                    <ActivityHistoryPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/book/:hospitalId" element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <BookingPage />
                </ProtectedRoute>
              } />
              <Route path="/order-prescription/:prescriptionId" element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <PharmacyOrderFlow />
                </ProtectedRoute>
              } />
              <Route path="/book-diagnostic/:prescriptionId" element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <DiagnosticOrderFlow />
                </ProtectedRoute>
              } />
              
              {/* Consultation Routes */}
              <Route path="/consultation/:bookingId" element={
                <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR']}>
                  <ConsultationRoom />
                </ProtectedRoute>
              } />

              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <ErrorBoundary>
                    <DoctorDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />

              {/* Pharmacy Routes */}
              <Route path="/pharmacy/dashboard" element={
                <ProtectedRoute allowedRoles={['PHARMACY']}>
                  <ErrorBoundary>
                    <PharmacyDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />

              {/* Lab Routes */}
              <Route path="/lab/dashboard" element={
                <ProtectedRoute allowedRoles={['LAB']}>
                  <ErrorBoundary>
                    <LabDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />

              {/* Hospital Routes */}
              <Route path="/hospital/dashboard" element={
                <ProtectedRoute allowedRoles={['HOSPITAL']}>
                  <ErrorBoundary>
                    <HospitalDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ErrorBoundary>
                    <AdminDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/admin/observability" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ErrorBoundary>
                    <ObservabilityDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              <Route path="/admin/jobs" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ErrorBoundary>
                    <BackgroundJobsDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <GlobalQueryBot />
          <VoiceAssistant />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
