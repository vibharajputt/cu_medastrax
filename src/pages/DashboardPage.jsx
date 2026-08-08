import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiUser, FiCalendar, FiActivity, FiTruck, FiTag, FiSearch, 
  FiFileText, FiPhone, FiAlertOctagon, FiCheckCircle, FiClock, 
  FiUpload, FiChevronRight, FiMapPin, FiHeart, FiDollarSign, FiLogOut 
} from 'react-icons/fi';
import { FaStethoscope, FaFlask, FaClinicMedical } from 'react-icons/fa';
import logo from '../assets/medastrax-logo-new.png';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('portal');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [appointments, setAppointments] = useState([
    { id: 1, doctor: 'Dr. Anita Desai', specialty: 'General Physician', date: '2026-07-15', time: '10:00 AM', mode: 'In-Person', status: 'Confirmed' },
    { id: 2, doctor: 'Dr. Rajesh Kumar', specialty: 'Dermatologist', date: '2026-07-18', time: '02:30 PM', mode: 'Online', status: 'Pending' }
  ]);
  
  const [newAppt, setNewAppt] = useState({ doctorId: '', date: '', time: '', mode: 'Online' });
  const [apptMessage, setApptMessage] = useState('');

  const [ambulanceRequest, setAmbulanceRequest] = useState(null);
  const [ambulanceStatusTimer, setAmbulanceStatusTimer] = useState(null);

  const [medicineSearch, setMedicineSearch] = useState('');
  const [compareResult, setCompareResult] = useState([]);
  
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const [pharmacyCart, setPharmacyCart] = useState([]);
  const [pharmacyMessage, setPharmacyMessage] = useState('');
  
  const [medicineDelivery, setMedicineDelivery] = useState([
    { id: 'ORD-9921', medicine: 'Paracetamol 650mg, Vitamin C', date: '2026-07-11', status: 'Out for Delivery', type: 'Normal' }
  ]);

  const [coupons, setCoupons] = useState([
    { id: 1, code: 'STUDENTFIT25', desc: '25% off General Health Checkup at Campus Clinic', category: 'Consultation', claimed: false },
    { id: 2, code: 'MEDASTRA50', desc: '50% off Preventive Dental Cleaning services', category: 'Wellness', claimed: false },
    { id: 3, code: 'CAMPUSCHEM10', desc: '10% discount on generic medicine purchases', category: 'Pharmacy', claimed: false }
  ]);

  if (!user) return null;

  const doctors = [
    { id: '1', name: 'Dr. Anita Desai', specialty: 'General Physician', experience: '12 years', rating: '4.8', availability: 'Mon - Fri (9 AM - 1 PM)' },
    { id: '2', name: 'Dr. Rajesh Kumar', specialty: 'Dermatologist', experience: '8 years', rating: '4.7', availability: 'Mon, Wed, Fri (2 PM - 5 PM)' },
    { id: '3', name: 'Dr. Samuel Vance', specialty: 'Cardiologist / Heart Specialist', experience: '15 years', rating: '4.9', availability: 'Tue, Thu (10 AM - 12 PM)' },
    { id: '4', name: 'Dr. Priya Patel', specialty: 'Psychiatrist / Mental Wellness', experience: '10 years', rating: '4.9', availability: 'Mon - Sat (3 PM - 6 PM)' }
  ];

  const medicineDB = [
    { name: 'Paracetamol 650mg (Dolo)', generic: 'Paracetamol', priceVikas: 15, priceApollo: 18, priceCampus: 12, availability: 'In Stock' },
    { name: 'Ibuprofen 400mg', generic: 'Ibuprofen', priceVikas: 22, priceApollo: 25, priceCampus: 18, availability: 'In Stock' },
    { name: 'Amoxicillin 500mg (Antibiotic)', generic: 'Amoxicillin', priceVikas: 85, priceApollo: 90, priceCampus: 70, availability: 'Prescription Required' },
    { name: 'Cetirizine 10mg (Alerid)', generic: 'Cetirizine', priceVikas: 30, priceApollo: 35, priceCampus: 25, availability: 'In Stock' },
    { name: 'Multivitamins (Zinc + Vit C)', generic: 'Vitamin Complex', priceVikas: 120, priceApollo: 130, priceCampus: 95, availability: 'In Stock' }
  ];

  const handleBookAppointment = (e) => {
    e.preventDefault();
    if (!newAppt.doctorId || !newAppt.date || !newAppt.time) {
      setApptMessage('Please select a doctor, date and time slot.');
      return;
    }
    const selectedDoc = doctors.find(d => d.id === newAppt.doctorId);
    const added = {
      id: Date.now(),
      doctor: selectedDoc.name,
      specialty: selectedDoc.specialty,
      date: newAppt.date,
      time: newAppt.time,
      mode: newAppt.mode,
      status: 'Confirmed'
    };
    setAppointments([added, ...appointments]);
    setApptMessage(`Appointment successfully scheduled with ${selectedDoc.name}!`);
    setNewAppt({ doctorId: '', date: '', time: '', mode: 'Online' });
    setTimeout(() => setApptMessage(''), 4000);
  };

  const handleAmbulanceRequest = (location) => {
    if (!location) return;
    
    if (ambulanceStatusTimer) {
      clearInterval(ambulanceStatusTimer);
    }

    const requestObj = {
      location,
      status: 'Dispatching Crew',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      eta: '5 minutes'
    };
    setAmbulanceRequest(requestObj);

    const timer1 = setTimeout(() => {
      setAmbulanceRequest(prev => prev ? { ...prev, status: 'En Route', eta: '3 minutes' } : null);
    }, 4500);

    const timer2 = setTimeout(() => {
      setAmbulanceRequest(prev => prev ? { ...prev, status: 'Arrived at Location', eta: '0 minutes' } : null);
    }, 10000);

    setAmbulanceStatusTimer([timer1, timer2]);
  };

  const cancelAmbulance = () => {
    setAmbulanceRequest(null);
    if (ambulanceStatusTimer) {
      ambulanceStatusTimer.forEach(clearTimeout);
      setAmbulanceStatusTimer(null);
    }
  };

  const handleMedicineSearch = (query) => {
    setMedicineSearch(query);
    if (!query) {
      setCompareResult([]);
      return;
    }
    const results = medicineDB.filter(m => 
      m.name.toLowerCase().includes(query.toLowerCase()) || 
      m.generic.toLowerCase().includes(query.toLowerCase())
    );
    setCompareResult(results);
  };

  const addToCart = (med, price) => {
    const item = {
      id: Date.now(),
      name: med.name,
      price: price,
      quantity: 1
    };
    setPharmacyCart([...pharmacyCart, item]);
    setPharmacyMessage(`Added ${med.name} to pharmacy cart.`);
    setTimeout(() => setPharmacyMessage(''), 3000);
  };

  const handleCheckoutMedicine = () => {
    if (pharmacyCart.length === 0) return;
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const newDelivery = {
      id: orderId,
      medicine: pharmacyCart.map(item => item.name).join(', '),
      date: new Date().toISOString().split('T')[0],
      status: 'Prescription Verified & Dispatching',
      type: 'Normal'
    };
    setMedicineDelivery([newDelivery, ...medicineDelivery]);
    setPharmacyCart([]);
    setPharmacyMessage(`Order ${orderId} placed successfully! Doorstep delivery status is tracked in Medicine Delivery.`);
    setTimeout(() => setPharmacyMessage(''), 5000);
  };

  const claimCoupon = (id) => {
    setCoupons(coupons.map(c => {
      if (c.id === id) {
        return { ...c, claimed: true };
      }
      return c;
    }));
  };

  return (
    <div className="dashboard-outer-container">
      <div className="dashboard-light-card">
        
        {/* Sidebar navigation */}
        <aside className="dashboard-sidebar">
          <div className="brand-header-sidebar">
            <img src={logo} alt="MedAstraX Logo" className="sidebar-logo-img" />
            <h3>MedAstraX</h3>
          </div>

          <div className="user-profile-summary">
            <div className="avatar-circle">
              <FiUser size={24} />
            </div>
            <div className="user-profile-details">
              <h4>{user.name}</h4>
              <span className="badge-role">{user.role}</span>
            </div>
          </div>

          <nav className="sidebar-menu">
            {/* 1. Student / Faculty Health Portal */}
            <button 
              className={`menu-btn ${activeTab === 'portal' ? 'active' : ''}`}
              onClick={() => setActiveTab('portal')}
            >
              <FiUser className="menu-icon" /> 
              {user.role === 'Student' ? 'Student Health Portal' : 'Faculty Health Portal'}
            </button>

            {/* 2. Doctor Consultation Facility */}
            <button 
              className={`menu-btn ${activeTab === 'consultation' ? 'active' : ''}`}
              onClick={() => setActiveTab('consultation')}
            >
              <FiCalendar className="menu-icon" /> Doctor Consultation
            </button>

            {/* 3. Ambulance Assistance Facility */}
            <button 
              className={`menu-btn ${activeTab === 'ambulance' ? 'active' : ''}`}
              onClick={() => setActiveTab('ambulance')}
            >
              <FiAlertOctagon className="menu-icon" /> Ambulance Assistance
            </button>

            {/* 4. Student Healthcare Coupon Program (Students Only) */}
            {user.role === 'Student' && (
              <button 
                className={`menu-btn ${activeTab === 'coupons' ? 'active' : ''}`}
                onClick={() => setActiveTab('coupons')}
              >
                <FiTag className="menu-icon" /> Health Coupons
              </button>
            )}

            {/* 5. Pharmacy (Chemist) Services */}
            <button 
              className={`menu-btn ${activeTab === 'pharmacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('pharmacy')}
            >
              <FiFileText className="menu-icon" /> Pharmacy Services
            </button>

            {/* 6. Medicine Delivery Facility */}
            <button 
              className={`menu-btn ${activeTab === 'delivery' ? 'active' : ''}`}
              onClick={() => setActiveTab('delivery')}
            >
              <FiTruck className="menu-icon" /> Medicine Delivery
            </button>

            {/* 7. Medicine Price Comparison Facility */}
            <button 
              className={`menu-btn ${activeTab === 'comparison' ? 'active' : ''}`}
              onClick={() => setActiveTab('comparison')}
            >
              <FiDollarSign className="menu-icon" /> Price Comparison
            </button>
          </nav>

          <button className="logout-sidebar-btn" onClick={logout}>
            <FiLogOut style={{ marginRight: '8px' }} /> Sign Out
          </button>
        </aside>

        {/* Main dashboard content workspace */}
        <main className="dashboard-content-area">
          
          {/* HEALTH PORTAL (STUDENT / FACULTY ROLE CUSTOMIZED) */}
          {activeTab === 'portal' && (
            <div className="tab-pane animate-fade">
              <div className="portal-header-banner">
                <h2>{user.role === 'Student' ? 'Student Health Portal' : 'Faculty Health Portal'}</h2>
                <p>Manage all your campus healthcare-related services, medical consultation histories, and prescription management from a single platform.</p>
              </div>

              <div className="portal-meta-grid">
                {/* User Bio Card */}
                <div className="portal-card user-bio-card">
                  <h3>Identification & Details</h3>
                  <div className="bio-details-list">
                    <div className="bio-row"><strong>Name:</strong> <span>{user.name}</span></div>
                    <div className="bio-row"><strong>Email:</strong> <span>{user.email}</span></div>
                    <div className="bio-row"><strong>Department:</strong> <span>{user.department}</span></div>
                    {user.role === 'Student' ? (
                      <>
                        <div className="bio-row"><strong>Roll Number:</strong> <span>{user.rollNo}</span></div>
                        <div className="bio-row"><strong>Residence:</strong> <span>{user.hostel}</span></div>
                      </>
                    ) : (
                      <div className="bio-row"><strong>Faculty ID:</strong> <span>{user.facultyId}</span></div>
                    )}
                  </div>
                </div>

                {/* Clinical Records / Status Details */}
                <div className="portal-card records-card">
                  <h3>Medical Profile Summary</h3>
                  <div className="wellness-metric-grid">
                    <div className="metric-box">
                      <span className="metric-lbl">Blood Type</span>
                      <span className="metric-val">O Positive (O+)</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-lbl">Allergies</span>
                      <span className="metric-val text-warning">Penicillin</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-lbl">Vaccinations</span>
                      <span className="metric-val text-success">Up to date</span>
                    </div>
                  </div>

                  <div className="preventive-support-note">
                    <h4>Wellness & Preventive Guidance</h4>
                    {user.role === 'Student' ? (
                      <p>Standard campus insurance covers 100% of flu shots and mental health consultations. Visit the Health Coupons tab to activate discounts.</p>
                    ) : (
                      <p>Annual Faculty health assessment is scheduled for next month. Check-up includes cardiovascular and comprehensive metabolic panels.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCTOR CONSULTATION TAB */}
          {activeTab === 'consultation' && (
            <div className="tab-pane animate-fade">
              <div className="portal-header-banner">
                <h2>Doctor Consultation Facility</h2>
                <p>Access qualified healthcare professionals, book online/offline appointments, and view scheduling logs.</p>
              </div>

              <div className="consultation-section-grid">
                {/* Book Appointment Block */}
                <div className="appointment-form-card">
                  <h3>Book Doctor Appointment</h3>
                  {apptMessage && <div className="toast-notification success">{apptMessage}</div>}
                  
                  <form onSubmit={handleBookAppointment} className="appointment-form">
                    <div className="form-group">
                      <label>Select Healthcare Specialist</label>
                      <select 
                        value={newAppt.doctorId} 
                        onChange={(e) => setNewAppt({...newAppt, doctorId: e.target.value})}
                        required
                      >
                        <option value="">Choose a Doctor...</option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row-internal">
                      <div className="form-group">
                        <label>Preferred Date</label>
                        <input 
                          type="date" 
                          value={newAppt.date} 
                          onChange={(e) => setNewAppt({...newAppt, date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Time Slot</label>
                        <select 
                          value={newAppt.time} 
                          onChange={(e) => setNewAppt({...newAppt, time: e.target.value})}
                          required
                        >
                          <option value="">Select Time...</option>
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:30 AM">10:30 AM</option>
                          <option value="11:45 AM">11:45 AM</option>
                          <option value="02:30 PM">02:30 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Consultation Mode</label>
                      <div className="mode-toggle-group">
                        <button 
                          type="button" 
                          className={`mode-btn ${newAppt.mode === 'Online' ? 'active' : ''}`}
                          onClick={() => setNewAppt({...newAppt, mode: 'Online'})}
                        >
                          Online (Video)
                        </button>
                        <button 
                          type="button" 
                          className={`mode-btn ${newAppt.mode === 'Offline' ? 'active' : ''}`}
                          onClick={() => setNewAppt({...newAppt, mode: 'Offline'})}
                        >
                          Offline (In-Person)
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      Confirm Booking
                    </button>
                  </form>
                </div>

                {/* Consultation History */}
                <div className="appointment-history-card">
                  <h3>Consultation History & Records</h3>
                  
                  <div className="appointments-history-list">
                    {appointments.map(appt => (
                      <div className="appointment-history-item" key={appt.id}>
                        <div className="appt-meta">
                          <h4>{appt.doctor}</h4>
                          <span>{appt.specialty}</span>
                          <p>{appt.date} at {appt.time}</p>
                        </div>
                        <div className="appt-badge-status-container">
                          <span className={`badge-mode ${appt.mode.toLowerCase()}`}>{appt.mode}</span>
                          <span className={`badge-status ${appt.status.toLowerCase()}`}>{appt.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AMBULANCE ASSISTANCE TAB */}
          {activeTab === 'ambulance' && (
            <div className="tab-pane animate-fade">
              <div className="portal-header-banner">
                <h2>Ambulance Assistance Facility</h2>
                <p>Prompt transportation coordination and quick dispatch emergency system for campus residents.</p>
              </div>

              <div className="ambulance-split-grid">
                <div className="ambulance-request-card">
                  <h3>Request Ambulance Support</h3>
                  <p>Choose your current campus zone to instantly notify the rescue team.</p>
                  
                  <div className="ambulance-action-zones">
                    <button className="zone-btn" onClick={() => handleAmbulanceRequest('Hostel Wing Block A')}>
                      <FiMapPin /> Hostels
                    </button>
                    <button className="zone-btn" onClick={() => handleAmbulanceRequest('Academic Block C (Auditorium)')}>
                      <FiMapPin /> Academic Block
                    </button>
                    <button className="zone-btn" onClick={() => handleAmbulanceRequest('Sports & Gymnasium Arena')}>
                      <FiMapPin /> Sports Ground
                    </button>
                    <button className="zone-btn" onClick={() => handleAmbulanceRequest('Campus Cafeteria')}>
                      <FiMapPin /> Student Center
                    </button>
                  </div>

                  {ambulanceRequest && (
                    <div className="dispatch-alert-active animate-fade">
                      <h4>🚑 AMBULANCE EN ROUTE</h4>
                      <p><strong>Location:</strong> {ambulanceRequest.location}</p>
                      <p><strong>Status:</strong> <span className="text-danger">{ambulanceRequest.status}</span></p>
                      <p><strong>ETA:</strong> {ambulanceRequest.eta}</p>
                      <button className="btn btn-outline-danger" onClick={cancelAmbulance} style={{ marginTop: '12px' }}>
                        Cancel Request
                      </button>
                    </div>
                  )}
                </div>

                <div className="emergency-contacts-card">
                  <h3>Emergency Contacts</h3>
                  <div className="contacts-list">
                    <div className="contact-item">
                      <div>
                        <h5>Campus Health Center</h5>
                        <p>Available 24/7 for minor injuries</p>
                      </div>
                      <a href="tel:+919876543210" className="contact-tel-btn"><FiPhone /> Call Center</a>
                    </div>
                    <div className="contact-item">
                      <div>
                        <h5>Campus Security</h5>
                        <p>For urgent perimeter assistance</p>
                      </div>
                      <a href="tel:+919876543211" className="contact-tel-btn"><FiPhone /> Call Security</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HEALTHCARE COUPON PROGRAM (STUDENTS ONLY) */}
          {activeTab === 'coupons' && user.role === 'Student' && (
            <div className="tab-pane animate-fade">
              <div className="portal-header-banner">
                <h2>Student Healthcare Coupon Program</h2>
                <p>Redeem campus-specific digital health vouchers to obtain healthcare discounts, clinic consultations, and pharmacy benefits.</p>
              </div>

              <div className="coupons-grid">
                {coupons.map(coupon => (
                  <div className={`coupon-card ${coupon.claimed ? 'claimed' : ''}`} key={coupon.id}>
                    <div className="coupon-badge">{coupon.category}</div>
                    <div className="coupon-main">
                      <h3 className="coupon-code">{coupon.code}</h3>
                      <p>{coupon.desc}</p>
                    </div>
                    <div className="coupon-action-footer">
                      {coupon.claimed ? (
                        <span className="claimed-label"><FiCheckCircle /> Code Activated</span>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => claimCoupon(coupon.id)}>
                          Redeem Coupon
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PHARMACY (CHEMIST) SERVICES */}
          {activeTab === 'pharmacy' && (
            <div className="tab-pane animate-fade">
              <div className="portal-header-banner">
                <h2>Pharmacy (Chemist) Services</h2>
                <p>Online medicine ordering, prescription uploads, and campus chemist stock procurement.</p>
              </div>

              <div className="pharmacy-grid">
                <div className="pharmacy-block ordering-block" style={{ gridColumn: 'span 2' }}>
                  <h3>Order Medicines & Upload Prescription</h3>
                  {pharmacyMessage && <div className="toast-notification info">{pharmacyMessage}</div>}
                  
                  <div className="prescription-upload-box">
                    <FiUpload size={32} className="upload-icon" />
                    <h4>Upload Digital Prescription</h4>
                    <p>Required for antibiotic and specialist medicine procurement</p>
                    <input 
                      type="file" 
                      id="presc-file" 
                      style={{ display: 'none' }} 
                      onChange={() => setPrescriptionUploaded(true)}
                    />
                    <button className="btn btn-outline-primary btn-sm" onClick={() => document.getElementById('presc-file').click()}>
                      {prescriptionUploaded ? '✓ Prescription Attached' : 'Select PDF/Image File'}
                    </button>
                  </div>

                  <div className="pharmacy-cart-box">
                    <h4>Pharmacy Checkout Cart</h4>
                    {pharmacyCart.length > 0 ? (
                      <>
                        <div className="cart-items-list">
                          {pharmacyCart.map(item => (
                            <div className="cart-item" key={item.id}>
                              <span>{item.name}</span>
                              <span>₹{item.price}</span>
                            </div>
                          ))}
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={handleCheckoutMedicine}>
                          Confirm Order & Checkout
                        </button>
                      </>
                    ) : (
                      <p className="no-items-placeholder">Your pharmacy cart is empty. Use the 'Price Comparison' tab to search and add generic drugs.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEDICINE DELIVERY FACILITY */}
          {activeTab === 'delivery' && (
            <div className="tab-pane animate-fade">
              <div className="portal-header-banner">
                <h2>Medicine Delivery Facility</h2>
                <p>Doorstep medicine delivery services within campus residence halls or faculty offices.</p>
              </div>

              <div className="delivery-tracker-section">
                <h3>Medicine Delivery Status</h3>
                <div className="delivery-track-list">
                  {medicineDelivery.map(del => (
                    <div className="delivery-track-card" key={del.id}>
                      <div className="delivery-track-header">
                        <div>
                          <h5>Order ID: {del.id}</h5>
                          <p className="del-med-list">{del.medicine}</p>
                        </div>
                        <span className="badge-delivery-status">{del.status}</span>
                      </div>
                      <div className="delivery-track-footer">
                        <span>Ordered Date: {del.date}</span>
                        <span>Delivery Zone: {user.role === 'Student' ? user.hostel : 'Faculty Office'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MEDICINE PRICE COMPARISON FACILITY */}
          {activeTab === 'comparison' && (
            <div className="tab-pane animate-fade">
              <div className="portal-header-banner">
                <h2>Medicine Price Comparison Facility</h2>
                <p>Search generic alternatives and compare pricing models transparently across participating campus chemists.</p>
              </div>

              <div className="pharmacy-block price-comparison-block">
                <h3>Generic Medicine Alternative & Price Search</h3>
                
                <div className="search-bar-wrapper">
                  <FiSearch className="search-bar-icon" />
                  <input 
                    type="text" 
                    placeholder="Search medicine name or generic brand (e.g. Paracetamol)..." 
                    value={medicineSearch}
                    onChange={(e) => handleMedicineSearch(e.target.value)}
                  />
                </div>

                <div className="comparison-results-list">
                  {compareResult.length > 0 ? (
                    compareResult.map((med, idx) => (
                      <div className="med-compare-card" key={idx}>
                        <div className="med-compare-header">
                          <div>
                            <h4>{med.name}</h4>
                            <span className="generic-lbl">Generic: {med.generic}</span>
                          </div>
                          <span className={`med-stock-badge ${med.availability.replace(/\s+/g, '-').toLowerCase()}`}>
                            {med.availability}
                          </span>
                        </div>

                        <div className="chemist-pricing-grid">
                          <div className="chemist-price-option best-deal">
                            <span className="chemist-name">Campus Pharmacy</span>
                            <span className="chemist-price">₹{med.priceCampus}</span>
                            <button className="btn btn-primary btn-xs" onClick={() => addToCart(med, med.priceCampus)}>Add to Cart</button>
                          </div>
                          <div className="chemist-price-option">
                            <span className="chemist-name">Vikas Chemists</span>
                            <span className="chemist-price">₹{med.priceVikas}</span>
                          </div>
                          <div className="chemist-price-option">
                            <span className="chemist-name">Apollo Pharmacy</span>
                            <span className="chemist-price">₹{med.priceApollo}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : medicineSearch ? (
                    <p className="no-items-placeholder">No matching medicines found.</p>
                  ) : (
                    <div className="quick-suggestions-box">
                      <h5>Quick Suggestions:</h5>
                      <div className="suggestion-tags">
                        <span onClick={() => handleMedicineSearch('Paracetamol')}>Paracetamol</span>
                        <span onClick={() => handleMedicineSearch('Ibuprofen')}>Ibuprofen</span>
                        <span onClick={() => handleMedicineSearch('Amoxicillin')}>Amoxicillin</span>
                        <span onClick={() => handleMedicineSearch('Multivitamins')}>Multivitamins</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
