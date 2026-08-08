import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCreditCard, 
  FiCheckCircle, 
  FiShield, 
  FiGift, 
  FiDownload, 
  FiZap, 
  FiClock, 
  FiDollarSign, 
  FiAward, 
  FiCheck, 
  FiX, 
  FiSmartphone, 
  FiLock,
  FiFileText,
  FiUser
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

export default function StudentHealthPortalTab({ profileData, user }) {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans', 'history'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI', 'CARD', 'NETBANKING', 'MEDCOINS'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const [upiId, setUpiId] = useState('student@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8812');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('912');
  const [selectedBank, setSelectedBank] = useState('SBI');

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const handleApplyCoupon = (overrideCode) => {
    const targetCode = (overrideCode || couponInput).trim().toUpperCase();
    if (!targetCode) {
      toast.error('Please enter a valid coupon code!');
      return;
    }

    if (targetCode === 'CU20') {
      setAppliedCoupon({ code: 'CU20', percent: 20, label: '🎉 20% Special CU Discount' });
      toast.success('Coupon CU20 applied! 20% OFF 🏷️');
    } else if (targetCode === 'STUDENT50') {
      setAppliedCoupon({ code: 'STUDENT50', flat: 50, label: '🏷️ Flat ₹50 CU Student Concession' });
      toast.success('Coupon STUDENT50 applied! ₹50 OFF 🏷️');
    } else if (targetCode === 'FREECU') {
      setAppliedCoupon({ code: 'FREECU', percent: 100, label: '🎁 100% Free Special Concession' });
      toast.success('100% Free Concession Coupon Applied! 🎁');
    } else if (targetCode === 'MEDASTRA10') {
      setAppliedCoupon({ code: 'MEDASTRA10', percent: 10, label: '⚡ 10% Extra MedAstraX Discount' });
      toast.success('Coupon MEDASTRA10 applied! 10% OFF ⚡');
    } else {
      toast.error('Invalid Coupon Code. Try CU20, STUDENT50, or FREECU!');
    }
  };

  const [transactions, setTransactions] = useState([
    {
      id: 'TXN-98271',
      date: '2026-08-01',
      title: 'Pharmacy Medicine Order #ORD-4491',
      category: 'Pharmacy',
      amount: 240,
      method: 'UPI (PhonePe)',
      status: 'PAID'
    },
    {
      id: 'TXN-88120',
      date: '2026-07-15',
      title: 'Lab Diagnostic Test - Complete Blood Count',
      category: 'Diagnostic Lab',
      amount: 450,
      method: 'MedCoins Discount (100%)',
      status: 'PAID'
    },
    {
      id: 'TXN-77319',
      date: '2026-06-10',
      title: 'Basic Campus Health Pass Semester Renewal',
      category: 'Care Pass',
      amount: 0,
      method: 'CU Student Benefit',
      status: 'ACTIVE'
    }
  ]);

  const plans = [
    {
      id: 'basic',
      name: 'Basic Campus Health Pass',
      price: 0,
      duration: 'Included Free with CU Student ID',
      badge: 'Current Plan',
      badgeColor: '#0d9488',
      features: [
        'Free Consultations at CU On-Campus Clinic',
        'Emergency Ambulance SOS Alert Dispatch',
        'Annual Basic Body Audit & Vitals Check',
        'Standard Prescriptions & Digital E-Scribe'
      ]
    },
    {
      id: 'silver',
      name: 'Silver Wellness Student Pass',
      price: 299,
      duration: '/ Semester',
      badge: 'Popular',
      badgeColor: '#042a59',
      features: [
        'All Basic Pass Perks Included',
        'Unlimited Specialist Teleconsultations',
        '15% Flat Discount on Medicines & Pharmacy',
        'Free Dental & Eye Screening Vouchers',
        '200 Bonus MedCoins Reward Points'
      ]
    },
    {
      id: 'gold',
      name: 'Gold MedAstraX Care Pass',
      price: 599,
      duration: '/ Academic Year',
      badge: 'Best Value ⭐',
      badgeColor: '#33c3c5',
      recommended: true,
      features: [
        'All Silver Pass Perks Included',
        'Comprehensive 360° Diagnostic Lab Test',
        '25% Flat Discount on Prescriptions & Labs',
        'Priority Appointment Booking with Top Doctors',
        '500 Bonus MedCoins + Free Ambulance Cover'
      ]
    }
  ];

  const handleOpenPayment = (plan) => {
    if (plan.price === 0) {
      toast.success('You are already enrolled in the Free Basic Campus Health Pass!');
      return;
    }
    setSelectedPlan(plan);
    setAppliedCoupon(null);
    setCouponInput('');
    setPaymentSuccess(null);
    setPaymentModalOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);

    const basePrice = selectedPlan.price || 0;
    const studentDiscount = Math.round(basePrice * 0.1);
    let couponDeduction = 0;
    if (appliedCoupon) {
      if (appliedCoupon.percent) {
        couponDeduction = Math.round((basePrice - studentDiscount) * (appliedCoupon.percent / 100));
      } else if (appliedCoupon.flat) {
        couponDeduction = appliedCoupon.flat;
      }
    }
    const finalAmountPaid = Math.max(0, basePrice - studentDiscount - couponDeduction);

    setTimeout(() => {
      setIsProcessing(false);
      const newTxn = {
        id: 'TXN-' + Math.floor(10000 + Math.random() * 90000),
        date: new Date().toISOString().split('T')[0],
        title: `${selectedPlan.name} Subscription`,
        category: 'Care Pass Upgrade',
        amount: finalAmountPaid,
        method: paymentMethod === 'UPI' ? `UPI (${upiId})` : paymentMethod === 'MEDCOINS' ? 'MedCoins Points' : paymentMethod,
        status: 'PAID'
      };

      setTransactions([newTxn, ...transactions]);
      setPaymentSuccess(newTxn);
      toast.success(`Payment Received! Enrolled in ${selectedPlan.name} 🎉`);
    }, 1800);
  };

  const handleDownloadInvoice = (txn) => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(15, 118, 110);
      doc.rect(0, 0, 210, 32, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('MedAstraX Campus Healthcare System', 14, 20);
      
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(14);
      doc.text('OFFICIAL PAYMENT RECEIPT & TAX INVOICE', 14, 45);

      doc.setFontSize(10);
      doc.text(`Receipt Reference: ${txn.id}`, 14, 55);
      doc.text(`Date & Time: ${txn.date} | 10:30 AM IST`, 14, 62);
      doc.text(`Student Name: ${profileData?.name || user?.name || 'Naina Kumari'}`, 14, 69);
      doc.text(`College UID: ${profileData?.collegeUid || '24BCF10013'}`, 14, 76);
      doc.text(`Campus: Chandigarh University, Mohali`, 14, 83);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 90, 196, 90);

      doc.setFontSize(11);
      doc.text('Description', 14, 100);
      doc.text('Category', 110, 100);
      doc.text('Amount (INR)', 160, 100);

      doc.setFontSize(10);
      doc.text(txn.title, 14, 110);
      doc.text(txn.category, 110, 110);
      doc.text(`₹${txn.amount}.00`, 160, 110);

      doc.line(14, 118, 196, 118);

      doc.setFontSize(12);
      doc.text(`Total Amount Paid: ₹${txn.amount}.00`, 14, 130);
      doc.text(`Payment Mode: ${txn.method}`, 14, 138);
      doc.text(`Status: ${txn.status} ✔️`, 14, 146);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('This receipt is digitally generated by MedAstraX CU Healthcare Portal.', 14, 170);

      doc.save(`MedAstraX_Receipt_${txn.id}.pdf`);
      toast.success('Official payment receipt downloaded! 📄');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF receipt');
    }
  };

  return (
    <div className="student-health-portal-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'sans-serif' }}>
      
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #0284c7 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        color: '#FFFFFF',
        boxShadow: '0 10px 30px rgba(15, 118, 110, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '14px',
            borderRadius: '14px',
            backdropFilter: 'blur(10px)'
          }}>
            <FiShield size={32} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ background: 'rgba(255, 255, 255, 0.25)', padding: '2px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                CU HEALTH CARE PASS
              </span>
              <span style={{ opacity: 0.9, fontSize: '0.82rem' }}>
                UID: <strong>{profileData?.collegeUid || '24BCF10013'}</strong>
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
              Student Health Portal & Care Membership
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', opacity: 0.9 }}>
              Manage student health coverage, upgrade care passes, and process online healthcare payments seamlessly.
            </p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '12px 16px',
            borderRadius: '12px',
            textAlign: 'center',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>MedCoins Balance</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fef08a' }}>950 🪙</div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '12px 16px',
            borderRadius: '12px',
            textAlign: 'center',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Current Plan</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Basic Campus Pass</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('plans')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'plans' ? '#0f766e' : 'transparent',
            color: activeTab === 'plans' ? '#FFFFFF' : '#64748b',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.92rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FiShield /> Student Care Plans & Upgrades
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'history' ? '#0f766e' : 'transparent',
            color: activeTab === 'history' ? '#FFFFFF' : '#64748b',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.92rem',
            transition: 'all 0.2s ease'
          }}
        >
          <FiCreditCard /> Payment History & Receipts ({transactions.length})
        </button>
      </div>

      {/* TAB 1: MEMBERSHIP PLANS */}
      {activeTab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: plan.recommended ? '2px solid #33c3c5' : '1px solid #e2e8f0',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: plan.recommended ? '0 12px 30px rgba(51, 195, 197, 0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
                position: 'relative'
              }}
            >
              {plan.badge && (
                <span style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: plan.badgeColor,
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '99px'
                }}>
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  {plan.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '16px 0 20px 0' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f766e' }}>
                    ₹{plan.price}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 600 }}>
                    {plan.duration}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: '#334155' }}>
                      <FiCheckCircle size={18} color="#0f766e" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleOpenPayment(plan)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: plan.price === 0 ? '#f1f5f9' : 'linear-gradient(135deg, #0f766e, #0284c7)',
                  color: plan.price === 0 ? '#64748b' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: plan.price === 0 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: plan.price === 0 ? 'none' : '0 4px 14px rgba(15, 118, 110, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                {plan.price === 0 ? (
                  <>
                    <FiCheck /> Enrolled (Current Pass)
                  </>
                ) : (
                  <>
                    <FiCreditCard /> Upgrade & Pay ₹{plan.price}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PAYMENT HISTORY */}
      {activeTab === 'history' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            Medical Receipts & Health Payments
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Transaction ID</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Description</th>
                  <th style={{ padding: '12px 16px' }}>Amount</th>
                  <th style={{ padding: '12px 16px' }}>Payment Mode</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f766e' }}>{txn.id}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{txn.date}</td>
                    <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 600 }}>{txn.title}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>₹{txn.amount}.00</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{txn.method}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {txn.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDownloadInvoice(txn)}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          color: '#0f766e',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <FiDownload size={14} /> Receipt PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYMENT GATEWAY MODAL */}
      <AnimatePresence>
        {paymentModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                maxWidth: '520px',
                width: '100%',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Modal Header */}
              <div style={{
                background: 'linear-gradient(135deg, #0f766e, #0284c7)',
                padding: '20px 24px',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.9, textTransform: 'uppercase', fontWeight: 700 }}>
                    MedAstraX Secure Checkout
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                    {selectedPlan?.name}
                  </h3>
                </div>
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {paymentSuccess ? (
                  /* Success Screen */
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#166534', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                      <FiCheckCircle size={36} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                      Payment Successful!
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '8px 0 20px 0' }}>
                      Transaction Reference: <strong>{paymentSuccess.id}</strong>
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleDownloadInvoice(paymentSuccess)}
                        style={{ background: '#0f766e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <FiDownload /> Download Receipt
                      </button>
                      <button
                        onClick={() => setPaymentModalOpen(false)}
                        style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Payment Summary & Promo Code Section */}
                    {(() => {
                      const baseP = selectedPlan?.price || 0;
                      const studentDisc = Math.round(baseP * 0.1);
                      let cDeduction = 0;
                      if (appliedCoupon) {
                        if (appliedCoupon.percent) {
                          cDeduction = Math.round((baseP - studentDisc) * (appliedCoupon.percent / 100));
                        } else if (appliedCoupon.flat) {
                          cDeduction = appliedCoupon.flat;
                        }
                      }
                      const totalPayable = Math.max(0, baseP - studentDisc - cDeduction);

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', color: '#475569' }}>
                              <span>Pass Fee ({selectedPlan?.name})</span>
                              <span>₹{baseP}.00</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', color: '#166534' }}>
                              <span>CU Student Concession (-10%)</span>
                              <span>-₹{studentDisc}.00</span>
                            </div>
                            {appliedCoupon && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', color: '#15803d', fontWeight: 700 }}>
                                <span>{appliedCoupon.label}</span>
                                <span>-₹{cDeduction}.00</span>
                              </div>
                            )}
                            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                              <span>Total Payable Amount</span>
                              <span style={{ color: '#0f766e' }}>
                                ₹{totalPayable}.00
                              </span>
                            </div>
                          </div>

                          {/* Discount / Promo Code Input */}
                          <div style={{ background: '#f1f5f9', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                              🏷️ Have a Discount / Promo Code?
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder="Enter code (e.g. CU20, STUDENT50)"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #94a3b8',
                                  fontSize: '0.85rem',
                                  textTransform: 'uppercase',
                                  fontWeight: 700
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleApplyCoupon()}
                                style={{
                                  background: '#0f766e',
                                  color: 'white',
                                  border: 'none',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  cursor: 'pointer'
                                }}
                              >
                                Apply
                              </button>
                            </div>

                            {/* Active Applied Coupon Tag */}
                            {appliedCoupon && (
                              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#dcfce7', color: '#15803d', padding: '6px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                                <span>Applied: {appliedCoupon.code} (-₹{cDeduction})</span>
                                <button 
                                  type="button"
                                  onClick={() => { setAppliedCoupon(null); setCouponInput(''); toast('Coupon removed', { icon: '🗑️' }); }}
                                  style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
                                >
                                  Remove
                                </button>
                              </div>
                            )}

                            {/* Quick Promo Suggestions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Quick Codes:</span>
                              {['CU20', 'STUDENT50', 'FREECU'].map(c => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => { setCouponInput(c); handleApplyCoupon(c); }}
                                  style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700, color: '#0f766e', cursor: 'pointer' }}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Payment Method Selector */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
                        Select Payment Method
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                          onClick={() => setPaymentMethod('UPI')}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: paymentMethod === 'UPI' ? '2px solid #0f766e' : '1px solid #cbd5e1',
                            background: paymentMethod === 'UPI' ? '#f0fdf4' : '#ffffff',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.85rem'
                          }}
                        >
                          <FiSmartphone color="#0f766e" /> UPI / QR Code
                        </button>
                        <button
                          onClick={() => setPaymentMethod('CARD')}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: paymentMethod === 'CARD' ? '2px solid #0f766e' : '1px solid #cbd5e1',
                            background: paymentMethod === 'CARD' ? '#f0fdf4' : '#ffffff',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.85rem'
                          }}
                        >
                          <FiCreditCard color="#0284c7" /> Credit/Debit Card
                        </button>
                        <button
                          onClick={() => setPaymentMethod('NETBANKING')}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: paymentMethod === 'NETBANKING' ? '2px solid #0f766e' : '1px solid #cbd5e1',
                            background: paymentMethod === 'NETBANKING' ? '#f0fdf4' : '#ffffff',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.85rem'
                          }}
                        >
                          <FiZap color="#1d467c" /> Net Banking
                        </button>
                        <button
                          onClick={() => setPaymentMethod('MEDCOINS')}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: paymentMethod === 'MEDCOINS' ? '2px solid #0f766e' : '1px solid #cbd5e1',
                            background: paymentMethod === 'MEDCOINS' ? '#f0fdf4' : '#ffffff',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.85rem'
                          }}
                        >
                          <FiGift color="#33c3c5" /> Pay via MedCoins
                        </button>
                      </div>
                    </div>

                    {/* Method Details Input */}
                    {paymentMethod === 'UPI' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                          Enter VPA / UPI ID (Google Pay, PhonePe, Paytm)
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                    )}

                    {paymentMethod === 'CARD' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Card Number</label>
                          <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Expiry</label>
                            <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>CVV</label>
                            <input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'MEDCOINS' && (
                      <div style={{ background: '#fefe9e20', border: '1px solid #fde047', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#854d0e' }}>
                        🪙 You have <strong>950 MedCoins</strong> available! Redeem <strong>{Math.round((selectedPlan?.price || 0) * 0.9)} MedCoins</strong> for 100% instant payment coverage.
                      </div>
                    )}

                    {/* Pay Button */}
                    <button
                      onClick={handleProcessPayment}
                      disabled={isProcessing}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '10px',
                        border: 'none',
                        background: isProcessing ? '#94a3b8' : 'linear-gradient(135deg, #0f766e, #0284c7)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '1rem',
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(15, 118, 110, 0.3)'
                      }}
                    >
                      <FiLock /> {isProcessing ? 'Processing Payment...' : `Pay ₹${Math.round((selectedPlan?.price || 0) * 0.9)}.00 & Activate Pass`}
                    </button>
                  </>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

