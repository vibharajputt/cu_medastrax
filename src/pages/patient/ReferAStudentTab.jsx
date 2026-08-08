import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheck, FiShare2, FiGift, FiAward, FiUserPlus, FiUsers, FiDollarSign, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api';

export default function ReferAStudentTab({ profileData, user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const userType = localStorage.getItem('user_type');
  const isFaculty = user?.role === 'FACULTY' || profileData?.role === 'FACULTY' || userType === 'FACULTY' || user?.userRole === 'FACULTY';

  useEffect(() => {
    fetchStats();
  }, [profileData]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getReferralStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load referral stats', err);
    } finally {
      setLoading(false);
    }
  };

  const rawCode = stats?.referralCode || profileData?.referralCode || ('REF-' + (profileData?.collegeUid || user?.collegeUid || '24BCF10013').toUpperCase());
  const referralLink = `${window.location.origin}/signup?ref=${rawCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rawCode);
    setCopiedCode(true);
    toast.success('Referral code copied to clipboard! 📋');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success('Referral link copied to clipboard! 🔗');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="refer-a-student-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #0284c7 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(15, 118, 110, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <FiUserPlus size={28} color="#FFFFFF" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
              {isFaculty ? 'Refer Faculty & Earn Rewards' : 'Refer a Student & Earn Rewards'}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', opacity: 0.9, lineHeight: 1.4 }}>
              {isFaculty 
                ? 'Invite fellow faculty members & colleagues to join MedAstraX and earn concession points for healthcare services!'
                : 'Invite fellow students to join MedAstraX and earn concession points for healthcare services!'}
            </p>
          </div>
        </div>

        {/* Highlight Perks Badge */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backdropFilter: 'blur(8px)'
          }}>
            <FiGift size={22} color="#fbbf24" />
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.85, fontWeight: 700 }}>YOU GET</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 850 }}>100 Points</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backdropFilter: 'blur(8px)'
          }}>
            <FiAward size={22} color="#38bdf8" />
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.85, fontWeight: 700 }}>
                {isFaculty ? 'REFERRED FACULTY GETS' : 'REFERRED STUDENT GETS'}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 850 }}>80 Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code & Sharing Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {/* Card 1: Your Referral Code */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              {isFaculty ? 'Your Unique Faculty Referral Code' : 'Your Unique Referral Code'}
            </div>
            <div style={{
              background: '#f8fafc',
              border: '2px dashed #0d9488',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              fontSize: '1.6rem',
              fontWeight: 900,
              color: '#0f766e',
              letterSpacing: '2px'
            }}>
              {rawCode}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            style={{
              background: copiedCode ? '#16a34a' : '#0f766e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {copiedCode ? <FiCheck /> : <FiCopy />}
            {copiedCode ? 'Code Copied!' : 'Copy Referral Code'}
          </button>
        </div>

        {/* Card 2: Your Referral Link */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              {isFaculty ? 'Direct Signup Faculty Referral Link' : 'Direct Signup Referral Link'}
            </div>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '0.84rem',
              color: '#334155',
              wordBreak: 'break-all',
              lineHeight: 1.4,
              minHeight: '52px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {referralLink}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            style={{
              background: copiedLink ? '#16a34a' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {copiedLink ? <FiCheck /> : <FiShare2 />}
            {copiedLink ? 'Link Copied!' : 'Copy Referral Link'}
          </button>
        </div>
      </div>

      {/* How Points & Concessions Work Info Box */}
      <div style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <div style={{
          background: '#dcfce7',
          color: '#15803d',
          padding: '10px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <FiInfo size={22} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.98rem', fontWeight: 800, color: '#166534' }}>
            How Points & Concessions Work
          </h4>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#15803d', lineHeight: 1.5 }}>
            • <strong>100 Points</strong> will be credited to your account as soon as a referred {isFaculty ? 'faculty member' : 'student'} completes signup.<br />
            • The new {isFaculty ? 'faculty member' : 'student'} receives <strong>80 Points</strong> credited to their balance instantly upon using your code.<br />
            • <strong>Points Concession:</strong> Use your accumulated reward points directly at checkout to get price concessions/discounts when booking doctor appointments, lab tests, or ordering medicines!
          </p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#ccfbf1', color: '#0f766e', padding: '12px', borderRadius: '12px' }}>
            <FiUsers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              {isFaculty ? 'Faculty Members Referred' : 'Students Referred'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 850, color: '#0f172a' }}>{stats?.totalReferrals || 0}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '12px', borderRadius: '12px' }}>
            <FiGift size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Referral Points Earned</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 850, color: '#0284c7' }}>{stats?.totalPointsEarned || 0} pts</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fef3c7', color: '#d97706', padding: '12px', borderRadius: '12px' }}>
            <FiAward size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Available Points Balance</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 850, color: '#d97706' }}>{stats?.availablePoints || profileData?.expPoints || 0} pts</div>
          </div>
        </div>
      </div>

      {/* Referred Students / Faculty Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
          {isFaculty ? 'Referred Faculty History' : 'Referred Students History'}
        </h3>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading referral history...</div>
        ) : (stats?.referralHistory || []).length === 0 ? (
          <div style={{
            padding: '36px 20px',
            textAlign: 'center',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
            color: '#64748b'
          }}>
            <FiUserPlus size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155' }}>
              {isFaculty ? 'No faculty referrals yet' : 'No referrals yet'}
            </div>
            <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              {isFaculty 
                ? 'Share your referral code or link with fellow faculty members to start earning 100 points per registration!'
                : 'Share your referral code or link with fellow students to start earning 100 points per registration!'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569' }}>
                    {isFaculty ? 'Faculty Name' : 'Student Name'}
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569' }}>Date Joined</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Points Earned</th>
                </tr>
              </thead>
              <tbody>
                {(stats.referralHistory || []).map((ref) => (
                  <tr key={ref.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1e293b' }}>{ref.referredName}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>
                      {new Date(ref.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#16a34a', textAlign: 'right' }}>
                      +100 pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

