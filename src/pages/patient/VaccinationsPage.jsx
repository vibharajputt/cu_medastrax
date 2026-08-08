import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiShield, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiStar, 
  FiDollarSign, 
  FiInfo, 
  FiPlusCircle, 
  FiX, 
  FiChevronRight, 
  FiDroplet,
  FiFileText,
  FiUserCheck,
  FiAward
} from 'react-icons/fi';
import { vaccinationAPI, hospitalAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function VaccinationsPage({ user: propUser }) {
  const { user: authUser } = useAuth();
  const currentUser = propUser || authUser;

  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [vaccines, setVaccines] = useState([]);
  const [patientVaccinations, setPatientVaccinations] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Info & Dose, 2: Hospital, 3: Slot, 4: Payment
  const [targetDoseNumber, setTargetDoseNumber] = useState(1);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const availableTimeSlots = [
    '09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'
  ];

  const _loadNetData = async () => {
    try {
      setLoading(true);
      const [vaxRes, pVaxRes, hospRes] = await Promise.all([
        vaccinationAPI.getVaccines(),
        vaccinationAPI.getPatientVaccinations(currentUser?.id || 'student-10013'),
        hospitalAPI.getAll()
      ]);

      const parseArray = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.data)) return res.data.data;
        return [];
      };

      setVaccines(parseArray(vaxRes));
      setPatientVaccinations(parseArray(pVaxRes));
      setHospitals(parseArray(hospRes));
    } catch (err) {
      console.error('Error loading vaccination data:', err);
      toast.error('Failed to load vaccination catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    _loadNetData();
  }, [currentUser?.id]);

  const getNextDoseInfo = (vaccineId) => {
    const recordsList = Array.isArray(patientVaccinations) ? patientVaccinations : [];
    const userRecords = recordsList.filter(
      r => r.vaccineId === vaccineId && (r.status === 'COMPLETED' || r.status === 'SCHEDULED')
    );
    const completedRecords = userRecords.filter(r => r.status === 'COMPLETED');
    const scheduledRecords = userRecords.filter(r => r.status === 'SCHEDULED');

    const highestCompleted = completedRecords.reduce((max, r) => Math.max(max, r.doseNumber || 1), 0);
    const nextDose = highestCompleted + 1;
    const hasScheduledNext = scheduledRecords.some(r => r.doseNumber === nextDose);
    const scheduledRecord = scheduledRecords.find(r => r.doseNumber === nextDose);

    return {
      highestCompleted,
      nextDose,
      hasScheduledNext,
      scheduledRecord
    };
  };

  const handleStartBooking = (vaccine, explicitDose = null) => {
    setSelectedVaccine(vaccine);
    const doseInfo = getNextDoseInfo(vaccine.id);
    const doseToBook = explicitDose || doseInfo.nextDose;
    setTargetDoseNumber(doseToBook);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);

    if (Array.isArray(hospitals) && hospitals.length > 0) {
      setSelectedHospital(hospitals[0]);
    }

    setBookingStep(1);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedVaccine || !selectedHospital || !bookingDate || !bookingTime) {
      toast.error('Please complete all required booking details');
      return;
    }

    try {
      setSubmittingBooking(true);
      const bookingPayload = {
        patientId: currentUser?.id || 'student-10013',
        patientName: currentUser?.name || 'Naina Kumari',
        vaccineId: selectedVaccine.id,
        vaccineName: selectedVaccine.name,
        brand: selectedVaccine.brand,
        doseNumber: targetDoseNumber,
        totalDoses: selectedVaccine.totalDoses || 1,
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        hospitalAddress: selectedHospital.address || `${selectedHospital.city}, ${selectedHospital.state}`,
        date: bookingDate,
        timeSlot: bookingTime,
        doctorName: 'Dr. Aditya Sharma',
        paymentMethod: paymentMethod,
        pricePaid: selectedVaccine.price === 'FREE' ? 'FREE' : selectedVaccine.price
      };

      const res = await vaccinationAPI.bookVaccination(bookingPayload);
      toast.success(res?.message || 'Vaccination appointment booked successfully!');
      
      setShowBookingModal(false);
      _loadNetData(); // Refresh data
      setActiveTab('history'); // Switch to history tab to view scheduled shot
    } catch (err) {
      console.error('Booking failed:', err);
      toast.error(err.response?.data?.message || 'Failed to book vaccination appointment');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const vaccinesList = Array.isArray(vaccines) ? vaccines : [];
  const filteredVaccines = vaccinesList.filter(vax => {
    const query = searchQuery.toLowerCase();
    return (
      vax.name?.toLowerCase().includes(query) ||
      vax.disease?.toLowerCase().includes(query) ||
      vax.badge?.toLowerCase().includes(query) ||
      vax.recommendedFor?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="vaccinations-container" style={{ padding: '4px', color: '#0f172a' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f766e 100%)',
        borderRadius: '20px',
        padding: '32px 28px',
        color: '#ffffff',
        marginBottom: '28px',
        boxShadow: '0 10px 30px rgba(15, 118, 110, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            padding: '6px 14px',
            borderRadius: '30px',
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            marginBottom: '14px',
            color: '#2dd4bf',
            border: '1px solid rgba(45, 212, 191, 0.3)'
          }}>
            <FiDroplet /> CAMPUS IMMUNIZATION & WELLNESS PORTAL
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
            Vaccinations & Shot Records
          </h1>
          <p style={{ fontSize: '0.98rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
            Schedule essential vaccines, track multi-shot dosage milestones, and keep your verified electronic immunization records up to date for campus & travel compliance.
          </p>

          {/* Search Bar */}
          <div style={{ marginTop: '24px', position: 'relative', maxWidth: '520px' }}>
            <FiSearch style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '1.2rem'
            }} />
            <input 
              type="text"
              placeholder="Search vaccines by name, disease (e.g. Flu, Hepatitis, COVID, Typhoid)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                borderRadius: '12px',
                border: 'none',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.92rem',
                fontWeight: '500',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                <FiX />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '24px',
        paddingBottom: '2px'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('available')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              fontSize: '0.96rem',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'available' ? '#0f766e' : '#64748b',
              borderBottom: activeTab === 'available' ? '3px solid #0f766e' : '3px solid transparent',
              transition: 'all 0.2s',
              marginBottom: '-4px'
            }}
          >
            <FiShield /> Available Vaccines ({filteredVaccines.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              fontSize: '0.96rem',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: activeTab === 'history' ? '#0f766e' : '#64748b',
              borderBottom: activeTab === 'history' ? '3px solid #0f766e' : '3px solid transparent',
              transition: 'all 0.2s',
              marginBottom: '-4px'
            }}
          >
            <FiFileText /> Vaccination History & Multi-Shot Tracking ({patientVaccinations.length})
          </button>
        </div>

        {/* Quick summary pill */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem' }}>
          <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '20px', fontWeight: 600 }}>
            🟢 Up to Date Immunization
          </span>
        </div>
      </div>

      {/* TAB 1: AVAILABLE VACCINES CATALOG */}
      {activeTab === 'available' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <div className="spinner" style={{ margin: '0 auto 16px auto', width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#0f766e', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Loading vaccination catalog...
            </div>
          ) : filteredVaccines.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
              border: '1px solid #e2e8f0'
            }}>
              <FiDroplet style={{ fontSize: '3rem', color: '#94a3b8', marginBottom: '12px' }} />
              <h3 style={{ color: '#0f172a', margin: '0 0 8px 0' }}>No vaccines matching "{searchQuery}"</h3>
              <p style={{ color: '#64748b', margin: 0 }}>Try searching for generic terms like "Flu", "COVID", "Hepatitis", or "Typhoid".</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '24px'
            }}>
              {filteredVaccines.map((vax) => {
                const doseInfo = getNextDoseInfo(vax.id);
                const isFullyCompleted = doseInfo.highestCompleted >= (vax.totalDoses || 1);
                
                return (
                  <motion.div
                    key={vax.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
                  >
                    {/* Header Image & Badge */}
                    <div style={{
                      position: 'relative',
                      height: '160px',
                      background: '#f1f5f9',
                      overflow: 'hidden'
                    }}>
                      <img 
                        src={vax.imageUrl} 
                        alt={vax.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.7) 100%)'
                      }} />

                      {/* Top Badges */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        right: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          background: vax.price === 'FREE' ? '#16a34a' : '#0f766e',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '20px',
                          letterSpacing: '0.3px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}>
                          {vax.badge}
                        </span>

                        <span style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          color: '#0f172a',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '20px'
                        }}>
                          {vax.price}
                        </span>
                      </div>

                      {/* Title overlay */}
                      <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px', color: '#ffffff' }}>
                        <h3 style={{ margin: '0 0 2px 0', fontSize: '1.2rem', fontWeight: 800 }}>{vax.name}</h3>
                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
                          Brand: <strong style={{ color: '#2dd4bf' }}>{vax.brand}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Target Disease */}
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FiShield style={{ color: '#0f766e' }} /> Disease Prevented
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', lineHeight: '1.4' }}>
                          {vax.disease}
                        </div>
                      </div>

                      {/* Side Effects & Shots Info */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                        <div style={{ background: '#fff7ed', padding: '10px', borderRadius: '10px', border: '1px solid #ffedd5' }}>
                          <div style={{ color: '#c2410c', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiAlertCircle /> Side Effects
                          </div>
                          <div style={{ color: '#9a3412', fontWeight: 600, fontSize: '0.78rem', lineHeight: '1.3' }}>
                            {vax.sideEffects}
                          </div>
                        </div>

                        <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                          <div style={{ color: '#1d4ed8', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiDroplet /> Shots Required
                          </div>
                          <div style={{ color: '#1e40af', fontWeight: 800, fontSize: '0.85rem' }}>
                            {vax.totalDoses} {vax.totalDoses === 1 ? 'Shot' : 'Shots'}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                        <strong style={{ color: '#334155' }}>Schedule:</strong> {vax.doseInterval}
                      </div>

                      {/* User Progress Status Banner */}
                      {doseInfo.highestCompleted > 0 && (
                        <div style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          color: '#166534',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span>Progress: {doseInfo.highestCompleted} of {vax.totalDoses} Dose(s) Done</span>
                          <FiCheckCircle style={{ color: '#16a34a' }} />
                        </div>
                      )}

                      {/* Action Button */}
                      <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                        {isFullyCompleted ? (
                          <div style={{
                            width: '100%',
                            padding: '12px',
                            background: '#f1f5f9',
                            color: '#166534',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <FiCheckCircle color="#16a34a" /> All Doses Completed
                          </div>
                        ) : doseInfo.hasScheduledNext ? (
                          <button
                            type="button"
                            onClick={() => setActiveTab('history')}
                            style={{
                              width: '100%',
                              padding: '12px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              borderRadius: '10px',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                          >
                            <FiCalendar /> Dose {doseInfo.nextDose} Scheduled (View)
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartBooking(vax)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              background: 'linear-gradient(135deg, #0f766e, #0d9488)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '10px',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              transition: 'background 0.2s'
                            }}
                          >
                            <FiPlusCircle /> {doseInfo.highestCompleted > 0 ? `Book Next Shot (Dose ${doseInfo.nextDose})` : 'Book Vaccination'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VACCINATION HISTORY & MULTI-SHOT TRACKING */}
      {activeTab === 'history' && (() => {
        const historyList = Array.isArray(patientVaccinations) ? patientVaccinations : [];
        
        const groupedVaccinesMap = historyList.reduce((acc, record) => {
          const key = record.vaccineId || record.vaccineName;
          if (!acc[key]) {
            const parentVax = vaccines.find(v => v.id === record.vaccineId || v.name === record.vaccineName);
            acc[key] = {
              vaccineId: record.vaccineId,
              vaccineName: record.vaccineName,
              brand: record.brand || parentVax?.brand || record.vaccineName,
              totalDoses: record.totalDoses || parentVax?.totalDoses || 1,
              parentVax: parentVax,
              dosesMap: {}
            };
          }
          acc[key].dosesMap[record.doseNumber || 1] = record;
          return acc;
        }, {});

        const groupedVaccinesList = Object.values(groupedVaccinesMap).map(group => {
          const completedDoses = Object.values(group.dosesMap).filter(d => d.status === 'COMPLETED');
          const scheduledDoses = Object.values(group.dosesMap).filter(d => d.status === 'SCHEDULED');
          
          const highestCompletedDoseNum = completedDoses.reduce((max, d) => Math.max(max, d.doseNumber || 1), 0);
          const isFullyCompleted = highestCompletedDoseNum >= group.totalDoses;
          const nextDoseNum = highestCompletedDoseNum + 1;
          const nextDoseScheduled = scheduledDoses.find(d => d.doseNumber === nextDoseNum);
          const hasPendingNextDose = !isFullyCompleted && !nextDoseScheduled && nextDoseNum <= group.totalDoses;

          let statusText = `Shot ${highestCompletedDoseNum} of ${group.totalDoses} Completed`;
          if (highestCompletedDoseNum === 0 && scheduledDoses.length > 0) {
            statusText = `Shot 0 of ${group.totalDoses} Completed (Shot 1 Scheduled)`;
          }

          return {
            ...group,
            completedCount: completedDoses.length,
            highestCompletedDoseNum,
            isFullyCompleted,
            nextDoseNum,
            nextDoseScheduled,
            hasPendingNextDose,
            statusText
          };
        });

        return (
          <div>
            {groupedVaccinesList.length === 0 ? (
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
                border: '1px solid #e2e8f0'
              }}>
                <FiFileText style={{ fontSize: '3rem', color: '#94a3b8', marginBottom: '12px' }} />
                <h3 style={{ color: '#0f172a', margin: '0 0 8px 0' }}>No vaccination records found</h3>
                <p style={{ color: '#64748b', margin: '0 0 16px 0' }}>You have no vaccination entries matching this filter.</p>
                <button
                  onClick={() => setActiveTab('available')}
                  style={{
                    padding: '10px 20px',
                    background: '#0f766e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Book Your First Vaccination
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {groupedVaccinesList.map((vaxGroup) => {
                  const doseNumbers = Array.from({ length: vaxGroup.totalDoses }, (_, i) => i + 1);

                  return (
                    <motion.div
                      key={vaxGroup.vaccineId || vaxGroup.vaccineName}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        padding: '24px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px'
                      }}
                    >
                      {/* Single Card Header */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        borderBottom: '1px solid #f1f5f9',
                        paddingBottom: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '14px',
                            background: vaxGroup.isFullyCompleted ? '#f0fdf4' : vaxGroup.hasPendingNextDose ? '#fff7ed' : '#eff6ff',
                            color: vaxGroup.isFullyCompleted ? '#16a34a' : vaxGroup.hasPendingNextDose ? '#ea580c' : '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.6rem'
                          }}>
                            {vaxGroup.isFullyCompleted ? <FiCheckCircle /> : <FiDroplet />}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                                {vaxGroup.vaccineName}
                              </h3>
                            </div>
                            <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '4px' }}>
                              Brand: <strong style={{ color: '#334155' }}>{vaxGroup.brand}</strong> | Immunization Series: <strong style={{ color: '#0f766e' }}>{vaxGroup.totalDoses} {vaxGroup.totalDoses === 1 ? 'Shot Total' : 'Shots Total'}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Overall Progress Badge (Requested Text) */}
                        <div>
                          <span style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            background: vaxGroup.isFullyCompleted ? '#16a34a' : vaxGroup.hasPendingNextDose ? '#ea580c' : '#2563eb',
                            color: '#ffffff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            {vaxGroup.isFullyCompleted ? <FiCheckCircle /> : <FiClock />}
                            {vaxGroup.statusText}
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                          <span>Overall Progress: {vaxGroup.highestCompletedDoseNum} of {vaxGroup.totalDoses} Shots</span>
                          <span>{Math.round((vaxGroup.highestCompletedDoseNum / vaxGroup.totalDoses) * 100)}%</span>
                        </div>
                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${(vaxGroup.highestCompletedDoseNum / vaxGroup.totalDoses) * 100}%`,
                            background: vaxGroup.isFullyCompleted ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'linear-gradient(90deg, #0f766e, #0d9488)',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                      </div>

                      {/* Doses Timeline / Breakdown Inside Single Card */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                        {doseNumbers.map((doseNum) => {
                          const doseRecord = vaxGroup.dosesMap[doseNum];
                          const isCompleted = doseRecord?.status === 'COMPLETED';
                          const isScheduled = doseRecord?.status === 'SCHEDULED';
                          const isPending = !doseRecord && doseNum === vaxGroup.nextDoseNum && vaxGroup.hasPendingNextDose;

                          return (
                            <div
                              key={doseNum}
                              style={{
                                background: isCompleted ? '#f0fdf4' : isScheduled ? '#eff6ff' : isPending ? '#fff7ed' : '#f8fafc',
                                border: `1px solid ${isCompleted ? '#bbf7d0' : isScheduled ? '#bfdbfe' : isPending ? '#ffedd5' : '#e2e8f0'}`,
                                borderRadius: '12px',
                                padding: '14px 18px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px'
                              }}
                            >
                              {/* Left: Dose Indicator */}
                              <div style={{ flex: 1, minWidth: '240px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{
                                    fontSize: '0.78rem',
                                    fontWeight: 800,
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    background: isCompleted ? '#16a34a' : isScheduled ? '#2563eb' : isPending ? '#ea580c' : '#94a3b8',
                                    color: '#ffffff'
                                  }}>
                                    Shot {doseNum} of {vaxGroup.totalDoses}
                                  </span>

                                  <span style={{
                                    fontSize: '0.82rem',
                                    fontWeight: 800,
                                    color: isCompleted ? '#166534' : isScheduled ? '#1e40af' : isPending ? '#c2410c' : '#64748b'
                                  }}>
                                    {isCompleted ? '✓ COMPLETED' : isScheduled ? '📅 APPOINTMENT SCHEDULED' : isPending ? '⚠️ PENDING BOOKING' : '⏳ UPCOMING'}
                                  </span>
                                </div>

                                {doseRecord && (
                                  <div style={{ fontSize: '0.83rem', color: '#475569', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    <span>📍 <strong>{doseRecord.hospitalName}</strong></span>
                                    <span>📅 <strong>{doseRecord.date} at {doseRecord.timeSlot}</strong></span>
                                    {doseRecord.doctorName && <span>👨‍⚕️ {doseRecord.doctorName}</span>}
                                    {doseRecord.certificateNo && <span style={{ color: '#0f766e', fontWeight: 600 }}>Cert: {doseRecord.certificateNo}</span>}
                                  </div>
                                )}

                                {isPending && (
                                  <div style={{ fontSize: '0.82rem', color: '#9a3412', marginTop: '4px' }}>
                                    Shot {doseNum - 1} completed. Schedule your Shot {doseNum} appointment to keep your immunization on track.
                                  </div>
                                )}
                              </div>

                              {/* Right: Action if Pending */}
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => vaxGroup.parentVax && handleStartBooking(vaxGroup.parentVax, doseNum)}
                                  style={{
                                    padding: '10px 18px',
                                    background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)'
                                  }}
                                >
                                  <FiPlusCircle /> Book Next Shot (Dose {doseNum})
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* BOOKING MODAL STEPPER */}
      <AnimatePresence>
        {showBookingModal && selectedVaccine && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                maxWidth: '680px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #0f172a, #0f766e)',
                padding: '24px',
                color: '#ffffff',
                position: 'relative'
              }}>
                <button
                  onClick={() => setShowBookingModal(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <FiX />
                </button>

                <div style={{ fontSize: '0.8rem', color: '#2dd4bf', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  STEP {bookingStep} OF 4 • VACCINATION APPOINTMENT BOOKING
                </div>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>
                  {selectedVaccine.name}
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
                  Booking Dose <strong style={{ color: '#2dd4bf' }}>{targetDoseNumber}</strong> of {selectedVaccine.totalDoses || 1}
                </div>
              </div>

              {/* Modal Stepper Indicators */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                padding: '12px 24px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#64748b'
              }}>
                <div style={{ flex: 1, color: bookingStep >= 1 ? '#0f766e' : '#94a3b8' }}>1. Summary</div>
                <div style={{ flex: 1, color: bookingStep >= 2 ? '#0f766e' : '#94a3b8' }}>2. Hospital</div>
                <div style={{ flex: 1, color: bookingStep >= 3 ? '#0f766e' : '#94a3b8' }}>3. Date & Slot</div>
                <div style={{ flex: 1, color: bookingStep >= 4 ? '#0f766e' : '#94a3b8' }}>4. Payment</div>
              </div>

              {/* Modal Content */}
              <div style={{ padding: '24px' }}>
                {/* STEP 1: SUMMARY */}
                {bookingStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      background: '#f1f5f9',
                      padding: '16px',
                      borderRadius: '12px'
                    }}>
                      <img 
                        src={selectedVaccine.imageUrl} 
                        alt={selectedVaccine.name} 
                        style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' }}
                      />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{selectedVaccine.name}</h4>
                        <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px' }}>Brand: {selectedVaccine.brand}</div>
                        <div style={{ fontSize: '0.84rem', color: '#0f766e', fontWeight: 700, marginTop: '4px' }}>
                          Target Disease: {selectedVaccine.disease}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      padding: '14px',
                      borderRadius: '12px',
                      fontSize: '0.86rem',
                      color: '#166534'
                    }}>
                      <strong>Dose Configuration:</strong> You are booking Dose {targetDoseNumber} of {selectedVaccine.totalDoses || 1}. Please ensure you are not suffering from active acute fever at the time of vaccination.
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setBookingStep(2)}
                        style={{
                          padding: '12px 24px',
                          background: '#0f766e',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        Next: Select Hospital <FiChevronRight />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: SELECT HOSPITAL */}
                {bookingStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a' }}>
                      Select Hospital / Clinic in System:
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto' }}>
                      {hospitals.map((hosp) => (
                        <div
                          key={hosp.id}
                          onClick={() => setSelectedHospital(hosp)}
                          style={{
                            padding: '14px 18px',
                            borderRadius: '12px',
                            border: `2px solid ${selectedHospital?.id === hosp.id ? '#0f766e' : '#e2e8f0'}`,
                            background: selectedHospital?.id === hosp.id ? '#f0fdf4' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                              {hosp.name} {hosp.verified && <span style={{ color: '#0f766e' }}>✓ Verified</span>}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiMapPin /> {hosp.address}, {hosp.city} ({hosp.distance || '0.5 km'})
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#0f766e', fontWeight: 600, marginTop: '4px' }}>
                              Vaccination Fee: {selectedVaccine.price}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ background: '#fef3c7', color: '#b45309', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                              ★ {hosp.rating || 4.8}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setBookingStep(1)}
                        style={{ padding: '10px 18px', border: '1px solid #cbd5e1', background: 'transparent', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingStep(3)}
                        disabled={!selectedHospital}
                        style={{
                          padding: '12px 24px',
                          background: selectedHospital ? '#0f766e' : '#cbd5e1',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: 700,
                          cursor: selectedHospital ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        Next: Pick Date & Time <FiChevronRight />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: DATE & TIME SLOT */}
                {bookingStep === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Select Preferred Date:
                      </label>
                      <input 
                        type="date"
                        value={bookingDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBookingDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.92rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                        Select Available Time Slot:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {availableTimeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setBookingTime(slot)}
                            style={{
                              padding: '10px',
                              borderRadius: '8px',
                              border: `2px solid ${bookingTime === slot ? '#0f766e' : '#e2e8f0'}`,
                              background: bookingTime === slot ? '#f0fdf4' : '#ffffff',
                              color: bookingTime === slot ? '#0f766e' : '#334155',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setBookingStep(2)}
                        style={{ padding: '10px 18px', border: '1px solid #cbd5e1', background: 'transparent', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingStep(4)}
                        disabled={!bookingDate || !bookingTime}
                        style={{
                          padding: '12px 24px',
                          background: (bookingDate && bookingTime) ? '#0f766e' : '#cbd5e1',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: 700,
                          cursor: (bookingDate && bookingTime) ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        Next: Payment <FiChevronRight />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: PAYMENT & CONFIRMATION */}
                {bookingStep === 4 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.88rem' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Booking Summary</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#475569' }}>
                        <div>Vaccine: <strong>{selectedVaccine.name}</strong></div>
                        <div>Dose: <strong>Dose {targetDoseNumber} of {selectedVaccine.totalDoses || 1}</strong></div>
                        <div>Hospital: <strong>{selectedHospital?.name}</strong></div>
                        <div>Date & Time: <strong>{bookingDate} at {bookingTime}</strong></div>
                        <div>Total Payable: <strong style={{ color: '#0f766e', fontSize: '1rem' }}>{selectedVaccine.price}</strong></div>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                        Select Payment Method:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        {['UPI', 'CARD', 'CASH AT CLINIC'].map((pm) => (
                          <button
                            key={pm}
                            type="button"
                            onClick={() => setPaymentMethod(pm)}
                            style={{
                              padding: '12px 8px',
                              borderRadius: '10px',
                              border: `2px solid ${paymentMethod === pm ? '#0f766e' : '#e2e8f0'}`,
                              background: paymentMethod === pm ? '#f0fdf4' : '#ffffff',
                              color: paymentMethod === pm ? '#0f766e' : '#334155',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            {pm === 'UPI' ? '💳 UPI / GPay' : pm === 'CARD' ? '💳 Credit/Debit' : '💵 Cash at Clinic'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setBookingStep(3)}
                        style={{ padding: '10px 18px', border: '1px solid #cbd5e1', background: 'transparent', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmBooking}
                        disabled={submittingBooking}
                        style={{
                          padding: '12px 28px',
                          background: 'linear-gradient(135deg, #16a34a, #15803d)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {submittingBooking ? 'Confirming Appointment...' : 'Confirm & Schedule Appointment ✓'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

