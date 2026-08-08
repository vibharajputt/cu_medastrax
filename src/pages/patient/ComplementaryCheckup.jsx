import { useState, useEffect } from 'react';
import { 
  FiActivity, 
  FiCheckCircle, 
  FiClock, 
  FiMapPin, 
  FiCalendar, 
  FiGift, 
  FiPercent, 
  FiHeart, 
  FiChevronRight,
  FiAlertCircle,
  FiLock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { labAPI } from '../../services/api';

export default function ComplementaryCheckup({ profileData, user }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [address, setAddress] = useState(profileData?.address || 'Chandigarh University Hostel, Gharuan');
  const [phone, setPhone] = useState(profileData?.phone || user?.phone || '');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [useCoins, setUseCoins] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  const originalPrice = 2499;
  const studentDiscount = 2300; // Subsidy
  const processingFee = 199; // Standard processing & home sample collection fee
  
  let coinsDiscountAmount = 0;
  const availableCoins = profileData?.expPoints || 0;
  if (useCoins) {
    coinsDiscountAmount = Math.min(availableCoins, processingFee);
  }
  
  let promoDiscountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      promoDiscountAmount = Math.round((processingFee - coinsDiscountAmount) * (appliedPromo.value / 100));
    } else {
      promoDiscountAmount = Math.min(appliedPromo.value, processingFee - coinsDiscountAmount);
    }
  }
  
  const finalPrice = Math.max(0, processingFee - coinsDiscountAmount - promoDiscountAmount);

  useEffect(() => {
    fetchPastCheckups();
  }, []);

  const fetchPastCheckups = async () => {
    try {
      setLoading(true);
      const res = await labAPI.getPatientBookings();
      const bodyCheckups = (res.data || res || []).filter(b => b.packageName === 'Complementary Full Body Checkup');
      setBookings(bodyCheckups);
    } catch (err) {
      console.error('Failed to fetch lab bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    
    if (code === 'CUFREE' || code === 'FREECU') {
      setAppliedPromo({ code, type: 'percent', value: 100, label: '100% Fee Waiver' });
      toast.success('Promo Code CUFREE Applied! 100% fee waiver.');
    } else if (code === 'CU20') {
      setAppliedPromo({ code, type: 'percent', value: 20, label: '20% Special CU Discount' });
      toast.success('Promo Code CU20 Applied! 20% discount.');
    } else if (code === 'STUDENT50') {
      setAppliedPromo({ code, type: 'flat', value: 50, label: 'Flat ₹50 Discount' });
      toast.success('Promo Code STUDENT50 Applied! Flat ₹50 off.');
    } else if (code === 'CHANDIGARH') {
      setAppliedPromo({ code, type: 'percent', value: 50, label: '50% Student Discount' });
      toast.success('Promo Code CHANDIGARH Applied! 50% discount.');
    } else if (code === 'HEALTHY100') {
      setAppliedPromo({ code, type: 'flat', value: 100, label: 'Flat ₹100 Discount' });
      toast.success('Promo Code HEALTHY100 Applied! Flat ₹100 off.');
    } else {
      toast.error('Invalid promo code! Try CUFREE, CU20, or STUDENT50.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    toast.success('Promo code removed.');
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error('Please select an appointment date.');
      return;
    }
    if (!selectedSlot) {
      toast.error('Please choose a preferred time slot.');
      return;
    }
    if (!address.trim()) {
      toast.error('Please provide a sample collection address.');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please provide a valid contact number.');
      return;
    }

    if (finalPrice > 0) {
      setShowPaymentModal(true);
    } else {
      processBooking(null); // Book directly for ₹0
    }
  };

  const processBooking = async (txId = null) => {
    setBookingInProgress(true);
    try {
      const bookingData = {
        packageName: 'Complementary Full Body Checkup',
        date: selectedDate,
        timeSlot: selectedSlot,
        address,
        phone,
        pricePaid: finalPrice,
        paymentStatus: finalPrice > 0 ? 'PAID' : 'COMPLIMENTARY',
        transactionId: txId || 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      };
      
      const res = await labAPI.createBooking(bookingData);
      toast.success('Full Body Checkup Booked Successfully!');
      
      setSelectedDate('');
      setSelectedSlot('');
      setUseCoins(false);
      setAppliedPromo(null);
      setPromoCode('');
      setShowPaymentModal(false);
      
      fetchPastCheckups();
    } catch (err) {
      toast.error('Booking failed. Please try again.');
      console.error(err);
    } finally {
      setBookingInProgress(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <div className="checkup-container">
      {/* Banner */}
      <div className="checkup-banner">
        <div className="checkup-banner-content">
          <span className="checkup-badge"><FiGift /> Student Health Benefit</span>
          <h1>Complementary Full Body Checkup</h1>
          <p>CU Student Wellness Initiative: Avail comprehensive healthcare checkups at home or hostel.</p>
          
          <div className="checkup-inclusions-pills">
            <span> CBC (24 parameters)</span>
            <span> Kidney Profile (5 tests)</span>
            <span> Liver Profile (11 tests)</span>
            <span> Lipid/Cholesterol (8 tests)</span>
            <span> Thyroid (T3, T4, TSH)</span>
            <span> Blood Sugar Screen</span>
            <span> Vitamins (D3 & B12)</span>
          </div>
        </div>
        <div className="checkup-banner-icon">
          <FiActivity size={80} color="rgba(255,255,255,0.2)" />
        </div>
      </div>

      <div className="checkup-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Left Side: Booking Details */}
        <div className="checkup-card form-section" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
            <FiCalendar color="#0d9488" /> 1. Booking & Scheduling
          </h2>
          
          <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Select Date</label>
                <input 
                  type="date" 
                  min={getTodayString()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Preferred Time Slot</label>
                <select 
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff' }}
                >
                  <option value="">Choose slot...</option>
                  <option value="07:00 AM - 09:00 AM">07:00 AM - 09:00 AM (Recommended for Fasting)</option>
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Fasting)</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                  <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Home / Hostel Collection Address</label>
              <textarea 
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="Enter complete hostel room number, PG block, or home address"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Student Name</label>
                <input 
                  type="text" 
                  value={profileData?.name || user?.name || ''} 
                  disabled 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.88rem', color: '#64748b' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Contact Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="Enter 10-digit mobile number"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="checkup-submit-btn"
              disabled={bookingInProgress}
              style={{
                background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.95rem',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {bookingInProgress ? 'Processing...' : finalPrice > 0 ? `Book Checkup & Pay ₹${finalPrice}` : 'Book Free Checkup now'} <FiChevronRight />
            </button>
          </form>
        </div>

        {/* Right Side: Pricing, MedCoins & Promo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Price Details Card */}
          <div className="checkup-card price-section" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              <FiPercent color="#e11d48" /> 2. Pricing Summary
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>Original Package Value</span>
                <span style={{ fontWeight: '500', color: '#1e293b' }}>₹{originalPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: '#0d9488', fontWeight: '500' }}>CU Student Subsidy</span>
                <span style={{ fontWeight: '600', color: '#0d9488' }}>-₹{studentDiscount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b' }}>Home Sample Collection & Lab Processing</span>
                <span style={{ fontWeight: '500', color: '#1e293b' }}>₹{processingFee}</span>
              </div>
              
              {useCoins && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#d97706', fontWeight: '500' }}>MedCoins Redeemed ({coinsDiscountAmount} coins)</span>
                  <span style={{ fontWeight: '600', color: '#d97706' }}>-₹{coinsDiscountAmount}</span>
                </div>
              )}

              {appliedPromo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#2563eb', fontWeight: '500' }}>Promo Discount ({appliedPromo.code})</span>
                  <span style={{ fontWeight: '600', color: '#2563eb' }}>-₹{promoDiscountAmount}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>Net Payable Amount</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: finalPrice === 0 ? '#00b4b6' : '#1e293b' }}>
                {finalPrice === 0 ? 'FREE' : `₹${finalPrice}`}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.3' }}>
              *Complementary offer covers test panels fully. Booking/processing fee can be waived using MedCoins or Student promo code.
            </p>
          </div>

          {/* Gamification & Promo codes */}
          <div className="checkup-card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', marginBottom: '12px' }}>
              <FiGift color="#1d467c" /> Redeem Health MedCoins
            </h3>
            
            <div style={{ background: '#fffbeb', border: '1px dashed #fcd34d', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#78350f' }}>Your MedCoins Balance</div>
                <div style={{ fontSize: '0.75rem', color: '#b45309' }}>{availableCoins} Coins available</div>
              </div>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={useCoins} 
                  disabled={availableCoins <= 0}
                  onChange={(e) => setUseCoins(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#78350f' }}>Use Max</span>
              </label>
            </div>

            <h3 style={{ fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', marginBottom: '10px' }}>
              <FiPercent color="#2563eb" /> Apply Promo Code
            </h3>
            
            {appliedPromo ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px 12px' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e3a8a', background: '#dbeafe', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{appliedPromo.code}</span>
                  <span style={{ fontSize: '0.78rem', color: '#1e40af' }}>{appliedPromo.label}</span>
                </div>
                <button type="button" onClick={handleRemovePromo} style={{ border: 'none', background: 'none', color: '#ef4444', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>Remove</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code (e.g. CUFREE)"
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.82rem', textTransform: 'uppercase' }}
                />
                <button type="button" onClick={handleApplyPromo} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>Apply</button>
              </div>
            )}
            <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
              Tip: Use **CUFREE** for a 100% waiver or **CHANDIGARH** for a 50% waiver.
            </div>
          </div>
        </div>
      </div>

      {/* Booking History Section */}
      <div className="checkup-history-section" style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
          <FiHeart color="#ec4899" /> Your Checkup Bookings
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#64748b' }}>
            <FiActivity size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.88rem' }}>No past checkups booked yet. Complete your first booking above!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.map(b => (
              <div key={b.id} style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{b.packageName}</h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiCalendar /> {b.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiClock /> {b.timeSlot}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMapPin /> Collection at hostel</span>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    fontSize: '0.72rem', 
                    fontWeight: '700', 
                    padding: '3px 8px', 
                    borderRadius: '999px',
                    background: b.status === 'CONFIRMED' ? '#dcfce7' : '#fee2e2',
                    color: b.status === 'CONFIRMED' ? '#166534' : '#991b1b',
                    marginBottom: '4px'
                  }}>
                    {b.status}
                  </span>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {b.pricePaid === 0 ? 'COMPLIMENTARY' : `Paid ₹${b.pricePaid}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '28px',
            width: '420px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            position: 'relative'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiLock color="#0d9488" /> Secure Payment
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
              You are paying for the lab processing fee of **₹{finalPrice}**.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '12px', 
                border: '1px solid #cbd5e1', 
                borderRadius: '8px', 
                cursor: 'pointer',
                background: paymentMethod === 'upi' ? '#f0fdfa' : '#fff',
                borderColor: paymentMethod === 'upi' ? '#0d9488' : '#cbd5e1'
              }}>
                <input 
                  type="radio" 
                  name="payMethod" 
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>UPI (Google Pay / PhonePe / GPay)</span>
              </label>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '12px', 
                border: '1px solid #cbd5e1', 
                borderRadius: '8px', 
                cursor: 'pointer',
                background: paymentMethod === 'card' ? '#f0fdfa' : '#fff',
                borderColor: paymentMethod === 'card' ? '#0d9488' : '#cbd5e1'
              }}>
                <input 
                  type="radio" 
                  name="payMethod" 
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Credit / Debit Card</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setShowPaymentModal(false)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'none', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              
              <button 
                type="button" 
                onClick={() => processBooking(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#0d9488', color: 'white', fontWeight: '700', cursor: 'pointer' }}
              >
                Pay & Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner CSS style block */}
      <style>{`
        .checkup-banner {
          background: linear-gradient(135deg, #0d9488, #4f46e5);
          border-radius: 12px;
          padding: 28px;
          color: white;
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .checkup-banner-content {
          max-width: 75%;
          position: relative;
          z-index: 2;
        }
        .checkup-banner h1 {
          font-size: 1.6rem;
          font-weight: 800;
          margin: 8px 0;
          letter-spacing: -0.3px;
        }
        .checkup-banner p {
          font-size: 0.88rem;
          opacity: 0.9;
          line-height: 1.4;
        }
        .checkup-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.18);
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .checkup-inclusions-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 14px;
        }
        .checkup-inclusions-pills span {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.15);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .checkup-banner-icon {
          opacity: 0.45;
        }
        .checkup-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
        }
      `}</style>
    </div>
  );
}

