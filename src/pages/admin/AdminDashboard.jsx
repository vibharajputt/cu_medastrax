import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, FiCalendar, FiClock, FiMapPin, FiUsers, 
  FiPlusCircle, FiTrash2, FiSend, FiCheckCircle, 
  FiAlertCircle, FiActivity, FiLogOut, FiMonitor
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { campAPI, authAPI, hospitalAPI } from '../../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Health Records Hub State
  const [activeTab, setActiveTab] = useState('camps');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('medastrax_reopen_camp_popup'));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Blood Donation Drive');
  const [venue, setVenue] = useState('CU Sports Complex Hall');
  const [date, setDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('09:00 AM - 04:00 PM');
  const [targetAudience, setTargetAudience] = useState('All Portals (Students, Faculty, Staff & Doctors)');
  const [description, setDescription] = useState('');

  const campCategories = [
    { value: 'Blood Donation Drive', label: '🩸 Blood Donation Drive' },
    { value: 'General Health Checkup', label: '🩺 General Health Checkup' },
    { value: 'Eye & Vision Care Camp', label: '👁️ Eye & Vision Care Camp' },
    { value: 'Dental Care & Hygiene Camp', label: '🦷 Dental Care & Hygiene Camp' },
    { value: 'Fitness & Body Composition Assessment', label: '🏋️ Fitness & Body Composition Assessment' },
    { value: 'Mental Health Awareness Drive', label: '🧠 Mental Health Awareness Drive' },
    { value: 'Vaccination & Immunization Drive', label: '💉 Vaccination & Immunization Drive' }
  ];

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const res = await campAPI.getAll();
      setCamps(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load scheduled camps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
    fetchUsersAndHospitals();
  }, []);

  const fetchUsersAndHospitals = async () => {
    try {
      setUsersLoading(true);
      const [usersRes, hospitalsRes] = await Promise.all([
        authAPI.getAllUsers(),
        hospitalAPI.getAll()
      ]);
      setUsers(usersRes.data || []);
      // Map hospitals to look like users with a role
      const hospitalsData = (hospitalsRes.data || []).map(h => ({
        ...h,
        role: 'HOSPITAL',
        id: h.id.toString().startsWith('hospital') ? h.id : `hospital-${h.id}`,
        email: h.email || 'contact@hospital.com'
      }));
      setHospitals(hospitalsData);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load records.');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleScheduleCamp = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a Camp Title.');
      return;
    }
    if (!venue.trim()) {
      toast.error('Please specify a Venue / Location.');
      return;
    }
    if (!date) {
      toast.error('Please choose a Date.');
      return;
    }

    try {
      setSubmitting(true);
      const newCampData = {
        title: title.trim(),
        category,
        venue: venue.trim(),
        date,
        timeSlot: timeSlot.trim(),
        targetAudience,
        description: description.trim() || 'Free health assessment and consultation provided for all participants.'
      };

      const res = await campAPI.create(newCampData);
      const createdCamp = res.data;

      localStorage.setItem('MedAstraX_latest_camp', JSON.stringify(createdCamp || newCampData));
      window.dispatchEvent(new Event('medastrax_camp_updated'));

      toast.success(`Health Camp "${createdCamp.title || title}" scheduled & broadcasted to all portals! 📢`, { duration: 5000 });

      setTitle('');
      setDescription('');
      fetchCamps();
    } catch (err) {
      console.error(err);
      toast.error('Failed to schedule camp. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCamp = async (campId) => {
    try {
      await campAPI.delete(campId);
      toast.success('Camp removed successfully.');
      window.dispatchEvent(new Event('medastrax_camp_updated'));
      fetchCamps();
    } catch (err) {
      toast.error('Failed to delete camp.');
    }
  };

  const handleRebroadcast = (camp) => {
    localStorage.setItem('MedAstraX_latest_camp', JSON.stringify(camp));
    window.dispatchEvent(new Event('medastrax_camp_updated'));
    toast.success(`Re-broadcasted notification for "${camp.title}" to all portals! 📢`);
  };

  const allRecords = [...users.filter(u => u.role !== 'HOSPITAL'), ...hospitals];

  const filteredUsers = allRecords.filter(u => {
    if (roleFilter === 'ALL') return true;
    if (roleFilter === 'STUDENT') return u.role === 'PATIENT' && !u.isFaculty;
    if (roleFilter === 'FACULTY') return u.role === 'PATIENT' && u.isFaculty;
    return u.role === roleFilter;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px', color: '#0f172a', fontFamily: 'sans-serif' }}>
      
      {/* Admin Portal Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 32px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#ffffff', padding: '12px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)' }}>
            <FiShield size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              Admin Portal
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
              Manage scheduled drives and monitor role-aware health records across the platform.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* [BOUNTY 4] Button to access the Agent Observability Dashboard */}
          <button 
            type="button"
            onClick={() => navigate('/admin/observability')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
          >
            <FiMonitor /> Observability
          </button>
          
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
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0d9488', background: '#ccfbf1', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', background: '#0d9488', borderRadius: '50%', display: 'inline-block' }}></span>
            Logged in as {user?.name || 'System Admin'}
          </span>
          <button 
            type="button"
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 30px auto', display: 'flex', gap: '16px', borderBottom: '2px solid #e2e8f0' }}>
        <button 
          onClick={() => setActiveTab('camps')}
          style={{ 
            background: 'none', border: 'none', padding: '12px 24px', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'camps' ? '#0d9488' : '#64748b',
            borderBottom: activeTab === 'camps' ? '3px solid #0d9488' : '3px solid transparent',
            marginBottom: '-2px', transition: 'all 0.2s'
          }}
        >
          🏥 Camp Management
        </button>
        <button 
          onClick={() => setActiveTab('records')}
          style={{ 
            background: 'none', border: 'none', padding: '12px 24px', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'records' ? '#0d9488' : '#64748b',
            borderBottom: activeTab === 'records' ? '3px solid #0d9488' : '3px solid transparent',
            marginBottom: '-2px', transition: 'all 0.2s'
          }}
        >
          📂 Health Records Hub
        </button>
      </div>

      {activeTab === 'camps' && (
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Schedule Camp Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        >
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiPlusCircle color="#0d9488" /> Schedule New Health Camp
          </h2>
          <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.85rem' }}>
            This camp will be instantly broadcasted via notifications &amp; floating icon on Student, Faculty, Doctor, Pharmacy &amp; Hospital portals.
          </p>

          <form onSubmit={handleScheduleCamp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Camp Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Camp Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Mega Blood Donation Drive 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                required
              />
            </div>

            {/* Category Select */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Camp Category / Type *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#ffffff' }}
              >
                {campCategories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Grid 2: Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Event Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Time Slot *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM - 04:00 PM"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  required
                />
              </div>
            </div>

            {/* Venue / Location */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Venue / Location *
              </label>
              <input
                type="text"
                placeholder="e.g. CU Sports Complex Hall / Block B Lawn"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Camp Description &amp; Instructions
              </label>
              <textarea
                rows="3"
                placeholder="Details regarding checkup, blood tests, free consultation, donor certificate, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', resize: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '8px',
                padding: '14px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FiSend /> {submitting ? 'Broadcasting...' : 'Schedule & Broadcast Health Camp'}
            </button>

          </form>
        </motion.div>

        {/* RIGHT COLUMN: Scheduled Camps List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCalendar color="#0d9488" /> Active &amp; Scheduled Camps ({camps.length})
              </h2>
            </div>

            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading camps...</div>
            ) : camps.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <FiAlertCircle size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: 700, color: '#475569' }}>No Health Camps Scheduled Yet</div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>Fill out the form on the left to schedule a camp for campus users.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '680px', overflowY: 'auto', paddingRight: '4px' }}>
                {camps.map((camp) => (
                  <div 
                    key={camp.id} 
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d9488', background: '#ccfbf1', padding: '3px 8px', borderRadius: '8px', display: 'inline-block', marginBottom: '6px' }}>
                          {camp.category}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          {camp.title}
                        </h3>
                      </div>

                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>
                        ✓ Broadcasted
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiCalendar color="#0d9488" size={14} /> <strong>Date:</strong> {camp.date}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiClock color="#0d9488" size={14} /> <strong>Time:</strong> {camp.timeSlot}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', gridColumn: '1 / -1' }}>
                        <FiMapPin color="#0d9488" size={14} /> <strong>Venue:</strong> {camp.venue}
                      </div>
                    </div>

                    {camp.description && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', lineHeight: '1.4' }}>
                        {camp.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                      <button
                        type="button"
                        onClick={() => handleRebroadcast(camp)}
                        style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FiSend size={12} /> Re-Broadcast Popup
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCamp(camp.id)}
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FiTrash2 size={12} /> Cancel Camp
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </div>
      )}

      {activeTab === 'records' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiUsers color="#0d9488" /> Role-Aware Health Record Filters
            </h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Filter health records and user profiles based on platform roles (Patient, Doctor, Hospital, Admin).
            </p>

            {/* Role Filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {['ALL', 'STUDENT', 'FACULTY', 'DOCTOR', 'HOSPITAL', 'ADMIN'].map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  style={{
                    padding: '8px 20px', borderRadius: '30px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                    background: roleFilter === role ? '#0d9488' : '#f1f5f9',
                    color: roleFilter === role ? '#fff' : '#64748b',
                    border: 'none', boxShadow: roleFilter === role ? '0 4px 12px rgba(13, 148, 136, 0.3)' : 'none'
                  }}
                >
                  {role === 'ALL' ? 'All Roles' : role}
                </button>
              ))}
            </div>

            {/* Visible Count */}
            <div style={{ marginBottom: '24px', padding: '12px 20px', background: 'rgba(13, 148, 136, 0.05)', borderLeft: '4px solid #0d9488', borderRadius: '0 8px 8px 0', color: '#0f766e', fontWeight: 600 }}>
              Scoped Results: <span style={{ fontSize: '1.1rem' }}>{filteredUsers.length}</span> record(s) found for {roleFilter === 'ALL' ? 'All Roles' : roleFilter}.
            </div>

            {/* Scoped List Results */}
            {usersLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading records...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                <FiAlertCircle size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <p>No records found for the selected role.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {filteredUsers.map(u => (
                  <div key={u.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', transition: 'transform 0.2s' }} className="hover:shadow-md">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>{u.name || u.hospitalName}</h3>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', background: '#0d9488', color: '#fff' }}>
                        {u.role}
                      </span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span><strong>ID:</strong> {u.id}</span>
                      <span><strong>Email:</strong> {u.email}</span>
                      {u.phone && <span><strong>Phone:</strong> {u.phone}</span>}
                    </div>
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Created: {new Date().toLocaleDateString()}</span>
                      <button style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
