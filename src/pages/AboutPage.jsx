import { motion } from 'framer-motion';
import { 
  FiCalendar, 
  FiFileText, 
  FiActivity, 
  FiClipboard, 
  FiMic, 
  FiFolder,
  FiHeart
} from 'react-icons/fi';
import { 
  FaPills, 
  FaMicroscope, 
  FaAmbulance, 
  FaRobot, 
  FaHospital, 
  FaStethoscope,
  FaTrophy
} from 'react-icons/fa';
import './AboutPage.css';

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const capabilities = [
    {
      title: "Consultation",
      description: "Book verified doctors and hospitals, online or offline.",
      icon: <FiCalendar />,
      class: "icon-consultation"
    },
    {
      title: "Smart Prescription",
      description: "AI sends your prescription to the right place automatically.",
      icon: <FiFileText />,
      class: "icon-prescription"
    },
    {
      title: "Pharmacy",
      description: "Compare nearby pharmacies and get medicines delivered.",
      icon: <FaPills />,
      class: "icon-pharmacy"
    },
    {
      title: "Diagnostics",
      description: "Book lab tests and get digital reports online.",
      icon: <FaMicroscope />,
      class: "icon-diagnostics"
    },
    {
      title: "AI Health Triage",
      description: "AI reads your reports and flags how urgent it is.",
      icon: <FiActivity />,
      class: "icon-triage"
    },
    {
      title: "Personal Care Plans",
      description: "Get an AI diet, medicine and exercise plan with reminders.",
      icon: <FiClipboard />,
      class: "icon-careplans"
    },
    {
      title: "Recovery & Rewards",
      description: "Complete health tasks, earn points, unlock free offers.",
      icon: <FaTrophy />,
      class: "icon-rewards"
    },
    {
      title: "Emergency Response",
      description: "Find the nearest ambulance and an empty hospital bed.",
      icon: <FaAmbulance />,
      class: "icon-emergency"
    },
    {
      title: "Voice Assistant",
      description: "Talk to MedAstraX in your own language, anytime.",
      icon: <FiMic />,
      class: "icon-voice"
    },
    {
      title: "Offline Guardian Bot",
      description: "A pocket health bot that works even without internet.",
      icon: <FaRobot />,
      class: "icon-offline"
    },
    {
      title: "Health Record",
      description: "All your prescriptions and reports in one secure place.",
      icon: <FiFolder />,
      class: "icon-records"
    },
    {
      title: "For Partners",
      description: "Hospitals, pharmacies and labs grow with our network.",
      icon: <FaHospital />,
      class: "icon-partners"
    }
  ];

  return (
    <div className="about-page">
      {/* Background blobs */}
      <div className="about-bg-effects">
        <div className="bg-orb about-orb-1"></div>
        <div className="bg-orb about-orb-2"></div>
      </div>

      <div className="about-container">
        {/* Header Section */}
        <header className="about-header-section">
          <motion.h1 
            className="about-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About <span className="brand-med">Med</span><span className="brand-astra">Astra</span><span className="brand-x">CU</span>
          </motion.h1>
          <motion.p 
            className="about-intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            An all-in-one healthcare platform that connects doctors, pharmacies, labs, and an AI health assistant — so booking, medicines, tests, recovery, and emergencies all happen in one place. Powered by AI, available in your language, and built to work even offline. Every family's 24/7 health friend.
          </motion.p>
        </header>

        {/* Mission Section */}
        <section className="about-mission-section">
          <div className="mission-card glass-card">
            <div className="mission-content">
              <h2 className="heading-md mission-heading">Our <span className="text-gradient">mission</span></h2>
              <p className="mission-text">
                Our mission is to make quality healthcare reachable for every person — no matter where they live, what language they speak, or whether they have an internet connection.
              </p>
              <p className="mission-text">
                We're uniting doctors, pharmacies, labs, and AI into one seamless platform, so getting care is never again slow, scattered, or out of reach. From a simple consultation to a life-saving emergency, we want every family to have trusted health support in their pocket, 24/7.
              </p>
            </div>
            <div className="mission-graphic-box">
              <div className="stethoscope-glow"></div>
              <FaStethoscope className="stethoscope-icon" />
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="about-what-we-do-section">
          <div className="section-header">
            <h2 className="heading-lg">What we <span className="text-gradient">do</span></h2>
            <p className="auth-subtitle">Four connected chambers, one health journey</p>
          </div>

          <motion.div 
            className="capabilities-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {capabilities.map((cap, index) => (
              <motion.div 
                key={index}
                className="capability-card glass-card"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <div className={`capability-icon-wrapper ${cap.class}`}>
                  {cap.icon}
                </div>
                <h3 className="capability-title">{cap.title}</h3>
                <p className="capability-desc">{cap.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>
    </div>
  );
}
