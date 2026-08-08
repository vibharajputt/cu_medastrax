import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiUser, FiMail, FiPhone, FiMessageSquare, FiMapPin, FiClock, FiHeadphones } from 'react-icons/fi';
import './ContactPage.css';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    purpose: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetUrl = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/contact` 
      : `http://${window.location.hostname}:8081/api/contact`;

    fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    })
    .then(response => {
      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setForm({ name: '', email: '', phone: '', purpose: '', message: '' });
      } else {
        alert('Failed to send message. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error submitting contact form:', error);
      alert('An error occurred. Please try again.');
    });
  };

  return (
    <div className="contact-page">
      {/* Background orbs */}
      <div className="contact-bg-effects">
        <div className="contact-orb contact-orb-1"></div>
        <div className="contact-orb contact-orb-2"></div>
        <div className="contact-orb contact-orb-3"></div>
      </div>

      <div className="contact-container">
        {/* Header */}
        <motion.div
          className="contact-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="contact-badge">
            <span className="badge-dot"></span> WE'RE HERE TO HELP
          </span>
          <h1 className="contact-title">
            Get in <span className="text-gradient">Touch!</span>
          </h1>
          <p className="contact-subtitle">
            Make Your Hospital Smarter, Faster and Better with Improved Patient Experience and Efficiency.
          </p>
          <p className="contact-reach">
            Reach out to us and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        {/* Body: Info Cards + Form */}
        <div className="contact-body">
          {/* Left Info Cards */}
          <motion.div
            className="contact-info-panel"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <motion.div 
              className="contact-info-card glass-card"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="info-icon-box info-icon-coral">
                <FiMapPin />
              </div>
              <div className="info-text">
                <h4>Our Office</h4>
                <p>MedAstraX HQ, Health Innovation Park,<br />Bengaluru, Karnataka — 560001</p>
              </div>
            </motion.div>

            <motion.div 
              className="contact-info-card glass-card"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="info-icon-box info-icon-purple">
                <FiHeadphones />
              </div>
              <div className="info-text">
                <h4>Support</h4>
                <p>support@MedAstraX.com<br />+91 79887XXXXX</p>
              </div>
            </motion.div>

            <motion.div 
              className="contact-info-card glass-card"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="info-icon-box info-icon-green">
                <FiClock />
              </div>
              <div className="info-text">
                <h4>Working Hours</h4>
                <p>Mon – Sat: 9:00 AM – 6:00 PM<br />Emergency: 24 / 7</p>
              </div>
            </motion.div>

            {/* Decorative quote */}
            <div className="contact-quote-box">
              <span className="contact-quote-mark">"</span>
              <p>Every family deserves trusted health support in their pocket, 24/7.</p>
              <span className="contact-quote-author">— MedAstraX</span>
            </div>
          </motion.div>

          {/* Right Form */}
          <motion.div
            className="contact-form-panel"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="contact-form-card glass-card">
              {submitted ? (
                <motion.div
                  className="contact-success"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="success-icon">✓</div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We'll get back to you shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form" id="contact-form">
                  <div className="form-group">
                    <label htmlFor="contact-name" className="form-label">
                      <FiUser /> Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="contact-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-email" className="form-label">
                      <FiMail /> Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="contact-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-phone" className="form-label">
                      <FiPhone /> Phone Number <span className="optional-tag">(optional)</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (123) 456-7890"
                      className="contact-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-purpose" className="form-label">
                      <FiMessageSquare /> Purpose
                    </label>
                    <select
                      id="contact-purpose"
                      name="purpose"
                      value={form.purpose}
                      onChange={handleChange}
                      required
                      className="contact-select"
                    >
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
                    <label htmlFor="contact-message" className="form-label">
                      <FiMessageSquare /> Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Type your message here..."
                      required
                      rows={5}
                      className="contact-textarea"
                    />
                  </div>

                  <button type="submit" className="contact-submit-btn">
                    <FiSend /> Send Message
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
