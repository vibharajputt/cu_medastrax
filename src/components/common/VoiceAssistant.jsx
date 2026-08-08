import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMic, FiMicOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './VoiceAssistant.css';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const convStateRef = useRef('IDLE');
  const bookingDataRef = useRef({ symptoms: '', time: '' });
  const navigate = useNavigate();
  const { login, isAuthenticated, logout } = useAuth();

  const speak = (message) => {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.onend = () => {
      if (convStateRef.current !== 'IDLE' && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast('Listening...', { icon: '🎤', duration: 2000 });
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const resultTranscript = event.results[current][0].transcript.toLowerCase();
      setTranscript(resultTranscript);
      handleIntent(resultTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast.error('Could not hear you properly. Try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleIntent = (text) => {
    toast.success(`Heard: "${text}"`, { duration: 3000 });

    if (convStateRef.current === 'ASKING_SYMPTOMS') {
      bookingDataRef.current.symptoms = text;
      convStateRef.current = 'ASKING_TIME';
      speak("Got it. What date and time would you like to book this appointment?");
      return;
    }

    if (convStateRef.current === 'ASKING_TIME') {
      bookingDataRef.current.time = text;
      convStateRef.current = 'IDLE';
      speak("Booking your appointment now. Please wait.");
      const { symptoms, time } = bookingDataRef.current;
      navigate(`/book/HOS101?autoPilot=true&symptoms=${encodeURIComponent(symptoms)}&time=${encodeURIComponent(time)}`);
      return;
    }

    const isLoginCommand = text.includes('login') || text.includes('log in') || text.includes('sign in');
    if (isLoginCommand) {
      const roleMap = {
        'doctor': { role: 'DOCTOR', path: '/doctor/dashboard', name: 'Dr. Smith' },
        'admin': { role: 'ADMIN', path: '/admin/dashboard', name: 'Admin User' },
        'hospital': { role: 'HOSPITAL', path: '/hospital/dashboard', name: 'City Hospital' },
        'pharmacy': { role: 'PHARMACY', path: '/pharmacy/dashboard', name: 'Health Pharmacy' },
        'lab': { role: 'LAB', path: '/lab/dashboard', name: 'Central Lab' },
        'student': { role: 'PATIENT', path: '/dashboard', name: 'RASHIKA POONIA' },
        'patient': { role: 'PATIENT', path: '/dashboard', name: 'RASHIKA POONIA' }
      };

      let matchedRole = null;
      for (const [key, data] of Object.entries(roleMap)) {
        if (text.includes(key)) {
          matchedRole = data;
          break;
        }
      }

      if (matchedRole) {
        toast.success(`Logging into ${matchedRole.role} Dashboard...`, { duration: 4000 });
        logout(); // Always clear previous session
        
        setTimeout(() => {
          login({
            token: 'voice-mock-jwt-token',
            id: '24BCF10024',
            name: matchedRole.name,
            email: 'test@example.com',
            role: matchedRole.role,
            phone: '9999999999'
          });
          localStorage.setItem('user_type', matchedRole.role);
          navigate(matchedRole.path);
        }, 500);
        return;
      }
    }

    if (text.includes('logout') || text.includes('log out') || text.includes('sign out')) {
      toast.success('Logging out...', { duration: 2000 });
      logout();
      navigate('/');
      return;
    }

    const routeIntents = [
      { keywords: ['emergency', 'sos', 'ambulance', 'help'], route: '/emergency', message: 'Triggering Emergency Protocols...' },
      { keywords: ['book', 'appointment', 'consultation'], route: '/book/HOS101?autoPilot=true', message: 'Navigating to hospitals for booking...' },
      { keywords: ['prescription', 'medicine', 'pharmacy', 'pill', 'dawai'], route: '/dashboard?tab=prescriptions', message: 'Opening your prescriptions...' },
      { keywords: ['leave', 'certificate', 'sick leave', 'chutti'], route: '/dashboard?tab=medical-leave', message: 'Opening medical leave portal...' },
      { keywords: ['symptom', 'checker', 'diagnosis', 'diagnose', 'bimari'], route: '/dashboard?tab=symptom-checker', message: 'Opening AI Symptom Checker...' },
      { keywords: ['dashboard', 'home', 'profile', 'main'], route: '/dashboard', message: 'Taking you to your dashboard...' },
      { keywords: ['vaccination', 'vaccine', 'immunization', 'tika'], route: '/dashboard?tab=vaccinations', message: 'Opening vaccination records...' },
      { keywords: ['wellness score', 'wellbeing'], route: '/dashboard?tab=wellness-score', message: 'Checking your wellness score...' },
      { keywords: ['map', 'nearby', 'location', 'find', 'rasta'], route: '/dashboard?tab=health-map', message: 'Opening the health map...' },
      { keywords: ['my bookings', 'my appointments', 'schedule', 'booking'], route: '/dashboard?tab=bookings', message: 'Opening your bookings...' },
      { keywords: ['care plan', 'care', 'plan'], route: '/dashboard?tab=care-plan', message: 'Opening your Personalized Care Plan...' },
      { keywords: ['complementary checkup', 'free checkup', 'body checkup', 'complementary', 'full body'], route: '/dashboard?tab=full-body-checkup', message: 'Opening Complementary Checkup...' },
      { keywords: ['reward', 'points', 'leaderboard', 'rank', 'coin'], route: '/dashboard?tab=rewards', message: 'Opening Rewards Leaderboard...' },
      { keywords: ['refer', 'referral', 'invite', 'dost'], route: '/dashboard?tab=refer-a-student', message: 'Opening Student Referral...' },
      { keywords: ['student health portal', 'health portal'], route: '/dashboard?tab=student-health-portal', message: 'Opening Student Health Portal...' },
      { keywords: ['wellness center', 'mental health', 'counselor', 'mood tracker', 'stress', 'depression'], route: '/dashboard?tab=wellness-center', message: 'Opening Wellness Center...' },
      { keywords: ['medicine trends', 'trend', 'trends'], route: '/dashboard?tab=medicine-trends', message: 'Opening Medicine Trends...' },
      { keywords: ['analytics', 'stats', 'statistics', 'graph'], route: '/dashboard?tab=analytics', message: 'Opening Health Analytics...' },
      { keywords: ['faculty portal', 'faculty', 'teacher', 'sir', 'maam'], route: '/dashboard?tab=faculty-portal', message: 'Opening Faculty Portal...' },
    ];

    let matchedIntent = null;
    for (const intent of routeIntents) {
      if (intent.keywords.some(keyword => text.includes(keyword))) {
        matchedIntent = intent;
        break;
      }
    }

    if (matchedIntent) {
      if (matchedIntent.route.includes('/book')) {
        convStateRef.current = 'ASKING_SYMPTOMS';
        speak("Sure, I can book an appointment. What is your main medical issue or symptom?");
        return;
      }
      
      toast.success(`Executing command: ${matchedIntent.message}`, { duration: 4000 });
      navigate(matchedIntent.route);
      return;
    }

    toast('Command not recognized. Please try again.', { icon: '🤔', duration: 3000 });
  };

  const toggleListen = () => {
    if (!recognitionRef.current) {
      toast.error('Voice commands are not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  return (
    <div className="voice-assistant-wrapper">
      <button 
        className={`fab-button voice-fab ${isListening ? 'listening' : ''}`}
        onClick={toggleListen}
        title="Voice Commands"
      >
        {isListening ? <FiMicOff /> : <FiMic />}
      </button>
      {isListening && <div className="voice-fab-pulse"></div>}
    </div>
  );
}

