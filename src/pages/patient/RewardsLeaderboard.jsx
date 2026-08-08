import React, { useState, useEffect } from 'react';
import { 
  FiAward, FiTrendingUp, FiCheckCircle, FiGift, FiLock, 
  FiUserCheck, FiCopy, FiX, FiActivity, FiSmile, FiZap 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { rewardsAPI } from '../../services/api';
import './RewardsLeaderboard.css';

export default function RewardsLeaderboard({ profileData, setProfileData, user }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [filterRole, setFilterRole] = useState('ALL');
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState(profileData?.claimedRewards || []);
  const [activeModalReward, setActiveModalReward] = useState(null);

  const expPoints = profileData?.expPoints || 0;
  const streakDays = profileData?.streakDays || ((profileData?.medsChecked || profileData?.dietChecked || profileData?.exerciseChecked || profileData?.logChecked) ? 1 : 0);
  const isFaculty = user?.role === 'FACULTY' || profileData?.role === 'FACULTY';
  const roleTitle = isFaculty ? 'Faculty Member' : 'Student';

  const getLevelInfo = (exp) => {
    if (exp < 500) {
      return { level: 1, title: 'Health Starter', min: 0, max: 500, badge: 'Bronze Starter' };
    } else if (exp < 1000) {
      return { level: 2, title: 'Silver Health Champion', min: 500, max: 1000, badge: 'Silver Champion' };
    } else if (exp < 2000) {
      return { level: 3, title: 'Gold Wellness Ambassador', min: 1000, max: 2000, badge: 'Gold Ambassador' };
    } else if (exp < 5000) {
      return { level: 4, title: 'Platinum Care Master', min: 2000, max: 5000, badge: 'Platinum Master' };
    } else {
      return { level: 5, title: 'Diamond Health Legend', min: 5000, max: 10000, badge: 'Diamond Legend' };
    }
  };

  const currentTier = getLevelInfo(expPoints);
  const expInCurrentLevel = expPoints - currentTier.min;
  const levelRange = currentTier.max - currentTier.min;
  const progressPercent = Math.min(100, Math.max(0, Math.round((expInCurrentLevel / levelRange) * 100)));
  const expToNextLevel = currentTier.max - expPoints;

  const milestones = [
    {
      id: 'm-1',
      title: 'Free Basic Consultation',
      reqExp: 500,
      code: 'FREE-CONSULT-500',
      description: 'Waives consultation fee for general physician visit at CU Health Center.',
      icon: '🩺'
    },
    {
      id: 'm-2',
      title: '20% Off Pharmacy Order',
      reqExp: 1000,
      code: 'PHARMA20-MED',
      description: 'Get 20% discount on all prescribed medicines ordered via Astra Pharmacy.',
      icon: '💊'
    },
    {
      id: 'm-3',
      title: 'Free Diagnostic Lab Test',
      reqExp: 2000,
      code: 'FREE-LAB-2000',
      description: 'Complimentary blood profile or CBC checkup at CU Diagnostic Labs.',
      icon: '🧪'
    },
    {
      id: 'm-4',
      title: 'Premium AI Health Report',
      reqExp: 5000,
      code: 'ASTRA-VIP-REPORT',
      description: 'Full 360-degree automated medical analysis & longevity care plan export.',
      icon: '🤖'
    }
  ];

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const res = await rewardsAPI.getLeaderboard();
      setLeaderboardData(res.data.data || []);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleChecklistToggle = async (key, expValue) => {
    const currentStatus = !!profileData?.[key];
    const nextStatus = !currentStatus;
    const delta = nextStatus ? expValue : -expValue;

    const payload = {
      medsChecked: key === 'medsChecked' ? nextStatus : !!profileData?.medsChecked,
      dietChecked: key === 'dietChecked' ? nextStatus : !!profileData?.dietChecked,
      exerciseChecked: key === 'exerciseChecked' ? nextStatus : !!profileData?.exerciseChecked,
      logChecked: key === 'logChecked' ? nextStatus : !!profileData?.logChecked
    };

    const hasAnyCheck = payload.medsChecked || payload.dietChecked || payload.exerciseChecked || payload.logChecked;
    const updatedExp = Math.max(0, (profileData?.expPoints || 0) + delta);
    const updatedStreak = hasAnyCheck ? Math.max(1, profileData?.streakDays || 1) : 0;
    const updatedBadge = updatedExp >= 1000 ? 'Gold Ambassador' : updatedExp >= 500 ? 'Silver Champion' : 'Bronze Starter';

    if (setProfileData) {
      setProfileData(prev => ({
        ...prev,
        [key]: nextStatus,
        expPoints: updatedExp,
        streakDays: updatedStreak,
        healthBadge: updatedBadge
      }));
    }

    setLeaderboardData(prev => prev.map(item => {
      if (item.id === user?.id || item.id === profileData?.id || item.name === profileData?.name) {
        return {
          ...item,
          expPoints: updatedExp,
          streakDays: updatedStreak,
          healthBadge: updatedBadge
        };
      }
      return item;
    }).sort((a, b) => b.expPoints - a.expPoints));

    toast.success(nextStatus ? `+${expValue} EXP earned!` : `Checklist item updated`);

    try {
      const res = await rewardsAPI.updateChecklist(payload);
      if (res.data?.data && setProfileData) {
        setProfileData(prev => ({ ...prev, ...res.data.data }));
      }
      if (res.data?.leaderboard) {
        setLeaderboardData(res.data.leaderboard);
      }
    } catch (err) {
      console.error('Failed to sync checklist update', err);
    }
  };

  const handleClaimReward = async (milestone) => {
    if (expPoints < milestone.reqExp) {
      toast.error(`You need ${milestone.reqExp - expPoints} more EXP to unlock this reward.`);
      return;
    }
    try {
      await rewardsAPI.claimReward(milestone.id);
      if (!claimedRewards.includes(milestone.id)) {
        setClaimedRewards(prev => [...prev, milestone.id]);
      }
      setActiveModalReward(milestone);
      toast.success(`🎉 Milestone unlocked: ${milestone.title}`);
    } catch (err) {
      toast.error('Failed to claim reward');
    }
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
  };

  const filteredLeaderboard = leaderboardData.filter(item => {
    if (filterRole === 'STUDENT') return item.role === 'STUDENT';
    if (filterRole === 'FACULTY') return item.role === 'FACULTY';
    return true;
  });

  return (
    <div className="rewards-container">
      {/* 1. Header Banner */}
      <div className="rewards-header-card animate-slide-up">
        <div className="rewards-header-text">
          <h1>
            <FiAward style={{ color: '#1d467c', fontSize: '2rem' }} /> 
            Health Rewards & Leaderboard
          </h1>
          <p>
            Track daily health recovery habits, maintain your streak, unlock campus medical benefits, and rank up on the Chandigarh University Health Leaderboard!
          </p>
        </div>
        <div className="rewards-user-badge-pill">
          <div className="user-pill-avatar">
            {profileData?.name ? profileData.name.charAt(0) : 'U'}
          </div>
          <div className="user-pill-info">
            <span className="user-pill-name">{profileData?.name || user?.name || 'Jane Doe'}</span>
            <span className="user-pill-title">{roleTitle} • Level {currentTier.level}</span>
          </div>
        </div>
      </div>

      {/* 2. Top Grid: Level Center & Streak Adherence */}
      <div className="rewards-grid-2col">
        {/* EXP Level Center Card */}
        <div className="rewards-card">
          <div className="rewards-card-header">
            <div className="rewards-card-title">
              <span className="rewards-card-title-icon" style={{ color: '#00b4b6' }}>🏆</span>
              EXP Level Center
            </div>
            <span style={{ fontSize: '0.8rem', background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
              Level {currentTier.level}
            </span>
          </div>

          <div className="level-center-display">
            <div className="level-badge-box">
              <div className="level-number-circle">L{currentTier.level}</div>
              <div className="level-titles-wrap">
                <h3>{currentTier.title}</h3>
                <span>{expToNextLevel > 0 ? `${expToNextLevel} EXP to Level ${currentTier.level + 1}` : 'Maximum Level Reached!'}</span>
              </div>
            </div>
            <div className="exp-total-stat">
              <div className="exp-total-num">{expPoints} EXP</div>
              <div className="exp-total-label">Total Points</div>
            </div>
          </div>

          {/* EXP Progress Bar */}
          <div style={{ marginTop: '8px' }}>
            <div className="exp-progress-bar-track">
              <div className="exp-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="exp-progress-footer" style={{ marginTop: '6px' }}>
              <span>{expPoints} / {currentTier.max} EXP</span>
              <span>{progressPercent}% Complete</span>
            </div>
          </div>

          {/* Level Tiers */}
          <div className="level-tiers-row">
            {[
              { lvl: 1, name: 'Bronze', exp: '0+' },
              { lvl: 2, name: 'Silver', exp: '500+' },
              { lvl: 3, name: 'Gold', exp: '1000+' },
              { lvl: 4, name: 'Platinum', exp: '2000+' },
              { lvl: 5, name: 'Diamond', exp: '5000+' }
            ].map(t => (
              <div key={t.lvl} className={`level-tier-item ${currentTier.level === t.lvl ? 'active' : ''}`}>
                <div>L{t.lvl} {t.name}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{t.exp}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak Adherence Card */}
        <div className="rewards-card">
          <div className="rewards-card-header">
            <div className="rewards-card-title">
              <span className="rewards-card-title-icon" style={{ color: '#f97316' }}>🔥</span>
              Streak Adherence
            </div>
            <span style={{ fontSize: '0.8rem', background: '#fff7ed', color: '#c2410c', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
              Active Streak
            </span>
          </div>

          <div className="streak-box">
            <div className="streak-flame-icon">🔥</div>
            <div className="streak-info-text">
              <h2>{streakDays} {streakDays === 1 ? 'Day' : 'Days'} Active</h2>
              <p>Complete daily checklist tasks to maintain your streak and earn bonus EXP!</p>
            </div>
          </div>

          {/* Weekly Days Tracker */}
          <div className="streak-days-row">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const active = i < streakDays;
              return (
                <div key={day} className={`streak-day-dot ${active ? 'active' : ''}`}>
                  <div className="streak-day-circle">{active ? '✓' : ''}</div>
                  <span className="streak-day-label">{day}</span>
                </div>
              );
            })}
          </div>

          <div className="streak-bonus-banner">
            <FiZap style={{ color: '#16a34a', fontSize: '1.1rem' }} />
            <span>Bonus: Complete 7 consecutive days to earn +100 EXP Bonus!</span>
          </div>
        </div>
      </div>

      {/* 3. Middle Grid: Daily Checklist & Rewards Milestones */}
      <div className="rewards-grid-2col">
        {/* Daily Checklist Card */}
        <div className="rewards-card">
          <div className="rewards-card-header">
            <div className="rewards-card-title">
              <span className="rewards-card-title-icon" style={{ color: '#00b4b6' }}>✅</span>
              Daily Habit Checklist
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Resets Daily</span>
          </div>

          <div className="checklist-list">
            {[
              { key: 'medsChecked', label: 'Took Prescribed Medicines', exp: 10, icon: '💊' },
              { key: 'dietChecked', label: 'Followed Healthy Diet & Hydration', exp: 15, icon: '🥗' },
              { key: 'exerciseChecked', label: 'Completed Daily 30-min Exercise / Walk', exp: 20, icon: '🏃‍♂️' },
              { key: 'logChecked', label: 'Logged Daily Health Status in AI Care Plan', exp: 15, icon: '🤖' }
            ].map(item => {
              const isChecked = !!profileData?.[item.key];
              return (
                <div
                  key={item.key}
                  className={`checklist-card-item ${isChecked ? 'completed' : ''}`}
                  onClick={() => handleChecklistToggle(item.key, item.exp)}
                >
                  <div className="checklist-left">
                    <div className="checklist-custom-checkbox">
                      {isChecked && <FiCheckCircle />}
                    </div>
                    <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                    <span className="checklist-text">{item.label}</span>
                  </div>
                  <span className="checklist-exp-badge">+{item.exp} EXP</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rewards Milestones Card */}
        <div className="rewards-card">
          <div className="rewards-card-header">
            <div className="rewards-card-title">
              <span className="rewards-card-title-icon" style={{ color: '#042a59' }}>🎁</span>
              Rewards Milestones
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Unlockable Perks</span>
          </div>

          <div className="milestones-list">
            {milestones.map(m => {
              const isUnlocked = expPoints >= m.reqExp;
              const isClaimed = claimedRewards.includes(m.id);

              return (
                <div 
                  key={m.id} 
                  className={`milestone-item ${isClaimed ? 'claimed' : isUnlocked ? 'unlocked' : ''}`}
                >
                  <div className="milestone-left">
                    <div className="milestone-icon">{m.icon}</div>
                    <div className="milestone-info">
                      <h4>{m.title}</h4>
                      <span>Required: {m.reqExp} EXP</span>
                    </div>
                  </div>

                  <div>
                    {isClaimed ? (
                      <button 
                        type="button" 
                        className="milestone-action-btn btn-claimed"
                        onClick={() => setActiveModalReward(m)}
                      >
                        VIEW CODE
                      </button>
                    ) : isUnlocked ? (
                      <button 
                        type="button" 
                        className="milestone-action-btn btn-redeem"
                        onClick={() => handleClaimReward(m)}
                      >
                        REDEEM
                      </button>
                    ) : (
                      <button type="button" className="milestone-action-btn btn-locked" disabled>
                        LOCKED
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Bottom Card: Health Leaderboard */}
      <div className="rewards-card">
        <div className="rewards-card-header">
          <div className="rewards-card-title">
            <span className="rewards-card-title-icon" style={{ color: '#00b4b6' }}>📈</span>
            Chandigarh University Health Leaderboard
          </div>

          <div className="leaderboard-filters">
            {[
              { id: 'ALL', label: 'All Members' },
              { id: 'STUDENT', label: 'Students' },
              { id: 'FACULTY', label: 'Faculty' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                className={`filter-btn ${filterRole === f.id ? 'active' : ''}`}
                onClick={() => setFilterRole(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loadingLeaderboard ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            Loading leaderboard rankings...
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.9rem' }}>
            No leaderboard entries found for this category.
          </div>
        ) : (
          <div className="leaderboard-table-container">
            {filteredLeaderboard.map((item, index) => {
              const rank = index + 1;
              const isCurrentUser = (user?.id && item.id === user.id) || (profileData?.id && item.id === profileData.id) || (profileData?.name && item.name === profileData.name);
              const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
              const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

              return (
                <div key={item.id || index} className={`leaderboard-row ${isCurrentUser ? 'is-current-user' : ''}`}>
                  <div className="leaderboard-rank-left">
                    <div className={`rank-badge ${rankClass}`}>{medalEmoji}</div>
                    <div className="leaderboard-user-details">
                      <img 
                        src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'} 
                        alt={item.name} 
                        className="user-avatar-small"
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="user-name-text">{item.name}</span>
                          {isCurrentUser && (
                            <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: '#00b4b6', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              YOU
                            </span>
                          )}
                          <span className={`user-role-tag ${item.role === 'FACULTY' ? 'tag-faculty' : 'tag-student'}`}>
                            {item.role || 'STUDENT'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.healthBadge || 'Bronze Starter'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="leaderboard-points-right">
                    <span className={`user-status-pill ${item.status === 'EXCELLENT' ? 'status-excellent' : item.status === 'MONITORING' ? 'status-monitoring' : 'status-stable'}`}>
                      {item.status || 'STABLE'}
                    </span>
                    <span>{item.expPoints || 0} EXP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reward Coupon Claim Modal */}
      {activeModalReward && (
        <div className="reward-modal-overlay" onClick={() => setActiveModalReward(null)}>
          <div className="reward-modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              onClick={() => setActiveModalReward(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
            >
              <FiX />
            </button>

            <div className="modal-trophy-icon">🏆</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0' }}>
              {activeModalReward.title} Unlocked!
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              {activeModalReward.description}
            </p>

            <div className="coupon-code-box">
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Voucher Code</div>
                <div className="coupon-code-text">{activeModalReward.code}</div>
              </div>
              <button 
                type="button" 
                className="copy-coupon-btn"
                onClick={() => copyCouponCode(activeModalReward.code)}
              >
                <FiCopy style={{ marginRight: '4px' }} /> Copy
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              Present this voucher code at CU Health Center or apply during medicine/lab booking checkout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

