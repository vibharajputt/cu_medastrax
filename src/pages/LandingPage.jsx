import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowRight, 
  FiCalendar, 
  FiShield, 
  FiClock, 
  FiVideo, 
  FiFileText, 
  FiTruck,
  FiSend,
  FiUser,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiMapPin,
  FiHeadphones
} from 'react-icons/fi';
import { FaUserMd, FaUser, FaStore } from 'react-icons/fa';
import doctorPatientImg from '../assets/university-students-hero.jpg';
import drAdityaImg from '../assets/dr-aditya.png';
import MedAstraXLogo from '../assets/medastrax-logo-new.png';
import './LandingPage.css';
import './ContactPage.css';

export default function LandingPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', purpose: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactChange = (e) => setContactForm({ ...contactForm, [e.target.name]: e.target.value });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 4000);
    setContactForm({ name: '', email: '', phone: '', purpose: '', message: '' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const cards = [
    {
      title: "For Patients",
      description: "Book appointments instantly. Choose between in-person hospital visits or remote video consultations, secure your slots, and manage your health records in a central dashboard.",
      link: "/login",
      icon: <FaUser />,
      color: "var(--primary)",
      actionText: "Access Patient Portal"
    },
    {
      title: "For Doctors",
      description: "Manage your practice. Add clinics/hospitals, adjust consult sitting rates, update available beds in real-time, and run telemedicine checkups without friction.",
      link: "/login",
      icon: <FaUserMd />,
      color: "var(--secondary)",
      actionText: "Access Doctor Console"
    },
    {
      title: "For Pharmacies",
      description: "Process prescriptions instantly. Dispense medicines, check digital logs, manage active queues, and streamline billing details in one unified platform.",
      link: "/login",
      icon: <FaStore />,
      color: "var(--primary-dark)",
      actionText: "Access Pharmacy Desk"
    }
  ];

  return (
    <div className="landing-page">
      {/* Background blobs */}
      <div className="landing-bg-effects">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="badge badge-primary hero-badge">
            <span className="badge-dot"></span> UNIFIED HEALTHCARE PLATFORM
          </span>
          <h1 className="hero-title">
            Care that connects.<br />
            Technology that <span className="text-accent">heals.</span>
          </h1>
          <p className="hero-subtitle">
            MedAstraX bridges patients, doctors, and pharmacies together. Book appointments, manage records, and get care — all in one secure platform.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-lg">
              Get Started Now <FiArrowRight />
            </Link>
            <Link to="/signup" className="btn btn-ghost btn-lg">
              Explore Features
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="hero-stats-grid">
            <div className="stat-item">
              <div className="stat-icon-wrapper stat-mint">
                <FaUser />
              </div>
              <div className="stat-info">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Patients Served</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrapper stat-blue">
                <FaUserMd />
              </div>
              <div className="stat-info">
                <span className="stat-number">500+</span>
                <span className="stat-label">Doctors</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrapper stat-orange">
                <FaStore />
              </div>
              <div className="stat-info">
                <span className="stat-number">100+</span>
                <span className="stat-label">Hospitals</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrapper stat-mint">
                <FiClock />
              </div>
              <div className="stat-info">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Visual Mockup Panel with Floating Cards */}
        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="doctor-patient-visual-container">
            <div className="doctor-patient-glow"></div>
            <div className="image-frame">
              <img src={doctorPatientImg} alt="Empathetic Doctor Patient Interaction" className="doctor-patient-photo" />
            </div>



            {/* Floating Secure Badge */}
            <div className="floating-card secure-card">
              <div className="secure-icon-box">
                <FiShield />
              </div>
              <div className="secure-text-box">
                <span className="secure-heading">100% Secure</span>
                <span className="secure-caption">Your data is protected</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>



      {/* Care Made Simple Section */}
      <section className="care-simple-section" id="how-it-works">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="heading-lg">Care made simple</h2>
          <p className="auth-subtitle">From booking to recovery, we make every step of your healthcare journey seamless.</p>
        </motion.div>

        <motion.div 
          className="process-timeline-container"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="process-timeline-line"></div>
          <div className="process-timeline-grid">
            <motion.div className="process-step-item" variants={itemVariants}>
              <div className="process-icon-box step-1">
                <FiCalendar />
              </div>
              <h4 className="process-step-title">Book Appointment</h4>
              <p className="process-step-desc">Choose a doctor and schedule your visit</p>
            </motion.div>

            <motion.div className="process-step-item" variants={itemVariants}>
              <div className="process-icon-box step-2">
                <FiVideo />
              </div>
              <h4 className="process-step-title">Consult & Connect</h4>
              <p className="process-step-desc">Talk to your doctor via chat or video call</p>
            </motion.div>

            <motion.div className="process-step-item" variants={itemVariants}>
              <div className="process-icon-box step-3">
                <FiFileText />
              </div>
              <h4 className="process-step-title">Get Prescription</h4>
              <p className="process-step-desc">Receive digital prescriptions and medical advice</p>
            </motion.div>

            <motion.div className="process-step-item" variants={itemVariants}>
              <div className="process-icon-box step-4">
                <FiTruck />
              </div>
              <h4 className="process-step-title">Get Care Delivered</h4>
              <p className="process-step-desc">Medicines and reports delivered to your door</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Role Cards Section */}
      <section className="portal-section">
        <div className="section-header">
          <h2 className="heading-lg">Select Your <span className="text-gradient">Portal</span></h2>
          <p className="auth-subtitle">Login or register to get customized access based on your profile.</p>
        </div>

        <motion.div 
          className="portal-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {cards.map((card, i) => (
            <motion.div 
              key={i} 
              className="glass-card portal-card" 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="portal-card-icon" style={{ background: card.color + '15', color: card.color }}>
                {card.icon}
              </div>
              <h3 className="heading-sm">{card.title}</h3>
              <p className="portal-card-desc">{card.description}</p>
              <Link to={card.link} className="btn btn-ghost portal-card-btn" style={{ borderColor: card.color + '30', color: card.color }}>
                {card.actionText} <FiArrowRight />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section className="features-section" id="about">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="heading-lg">Built for <span className="text-gradient">Modern Care</span></h2>
          <p className="auth-subtitle">Optimized features engineered for healthcare speed and accessibility.</p>
        </motion.div>

        <motion.div 
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="feature-item glass-card" variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }}>
            <div className="feature-icon-wrapper"><FiCalendar /></div>
            <h4>Slot Allocation</h4>
            <p>Fetches real-time appointments dynamically based on doctor timetables to avoid double-bookings.</p>
          </motion.div>
          <motion.div className="feature-item glass-card" variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }}>
            <div className="feature-icon-wrapper"><FiVideo /></div>
            <h4>Telehealth Ready</h4>
            <p>Conduct consultation checkups securely via browser-based video calls from any device.</p>
          </motion.div>
          <motion.div className="feature-item glass-card" variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }}>
            <div className="feature-icon-wrapper"><FiShield /></div>
            <h4>Secure Payments</h4>
            <p>Integrates with Razorpay test mode payment validation with cryptographic HMAC signature verification.</p>
          </motion.div>
          <motion.div className="feature-item glass-card" variants={itemVariants} whileHover={{ y: -6, scale: 1.02 }}>
            <div className="feature-icon-wrapper"><FiClock /></div>
            <h4>Instant Statuses</h4>
            <p>Real-time booking cancellations and instant transaction refund status displays.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial-section">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="heading-lg">What Our Clients <span className="text-gradient">Say</span></h2>
          <p className="auth-subtitle">Stories from healthcare institutions that have transformed their operations with MedAstraX</p>
        </motion.div>

        <motion.div 
          className="testimonial-container glass-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          whileHover={{ y: -4 }}
        >
          <div className="testimonial-left">
            <div className="client-image-wrapper">
              <img src={drAdityaImg} alt="Dr. Aditya Sharma" className="client-image" />
              <div className="quote-badge">
                <span>”</span>
              </div>
            </div>
            <div className="client-meta">
              <h4 className="client-org">Oxford Hospital</h4>
              <span className="client-name">Dr. Aditya Sharma</span>
              <span className="client-role">Chief Intervention Cardiologist & Diabetologist</span>
            </div>
          </div>

          <div className="testimonial-right">
            <div className="large-quote-icon">“</div>
            <p className="testimonial-quote-text">
              "MedAstraX is redefining how healthcare should work in India. Their innovative platforms like Hospital+ and DocAssist are not just improving operational efficiency but also bringing back the focus on patient care."
            </p>
          </div>
        </motion.div>
      </section>

      {/* ===== CONTACT SECTION embedded in landing ===== */}
      <section className="contact-section-landing" id="contact">
        {/* Section Header */}
        <motion.div 
          className="contact-header" 
          style={{ marginBottom: '48px' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="contact-badge">
            <span className="badge-dot"></span> WE'RE HERE TO HELP
          </span>
          <h2 className="contact-title">
            Get in <span className="text-gradient">Touch!</span>
          </h2>
          <p className="contact-subtitle">
            Make Your Hospital Smarter, Faster and Better with Improved Patient Experience and Efficiency.
          </p>
          <p className="contact-reach">Reach out to us and we'll get back to you as soon as possible.</p>
        </motion.div>

        <div className="contact-body">
          {/* Info Cards */}
          <motion.div 
            className="contact-info-panel"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="contact-info-card glass-card">
              <div className="info-icon-box info-icon-coral"><FiMapPin /></div>
              <div className="info-text">
                <h4>Our Office</h4>
                <p>MedAstraX HQ, Health Innovation Park,<br />Bengaluru, Karnataka — 560001</p>
              </div>
            </div>
            <div className="contact-info-card glass-card">
              <div className="info-icon-box info-icon-purple"><FiHeadphones /></div>
              <div className="info-text">
                <h4>Support</h4>
                <p>support@MedAstraX.com<br />+91 79887XXXXX</p>
              </div>
            </div>
            <div className="contact-info-card glass-card">
              <div className="info-icon-box info-icon-green"><FiClock /></div>
              <div className="info-text">
                <h4>Working Hours</h4>
                <p>Mon – Sat: 9:00 AM – 6:00 PM<br />Emergency: 24 / 7</p>
              </div>
            </div>
            <div className="contact-quote-box">
              <span className="contact-quote-mark">"</span>
              <p>Every family deserves trusted health support in their pocket, 24/7.</p>
              <span className="contact-quote-author">— MedAstraX</span>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            className="contact-form-panel"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="contact-form-card glass-card">
              {contactSubmitted ? (
                <motion.div className="contact-success" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <div className="success-icon">✓</div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We'll get back to you shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="contact-form" id="landing-contact-form">
                  <div className="form-group">
                    <label htmlFor="lc-name" className="form-label"><FiUser /> Name</label>
                    <input id="lc-name" type="text" name="name" value={contactForm.name} onChange={handleContactChange} placeholder="John Doe" required className="contact-input" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lc-email" className="form-label"><FiMail /> Email</label>
                    <input id="lc-email" type="email" name="email" value={contactForm.email} onChange={handleContactChange} placeholder="john@example.com" required className="contact-input" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lc-phone" className="form-label"><FiPhone /> Phone Number <span className="optional-tag">(optional)</span></label>
                    <input id="lc-phone" type="tel" name="phone" value={contactForm.phone} onChange={handleContactChange} placeholder="+1 (123) 456-7890" className="contact-input" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lc-purpose" className="form-label"><FiMessageSquare /> Purpose</label>
                    <select id="lc-purpose" name="purpose" value={contactForm.purpose} onChange={handleContactChange} required className="contact-select">
                      <option value="" disabled>Select a purpose</option>
                      <option value="general">General Inquiry</option>
                      <option value="partnership">Partnership / B2B</option>
                      <option value="hospital">Hospital Onboarding</option>
                      <option value="pharmacy">Pharmacy Integration</option>
                      <option value="technical">Technical Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="lc-message" className="form-label"><FiMessageSquare /> Message</label>
                    <textarea id="lc-message" name="message" value={contactForm.message} onChange={handleContactChange} placeholder="Type your message here..." required rows={5} className="contact-textarea" />
                  </div>
                  <button type="submit" className="contact-submit-btn"><FiSend /> Send Message</button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-main">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-logo-row">
              <img src={MedAstraXLogo} alt="MedAstraX" className="footer-logo-img" style={{ height: '115px', objectFit: 'contain' }} />
            </div>
            <p className="footer-tagline">Making Quality Healthcare Accessible for Every Family.</p>
            <div className="footer-social-row">
              <a href="#" aria-label="Twitter" className="footer-social-btn">𝕏</a>
              <a href="#" aria-label="LinkedIn" className="footer-social-btn">in</a>
              <a href="#" aria-label="Instagram" className="footer-social-btn">ig</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-link-col">
            <h5 className="footer-col-heading">Quick Links</h5>
            <ul className="footer-link-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/signup">Get Started</Link></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div className="footer-link-col">
            <h5 className="footer-col-heading">Useful Links</h5>
            <ul className="footer-link-list">
              <li><a href="#">How it Works?</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Use</a></li>
              <li><a href="#">Refund Policy</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-link-col">
            <h5 className="footer-col-heading">Company</h5>
            <ul className="footer-link-list">
              <li><a href="#">Careers</a></li>
              <li><Link to="/help">Help Center</Link></li>
              <li><a href="#">Our Team</a></li>
              <li><Link to="/faq">FAQs</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div className="footer-link-col">
            <h5 className="footer-col-heading">Community</h5>
            <ul className="footer-link-list">
              <li><a href="#">Outreach</a></li>
              <li><Link to="/support">Support</Link></li>
              <li><a href="#">Campaigns</a></li>
              <li><a href="#">Partner Portal</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p>© 2025 MedAstraX Health IT Pvt. Ltd. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
