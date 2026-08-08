import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { prescriptionAPI, pharmacyAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, FiShoppingBag, FiTruck, FiMapPin, FiStar, 
  FiFilter, FiCpu, FiNavigation, FiCheckCircle, FiClock, 
  FiHome, FiBell, FiPackage 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function PharmacyOrderFlow() {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0: Placed, 1: Verified, 2: Out for Delivery, 3: Delivered
  const [slotSecondsLeft, setSlotSecondsLeft] = useState(30);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  const [hostelBuilding, setHostelBuilding] = useState('Le Corbusier Hostel (Block B)');
  const [roomNumber, setRoomNumber] = useState('Room 304');
  const [deliveryNote, setDeliveryNote] = useState('Call on arrival at hostel gate');

  const [notificationsLog, setNotificationsLog] = useState([]);

  const [sortBy, setSortBy] = useState('distance'); // distance, price, rating
  const [searchQuery, setSearchQuery] = useState('');

  const TRACKING_SLOTS = [
    {
      id: 'PLACED',
      stepNum: 1,
      title: 'Order Placed',
      subtitle: 'Order submitted to pharmacy queue',
      icon: <FiPackage color="#042a59" size={22} />,
      statusMsg: 'Your medicine order has been placed with the pharmacy.'
    },
    {
      id: 'VERIFIED',
      stepNum: 2,
      title: 'Order Verified',
      subtitle: 'Prescription & medicines verified by pharmacist',
      icon: <FiCheckCircle color="#00b4b6" size={22} />,
      statusMsg: 'Pharmacist verified prescription & sealed your medicine kit.'
    },
    {
      id: 'OUT_FOR_DELIVERY',
      stepNum: 3,
      title: 'Out for Delivery',
      subtitle: 'Courier agent en-route to your hostel',
      icon: <FiTruck color="#ea580c" size={22} />,
      statusMsg: 'Delivery agent is heading directly to your hostel block.'
    },
    {
      id: 'DELIVERED',
      stepNum: 4,
      title: 'Delivered',
      subtitle: 'Handed over at your hostel room',
      icon: <FiHome color="#16a34a" size={22} />,
      statusMsg: 'Order delivered to your hostel room. Wishing you quick recovery!'
    }
  ];

  useEffect(() => {
    fetchDetails();
  }, [prescriptionId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [prescRes, pharmRes] = await Promise.all([
        prescriptionAPI.getById(prescriptionId),
        pharmacyAPI.getAll()
      ]);
      setPrescription(prescRes.data);

      const enhancedPharmacies = (pharmRes.data || []).map((p, idx) => ({
        ...p,
        distance: idx === 0 ? 1.2 : idx === 1 ? 2.5 : 3.8 + idx,
        rating: idx === 0 ? 4.9 : idx === 1 ? 4.6 : 4.2,
        estimatedPrice: 250 + (idx * 45),
        deliveryCharges: p.deliveryCharges || (idx === 0 ? 30 : 0),
        inStock: true
      }));

      if (enhancedPharmacies.length === 0) {
        setPharmacies([
          { id: 1, name: 'MedPlus Pharmacy', address: 'Campus Gate 1, Chandigarh University', rating: 4.8, distance: 1.2, estimatedPrice: 280, deliveryCharges: 20, inStock: true },
          { id: 2, name: 'Apollo Pharmacy', address: 'Main Road, Kharar', rating: 4.6, distance: 2.4, estimatedPrice: 320, deliveryCharges: 0, inStock: true },
          { id: 3, name: 'Wellness Forever', address: 'Academic Block 3 Market', rating: 4.3, distance: 4.1, estimatedPrice: 250, deliveryCharges: 40, inStock: true }
        ]);
      } else {
        setPharmacies(enhancedPharmacies);
      }
    } catch (e) {
      toast.error('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderPlaced || currentStepIndex >= 3) return;

    const timer = setInterval(() => {
      setSlotSecondsLeft(prev => {
        if (prev <= 1) {
          const nextIndex = currentStepIndex + 1;
          setCurrentStepIndex(nextIndex);

          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          if (nextIndex === 1) {
            const msg = '✅ Order Verified! Pharmacist verified prescription & packed medicines.';
            toast.success(msg, { duration: 4000 });
            setNotificationsLog(log => [{ time: nowTime, text: msg, type: 'verified' }, ...log]);
          } else if (nextIndex === 2) {
            const msg = `🛵 Out for Delivery! Courier agent is en route to ${hostelBuilding}, ${roomNumber}.`;
            toast.success(msg, { duration: 4000 });
            setNotificationsLog(log => [{ time: nowTime, text: msg, type: 'delivery' }, ...log]);
          } else if (nextIndex === 3) {
            const msg = `🎉 Delivered! Order handed over at ${hostelBuilding}, ${roomNumber}.`;
            toast.success(msg, { duration: 6000 });
            setNotificationsLog(log => [{ time: nowTime, text: msg, type: 'delivered' }, ...log]);
          }

          return 30; // reset 30s timer for next slot
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderPlaced, currentStepIndex, hostelBuilding, roomNumber]);

  const getFilteredPharmacies = () => {
    let result = [...pharmacies];
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    if (sortBy === 'distance') {
      result.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'price') {
      result.sort((a, b) => a.estimatedPrice - b.estimatedPrice);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  };

  const getAiRecommendation = () => {
    const candidates = [...pharmacies];
    if (candidates.length === 0) return null;
    
    candidates.sort((a, b) => {
      const scoreA = (a.rating * 10) - (a.distance * 2) - (a.estimatedPrice / 100);
      const scoreB = (b.rating * 10) - (b.distance * 2) - (b.estimatedPrice / 100);
      return scoreB - scoreA;
    });

    return candidates[0];
  };

  const handlePlaceOrder = async () => {
    if (!selectedPharmacy) {
      toast.error('Please select a pharmacy first.');
      return;
    }
    if (!roomNumber.trim()) {
      toast.error('Please enter your Hostel Room Number.');
      return;
    }

    const fullHostelAddress = `${hostelBuilding}, ${roomNumber}, CU Campus (${deliveryNote})`;

    try {
      const subtotal = selectedPharmacy.estimatedPrice;
      const delivery = selectedPharmacy.deliveryCharges || 0;
      const payload = {
        pharmacyName: selectedPharmacy.name,
        medicinesJson: JSON.stringify(medicines),
        deliveryAddress: fullHostelAddress,
        medicineAmount: subtotal,
        deliveryCharges: delivery,
        totalAmount: subtotal + delivery
      };
      
      const res = await pharmacyAPI.createOrder(payload);
      const orderId = res?.data?.data?.id;
      setPlacedOrderId(orderId);

      setOrderPlaced(true);
      setCurrentStepIndex(0);
      setSlotSecondsLeft(30);

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const initMsg = `📋 Order Placed with ${selectedPharmacy.name}! Delivery address: ${fullHostelAddress}`;
      toast.success(initMsg, { duration: 4000 });
      setNotificationsLog([{ time: nowTime, text: initMsg, type: 'placed' }]);
    } catch (e) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  const parseJson = (str) => {
    try {
      return JSON.parse(str || '[]');
    } catch (e) {
      return [];
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const aiRecommended = getAiRecommendation();
  const filteredList = getFilteredPharmacies();
  const medicines = prescription ? parseJson(prescription.medicines) : [];

  return (
    <div className="page-container section" style={{ minHeight: '85vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => navigate('/my-prescriptions')} className="btn btn-ghost btn-icon">
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="heading-md" style={{ margin: 0 }}>Order Medications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Select a pharmacy to fulfill your digital prescription with hostel delivery.</p>
        </div>
      </div>

      {!orderPlaced ? (
        <div className="pharmacy-order-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
          
          {/* Main Pharmacy selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Filters panel */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FiFilter color="var(--primary)" />
                <strong>Filter & Sort</strong>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { key: 'distance', label: 'Nearest' },
                    { key: 'price', label: 'Low Cost' },
                    { key: 'rating', label: 'Top Rated' }
                  ].map(opt => (
                    <button 
                      key={opt.key}
                      onClick={() => setSortBy(opt.key)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: sortBy === opt.key ? 'rgba(0, 217, 166, 0.1)' : 'transparent',
                        border: sortBy === opt.key ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        color: sortBy === opt.key ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <input 
                type="text" 
                placeholder="Search pharmacy..."
                className="form-input"
                style={{ width: '220px', margin: 0 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* AI Recommendation Alert */}
            {aiRecommended && (
              <div className="glass-card" style={{ padding: '20px', border: '1px solid var(--primary)', background: 'rgba(0,217,166,0.02)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(0,217,166,0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '10px' }}>
                  <FiCpu size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Safety & Stock Recommendation</span>
                  <h4 style={{ margin: '4px 0', fontSize: '1rem', fontWeight: 600 }}>{aiRecommended.name} is your best option!</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 12px 0' }}>
                    This pharmacy is currently nearest ({aiRecommended.distance} km), has full stock of your {medicines.length} prescribed medications, and boasts a {aiRecommended.rating}/5 rating.
                  </p>
                  <button onClick={() => setSelectedPharmacy(aiRecommended)} className="btn btn-primary btn-sm">Select AI Recommendation</button>
                </div>
              </div>
            )}

            {/* Pharmacies List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredList.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setSelectedPharmacy(p)}
                  className={`glass-card ${selectedPharmacy?.id === p.id ? 'selected' : ''}`}
                  style={{
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    border: selectedPharmacy?.id === p.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: selectedPharmacy?.id === p.id ? 'rgba(0,217,166,0.02)' : 'rgba(255,255,255,0.01)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 600 }}>{p.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 12px 0' }}>{p.address}</p>
                    
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMapPin color="var(--primary)" /> {p.distance} km away</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiStar color="var(--warning)" /> {p.rating} / 5</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>₹{p.estimatedPrice}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+ ₹{p.deliveryCharges} Delivery</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Sidebar: Checkout & Hostel Address */}
          <div className="glass-card" style={{ padding: '24px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 className="heading-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiShoppingBag color="var(--primary)" /> Checkout Summary</h3>
            
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Diagnosis</span>
              <div style={{ fontWeight: 'bold', marginTop: '2px' }}>{prescription?.diagnosis}</div>
              
              <div className="divider" style={{ margin: '12px 0' }}></div>
              
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Medications</span>
              {medicines.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span>{m.name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>x {m.duration}</span>
                </div>
              ))}
            </div>

            {/* Hostel Delivery Address Form */}
            <div style={{ background: 'rgba(0, 217, 166, 0.04)', border: '1px solid rgba(0, 217, 166, 0.2)', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiHome size={16} /> Hostel Delivery Address
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Hostel Building / Block</label>
                <select
                  value={hostelBuilding}
                  onChange={(e) => setHostelBuilding(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                >
                  <option value="Le Corbusier Hostel (Block B)">Le Corbusier Hostel (Block B)</option>
                  <option value="Le Corbusier Hostel (Block A)">Le Corbusier Hostel (Block A)</option>
                  <option value="Zakir Hostel (Block C)">Zakir Hostel (Block C)</option>
                  <option value="NC Hostel (Block D)">NC Hostel (Block D)</option>
                  <option value="LC Girls Hostel (Block E)">LC Girls Hostel (Block E)</option>
                  <option value="Sarojini Hostel">Sarojini Hostel</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Room Number</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Room 304"
                    className="form-input"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '8px 12px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Delivery Note</label>
                <input
                  type="text"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. Call on arrival at hostel gate"
                  className="form-input"
                  style={{ width: '100%', fontSize: '0.82rem', padding: '8px 12px' }}
                />
              </div>
            </div>

            {selectedPharmacy && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <strong>₹{selectedPharmacy.estimatedPrice}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Hostel Express Delivery</span>
                  <strong>₹{selectedPharmacy.deliveryCharges}</strong>
                </div>
                <div className="divider" style={{ margin: '8px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <span>Total Amount</span>
                  <strong className="text-gradient" style={{ fontSize: '1.2rem' }}>₹{selectedPharmacy.estimatedPrice + selectedPharmacy.deliveryCharges}</strong>
                </div>

                <button onClick={handlePlaceOrder} className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>Confirm Order & Pay</button>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Delivery Monitoring Screen (Swiggy / Zomato Style Tracking) */
        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
          
          {/* Main Swiggy/Zomato Status Header Card */}
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))', border: '1px solid rgba(0, 217, 166, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(0, 217, 166, 0.1)', padding: '20px', borderRadius: '50%', border: '1px solid var(--primary)', boxShadow: '0 0 20px rgba(0, 217, 166, 0.2)' }}>
                {TRACKING_SLOTS[currentStepIndex].icon}
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,217,166,0.15)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '12px' }}>
              <FiClock size={14} /> MedAstraX Express Campus Delivery
            </div>

            <h2 className="heading-md" style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800 }}>
              {TRACKING_SLOTS[currentStepIndex].title}
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', margin: '0 auto', maxWidth: '600px' }}>
              {TRACKING_SLOTS[currentStepIndex].statusMsg}
            </p>

            {/* Swiggy Valet Details Card */}
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', maxWidth: '560px', margin: '24px auto 0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: 'var(--primary)', color: '#000', width: '46px', height: '46px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                  🛵
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Vikram Singh <span style={{ color: '#eab308', fontSize: '0.8rem', marginLeft: '6px' }}>★ 4.9</span></div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>MedAstraX Verified Valet Partner • EV Scooter</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estimated Arrival</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {currentStepIndex === 3 ? 'Delivered 🎉' : 'In 2 mins'}
                </div>
              </div>
            </div>

            {/* Swiggy Style Live Progress Line */}
            {currentStepIndex < 3 && (
              <div style={{ marginTop: '20px', maxWidth: '560px', margin: '20px auto 0 auto' }}>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', height: '8px', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${((currentStepIndex + 1) / 4) * 100}%`, background: 'linear-gradient(90deg, var(--primary), #042a59)', height: '100%', transition: 'width 0.8s ease' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* 4-Step Swiggy/Zomato Timeline Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {TRACKING_SLOTS.map((slot, index) => {
              const isPassed = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div 
                  key={slot.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '16px', 
                    borderRadius: '12px',
                    border: isCurrent ? '2px solid var(--primary)' : isPassed ? '1px solid #00b4b6' : '1px solid var(--border-color)',
                    background: isCurrent ? 'rgba(0, 217, 166, 0.04)' : isPassed ? 'rgba(0, 180, 182, 0.02)' : 'rgba(255,255,255,0.01)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.78rem', color: isCurrent ? 'var(--primary)' : isPassed ? '#00b4b6' : 'var(--text-muted)' }}>
                      STEP 0{slot.stepNum}
                    </div>
                    <div>
                      {isPassed ? (
                        <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>Passed ✅</span>
                      ) : isCurrent ? (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(0, 217, 166, 0.2)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>In Progress 🛵</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '10px' }}>Upcoming ⏳</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {slot.icon}
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>{slot.title}</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {slot.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Delivery Address & Pharmacy Details Box */}
          <div className="glass-card" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'var(--bg-card)' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiHome color="var(--primary)" /> Hostel Delivery Destination
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {hostelBuilding}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>
                {roomNumber} • CU Campus
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                📝 Note: {deliveryNote}
              </div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiShoppingBag color="#042a59" /> Fulfilling Pharmacy
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {selectedPharmacy?.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                📍 {selectedPharmacy?.address} ({selectedPharmacy?.distance} km away)
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, marginTop: '6px' }}>
                Total Paid: ₹{(selectedPharmacy?.estimatedPrice || 0) + (selectedPharmacy?.deliveryCharges || 0)}
              </div>
            </div>
          </div>

          {/* Real-time Notifications Feed */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBell color="var(--primary)" /> Live Notifications Feed (30-Sec Slots)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notificationsLog.map((item, idx) => (
                <div key={idx} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', borderLeft: '3px solid var(--primary)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>[{item.time}]</span>
                  <span style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive SVG Map Visualisation */}
          <div className="glass-card" style={{ padding: '24px', background: '#0a0d14', height: '360px', position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
            {/* GPS HUD */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.85)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <FiNavigation color="var(--primary)" />
                <strong>Live GPS Hostel Navigation</strong>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Destination: {roomNumber}, {hostelBuilding}
              </div>
            </div>

            {/* SVG Map */}
            <svg width="100%" height="100%" viewBox="0 0 800 360" style={{ display: 'block' }}>
              <path d="M 50 80 Q 200 60 400 100 T 750 80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <path d="M 100 40 Q 250 180 400 320" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <path d="M 50 260 H 750" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              
              {/* Delivery Path Route */}
              <path 
                d="M 180 90 L 340 180 L 520 270" 
                fill="none" 
                stroke="rgba(0, 217, 166, 0.25)" 
                strokeWidth="8" 
                strokeDasharray="10 6"
              />

              {/* Pharmacy Location Node */}
              <circle cx="180" cy="90" r="16" fill="#1e293b" stroke="var(--primary)" strokeWidth="3" />
              <text x="180" y="65" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Pharmacy Store</text>

              {/* Customer Hostel Node */}
              <circle cx="520" cy="270" r="16" fill="#1e293b" stroke="#042a59" strokeWidth="3" />
              <text x="520" y="305" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">🏢 {hostelBuilding}</text>

              {/* GPS Live Mover (Moves based on currentStepIndex) */}
              <g style={{
                transform: `translate(${180 + (currentStepIndex * 113.3)}px, ${90 + (currentStepIndex * 60)}px)`,
                transition: 'transform 1.5s ease-in-out'
              }}>
                <circle cx="0" cy="0" r="12" fill="var(--primary)" className="animate-ping" style={{ opacity: 0.4 }} />
                <circle cx="0" cy="0" r="9" fill="var(--primary)" />
                <path d="M -4 -4 L 6 0 L -4 4 Z" fill="#fff" />
              </g>
            </svg>
          </div>

        </div>
      )}

    </div>
  );
}

