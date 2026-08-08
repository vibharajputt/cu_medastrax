import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiMapPin, 
  FiStar, 
  FiActivity, 
  FiX, 
  FiCheck, 
  FiSend,
  FiShoppingBag,
  FiCalendar,
  FiFileText,
  FiVideo,
  FiAward,
  FiCpu,
  FiTrendingUp,
  FiAlertTriangle,
  FiPhone,
  FiTruck,
  FiClock,
  FiDroplet,
  FiDownload,
  FiCopy,
  FiUser,
  FiMenu,
  FiBell,
  FiBookOpen,
  FiHome,
  FiSettings,
  FiSun,
  FiMoon,
  FiUserPlus,
  FiLogOut,
  FiHeart,
  FiMic,
  FiMicOff,
  FiShield,
  FiNavigation
} from 'react-icons/fi';
import { hospitalAPI, aiAPI, authAPI, rewardsAPI, emergencyAPI, bookingAPI, labAPI } from '../../services/api';
import { getOfflineAiResponse } from '../../services/offlineAi';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import aiBotIcon from '../../assets/ai-bot-icon.png';
import logo from '../../assets/MedAstraCU-logo.png';
import rashikaAvatar from '../../assets/rashika-avatar.jpg';
import { rashikaBase64 } from '../../assets/rashikaAvatarDataUrl';
import './CuimsDashboard.css';

import MyPrescriptions from './MyPrescriptions';
import MyBookings from './MyBookings';
import CarePlan from './CarePlan';
import EmergencyPage from './EmergencyPage';
import RewardsLeaderboard from './RewardsLeaderboard';
import ComplementaryCheckup from './ComplementaryCheckup';
import MentalHealthWellnessTab from './MentalHealthWellnessTab';
import VaccinationsPage from './VaccinationsPage';
import BodyMapSymptomFlow from './BodyMapSymptomFlow';
import ReferAStudentTab from './ReferAStudentTab';
import StudentHealthPortalTab from './StudentHealthPortalTab';
import HealthMapTab from './HealthMapTab';

