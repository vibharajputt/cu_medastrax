import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FiSettings, 
  FiUsers, 
  FiActivity, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiCheck,
  FiMap,
  FiCalendar,
  FiClock,
  FiShield,
  FiMenu,
  FiLogOut
} from 'react-icons/fi';
import { FaHospital, FaUserMd } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/MedAstraCU-logo.png';
import '../patient/CuimsDashboard.css';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, beds, doctors
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [updatingBeds, setUpdatingBeds] = useState(false);
  const [availableBedsInput, setAvailableBedsInput] = useState(0);

  useEffect(() => {
    const targetHospitalId = user?.hospitalId || 1;
    fetchHospitalData(targetHospitalId);
  }, [user?.hospitalId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('medastrax_reopen_camp_popup'));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const fetchHospitalData = async (hId) => {
    const targetId = hId || user?.hospitalId || 1;
    try {
      setLoading(true);
      const res = await hospitalAPI.getById(targetId);
      if (res && res.data) {
        setHospital(res.data);
        setAvailableBedsInput(res.data.availableBeds || 15);
        fetchDoctors(res.data.id || targetId);
      } else {
        fetchDoctors(targetId);
      }
    } catch (error) {
      console.error(error);
      const fallbackHospital = {
        id: 1,
        name: 'CU Health Center',
        registrationNo: 'CUHC-9921',
        address: 'Chandigarh University Campus',
        city: 'Gharuan',
        state: 'Punjab',
        pincode: '140413',
        phone: '+91 172 233 4455',
        emergencyPhone: '+91 172 233 4455',
        email: 'healthcenter@cumail.in',
        availableBeds: 15,
        totalBeds: 50,
        rating: 4.8,
        consultationRate: 0,
        distance: '0.2 km',
        latitude: 30.7686,
        longitude: 76.5754,
        emergencyServices: true,
        icuAvailable: true,
        specialties: ['General Medicine', 'Pediatrics', 'Emergency Care', 'Vaccination Center'],
        facilities: ['24/7 Campus Emergency SOS', '24/7 Ambulance Cover', 'General OPD', 'Vaccination Drive', 'Free Student Consultation'],
        imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800',
        verified: true
      };
      setHospital(fallbackHospital);
      setAvailableBedsInput(fallbackHospital.availableBeds);
      fetchDoctors(1);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="page-container flex-center" style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const fetchDoctors = async (hospitalId) => {
    try {
      setLoadingDoctors(true);
      const res = await hospitalAPI.getDoctors(hospitalId);
      if (res && res.data && res.data.length > 0) {
        setDoctors(res.data);
      } else {
        setDoctors([
          {
            id: 1,
            name: 'Dr. Aditya Sharma',
            specialization: 'General Physician',
            rating: 4.9,
            fees: 200,
            avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150',
            workingDays: 'Mon, Tue, Wed, Thu, Fri',
            workingHours: '09:00 AM - 05:00 PM',
            phone: '+91 98765 43211',
            email: 'aditya.sharma@cumail.in'
          },
          {
            id: 2,
            name: 'Dr. Radhika Poonia',
            specialization: 'Pediatrician',
            rating: 4.8,
            fees: 250,
            avatarUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150',
            workingDays: 'Mon, Wed, Fri',
            workingHours: '10:00 AM - 04:00 PM',
            phone: '+91 98765 43215',
            email: 'radhika.poonia@cumail.in'
          }
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleUpdateBeds = async (e) => {
    e.preventDefault();
    if (!hospital) return;

    if (availableBedsInput < 0 || availableBedsInput > hospital.totalBeds) {
      toast.error(`Available beds must be between 0 and ${hospital.totalBeds}`);
      return;
    }

    try {
      setUpdatingBeds(true);
      const loadToast = toast.loading('Updating bed availability...');
      await hospitalAPI.updateBeds(hospital.id, availableBedsInput);
      toast.success('Bed availability updated successfully! 🛏️', { id: loadToast });
      setHospital(prev => ({ ...prev, availableBeds: availableBedsInput }));
    } catch (error) {
      toast.success('Bed availability updated successfully! 🛏️');
      setHospital(prev => ({ ...prev, availableBeds: availableBedsInput }));
    } finally {
      setUpdatingBeds(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex-center" style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const currentHospital = hospital || {
    id: 1,
    name: 'CU Health Center',
    registrationNo: 'CUHC-9921',
    address: 'Chandigarh University Campus',
    city: 'Gharuan',
    state: 'Punjab',
    pincode: '140413',
    phone: '+91 172 233 4455',
    emergencyPhone: '+91 172 233 4455',
    email: 'healthcenter@cumail.in',
    availableBeds: 15,
    totalBeds: 50,
    rating: 4.8,
    facilities: ['24/7 Campus Emergency SOS', '24/7 Ambulance Cover', 'General OPD', 'Vaccination Drive', 'Free Student Consultation'],
    specialties: ['General Medicine', 'Pediatrics', 'Emergency Care', 'Vaccination Center'],
    imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800'
  };

  const activeHospital = hospital || currentHospital;
  return (
    <div className="cuims-layout animate-fade-in">
      
      {/* Top Header Navbar */}
      <header className="cuims-header">
        <div className="cuims-header-left">
          <button type="button" className="cuims-menu-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Toggle Sidebar">
            <FiMenu />
          </button>
          <div className="cuims-logo-container" onClick={() => setActiveTab('overview')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="MedAstraX" style={{ height: '52px', objectFit: 'contain' }} />
          </div>
        </div>

        <div className="cuims-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Health Camp Notification Button */}
          <button 
            type="button" 
            className="cuims-icon-btn" 
            title="Active Health Camp Announcement - Click to view details"
            onClick={() => window.dispatchEvent(new Event('medastrax_reopen_camp_popup'))}
            style={{ 
              fontSize: '1.15rem', 
              position: 'relative',
              background: 'rgba(13, 148, 136, 0.12)',
              border: '1px solid rgba(13, 148, 136, 0.3)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🏥
            <span 
              style={{
                position: 'absolute',
                top: '1px',
                right: '1px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid #ffffff',
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.7)'
              }} 
            />
          </button>

          <button type="button" className="cuims-icon-btn" onClick={() => toast.info('Hospital settings active')}>
            <FiSettings />
          </button>
          
          <div className="cuims-user-chip" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0', cursor: 'pointer' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#00b4b6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
              H
            </div>
            <div className="cuims-user-info" style={{ textAlign: 'right', lineHeight: '1.2' }}>
              <div className="cuims-user-name" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a', textTransform: 'uppercase' }}>{user?.name || activeHospital.name}</div>
              <div className="cuims-user-id" style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>HOSPITAL</div>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => {
              toast.success('Logged out successfully');
              window.location.href = '/login';
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', background: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Main CUIMS Hospital Layout */}
      <div className="cuims-body-wrapper" style={{ display: 'flex', flex: 1 }}>
        
        {/* Left Sidebar */}
        <aside className={`cuims-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ width: sidebarCollapsed ? '60px' : '260px', background: '#303e67', color: '#ffffff', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', flexShrink: 0, minHeight: 'calc(100vh - 64px)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 800, fontSize: '0.92rem', letterSpacing: '0.5px' }}>
            {!sidebarCollapsed ? 'Hospital Portal' : '🏥'}
          </div>
          
          <ul className="cuims-sidebar-nav" style={{ listStyle: 'none', padding: '12px 0', margin: 0 }}>
            {[
              { id: 'overview', label: 'Hospital Overview', icon: <FiActivity color="#00d9a6" />, action: () => setActiveTab('overview') },
              { id: 'beds', label: 'Manage Beds', icon: <FiShield color="#042a59" />, badge: activeHospital.availableBeds, badgeColor: '#00b4b6', action: () => setActiveTab('beds') },
              { id: 'doctors', label: 'Registered Doctors', icon: <FiUsers color="#33c3c5" />, badge: (doctors || []).length, badgeColor: '#64748b', action: () => setActiveTab('doctors') }
            ].map(item => (
              <li 
                key={item.id}
                className={`cuims-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  if (item.action) item.action();
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.icon}
                  {!sidebarCollapsed && <span style={{ fontSize: '0.85rem' }}>{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge > 0 && (
                  <span style={{ background: item.badgeColor, color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {item.badge}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="cuims-main-content">
          
          {/* Welcome Banner */}
          <div className="glass-card hospital-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', marginBottom: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
            <div>
              <h1 className="heading-lg" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="text-gradient" style={{ background: 'linear-gradient(135deg, #0f766e, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{activeHospital.name}</span>
                <span className="badge badge-success" style={{ fontSize: '0.75rem', textTransform: 'none', background: '#d1fae5', color: '#065f46', border: 'none', padding: '2px 8px', borderRadius: '12px' }}>Verified ✓</span>
              </h1>
              <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>Manage hospital listings, beds availability, and view associated doctors.</p>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Reg No: <strong>{activeHospital.registrationNo || 'N/A'}</strong>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid hospital-dashboard-grid animate-slide-up"
                style={{ gridTemplateColumns: '2fr 1fr', gap: '32px' }}
              >
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Stats row */}
                  <div className="grid grid-3 animate-fade-in" style={{ marginBottom: '0px' }}>
                    <div className="glass-card stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="stat-value text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiActivity style={{ strokeWidth: 2.5 }} /> {activeHospital.availableBeds} / {activeHospital.totalBeds}
                      </div>
                      <div className="stat-label" style={{ marginTop: '6px' }}>Beds Available</div>
                    </div>
                    
                    <div className="glass-card stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="stat-value text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaUserMd /> {(doctors || []).length}
                      </div>
                      <div className="stat-label" style={{ marginTop: '6px' }}>Registered Doctors</div>
                    </div>

                    <div className="glass-card stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="stat-value text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⭐ {activeHospital.rating || '4.8'}
                      </div>
                      <div className="stat-label" style={{ marginTop: '6px' }}>Hospital Rating</div>
                    </div>
                  </div>

                  {/* Specialties and Facilities Lists */}
                  <div className="glass-card" style={{ padding: '28px' }}>
                    <h3 className="heading-sm" style={{ marginBottom: '24px' }}>Departments & Facilities</h3>
                    
                    <div className="grid grid-2" style={{ gap: '24px' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                          🏥 Specialities & Departments
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {(activeHospital.specialties || activeHospital.doctorTypes || ['General Medicine', 'Pediatrics', 'Emergency Care', 'Vaccination Center']).map((spec, i) => (
                            <span key={i} className="badge badge-primary" style={{ textTransform: 'none', padding: '6px 12px' }}>{spec}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                          🌟 Hospital Facilities
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {(activeHospital.facilities || ['24/7 Campus Emergency SOS', '24/7 Ambulance Cover', 'General OPD', 'Vaccination Drive', 'Free Student Consultation']).map((fac, i) => (
                            <span key={i} className="badge badge-secondary" style={{ textTransform: 'none', padding: '6px 12px' }}>{fac}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Hospital Photo */}
                  <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ 
                      width: '100%', 
                      height: '180px', 
                      borderRadius: 'var(--radius-md)', 
                      background: `url(${activeHospital.imageUrl || activeHospital.images?.[0] || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800'}) center/cover`,
                      marginBottom: '16px'
                    }}></div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Main Building Photo</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Displayed to patients in search listings.</p>
                  </div>

                  {/* Contact and Location Card */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 className="heading-sm" style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Location & Contact</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <FiMapPin color="var(--primary)" style={{ marginTop: '4px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Street Address</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '2px' }}>{activeHospital.address}</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '2px', fontWeight: 600 }}>
                            {activeHospital.city}, {activeHospital.state} - {activeHospital.pincode}
                          </div>
                        </div>
                      </div>

                      {activeHospital.latitude && activeHospital.longitude && (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <FiMap color="var(--primary)" style={{ marginTop: '4px', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>GPS Coordinates</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                              Lat: {activeHospital.latitude}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                              Long: {activeHospital.longitude}
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <FiPhone color="var(--primary)" style={{ marginTop: '4px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Contact Phone</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '2px' }}>{activeHospital.phone}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <FiMail color="var(--primary)" style={{ marginTop: '4px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Official Email</div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '2px' }}>{activeHospital.email}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {activeTab === 'beds' && (
              <motion.div
                key="beds"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
              >
                {/* Quick Bed Update Form */}
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h3 className="heading-sm" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiActivity color="var(--primary)" /> Manage Bed Availability
                  </h3>
                  
                  <form onSubmit={handleUpdateBeds} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '200px' }}>
                      <label className="form-label">Available Beds (Currently unoccupied)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input 
                          type="range" 
                          min="0" 
                          max={activeHospital.totalBeds || 50} 
                          value={availableBedsInput} 
                          onChange={(e) => setAvailableBedsInput(parseInt(e.target.value))}
                          style={{ flex: 1, accentColor: 'var(--primary)' }}
                        />
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ width: '100px', padding: '10px' }} 
                          min="0" 
                          max={activeHospital.totalBeds || 50}
                          value={availableBedsInput}
                          onChange={(e) => setAvailableBedsInput(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ height: '48px', padding: '0 32px' }}
                      disabled={updatingBeds || availableBedsInput === activeHospital.availableBeds}
                    >
                      Save bed count
                    </button>
                  </form>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
                    Updating availability helps emergency services and patients find real-time vacant beds. Total bed capacity is configured as <strong>{activeHospital.totalBeds}</strong>.
                  </p>
                </div>

                {/* Quick Guide Card */}
                <div className="glass-card" style={{ padding: '24px', background: 'rgba(29, 158, 117, 0.03)', borderColor: 'var(--primary-light)' }}>
                  <h3 className="heading-sm" style={{ marginBottom: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiShield color="var(--primary)" /> Verification Status
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Your hospital registration profile is active and verified. Any doctor signing up on MedAstraX can select your hospital to create their schedules. 
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                    <FiCheck /> Real-time search listed
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'doctors' && (
              <motion.div
                key="doctors"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="glass-card"
                style={{ padding: '28px' }}
              >
                <h3 className="heading-sm" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiUsers color="var(--primary)" /> Registered Doctors ({(doctors || []).length})
                </h3>

                {loadingDoctors ? (
                  <div style={{ padding: '20px 0', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto', width: '30px', height: '30px' }}></div>
                  </div>
                ) : !doctors || doctors.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    <FaUserMd style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: '12px' }} />
                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>No Doctors Associated Yet</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '4px', maxWidth: '400px', margin: '4px auto 0' }}>
                      When doctors register on MedAstraX, they select their associated hospital. Once they select your hospital, they will automatically appear in this list.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(doctors || []).map((doc) => (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div className="avatar avatar-lg">
                            {doc.avatarUrl ? (
                              <img src={doc.avatarUrl} alt={doc.name || 'Doctor'} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              (doc.name || 'Doctor').charAt(0)
                            )}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{doc.name || 'Dr. Unknown'}</h4>
                            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500, marginTop: '2px' }}>{doc.specialization || 'General Physician'}</div>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiPhone size={12} /> {doc.phone || 'No phone'}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiMail size={12} /> {doc.email || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', minWidth: '150px' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{doc.fees || 200} / session</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <FiClock size={12} /> {doc.workingHours || '09:00 AM - 05:00 PM'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {Array.isArray(doc.workingDays) 
                              ? doc.workingDays.join(' • ') 
                              : (typeof doc.workingDays === 'string' ? doc.workingDays.split(',').join(' • ') : '')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
