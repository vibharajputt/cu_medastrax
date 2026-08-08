import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUserCheck, 
  FiClock, 
  FiMapPin, 
  FiStar, 
  FiX, 
  FiShield,
  FiSmile,
  FiActivity,
  FiCalendar,
  FiHeart,
  FiInfo
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MentalHealthWellnessTab({ 
  profileData, 
  user, 
  activeProfile, 
  fetchBookings, 
  navigate, 
  setSidebarTab, 
  activeTab: externalActiveTab, 
  setActiveTab: externalSetActiveTab 
}) {
  const [selectedPsychologist, setSelectedPsychologist] = useState(null);
  const [scheduledSuccess, setScheduledSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [internalActiveTab, setInternalActiveTab] = useState('counselors');
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = externalSetActiveTab || setInternalActiveTab;

  const userTypeRole = localStorage.getItem('user_type');
  const isFaculty = user?.role === 'FACULTY' || profileData?.role === 'FACULTY' || userTypeRole === 'FACULTY';

  const defaultName = activeProfile?.name || profileData?.name || user?.name || (isFaculty ? 'DR. ANITA SHARMA' : 'RASHIKA POONIA');
  const defaultId = isFaculty 
    ? (profileData?.collegeEid || profileData?.eid || user?.collegeEid || user?.eid || 'E-8041') 
    : (profileData?.collegeUid || profileData?.uid || '24BCF10024');
  const defaultPhone = profileData?.phone || user?.phone || '9876543210';
  const defaultEmail = user?.email || (isFaculty ? 'anita.e8041@cuchd.in' : 'rashika24bcf10024@cuchd.in');

  const [formData, setFormData] = useState({
    userType: isFaculty ? 'Faculty' : 'Student',
    name: defaultName,
    collegeId: defaultId,
    email: defaultEmail,
    phone: defaultPhone,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM - 10:45 AM',
    mode: 'In-Person (Block B2 Wellness Center)',
    concern: ''
  });

  const [moodLogs, setMoodLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('medastrax_mood_logs') || '[]');
    } catch {
      return [];
    }
  });
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNote, setMoodNote] = useState('');
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);
  const [aiMoodReply, setAiMoodReply] = useState('');

  const [stressStep, setStressStep] = useState(0); // 0 = Intro, 1-6 = Questions, 7 = Results
  const [stressAnswers, setStressAnswers] = useState({
    sleep: 3,
    workload: 3,
    relaxation: 3,
    physical: 3,
    energy: 3,
    emotional: 3
  });
  const [isAnalyzingStress, setIsAnalyzingStress] = useState(false);
  const [stressResult, setStressResult] = useState(null); // { score, category, advice }

  const [breathingPhase, setBreathingPhase] = useState('Idle'); // 'Idle', 'Breathe In', 'Hold', 'Breathe Out'
  const [breathingTimer, setBreathingTimer] = useState(4);

  const psychologists = [
    {
      id: 1,
      name: 'Dr. Neha Sharma',
      title: 'Senior Campus Clinical Psychologist',
      degree: 'Ph.D. in Clinical Psychology (NIMHANS)',
      specialization: 'Student Academic Stress, Exam Anxiety & Youth Wellness',
      experience: '8+ Years Experience',
      rating: '4.9 ★ (140+ Campus Sessions)',
      availability: 'Mon - Fri | 09:00 AM - 04:00 PM',
      location: 'Block B2, Campus Health Wing, Office 104',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400',
      bio: 'Specializes in cognitive behavioral therapy (CBT), examination stress management, peer pressure, and student mental wellness.'
    },
    {
      id: 2,
      name: 'Dr. Rajesh Varma',
      title: 'Faculty & Employee Mental Health Consultant',
      degree: 'M.Phil. in Counseling Psychology (PU)',
      specialization: 'Faculty Occupational Burnout, Work-Life Balance & PTSD',
      experience: '11+ Years Experience',
      rating: '4.8 ★ (210+ Campus Sessions)',
      availability: 'Mon - Sat | 10:00 AM - 05:00 PM',
      location: 'Block B2, Campus Health Wing, Office 106',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      bio: 'Dedicated counselor for faculty members and university staff facing high workload stress, research anxiety, and family wellbeing.'
    },
    {
      id: 3,
      name: 'Dr. Ananya Kapoor',
      title: 'Youth & Behavioral Psychologist',
      degree: 'Ph.D. in Behavioral Psychology (AIIMS Delhi)',
      specialization: 'Mindfulness, Emotional Regulation & Relationship Counseling',
      experience: '6+ Years Experience',
      rating: '4.9 ★ (115+ Campus Sessions)',
      availability: 'Tue - Sat | 09:30 AM - 04:30 PM',
      location: 'Block B2, Campus Health Wing, Office 108',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
      bio: 'Expert in adolescent mental health, group therapy sessions, guided meditation, and confidence building for campus community.'
    }
  ];

  const moodOptions = [
    { emoji: '🤩', name: 'Excited', color: '#1d467c', bg: '#fef3c7' },
    { emoji: '😊', name: 'Happy', color: '#00b4b6', bg: '#ecfdf5' },
    { emoji: '😐', name: 'Neutral', color: '#042a59', bg: '#e0e7ff' },
    { emoji: '😞', name: 'Stressed', color: '#f97316', bg: '#ffedd5' },
    { emoji: '😢', name: 'Sad', color: '#ef4444', bg: '#fee2e2' }
  ];

  const stressQuestions = [
    {
      key: 'sleep',
      text: 'Sleep Quality: How rested do you feel upon waking up?',
      options: [
        { val: 1, text: '🟢 Exceptionally refreshed, high energy' },
        { val: 2, text: '🟢 Moderately rested, normal wakefulness' },
        { val: 3, text: '🟡 Slightly tired, took time to get going' },
        { val: 4, text: '🟠 Sleepy, fatigued throughout the morning' },
        { val: 5, text: '🔴 Exhausted, slept poorly or suffered insomnia' }
      ]
    },
    {
      key: 'workload',
      text: 'Workload & Deadlines: Do academic tasks, research work, or exams feel overwhelming?',
      options: [
        { val: 1, text: '🟢 Fully under control, highly manageable' },
        { val: 2, text: '🟢 Busy but fully structured and confident' },
        { val: 3, text: '🟡 Moderately pressured, feeling occasional rush' },
        { val: 4, text: '🟠 Very high load, struggling to keep up' },
        { val: 5, text: '🔴 Completely overloaded, near burnout' }
      ]
    },
    {
      key: 'relaxation',
      text: 'Detachment & Relaxation: Are you able to unwind and enjoy leisure time daily?',
      options: [
        { val: 1, text: '🟢 Easily disconnect and relax completely' },
        { val: 2, text: '🟢 Can unwind most of the time without guilt' },
        { val: 3, text: '🟡 Relax occasionally, but duties still occupy my mind' },
        { val: 4, text: '🟠 Difficult to detach, constant worry about tasks' },
        { val: 5, text: '🔴 Unable to relax at all, constantly tense' }
      ]
    },
    {
      key: 'physical',
      text: 'Physical Stress Symptoms: Have you noticed tension, headaches, or restless energy?',
      options: [
        { val: 1, text: '🟢 No symptoms, feeling light and flexible' },
        { val: 2, text: '🟢 Rare light fatigue, resolves quickly' },
        { val: 3, text: '🟡 Occasional tension or minor headache under pressure' },
        { val: 4, text: '🟠 Frequent stiffness, muscle tension, or stomach issues' },
        { val: 5, text: '🔴 Constant aches, tension headaches, or heart palpitations' }
      ]
    },
    {
      key: 'energy',
      text: 'Concentration & Focus: How easily can you concentrate on campus or work duties?',
      options: [
        { val: 1, text: '🟢 Exceptionally clear focus, highly productive' },
        { val: 2, text: '🟢 Good concentration, occasional brief distraction' },
        { val: 3, text: '🟡 Average focus, takes effort to stay on task' },
        { val: 4, text: '🟠 Easily distracted, mind constantly wanders' },
        { val: 5, text: '🔴 Severe brain fog, cannot focus on anything' }
      ]
    },
    {
      key: 'emotional',
      text: 'Emotional Equilibrium: Have you felt unusually irritable, anxious, or down?',
      options: [
        { val: 1, text: '🟢 Extremely calm, stable, and content' },
        { val: 2, text: '🟢 Balanced, small irritants don\'t bother me' },
        { val: 3, text: '🟡 Slightly sensitive, occasional mood fluctuations' },
        { val: 4, text: '🟠 Frequently anxious, irritable, or snappy' },
        { val: 5, text: '🔴 Overwhelmed, intense mood swings or panic feelings' }
      ]
    }
  ];

  const handleOpenConnectModal = (psych) => {
    setSelectedPsychologist(psych);
    setFormData({
      userType: isFaculty ? 'Faculty' : 'Student',
      name: defaultName,
      collegeId: defaultId,
      email: defaultEmail,
      phone: defaultPhone,
      date: new Date().toISOString().split('T')[0],
      timeSlot: '10:00 AM - 10:45 AM',
      mode: 'In-Person (Block B2 Wellness Center)',
      concern: ''
    });
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.collegeId || !formData.date || !formData.timeSlot) {
      toast.error('Please fill in all required appointment details.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const refNo = 'CU-PSYCH-' + Math.floor(100000 + Math.random() * 900000);
      const apptDetails = {
        refNo,
        psychologist: selectedPsychologist.name,
        psychologistTitle: selectedPsychologist.title,
        userType: formData.userType,
        name: formData.name,
        collegeId: formData.collegeId,
        date: formData.date,
        timeSlot: formData.timeSlot,
        mode: formData.mode,
        location: selectedPsychologist.location
      };

      try {
        const consultationType = formData.mode.toLowerCase().includes('in-person') ? 'IN_PERSON' : 'ONLINE';
        const storedBookings = JSON.parse(localStorage.getItem('medastrax_custom_bookings') || '[]');
        storedBookings.unshift({
          id: Date.now(),
          doctorId: selectedPsychologist.id,
          doctorName: selectedPsychologist.name,
          doctorSpecialty: `Psychologist (${selectedPsychologist.title})`,
          hospitalName: 'CU Mental Health & Wellness Center',
          bookingDate: formData.date,
          timeSlot: formData.timeSlot,
          status: 'CONFIRMED',
          type: consultationType,
          paymentMethod: 'CASH',
          paymentStatus: 'PAID',
          reason: `Psychologist Consultation - ${formData.userType} (${formData.mode})`,
          symptoms: formData.concern || '',
          patientName: formData.name,
          age: profileData?.age || user?.age || '',
          gender: profileData?.gender || user?.gender || ''
        });
        localStorage.setItem('medastrax_custom_bookings', JSON.stringify(storedBookings));
      } catch (err) {
        console.error(err);
      }

      setSubmitting(false);
      setScheduledSuccess(apptDetails);
      setSelectedPsychologist(null);
      if (fetchBookings) fetchBookings();
      toast.success(`Appointment Scheduled with ${selectedPsychologist.name}! 🧠💚`);
    }, 1000);
  };

  const handleAnalyzeMood = () => {
    if (!selectedMood) {
      toast.error('Please select a mood emoji first!');
      return;
    }
    setIsAnalyzingMood(true);
    setTimeout(() => {
      let reply = '';
      const moodText = selectedMood.name;

      if (moodText === 'Excited' || moodText === 'Happy') {
        reply = `### 🌟 Astra AI Insights: Celebrating Your High Vibes!

It's fantastic that you are feeling **${moodText}** today! Based on your journal entry:
> "${moodNote || 'Keeping it positive!'}"

**Astra's Cognitive Reflection:**
- Your current energy shows high mental resilience and confidence. Joy is contagious, and sharing this positive state with peers or colleagues can boost the overall campus climate.
- **Faculty / Student Wellness Tip:** Capitalize on this productive window to tackle complex academic or administrative projects.
- **Wellness Prescription:** Practice gratitude. Take 2 minutes to write down three things that contributed to this good mood, reinforcing these positive neural pathways.`;
      } else if (moodText === 'Neutral') {
        reply = `### 😐 Astra AI Insights: Finding Your Balance

A **Neutral** mood is a wonderful baseline of emotional stability. Based on your journal entry:
> "${moodNote || 'Just a normal campus day.'}"

**Astra's Cognitive Reflection:**
- Neutrality is a sign that your body and mind are resting between states. It’s an ideal opportunity for mindful observation.
- **Wellness Directive:** Since you are in a steady state, perform a brief 5-minute digital detox. Put away screens and look outside to let your eyes rest.
- **Activity Challenge:** Take a light walk near Chandigarh University's academic green lawns to recharge your physical batteries.`;
      } else if (moodText === 'Stressed') {
        reply = `### 😞 Astra AI Insights: Decompressing the Pressure

Feeling **Stressed/Anxious** is a very common response to academic timelines or workplace responsibilities. Based on your entry:
> "${moodNote || 'Feeling the pressure.'}"

**Astra's Cognitive Reflection:**
- Chronic stress triggers cortisol, causing mental exhaustion. Remember that you do not have to carry everything at once.
- **Astra's Wellness Plan:**
  1. **Triage:** List your top three priorities for today. Postpone or delegate the rest.
  2. **Micro-intervention:** Use the 4-7-8 breathing exercise in our **AI Stress Assessment** tab.
  3. **Support System:** If this stress persists, consider scheduling a session with **${psychologists[isFaculty ? 1 : 0].name}** right here in the portal.`;
      } else {
        reply = `### 😢 Astra AI Insights: Empathetic Support for Difficult Moments

I am really sorry to hear that you are feeling **Down/Sad** today. Your feelings are valid, and it is completely okay to not be okay. Based on your entry:
> "${moodNote || 'Going through a tough time.'}"

**Astra's Cognitive Reflection:**
- Emotional dips happen to everyone. Be extremely kind and gentle with yourself today.
- **Self-Care Directives:**
  - Avoid pushing yourself to be ultra-productive. Prioritize basic needs: warm meals, hydration, and restful sleep.
  - Reach out to a close colleague, friend, or family member to express how you feel.
  - **Confidential Campus Resource:** We highly recommend a confidential, friendly 1-on-1 session with **${psychologists[isFaculty ? 2 : 0].name}** (Block B2 Wellness Center) to talk things through.`;
      }

      setAiMoodReply(reply);

      const newLog = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        mood: selectedMood.emoji,
        moodName: selectedMood.name,
        note: moodNote,
        aiResponse: reply
      };
      const updatedLogs = [newLog, ...moodLogs].slice(0, 10);
      setMoodLogs(updatedLogs);
      localStorage.setItem('medastrax_mood_logs', JSON.stringify(updatedLogs));

      setIsAnalyzingMood(false);
      toast.success('Mood logged & analyzed by Astra AI! 🧠💚');
    }, 1500);
  };

  const handleCalculateStress = () => {
    setIsAnalyzingStress(true);
    setTimeout(() => {
      const score = stressAnswers.sleep + stressAnswers.workload + stressAnswers.relaxation + stressAnswers.physical + stressAnswers.energy + stressAnswers.emotional;
      let category = 'Low Stress';
      let advice = '';

      if (score <= 12) {
        category = 'Low Stress (Healthy Balance) 🟢';
        advice = `### 🌟 Your Stress Management Plan: Maintain and Flourish
Your stress level is currently well-managed. Your lifestyle, coping mechanisms, and physical habits are keeping you in an optimal zone.

#### **Astra AI Wellness Tips:**
- **Keep it up:** Continue your current routine of regular sleep, movement, and setting healthy boundaries.
- **Proactive resilience:** Engage in mindfulness practice for 5 minutes daily to buffer against future high-pressure periods.
- **Healthy habits:** Share your positive routines with colleagues or classmates.`;
      } else if (score <= 20) {
        category = 'Moderate Stress (Coping Zone) 🟡';
        advice = `### ⚖️ Your Stress Management Plan: Refocus and Restore
You are experiencing moderate stress. While you are handling it, your body and mind are sending signs of exhaustion. It is time to recalibrate before it leads to burnout.

#### **Astra AI Directives:**
1. **Optimize Sleep:** Ensure you get 7-8 hours of sleep. Try to disconnect from all digital screens 45 minutes before bedtime.
2. **Learn to Say No:** Delegate minor tasks and break down large tasks into smaller milestones.
3. **Structured Breaks:** Take 10-minute breaks every 90 minutes of studying/working to stand up, stretch, and hydrate.
4. **Interactive Therapy:** Practice our **4-7-8 Breathing Guide** below to instantly lower your heart rate.`;
      } else {
        category = 'High Stress (Decompression Required) 🔴';
        advice = `### 🚨 Your Stress Management Plan: Immediate Decompression
Your stress index is elevated. You are carrying a heavy cognitive and emotional load that may affect your health, sleep, and performance. 

#### **Astra AI Priority Actions:**
1. **Immediate Boundaries:** Take a wellness half-day or day off if possible. Inform your professors/supervisors of your situation.
2. **Physical Reset:** Spend 20 minutes outdoors. Exercise gently (like walking or yoga) to burn off excess stress hormones.
3. **Emotional Release:** Talk to a trusted counselor. 
4. **Confidential Consultation:** We strongly recommend scheduling a private consultation with our campus psychologists: **${psychologists[isFaculty ? 1 : 2].name}** in Office ${psychologists[isFaculty ? 1 : 2].location.split('Office ')[1] || 'B2'}. You can book directly in the next tab.`;
      }

      setStressResult({ score, category, advice });
      setIsAnalyzingStress(false);
      setStressStep(7);
      toast.success('Stress Assessment analyzed by Astra AI! 📊');
    }, 1500);
  };

  const startBreathingExercise = () => {
    setBreathingPhase('Breathe In');
    setBreathingTimer(4);
  };

  useEffect(() => {
    if (breathingPhase === 'Idle') return;
    const interval = setInterval(() => {
      setBreathingTimer(prev => {
        if (prev <= 1) {
          if (breathingPhase === 'Breathe In') {
            setBreathingPhase('Hold');
            return 7;
          } else if (breathingPhase === 'Hold') {
            setBreathingPhase('Breathe Out');
            return 8;
          } else if (breathingPhase === 'Breathe Out') {
            setBreathingPhase('Breathe In');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [breathingPhase]);

  const parseMarkdownResponse = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, index) => {
      let content = line;
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={index} style={{ marginLeft: '16px', marginBottom: '4px' }} 
              dangerouslySetInnerHTML={{ __html: itemText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
        );
      }
      if (line.trim().startsWith('####')) {
        return <h5 key={index} style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a5f', marginTop: '12px', marginBottom: '4px' }}>{line.replace('####', '').trim()}</h5>;
      }
      if (line.trim().startsWith('###')) {
        return <h4 key={index} style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f766e', marginTop: '14px', marginBottom: '6px' }}>{line.replace('###', '').trim()}</h4>;
      }
      if (line.trim().startsWith('>')) {
        return <blockquote key={index} style={{ borderLeft: '4px solid #0f766e', paddingLeft: '12px', color: '#475569', fontStyle: 'italic', margin: '8px 0' }}>{line.replace('>', '').trim()}</blockquote>;
      }
      if (line.trim() === '') {
        return <div key={index} style={{ height: '6px' }} />;
      }
      return <p key={index} style={{ margin: '0 0 6px 0', fontSize: '0.88rem', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  return (
    <div className="wellness-center-container" style={{ fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Top Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #1e3a5f 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        color: '#ffffff',
        marginBottom: '28px',
        boxShadow: '0 10px 25px rgba(15, 118, 110, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              🧠 CHANDIGARH UNIVERSITY WELLNESS CARE
            </span>
            <span style={{ background: 'rgba(0, 180, 182, 0.25)', color: '#6ee7b7', border: '1px solid rgba(110, 231, 183, 0.3)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
              100% Confidential
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Mental Health & Wellness Center
          </h2>
          <p style={{ margin: 0, fontSize: '0.92rem', opacity: 0.9, maxWidth: '700px', lineHeight: 1.5 }}>
            Comprehensive psychological support, academic & occupational stress relief, and 1-on-1 counselor sessions for all Chandigarh University {isFaculty ? 'Faculty & Staff Members' : 'Students & Faculty'}.
          </p>
        </div>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-30px', fontSize: '11rem', opacity: 0.06, pointerEvents: 'none', select: 'none' }}>
          🧠
        </div>
      </div>



      {scheduledSuccess ? (
        /* Confirmation Screen */
        <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '16px', padding: '32px', textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px auto' }}>
            ✓
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#14532d', marginBottom: '6px' }}>
            Appointment Successfully Scheduled! 🎉
          </h3>
          <p style={{ color: '#166534', fontSize: '0.9rem', marginBottom: '20px' }}>
            Your mental health consultation with <strong>{scheduledSuccess.psychologist}</strong> is confirmed.
          </p>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '20px', textAlign: 'left', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Reference ID:</span>
              <strong style={{ color: '#0f766e' }}>{scheduledSuccess.refNo}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Applicant ({scheduledSuccess.userType}):</span>
              <strong>{scheduledSuccess.name} ({scheduledSuccess.collegeId})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Psychologist:</span>
              <strong>{scheduledSuccess.psychologist} ({scheduledSuccess.psychologistTitle})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Scheduled Date & Time:</span>
              <strong style={{ color: '#ea580c' }}>{scheduledSuccess.date} at {scheduledSuccess.timeSlot}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Venue / Mode:</span>
              <strong>{scheduledSuccess.mode}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => setScheduledSuccess(null)}
              style={{ background: '#0f766e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
            >
              Book Another Session
            </button>
            <button
              type="button"
              onClick={() => { if (setSidebarTab) setSidebarTab('bookings'); else navigate('/my-bookings'); }}
              style={{ background: '#ffffff', color: '#0f766e', border: '1.5px solid #0f766e', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
            >
              View in My Bookings →
            </button>
          </div>
        </div>
      ) : activeTab === 'mood-tracker' ? (
        /* AI Mood Tracker Tab Content */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.8fr) 1.2fr', gap: '28px', alignItems: 'start' }}>
          
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🧠</span> How are you feeling right now?
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.86rem', marginBottom: '20px' }}>
              Select a primary mood emoji and share context so Astra AI can analyze your current state and offer cognitive support.
            </p>

            {/* Emojis selector */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {moodOptions.map(option => (
                <button
                  key={option.name}
                  onClick={() => setSelectedMood(option)}
                  style={{
                    flex: '1 1 0px',
                    minWidth: '70px',
                    padding: '12px 8px',
                    borderRadius: '12px',
                    border: selectedMood?.name === option.name ? `2px solid ${option.color}` : '1.5px solid #e2e8f0',
                    background: selectedMood?.name === option.name ? option.bg : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    boxShadow: selectedMood?.name === option.name ? `0 4px 12px rgba(0,0,0,0.05)` : 'none'
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>{option.emoji}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>{option.name}</span>
                </button>
              ))}
            </div>

            {/* Diary Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                Journal Entry (Describe your thoughts or day in a few sentences)
              </label>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Write whatever is on your mind. Everything stays private on your local browser session..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  padding: '12px',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAnalyzeMood}
              disabled={isAnalyzingMood}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0f766e, #1e3a5f)',
                color: '#ffffff',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)',
                transition: 'transform 0.2s'
              }}
            >
              {isAnalyzingMood ? 'Analyzing with Astra AI...' : 'Analyze Mood with AI ⚡'}
            </button>

            {/* AI Response Display */}
            {aiMoodReply && (
              <div style={{
                marginTop: '28px',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f766e', fontWeight: 800, fontSize: '0.9rem', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <FiHeart /> <span>ASTRA AI EMOTIONAL INSIGHT</span>
                </div>
                <div>
                  {parseMarkdownResponse(aiMoodReply)}
                </div>
              </div>
            )}

          </div>

          {/* Mood History Log */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCalendar color="#0f766e" /> Recent Mood History
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '20px' }}>
              Your last 10 logged mood logs to review trends.
            </p>

            {moodLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>📊</span>
                No logs recorded yet. Complete your first assessment to begin tracking.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {moodLogs.map(log => (
                  <div
                    key={log.id}
                    style={{
                      borderLeft: '4px solid #0f766e',
                      background: '#f8fafc',
                      borderRadius: '0 10px 10px 0',
                      padding: '12px 14px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                        {log.mood} {log.moodName}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
                        {log.date}
                      </span>
                    </div>
                    {log.note && (
                      <p style={{ margin: '0 0 6px 0', fontStyle: 'italic', color: '#475569', fontSize: '0.82rem' }}>
                        "{log.note}"
                      </p>
                    )}
                    <button
                      onClick={() => {
                        setAiMoodReply(log.aiResponse);
                        setSelectedMood(moodOptions.find(o => o.name === log.moodName) || null);
                        setMoodNote(log.note || '');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0f766e',
                        padding: 0,
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      View AI Advice
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : activeTab === 'stress-assessment' ? (
        /* AI Stress Assessment Tab Content */
        <div style={{ maxWidth: '750px', margin: '0 auto', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          
          {stressStep === 0 ? (
            /* Intro Screen */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '14px' }}>📊</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
                AI Stress Level Triage & Management
              </h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 28px auto' }}>
                This is a clinical-grade stress assessment based on 6 core wellness indicators. It takes less than 2 minutes. Astra AI will calculate your stress score, deliver an customized decompression plan, and activate clinical breathing modules.
              </p>
              <button
                onClick={() => setStressStep(1)}
                style={{
                  background: 'linear-gradient(135deg, #0f766e, #1e3a5f)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
                }}
              >
                Start Assessment →
              </button>
            </div>
          ) : stressStep >= 1 && stressStep <= 6 ? (
            /* Active Questionnaire Steps */
            <div>
              {/* Question Progress bar */}
              <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '10px', marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ width: `${(stressStep / 6) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #0f766e, #00b4b6)', borderRadius: '10px', transition: 'width 0.3s ease' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.78rem', fontWeight: 700, marginBottom: '8px' }}>
                <span>WELLNESS METRICS DIAGNOSTIC</span>
                <span>Question {stressStep} of 6</span>
              </div>

              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '20px', lineHeight: 1.4 }}>
                {stressQuestions[stressStep - 1].text}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {stressQuestions[stressStep - 1].options.map(option => {
                  const key = stressQuestions[stressStep - 1].key;
                  const isSelected = stressAnswers[key] === option.val;

                  return (
                    <button
                      key={option.val}
                      onClick={() => setStressAnswers(prev => ({ ...prev, [key]: option.val }))}
                      style={{
                        textAlign: 'left',
                        padding: '14px 18px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #0f766e' : '1px solid #cbd5e1',
                        background: isSelected ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#166534' : '#1e293b',
                        transition: 'all 0.15s'
                      }}
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px' }}>
                <button
                  onClick={() => setStressStep(prev => prev - 1)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (stressStep === 6) {
                      handleCalculateStress();
                    } else {
                      setStressStep(prev => prev + 1);
                    }
                  }}
                  style={{
                    flex: 2,
                    padding: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0f766e, #1e3a5f)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {stressStep === 6 ? 'Submit & Calculate' : 'Next Question'}
                </button>
              </div>
            </div>
          ) : (
            /* Results Step */
            <div>
              {isAnalyzingStress ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '2.5rem', animation: 'spin 1s linear infinite' }}>⚙️</div>
                  <h4 style={{ fontWeight: 800, color: '#1e293b', marginTop: '16px' }}>Evaluating Stress Profile...</h4>
                </div>
              ) : (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '28px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                    <span style={{ fontSize: '0.8rem', background: '#f8fafc', padding: '6px 14px', borderRadius: '20px', color: '#64748b', fontWeight: 700 }}>
                      ASTRA STRESS REPORT SUMMARY
                    </span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginTop: '10px', marginBottom: '6px' }}>
                      Diagnostic Category: {stressResult?.category}
                    </h3>
                    <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
                      Total Stress Index: <strong>{stressResult?.score} / 30</strong> (Lower is better)
                    </p>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', marginBottom: '28px' }}>
                    {parseMarkdownResponse(stressResult?.advice)}
                  </div>

                  {/* Breathing Exercise Portal */}
                  <div style={{
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '16px',
                    padding: '24px',
                    background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)',
                    textAlign: 'center',
                    marginBottom: '28px'
                  }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f766e', margin: '0 0 4px 0' }}>
                      🧘 Interactive Decompression: 4-7-8 Breathing Guide
                    </h4>
                    <p style={{ color: '#166534', fontSize: '0.8rem', marginBottom: '20px' }}>
                      Reduce anxiety instantly by following the visual pacing guide below.
                    </p>

                    {breathingPhase === 'Idle' ? (
                      <button
                        onClick={startBreathingExercise}
                        style={{
                          background: '#0f766e',
                          color: '#ffffff',
                          border: 'none',
                          padding: '10px 24px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Start Breathing Visualizer
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        {/* Breathing Ball Animation */}
                        <div style={{
                          width: breathingPhase === 'Breathe In' ? '140px' : breathingPhase === 'Hold' ? '140px' : '90px',
                          height: breathingPhase === 'Breathe In' ? '140px' : breathingPhase === 'Hold' ? '140px' : '90px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, #0f766e, #00b4b6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '1.25rem',
                          transition: 'all 4s ease-in-out',
                          boxShadow: '0 8px 24px rgba(15, 118, 110, 0.25)',
                          flexDirection: 'column'
                        }}>
                          <span style={{ fontSize: '0.9rem', opacity: 0.85 }}>{breathingPhase}</span>
                          <span style={{ fontSize: '1.6rem' }}>{breathingTimer}s</span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => setBreathingPhase('Idle')}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Stop
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                    <button
                      onClick={() => { setStressStep(0); setStressResult(null); }}
                      style={{
                        background: '#ffffff',
                        color: '#475569',
                        border: '1.5px solid #cbd5e1',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Retake Test
                    </button>
                    <button
                      onClick={() => { setActiveTab('counselors'); }}
                      style={{
                        background: '#0f766e',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Connect with Counselors →
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* Counselors Tab Content (Original default layout) */
        <>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
              Available Campus Psychologists
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
              Select a licensed campus psychologist below and click <strong>Connect</strong> to schedule a private, free consultation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {psychologists.map((psych) => (
              <div 
                key={psych.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Doctor Avatar & Header Info */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                    <img 
                      src={psych.image} 
                      alt={psych.name} 
                      style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #0f766e' }}
                    />
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: '0 0 2px 0' }}>
                        {psych.name}
                      </h4>
                      <div style={{ color: '#0f766e', fontWeight: 700, fontSize: '0.82rem', marginBottom: '2px' }}>
                        {psych.title}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.76rem' }}>
                        {psych.degree}
                      </div>
                    </div>
                  </div>

                  {/* Specialization Badge */}
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', fontSize: '0.78rem', color: '#166534', fontWeight: 600, marginBottom: '14px' }}>
                    🎯 <strong>Specialization:</strong> {psych.specialization}
                  </div>

                  {/* Bio */}
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                    {psych.bio}
                  </p>

                  {/* Meta Details List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: '#64748b', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiStar color="#1d467c" fill="#1d467c" />
                      <span><strong>Rating:</strong> {psych.rating}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiShield color="#0f766e" />
                      <span><strong>Experience:</strong> {psych.experience}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiClock color="#ea580c" />
                      <span><strong>Availability:</strong> {psych.availability}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiMapPin color="#e11d48" />
                      <span><strong>Location:</strong> {psych.location}</span>
                    </div>
                  </div>
                </div>

                {/* CONNECT BUTTON */}
                <button
                  type="button"
                  onClick={() => handleOpenConnectModal(psych)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0f766e, #1e3a5f)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <FiUserCheck size={18} />
                  <span>Connect with {psych.name.split(' ')[1]}</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CONNECT APPOINTMENT FORM MODAL */}
      <AnimatePresence>
        {selectedPsychologist && (
          <div 
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)',
              zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
            }}
            onClick={() => setSelectedPsychologist(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '28px',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: '1px solid #e2e8f0'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedPsychologist(null)}
                style={{ position: 'absolute', top: '18px', right: '18px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
              >
                <FiX size={18} />
              </button>

              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                <span style={{ background: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                  CONFIDENTIAL CONSULTATION BOOKING
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: '8px 0 2px 0' }}>
                  Connect with {selectedPsychologist.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                  {selectedPsychologist.title} • {selectedPsychologist.degree}
                </p>
              </div>

              <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* User Role Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Applicant Category *
                  </label>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #0f766e',
                    background: 'rgba(15, 118, 110, 0.08)',
                    color: '#0f766e',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {isFaculty ? '👨‍🏫 Faculty / Staff Portal' : '🎓 Student Portal'}
                  </div>
                </div>

                {/* Name & College ID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      {isFaculty ? 'Faculty EID *' : 'Student UID *'}
                    </label>
                    <input 
                      type="text" 
                      value={formData.collegeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, collegeId: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Phone / Mobile No. *
                    </label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                </div>

                {/* Preferred Date & Time Slot */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Preferred Date *
                    </label>
                    <input 
                      type="date" 
                      value={formData.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Time Slot *
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeSlot: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem' }}
                    >
                      <option value="10:00 AM - 10:45 AM">10:00 AM - 10:45 AM</option>
                      <option value="11:30 AM - 12:15 PM">11:30 AM - 12:15 PM</option>
                      <option value="02:00 PM - 02:45 PM">02:00 PM - 02:45 PM</option>
                      <option value="03:30 PM - 04:15 PM">03:30 PM - 04:15 PM</option>
                    </select>
                  </div>
                </div>

                {/* Session Mode */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Consultation Mode *
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData(prev => ({ ...prev, mode: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="In-Person (Block B2 Wellness Center)">In-Person Session (Campus Health Center, Block B2)</option>
                    <option value="Online Video Call (Confidential)">Online Video Call (Secure & Encrypted Link)</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Brief Reason for Consultation (Optional & Strictly Confidential)
                  </label>
                  <textarea 
                    rows="3"
                    placeholder="e.g. Exam anxiety, work burnout, stress management tips..."
                    value={formData.concern}
                    onChange={(e) => setFormData(prev => ({ ...prev, concern: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => setSelectedPsychologist(null)}
                    style={{ flex: 1, padding: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    style={{ flex: 2, padding: '12px', border: 'none', background: '#0f766e', color: '#ffffff', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {submitting ? 'Scheduling Appointment...' : 'Submit & Schedule Appointment'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