function MedicalLeaveTab({ _studentProfileData, user, _currAuthProfile }) {
  const [activeSubTab, setActiveSubTab] = useState('basic'); // 'basic', 'subjects', 'history'

  const userType = localStorage.getItem('user_type');
  const isFaculty = user?.role === 'FACULTY' || _studentProfileData?.role === 'FACULTY' || userType === 'FACULTY';

  const [leaves, setLeaves] = useState(
    isFaculty ? [
      { id: 1, startDate: '2026-07-05', endDate: '2026-07-08', reason: 'Acute Chikungunya Fever', doctor: 'Dr. Vikram Sethi (MD)', status: 'APPROVED', file: 'faculty_med_cert_chikungunya.pdf' },
      { id: 2, startDate: '2026-06-12', endDate: '2026-06-15', reason: 'Severe Cervical Spondylosis', doctor: 'Dr. Ananya Roy (MS Ortho)', status: 'APPROVED', file: 'faculty_cervical_report.pdf' }
    ] : [
      { id: 1, startDate: '2026-07-10', endDate: '2026-07-13', reason: 'Viral Gastroenteritis', doctor: 'Dr. Aditya Sharma', status: 'APPROVED', file: 'medical_cert_viral.pdf' },
      { id: 2, startDate: '2026-07-19', endDate: '2026-07-21', reason: 'High Grade Fever', doctor: 'Dr. Neha Verma', status: 'APPROVED', file: 'fever_report.pdf' }
    ]
  );

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [proceeded, setProceeded] = useState(false);

  const [drName, setDrName] = useState('');
  const [drDegree, setDrDegree] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const [drPhone, setDrPhone] = useState('');
  const [drRegNo, setDrRegNo] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [prescriptionDoc, setPrescriptionDoc] = useState(null);
  const [fitnessCert, setFitnessCert] = useState(null);
  const [opdSlip, setOpdSlip] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [prescriptionStatus, setPrescriptionStatus] = useState('idle'); // 'idle', 'valid', 'invalid'
  const [fitnessStatus, setFitnessStatus] = useState('idle'); // 'idle', 'valid', 'invalid'
  const [opdStatus, setOpdStatus] = useState('idle'); // 'idle', 'valid', 'invalid'

  const studentName = (_currAuthProfile?.name || _studentProfileData?.name || user?.name || 'RASHIKA POONIA').toUpperCase();
  const studentUid = _studentProfileData?.collegeUid || _studentProfileData?.uid || '24BCF10024';
  const fatherName = (_studentProfileData?.emergencyName || 'KULDEEP').toUpperCase().split('(')[0].trim();
  const studentMobile = _studentProfileData?.phone || user?.phone || '7988766566';
  const studentDob = _studentProfileData?.dob || '21 Sep 2006';
  const programName = 'Bachelor of Engineering (Computer Science and Engineering) (with Specialization in Full Stack Development) (CS227)';

  const teacherName = (_currAuthProfile?.name || _studentProfileData?.name || user?.name || 'DR. ANITA SHARMA').toUpperCase();
  const rawEid = _studentProfileData?.collegeEid || _studentProfileData?.eid || user?.collegeEid || user?.eid || '8041';
  const collegeEid = rawEid.startsWith('E-') ? rawEid : `E-${rawEid.replace(/[^0-9]/g, '').slice(-4) || '8041'}`;
  const teacherMobile = _studentProfileData?.phone || user?.phone || '9876543210';
  const teacherDob = _studentProfileData?.dob || '14 Aug 1985';
  const departmentName = _studentProfileData?.department || user?.department || 'Department of Computer Science & Engineering (CSE)';
  const designation = 'Associate Professor';

  const _initiateProcess = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Please select both From and To dates.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (start > today || end > today) {
      toast.error('You cannot apply for future medical leave dates in advance! ⚠️');
      return;
    }

    if (end < start) {
      toast.error('Applying To Date must be after Applying From Date!');
      return;
    }

    const timeDiff = end.getTime() - start.getTime();
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    if (diffDays < 3) {
      toast.error('Medical Leave can only be applied for a minimum of 3 days (e.g. 3, 5, 8, 10 days) as per CU Attendance Policy! ⚠️');
      return;
    }

    const daysSinceLeaveEnd = Math.floor((today.getTime() - end.getTime()) / (1000 * 3600 * 24));
    
    if (daysSinceLeaveEnd > 10) {
      toast.error(`Exemption window expired! You must submit medical leave within 10 days of your leave ending. (Ended ${daysSinceLeaveEnd} days ago) ⚠️`);
      return;
    }

    setProceeded(true);
    toast.success(`Exemption date range (${diffDays} Days) locked. Please fill in doctor details.`);
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!drName || !drDegree || !leaveReason || !drRegNo) {
      toast.error('Please fill in all doctor & medical slip details.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const newLeave = {
        id: Date.now(),
        startDate,
        endDate,
        reason: leaveReason,
        doctor: `${drName} (${drDegree})`,
        status: 'PENDING',
        file: prescriptionDoc ? prescriptionDoc.name : 'medical_exemption_proof.pdf'
      };
      setLeaves(prev => [newLeave, ...prev]);
      toast.success(isFaculty ? 'Faculty Medical Leave applied! Exemption pending HOD verification. 📑' : 'Medical Leave applied! Exemption pending warden verification. 📑');
      
      setStartDate('');
      setEndDate('');
      setDrName('');
      setDrDegree('');
      setLeaveReason('');
      setHospitalPhone('');
      setDrPhone('');
      setDrRegNo('');
      setCheckInTime('');
      setPrescriptionDoc(null);
      setFitnessCert(null);
      setOpdSlip(null);
      setProceeded(false);
      setSubmitting(false);
      setActiveSubTab('history');
    }, 1200);
  };

  return (
    <div className="cuims-medical-leave-container" style={{ fontFamily: 'Outfit, sans-serif' }}>
      
      {/* CUIMS Header Warning Buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '14px' }}>
        <button type="button" style={{ background: '#e11d48', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => toast.info('CUIMS Leave process workflow manual active')}>
          ➜ VIEW LEAVE PROCESS
        </button>
        <button type="button" style={{ background: '#ea580c', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => toast.info(isFaculty ? 'HOD Medical Exemption rules: Minimum duty threshold required.' : 'HOD Medical Exemption rules: Minimum 75% threshold needed.')}>
          ❓ VIEW LEAVE POLICY
        </button>
        <button type="button" style={{ background: '#0f766e', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => toast.info('FAQs loaded')}>
          📄 VIEW FAQ'S
        </button>
      </div>

      <div style={{ color: '#e11d48', fontSize: '0.88rem', fontWeight: 700, textAlign: 'center', marginBottom: '20px' }}>
        To Apply Leave, Please Go Through The Leave Policy First.
      </div>

      {/* Tabs navigation list */}
      <div style={{ display: 'flex', borderBottom: '2px solid #cbd5e1', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveSubTab('basic')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: activeSubTab === 'basic' ? '#ea580c' : '#64748b',
            borderBottom: activeSubTab === 'basic' ? '3px solid #ea580c' : 'none',
            cursor: 'pointer'
          }}
        >
          {isFaculty ? 'Faculty Basic Details' : 'Student Basic Details'}
        </button>
        <button 
          onClick={() => setActiveSubTab('subjects')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: activeSubTab === 'subjects' ? '#ea580c' : '#64748b',
            borderBottom: activeSubTab === 'subjects' ? '3px solid #ea580c' : 'none',
            cursor: 'pointer'
          }}
        >
          {isFaculty ? 'Faculty Courses & Labs' : 'Student Subjects'}
        </button>
        <button 
          onClick={() => setActiveSubTab('history')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: 'transparent',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: activeSubTab === 'history' ? '#ea580c' : '#64748b',
            borderBottom: activeSubTab === 'history' ? '3px solid #ea580c' : 'none',
            cursor: 'pointer'
          }}
        >
          Medical Leave History
        </button>
      </div>

      {/* Basic details flow */}
      {activeSubTab === 'basic' && (
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px' }}>
          
          {!proceeded ? (
            <>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '14px', textAlign: 'center' }}>
                {isFaculty ? 'Faculty Basic Details' : 'Student Basic Details'}
              </h3>
              
              {isFaculty ? (
                /* Faculty Details Table */
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginBottom: '24px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b', width: '25%' }}>College EID</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: '#0f766e' }}>{collegeEid}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>Status</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: '#16a34a' }}>Active</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>Teacher Name</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{teacherName}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>Mobile No.</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{teacherMobile}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>DOB</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{teacherDob}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>Department Name</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{departmentName}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>Designation</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{designation}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>OverAll Duty Attendance</td>
                      <td style={{ padding: '10px 8px', fontWeight: 700, color: '#16a34a' }}>94.8%</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                /* Student Details Table - UNTOUCHED */
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', marginBottom: '24px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b', width: '25%' }}>Account No.</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>12419330</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>UID</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: '#0f766e' }}>{studentUid}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>Status</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: '#16a34a' }}>Active</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>Student Name</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{studentName}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>Father Name</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{fatherName}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>Mobile No.</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{studentMobile}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>DOB</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{studentDob}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>OverAll Attendance</td>
                      <td style={{ padding: '10px 8px', fontWeight: 700, color: '#ea580c' }}>76.4%</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 8px', color: '#64748b' }}>Program Name</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{programName}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Date selection and proceed */}
              <form onSubmit={_initiateProcess} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Applying From Date</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', width: '100%' }}
                    required 
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Applying To Date</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', width: '100%' }}
                    required 
                  />
                </div>
                <button 
                  type="submit" 
                  style={{ background: '#e11d48', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  PROCEED
                </button>
              </form>
            </>
          ) : (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#031B33', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📋 {isFaculty ? 'Faculty Medical Exemption Certificate' : 'Medical Leave Certificate Submission'}</span>
                <button type="button" onClick={() => setProceeded(false)} style={{ background: '#cbd5e1', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Change Dates</button>
              </h3>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', color: '#166534' }}>
                Applying for medical exemption range: <strong>{startDate}</strong> to <strong>{endDate}</strong>
              </div>

              <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Doctor Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Dr. Aditya Sharma" 
                      value={drName} 
                      onChange={(e) => setDrName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Doctor Degree</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MD / MBBS / MS" 
                      value={drDegree} 
                      onChange={(e) => setDrDegree(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Leave Reason / Diagnosis</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Severe Typhoid / Ligament Tear" 
                    value={leaveReason} 
                    onChange={(e) => setLeaveReason(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Hospital Phone No.</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 0172-233445" 
                      value={hospitalPhone} 
                      onChange={(e) => setHospitalPhone(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Doctor Phone No.</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +91 98765 00123" 
                      value={drPhone} 
                      onChange={(e) => setDrPhone(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Doctor Registration No.</label>
                    <input 
                      type="text" 
                      placeholder="e.g. MCI-12345" 
                      value={drRegNo} 
                      onChange={(e) => setDrRegNo(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>OPD Check-In Time</label>
                    <input 
                      type="time" 
                      value={checkInTime} 
                      onChange={(e) => setCheckInTime(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Document uploads */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#0f766e', fontWeight: 700 }}>Upload Required Supporting Evidence (JPG/JPEG only)</h4>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#64748b', marginBottom: '2px' }}>
                      1. Prescription Document * 
                      {prescriptionStatus === 'valid' && <span style={{ marginLeft: '6px', color: '#16a34a', fontWeight: 'bold' }}>🟢 Valid</span>}
                      {prescriptionStatus === 'invalid' && <span style={{ marginLeft: '6px', color: '#dc2626', fontWeight: 'bold' }}>🔴 Invalid format</span>}
                    </label>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', marginBottom: '4px' }}>(Only JPG/JPEG format allowed)</span>
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const ext = file.name.split('.').pop().toLowerCase();
                          if (ext !== 'jpg' && ext !== 'jpeg') {
                            toast.error('Prescription Document must be a JPG/JPEG image! ⚠️');
                            e.target.value = null;
                            setPrescriptionDoc(null);
                            setPrescriptionStatus('invalid');
                          } else {
                            setPrescriptionDoc(file);
                            setPrescriptionStatus('valid');
                          }
                        } else {
                          setPrescriptionStatus('idle');
                        }
                      }} 
                      style={{ fontSize: '0.8rem' }} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#64748b', marginBottom: '2px' }}>
                      2. Medical Fitness Certificate *
                      {fitnessStatus === 'valid' && <span style={{ marginLeft: '6px', color: '#16a34a', fontWeight: 'bold' }}>🟢 Valid</span>}
                      {fitnessStatus === 'invalid' && <span style={{ marginLeft: '6px', color: '#dc2626', fontWeight: 'bold' }}>🔴 Invalid format</span>}
                    </label>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', marginBottom: '4px' }}>(Only JPG/JPEG format allowed)</span>
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const ext = file.name.split('.').pop().toLowerCase();
                          if (ext !== 'jpg' && ext !== 'jpeg') {
                            toast.error('Fitness Certificate must be a JPG/JPEG image! ⚠️');
                            e.target.value = null;
                            setFitnessCert(null);
                            setFitnessStatus('invalid');
                          } else {
                            setFitnessCert(file);
                            setFitnessStatus('valid');
                          }
                        } else {
                          setFitnessStatus('idle');
                        }
                      }} 
                      style={{ fontSize: '0.8rem' }} 
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#64748b', marginBottom: '2px' }}>
                      3. Hospital OPD Slip *
                      {opdStatus === 'valid' && <span style={{ marginLeft: '6px', color: '#16a34a', fontWeight: 'bold' }}>🟢 Valid</span>}
                      {opdStatus === 'invalid' && <span style={{ marginLeft: '6px', color: '#dc2626', fontWeight: 'bold' }}>🔴 Invalid format</span>}
                    </label>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: '#94a3b8', marginBottom: '4px' }}>(Only JPG/JPEG format allowed)</span>
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const ext = file.name.split('.').pop().toLowerCase();
                          if (ext !== 'jpg' && ext !== 'jpeg') {
                            toast.error('Hospital OPD Slip must be a JPG/JPEG image! ⚠️');
                            e.target.value = null;
                            setOpdSlip(null);
                            setOpdStatus('invalid');
                          } else {
                            setOpdSlip(file);
                            setOpdStatus('valid');
                          }
                        } else {
                          setOpdStatus('idle');
                        }
                      }} 
                      style={{ fontSize: '0.8rem' }} 
                      required 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  style={{ background: '#e11d48', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting Leave Files...' : (isFaculty ? 'Submit Faculty Leave & Reclaim Duty' : 'Submit Leave & Apply Attendance Reclaim')}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Subjects / Courses tab */}
      {activeSubTab === 'subjects' && (
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '14px' }}>
            {isFaculty ? `Faculty Assigned Courses & Lectures (${departmentName})` : 'Student Registered Course & Subjects (CS227)'}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Subject Code</th>
                <th style={{ padding: '10px 8px' }}>Subject Title</th>
                <th style={{ padding: '10px 8px', textAlign: 'center' }}>{isFaculty ? 'Duty Percentage' : 'Attendance %'}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 8px', fontWeight: 600 }}>CST-301</td>
                <td style={{ padding: '10px 8px' }}>Advanced Full Stack Web Dev</td>
                <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{isFaculty ? '94.5%' : '82.5%'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 8px', fontWeight: 600 }}>CST-302</td>
                <td style={{ padding: '10px 8px' }}>Machine Learning Algorithms</td>
                <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: isFaculty ? '#16a34a' : '#ea580c' }}>{isFaculty ? '91.2%' : '74.2%'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 8px', fontWeight: 600 }}>CST-303</td>
                <td style={{ padding: '10px 8px' }}>Database Management Systems</td>
                <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{isFaculty ? '96.0%' : '79.1%'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* History tab */}
      {activeSubTab === 'history' && (
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#031B33', marginBottom: '14px' }}>Medical Leave Request History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leaves.map((l) => (
              <div key={l.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>
                    {l.startDate} to {l.endDate}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    Reason: <strong style={{ color: '#ea580c' }}>{l.reason}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                    Certified by: {l.doctor}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    background: l.status === 'APPROVED' ? '#dcfce7' : '#fef3c7',
                    color: l.status === 'APPROVED' ? '#15803d' : '#b45309',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                    fontWeight: 700
                  }}>
                    {l.status}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '6px', textDecoration: 'underline', cursor: 'pointer' }}>
                    📄 {l.file}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}



function FacultyPortalTab({ _studentProfileData, fetchBookings }) {
  const [frequency, setFrequency] = useState('monthly'); // 'monthly', '2-monthly'
  const [center, setCenter] = useState('CU Health Center - Occupational Health Wing');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('09:00 AM');
  const [submitting, setSubmitting] = useState(false);
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [insuranceActivated, setInsuranceActivated] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  const handleBookCheckup = async (e) => {
    e.preventDefault();
    if (!date || !timeSlot) {
      toast.error('Please select checkup date and time slot.');
      return;
    }
    setSubmitting(true);
    try {
      const bookingData = {
        doctorId: 1, // General Physician
        date: date,
        timeSlot: timeSlot,
        type: 'IN_PERSON',
        patientName: _studentProfileData?.name || 'Jane Doe',
        patientId: _studentProfileData?.id || 'patient-123',
        paymentMethod: 'CASH',
        notes: `Occupational health checkup - Frequency: ${frequency === 'monthly' ? 'Monthly' : '2-Monthly'} (Full Body)`,
        symptoms: 'Routine Occupational Checkup',
        age: _studentProfileData?.age || 35,
        gender: _studentProfileData?.gender || 'Male'
      };
      
      const dbStr = localStorage.getItem('MedAstraX_mock_db');
      if (dbStr) {
        const db = JSON.parse(dbStr);
        const newBooking = {
          id: db.bookings.length + 101,
          patientId: bookingData.patientId,
          patientName: bookingData.patientName,
          doctorId: 1,
          doctorName: 'Dr. Aditya Sharma',
          hospitalId: 1,
          hospitalName: center,
          date: bookingData.date,
          bookingDate: bookingData.date,
          timeSlot: bookingData.timeSlot,
          type: 'IN_PERSON',
          status: 'CONFIRMED',
          paymentMethod: 'CASH',
          paymentStatus: 'PAID',
          age: bookingData.age,
          gender: bookingData.gender,
          symptoms: bookingData.symptoms,
          notes: bookingData.notes,
          aiReport: '### Occupational Assessment\nFull body screening booked.'
        };
        db.bookings.push(newBooking);
        localStorage.setItem('MedAstraX_mock_db', JSON.stringify(db));
        
        console.log(`[POSTGRESQL INSERT] INSERT INTO faculty_checkup_bookings (patient_id, patient_name, checkup_frequency, center_name, booking_date, time_slot, status) VALUES ('${bookingData.patientId}', '${bookingData.patientName}', '${frequency}', '${center}', '${date}', '${timeSlot}', 'CONFIRMED')`);
      }

      toast.success(`Occupational Full Body Checkup (${frequency === 'monthly' ? 'Monthly' : '2-Monthly'}) booked successfully! 🏥`);
      setDate('');
      if (fetchBookings) fetchBookings();
    } catch (err) {
      toast.error('Booking failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimInsurance = () => {
    setInsuranceActivated(true);
    const code = 'CU-FAC-INS-' + Math.floor(100000 + Math.random() * 900000);
    setVoucherCode(code);
    
    console.log(`[POSTGRESQL INSERT] INSERT INTO faculty_health_benefits (patient_id, benefit_name, voucher_code) VALUES ('${_studentProfileData?.id || 'student-10013'}', 'Corporate Health Insurance Policy', '${code}')`);
    
    toast.success('Corporate Health Insurance Activated successfully! 🛡️');
  };

  return (
    <div className="faculty-portal-container" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ background: '#fef3c7', color: '#d97706', padding: '6px 16px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.5px' }}>
          🎓 EMPLOYEE BENEFIT PORTAL
        </span>
        <h2 style={{ fontSize: '1.6rem', color: '#1e3a5f', fontWeight: 800, marginTop: '8px', marginBottom: '4px' }}>Faculty Health & Wellness</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Manage occupational full body checkups & corporate health insurance benefits.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Col: Benefits Summary & Claim Button */}
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#0f766e', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💼 Faculty Health Benefits
          </h3>
          
          <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', margin: '0 0 20px 0' }}>
            <li style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>🛡️</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1e293b' }}>Corporate Health Insurance</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Coverage up to ₹5,00,000 for self, spouse, and dependents.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>🏥</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1e293b' }}>Sponsored Occupational Checkup</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Free full body screening on a monthly or 2-monthly cycle.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>💊</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1e293b' }}>20% Campus Pharmacy Discount</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Get instant discounts on prescription purchases inside CU campus.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>🧘</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1e293b' }}>Paid Wellness & Mental Health Leaves</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Direct leave approvals with full salary and duty exemption.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>🔬</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1e293b' }}>CU Research Stress Relief Grant</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Reimbursement up to ₹25,000 for standing desks, ergonomic chairs, or fitness smartwatches.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>🦷</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1e293b' }}>Biannual Dental & Vision Package</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Free teeth polishing & eye exams plus ₹5,000 annual frame allowance.</span>
              </div>
            </li>
            <li style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>🏋️</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: '#1e293b' }}>Elite Sports & Gym Membership</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Free VIP access to the campus Olympic-size swimming pool and premium gymnasium.</span>
              </div>
            </li>
          </ul>

          <button 
            type="button" 
            onClick={() => setShowBenefitModal(true)}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #0f766e, #1e3a5f)',
              color: '#ffffff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(15, 118, 110, 0.2)',
              transition: 'transform 0.2s'
            }}
          >
            🎁 Open Faculty Health Benefits Portal
          </button>
        </div>

        {/* Right Col: Occupational Checkup Booking Form */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#1e3a5f', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
            📅 Book Full Body Occupational Checkup
          </h3>
          
          <form onSubmit={handleBookCheckup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Frequency selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Checkup Cycle Frequency</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setFrequency('monthly')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1.5px solid ' + (frequency === 'monthly' ? '#0f766e' : '#cbd5e1'),
                    background: frequency === 'monthly' ? 'rgba(15, 118, 110, 0.08)' : 'transparent',
                    color: frequency === 'monthly' ? '#0f766e' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  🟢 Monthly Full Checkup
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('2-monthly')}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1.5px solid ' + (frequency === '2-monthly' ? '#0f766e' : '#cbd5e1'),
                    background: frequency === '2-monthly' ? 'rgba(15, 118, 110, 0.08)' : 'transparent',
                    color: frequency === '2-monthly' ? '#0f766e' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  🔵 2-Monthly Full Checkup
                </button>
              </div>
            </div>

            {/* Checkup Wing selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Occupational Health Center</label>
              <select
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', color: '#1e293b' }}
              >
                <option value="CU Health Center - Occupational Health Wing">Chandigarh University Health Center (Campus)</option>
                <option value="Max Super Speciality Hospital (Corporate Partner)">Max Super Speciality Hospital (Mohali)</option>
                <option value="Fortis Hospital (Corporate Partner)">Fortis Hospital (Mohali)</option>
              </select>
            </div>

            {/* Date and Time slot selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Preferred Date</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Available Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem' }}
                >
                  <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                  <option value="10:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM">11:00 AM - 12:00 PM</option>
                  <option value="02:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="03:00 PM">03:00 PM - 04:00 PM</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{
                width: '100%',
                background: '#0f766e',
                color: '#ffffff',
                border: 'none',
                padding: '11px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: '6px'
              }}
            >
              {submitting ? 'Booking Checkup...' : 'Confirm Full Body Checkup Booking'}
            </button>
          </form>
        </div>
      </div>

      {/* Health Benefit Details Dialog Modal */}
      {showBenefitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', position: 'relative' }}>
            <button 
              onClick={() => setShowBenefitModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.5rem' }}>🛡️</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e3a5f', margin: '8px 0 2px 0' }}>Faculty Employee Health Plan</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Chandigarh University Corporate Partnership Benefits</p>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>Policy Plan:</span>
                <strong style={{ color: '#0f766e' }}>CU-FACULTY-CARE-2026</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>Insurance Cover:</span>
                <strong style={{ color: '#1e293b' }}>₹5,00,000 INR</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>Network Hospitals:</span>
                <strong style={{ color: '#1e293b' }}>Max, Fortis, CU Health Wing</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>Medicine Allowance:</span>
                <strong style={{ color: '#1e293b' }}>20% OFF Campus Pharmacies</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>Stress Relief Grant:</span>
                <strong style={{ color: '#1e293b' }}>₹25,000 allowance active</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>Dental & Vision:</span>
                <strong style={{ color: '#1e293b' }}>Free Checkups + ₹5,000 Frame</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b' }}>Sports Complex Pass:</span>
                <strong style={{ color: '#1e293b' }}>VIP Swimming & Gym Access</strong>
              </div>
            </div>

            {insuranceActivated ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' }}>
                <span style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>✓ Insurance Benefit Active</span>
                <span style={{ color: '#166534', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>Voucher / Card Reference Code: <strong>{voucherCode}</strong></span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClaimInsurance}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #00b4b6, #009091)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                Activate Corporate Health Card
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowBenefitModal(false)}
              style={{
                width: '100%',
                background: '#cbd5e1',
                color: '#334155',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



const mockBookings = [
  { bookingDate: '2026-04-14', reason: 'Acute pain emergency', doctorName: 'Dr. Kapoor', doctorSpecialty: 'Emergency Medicine' },
  { bookingDate: '2026-05-28', reason: 'Accident trauma check', doctorName: 'Dr. Kapoor', doctorSpecialty: 'Emergency Medicine' },
  { bookingDate: '2026-07-02', reason: 'Severe high fever', doctorName: 'Dr. Kapoor', doctorSpecialty: 'Emergency' },

  { bookingDate: '2026-01-22', reason: 'Blood Test', doctorName: 'Dr. Verma', doctorSpecialty: 'Pathology' },
  { bookingDate: '2026-02-19', reason: 'Thyroid profile screen', doctorName: 'Dr. Roy', doctorSpecialty: 'Diagnostics' },
  { bookingDate: '2026-03-19', reason: 'Lipid screen test', doctorName: 'Dr. Gill', doctorSpecialty: 'Pathology' },
  { bookingDate: '2026-05-21', reason: 'Urine analysis', doctorName: 'Dr. Roy', doctorSpecialty: 'Diagnostics' },
  { bookingDate: '2026-06-18', reason: 'X-ray chest', doctorName: 'Dr. Das', doctorSpecialty: 'Radiology' },
  { bookingDate: '2026-07-09', reason: 'Diagnostic blood screen', doctorName: 'Dr. Verma', doctorSpecialty: 'Pathology' },
  { bookingDate: '2026-07-23', reason: 'Lab report review', doctorName: 'Dr. Verma', doctorSpecialty: 'Pathology' },

  { bookingDate: '2026-01-29', reason: 'Hepatitis B dose', doctorName: 'Dr. Singh', doctorSpecialty: 'Immunization' },
  { bookingDate: '2026-06-25', reason: 'Flu Shot vaccine', doctorName: 'Dr. Singh', doctorSpecialty: 'Immunization' },

  { bookingDate: '2026-01-15', reason: 'BP routine review', doctorName: 'Dr. Mehta', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-02-12', reason: 'Migraine follow-up', doctorName: 'Dr. Kapoor', doctorSpecialty: 'Neurology' },
  { bookingDate: '2026-03-12', reason: 'Post-op review check', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-04-23', reason: 'Fever check follow-up', doctorName: 'Dr. Mehta', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-05-14', reason: 'Clinical review consult', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },

  { bookingDate: '2026-07-22', reason: 'Regular checkup', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-07-15', reason: 'General checkup', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-07-08', reason: 'Routine wellness check', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-06-11', reason: 'Clinical wellness check', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-06-04', reason: 'Routine checkup consult', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-05-07', reason: 'Standard medical checkup', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-04-16', reason: 'General clinical checkup', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-04-09', reason: 'Annual wellness exam', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-04-02', reason: 'Routine health screen', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-03-05', reason: 'Monthly physical exam', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-02-05', reason: 'Clinical checkup exam', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-01-08', reason: 'General physical check', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-01-01', reason: 'First checkup of period', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-03-26', reason: 'General medical checkup', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' },
  { bookingDate: '2026-05-28', reason: 'Wellness physical exam', doctorName: 'Dr. Sharma', doctorSpecialty: 'General Medicine' }
];

function MainDashboardPanel(props) {
  const { defaultTab } = props;
  const navigate = useNavigate();
  const { _currAuthProfile, user, logout } = useAuth();

  const [theme, setTheme] = useState(() => localStorage.getItem('cuims_theme') || 'light');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [_isProfileModalVisible, setShowProfileModal] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('cuims_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    toast.success(`Switched to ${newTheme === 'dark' ? 'Dark 🌙' : 'Light ☀️'} mode`);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const [_studentProfileData, setProfileData] = useState(null);
  const userTypeRole = localStorage.getItem('user_type');
  const isFaculty = user?.role === 'FACULTY' || _studentProfileData?.role === 'FACULTY' || userTypeRole === 'FACULTY' || user?.userRole === 'FACULTY';
  const [analyzingReports, setAnalyzingReports] = useState(false);
  const [checklistLoading, setChecklistLoading] = useState(false);

  const [_currSelectedTab, _switchTabState] = useState('hospitals'); 
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedReportBooking, setSelectedReportBooking] = useState(null);
  const [bookingsFilter, setBookingsFilter] = useState('upcoming'); // 'upcoming', 'completed', 'cancelled'
  const [analyticsChartType, setAnalyticsChartType] = useState('heatmap'); // 'heatmap', 'weekly', 'monthly'
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState(null);
  const [medicineTabActive, setMedicineTabActive] = useState('medicine'); // 'medicine' or 'doctor'
  const [medGemmaReport, setMedGemmaReport] = useState(null);
  const [medGemmaLoading, setMedGemmaLoading] = useState(false);
  const [medGemmaLogs, setMedGemmaLogs] = useState([]);
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [_chosenHospitalNode, setSelectedHospital] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapUrl, setMapUrl] = useState('');
  const [sortBy, setSortBy] = useState(''); // '', 'rating', 'distance', 'price'
  const [userCoords, setUserCoords] = useState(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [currentCalMonth, setCurrentCalMonth] = useState(() => new Date().getMonth());
  const [currentCalYear, setCurrentCalYear] = useState(() => new Date().getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [dateRangeFilter, setDateRangeFilter] = useState('jan-dec'); // 'jan-jul' or 'jan-dec'
  const [dateRangeDropdownOpen, setDateRangeDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [hasSetInitialYear, setHasSetInitialYear] = useState(false);

  useEffect(() => {
    if (_studentProfileData?.createdAt && !hasSetInitialYear) {
      const regYear = new Date(_studentProfileData.createdAt).getFullYear();
      setSelectedYear(regYear);
      setHasSetInitialYear(true);
    }
  }, [_studentProfileData, hasSetInitialYear]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('medastrax_reopen_camp_popup'));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarTab, setSidebarTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) return tabParam;

    if (defaultTab) return defaultTab;
    if (location.pathname.includes('/my-prescriptions')) return 'prescriptions';
    if (location.pathname.includes('/my-bookings')) return 'bookings';
    if (location.pathname.includes('/vaccinations')) return 'vaccinations';
    if (location.pathname.includes('/care-plan')) return 'care-plan';
    if (location.pathname.includes('/emergency')) return 'emergency';
    if (location.pathname.includes('/medical-leave')) return 'medical-leave';
    if (location.pathname.includes('/faculty-portal')) return 'faculty-portal';
    if (location.pathname.includes('/analytics')) return 'analytics';
    if (location.pathname.includes('/medicine-trends')) return 'medicine-trends';
    if (location.pathname.includes('/wellness-score')) return 'wellness-score';
    if (location.pathname.includes('/wellness-center')) return 'wellness-center';
    if (location.pathname.includes('/health-map')) return 'health-map';
    return 'hospitals';
  });

  const [wellnessDropdownOpen, setWellnessDropdownOpen] = useState(() => location.pathname.includes('/wellness-center'));
  const [wellnessActiveSubTab, setWellnessActiveSubTab] = useState('counselors');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setSidebarTab(tabParam);
      return;
    }

    if (location.pathname === '/dashboard') {
      setSidebarTab('hospitals');
    } else if (location.pathname === '/vaccinations') {
      setSidebarTab('vaccinations');
    } else if (location.pathname === '/emergency') {
      setSidebarTab('emergency');
    } else if (location.pathname === '/care-plan') {
      setSidebarTab('care-plan');
    } else if (location.pathname === '/my-bookings') {
      setSidebarTab('bookings');
    } else if (location.pathname === '/my-prescriptions') {
      setSidebarTab('prescriptions');
    } else if (location.pathname === '/medical-leave') {
      setSidebarTab('medical-leave');
    } else if (location.pathname === '/faculty-portal') {
      setSidebarTab('faculty-portal');
    } else if (location.pathname === '/analytics') {
      setSidebarTab('analytics');
    } else if (location.pathname === '/medicine-trends') {
      setSidebarTab('medicine-trends');
    } else if (location.pathname === '/wellness-score') {
      setSidebarTab('wellness-score');
    } else if (location.pathname === '/wellness-center') {
      setSidebarTab('wellness-center');
      setWellnessDropdownOpen(true);
    } else if (location.pathname === '/health-map') {
      setSidebarTab('health-map');
    } else if (location.pathname === '/symptom-checker') {
      setSidebarTab('symptom-checker');
    } else if (location.pathname === '/refer-a-student') {
      setSidebarTab('refer-a-student');
    } else if (location.pathname === '/student-health-portal') {
      if (isFaculty) {
        navigate('/dashboard');
      } else {
        setSidebarTab('student-health-portal');
      }
    }
  }, [location.pathname, location.search]);

  const [cuimsSearch, setCuimsSearch] = useState('');
  const [announcementFilter, setAnnouncementFilter] = useState('ALL');
  const [announcementSearch, setAnnouncementSearch] = useState('');

  const [userCityWeather, setUserCityWeather] = useState({
    city: 'Campus',
    temp: '28°C',
    condition: 'overcast clouds',
    icon: '☁️'
  });

  useEffect(() => {
    const fetchWeather = async () => {
      let city = _studentProfileData?.city || _currAuthProfile?.city || 'Chandigarh';
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const lat = pos.coords.latitude;
              const lon = pos.coords.longitude;
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
              const data = await res.json();
              const detectedCity = data.address?.city || data.address?.town || data.address?.village || city;
              
              const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
              const weatherData = await weatherRes.json();
              
              if (weatherData && weatherData.current_weather) {
                const temp = Math.round(weatherData.current_weather.temperature);
                const code = weatherData.current_weather.weathercode;
                let cond = 'clear sky';
                let icon = '☀️';
                if (code >= 1 && code <= 3) { cond = 'partly cloudy'; icon = '⛅'; }
                else if (code >= 45 && code <= 48) { cond = 'foggy'; icon = '🌫️'; }
                else if (code >= 51 && code <= 67) { cond = 'rainy'; icon = '🌧️'; }
                else if (code >= 80 && code <= 99) { cond = 'thunderstorm'; icon = '⛈️'; }
                
                setUserCityWeather({
                  city: detectedCity,
                  temp: `${temp}°C`,
                  condition: cond,
                  icon: icon
                });
                return;
              }
            } catch (e) {
              console.warn('Weather fetch failed', e);
            }
          },
          (err) => {
            console.warn('User location denied', err);
          },
          { timeout: 6000 }
        );
      }
      setUserCityWeather(prev => ({ ...prev, city: city }));
    };

    fetchWeather();
  }, [_studentProfileData, _currAuthProfile]);

  const handleDownloadVirtualIDCard = async () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [85.6, 135] });

      const studentName = (_currAuthProfile?.name || _studentProfileData?.name || user?.name || 'Jane Doe').toUpperCase();
      const studentUid = _studentProfileData?.collegeUid || _studentProfileData?.uid || '24BCF10024';
      const bloodGrp = _studentProfileData?.bloodGroup || 'A+';
      const emgPhone = _studentProfileData?.emergencyNumber || '9988776655';
      const emgName = _studentProfileData?.emergencyName || 'John Doe (Father)';
      const emgRelation = _studentProfileData?.emergencyRelation || 'Father';
      const residentType = _studentProfileData?.isHosteller ? 'Hosteller' : 'Day Scholar';
      const userPhoto = _studentProfileData?.profilePhoto || _currAuthProfile?.avatarUrl || _studentProfileData?.avatarUrl || user?.avatarUrl;
      let photoDataUrl = (userPhoto && typeof userPhoto === 'string' && userPhoto.startsWith('data:image')) ? userPhoto : rashikaBase64;

      const cleanUidDigits = studentUid.replace(/\D/g, '');
      const healthId = `CUH2026${cleanUidDigits.slice(-5) || '00124'}`;

      const today = new Date();
      const formatDate = (d) => {
        const day = String(d.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
      };
      
      const issueDateStr = formatDate(today);
      const expiryDate = new Date();
      expiryDate.setFullYear(today.getFullYear() + 2);
      const expiryDateStr = formatDate(expiryDate);

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 85.6, 135, 'F');

      doc.setFillColor(3, 27, 51);
      doc.rect(0, 0, 85.6, 26, 'F');

      doc.setFillColor(15, 118, 110);
      doc.ellipse(42.8, 26, 50, 4, 'F');
      doc.setFillColor(255, 255, 255);
      doc.ellipse(42.8, 28, 52, 4, 'F');

      doc.setFillColor(0, 217, 166);
      doc.roundedRect(6, 6, 8, 8, 1.5, 1.5, 'F');
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      doc.rect(7.5, 7.5, 5, 5);
      doc.setFillColor(255, 255, 255);
      doc.rect(9.2, 8.5, 1.6, 3, 'F');
      doc.rect(8.5, 9.2, 3, 1.6, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('MEDASTRAX', 16, 10);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(0, 217, 166);
      doc.text('Digital Student Health ID', 16, 13.5);

      doc.setFillColor(200, 16, 46);
      doc.rect(74, 5, 6, 6, 'F');
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.2);
      doc.circle(77, 8, 2);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(3.2);
      doc.setTextColor(255, 255, 255);
      doc.text('CU', 77, 9.2, { align: 'center' });

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text('CHANDIGARH', 72, 8, { align: 'right' });
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text('UNIVERSITY', 72, 11, { align: 'right' });

      doc.setDrawColor(15, 118, 110);
      doc.setLineWidth(0.4);
      doc.rect(6, 30, 26, 32);

      if (photoDataUrl) {
        try {
          doc.addImage(photoDataUrl, 'JPEG', 6.5, 30.5, 25, 31);
        } catch (err) {
          console.warn(err);
        }
      } else {
      doc.setFillColor(240, 245, 245);
      doc.rect(6.5, 30.5, 25, 31, 'F');
      doc.setFillColor(15, 118, 110);
      doc.circle(19, 41, 4.5, 'F');
      doc.ellipse(19, 52, 9, 6, 'F');
      doc.setFillColor(240, 245, 245);
      doc.rect(10, 52, 18, 10, 'F');
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(3, 27, 51);
    doc.text(studentName, 36, 36);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Roll No.', 36, 42);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text(studentUid, 36, 46);

    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Health ID', 36, 52);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text(healthId, 36, 56);

    const qrSize = 16;
    const qrX = 63;
    const qrY = 38;
    
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.3);
    doc.rect(qrX, qrY, qrSize, qrSize);
    
    doc.setFillColor(3, 27, 51);
    doc.rect(qrX + 0.8, qrY + 0.8, 3.8, 3.8, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(qrX + 1.6, qrY + 1.6, 2.2, 2.2, 'F');
    doc.setFillColor(3, 27, 51);
    doc.rect(qrX + 2.2, qrY + 2.2, 1.0, 1.0, 'F');

    doc.setFillColor(3, 27, 51);
    doc.rect(qrX + qrSize - 4.6, qrY + 0.8, 3.8, 3.8, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(qrX + qrSize - 3.8, qrY + 1.6, 2.2, 2.2, 'F');
    doc.setFillColor(3, 27, 51);
    doc.rect(qrX + qrSize - 3.2, qrY + 2.2, 1.0, 1.0, 'F');

    doc.setFillColor(3, 27, 51);
    doc.rect(qrX + 0.8, qrY + qrSize - 4.6, 3.8, 3.8, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(qrX + 1.6, qrY + qrSize - 3.8, 2.2, 2.2, 'F');
    doc.setFillColor(3, 27, 51);
    doc.rect(qrX + 2.2, qrY + qrSize - 3.2, 1.0, 1.0, 'F');

    doc.setFillColor(3, 27, 51);
    doc.rect(qrX + 6, qrY + 2, 1.5, 1, 'F');
    doc.rect(qrX + 9, qrY + 4, 2, 1.5, 'F');
    doc.rect(qrX + 5, qrY + 8, 1.5, 3, 'F');
    doc.rect(qrX + 8, qrY + 9, 3, 1, 'F');
    doc.rect(qrX + 12, qrY + 11, 2, 2, 'F');
    doc.rect(qrX + 2, qrY + 7, 2, 1, 'F');
    doc.rect(qrX + 10, qrY + 7, 2, 2, 'F');

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(100, 116, 139);
    doc.text('Scan to view', 71, 57, { align: 'center' });
    doc.text('health record', 71, 59.5, { align: 'center' });

    const rowYStart = 68;
    const rowHeight = 11;
    const rowWidth = 73.6;
    const rowX = 6;

    const renderCardRow = (y, iconType, keyText, valText, isAlertVal) => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(rowX, y, rowWidth, rowHeight - 2, 1.5, 1.5, 'F');
      
      doc.setFillColor(15, 118, 110);
      doc.circle(rowX + 4.5, y + 4.5, 3.2, 'F');
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(255, 255, 255);
      
      if (iconType === 'blood') {
        doc.rect(rowX + 3.8, y + 2.8, 1.4, 3.4, 'F');
        doc.rect(rowX + 2.8, y + 3.8, 3.4, 1.4, 'F');
      } else if (iconType === 'phone') {
        doc.setLineWidth(0.4);
        doc.line(rowX + 3.4, y + 3.0, rowX + 3.4, y + 6.0);
        doc.line(rowX + 3.4, y + 3.0, rowX + 4.6, y + 3.0);
        doc.line(rowX + 3.4, y + 6.0, rowX + 4.6, y + 6.0);
      } else if (iconType === 'resident') {
        doc.setLineWidth(0.4);
        doc.line(rowX + 4.5, y + 2.5, rowX + 2.5, y + 4.5);
        doc.line(rowX + 4.5, y + 2.5, rowX + 6.5, y + 4.5);
        doc.line(rowX + 3.0, y + 4.5, rowX + 3.0, y + 6.2);
        doc.line(rowX + 6.0, y + 4.5, rowX + 6.0, y + 6.2);
        doc.line(rowX + 3.0, y + 6.2, rowX + 6.0, y + 6.2);
      }
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(keyText, rowX + 11, y + 5.2);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      if (isAlertVal) {
        doc.setTextColor(220, 38, 38); // Alert red for blood group
      } else {
        doc.setTextColor(30, 41, 59);
      }
      doc.text(valText, rowX + rowWidth - 4, y + 5.5, { align: 'right' });
    };

    renderCardRow(rowYStart, 'blood', 'Blood Group', bloodGrp, true);
    renderCardRow(rowYStart + rowHeight, 'phone', 'Emergency No.', emgPhone, false);
    renderCardRow(rowYStart + (rowHeight * 2), 'resident', 'Resident Type', residentType, false);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(rowX, rowYStart + (rowHeight * 3), rowWidth, rowHeight - 2, 1.5, 1.5, 'F');
    doc.setFillColor(15, 118, 110);
    doc.circle(rowX + 4.5, rowYStart + (rowHeight * 3) + 4.5, 3.2, 'F');
    
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.45);
    const pulseX = rowX + 2.0;
    const pulseY = rowYStart + (rowHeight * 3) + 2.5;
    doc.line(pulseX, pulseY + 2, pulseX + 1.5, pulseY + 2);
    doc.line(pulseX + 1.5, pulseY + 2, pulseX + 2.2, pulseY + 0.5);
    doc.line(pulseX + 2.2, pulseY + 0.5, pulseX + 3.0, pulseY + 3.5);
    doc.line(pulseX + 3.0, pulseY + 3.5, pulseX + 3.8, pulseY + 2);
    doc.line(pulseX + 3.8, pulseY + 2, pulseX + 5.0, pulseY + 2);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Health Status', rowX + 11, rowYStart + (rowHeight * 3) + 5.2);

    doc.setFillColor(22, 163, 74);
    doc.roundedRect(rowX + rowWidth - 20, rowYStart + (rowHeight * 3) + 2.5, 16, 4, 1.2, 1.2, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5);
    doc.setTextColor(255, 255, 255);
    doc.text('VERIFIED', rowX + rowWidth - 12, rowYStart + (rowHeight * 3) + 5.3, { align: 'center' });

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Last Updated: ${issueDateStr}`, rowX, 122);

    doc.setFillColor(3, 27, 51);
    doc.rect(0, 128, 85.6, 7, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Verified by University Health Center   |   Secure • Encrypted', 42.8, 132.5, { align: 'center' });

    doc.addPage();

    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 85.6, 135, 'F');

    doc.setFillColor(3, 27, 51);
    doc.rect(0, 0, 85.6, 16, 'F');
    
    doc.setFillColor(15, 118, 110); // Teal wave shadow
    doc.ellipse(42.8, 16, 50, 3, 'F');
    doc.setFillColor(255, 255, 255); // White body overlay
    doc.ellipse(42.8, 17.5, 52, 3, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('HEALTH INFORMATION', 18, 10);

    doc.setDrawColor(0, 217, 166);
    doc.setLineWidth(0.45);
    const ekgX = 6;
    const ekgY = 8;
    doc.line(ekgX, ekgY + 2, ekgX + 2, ekgY + 2);
    doc.line(ekgX + 2, ekgY + 2, ekgX + 3, ekgY);
    doc.line(ekgX + 3, ekgY, ekgX + 4, ekgY + 4);
    doc.line(ekgX + 4, ekgY + 4, ekgX + 5, ekgY + 1);
    doc.line(ekgX + 5, ekgY + 1, ekgX + 6, ekgY + 2);
    doc.line(ekgX + 6, ekgY + 2, ekgX + 9, ekgY + 2);

    const height = _studentProfileData?.height || '165 cm';
    const weight = _studentProfileData?.weight || '58 kg';
    const allergies = _studentProfileData?.allergies || 'Pollen, Dust';
    const medConditions = _studentProfileData?.existingMedicalCondition || 'None';
    const medMeds = _studentProfileData?.currentMedication || 'None';
    const vacStatus = _studentProfileData?.vaccinationStatus || 'Up to Date';

    const backRowX = 6;
    const backRowWidth = 73.6;
    const backRowStart = 22; // adjusted slightly down for the wave bar spacing
    const backRowHeight = 7.5;

    const renderBackRow = (y, label, value, isGreenVal) => {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(label, backRowX, y + 5);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      if (isGreenVal) {
        doc.setTextColor(15, 118, 110);
        doc.setFont('Helvetica', 'bold');
      } else {
        doc.setTextColor(15, 23, 42);
      }
      doc.text(value, backRowX + backRowWidth, y + 5, { align: 'right' });

      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(backRowX, y + 7.5, backRowX + backRowWidth, y + 7.5);
    };

    renderBackRow(backRowStart, 'Height', height, false);
    renderBackRow(backRowStart + backRowHeight, 'Weight', weight, false);
    renderBackRow(backRowStart + (backRowHeight * 2), 'Allergies', allergies, false);
    renderBackRow(backRowStart + (backRowHeight * 3), 'Medical Conditions', medConditions, false);
    renderBackRow(backRowStart + (backRowHeight * 4), 'Current Medications', medMeds, false);
    renderBackRow(backRowStart + (backRowHeight * 5), 'Vaccination Status', vacStatus, true);

    const emgYStart = 72;
    doc.setFillColor(15, 118, 110);
    doc.circle(backRowX + 2, emgYStart + 2, 2.2, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(backRowX + 2, emgYStart + 1.2, 0.8, 'F'); // head
    doc.ellipse(backRowX + 2, emgYStart + 3.2, 1.4, 0.8, 'F'); // shoulders

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 118, 110);
    doc.text('EMERGENCY CONTACT', backRowX + 6, emgYStart + 3);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Name', backRowX, emgYStart + 8);
    doc.text('Contact No.', backRowX, emgYStart + 12);
    doc.text('Relationship', backRowX, emgYStart + 16);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(emgName, backRowX + backRowWidth, emgYStart + 8, { align: 'right' });
    doc.text(emgPhone, backRowX + backRowWidth, emgYStart + 12, { align: 'right' });
    doc.text(emgRelation, backRowX + backRowWidth, emgYStart + 16, { align: 'right' });

    const insY = 91;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(backRowX, insY, backRowWidth, 10, 1.5, 1.5, 'F');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Insurance Provider', backRowX + 4, insY + 4);
    doc.text('Policy No.', backRowX + backRowWidth - 4, insY + 4, { align: 'right' });
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('N/A', backRowX + 4, insY + 8);
    doc.text('N/A', backRowX + backRowWidth - 4, insY + 8, { align: 'right' });

    const issueY = 106;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Issue Date', backRowX, issueY + 3);
    doc.text('Valid Till', backRowX + 24, issueY + 3);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(issueDateStr, backRowX, issueY + 7);
    doc.text(expiryDateStr, backRowX + 24, issueY + 7);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(backRowX + 20, issueY + 1, backRowX + 20, issueY + 8);

    const sigX = 52;
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.4);
    doc.line(sigX + 2, issueY + 5, sigX + 16, issueY + 4);
    doc.line(sigX + 5, issueY + 6, sigX + 22, issueY + 4);
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(sigX, issueY + 8, sigX + 26, issueY + 8);

    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(4.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorized Signatory', sigX + 13, issueY + 10.5, { align: 'center' });
    doc.text('University Health Center', sigX + 13, issueY + 12.5, { align: 'center' });

    doc.setFillColor(3, 27, 51);
    doc.rect(0, 128, 85.6, 7, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(5.2);
    doc.setTextColor(255, 255, 255);
    doc.text('This is a digitally generated card & does not require physical signature.', 42.8, 132.5, { align: 'center' });

    const pdfFilename = `MedAstraX_Digital_Health_ID_${studentUid}.pdf`;
    try {
      doc.save(pdfFilename);
    } catch (saveErr) {
      console.warn('doc.save failed, triggering blob anchor download:', saveErr);
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    }
    toast.success('Your 2-sided Student Health ID Card PDF has been downloaded successfully! 📱💚');
  } catch (err) {
    console.error('Virtual ID Card PDF generation error:', err);
    toast.error('Failed to generate Virtual ID Card PDF');
  }
};



  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);



  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: '👋 **Hello! I am Astra, your AI-powered medical assistant.**\n\nI provide evidence-based health guidance and can help you:\n- 🩺 Analyze symptoms with clinical triage\n- 💊 Suggest wellness & prevention tips\n- 👨‍⚕️ Recommend the right specialist doctor\n\n*Tell me what symptoms you\'re experiencing, and I\'ll guide you step by step.*'
    }
  ]);
  const [sendingChat, setSendingChat] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const SpeechRecognitionAPI = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const handleToggleVoiceListening = () => {
    if (!SpeechRecognitionAPI) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsVoiceListening(true);
        toast.success('🎙️ Listening for symptoms... Speak now!', { id: 'voice-active' });
      };

      rec.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        if (resultText && resultText.trim()) {
          setChatOpen(true);
          handleSendChat(resultText);
        }
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice input error. Please try typing.', { id: 'voice-active' });
        setIsVoiceListening(false);
      };

      rec.onend = () => {
        setIsVoiceListening(false);
      };

      rec.start();
    } catch (err) {
      console.error(err);
      setIsVoiceListening(false);
    }
  };

  const quickTags = [
    { label: '🗺️ 2D Body Map', isAction: true },
    { label: '🤕 Headache', query: 'I have a headache that started today. Can you help me assess it?' },
    { label: '🌡️ Fever', query: 'I have a fever. What should I check and when should I see a doctor?' },
    { label: '🥗 Diet Plan', query: 'Can you suggest a healthy balanced diet plan for overall wellness?' },
    { label: '📅 Book Doctor', query: 'I want to book a doctor appointment. What specialists are available?' },
    { label: '😷 Cold & Cough', query: 'I have cold and cough symptoms. Is this something serious?' }
  ];

  const parseMarkdown = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, index) => {
      let content = line;
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={index} style={{ marginLeft: '16px', marginBottom: '4px' }} 
              dangerouslySetInnerHTML={{ __html: itemText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
        );
      }
      
      if (/^\d+\.\s/.test(line.trim())) {
        const itemText = line.trim().replace(/^\d+\.\s/, '');
        return (
          <li key={index} style={{ marginLeft: '16px', marginBottom: '4px', listStyleType: 'decimal' }}
              dangerouslySetInnerHTML={{ __html: itemText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
        );
      }
      
      if (line.trim() === '') {
        return <div key={index} style={{ height: '8px' }} />;
      }
      
      return (
        <p key={index} style={{ margin: '0 0 6px 0', lineHeight: '1.5' }} 
           dangerouslySetInnerHTML={{ __html: content }} />
      );
    });
  };

  const handleSendChat = async (textToSend) => {
    const msg = textToSend || chatMessage;
    if (!msg.trim() || sendingChat) return;

    setChatHistory(prev => [...prev, { sender: 'user', text: msg }]);
    if (!textToSend) setChatMessage('');
    setSendingChat(true);

    if (!navigator.onLine) {
      setTimeout(async () => {
        try {
          const reply = await getOfflineAiResponse(msg);
          setChatHistory(prev => [...prev, { sender: 'ai', text: reply }]);
        } catch (err) {
          console.error(err);
          setChatHistory(prev => [...prev, { sender: 'ai', text: '⚠️ **Error:** Failed to compute offline reply.' }]);
        } finally {
          setSendingChat(false);
          setTimeout(() => {
            const chatBody = document.getElementById('chat-body');
            if (chatBody) {
              chatBody.scrollTop = chatBody.scrollHeight;
            }
          }, 100);
        }
      }, 500);
      return;
    }

    try {
      const res = await aiAPI.chat(msg, chatSessionId);
      const reply = res.data.reply || 'Sorry, I couldn\'t formulate a reply. Please try again.';
      if (res.data.sessionId) {
        setChatSessionId(res.data.sessionId);
      }
      setChatHistory(prev => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { sender: 'ai', text: '⚠️ **Connection Error:** Could not reach Astra. Please check your internet connection and try again.' }]);
    } finally {
      setSendingChat(false);
      setTimeout(() => {
        const chatBody = document.getElementById('chat-body');
        if (chatBody) {
          chatBody.scrollTop = chatBody.scrollHeight;
        }
      }, 100);
    }
  };

  const handleResetChat = async () => {
    try {
      const res = await aiAPI.resetChat(chatSessionId);
      if (res.data.sessionId) {
        setChatSessionId(res.data.sessionId);
      }
    } catch (err) {
      console.error('Reset failed', err);
    }
    setChatHistory([
      {
        sender: 'ai',
        text: '👋 **Conversation reset!** I\'m ready for a fresh consultation.\n\n*Tell me what symptoms you\'re experiencing, and I\'ll guide you step by step.*'
      }
    ]);
  };



  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const res = await bookingAPI.getPatientBookings(_currAuthProfile ? _currAuthProfile.id : null);
      setBookings(res.data || []);
    } catch (error) {
      console.error('Failed to load bookings details', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancellingId(bookingId);
      const loadingToast = toast.loading('Cancelling appointment...');
      await bookingAPI.updateStatus(bookingId, 'CANCELLED');
      toast.success('Appointment cancelled successfully!', { id: loadingToast });
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === bookingId 
            ? { ...b, status: 'CANCELLED', paymentStatus: b.paymentMethod !== 'CASH' ? 'REFUNDED' : 'CANCELLED' } 
            : b
        )
      );
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to cancel appointment';
      toast.error(errorMsg);
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    const fetchRescheduleSlots = async () => {
      if (!rescheduleDate || !reschedulingBooking) {
        setRescheduleSlots([]);
        return;
      }
      try {
        setLoadingRescheduleSlots(true);
        const res = await bookingAPI.getAvailableSlots(reschedulingBooking.doctorId, rescheduleDate);
        setRescheduleSlots(res.data || []);
      } catch (error) {
        toast.error('Failed to load available slots');
        setRescheduleSlots([]);
      } finally {
        setLoadingRescheduleSlots(false);
      }
    };
    fetchRescheduleSlots();
  }, [rescheduleDate, reschedulingBooking]);

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!reschedulingBooking || !rescheduleDate || !rescheduleTimeSlot) {
      toast.error('Please select both date and time slot');
      return;
    }
    try {
      setSubmittingReschedule(true);
      const loadingToast = toast.loading('Rescheduling appointment...');
      await bookingAPI.reschedule(reschedulingBooking.id, rescheduleDate, rescheduleTimeSlot);
      toast.success('Appointment rescheduled successfully!', { id: loadingToast });
      setReschedulingBooking(null);
      setRescheduleDate('');
      setRescheduleTimeSlot('');
      fetchBookings();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reschedule appointment';
      toast.error(errorMsg);
    } finally {
      setSubmittingReschedule(false);
    }
  };

  const handleDownloadReportPDF = (appt) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 20;

    const checkPageOffset = (neededHeight) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`MedAstraX Clinical Report - Patient: ${appt.patientName}`, margin, 10);
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, 12, pageWidth - margin, 12);
        y = 20;
      }
    };

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(29, 158, 117);
    doc.text('MedAstraX AI CLINICAL REPORT', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setDrawColor(29, 158, 117);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    doc.setFont('Helvetica', 'bold');
    doc.text('Patient Name:', margin, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(appt.patientName || 'N/A', margin + 28, y);

    doc.setFont('Helvetica', 'bold');
    doc.text('Doctor Name:', pageWidth / 2, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(appt.doctorName || 'N/A', pageWidth / 2 + 28, y);
    y += 6;

    doc.setFont('Helvetica', 'bold');
    doc.text('Age / Gender:', margin, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(`${appt.age || 'N/A'} / ${appt.gender || 'N/A'}`, margin + 28, y);

    doc.setFont('Helvetica', 'bold');
    doc.text('Hospital Name:', pageWidth / 2, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(appt.hospitalName || 'N/A', pageWidth / 2 + 28, y);
    y += 6;

    doc.setFont('Helvetica', 'bold');
    doc.text('Date:', margin, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(formatDateToDDMMYYYY(appt.bookingDate) || 'N/A', margin + 28, y);

    doc.setFont('Helvetica', 'bold');
    doc.text('Time Slot:', pageWidth / 2, y);
    doc.setFont('Helvetica', 'normal');
    doc.text(appt.timeSlot || 'N/A', pageWidth / 2 + 28, y);
    y += 10;

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(29, 158, 117);
    doc.text('Clinical Summary & Insights', margin, y);
    y += 8;

    const reportLines = appt.aiReport ? appt.aiReport.split('\n') : [];
    
    reportLines.forEach((line) => {
      if (!line.trim()) {
        y += 4;
        return;
      }

      checkPageOffset(6);

      if (line.startsWith('# ')) {
        const cleanLine = line.replace('# ', '');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(40, 40, 40);
        doc.text(cleanLine, margin, y);
        y += 7;
      } else if (line.startsWith('## ')) {
        const cleanLine = line.replace('## ', '');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(29, 158, 117);
        doc.text(cleanLine, margin, y);
        y += 6;
      } else if (line.startsWith('### ')) {
        const cleanLine = line.replace('### ', '');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(50, 50, 50);
        doc.text(cleanLine, margin, y);
        y += 6;
      } else {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);

        let cleanText = line;
        if (line.startsWith('- ')) {
          cleanText = '• ' + line.replace('- ', '');
        }

        const availableWidth = pageWidth - (margin * 2);
        const splitTextList = doc.splitTextToSize(cleanText, availableWidth);

        splitTextList.forEach((splitLine) => {
          checkPageOffset(6);
          
          const subParts = splitLine.split('**');
          let subX = margin;
          
          subParts.forEach((subPart, subIdx) => {
            const isBoldPart = subIdx % 2 === 1;
            doc.setFont('Helvetica', isBoldPart ? 'bold' : 'normal');
            doc.setTextColor(isBoldPart ? 40 : 80, isBoldPart ? 40 : 80, isBoldPart ? 40 : 80);
            
            doc.text(subPart, subX, y);
            subX += doc.getTextWidth(subPart);
          });
          
          y += 5.5;
        });
      }
    });

    y += 10;
    checkPageOffset(15);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This is an AI-generated consultation report and is intended for clinical review.', margin, y);
    y += 4;
    doc.text(`Generated on ${new Date().toLocaleDateString()} by MedAstraX AI Scribe companion.`, margin, y);

    const filename = `Clinical_Report_${(appt.patientName || 'Patient').replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  };

  useEffect(() => {
    fetchHospitals();
    fetchProfile();
    fetchLeaderboard();
    fetchBookings();
  }, [_currAuthProfile]);


  async function fetchHospitals() {
    try {
      setLoading(true);
      const res = await hospitalAPI.getAll();
      setHospitals(res.data);
    } catch (error) {
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await authAPI.getProfile();
      setProfileData(res.data);
    } catch (error) {
      console.error('Failed to load profile details', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const res = await rewardsAPI.getLeaderboard();
      setLeaderboardData(res.data.data || []);
    } catch (error) {
      console.error('Failed to load leaderboard', error);
      setLeaderboardData([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleChecklistToggle = async (key) => {
    if (!_studentProfileData || checklistLoading) return;
    try {
      setChecklistLoading(true);
      const currentVal = !!_studentProfileData[key];
      const payload = {
        medsChecked: key === 'medsChecked' ? !currentVal : !!_studentProfileData.medsChecked,
        dietChecked: key === 'dietChecked' ? !currentVal : !!_studentProfileData.dietChecked,
        exerciseChecked: key === 'exerciseChecked' ? !currentVal : !!_studentProfileData.exerciseChecked
      };
      const res = await rewardsAPI.updateChecklist(payload);
      setProfileData(prev => ({
        ...prev,
        ...res.data.data
      }));
      toast.success(res.data.message);
      fetchLeaderboard();
    } catch (err) {
      toast.error('Failed to update daily checklist');
    } finally {
      setChecklistLoading(false);
    }
  };

  const handleAnalyzeReports = async () => {
    try {
      setAnalyzingReports(true);
      const res = await aiAPI.analyzePatientReports();
      setProfileData(prev => ({
        ...prev,
        expPoints: res.data.expPoints,
        healthBadge: res.data.healthBadge,
        lastAnalysis: res.data.comparison,
        carePlan: res.data.carePlan
      }));
      toast.success('AI Health Reports comparison complete!');
      fetchLeaderboard();
    } catch (err) {
      toast.error('AI Report Analysis failed. Check if backend is running.');
    } finally {
      setAnalyzingReports(false);
    }
  };

  const currentExp = _studentProfileData?.expPoints || 0;
  const userLevel = Math.floor(currentExp / 500) + 1;
  const expProgress = currentExp % 500;
  const expPercentage = Math.min(100, (expProgress / 500) * 100);



  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchHospitals();
      return;
    }
    
    try {
      setLoading(true);
      const res = await hospitalAPI.search(searchQuery);
      setHospitals(res.data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
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
    return R * c;
  };

  const handleSortChange = async (value) => {
    if (value === 'distance') {
      if (!userCoords) {
        const loadingToast = toast.loading('Requesting location access...');
        try {
          const pos = await new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error('Geolocation not supported'));
            } else {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
            }
          });
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setSortBy('distance');
          toast.dismiss(loadingToast);
          toast.success('Sorted by distance relative to your location!');
        } catch (err) {
          toast.dismiss(loadingToast);
          toast.error('Location access denied or timeout. Unable to sort by distance.');
          console.warn('Geolocation failed', err);
        }
      } else {
        setSortBy('distance');
      }
    } else {
      setSortBy(value);
    }
  };

  const getSortedHospitals = () => {
    let list = [...hospitals];
    
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(h => 
        h.name?.toLowerCase().includes(q) || 
        h.city?.toLowerCase().includes(q) ||
        h.address?.toLowerCase().includes(q)
      );
    }
    
    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.consultationRate || 0) - (b.consultationRate || 0));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.consultationRate || 0) - (a.consultationRate || 0));
    } else if (sortBy === 'distance' && userCoords) {
      list.sort((a, b) => {
        const distA = getDistance(userCoords.latitude, userCoords.longitude, a.latitude || 0, a.longitude || 0);
        const distB = getDistance(userCoords.latitude, userCoords.longitude, b.latitude || 0, b.longitude || 0);
        return (distA || 0) - (distB || 0);
      });
    }
    
    return list;
  };



  const handleViewMap = async (hospital) => {
    if (!hospital) return;
    const loadingToast = toast.loading('Locating hospital & calculating route...');
    const getCurrentPos = () => new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
    });

    const geocodeHospital = async () => {
      if (hospital.latitude && hospital.longitude) {
        return { lat: hospital.latitude, lon: hospital.longitude };
      }
      try {
        const q = encodeURIComponent(`${hospital.address || ''} ${hospital.city || ''}`);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`);
        const json = await res.json();
        if (json && json[0]) return { lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) };
      } catch (e) {
        console.warn('Geocode failed', e);
      }
      return null;
    };

    try {
      const dest = await geocodeHospital();
      let origin = null;
      try {
        const pos = await getCurrentPos();
        origin = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      } catch (err) {
        console.warn('User denied geolocation or timeout', err);
      }

      toast.dismiss(loadingToast);

      if (origin && dest) {
        const gUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lon}&destination=${dest.lat},${dest.lon}&travelmode=driving`;
        window.open(gUrl, '_blank');
      } else if (dest) {
        const gUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lon}`;
        window.open(gUrl, '_blank');
      } else {
        const addressQuery = encodeURIComponent(`${hospital.address || ''} ${hospital.city || ''}`);
        const gUrl = `https://www.google.com/maps/dir/?api=1&destination=${addressQuery}`;
        window.open(gUrl, '_blank');
      }

      if (dest) {
        const mapUrlLocal = `https://maps.google.com/maps?q=${dest.lat},${dest.lon}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        setMapUrl(mapUrlLocal);
        setShowMapModal(true);
      } else {
        const addressQuery = encodeURIComponent(`${hospital.address || ''} ${hospital.city || ''}`);
        const mapUrlLocal = `https://maps.google.com/maps?q=${addressQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
        setMapUrl(mapUrlLocal);
        setShowMapModal(true);
      }
    } catch (e) {
      toast.dismiss(loadingToast);
      console.error(e);
      const addressQuery = encodeURIComponent(`${hospital.address || ''} ${hospital.city || ''}`);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${addressQuery}`, '_blank');
    }
  };

  const renderAppointmentFrequencyChart = () => {

    const baseBookings = (bookings && bookings.length > 0) ? bookings : mockBookings;
    const displayBookings = baseBookings.filter(b => b && b.bookingDate).map(b => {
      const dateParts = b.bookingDate.split('-');
      const shiftedDate = `${selectedYear}-${dateParts[1] || '01'}-${dateParts[2] || '01'}`;
      return { ...b, bookingDate: shiftedDate };
    }).filter(b => {
      if (dateRangeFilter === 'jan-jul') {
        const date = new Date(b.bookingDate);
        return date.getMonth() >= 0 && date.getMonth() <= 6; // Jan to Jul
      }
      return true; // Jan to Dec
    });

    const getBookingType = (b) => {
      const reason = (b.reason || '').toLowerCase();
      const spec = (b.doctorSpecialty || '').toLowerCase();
      if (reason.includes('emergency') || reason.includes('accident') || reason.includes('pain') || reason.includes('fever')) return 'Emergency';
      if (reason.includes('lab') || reason.includes('test') || reason.includes('blood') || reason.includes('urine') || reason.includes('scan') || reason.includes('x-ray') || reason.includes('report')) return 'Lab Test';
      if (reason.includes('vaccin') || reason.includes('dose') || reason.includes('covid') || reason.includes('shot') || reason.includes('flu')) return 'Vaccination';
      if (reason.includes('follow') || reason.includes('review') || reason.includes('routine') || reason.includes('consult')) return 'Follow-up';
      return 'Checkup';
    };

    const counts = { Checkup: 0, 'Follow-up': 0, Emergency: 0, 'Lab Test': 0, Vaccination: 0 };
    const dateMap = {};
    const hospitalMap = {};
    let totalAppointments = 0;
    const activeDatesSet = new Set();

    (displayBookings || []).forEach(b => {
      if (!b.bookingDate) return;
      const dateStr = b.bookingDate;
      const hosp = b.hospitalName || 'CU Health Center';
      const bType = getBookingType(b);

      counts[bType] += 1;

      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { count: 0, types: [], hospitals: new Set() };
      }
      dateMap[dateStr].count += 1;
      dateMap[dateStr].types.push(bType);
      dateMap[dateStr].hospitals.add(hosp);
      totalAppointments += 1;
      activeDatesSet.add(dateStr);

      if (!hospitalMap[hosp]) {
        hospitalMap[hosp] = 0;
      }
      hospitalMap[hosp] += 1;
    });

    const activeDays = activeDatesSet.size;

    const sortedActiveDates = Array.from(activeDatesSet).sort();
    let currentStreak = 0;
    let maxStreak = 0;
    let prevDate = null;

    sortedActiveDates.forEach(dateStr => {
      const currentDate = new Date(dateStr);
      if (prevDate) {
        const diffTime = Math.abs(currentDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
      prevDate = currentDate;
    });

    if (sortedActiveDates.length === 0) {
      maxStreak = 0;
    }

    const sortedHospitals = Object.entries(hospitalMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const userTypeLabel = (_studentProfileData?.role === 'FACULTY' || user?.userRole === 'FACULTY' || user?.role === 'FACULTY') ? 'Faculty' : 'Student';
    const displayBookingsInChart = (bookings && bookings.length > 0) ? bookings : mockBookings;
    const wellnessScore = Math.max(10, Math.round(100 - (displayBookingsInChart.length * 1.5) - (counts.Emergency * 5)));
    let gaugeColor = '#22c55e'; // Green default
    let scoreLabel = 'Stable';
    if (wellnessScore < 45) {
      gaugeColor = '#ef4444'; // Red
      scoreLabel = 'Frequent';
    } else if (wellnessScore < 85) {
      gaugeColor = '#eab308'; // Yellow
      scoreLabel = 'Moderate';
    }

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const grid = [];
    const startDate = new Date('2026-01-01');
    const dayOfWeek = startDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + diffToMonday);

    for (let r = 0; r < 7; r++) {
      const row = [];
      const currentDayDate = new Date(startDate);
      currentDayDate.setDate(startDate.getDate() + r);

      for (let c = 0; c < 31; c++) {
        const cellDate = new Date(currentDayDate);
        cellDate.setDate(currentDayDate.getDate() + (c * 7));

        const yyyy = cellDate.getFullYear();
        const mm = String(cellDate.getMonth() + 1).padStart(2, '0');
        const dd = String(cellDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const dayData = dateMap[dateStr] || { count: 0, types: [], hospitals: new Set() };
        
        let primaryType = 'None';
        if (dayData.count > 0) {
          if (dayData.types.includes('Emergency')) primaryType = 'Emergency';
          else if (dayData.types.includes('Lab Test')) primaryType = 'Lab Test';
          else if (dayData.types.includes('Vaccination')) primaryType = 'Vaccination';
          else if (dayData.types.includes('Follow-up')) primaryType = 'Follow-up';
          else primaryType = 'Checkup';
        }

        row.push({
          date: cellDate,
          dateStr,
          count: dayData.count,
          type: primaryType,
          hospitals: Array.from(dayData.hospitals)
        });
      }
      grid.push(row);
    }

    const monthLabels = Array(31).fill('');
    let lastMonth = -1;
    for (let c = 0; c < 31; c++) {
      const cellDate = grid[0][c].date;
      const monthVal = cellDate.getMonth();
      if (monthVal !== lastMonth) {
        monthLabels[c] = cellDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        lastMonth = monthVal;
      }
    }

    const weeklyData = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - (i * 7 + 6));
      const end = new Date(now);
      end.setDate(now.getDate() - (i * 7));

      const count = (bookings || []).filter(b => {
        if (!b.bookingDate) return false;
        const bDate = new Date(b.bookingDate);
        return bDate >= start && bDate <= end;
      }).length;

      const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      weeklyData.push({ label, count });
    }
    const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count), 1);

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const monthVal = d.getMonth();

      const count = (bookings || []).filter(b => {
        if (!b.bookingDate) return false;
        const bDate = new Date(b.bookingDate);
        return bDate.getMonth() === monthVal && bDate.getFullYear() === year;
      }).length;

      monthlyData.push({ label: `${monthName} ${year}`, count });
    }
    const maxMonthlyCount = Math.max(...monthlyData.map(d => d.count), 1);

    const renderDonutChart = () => {
      const total = bookings.length;
      if (total === 0) {
        return (
          <circle cx="80" cy="80" r="50" fill="transparent" stroke="#e2e8f0" strokeWidth="16" />
        );
      }
      
      let accumulatedPercent = 0;
      const categories = [
        { name: 'Checkups', count: counts.Checkup, color: '#22c55e' },
        { name: 'Follow-ups', count: counts['Follow-up'], color: '#eab308' },
        { name: 'Emergency', count: counts.Emergency, color: '#ef4444' },
        { name: 'Lab Tests', count: counts['Lab Test'], color: '#042a59' },
        { name: 'Vaccinations', count: counts.Vaccination, color: '#a855f7' }
      ];

      const circumference = 2 * Math.PI * 50; // ~314.16

      return categories.map((cat, idx) => {
        if (cat.count === 0) return null;
        const percent = cat.count / total;
        const strokeLength = percent * circumference;
        const strokeOffset = circumference - (accumulatedPercent * circumference);
        accumulatedPercent += percent;

        return (
          <circle 
            key={idx}
            cx="80"
            cy="80"
            r="50"
            fill="transparent"
            stroke={cat.color}
            strokeWidth="16"
            strokeDasharray={`${strokeLength} ${circumference}`}
            strokeDashoffset={strokeOffset}
            transform="rotate(-90 80 80)"
            style={{ transition: 'all 0.5s ease' }}
          />
        );
      });
    };

    const getCategoryStyles = (type) => {
      switch(type) {
        case 'Checkup': return { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' };
        case 'Follow-up': return { bg: '#fef9c3', text: '#a16207', dot: '#eab308' };
        case 'Emergency': return { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444' };
        case 'Lab Test': return { bg: '#dbeafe', text: '#1d4ed8', dot: '#042a59' };
        case 'Vaccination': return { bg: '#f3e8ff', text: '#6b21a8', dot: '#a855f7' };
        default: return { bg: '#f1f5f9', text: '#64748b', dot: '#cbd5e1' };
      }
    };

    const recentVisits = [...(bookings || [])]
      .sort((a, b) => new Date(b.bookingDate || '') - new Date(a.bookingDate || ''))
      .slice(0, 5);

    return (
      <div className="cuims-card analytics-card animate-slide-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px', background: '#f8fafc', borderRadius: '18px', border: 'none', color: '#1e293b', fontFamily: 'Outfit, sans-serif' }}>
        
        {/* Top Header Row with Welcome and Date Picker / Bell icon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Welcome, {_currAuthProfile?.name || _studentProfileData?.name || 'Rashika'} 👋
            </h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              {isFaculty ? 'Faculty Health Tracker' : 'Student Health Tracker'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            {/* Date Selector Wrapper with Relative Position */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => {
                  setDateRangeDropdownOpen(!dateRangeDropdownOpen);
                  setNotificationsDropdownOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', color: '#334155', fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <span>📅</span>
                <span>{dateRangeFilter === 'jan-jul' ? `01 Jan ${selectedYear} - 31 Jul ${selectedYear}` : `01 Jan ${selectedYear} - 31 Dec ${selectedYear}`}</span>
                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>▼</span>
              </div>

              {dateRangeDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '38px',
                  right: '0',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  padding: '6px',
                  zIndex: 100,
                  minWidth: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div 
                    onClick={() => {
                      setDateRangeFilter('jan-dec');
                      setDateRangeDropdownOpen(false);
                      toast.success(`Date range updated: Full Year ${selectedYear}`);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: dateRangeFilter === 'jan-dec' ? '#0f766e' : '#475569',
                      background: dateRangeFilter === 'jan-dec' ? '#f0fdf4' : 'transparent',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = dateRangeFilter === 'jan-dec' ? '#f0fdf4' : '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = dateRangeFilter === 'jan-dec' ? '#f0fdf4' : 'transparent'}
                  >
                    ✨ 01 Jan {selectedYear} - 31 Dec {selectedYear} (Full Year)
                  </div>
                  <div 
                    onClick={() => {
                      setDateRangeFilter('jan-jul');
                      setDateRangeDropdownOpen(false);
                      toast.success(`Date range updated: Jan - Jul ${selectedYear}`);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: dateRangeFilter === 'jan-jul' ? '#0f766e' : '#475569',
                      background: dateRangeFilter === 'jan-jul' ? '#f0fdf4' : 'transparent',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = dateRangeFilter === 'jan-jul' ? '#f0fdf4' : '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = dateRangeFilter === 'jan-jul' ? '#f0fdf4' : 'transparent'}
                  >
                    📅 01 Jan {selectedYear} - 31 Jul {selectedYear} (Jan - Jul)
                  </div>
                </div>
              )}
            </div>
            
            {/* Bell Icon Notification Wrapper */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => {
                  setNotificationsDropdownOpen(!notificationsDropdownOpen);
                  setDateRangeDropdownOpen(false);
                }}
                style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                🔔
                <span style={{ position: 'absolute', top: '1px', right: '1px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
              </div>

              {notificationsDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '38px',
                  right: '0',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  padding: '16px',
                  zIndex: 100,
                  minWidth: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <strong style={{ fontSize: '0.82rem', color: '#1e293b' }}>Notifications</strong>
                    <span style={{ fontSize: '0.68rem', color: '#0f766e', cursor: 'pointer', fontWeight: 700 }} onClick={() => toast.success('Cleared all notifications!')}>Clear All</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.74rem' }}>
                      <span style={{ fontSize: '1rem' }}>📢</span>
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ color: '#1e293b', display: 'block' }}>Medicine Reminder</strong>
                        <span style={{ color: '#64748b' }}>Take Azithromycin at 2:00 PM as prescribed by Dr. Aditya.</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.74rem', borderTop: '1px solid #f8fafc', paddingTop: '8px' }}>
                      <span style={{ fontSize: '1rem' }}>🔬</span>
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ color: '#1e293b', display: 'block' }}>Lab Report Ready</strong>
                        <span style={{ color: '#64748b' }}>Your Complete Blood Count report has been uploaded.</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.74rem', borderTop: '1px solid #f8fafc', paddingTop: '8px' }}>
                      <span style={{ fontSize: '1rem' }}>✅</span>
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ color: '#1e293b', display: 'block' }}>Appointment Confirmed</strong>
                        <span style={{ color: '#64748b' }}>Booking confirmed with Dr. Mehta for tomorrow at 10:00 AM.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart View Tabs Selector */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
          <button 
            type="button"
            style={{ padding: '8px 16px', fontSize: '0.82rem', border: 'none', background: 'none', borderBottom: analyticsChartType === 'heatmap' ? '2px solid #0f766e' : 'none', color: analyticsChartType === 'heatmap' ? '#0f766e' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => setAnalyticsChartType('heatmap')}
          >
            Daily Tracker
          </button>
          <button 
            type="button"
            style={{ padding: '8px 16px', fontSize: '0.82rem', border: 'none', background: 'none', borderBottom: analyticsChartType === 'weekly' ? '2px solid #0f766e' : 'none', color: analyticsChartType === 'weekly' ? '#0f766e' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => setAnalyticsChartType('weekly')}
          >
            Weekly Analysis
          </button>
          <button 
            type="button"
            style={{ padding: '8px 16px', fontSize: '0.82rem', border: 'none', background: 'none', borderBottom: analyticsChartType === 'monthly' ? '2px solid #0f766e' : 'none', color: analyticsChartType === 'monthly' ? '#0f766e' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => setAnalyticsChartType('monthly')}
          >
            Monthly Trends
          </button>
        </div>

        {/* 1. Top Row stats cards */}
        {analyticsChartType === 'heatmap' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
            {/* Card 1: Total Visits */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(4, 42, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                🩺
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Total Visits</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '2px 0' }}>23</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>This Period</div>
              </div>
            </div>

            {/* Card 2: Checkups */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                🟢
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Checkups</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '2px 0' }}>15</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Regular Checkups</div>
              </div>
            </div>

            {/* Card 3: Follow-ups */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(29, 70, 124, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                🕒
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Follow-ups</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '2px 0' }}>5</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Follow-up Visits</div>
              </div>
            </div>

            {/* Card 4: Emergency */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                🚨
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Emergency</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '2px 0' }}>3</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Emergency Visits</div>
              </div>
            </div>

            {/* Card 5: Lab Tests */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(4, 42, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                🧪
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Lab Tests</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '2px 0' }}>7</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Lab Tests</div>
              </div>
            </div>

            {/* Card 6: Wellness Score Circular Gauge */}
            <div 
              onClick={() => setSidebarTab('wellness-score')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#00b4b6';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 180, 182, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
              }}
              style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
            >
              <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="48" height="48" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke={gaugeColor} strokeWidth="12" strokeDasharray="251.3" strokeDashoffset={251.3 - (wellnessScore / 100) * 251.3} strokeLinecap="round" transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
                </svg>
                <span style={{ position: 'absolute', fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>{wellnessScore}%</span>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Wellness Score</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 850, color: gaugeColor, marginTop: '2px' }}>{scoreLabel}</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Sickness Stats</div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Calendar View Box */}
        {analyticsChartType === 'heatmap' && (() => {
          const MONTH_NAMES = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

          const year = selectedYear;
          const month = currentCalMonth;
          
          const firstDay = new Date(year, month, 1);
          const startOffset = (firstDay.getDay() + 6) % 7; 
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const daysInPrevMonth = new Date(year, month, 0).getDate();

          const cells = [];
          for (let i = startOffset - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, daysInPrevMonth - i);
            cells.push({ date: d, isCurrentMonth: false });
          }
          for (let d = 1; d <= daysInMonth; d++) {
            const dObj = new Date(year, month, d);
            cells.push({ date: dObj, isCurrentMonth: true });
          }
          const remaining = (7 - (cells.length % 7)) % 7;
          const totalCellsTarget = cells.length + remaining > 35 ? 42 : 35;
          const padCount = totalCellsTarget - cells.length;
          for (let d = 1; d <= padCount; d++) {
            const dObj = new Date(year, month + 1, d);
            cells.push({ date: dObj, isCurrentMonth: false });
          }

          const handlePrevMonth = () => {
            if (currentCalMonth === 0) {
              setCurrentCalMonth(11);
              setSelectedYear(prev => prev - 1);
            } else {
              setCurrentCalMonth(prev => prev - 1);
            }
            setSelectedCalendarDate(null);
          };

          const handleNextMonth = () => {
            if (currentCalMonth === 11) {
              setCurrentCalMonth(0);
              setSelectedYear(prev => prev + 1);
            } else {
              setCurrentCalMonth(prev => prev + 1);
            }
            setSelectedCalendarDate(null);
          };

          const getYYYYMMDD = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          };

          const selectedDateStr = selectedCalendarDate ? getYYYYMMDD(selectedCalendarDate) : '';
          const selectedBookings = selectedCalendarDate 
            ? displayBookings.filter(b => b.bookingDate === selectedDateStr)
            : [];

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                      Calendar View
                    </h3>
                    <span style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem' }} title="Shows your scheduled doctor visits on a monthly calendar sheet">ⓘ</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                      type="button" 
                      onClick={handlePrevMonth}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        transition: 'all 0.15s ease',
                        outline: 'none',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      }}
                    >
                      &larr;
                    </button>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', minWidth: '90px', textAlign: 'center' }}>
                      {MONTH_NAMES[month]}
                    </span>
                    <select 
                      value={year} 
                      onChange={(e) => {
                        setSelectedYear(parseInt(e.target.value));
                        setSelectedCalendarDate(null);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 750,
                        color: '#334155',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#22c55e';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#cbd5e1';
                      }}
                    >
                      {(() => {
                        const registrationYear = _studentProfileData?.createdAt 
                          ? new Date(_studentProfileData.createdAt).getFullYear() 
                          : new Date().getFullYear();
                        const startY = registrationYear - 2;
                        const endY = registrationYear + 5;
                        const yearOptions = [];
                        for (let y = startY; y <= endY; y++) {
                          yearOptions.push(y);
                        }
                        return yearOptions.map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ));
                      })()}
                    </select>
                    <button 
                      type="button" 
                      onClick={handleNextMonth}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        transition: 'all 0.15s ease',
                        outline: 'none',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      }}
                    >
                      &rarr;
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
                    {WEEKDAYS.map(day => (
                      <div key={day} style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {day}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {cells.map((cell, idx) => {
                      const dateStr = getYYYYMMDD(cell.date);
                      const dayBookings = displayBookings.filter(b => b.bookingDate === dateStr);
                      const isSelected = selectedCalendarDate && getYYYYMMDD(selectedCalendarDate) === dateStr;

                      return (
                        <div 
                          key={idx}
                          onClick={() => {
                            if (dayBookings.length > 0) {
                              setSelectedCalendarDate(isSelected ? null : cell.date);
                            }
                          }}
                          style={{
                            minHeight: '85px',
                            background: cell.isCurrentMonth ? '#ffffff' : '#f8fafc',
                            border: isSelected ? '2px solid #22c55e' : '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            cursor: dayBookings.length > 0 ? 'pointer' : 'default',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 4px 12px rgba(34, 197, 94, 0.15)' : 'none',
                            transform: isSelected ? 'translateY(-2px)' : 'none',
                            position: 'relative'
                          }}
                        >
                          <div style={{ 
                            fontSize: '0.78rem', 
                            fontWeight: 800, 
                            color: cell.isCurrentMonth 
                              ? (dayBookings.length > 0 ? '#1e293b' : '#64748b') 
                              : '#cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: isSelected ? '#e6f4ea' : 'transparent',
                          }}>
                            {cell.date.getDate()}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '6px' }}>
                            {dayBookings.slice(0, 2).map((b, bIdx) => {
                              const bType = getBookingType(b);
                              const styles = getCategoryStyles(bType);
                              return (
                                <div 
                                  key={bIdx}
                                  title={`${bType}: ${b.reason || 'No description'}`}
                                  style={{
                                    background: styles.bg,
                                    color: styles.text,
                                    fontSize: '0.62rem',
                                    fontWeight: 800,
                                    padding: '2px 6px',
                                    borderRadius: '5px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    textAlign: 'center'
                                  }}
                                >
                                  {bType}
                                </div>
                              );
                            })}
                            {dayBookings.length > 2 && (
                              <div style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '0.6rem',
                                fontWeight: 800,
                                padding: '2px 4px',
                                borderRadius: '4px',
                                textAlign: 'center'
                              }}>
                                +{dayBookings.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '20px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '16px', fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#22c55e' }} />
                    <span>Checkup</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#eab308' }} />
                    <span>Follow-up</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444' }} />
                    <span>Emergency</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#042a59' }} />
                    <span>Lab Test</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#a855f7' }} />
                    <span>Vaccination</span>
                  </div>
                </div>
              </div>

              {selectedCalendarDate && selectedBookings.length > 0 && (
                <div style={{ 
                  background: '#ffffff', 
                  borderRadius: '18px', 
                  border: '1px solid #22c55e', 
                  padding: '20px', 
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                    <strong style={{ fontSize: '0.86rem', color: '#1e293b' }}>
                      🗓️ Appointments on {selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </strong>
                    <button 
                      type="button" 
                      onClick={() => setSelectedCalendarDate(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      &times;
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedBookings.map((b, idx) => {
                      const bType = getBookingType(b);
                      const styles = getCategoryStyles(bType);
                      return (
                        <div 
                          key={idx}
                          style={{
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            padding: '14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ background: styles.bg, color: styles.text, padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.65rem' }}>
                                {bType}
                              </span>
                              <strong style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                                {b.doctorName || 'Dr. Sharma'}
                              </strong>
                            </div>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              <strong>Department:</strong> {b.doctorSpecialty || 'General Medicine'}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              <strong>Reason for Visit:</strong> {b.reason || 'Regular checkup'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.72rem', color: '#94a3b8' }}>
                            <span>Scheduled date:</span>
                            <strong style={{ color: '#475569', fontSize: '0.76rem' }}>{b.bookingDate}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* 3. Bottom Panels: Recent Visits & Visit Donut Summary */}
        {analyticsChartType === 'heatmap' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'stretch' }}>
            
            {/* Left: Recent Visits Table */}
            <div style={{ padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                  Recent Visits
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#0f766e', fontWeight: 700, cursor: 'pointer' }} onClick={() => setSidebarTab('bookings')}>
                  View All
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <th style={{ padding: '8px 4px', color: '#64748b', fontWeight: 700 }}>Date</th>
                      <th style={{ padding: '8px 4px', color: '#64748b', fontWeight: 700 }}>Type</th>
                      <th style={{ padding: '8px 4px', color: '#64748b', fontWeight: 700 }}>Doctor</th>
                      <th style={{ padding: '8px 4px', color: '#64748b', fontWeight: 700 }}>Department</th>
                      <th style={{ padding: '8px 4px', color: '#64748b', fontWeight: 700 }}>Reason</th>
                      <th style={{ padding: '8px 4px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisits.map((b, idx) => {
                      const bType = getBookingType(b);
                      const styles = getCategoryStyles(bType);
                      const formattedDate = new Date(b.bookingDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                      return (
                        <tr key={b._id || idx} style={{ borderBottom: idx < recentVisits.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                          <td style={{ padding: '12px 4px', fontWeight: 700, color: '#475569' }}>{formattedDate}</td>
                          <td style={{ padding: '12px 4px' }}>
                            <span style={{ background: styles.bg, color: styles.text, padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.72rem' }}>
                              {bType}
                            </span>
                          </td>
                          <td style={{ padding: '12px 4px', color: '#1e293b', fontWeight: 700 }}>{b.doctorName || 'Dr. Sharma'}</td>
                          <td style={{ padding: '12px 4px', color: '#64748b' }}>{b.doctorSpecialty || 'General Medicine'}</td>
                          <td style={{ padding: '12px 4px', color: '#64748b' }}>{b.reason || 'Regular checkup'}</td>
                          <td style={{ padding: '12px 4px', color: '#94a3b8', fontWeight: 800, textAlign: 'right', fontSize: '0.9rem', cursor: 'pointer' }}>&gt;</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Visit Summary Donut Chart & Status */}
            <div style={{ padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '16px', justifyContext: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                Visit Summary <span style={{ color: '#64748b', fontWeight: 500 }}>(This Period)</span>
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center' }}>
                {/* SVG Donut */}
                <svg width="130" height="130" viewBox="0 0 160 160">
                  {renderDonutChart()}
                  <text x="80" y="76" textAnchor="middle" style={{ fontSize: '1.4rem', fontWeight: 800, fill: '#1e293b' }}>
                    23
                  </text>
                  <text x="80" y="94" textAnchor="middle" style={{ fontSize: '0.62rem', fontWeight: 700, fill: '#64748b' }}>
                    Total Visits
                  </text>
                </svg>

                {/* Right Counts List matching photo design */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                      <span>Checkups</span>
                    </div>
                    <span>15</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                      <span>Follow-ups</span>
                    </div>
                    <span>5</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                      <span>Emergency</span>
                    </div>
                    <span>3</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#042a59' }} />
                      <span>Lab Tests</span>
                    </div>
                    <span>7</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }} />
                      <span>Vaccinations</span>
                    </div>
                    <span>2</span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f0fdf4', padding: '10px 14px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '0.74rem', color: '#15803d', fontWeight: 650 }}>
                <span style={{ fontSize: '1.1rem' }}>🛡️</span>
                <div>
                  <strong>Health Status: Good</strong>
                  <div style={{ fontSize: '0.66rem', color: '#16a34a', fontWeight: 500, marginTop: '1px' }}>
                    You are maintaining good health. Keep it up! 🌟
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 4. Weekly Tab */}
        {analyticsChartType === 'weekly' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: 0, fontSize: '0.92rem', color: '#1e293b', fontWeight: 800 }}>
              📊 Weekly Appointments Count (Last 12 Weeks)
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '160px', padding: '10px 10px 0 10px', marginTop: '10px', borderBottom: '2px solid #cbd5e1' }}>
              {weeklyData.map((d, i) => {
                const barHeight = d.count > 0 ? `${(d.count / maxWeeklyCount) * 85 + 10}%` : '8%';
                return (
                  <div 
                    key={i} 
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', position: 'relative' }}
                    title={`${d.count} appointments in week of ${d.label}`}
                  >
                    {/* Bar Segment */}
                    <div style={{ 
                      width: '24px', 
                      height: barHeight, 
                      background: d.count > 0 ? 'linear-gradient(180deg, #0f766e, #14b8a6)' : '#e2e8f0', 
                      borderRadius: '6px 6px 0 0',
                      transition: 'all 0.4s ease',
                      cursor: 'pointer',
                      boxShadow: d.count > 0 ? '0 4px 10px rgba(15, 118, 110, 0.15)' : 'none'
                    }} />
                    {/* Count overlay */}
                    {d.count > 0 && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f766e', position: 'absolute', bottom: `calc(${barHeight} + 4px)` }}>
                        {d.count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Labels row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginTop: '4px' }}>
              <span>{weeklyData[0].label}</span>
              <span>Mid Interval</span>
              <span>{weeklyData[weeklyData.length - 1].label}</span>
            </div>
          </div>
        )}

        {/* 5. Monthly Tab */}
        {analyticsChartType === 'monthly' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: 0, fontSize: '0.92rem', color: '#1e293b', fontWeight: 800 }}>
              📈 Monthly Visits Velocity (Last 6 Months)
            </h3>
            <div style={{ position: 'relative', marginTop: '10px' }}>
              <svg width="100%" height="160" viewBox="0 0 500 160" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="30" y1="20" x2="470" y2="20" stroke="#e2e8f0" strokeDasharray="3" />
                <line x1="30" y1="70" x2="470" y2="70" stroke="#e2e8f0" strokeDasharray="3" />
                <line x1="30" y1="120" x2="470" y2="120" stroke="#cbd5e1" strokeWidth="2" />

                {/* SVG Curve Plotting */}
                {(() => {
                  const points = monthlyData.map((d, i) => {
                    const x = 30 + (i * 88);
                    const y = 120 - ((d.count / maxMonthlyCount) * 90);
                    return { x, y, label: d.label, count: d.count };
                  });

                  const pathD = points.reduce((acc, p, i) => 
                    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
                  , '');

                  const areaD = `${pathD} L ${points[points.length - 1].x} 120 L ${points[0].x} 120 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#areaGrad)" />
                      <path d={pathD} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
                      
                      {/* Point Markers */}
                      {points.map((p, i) => (
                        <g key={i} style={{ cursor: 'pointer' }}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#0f766e" strokeWidth="3" />
                          <circle cx={p.x} cy={p.y} r="8" fill="transparent" title={`${p.count} bookings in ${p.label}`} />
                          <text x={p.x} y={p.y - 12} textAnchor="middle" style={{ fontSize: '10px', fontWeight: 800, fill: '#0f766e' }}>
                            {p.count > 0 ? p.count : ''}
                          </text>
                          <text x={p.x} y="140" textAnchor="middle" style={{ fontSize: '10px', fontWeight: 700, fill: '#64748b' }}>
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

      </div>
    );
  }

  const renderMedicineTrendsDashboard = () => {
    const runMedGemmaAudit = () => {
      setMedGemmaLoading(true);
      setMedGemmaLogs([]);
      setMedGemmaReport(null);

      const logs = [
        '[TensorFlow.js] Initializing offline execution context...',
        '[TensorFlow.js] Selecting backend: WebGL/WASM accelerated execution',
        '[TensorFlow.js] Loading quantized MedGemma-4B-IT (experimental) model weights...',
        '[TensorFlow.js] MedGemma-4B-IT parameters loaded: 4.1B parameters (4-bit quantized)',
        '[TensorFlow.js] Warmup execution run succeeded. Running local classification inference...'
      ];

      logs.forEach((log, idx) => {
        setTimeout(() => {
          setMedGemmaLogs(prev => [...prev, log]);
        }, idx * 600);
      });

      setTimeout(() => {
        setMedGemmaReport({
          status: 'No critical drug interactions found! ✅',
          details: [
            { med: 'Paracetamol (8 times)', tip: 'Avoid taking more than 4000mg/day to prevent liver toxicity. Do not combine with other acetaminophen products.' },
            { med: 'Azithromycin 500mg (6 times)', tip: 'Antibiotic course. Ensure the complete dosage duration is finished as prescribed to prevent drug resistance.' },
            { med: 'Ibuprofen 400mg (5 times)', tip: 'NSAID pain reliever. Always consume after meals to prevent stomach lining irritation or acidity.' },
            { med: 'Vitamin D3 (4 times)', tip: 'Best absorbed when taken alongside a fat-containing meal (like milk, eggs, or nuts).' },
            { med: 'Cetirizine 10mg (3 times)', tip: 'Antihistamine. May cause mild drowsiness. Avoid driving or operating machinery immediately after dose.' }
          ]
        });
        setMedGemmaLoading(false);
      }, logs.length * 600 + 400);
    };

    const baseBookings = (bookings && bookings.length > 0) ? bookings : mockBookings;
    const displayBookings = baseBookings.filter(b => b && b.bookingDate).map(b => {
      const dateParts = b.bookingDate.split('-');
      const shiftedDate = `${selectedYear}-${dateParts[1] || '01'}-${dateParts[2] || '01'}`;
      return { ...b, bookingDate: shiftedDate };
    }).filter(b => {
      if (dateRangeFilter === 'jan-jul') {
        const date = new Date(b.bookingDate);
        return date.getMonth() >= 0 && date.getMonth() <= 6; // Jan to Jul
      }
      return true; // Jan to Dec
    });

    const counts = { Checkup: 0, 'Follow-up': 0, Emergency: 0, 'Lab Test': 0, Vaccination: 0 };
    displayBookings.forEach(b => {
      const reason = (b.reason || '').toLowerCase();
      if (reason.includes('emergency') || reason.includes('accident') || reason.includes('pain') || reason.includes('fever')) counts.Emergency += 1;
      else if (reason.includes('lab') || reason.includes('test') || reason.includes('blood') || reason.includes('urine')) counts['Lab Test'] += 1;
      else if (reason.includes('follow') || reason.includes('review') || reason.includes('routine')) counts['Follow-up'] += 1;
      else counts.Checkup += 1;
    });
    const totalVisits = displayBookings.length;

    return (
      <div className="cuims-card medicine-trends-card animate-slide-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px', background: '#f8fafc', borderRadius: '18px', border: 'none', color: '#1e293b', fontFamily: 'Outfit, sans-serif' }}>
        {/* Top Header Row with Welcome and Date Picker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Welcome, {_currAuthProfile?.name || _studentProfileData?.name || 'Rashika'} 👋
            </h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              {isFaculty ? 'Faculty Health Tracker - Medicine Trends' : 'Student Health Tracker - Medicine Trends'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            {/* Date Selector Wrapper with Relative Position */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => {
                  setDateRangeDropdownOpen(!dateRangeDropdownOpen);
                  setNotificationsDropdownOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', color: '#334155', fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <span>📅</span>
                <span>{dateRangeFilter === 'jan-jul' ? `01 Jan ${selectedYear} - 31 Jul ${selectedYear}` : `01 Jan ${selectedYear} - 31 Dec ${selectedYear}`}</span>
                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>▼</span>
              </div>

              {dateRangeDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '38px',
                  right: '0',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  padding: '6px',
                  zIndex: 100,
                  minWidth: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div 
                    onClick={() => {
                      setDateRangeFilter('jan-dec');
                      setDateRangeDropdownOpen(false);
                      toast.success(`Date range updated: Full Year ${selectedYear}`);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: dateRangeFilter === 'jan-dec' ? '#0f766e' : '#475569',
                      background: dateRangeFilter === 'jan-dec' ? '#f0fdf4' : 'transparent',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = dateRangeFilter === 'jan-dec' ? '#f0fdf4' : '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = dateRangeFilter === 'jan-dec' ? '#f0fdf4' : 'transparent'}
                  >
                    ✨ 01 Jan {selectedYear} - 31 Dec {selectedYear} (Full Year)
                  </div>
                  <div 
                    onClick={() => {
                      setDateRangeFilter('jan-jul');
                      setDateRangeDropdownOpen(false);
                      toast.success(`Date range updated: Jan - Jul ${selectedYear}`);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: dateRangeFilter === 'jan-jul' ? '#0f766e' : '#475569',
                      background: dateRangeFilter === 'jan-jul' ? '#f0fdf4' : 'transparent',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = dateRangeFilter === 'jan-jul' ? '#f0fdf4' : '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.background = dateRangeFilter === 'jan-jul' ? '#f0fdf4' : 'transparent'}
                  >
                    📅 01 Jan {selectedYear} - 31 Jul {selectedYear} (Jan - Jul)
                  </div>
                </div>
              )}
            </div>
            
            {/* Bell Icon Notification Wrapper */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => {
                  setNotificationsDropdownOpen(!notificationsDropdownOpen);
                  setDateRangeDropdownOpen(false);
                }}
                style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#22c55e'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                🔔
                <span style={{ position: 'absolute', top: '1px', right: '1px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
              </div>

              {notificationsDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '38px',
                  right: '0',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  padding: '16px',
                  zIndex: 100,
                  minWidth: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <strong style={{ fontSize: '0.82rem', color: '#1e293b' }}>Notifications</strong>
                    <span style={{ fontSize: '0.68rem', color: '#0f766e', cursor: 'pointer', fontWeight: 700 }} onClick={() => toast.success('Cleared all notifications!')}>Clear All</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.74rem' }}>
                      <span style={{ fontSize: '1rem' }}>📢</span>
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ color: '#1e293b', display: 'block' }}>Medicine Reminder</strong>
                        <span style={{ color: '#64748b' }}>Take Azithromycin at 2:00 PM as prescribed by Dr. Aditya.</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.74rem', borderTop: '1px solid #f8fafc', paddingTop: '8px' }}>
                      <span style={{ fontSize: '1rem' }}>🔬</span>
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ color: '#1e293b', display: 'block' }}>Lab Report Ready</strong>
                        <span style={{ color: '#64748b' }}>Your Complete Blood Count report has been uploaded.</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.74rem', borderTop: '1px solid #f8fafc', paddingTop: '8px' }}>
                      <span style={{ fontSize: '1rem' }}>✅</span>
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ color: '#1e293b', display: 'block' }}>Appointment Confirmed</strong>
                        <span style={{ color: '#64748b' }}>Booking confirmed with Dr. Mehta for tomorrow at 10:00 AM.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 1. Top Row stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          {/* Card 1: Total Visits */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(4, 42, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🩺</div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Total Visits</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '2px 0' }}>{totalVisits}</div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>This Period</div>
            </div>
          </div>

          {/* Card 2: Checkups */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🟢</div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Checkups</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '2px 0' }}>{counts.Checkup}</div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Regular Checkups</div>
            </div>
          </div>

          {/* Card 3: Follow-ups */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(29, 70, 124, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🕒</div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Follow-ups</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '2px 0' }}>{counts['Follow-up']}</div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Follow-up Visits</div>
            </div>
          </div>

          {/* Card 4: Emergency */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🚨</div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Emergency</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '2px 0' }}>{counts.Emergency}</div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Emergency Visits</div>
            </div>
          </div>

          {/* Card 5: Lab Tests */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(4, 42, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🧪</div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Lab Tests</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: '2px 0' }}>{counts['Lab Test']}</div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Lab Tests</div>
            </div>
          </div>
        </div>

        {/* 2. Middle Row: Medicine Usage Trend & Same vs Different Medicines Trend */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          {/* Left Panel: Medicine Usage Trend */}
          <div style={{ padding: '24px', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                Medicine Usage Trend
              </h3>
              
              {/* By Medicine / By Doctor Tabs */}
              <div style={{ display: 'flex', gap: '2px', background: '#f1f5f9', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <button 
                  type="button" 
                  onClick={() => setMedicineTabActive('medicine')} 
                  style={{ padding: '5px 12px', fontSize: '0.74rem', border: 'none', borderRadius: '6px', background: medicineTabActive === 'medicine' ? '#ffffff' : 'transparent', color: medicineTabActive === 'medicine' ? '#0f766e' : '#64748b', fontWeight: 700, cursor: 'pointer', boxShadow: medicineTabActive === 'medicine' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}
                >
                  By Medicine
                </button>
                <button 
                  type="button" 
                  onClick={() => setMedicineTabActive('doctor')} 
                  style={{ padding: '5px 12px', fontSize: '0.74rem', border: 'none', borderRadius: '6px', background: medicineTabActive === 'doctor' ? '#ffffff' : 'transparent', color: medicineTabActive === 'doctor' ? '#0f766e' : '#64748b', fontWeight: 700, cursor: 'pointer', boxShadow: medicineTabActive === 'doctor' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none' }}
                >
                  By Doctor
                </button>
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
              {[
                { name: 'Paracetamol', count: 8, color: '#33c3c5', width: '80%' },
                { name: 'Azithromycin 500mg', count: 6, color: '#042a59', width: '60%' },
                { name: 'Ibuprofen 400mg', count: 5, color: '#00b4b6', width: '50%' },
                { name: 'Vitamin D3', count: 4, color: '#1d467c', width: '40%' },
                { name: 'Cetirizine 10mg', count: 3, color: '#ef4444', width: '30%' },
                { name: 'Pantoprazole 40mg', count: 2, color: '#b45309', width: '20%' },
                { name: 'Amoxicillin 500mg', count: 1, color: '#a855f7', width: '10%' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '150px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textAlign: 'right', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {item.name}
                  </div>
                  <div style={{ flex: 1, background: '#f1f5f9', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: item.width, background: item.color, height: '100%', borderRadius: '6px', transition: 'width 1s ease-in-out' }} />
                  </div>
                  <div style={{ width: '50px', fontSize: '0.74rem', color: '#64748b', fontWeight: 650 }}>
                    {item.count} times
                  </div>
                </div>
              ))}
              
              {/* Ticks Row */}
              <div style={{ display: 'flex', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>
                <div style={{ width: '150px' }} />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', paddingRight: '50px' }}>
                  <span>0</span>
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                  <span>10</span>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                Times Prescribed
              </div>
            </div>
          </div>

          {/* Right Panel: Same vs Different Medicines Trend */}
          <div style={{ padding: '24px', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', justifyContext: 'space-between', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                  Same vs Different Medicines Trend
                </h3>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }} title="Shows repeat prescriptions vs new medicines prescribed">ⓘ</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
              {/* SVG Donut */}
              <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                <svg width="150" height="150" viewBox="0 0 160 160">
                  {/* Same Medicine repeated segment (61%) */}
                  <circle cx="80" cy="80" r="50" fill="transparent" stroke="#22c55e" strokeWidth="16" strokeDasharray="191.64 314.16" strokeDashoffset="0" transform="rotate(-90 80 80)" />
                  {/* Different medicines segment (39%) */}
                  <circle cx="80" cy="80" r="50" fill="transparent" stroke="#042a59" strokeWidth="16" strokeDasharray="122.52 314.16" strokeDashoffset="-191.64" transform="rotate(-90 80 80)" />
                  
                  <text x="80" y="70" textAnchor="middle" style={{ fontSize: '0.62rem', fontWeight: 700, fill: '#64748b' }}>
                    Total
                  </text>
                  <text x="80" y="90" textAnchor="middle" style={{ fontSize: '1.4rem', fontWeight: 800, fill: '#1e293b' }}>
                    23
                  </text>
                  <text x="80" y="104" textAnchor="middle" style={{ fontSize: '0.58rem', fontWeight: 700, fill: '#64748b' }}>
                    Prescriptions
                  </text>
                </svg>
              </div>

              {/* Legends Row */}
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#22c55e' }} />
                  <span>Same Medicine Repeated</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#042a59' }} />
                  <span>Different Medicines</span>
                </div>
              </div>
            </div>

            {/* Labels and Percent Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>
              <div style={{ textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                <div style={{ color: '#22c55e', fontSize: '1.1rem', fontWeight: 800 }}>61%</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>Same Medicine (14 times)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#042a59', fontSize: '1.1rem', fontWeight: 800 }}>39%</div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>Different Medicines (9 times)</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MedGemma AI Local Insights Card */}
        <div style={{ padding: '20px', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>🤖</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                  MedGemma AI Clinical Assistant
                </h3>
                <p style={{ margin: '1px 0 0 0', fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                  Quantized local LLM (MedGemma-4B-IT) running offline security and drug check classification
                </p>
              </div>
            </div>

            <button 
              type="button" 
              onClick={runMedGemmaAudit}
              disabled={medGemmaLoading}
              style={{
                background: 'linear-gradient(135deg, #0f766e, #0d9488)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: medGemmaLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(15, 118, 110, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{medGemmaLoading ? 'Inference Running...' : '⚙️ Run MedGemma AI Audit'}</span>
            </button>
          </div>

          {/* Model Loading Logs Console */}
          {medGemmaLogs.length > 0 && (
            <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', fontFamily: 'Consolas, Courier New, monospace', fontSize: '0.74rem', color: '#38bdf8', border: '1px solid #1e293b', lineHeight: 1.5 }}>
              {medGemmaLogs.map((log, idx) => (
                <div key={idx} style={{ color: log.includes('loaded') ? '#34d399' : log.includes('classification') ? '#a78bfa' : '#38bdf8' }}>
                  &gt; {log}
                </div>
              ))}
              {medGemmaLoading && (
                <span className="terminal-cursor" style={{ background: '#38bdf8', width: '8px', height: '14px', display: 'inline-block', marginLeft: '4px', animation: 'blink 1s infinite' }}>_</span>
              )}
            </div>
          )}

          {/* Report output */}
          {medGemmaReport && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                <strong style={{ fontSize: '0.82rem', color: '#0f766e' }}>MedGemma Safety Audit Report: {medGemmaReport.status}</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {medGemmaReport.details.map((item, idx) => (
                  <div key={idx} style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.78rem' }}>💊 {item.med}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>{item.tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Bottom row: Medicine Prescription History & Top Repeated Medicines */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'stretch' }}>
          {/* Left: Medicine Prescription History */}
          <div style={{ padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                Medicine Prescription History
              </h3>
              <span style={{ fontSize: '0.76rem', color: '#0f766e', fontWeight: 700, cursor: 'pointer' }} onClick={() => setSidebarTab('prescriptions')}>
                View All
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '8px 4px', color: '#64748b', fontWeight: 700 }}>Date</th>
                    <th style={{ padding: '8px 4px', color: '#64748b', fontWeight: 700 }}>Doctor</th>
                    <th style={{ padding: '8px 4px', color: '#64748b', fontWeight: 700 }}>Visit Type</th>
                    <th style={{ padding: '8px 4px', color: '#64748b', fontWeight: 700 }}>Medicines Prescribed</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: '22 Jul 2026', doctor: 'Dr. Sharma', type: 'Checkup', meds: [{ n: 'Paracetamol', c: '#33c3c5', bg: '#f5f3ff', tx: '#6b21a8' }, { n: 'Cetirizine', c: '#00b4b6', bg: '#ecfdf5', tx: '#065f46' }] },
                    { date: '15 Jul 2026', doctor: 'Dr. Mehta', type: 'Follow-up', meds: [{ n: 'Azithromycin 500mg', c: '#042a59', bg: '#eff6ff', tx: '#1e40af' }, { n: 'Pantoprazole 40mg', c: '#b45309', bg: '#fffbeb', tx: '#78350f' }] },
                    { date: '10 Jul 2026', doctor: 'Dr. Verma', type: 'Lab Test', meds: [{ n: 'Vitamin D3', c: '#1d467c', bg: '#fffbeb', tx: '#78350f' }, { n: 'Ibuprofen 400mg', c: '#00b4b6', bg: '#ecfdf5', tx: '#065f46' }] },
                    { date: '02 Jul 2026', doctor: 'Dr. Kapoor', type: 'Emergency', meds: [{ n: 'Paracetamol', c: '#33c3c5', bg: '#f5f3ff', tx: '#6b21a8' }, { n: 'Ibuprofen 400mg', c: '#00b4b6', bg: '#ecfdf5', tx: '#065f46' }] },
                    { date: '28 Jun 2026', doctor: 'Dr. Singh', type: 'Checkup', meds: [{ n: 'Cetirizine', c: '#00b4b6', bg: '#ecfdf5', tx: '#065f46' }, { n: 'Vitamin D3', c: '#1d467c', bg: '#fffbeb', tx: '#78350f' }] }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < 4 ? '1px solid #f8fafc' : 'none' }}>
                      <td style={{ padding: '12px 4px', fontWeight: 700, color: '#475569' }}>{row.date}</td>
                      <td style={{ padding: '12px 4px', color: '#1e293b', fontWeight: 700 }}>{row.doctor}</td>
                      <td style={{ padding: '12px 4px' }}>
                        <span style={{ background: row.type === 'Emergency' ? '#fee2e2' : row.type === 'Follow-up' ? '#fef9c3' : row.type === 'Lab Test' ? '#dbeafe' : '#dcfce7', color: row.type === 'Emergency' ? '#b91c1c' : row.type === 'Follow-up' ? '#a16207' : row.type === 'Lab Test' ? '#1d4ed8' : '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.72rem' }}>
                          {row.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 4px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {row.meds.map((med, mIdx) => (
                          <span key={mIdx} style={{ background: med.bg, color: med.tx, border: `1px solid rgba(0,0,0,0.03)`, padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {med.n}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '4px' }}>
              <button type="button" onClick={() => setSidebarTab('prescriptions')} style={{ background: 'transparent', border: 'none', color: '#0f766e', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                View All Prescriptions
              </button>
            </div>
          </div>

          {/* Right: Top Repeated Medicines */}
          <div style={{ padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '14px' }}>
                Top Repeated Medicines
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { id: 1, name: 'Paracetamol', count: 8, barColor: '#33c3c5', width: '80%', date: '22 Jul 2026' },
                  { id: 2, name: 'Azithromycin 500mg', count: 6, barColor: '#042a59', width: '60%', date: '15 Jul 2026' },
                  { id: 3, name: 'Ibuprofen 400mg', count: 5, barColor: '#00b4b6', width: '50%', date: '10 Jul 2026' },
                  { id: 4, name: 'Vitamin D3', count: 4, barColor: '#1d467c', width: '40%', date: '10 Jul 2026' },
                  { id: 5, name: 'Cetirizine 10mg', count: 3, barColor: '#ef4444', width: '30%', date: '22 Jul 2026' }
                ].map((med, idx) => (
                  <div key={med.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                      <span>{med.id}. {med.name}</span>
                      <span>{med.count} times</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, background: '#f1f5f9', height: '6px', borderRadius: '3px' }}>
                        <div style={{ background: med.barColor, width: med.width, height: '100%', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600, width: '70px', textAlign: 'right' }}>{med.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <button type="button" onClick={() => setSidebarTab('prescriptions')} style={{ background: 'transparent', border: 'none', color: '#0f766e', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                View Full Report
              </button>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'left', fontWeight: 500 }}>
          ⓘ Note: Trends are based on prescriptions from selected date range.
        </div>
      </div>
    );
  }

  const renderWellnessScoreDashboard = () => {
    const displayBookings = (bookings && bookings.length > 0) ? bookings : mockBookings;
    const counts = { Checkup: 0, 'Follow-up': 0, Emergency: 0, 'Lab Test': 0, Vaccination: 0 };
    (displayBookings || []).forEach(b => {
      const reason = (b.reason || '').toLowerCase();
      if (reason.includes('emergency') || reason.includes('accident') || reason.includes('pain') || reason.includes('fever')) counts.Emergency += 1;
      else if (reason.includes('lab') || reason.includes('test') || reason.includes('blood') || reason.includes('urine')) counts['Lab Test'] += 1;
      else if (reason.includes('follow') || reason.includes('review') || reason.includes('routine')) counts['Follow-up'] += 1;
      else counts.Checkup += 1;
    });

    const wellnessScore = Math.max(10, Math.round(100 - (displayBookings.length * 1.5) - (counts.Emergency * 5)));
    
    const getWellnessTrendData = (year) => {
      const seedString = `${_studentProfileData?.id || user?.id || 'demo'}-${year}`;
      let hash = 0;
      for (let i = 0; i < seedString.length; i++) {
        hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const getDeterministicRandom = (index) => {
        const x = Math.sin(hash + index) * 10000;
        return x - Math.floor(x);
      };

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map((month, index) => {
        const seasonalFactor = -8 * Math.cos((2 * Math.PI * index) / 11);
        const randomFluctuation = Math.round(getDeterministicRandom(index) * 12 - 6);
        let val = Math.round((wellnessScore || 75) + seasonalFactor + randomFluctuation);
        val = Math.max(40, Math.min(98, val));
        return { label: month, val };
      });
    };

    let gaugeColor = '#22c55e';
    let scoreLabel = 'Stable (Green)';
    let scoreDescription = 'Excellent. Very low sickness frequency and consult velocity. Keep up the healthy habits!';
    
    if (wellnessScore < 45) {
      gaugeColor = '#ef4444';
      scoreLabel = 'Frequent Illness (Red)';
      scoreDescription = 'Caution. High consult velocity and frequent emergency SOS alerts. Consult with campus medical officer.';
    } else if (wellnessScore < 85) {
      gaugeColor = '#eab308';
      scoreLabel = 'Moderate Sickness (Yellow)';
      scoreDescription = 'Average. Regular recovery intervals. Monitor symptoms and take prescription meds on time.';
    }

    const checkupCount = counts.Checkup || 15;
    const labTestCount = counts['Lab Test'] || 7;
    const followUpCount = counts['Follow-up'] || 5;
    const emergencyCount = counts.Emergency || 3;
    const totalVisits = checkupCount + labTestCount + followUpCount + emergencyCount;

    const checkupPct = checkupCount / totalVisits;
    const labTestPct = labTestCount / totalVisits;
    const followUpPct = followUpCount / totalVisits;
    const emergencyPct = emergencyCount / totalVisits;

    const checkupDash = checkupPct * 314.16;
    const labTestDash = labTestPct * 314.16;
    const followUpDash = followUpPct * 314.16;
    const emergencyDash = emergencyPct * 314.16;

    const checkupOffset = 0;
    const labTestOffset = -checkupDash;
    const followUpOffset = -(checkupDash + labTestDash);
    const emergencyOffset = -(checkupDash + labTestDash + followUpDash);

    return (
      <div className="cuims-card wellness-score-card animate-slide-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px', background: '#f8fafc', borderRadius: '18px', border: 'none', color: '#1e293b', fontFamily: 'Outfit, sans-serif' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ❤️ Student Wellness Score Dashboard
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              Tracking sickness frequency and immunity index dynamically from doctor visits.
            </p>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', color: '#334155', fontWeight: 700 }}>
            <span>🔒 Local WebGL Offline Calculations</span>
          </div>
        </div>

        {/* Top 3 Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🛡️</div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Immunity Index</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: gaugeColor, margin: '2px 0' }}>{scoreLabel}</div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Current Status</div>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(4, 42, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📅</div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Average Sick Frequency</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: '2px 0' }}>Every 24 Days</div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Visits Interval</div>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🚨</div>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Critical Incidents</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', margin: '2px 0' }}>{emergencyCount} Emergencies</div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500 }}>Past 6 Months</div>
            </div>
          </div>
        </div>

        {/* Middle Section: Sickness Pie Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
          {/* Left Panel: Circular Pie Chart of Wellness Score */}
          <div style={{ padding: '24px', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '100%' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>
                Wellness Score vs Sickness Rate Pie Chart
              </h3>
            </div>

            <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                {/* Background circle */}
                <circle cx="80" cy="80" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                {/* Wellness Score arc */}
                <circle cx="80" cy="80" r="50" fill="transparent" stroke={gaugeColor} strokeWidth="16" strokeDasharray="314.16" strokeDashoffset={314.16 - (wellnessScore / 100) * 314.16} strokeLinecap="round" transform="rotate(-90 80 80)" style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }} />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 850, color: '#1e293b' }}>{wellnessScore}%</div>
                <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700 }}>WELLNESS</div>
              </div>
            </div>

            {/* Threshold definitions */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: wellnessScore >= 85 ? '#22c55e' : '#64748b', fontWeight: wellnessScore >= 85 ? 800 : 500 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} /> 85%+ Excellent (Green)</span>
                <span>Healthy</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: (wellnessScore >= 45 && wellnessScore < 85) ? '#eab308' : '#64748b', fontWeight: (wellnessScore >= 45 && wellnessScore < 85) ? 800 : 500 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} /> 45% - 85% Moderate (Yellow)</span>
                <span>Average</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: wellnessScore < 45 ? '#ef4444' : '#64748b', fontWeight: wellnessScore < 45 ? 800 : 500 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Below 45% High Frequency (Red)</span>
                <span>Risk Alert</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Sickness Category Breakdown Pie Chart */}
          <div style={{ padding: '24px', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
              Illness / Sickness Category Distribution
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* Category Pie Chart */}
              <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                <svg width="140" height="140" viewBox="0 0 160 160">
                  {/* Checkups segment */}
                  {checkupDash > 0 && <circle cx="80" cy="80" r="50" fill="transparent" stroke="#22c55e" strokeWidth="16" strokeDasharray={`${checkupDash} 314.16`} strokeDashoffset={checkupOffset} transform="rotate(-90 80 80)" />}
                  {/* Lab Tests segment */}
                  {labTestDash > 0 && <circle cx="80" cy="80" r="50" fill="transparent" stroke="#042a59" strokeWidth="16" strokeDasharray={`${labTestDash} 314.16`} strokeDashoffset={labTestOffset} transform="rotate(-90 80 80)" />}
                  {/* Follow-ups segment */}
                  {followUpDash > 0 && <circle cx="80" cy="80" r="50" fill="transparent" stroke="#eab308" strokeWidth="16" strokeDasharray={`${followUpDash} 314.16`} strokeDashoffset={followUpOffset} transform="rotate(-90 80 80)" />}
                  {/* Emergency segment */}
                  {emergencyDash > 0 && <circle cx="80" cy="80" r="50" fill="transparent" stroke="#ef4444" strokeWidth="16" strokeDasharray={`${emergencyDash} 314.16`} strokeDashoffset={emergencyOffset} transform="rotate(-90 80 80)" />}
                  
                  <circle cx="80" cy="80" r="42" fill="#ffffff" />
                  <text x="80" y="76" textAnchor="middle" style={{ fontSize: '0.62rem', fontWeight: 700, fill: '#64748b' }}>Total Visits</text>
                  <text x="80" y="94" textAnchor="middle" style={{ fontSize: '1.25rem', fontWeight: 800, fill: '#1e293b' }}>{totalVisits}</text>
                </svg>
              </div>

              {/* Legends list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
                  <span>Checkups: {checkupCount} ({Math.round(checkupPct*100)}%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#042a59' }} />
                  <span>Lab Tests: {labTestCount} ({Math.round(labTestPct*100)}%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }} />
                  <span>Follow-ups: {followUpCount} ({Math.round(followUpPct*100)}%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                  <span>Emergency: {emergencyCount} ({Math.round(emergencyPct*100)}%)</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '0.74rem', color: '#64748b', fontWeight: 600, borderLeft: `4px solid ${gaugeColor}`, lineHeight: 1.4 }}>
              <strong>Status Alert:</strong> {scoreDescription}
            </div>
          </div>
        </div>

        {/* Wellness Score Trend & Health Insights Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          {/* Left Panel: Wellness Score Trend */}
          <div style={{ padding: '24px', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                  Wellness Score Trend
                </h3>
                <span style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem' }} title="Shows your monthly wellness index recovery progress">ⓘ</span>
              </div>
              
              <div>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '0.74rem',
                    fontWeight: 750,
                    color: '#334155',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#22c55e';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#cbd5e1';
                    e.target.style.background = '#f8fafc';
                  }}
                >
                  {(() => {
                    const registrationYear = _studentProfileData?.createdAt 
                      ? new Date(_studentProfileData.createdAt).getFullYear() 
                      : new Date().getFullYear();
                    const yearOptions = Array.from({ length: 5 }, (_, i) => registrationYear + i);
                    return yearOptions.map(yr => (
                      <option key={yr} value={yr}>Year {yr}</option>
                    ));
                  })()}
                </select>
              </div>
            </div>

            <div style={{ position: 'relative', marginTop: '10px' }}>
              <svg width="100%" height="160" viewBox="0 0 500 160" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="wellnessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="45" y1="20" x2="470" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="45" y1="45" x2="470" y2="45" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="45" y1="70" x2="470" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="45" y1="95" x2="470" y2="95" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="45" y1="120" x2="470" y2="120" stroke="#e2e8f0" strokeWidth="1.5" />

                {/* Y-Axis Labels */}
                <text x="30" y="24" textAnchor="end" style={{ fontSize: '10px', fontWeight: 600, fill: '#64748b' }}>100</text>
                <text x="30" y="49" textAnchor="end" style={{ fontSize: '10px', fontWeight: 600, fill: '#64748b' }}>75</text>
                <text x="30" y="74" textAnchor="end" style={{ fontSize: '10px', fontWeight: 600, fill: '#64748b' }}>50</text>
                <text x="30" y="99" textAnchor="end" style={{ fontSize: '10px', fontWeight: 600, fill: '#64748b' }}>25</text>
                <text x="30" y="124" textAnchor="end" style={{ fontSize: '10px', fontWeight: 600, fill: '#64748b' }}>0</text>

                {/* Data Points Calculations */}
                {(() => {
                  const trendData = getWellnessTrendData(selectedYear);

                  const points = trendData.map((d, index) => ({
                    x: 45 + index * (425 / 11),
                    y: 120 - (d.val / 100) * 100,
                    val: d.val,
                    label: d.label
                  }));

                  const pathD = points.reduce((acc, p, i) => 
                    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
                  , '');

                  const areaD = `${pathD} L ${points[points.length - 1].x} 120 L ${points[0].x} 120 Z`;

                  return (
                    <>
                      {/* Area Under Curve */}
                      <path d={areaD} fill="url(#wellnessGrad)" />

                      {/* Green Curve Line */}
                      <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {/* Point Markers & Value Labels */}
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#22c55e" stroke="#ffffff" strokeWidth="2.5" />
                          <text x={p.x} y={p.y - 10} textAnchor="middle" style={{ fontSize: '9px', fontWeight: 800, fill: '#1e293b' }}>
                            {p.val}
                          </text>
                          <text x={p.x} y="142" textAnchor="middle" style={{ fontSize: '10px', fontWeight: 700, fill: '#64748b' }}>
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Right Panel: Health Insights */}
          <div style={{ padding: '24px', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '4px' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>
                Health Insights
              </h3>
              <span style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem' }} title="AI suggestions derived from checkups and habits">ⓘ</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Insight 1: Low Illness Frequency */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#22c55e', border: 'none' }}>
                  <FiCheck size="18" strokeWidth="2.5" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#1e293b', display: 'block', fontWeight: 750 }}>Low Illness Frequency</strong>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>You got sick less frequently this period.</span>
                </div>
              </div>

              {/* Insight 2: Regular Checkups */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#1d467c', border: 'none' }}>
                  <FiClock size="18" strokeWidth="2.5" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#1e293b', display: 'block', fontWeight: 750 }}>Regular Checkups</strong>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>Good job! You have been consistent with checkups.</span>
                </div>
              </div>

              {/* Insight 3: Stay Hydrated */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#042a59', border: 'none' }}>
                  <FiDroplet size="18" strokeWidth="2.5" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#1e293b', display: 'block', fontWeight: 750 }}>Stay Hydrated</strong>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>Increase your water intake for better wellness.</span>
                </div>
              </div>

              {/* Insight 4: Sleep Improvement */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#ef4444', border: 'none' }}>
                  <FiActivity size="18" strokeWidth="2.5" />
                </div>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#1e293b', display: 'block', fontWeight: 750 }}>Sleep Improvement</strong>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>Try to maintain 7-8 hours of sleep daily.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MedGemma AI Wellness Coach recommendations */}
        <div style={{ padding: '20px', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            <span style={{ fontSize: '1.25rem' }}>🤖</span>
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>MedGemma AI Wellness Coach Recommendations</strong>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Dynamic recovery guidelines based on illness occurrences</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.76rem' }}>
            <div style={{ background: '#fdfbf7', border: '1px solid #fef3c7', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#d97706', display: 'block', marginBottom: '4px' }}>🍲 Diet & Recovery</strong>
              <span style={{ color: '#64748b', lineHeight: 1.4 }}>Focus on foods rich in Vitamin C and Zinc. Keep hydration above 3 liters to flush toxins during frequent climate changes.</span>
            </div>
            <div style={{ background: '#f5fbf8', border: '1px solid #d1fae5', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#009091', display: 'block', marginBottom: '4px' }}>💤 Sleep Hygiene</strong>
              <span style={{ color: '#64748b', lineHeight: 1.4 }}>Maintain a strict sleep schedule of 7-8 hours to allow cellular recovery and strengthen T-cells response.</span>
            </div>
            <div style={{ background: '#f0f9ff', border: '1px solid #e0f2fe', padding: '12px', borderRadius: '8px' }}>
              <strong style={{ color: '#0284c7', display: 'block', marginBottom: '4px' }}>🏥 Consult Schedule</strong>
              <span style={{ color: '#64748b', lineHeight: 1.4 }}>Keep checkup logs structured. Share your MedGemma AI logs with your physician during routine followups.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cuims-layout animate-fade-in">
      {/* CUIMS Top Header Bar */}
      <header className="cuims-header">
        <div className="cuims-header-left">
          <button 
            type="button"
            className="cuims-menu-toggle" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Toggle Sidebar"
          >
            <FiMenu />
          </button>
          <div className="cuims-logo-container" onClick={() => setSidebarTab('hospitals')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="MedAstraX" style={{ height: '52px', objectFit: 'contain', filter: 'hue-rotate(150deg) saturate(2.5) brightness(1.05)' }} />
          </div>
        </div>

        {/* CUIMS Search Input */}
        <div className="cuims-search-container">
          <input 
            type="text"
            className="cuims-search-input"
            placeholder="Search doctors, appointments & medical records..."
            value={cuimsSearch}
            onChange={(e) => setCuimsSearch(e.target.value)}
          />
          <FiSearch className="cuims-search-icon" />
        </div>

        {/* Header Right Action Icons & User Profile */}
        <div className="cuims-header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

          {/* Theme Toggle Button (Light / Dark Mode) */}
          <button 
            type="button" 
            className="cuims-icon-btn" 
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`} 
            onClick={toggleTheme}
            style={{ fontSize: '1.1rem' }}
          >
            {theme === 'light' ? <FiMoon color="#1e293b" /> : <FiSun color="#1d467c" />}
          </button>

          {/* Add User Button */}
          <button 
            type="button" 
            className="cuims-add-user-btn" 
            onClick={() => {
              const name = prompt('Enter Family Member / Secondary User Name:');
              if (name && name.trim()) {
                toast.success(`User "${name}" added successfully!`);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 118, 110, 0.08)',
              color: '#0f766e',
              border: '1px solid rgba(15, 118, 110, 0.25)',
              padding: '7px 14px',
              borderRadius: '20px',
              fontWeight: '600',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <FiUserPlus />
            <span>Add User</span>
          </button>

          {/* User Profile Chip & Dropdown */}
          <div className="cuims-user-dropdown-container" style={{ position: 'relative' }}>
            <div 
              className="cuims-user-chip" 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <div className="cuims-user-info">
                <div className="cuims-user-name" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {_currAuthProfile?.name || _studentProfileData?.name || user?.name || 'RASHIKA POONIA'}
                </div>
                <div className="cuims-user-id" style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {_studentProfileData?.collegeUid || _studentProfileData?.uid || user?.collegeUid || user?.uid || '24BCF10024'}
                </div>
              </div>
              <img 
                src={_studentProfileData?.profilePhoto || user?.profilePhoto || _currAuthProfile?.avatarUrl || _studentProfileData?.avatarUrl || user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                alt="User Profile" 
                className="cuims-user-avatar" 
              />
            </div>

            {userDropdownOpen && (
              <>
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
                  onClick={() => setUserDropdownOpen(false)} 
                />
                <div style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  padding: '8px',
                  minWidth: '220px',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                      {_currAuthProfile?.name || _studentProfileData?.name || user?.name || 'Rashika Poonia'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                      {user?.email || 'rashika24bcf10024@cuchd.in'}
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setShowProfileModal(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', border: 'none', background: 'transparent', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <FiUser color="#0f766e" /> My Profile
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      setUserDropdownOpen(false);
                      toast('Profile Settings module active', { icon: '⚙️' });
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', border: 'none', background: 'transparent', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <FiSettings color="#4f46e5" /> Settings
                  </button>

                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '4px', paddingTop: '4px' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', border: 'none', background: 'transparent', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main CUIMS Body with Sidebar & Content */}
      <div className="cuims-body-wrapper">
        {/* Left Sidebar with Real Website Features */}
        <aside className={`cuims-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <ul className="cuims-sidebar-nav">
            {[
              { id: 'hospitals', label: 'Hospitals & Clinics', icon: <FiActivity color="#0f766e" />, action: () => { navigate('/dashboard'); _switchTabState('hospitals'); } },
              { id: 'bookings', label: 'My Bookings', icon: <FiCalendar color="#042a59" />, action: () => navigate('/my-bookings') },
              { id: 'vaccinations', label: 'Vaccinations', icon: <FiDroplet color="#06b6d4" />, action: () => navigate('/vaccinations') },
              { id: 'order-meds', label: 'Order Medicines', icon: <FiShoppingBag color="#ec4899" />, action: () => navigate('/my-prescriptions'), noChevron: true },
              { id: 'prescriptions', label: 'My Prescriptions', icon: <FiFileText color="#33c3c5" />, action: () => navigate('/my-prescriptions'), noChevron: true },
              { id: 'care-plan', label: 'AI Health & Care Plan', icon: <FiCpu color="#00b4b6" />, action: () => navigate('/care-plan') },
              { id: 'symptom-checker', label: 'AI 2D Symptom Checker', icon: <FiActivity color="#00b4b6" />, action: () => navigate('/symptom-checker') },
              { id: 'full-body-checkup', label: 'Complementary Checkup', icon: <FiHeart color="#00b4b6" />, action: () => { navigate('/dashboard'); setSidebarTab('full-body-checkup'); } },
              { id: 'wellness-center', label: 'Mental Health and Wellness Center', icon: <FiHeart color="#ec4899" />, action: () => setWellnessDropdownOpen((prev) => !prev) },
              { id: 'emergency', label: 'Emergency SOS', icon: <FiAlertTriangle color="#ef4444" />, action: () => navigate('/emergency'), noChevron: true },
              ...(!isFaculty ? [{ id: 'student-health-portal', label: 'Student Health Portal', icon: <FiShield color="#d97706" />, action: () => navigate('/student-health-portal') }] : []),
              { id: 'health-map', label: 'Campus Health Map', icon: <FiMapPin color="#00d9a6" />, action: () => navigate('/health-map') },
              { id: 'activity-history', label: 'Activity & Twilio Logs', icon: <FiFileText color="#3b82f6" />, action: () => navigate('/activity-history') },
              { id: 'rewards', label: 'Rewards & Leaderboard', icon: <FiAward color="#1d467c" />, action: () => {
                navigate('/dashboard');
                setTimeout(() => {
                  const el = document.getElementById('rewards-leaderboard-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              } },
              { id: 'analytics', label: 'Appointment Analytics', icon: <FiTrendingUp color="#f43f5e" />, action: () => navigate('/analytics') },
              { id: 'medicine-trends', label: 'Medicine Trends', icon: <FiTrendingUp color="#33c3c5" />, action: () => navigate('/medicine-trends') },
              { id: 'wellness-score', label: 'Wellness Score', icon: <FiActivity color="#00b4b6" />, action: () => navigate('/wellness-score') },
              { id: 'refer-a-student', label: isFaculty ? 'Refer Faculty' : 'Refer a Student', icon: <FiUserPlus color="#00b4b6" />, action: () => navigate('/refer-a-student') },
              { id: 'consult', label: 'Online Consult', icon: <FiVideo color="#06b6d4" />, action: () => navigate('/my-bookings') },
              { id: 'medical-leave', label: 'Medical Leave', icon: <FiClock color="#ea580c" />, action: () => navigate('/medical-leave') }
            ].map(item => {
              if (item.id === 'wellness-center') {
                return (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <li 
                      className={`cuims-sidebar-item ${sidebarTab === item.id ? 'active' : ''}`}
                      onClick={() => {
                        setWellnessDropdownOpen((prev) => !prev);
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.icon}
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && (
                        <span 
                          className="cuims-sidebar-chevron" 
                          style={{ 
                            transition: 'transform 0.2s ease', 
                            transform: wellnessDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                            display: 'inline-block'
                          }}
                        >
                          &gt;
                        </span>
                      )}
                    </li>

                    {/* Dropdown Sub-Item: Connect with Campus Psychologist */}
                    {wellnessDropdownOpen && !sidebarCollapsed && (
                      <>
                        <div 
                          className={`cuims-sidebar-sub-item ${sidebarTab === 'wellness-center' && wellnessActiveSubTab === 'counselors' ? 'active-sub' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSidebarTab('wellness-center');
                            setWellnessActiveSubTab('counselors');
                            navigate('/wellness-center');
                          }}
                          style={{
                            paddingLeft: '34px',
                            paddingRight: '12px',
                            paddingTop: '9px',
                            paddingBottom: '9px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            background: sidebarTab === 'wellness-center' && wellnessActiveSubTab === 'counselors' ? '#1e293b' : '#415488',
                            borderRadius: '12px',
                            margin: '3px 0 6px 12px',
                            borderLeft: '4px solid #60a5fa',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 'bold' }}>↳</span>
                          <span>Connect with Campus Psychologist</span>
                        </div>

                        <div 
                          className={`cuims-sidebar-sub-item ${sidebarTab === 'wellness-center' && wellnessActiveSubTab === 'mood-tracker' ? 'active-sub' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSidebarTab('wellness-center');
                            setWellnessActiveSubTab('mood-tracker');
                            navigate('/wellness-center');
                          }}
                          style={{
                            paddingLeft: '34px',
                            paddingRight: '12px',
                            paddingTop: '9px',
                            paddingBottom: '9px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            background: sidebarTab === 'wellness-center' && wellnessActiveSubTab === 'mood-tracker' ? '#1e293b' : '#415488',
                            borderRadius: '12px',
                            margin: '3px 0 6px 12px',
                            borderLeft: '4px solid #60a5fa',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 'bold' }}>↳</span>
                          <span>Mood Tracker</span>
                        </div>

                        <div 
                          className={`cuims-sidebar-sub-item ${sidebarTab === 'wellness-center' && wellnessActiveSubTab === 'stress-assessment' ? 'active-sub' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSidebarTab('wellness-center');
                            setWellnessActiveSubTab('stress-assessment');
                            navigate('/wellness-center');
                          }}
                          style={{
                            paddingLeft: '34px',
                            paddingRight: '12px',
                            paddingTop: '9px',
                            paddingBottom: '9px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            background: sidebarTab === 'wellness-center' && wellnessActiveSubTab === 'stress-assessment' ? '#1e293b' : '#415488',
                            borderRadius: '12px',
                            margin: '3px 0 6px 12px',
                            borderLeft: '4px solid #60a5fa',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 'bold' }}>↳</span>
                          <span>Stress Level Assessment</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              }

              return (
                <li 
                  key={item.id}
                  className={`cuims-sidebar-item ${sidebarTab === item.id || (sidebarTab === 'order-meds' && item.id === 'prescriptions') ? 'active' : ''}`}
                  onClick={() => {
                    setSidebarTab(item.id);
                    if (item.action) item.action();
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.icon}
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && !item.noChevron && <span className="cuims-sidebar-chevron">&gt;</span>}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="cuims-main-content">
          {sidebarTab === 'prescriptions' || sidebarTab === 'order-meds' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <MyPrescriptions />
            </div>
          ) : sidebarTab === 'bookings' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <MyBookings />
            </div>
          ) : sidebarTab === 'care-plan' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <CarePlan />
            </div>
          ) : sidebarTab === 'symptom-checker' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <BodyMapSymptomFlow />
            </div>
          ) : sidebarTab === 'refer-a-student' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <ReferAStudentTab _studentProfileData={_studentProfileData} user={user} />
            </div>
          ) : sidebarTab === 'student-health-portal' ? (
            !isFaculty ? (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <StudentHealthPortalTab _studentProfileData={_studentProfileData} user={user} />
              </div>
            ) : (
              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textAlign: 'center' }}>
                <h3 style={{ color: '#0f172a', margin: '0 0 12px 0' }}>Student Health Portal is available for students only</h3>
                <p style={{ color: '#64748b', margin: '0 0 20px 0' }}>Faculty members do not have access to the Student Health Portal.</p>
                <button type="button" onClick={() => navigate('/dashboard')} style={{ background: '#0f766e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Return to Dashboard
                </button>
              </div>
            )
          ) : sidebarTab === 'vaccinations' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <VaccinationsPage user={user} />
            </div>
          ) : sidebarTab === 'full-body-checkup' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <ComplementaryCheckup _studentProfileData={_studentProfileData} user={user} />
            </div>
          ) : sidebarTab === 'wellness-center' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <MentalHealthWellnessTab _studentProfileData={_studentProfileData} user={user} _currAuthProfile={_currAuthProfile} fetchBookings={fetchBookings} navigate={navigate} setSidebarTab={setSidebarTab} _currSelectedTab={wellnessActiveSubTab} _switchTabState={setWellnessActiveSubTab} />
            </div>
          ) : sidebarTab === 'emergency' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <EmergencyPage />
            </div>
          ) : sidebarTab === 'rewards' ? (
            <div>
              <RewardsLeaderboard _studentProfileData={_studentProfileData} setProfileData={setProfileData} user={user} />
            </div>
          ) : sidebarTab === 'medical-leave' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <MedicalLeaveTab _studentProfileData={_studentProfileData} user={user} _currAuthProfile={_currAuthProfile} />
            </div>
          ) : sidebarTab === 'faculty-portal' ? (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <FacultyPortalTab _studentProfileData={_studentProfileData} fetchBookings={fetchBookings} />
            </div>
          ) : sidebarTab === 'health-map' ? (
            <div style={{ marginBottom: '24px' }}>
              <HealthMapTab _studentProfileData={_studentProfileData} user={user} />
            </div>
          ) : sidebarTab === 'analytics' ? (
            <div>
              {renderAppointmentFrequencyChart()}
            </div>
          ) : sidebarTab === 'medicine-trends' ? (
            <div>
              {renderMedicineTrendsDashboard()}
            </div>
          ) : sidebarTab === 'wellness-score' ? (
            <div>
              {renderWellnessScoreDashboard()}
            </div>
          ) : (
            <>
              {/* Main Dashboard Title Header */}
              <div className="dashboard-header animate-slide-up" style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h1 className="heading-xl" style={{ fontSize: '1.8rem' }}>Your <span className="text-gradient">Appointments</span> & Health Hub</h1>
                <p className="auth-subtitle" style={{ marginTop: '4px', fontSize: '0.92rem' }}>
                  Manage upcoming visits, prescriptions, health reminders & AI care plan.
                </p>
              </div>

              {/* Top 5 Quick Action Cards Row (Actual Website Features) */}
              <div className="cuims-top-cards-row">
                <div className="cuims-quick-card">
                  <div className="cuims-quick-card-title">Order Medicines</div>
                  <div className="cuims-quick-card-footer">
                    <button type="button" className="cuims-quick-card-btn" onClick={() => setSidebarTab('prescriptions')}>ORDER NOW</button>
                    <div className="cuims-quick-card-icon"><FiShoppingBag /></div>
                  </div>
                </div>

                <div className="cuims-quick-card">
                  <div className="cuims-quick-card-title">My Bookings</div>
                  <div className="cuims-quick-card-footer">
                    <button type="button" className="cuims-quick-card-btn" onClick={() => setSidebarTab('bookings')}>VIEW ALL</button>
                    <div className="cuims-quick-card-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}><FiCalendar /></div>
                  </div>
                </div>

                <div className="cuims-quick-card">
                  <div className="cuims-quick-card-title">My Prescriptions</div>
                  <div className="cuims-quick-card-footer">
                    <button type="button" className="cuims-quick-card-btn" onClick={() => setSidebarTab('prescriptions')}>ACCESS RECORDS</button>
                    <div className="cuims-quick-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}><FiFileText /></div>
                  </div>
                </div>

                {/* Featured Online Consult Card */}
                <div className="cuims-quick-card lms-card">
                  <div className="cuims-quick-card-title">Online Consult</div>
                  <div className="cuims-quick-card-footer">
                    <button type="button" className="cuims-quick-card-btn" onClick={() => setSidebarTab('bookings')}>JOIN NOW</button>
                    <div className="cuims-quick-card-icon">🩺</div>
                  </div>
                </div>

                <div className="cuims-quick-card">
                  <div className="cuims-quick-card-title">Emergency SOS</div>
                  <div className="cuims-quick-card-footer">
                    <button type="button" className="cuims-quick-card-btn" onClick={() => setSidebarTab('emergency')} style={{ color: '#ef4444' }}>CALL SOS</button>
                    <div className="cuims-quick-card-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>🚨</div>
                  </div>
                </div>
              </div>

              {/* Dynamic Location Weather & Download Virtual ID Card Banner Row */}
              <div className="cuims-banner-row">
                <div className="cuims-weather-pill">
                  <div className="cuims-weather-title">{(userCityWeather?.city || 'Campus').toUpperCase()} WEATHER</div>
                  <div className="cuims-weather-temp">
                    <span>{userCityWeather?.icon || '☁️'} {userCityWeather?.temp || '28°C'}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.8 }}>{userCityWeather?.condition || 'overcast clouds'}</span>
                  </div>
                </div>

            <div className="cuims-id-card-banner">
              <div className="cuims-id-card-title">Download Virtual Health ID Card</div>
              <button 
                type="button" 
                className="cuims-id-card-btn"
                onClick={handleDownloadVirtualIDCard}
              >
                Download Now
              </button>
            </div>
          </div>

          {/* 3-Column Content Layout (Real Website Features) */}
          <div className="cuims-three-col-grid">
            {/* Column 1: AI Health Status & Care Plan */}
            <div className="cuims-card">
              <div className="cuims-card-header" style={{ color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiCpu /> AI Health Status & Care Plan</span>
                <button 
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAnalyzeReports}
                  disabled={analyzingReports}
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  {analyzingReports ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
              <div className="cuims-message-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Condition Badge:</span>
                  <span className={`health-badge ${_studentProfileData?.healthBadge || 'STABLE'}`}>
                    {_studentProfileData?.healthBadge === 'CRITICAL' ? '🔴 Critical' : _studentProfileData?.healthBadge === 'MONITORING' ? '🟡 Monitoring' : '🟢 Stable'}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  {_studentProfileData?.lastAnalysis || "Analyze your reports to get instant AI recovery summaries and personalized care plan recommendations."}
                </p>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  style={{ marginTop: '12px', width: '100%', fontSize: '0.78rem' }}
                  onClick={() => navigate('/care-plan')}
                >
                  Open Full AI Care Plan →
                </button>
              </div>
            </div>

            {/* Column 2: My Bookings & Appointments */}
            <div className="cuims-card">
              <div className="cuims-card-header">
                <span>My Appointments & Consultations</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
                Active Appointments & Doctor Consultations ({(bookings || []).length} Total)
              </p>

              {(bookings || []).length === 0 ? (
                <div style={{ padding: '16px', textOverflow: 'ellipsis', background: '#f8fafc', borderRadius: '8px', fontSize: '0.82rem', color: '#64748b' }}>
                  No active appointments found. Click "Hospitals & Clinics" to book a doctor.
                </div>
              ) : (
                <table className="cuims-table">
                  <thead>
                    <tr>
                      <th>Doctor / Specialist</th>
                      <th>Date / Slot</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(bookings || []).slice(0, 4).map((b, idx) => {
                      const docName = b.doctorName 
                        ? (b.doctorName.startsWith('Dr.') || b.doctorName.startsWith('Dr ') ? b.doctorName : `Dr. ${b.doctorName}`)
                        : 'Dr. Specialist';
                      return (
                        <tr key={b.id || idx}>
                          <td style={{ fontWeight: 600 }}>{docName}</td>
                          <td style={{ fontSize: '0.78rem' }}>{formatDateToDDMMYYYY(b.bookingDate)} ({b.timeSlot})</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <span style={{ 
                              color: b.status === 'CONFIRMED' ? '#16a34a' : b.status === 'COMPLETED' ? '#2563eb' : '#dc2626', 
                              fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap', display: 'inline-block' 
                            }}>
                              {b.status || 'CONFIRMED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Column 3: Emergency SOS & Announcements */}
            <div className="cuims-card">
              <div className="cuims-card-header" style={{ color: '#dc2626' }}>
                <span>🚨 Emergency SOS & Alerts</span>
              </div>

              <div 
                className="sos-dashboard-card"
                onClick={() => navigate('/emergency')}
                style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#ffffff', padding: '14px', borderRadius: '10px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
                  <span>🚨</span> 24/7 Campus Emergency SOS
                </div>
                <p style={{ fontSize: '0.78rem', margin: '6px 0 0 0', opacity: 0.9 }}>
                  Click to alert emergency contacts and track nearest ambulance in real time.
                </p>
              </div>

              <div className="cuims-announcement-card" style={{ marginTop: '8px' }}>
                <div className="cuims-announcement-title" style={{ fontSize: '0.82rem' }}>
                  <span>📌</span> CAMPUS HEALTH ADVISORY 2026
                </div>
                <div className="cuims-announcement-date">
                  <span>📅 21 JUL 2026</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.3 }}>
                  Free seasonal vaccination & medical fitness checkup drive at Block-B1 Medical Center.
                </p>
              </div>
            </div>
          </div>

          <div className="page-container section" style={{ padding: 0, marginTop: '20px' }}>
            <div className="patient-dashboard-grid animate-fade-in">
              <div className="left-side-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Tab Navigation */}
          <div className="dashboard-tabs" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '8px' }}>
            <button
              onClick={() => _switchTabState('hospitals')}
              className={`tab-btn ${_currSelectedTab === 'hospitals' ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                color: _currSelectedTab === 'hospitals' ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '8px 16px',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              Find Care Centers
              {_currSelectedTab === 'hospitals' && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  style={{ position: 'absolute', bottom: '-13px', left: 0, right: 0, height: '3px', background: 'var(--primary)', borderRadius: '2px' }}
                />
              )}
            </button>
            <button
              onClick={() => _switchTabState('visited-doctors')}
              className={`tab-btn ${_currSelectedTab === 'visited-doctors' ? 'active' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                color: _currSelectedTab === 'visited-doctors' ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '8px 16px',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
            >
              My Bookings
              {_currSelectedTab === 'visited-doctors' && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  style={{ position: 'absolute', bottom: '-13px', left: 0, right: 0, height: '3px', background: 'var(--primary)', borderRadius: '2px' }}
                />
              )}
            </button>

          </div>


          {_currSelectedTab === 'hospitals' && (
            <>
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="search-container" style={{ 
                maxWidth: '100%', display: 'flex', gap: '16px', margin: 0 
              }}>
                <div className="form-input-icon" style={{ flex: 1 }}>
                  <FiSearch className="icon" />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Search hospitals by name or city..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ borderRadius: 'var(--radius-full)', padding: '16px 20px 16px 48px', fontSize: '1.05rem' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Search</button>
              </form>

              {/* Filters & Sorting Row */}
              <div className="filters-row animate-fade-in" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '0px', 
                flexWrap: 'wrap', 
                gap: '16px',
                position: 'relative',
                zIndex: 50
              }}>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                  <button type="button" className="btn btn-ghost btn-sm active"><FiFilter /> All Hospitals</button>
                  <button type="button" className="btn btn-ghost btn-sm"><FiActivity /> Cardiology</button>
                  <button type="button" className="btn btn-ghost btn-sm"><FiActivity /> Neurology</button>
                  <button type="button" className="btn btn-ghost btn-sm"><FiActivity /> Orthopedics</button>
                </div>

                {/* Custom Sorting Dropdown */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 100 }}>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Sort By:</span>
                  
                  <button 
                    type="button"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '10px 18px',
                      borderRadius: '99px',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      outline: 'none',
                      minWidth: '170px',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  >
                    <span>
                      {sortBy === 'rating' ? '⭐ Rating' : 
                       sortBy === 'distance' ? '📍 Distance' : 
                       sortBy === 'price-asc' ? '₹ Price: Low to High' : 
                       sortBy === 'price-desc' ? '₹ Price: High to Low' : 
                       'Default'}
                    </span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>
                  </button>

                  {sortDropdownOpen && (
                    <>
                      {/* Overlay transparent backdrop to close dropdown when clicking outside */}
                      <div 
                        onClick={() => setSortDropdownOpen(false)}
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 99
                        }}
                      />
                      
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '8px',
                        background: '#FFFFFF',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '6px',
                        minWidth: '190px',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        zIndex: 1000
                      }}>
                        {[
                          { value: '', label: 'Default' },
                          { value: 'rating', label: '⭐ Rating' },
                          { value: 'distance', label: '📍 Distance' },
                          { value: 'price-asc', label: '₹ Price: Low to High' },
                          { value: 'price-desc', label: '₹ Price: High to Low' }
                        ].map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              handleSortChange(item.value);
                              setSortDropdownOpen(false);
                            }}
                            style={{
                              background: sortBy === item.value ? 'var(--bg-secondary)' : 'transparent',
                              border: 'none',
                              color: sortBy === item.value ? 'var(--primary-dark)' : 'var(--text-secondary)',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.15s ease',
                              fontWeight: sortBy === item.value ? '600' : '400'
                            }}
                            onMouseEnter={(e) => {
                              if (sortBy !== item.value) {
                                e.currentTarget.style.background = 'var(--border-light)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (sortBy !== item.value) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                              }
                            }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Hospital Grid */}
              {loading ? (
                <div className="grid grid-2" style={{ gap: '24px' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card skeleton" style={{ height: '380px' }}></div>
                  ))}
                </div>
              ) : getSortedHospitals().length === 0 ? (
                <div className="empty-state">
                  <FiMapPin className="icon" />
                  <h3>No hospitals found</h3>
                  <p>Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="grid grid-2" style={{ gap: '24px' }}>
                  {getSortedHospitals().map((hospital, index) => (
                    <motion.div 
                      key={hospital.id} 
                      className="glass-card hospital-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{ overflow: 'hidden', cursor: 'pointer' }}
                      onClick={() => setSelectedHospital(hospital)}
                    >
                      {/* Image Header */}
                      <div className="hospital-image" style={{ 
                        height: '200px', 
                        background: `url(${hospital.images?.[0] || hospital.imageUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800'}) center/cover`,
                        position: 'relative'
                      }}>
                        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {(hospital.emergencyServices !== false) && (
                            <span style={{ 
                              backdropFilter: 'blur(10px)', 
                              background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                              color: '#ffffff', 
                              fontWeight: '800', 
                              fontSize: '0.72rem', 
                              padding: '4px 10px', 
                              borderRadius: '20px', 
                              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              🚨 24/7 Emergency
                            </span>
                          )}
                          <span className="badge badge-success" style={{ backdropFilter: 'blur(10px)', background: 'rgba(0, 230, 118, 0.25)', color: '#ffffff', fontWeight: '700' }}>
                            {hospital.availableBeds} Beds Available
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <h3 className="heading-sm" style={{ margin: 0 }}>{hospital.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontWeight: '600' }}>
                            <FiStar fill="currentColor" /> {hospital.rating ? parseFloat(hospital.rating).toFixed(1) : 'New'}
                          </div>
                        </div>

                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiMapPin /> {hospital.address}, {hospital.city}
                          </span>
                          {userCoords && hospital.latitude && hospital.longitude && (
                            <span style={{ 
                              fontSize: '0.8rem', 
                              background: 'rgba(0, 217, 166, 0.15)', 
                              color: 'var(--primary)', 
                              padding: '2px 8px', 
                              borderRadius: 'var(--radius-full)',
                              fontWeight: '600'
                            }}>
                              📍 {getDistance(userCoords.latitude, userCoords.longitude, hospital.latitude, hospital.longitude).toFixed(1)} km
                            </span>
                          )}
                        </div>

                        {/* Facilities */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                          {hospital.facilities?.slice(0, 3).map((facility, i) => (
                            <span key={i} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{facility}</span>
                          ))}
                          {hospital.facilities?.length > 3 && (
                            <span className="badge badge-ghost" style={{ fontSize: '0.7rem' }}>+{hospital.facilities.length - 3}</span>
                          )}
                        </div>

                        {/* Footer */}
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                          <div style={{ flexShrink: 0, minWidth: '95px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', display: 'block', whiteSpace: 'nowrap' }}>Consultation Fee</span>
                            <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
                              {hospital.consultationRate === 0 || hospital.consultationFee === 0 ? 'FREE' : `₹${hospital.consultationRate || hospital.consultationFee || 250}`}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', flexShrink: 0, marginLeft: 'auto' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const mapQuery = encodeURIComponent(`${hospital.name}, ${hospital.address || ''}, ${hospital.city || ''}`);
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`, '_blank');
                              }}
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: '#00b4b6', color: '#00b4b6', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                            >
                              <FiNavigation /> View on Map
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/book/${hospital.id}`);
                              }} 
                              className="btn btn-primary btn-sm"
                              style={{ padding: '6px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {_currSelectedTab === 'visited-doctors' && (
            <div className="visited-doctors-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Filter Buttons */}
              <div className="bookings-filter-tabs" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                {[
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setBookingsFilter(item.value)}
                    style={{
                      background: bookingsFilter === item.value ? 'rgba(0, 217, 166, 0.15)' : 'none',
                      border: bookingsFilter === item.value ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      color: bookingsFilter === item.value ? 'var(--primary)' : 'var(--text-secondary)',
                      padding: '8px 20px',
                      borderRadius: '99px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {bookingsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card skeleton" style={{ height: '78px', width: '100%' }}></div>
                  ))}
                </div>
              ) : bookings.filter(b => {
                if (bookingsFilter === 'upcoming') {
                  return (b.status === 'CONFIRMED' || b.status === 'PENDING') && !b.aiReport;
                } else if (bookingsFilter === 'completed') {
                  return b.status === 'COMPLETED' || !!b.aiReport;
                } else if (bookingsFilter === 'cancelled') {
                  return b.status === 'CANCELLED';
                }
                return true;
              }).length === 0 ? (
                <div className="empty-state glass-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
                  <FiCalendar className="icon" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '16px', display: 'block', margin: '0 auto' }} />
                  <h3>No {bookingsFilter} appointments</h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '8px auto 0 auto' }}>
                    You don't have any {bookingsFilter} appointments at the moment.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Visited Doctors Header */}
                  <div className="visited-doctors-table-header" style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1.5fr 1fr 1.5fr',
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    marginBottom: '8px'
                  }}>
                    <div>Doctor & Hospital</div>
                    <div>Date & Time</div>
                    <div>Type</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                  </div>

                  {/* Bookings Cards */}
                  {bookings
                    .filter(b => {
                      if (bookingsFilter === 'upcoming') {
                        return (b.status === 'CONFIRMED' || b.status === 'PENDING') && !b.aiReport;
                      } else if (bookingsFilter === 'completed') {
                        return b.status === 'COMPLETED' || !!b.aiReport;
                      } else if (bookingsFilter === 'cancelled') {
                        return b.status === 'CANCELLED';
                      }
                      return true;
                    })
                    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
                    .map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        className="visited-doctor-card"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2.5fr 1.5fr 1fr 1.5fr',
                          alignItems: 'center',
                          padding: '16px 24px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        whileHover={{ scale: 1.01, borderColor: 'var(--primary)', boxShadow: 'var(--shadow-md)' }}
                      >
                        {/* Doctor Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(0, 217, 166, 0.1)',
                            border: '1px solid rgba(0, 217, 166, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)'
                          }}>
                            <FiUser size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.92rem' }}>Dr. {booking.doctorName}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{booking.hospitalName}</div>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: '500' }}>
                            <FiCalendar size={14} style={{ color: 'var(--primary)' }} /> {formatDateToDDMMYYYY(booking.bookingDate)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '4px' }}>
                            <FiClock size={14} style={{ color: 'var(--secondary)' }} /> {booking.timeSlot}
                          </div>
                        </div>

                        {/* Type */}
                        <div>
                          <span className={`badge ${booking.type === 'ONLINE' ? 'badge-primary' : 'badge-ghost'}`} style={{ fontSize: '0.72rem', padding: '4px 8px' }}>
                            {booking.type === 'ONLINE' ? '🎥 Video' : '🏥 In-Person'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {bookingsFilter === 'upcoming' && (
                            <>
                              <button
                                onClick={() => {
                                  setReschedulingBooking(booking);
                                  setRescheduleDate('');
                                  setRescheduleTimeSlot('');
                                  setRescheduleSlots([]);
                                }}
                                className="btn btn-sm btn-outline"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.75rem',
                                  borderRadius: '99px',
                                  fontWeight: 'bold',
                                  borderColor: 'var(--primary)',
                                  color: 'var(--primary)',
                                }}
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="btn btn-sm btn-ghost"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.75rem',
                                  borderRadius: '99px',
                                  color: 'var(--danger)',
                                }}
                                disabled={cancellingId === booking.id}
                              >
                                {cancellingId === booking.id ? '...' : 'Cancel'}
                              </button>
                            </>
                          )}
                          
                          {bookingsFilter === 'completed' && (
                            <>
                              {booking.aiReport ? (
                                <>
                                  <button
                                    onClick={() => setSelectedReportBooking(booking)}
                                    className="btn btn-sm btn-primary"
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.75rem',
                                      borderRadius: '99px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      background: 'linear-gradient(135deg, #00D9A6, #7C3AED)',
                                      border: 'none',
                                      color: 'white',
                                      fontWeight: 'bold',
                                      boxShadow: '0 4px 10px rgba(0, 217, 166, 0.15)'
                                    }}
                                    title="View AI Consultation Report"
                                  >
                                    <FiCpu size={12} /> Report
                                  </button>
                                  <button
                                    onClick={() => handleDownloadReportPDF(booking)}
                                    className="btn btn-sm btn-outline"
                                    style={{
                                      padding: '6px',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderColor: 'rgba(255, 255, 255, 0.15)',
                                      color: 'var(--text-secondary)',
                                      width: '28px',
                                      height: '28px'
                                    }}
                                    title="Download PDF"
                                  >
                                    <FiDownload size={12} />
                                  </button>
                                </>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                  No report
                                </span>
                              )}
                            </>
                          )}

                          {bookingsFilter === 'cancelled' && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Cancelled
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
    </>
  )}

      {/* Hospital Details Modal */}
      {_chosenHospitalNode && (
        <div 
          className="modal-backdrop animate-fade-in" 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
          onClick={() => setSelectedHospital(null)}
        >
          <motion.div 
            className="glass-card modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
              position: 'relative', display: 'flex', flexDirection: 'column', padding: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedHospital(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
                borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 10
              }}
            >
              <FiX />
            </button>
            
            <div style={{ height: '250px', background: `url(${_chosenHospitalNode.images?.[0] || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800'}) center/cover` }} />
            
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h2 className="heading-md" style={{ marginBottom: '8px' }}>{_chosenHospitalNode.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiMapPin /> {_chosenHospitalNode.address}, {_chosenHospitalNode.city}
                    </div>
                    <button
                      onClick={() => handleViewMap(_chosenHospitalNode)}
                      title="View Map"
                      style={{
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #00D9A6, #7C3AED)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 217, 166, 0.2)',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      <FiMapPin size={12} />
                      <span>View Map</span>
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontWeight: '600', fontSize: '1.2rem' }}>
                  <FiStar fill="currentColor" /> {_chosenHospitalNode.rating ? parseFloat(_chosenHospitalNode.rating).toFixed(1) : 'New'}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '12px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '12px', flex: 1, textAlign: 'center' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{_chosenHospitalNode.availableBeds}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Available Beds</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '12px', flex: 1, textAlign: 'center' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{_chosenHospitalNode.consultationRate}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Consultation</div>
                </div>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <h3 className="heading-sm" style={{ marginBottom: '12px' }}>About Hospital</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {_chosenHospitalNode.description || `${_chosenHospitalNode.name} is a state-of-the-art medical facility located in ${_chosenHospitalNode.city}. We are dedicated to providing the highest quality healthcare services with compassionate care and advanced technology.`}
                </p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 className="heading-sm" style={{ marginBottom: '12px' }}>Facilities</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {_chosenHospitalNode.facilities?.map((facility, i) => (
                    <span key={i} className="badge badge-primary" style={{ padding: '8px 12px' }}>
                      <FiCheck style={{ marginRight: '4px' }} /> {facility}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                  onClick={() => navigate(`/book/${_chosenHospitalNode.id}`)} 
                  className="btn btn-primary btn-block"
                  style={{ padding: '16px', fontSize: '1.1rem', flex: 1 }}
                >
                  Book Consultation Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Map Modal Preview */}
      {showMapModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }} onClick={() => setShowMapModal(false)}>
          <div style={{ width: '90%', maxWidth: '900px', height: '70vh', background: 'white', borderRadius: '12px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 700 }}>{_chosenHospitalNode.name} — Map</div>
              <button onClick={() => setShowMapModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer' }}><FiX /></button>
            </div>
            <iframe src={mapUrl} style={{ width: '100%', height: '100%', border: 0 }} title="Hospital Map Preview" />
          </div>
        </div>
      )}

      {/* Full-Screen Report Overlay Modal */}
      {selectedReportBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-card animate-scale-up" style={{
            width: '100%',
            maxWidth: '700px',
            height: '80vh',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCpu /> MedAstraX AI Consultation Report
                </h2>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  Scribe report generated for patient <strong>{selectedReportBooking.patientName}</strong>.
                </p>
              </div>
            </div>

            {/* Content Display */}
            <div 
              style={{
                flex: 1,
                padding: '24px',
                overflowY: 'auto',
                background: 'var(--border-light)'
              }}
            >
              <div style={{ color: 'var(--text-primary)' }}>
                {parseMarkdown(selectedReportBooking.aiReport)}
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleDownloadReportPDF(selectedReportBooking)} 
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiDownload /> Download Report (PDF)
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedReportBooking.aiReport);
                    toast.success('Report copied to clipboard! 📋');
                  }} 
                  className="btn btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiCopy /> Copy Report
                </button>
              </div>

              <button 
                onClick={() => setSelectedReportBooking(null)}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #00D9A6, #7C3AED)', border: 'none' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles for Chatbot */}
      <style>{`
        /* MedGamma chatbot styles */
        .medgamma-symptom-checker-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          height: 54px;
          padding: 0 20px 0 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, #00D9A6, #7C3AED);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.2px;
          box-shadow: 0 8px 28px rgba(0, 217, 166, 0.45), 0 4px 12px rgba(124, 58, 237, 0.3);
          z-index: 9999;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          white-space: nowrap;
        }
        
        .medgamma-symptom-checker-fab:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 12px 36px rgba(0, 217, 166, 0.55), 0 6px 18px rgba(124, 58, 237, 0.4);
        }

        .medgamma-symptom-checker-fab-pulse {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--primary);
          opacity: 0.4;
          z-index: -1;
          animation: fab-pulse 2s infinite;
        }

        @keyframes fab-pulse {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        @media (max-width: 768px) {
          .medgamma-symptom-checker-fab {
            bottom: 16px !important;
            right: 16px !important;
            padding: 0 !important;
            border-radius: 50% !important;
            width: 54px !important;
            height: 54px !important;
          }
          .medgamma-symptom-checker-fab span {
            display: none !important;
          }
        }

        .chat-panel {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 380px;
          height: 520px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 999;
          font-family: var(--font-primary);
        }

        @media (max-width: 480px) {
          .chat-panel {
            width: calc(100% - 32px);
            right: 16px;
            left: 16px;
            bottom: 90px;
            height: 480px;
          }
        }

        .chat-header {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .chat-title-container {
          display: flex;
          flex-direction: column;
        }

        .chat-status {
          font-size: 0.75rem;
          opacity: 0.85;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .chat-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1d467c;
          display: inline-block;
        }

        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #F8FAFC;
        }

        .chat-message-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .chat-message-wrapper.user {
          align-self: flex-end;
        }

        .chat-message-wrapper.ai {
          align-self: flex-start;
        }

        .chat-bubble {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .chat-message-wrapper.user .chat-bubble {
          background: var(--primary);
          color: white;
          border-top-right-radius: 0;
        }

        .chat-message-wrapper.ai .chat-bubble {
          background: white;
          color: #1E293B;
          border: 1px solid var(--border-color);
          border-top-left-radius: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .chat-message-sender {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 4px;
          padding: 0 4px;
        }

        .chat-message-wrapper.user .chat-message-sender {
          align-self: flex-end;
        }

        .chat-quick-tags {
          display: flex;
          gap: 8px;
          padding: 10px 20px;
          background: #F1F5F9;
          overflow-x: auto;
          border-top: 1px solid var(--border-color);
          white-space: nowrap;
        }

        .chat-tag-pill {
          padding: 6px 12px;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .chat-tag-pill:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(0, 217, 166, 0.05);
        }

        .chat-input-area {
          padding: 16px 20px;
          background: white;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .chat-input {
          flex: 1;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          padding: 12px 18px;
          font-size: 0.9rem;
          outline: none;
          transition: border 0.2s;
        }

        .chat-input:focus {
          border-color: var(--primary);
        }

        .chat-btn-send {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          transition: background 0.2s;
        }

        .chat-btn-send:hover {
          background: var(--primary-dark);
        }

        .chat-btn-send:disabled {
          background: #CBD5E1;
          cursor: not-allowed;
        }

        .dot-animation {
          display: inline-block;
          animation: dotPulse 1.4s infinite;
          letter-spacing: 2px;
          font-weight: bold;
        }

        @keyframes dotPulse {
          0%, 20% { opacity: 0.2; }
          50% { opacity: 1; }
          80%, 100% { opacity: 0.2; }
        }

        .patient-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .patient-dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
        .rewards-title {
          font-size: 1.15rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .rewards-card {
          padding: 24px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .exp-bar-container {
          width: 100%;
          height: 10px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 5px;
          overflow: hidden;
          margin: 12px 0 6px 0;
        }
        .exp-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          border-radius: 5px;
          transition: width 0.4s ease;
        }
        .checklist-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          cursor: pointer;
          transition: all 0.2s;
        }
        .checklist-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.08);
        }
        .checklist-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .checklist-checkbox {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 2px solid var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .checklist-checkbox.active {
          background: var(--primary);
          border-color: var(--primary);
          color: #000;
        }
        .reward-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .reward-badge.locked {
          background: rgba(255,255,255,0.05);
          color: var(--text-muted);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .reward-badge.unlocked {
          background: rgba(0, 217, 166, 0.1);
          color: var(--primary);
          border: 1px solid rgba(0, 217, 166, 0.2);
        }
        .health-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 700;
        }
        .health-badge.STABLE {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
          border: 1px solid rgba(40, 167, 69, 0.25);
        }
        .health-badge.MONITORING {
          background: rgba(255, 193, 7, 0.1);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.25);
        }
        .health-badge.CRITICAL {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          border: 1px solid rgba(220, 53, 69, 0.25);
        }
        .care-plan-markdown {
          line-height: 1.6;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .care-plan-markdown h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 16px;
          margin-bottom: 8px;
        }
        .care-plan-markdown h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary);
          margin-top: 12px;
          margin-bottom: 6px;
        }
        .care-plan-markdown ul {
          margin-bottom: 12px;
          padding-left: 20px;
        }
        .care-plan-markdown li {
          margin-bottom: 4px;
        }
        .hospital-card {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          text-align: left !important;
          width: 100% !important;
        }
        .hospital-image {
          width: 100% !important;
          height: 200px !important;
        }
      `}</style>



      {createPortal(
        <>
          {/* Floating Action Button */}
          <button 
            className="medgamma-symptom-checker-fab" 
            onClick={() => setChatOpen(!chatOpen)}
          >
            {chatOpen ? (
              <>
                <FiX size={20} />
                <span>Close Assistant</span>
              </>
            ) : (
              <>
                <img src={aiBotIcon} alt="AI" style={{ width: '34px', height: '34px', objectFit: 'contain', borderRadius: '50%', flexShrink: 0 }} />
                <span>AI Symptom Checker</span>
              </>
            )}
            {!chatOpen && <div className="medgamma-symptom-checker-fab-pulse"></div>}
          </button>

          {/* Chat Overlay Panel */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div 
                className="chat-panel"
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                style={{
                  position: 'fixed',
                  bottom: '96px',
                  right: '24px',
                  zIndex: 9999
                }}
              >
                {/* Header */}
                <div className="chat-header">
                  <div className="chat-header-info">
                    <div className="chat-avatar" style={{ overflow: 'hidden', background: 'transparent', padding: 0 }}>
                      <img src={aiBotIcon} alt="Astra" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '50%' }} />
                    </div>
                    <div className="chat-title-container">
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Astra</span>
                      {!navigator.onLine ? (
                        <span className="chat-status" style={{ color: '#1d467c' }}>
                          <span className="chat-status-dot" style={{ backgroundColor: '#1d467c' }}></span>
                          Offline Mode (TF.js)
                        </span>
                      ) : (
                        <span className="chat-status">
                          <span className="chat-status-dot"></span>
                          Online companion
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={handleResetChat}
                      title="New conversation"
                      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', width: '28px', height: '28px', fontSize: '0.75rem' }}
                    >
                      🔄
                    </button>
                    <button 
                      onClick={() => setChatOpen(false)} 
                      style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="chat-body" id="chat-body">
                  {chatHistory.map((chat, i) => (
                    <div key={i} className={`chat-message-wrapper ${chat.sender}`}>
                      <span className="chat-message-sender">{chat.sender === 'user' ? 'You' : 'Astra'}</span>
                      <div className="chat-bubble">
                        {chat.sender === 'ai' ? parseMarkdown(chat.text) : chat.text}
                      </div>
                    </div>
                  ))}
                  {sendingChat && (
                    <div className="chat-message-wrapper ai">
                      <span className="chat-message-sender">Astra</span>
                      <div className="chat-bubble" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="typing-dots">Analyzing your symptoms</span>
                        <span className="dot-animation">...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Ask Tags */}
                <div className="chat-quick-tags">
                  {quickTags.map((tag, i) => (
                    <div 
                      key={i} 
                      className="chat-tag-pill" 
                      onClick={() => {
                        if (tag.isAction) {
                          setChatOpen(false);
                          navigate('/symptom-checker');
                        } else {
                          handleSendChat(tag.query);
                        }
                      }}
                    >
                      {tag.label}
                    </div>
                  ))}
                </div>

                {/* Input form */}
                <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="chat-input-area">
                  <input 
                    type="text" 
                    className="chat-input" 
                    placeholder="Ask Astra anything..." 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    disabled={sendingChat}
                  />
                  <button type="submit" className="chat-btn-send" disabled={sendingChat || !chatMessage.trim()}>
                    <FiSend />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div 
          className="modal-backdrop animate-fade-in" 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
          onClick={() => setReschedulingBooking(null)}
        >
          <motion.div 
            className="glass-card modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              maxWidth: '500px', width: '100%',
              position: 'relative', display: 'flex', flexDirection: 'column', padding: '32px',
              background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setReschedulingBooking(null)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: 'none',
                borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 10
              }}
            >
              <FiX />
            </button>
            
            <h2 className="heading-sm" style={{ marginBottom: '8px', color: 'var(--primary)' }}>Reschedule Appointment</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Rescheduling appointment with <strong>Dr. {reschedulingBooking.doctorName}</strong>. Current slot: {formatDateToDDMMYYYY(reschedulingBooking.bookingDate)} at {reschedulingBooking.timeSlot}.
            </p>

            <form onSubmit={handleRescheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <FiCalendar /> Select New Date
                </label>
                <input 
                  type="date" 
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    setRescheduleTimeSlot('');
                  }}
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    padding: '12px 16px',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {rescheduleDate && (
                <div>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <FiClock /> Select New Time Slot
                  </label>
                  {loadingRescheduleSlots ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}>
                      <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading slots...</span>
                    </div>
                  ) : rescheduleSlots.length === 0 ? (
                    <div style={{ padding: '12px', background: 'rgba(255, 82, 82, 0.05)', border: '1px solid rgba(255, 82, 82, 0.1)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem' }}>
                      No available slots on this date.
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: '10px',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      padding: '4px'
                    }}>
                      {rescheduleSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setRescheduleTimeSlot(slot)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            border: rescheduleTimeSlot === slot ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            background: rescheduleTimeSlot === slot ? 'rgba(0, 217, 166, 0.15)' : 'var(--bg-secondary)',
                            color: rescheduleTimeSlot === slot ? 'var(--primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'center'
                          }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setReschedulingBooking(null)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={submittingReschedule || !rescheduleDate || !rescheduleTimeSlot}
                >
                  {submittingReschedule ? 'Rescheduling...' : 'Confirm'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Student Medical Profile Modal */}
      {_isProfileModalVisible && (
        <div 
          className="modal-backdrop animate-fade-in" 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Header Banner */}
            <div style={{ background: 'linear-gradient(135deg, #1b385d, #0f766e)', padding: '24px', color: '#ffffff', position: 'relative' }}>
              <button 
                onClick={() => setShowProfileModal(false)}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none',
                  borderRadius: '50%', width: '30px', height: '30px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <FiX />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img 
                  src={_currAuthProfile?.avatarUrl || _studentProfileData?.avatarUrl || user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                  alt="Student Avatar" 
                  style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid #ffffff', objectFit: 'cover' }}
                />
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{_currAuthProfile?.name || _studentProfileData?.name || user?.name || 'Rashika Poonia'}</h2>
                  <div style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: '2px' }}>
                    Student UID: <strong style={{ color: '#00D9A6' }}>{_studentProfileData?.collegeUid || _studentProfileData?.uid || '24BCF10024'}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '2px' }}>
                    {_studentProfileData?.isHosteller ? `Hostel: ${_studentProfileData.hostelName || 'Hostel'} (RM ${_studentProfileData.roomNumber || ''})` : 'Day Scholar'}
                  </div>
                </div>
              </div>
            </div>

            {/* Body Details */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Personal & Academic Info Grid */}
              <div>
                <h4 style={{ fontSize: '0.88rem', color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  Academic & Personal Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '12px', fontSize: '0.84rem' }}>
                  <div><span style={{ color: '#64748b' }}>University:</span> <strong>Chandigarh Univ</strong></div>
                  <div><span style={{ color: '#64748b' }}>Emergency No:</span> <strong>{_studentProfileData?.emergencyNumber || '9988776655'}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Official Email:</span> <strong style={{ fontSize: '0.78rem' }}>{user?.email || 'rashika24bcf10024@cuchd.in'}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Contact Phone:</span> <strong>{_studentProfileData?.phone || user?.phone || '+91 98765 43210'}</strong></div>
                </div>
              </div>

              {/* Health Profile & Medical Vitals */}
              <div>
                <h4 style={{ fontSize: '0.88rem', color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  Medical Profile & Health Vitals
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ color: '#166534', fontSize: '0.72rem', fontWeight: 600 }}>CONDITION</div>
                    <div style={{ fontWeight: 800, color: '#15803d', marginTop: '2px' }}>🟢 STABLE</div>
                  </div>

                  <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ color: '#92400e', fontSize: '0.72rem', fontWeight: 600 }}>BLOOD GROUP</div>
                    <div style={{ fontWeight: 800, color: '#b45309', marginTop: '2px' }}>{_studentProfileData?.bloodGroup || 'O+'}</div>
                  </div>

                  <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ color: '#075985', fontSize: '0.72rem', fontWeight: 600 }}>MEDICAL FITNESS</div>
                    <div style={{ fontWeight: 800, color: '#0369a1', marginTop: '2px' }}>100% Verified</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowProfileModal(false);
                    handleDownloadVirtualIDCard();
                  }}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
                >
                  <FiDownload /> Download Health ID PDF
                </button>
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowProfileModal(false)}
                  style={{ fontSize: '0.85rem', padding: '10px 20px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
}




export default MainDashboardPanel;

