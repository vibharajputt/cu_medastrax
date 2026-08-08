
const MOCK_STORAGE_KEY = 'MedAstraX_mock_db';

const defaultDb = {
  users: [
    {
      id: 'student-10024',
      name: 'Rashika',
      email: '24bcf10024@cuchd.in',
      password: 'Rashika123',
      role: 'PATIENT',
      phone: '7988766566',
      avatarUrl: '/src/assets/rashika-avatar.jpg',
      dob: '2006-09-21',
      age: 19,
      gender: 'Female',
      bloodGroup: 'A-',
      emergencyNumber: '7988766566',
      preferredLanguage: 'Hindi',
      existingMedicalCondition: 'None',
      allergies: 'None',
      currentMedication: 'None',
      collegeUid: '24BCF10024',
      isHosteller: true,
      isFaculty: false,
      hostelName: 'Sukhna Girls Hostel',
      roomNumber: '503',
      expPoints: 900,
      healthBadge: 'Gold Health Champion',
      referralCode: 'REF-24BCF10024',
      medsChecked: false,
      dietChecked: false,
      exerciseChecked: false,
      lastAnalysis: 'Good health parameters.'
    },
    {
      id: 'student-10002',
      name: 'Tanveer',
      email: '24BCF10002@cuchd.in',
      password: 'Tanveer123',
      role: 'PATIENT',
      phone: '9041990211',
      avatarUrl: '',
      dob: '2007-01-13',
      age: 19,
      gender: 'Female',
      bloodGroup: 'A-',
      emergencyNumber: '9041990211',
      preferredLanguage: 'Hindi',
      existingMedicalCondition: 'None',
      allergies: 'None',
      currentMedication: 'None',
      collegeUid: '24BCF10002',
      isHosteller: false,
      isFaculty: false,
      hostelName: 'Day Scholar',
      roomNumber: 'N/A',
      expPoints: 850,
      healthBadge: 'Silver Health Champion',
      referralCode: 'REF-24BCF10002',
      medsChecked: false,
      dietChecked: false,
      exerciseChecked: false,
      lastAnalysis: 'All vitals normal.'
    },
    {
      id: 'student-10088',
      name: 'Aarav Sharma',
      email: '24bcf10088@cuchd.in',
      password: 'Aarav123',
      role: 'PATIENT',
      phone: '9876543210',
      avatarUrl: '',
      dob: '2006-03-15',
      age: 19,
      gender: 'Male',
      bloodGroup: 'O+',
      emergencyNumber: '9876543210',
      preferredLanguage: 'Hindi',
      existingMedicalCondition: 'None',
      allergies: 'None',
      currentMedication: 'None',
      collegeUid: '24BCF10088',
      isHosteller: true,
      isFaculty: false,
      hostelName: 'Nek Chand Hostel',
      roomNumber: '204',
      expPoints: 950,
      healthBadge: 'Gold Health Champion',
      referralCode: 'REF-24BCF10088',
      medsChecked: false,
      dietChecked: false,
      exerciseChecked: false,
      lastAnalysis: 'Excellent fitness score.'
    },
    {
      id: 'student-10099',
      name: 'Priya Verma',
      email: '24bcf10099@cuchd.in',
      password: 'Priya123',
      role: 'PATIENT',
      phone: '9812345678',
      avatarUrl: '',
      dob: '2006-11-04',
      age: 19,
      gender: 'Female',
      bloodGroup: 'B+',
      emergencyNumber: '9812345678',
      preferredLanguage: 'English',
      existingMedicalCondition: 'None',
      allergies: 'None',
      currentMedication: 'None',
      collegeUid: '24BCF10099',
      isHosteller: true,
      isFaculty: false,
      hostelName: 'Rock Garden Hostel',
      roomNumber: '112',
      expPoints: 780,
      healthBadge: 'Bronze Health Champion',
      referralCode: 'REF-24BCF10099',
      medsChecked: false,
      dietChecked: false,
      exerciseChecked: false,
      lastAnalysis: 'Normal parameters.'
    },
    {
      id: 'student-10105',
      name: 'Rohan Gupta',
      email: '24bcf10105@cuchd.in',
      password: 'Rohan123',
      role: 'PATIENT',
      phone: '9765432109',
      avatarUrl: '',
      dob: '2006-07-28',
      age: 19,
      gender: 'Male',
      bloodGroup: 'AB+',
      emergencyNumber: '9765432109',
      preferredLanguage: 'Hindi',
      existingMedicalCondition: 'None',
      allergies: 'None',
      currentMedication: 'None',
      collegeUid: '24BCF10105',
      isHosteller: false,
      isFaculty: false,
      hostelName: 'Day Scholar',
      roomNumber: 'N/A',
      expPoints: 820,
      healthBadge: 'Silver Health Champion',
      referralCode: 'REF-24BCF10105',
      medsChecked: false,
      dietChecked: false,
      exerciseChecked: false,
      lastAnalysis: 'Good wellness score.'
    },
    {
      id: 'student-10013',
      name: 'Naina Kumari',
      email: 'naina24bcf10013@cuchd.in',
      password: 'password123',
      role: 'PATIENT',
      phone: '9876543210',
      avatarUrl: '',
      dob: '2006-09-21',
      age: 19,
      gender: 'Female',
      bloodGroup: 'B+',
      emergencyNumber: '9988776655',
      preferredLanguage: 'Hindi',
      existingMedicalCondition: 'None',
      allergies: 'None',
      currentMedication: 'None',
      collegeUid: '24BCF10013',
      isHosteller: true,
      isFaculty: false,
      hostelName: 'PG-3',
      roomNumber: '301',
      expPoints: 950,
      healthBadge: 'Gold Health Champion',
      medsChecked: false,
      dietChecked: false,
      exerciseChecked: false,
      lastAnalysis: 'Good health parameters.'
    },
    {
      id: 'patient-123',
      name: 'Jane Doe',
      email: 'patient@demo.com',
      password: 'password123',
      role: 'PATIENT',
      phone: '9876543210',
      avatarUrl: '',
      dob: '2002-05-15',
      age: 24,
      gender: 'Female',
      bloodGroup: 'A+',
      emergencyNumber: '9988776655',
      preferredLanguage: 'English',
      existingMedicalCondition: 'Mild Asthma',
      allergies: 'Peanuts, Dust',
      currentMedication: 'Inhaler as needed',
      expPoints: 850,
      healthBadge: 'Silver Health Champion',
      createdAt: '2026-07-24T12:00:00+05:30',
      medsChecked: false,
      dietChecked: false,
      exerciseChecked: false,
      lastAnalysis: 'Overall wellness is stable. Keep active.'
    },
    {
      id: 'doctor-123',
      name: 'Dr. Aditya Sharma',
      email: 'doctor@demo.com',
      password: 'password123',
      role: 'DOCTOR',
      phone: '9876543211',
      avatarUrl: '',
      specialization: 'General Physician',
      licenseNo: 'MC12345',
      workingHours: '09:00 - 18:00',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    {
      id: 'faculty-001',
      name: 'Dr. Anita Sharma',
      email: 'anita.e8041@cuchd.in',
      password: 'Faculty@123',
      role: 'PATIENT',
      phone: '9988001122',
      avatarUrl: '',
      dob: '1982-04-15',
      age: 42,
      gender: 'Female',
      bloodGroup: 'B+',
      emergencyNumber: '9988001122',
      preferredLanguage: 'English',
      existingMedicalCondition: 'Mild Hypertension',
      allergies: 'None',
      currentMedication: 'Amlodipine 5mg (daily)',
      collegeUid: 'E8041',
      isHosteller: false,
      isFaculty: true,
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      expPoints: 650,
      healthBadge: 'Silver Health Champion',
      medsChecked: false,
      dietChecked: false,
      exerciseChecked: false,
      lastAnalysis: 'BP slightly elevated. Regular monitoring advised.'
    },
    {
      id: 'faculty-002',
      name: 'Prof. Rajinder Kaur',
      email: 'rajinder.e7021@cuchd.in',
      password: 'Faculty@123',
      role: 'PATIENT',
      phone: '9812200345',
      avatarUrl: '',
      dob: '1978-11-23',
      age: 47,
      gender: 'Female',
      bloodGroup: 'O+',
      emergencyNumber: '9812200345',
      preferredLanguage: 'Punjabi',
      existingMedicalCondition: 'Type 2 Diabetes (Controlled)',
      allergies: 'Sulfa Drugs',
      currentMedication: 'Metformin 500mg (twice daily)',
      collegeUid: 'E7021',
      isHosteller: false,
      isFaculty: true,
      department: 'Electronics & Communication Engineering',
      designation: 'Professor',
      expPoints: 720,
      healthBadge: 'Gold Health Champion',
      medsChecked: false,
      dietChecked: false,
      exerciseChecked: false,
      lastAnalysis: 'Blood sugar well-managed. Keep up with medication.'
    },
    {
      id: 'faculty-003',
      name: 'Mr. Harpreet Singh',
      email: 'harpreet.e9102@cuchd.in',
      password: 'Faculty@123',
      role: 'PATIENT',
      phone: '9876123456',
      avatarUrl: '',
      dob: '1990-06-09',
      age: 36,
      gender: 'Male',
      bloodGroup: 'AB+',
      emergencyNumber: '9876123456',
      preferredLanguage: 'Hindi',
      existingMedicalCondition: 'None',
      allergies: 'None',
      currentMedication: 'None',
      collegeUid: 'E9102',
      isHosteller: false,
      isFaculty: true,
      department: 'Business Administration',
      designation: 'Assistant Professor',
      expPoints: 540,
      healthBadge: 'Bronze Health Champion',
      medsChecked: false,
      dietChecked: false,
      exerciseChecked: false,
      lastAnalysis: 'All vitals normal. Healthy lifestyle maintained.'
    },
    {
      id: 'faculty-004',
      name: 'Dr. Meenakshi Patel',
      email: 'meenakshi.e6033@cuchd.in',
      password: 'Faculty@123',
      role: 'PATIENT',
      phone: '9765001234',
      avatarUrl: '',
      dob: '1975-02-18',
      age: 51,
      gender: 'Female',
      bloodGroup: 'A+',
      emergencyNumber: '9765001234',
      preferredLanguage: 'Hindi',
      existingMedicalCondition: 'Hypothyroidism',
      allergies: 'Penicillin',
      currentMedication: 'Levothyroxine 50mcg (daily)',
      collegeUid: 'E6033',
      isHosteller: false,
      isFaculty: true,
      department: 'Biotechnology & Bioinformatics',
      designation: 'Professor & HoD',
      expPoints: 880,
      healthBadge: 'Gold Health Champion',
      medsChecked: false,
      dietChecked: false,
      exerciseChecked: false,
      lastAnalysis: 'Thyroid levels stable. Continue medication.'
    },
    {
      id: 'pharmacy-123',
      name: 'Astra Pharmacy',
      email: 'pharmacy@demo.com',
      password: 'password123',
      role: 'PHARMACY',
      phone: '9876543212',
      avatarUrl: '',
      shopName: 'Astra Pharmacy Gharuan',
      location: 'Chandigarh University Campus'
    },
    {
      id: 'hospital-123',
      name: 'CU Health Center',
      email: 'hospital@demo.com',
      password: 'password123',
      role: 'HOSPITAL',
      phone: '9876543213',
      avatarUrl: '',
      hospitalId: 1
    },
    {
      id: 'admin-123',
      name: 'System Admin',
      email: 'admin@demo.com',
      password: 'password123',
      role: 'ADMIN',
      phone: '9876543214',
      avatarUrl: ''
    }
  ],
  familyMembers: [
    { id: 'fm-1', name: 'Robert Doe', relation: 'Father', age: 52, gender: 'Male' },
    { id: 'fm-2', name: 'Mary Doe', relation: 'Mother', age: 48, gender: 'Female' }
  ],
  hospitals: [
    {
      id: 1,
      name: 'CU Health Center',
      registrationNo: 'CUHC-9921',
      address: 'Chandigarh University Campus',
      city: 'Gharuan',
      state: 'Punjab',
      pincode: '140413',
      phone: '+91 172 233 4455',
      emergencyPhone: '+91 172 233 4455',
      email: 'healthcenter@cumail.in',
      availableBeds: 15,
      totalBeds: 50,
      rating: 4.8,
      consultationRate: 0,
      distance: '0.2 km',
      latitude: 30.7686,
      longitude: 76.5754,
      emergencyServices: true,
      icuAvailable: true,
      facilities: ['24/7 Campus Emergency SOS', '24/7 Ambulance Cover', 'General OPD', 'Vaccination Drive', 'Free Student Consultation'],
      imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800',
      verified: true
    },
    {
      id: 2,
      name: 'Max Super Speciality Hospital',
      registrationNo: 'MAXH-8812',
      address: 'Phase 6, Near Civil Hospital',
      city: 'Mohali',
      state: 'Punjab',
      pincode: '160055',
      phone: '+91 172 554 8888',
      emergencyPhone: '+91 172 554 8888',
      email: 'contact@maxhealth.in',
      availableBeds: 42,
      totalBeds: 200,
      rating: 4.5,
      consultationRate: 500,
      distance: '12.4 km',
      latitude: 30.7226,
      longitude: 76.7214,
      emergencyServices: true,
      icuAvailable: true,
      facilities: ['24/7 Emergency SOS', 'ICU & Trauma Center', 'Advanced Surgery', 'Cardiology', 'Radiology & MRI'],
      imageUrl: '/src/assets/max-hospital-mohali.png',
      verified: true
    },
    {
      id: 3,
      name: 'Fortis Hospital Mohali',
      registrationNo: 'FORTH-7731',
      address: 'Sector 62, Phase VIII',
      city: 'Mohali',
      state: 'Punjab',
      pincode: '160062',
      phone: '+91 172 469 2222',
      emergencyPhone: '+91 172 469 2222',
      email: 'info@fortis.in',
      availableBeds: 30,
      totalBeds: 180,
      rating: 4.6,
      consultationRate: 600,
      distance: '15.1 km',
      latitude: 30.6865,
      longitude: 76.7328,
      emergencyServices: true,
      icuAvailable: true,
      facilities: ['24/7 Emergency SOS', 'Cancer Institute & ICU', 'Heart & Organ Care', '24/7 Trauma Unit', 'Blood Bank'],
      imageUrl: '/src/assets/fortis-hospital-mohali.png',
      verified: true
    },
    {
      id: 4,
      name: 'Alpha Chandigarh Multispecialty Hospital',
      registrationNo: 'ACH-2026-GH',
      address: 'Chandigarh-Ludhiana Highway, Gharuan',
      city: 'Kharar',
      state: 'Punjab',
      pincode: '140413',
      phone: '+91 160 500 1200',
      emergencyPhone: '+91 160 500 1200',
      email: 'info@alphachandigarhhospital.com',
      availableBeds: 28,
      totalBeds: 80,
      rating: 4.8,
      reviewsCount: 273,
      consultationRate: 250,
      distance: '1.2 km',
      latitude: 30.7516,
      longitude: 76.5925,
      emergencyServices: true,
      icuAvailable: true,
      specialties: ['Eye', 'Gynae', 'Dental', 'ENT', 'Medicine', 'General Surgery', 'Ortho'],
      facilities: ['24/7 Campus Emergency SOS', 'Eye & Gynae Wing', 'Dental & ENT', 'Ortho & General Surgery', 'Pathology Lab'],
      imageUrl: '/src/assets/alpha-chandigarh-hospital.png',
      verified: true
    }
  ],
  doctors: [
    {
      id: 1,
      name: 'Dr. Aditya Sharma',
      specialization: 'General Physician',
      rating: 4.9,
      reviewsCount: 128,
      hospitalId: 1,
      fees: 200,
      avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      workingHours: '09:00 AM - 05:00 PM',
      onlineConsultation: true,
      inPersonConsultation: true
    },
    {
      id: 2,
      name: 'Dr. Neha Verma',
      specialization: 'Dermatologist & Skin Specialist',
      rating: 4.9,
      reviewsCount: 135,
      hospitalId: 1,
      fees: 200,
      avatarUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      workingHours: '10:00 AM - 04:00 PM',
      onlineConsultation: true,
      inPersonConsultation: true
    },
    {
      id: 3,
      name: 'Dr. Rajesh Gupta',
      specialization: 'Cardiologist',
      rating: 4.7,
      reviewsCount: 156,
      hospitalId: 2,
      fees: 600,
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
      workingDays: ['Mon', 'Tue', 'Thu', 'Fri'],
      workingHours: '11:00 AM - 06:00 PM',
      onlineConsultation: false,
      inPersonConsultation: true
    },
    {
      id: 4,
      name: 'Dr. Gurbeer Singh',
      specialization: 'Eye & ENT Specialist',
      rating: 4.9,
      reviewsCount: 184,
      hospitalId: 4,
      fees: 250,
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHours: '09:00 AM - 05:00 PM',
      onlineConsultation: true,
      inPersonConsultation: true
    },
    {
      id: 5,
      name: 'Dr. Ananya Sharma',
      specialization: 'Gynaecology & Obstetrics',
      rating: 4.8,
      reviewsCount: 142,
      hospitalId: 4,
      fees: 250,
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
      workingDays: ['Mon', 'Wed', 'Thu', 'Fri'],
      workingHours: '10:00 AM - 04:00 PM',
      onlineConsultation: true,
      inPersonConsultation: true
    },
    {
      id: 6,
      name: 'Dr. Vikram Malhotra',
      specialization: 'Oncology & Cancer Care',
      rating: 4.9,
      reviewsCount: 210,
      hospitalId: 3,
      fees: 600,
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      workingHours: '09:00 AM - 04:00 PM',
      onlineConsultation: true,
      inPersonConsultation: true
    },
    {
      id: 7,
      name: 'Dr. Arjun Kapoor',
      specialization: 'Orthopedic & Sports Injury',
      rating: 4.8,
      reviewsCount: 112,
      hospitalId: 1,
      fees: 200,
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
      workingDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHours: '09:30 AM - 04:30 PM',
      onlineConsultation: true,
      inPersonConsultation: true
    },
    {
      id: 8,
      name: 'Dr. Sunita Deshmukh',
      specialization: 'Neurologist & Brain Specialist',
      rating: 4.9,
      reviewsCount: 178,
      hospitalId: 2,
      fees: 550,
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
      workingDays: ['Mon', 'Tue', 'Thu', 'Fri'],
      workingHours: '11:00 AM - 05:00 PM',
      onlineConsultation: true,
      inPersonConsultation: true
    },
    {
      id: 9,
      name: 'Dr. Manpreet Singh',
      specialization: 'Pulmonologist & Asthma Care',
      rating: 4.8,
      reviewsCount: 96,
      hospitalId: 4,
      fees: 300,
      avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHours: '09:00 AM - 05:00 PM',
      onlineConsultation: true,
      inPersonConsultation: true
    },
    {
      id: 10,
      name: 'Dr. Ritu Saxena',
      specialization: 'Psychiatrist & Mental Wellness',
      rating: 4.9,
      reviewsCount: 145,
      hospitalId: 3,
      fees: 500,
      avatarUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150',
      workingDays: ['Mon', 'Wed', 'Thu', 'Fri'],
      workingHours: '10:00 AM - 05:00 PM',
      onlineConsultation: true,
      inPersonConsultation: true
    }
  ],
  bookings: [
    {
      id: 101,
      patientId: 'patient-123',
      patientName: 'Jane Doe',
      doctorId: 1,
      doctorName: 'Dr. Aditya Sharma',
      hospitalId: 1,
      hospitalName: 'CU Health Center',
      date: '2026-07-20',
      bookingDate: '2026-07-20',
      timeSlot: '10:00 AM',
      type: 'ONLINE',
      status: 'CONFIRMED',
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      age: 24,
      gender: 'Female',
      symptoms: 'Mild dry cough and throat irritation',
      notes: 'Consultation scheduled',
      previousPrescriptionSummary: 'Patient was prescribed Cetirizine 10mg on 2026-07-10 for Allergic Pharyngitis.',
      aiReport: '### Astra Preliminary Symptom Analysis\n- Primary complaint: Mild dry cough\n- Triage: Low risk\n- Clinical recommendation: Warm fluids and monitoring.'
    },
    {
      id: 102,
      patientId: 'patient-123',
      patientName: 'Jane Doe',
      doctorId: 2,
      doctorName: 'Dr. Neha Verma',
      hospitalId: 1,
      hospitalName: 'CU Health Center',
      date: '2026-07-10',
      bookingDate: '2026-07-10',
      timeSlot: '02:30 PM',
      type: 'IN_PERSON',
      status: 'COMPLETED',
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      age: 24,
      gender: 'Female',
      symptoms: 'Mild throat allergy',
      notes: 'Antihistamines advised.',
      previousPrescriptionSummary: '',
      aiReport: '### Astra Diagnostic Note\nPatient presented with mild throat allergy. Antihistamines advised.'
    },
    {
      id: 103,
      patientId: 'patient-123',
      patientName: 'Jane Doe',
      doctorId: 1,
      doctorName: 'Dr. Aditya Sharma',
      hospitalId: 1,
      hospitalName: 'CU Health Center',
      date: '2026-07-21',
      bookingDate: '2026-07-21',
      timeSlot: '11:30 AM',
      type: 'IN_PERSON',
      status: 'PENDING',
      paymentMethod: 'CASH',
      paymentStatus: 'PENDING',
      age: 24,
      gender: 'Female',
      symptoms: 'Mild fever and body ache',
      notes: 'Awaiting doctor approval',
      previousPrescriptionSummary: '',
      aiReport: '### Astra Preliminary Symptom Analysis\n- Primary complaint: Fever\n- Triage: Low-to-moderate risk\n- Clinical recommendation: Paracetamol and physical rest.'
    }
  ],
  prescriptions: [
    {
      id: 201,
      bookingId: 102,
      patientId: 'patient-123',
      patientName: 'Jane Doe',
      doctorId: 1,
      doctorName: 'Dr. Aditya Sharma',
      date: '2026-07-10',
      diagnosis: 'Allergic Pharyngitis',
      notes: 'Take medicines after meals. Drink plenty of warm water.',
      medicines: [
        { name: 'Cetirizine 10mg', dosage: '1 tablet daily at night', duration: '5 Days' },
        { name: 'Paracetamol 650mg', dosage: '1 tablet as needed (max 3/day)', duration: '3 Days' }
      ],
      reportUrl: ''
    }
  ],
  medicines: [
    { name: 'Paracetamol 650mg', category: 'Analgesics', price: 20, stock: 500 },
    { name: 'Amoxicillin 500mg', category: 'Antibiotics', price: 120, stock: 200 },
    { name: 'Cetirizine 10mg', category: 'Antihistamines', price: 45, stock: 350 },
    { name: 'Pantoprazole 40mg', category: 'Antacids', price: 90, stock: 400 },
    { name: 'Montelukast 10mg', category: 'Antiasthmatic', price: 150, stock: 150 }
  ],
  orders: [
    {
      id: 301,
      patientId: 'patient-123',
      patientName: 'Jane Doe',
      pharmacyName: 'Astra Pharmacy Gharuan',
      medicines: [
        { name: 'Cetirizine 10mg', price: 45, qty: 1 }
      ],
      totalAmount: 45,
      status: 'DELIVERED',
      date: '2026-07-11',
      address: 'Chandigarh University Hostel PG-3'
    }
  ],
  labBookings: [
    {
      id: 401,
      patientId: 'patient-123',
      patientName: 'Jane Doe',
      labName: 'CU Labs Gharuan',
      packageName: 'Comprehensive Health Screening',
      date: '2026-07-18',
      timeSlot: '09:00 AM',
      status: 'CONFIRMED'
    }
  ],
  notifications: [
    { id: 'n-1', title: 'Appointment Confirmed', message: 'Your appointment with Dr. Aditya Sharma is confirmed for 2026-07-20.', date: '2026-07-15T10:00:00Z', read: false },
    { id: 'n-2', title: 'Daily Care Plan', message: 'Remember to take your Cetirizine 10mg tonight.', date: '2026-07-15T15:00:00Z', read: false },
    { id: 'n-checkup', title: 'Complementary Full Body Checkup Offer \ud83e\ude78', message: 'Get 60+ parameters tested at CU Health Center. Only \u20b9199 (CU Subsidy saves you \u20b92,300!). Daily slots: 8:00 AM - 12:00 PM.', date: new Date().toISOString(), read: false },
    { id: 'n-vax', title: 'Vaccination Schedule Update \ud83d\udc89', message: 'Protect yourself! Book your COVID-19 booster or Influenza vaccine booster at CU Health Center. View vaccination schedule portal for details.', date: new Date().toISOString(), read: false }
  ],
  leaderboard: [
    { name: 'Aman Singh', role: 'PATIENT', expPoints: 1450, healthBadge: 'Gold Warrior' },
    { name: 'Jane Doe', role: 'PATIENT', expPoints: 850, healthBadge: 'Silver Health Champion' },
    { name: 'Karan Sharma', role: 'PATIENT', expPoints: 620, healthBadge: 'Bronze Scholar' }
  ],
  vaccines: [
    {
      id: 'vax-1',
      name: 'Influenza (Flu) Vaccine',
      brand: 'Vaxigrip Tetra',
      disease: 'Seasonal Influenza (H1N1 & H3N2 strains)',
      sideEffects: 'Mild soreness at injection site, low fever for 24h, slight fatigue',
      totalDoses: 1,
      doseInterval: 'Annual booster required',
      price: '\u20b9450 / dose',
      numericPrice: 450,
      badge: 'Annual Booster',
      recommendedFor: 'All Students, Faculty & Campus Staff',
      imageUrl: 'https://images.unsplash.com/photo-1618961734760-466979ce35b0?auto=format&fit=crop&q=80&w=400',
      description: 'Provides broad quadrivalent protection against seasonal flu strains prevalent in campus environments.'
    },
    {
      id: 'vax-2',
      name: 'Hepatitis B Vaccine',
      brand: 'Engerix-B / GeneVac-B',
      disease: 'Hepatitis B Virus (Chronic Liver Infection & Cirrhosis)',
      sideEffects: 'Slight tenderness at arm site, temporary mild fatigue',
      totalDoses: 3,
      doseInterval: 'Dose 1: Day 0 | Dose 2: 1 Month | Dose 3: 6 Months',
      price: '\u20b9350 / dose',
      numericPrice: 350,
      badge: 'Core Protection',
      recommendedFor: 'Medical, Biotech, Lab & Hostel Students',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
      description: 'Essential 3-dose recombinant vaccine providing lifelong immunity against Hepatitis B virus.'
    },
    {
      id: 'vax-3',
      name: 'COVID-19 Precautionary Booster',
      brand: 'Covishield / Corbevax',
      disease: 'SARS-CoV-2 (COVID-19 Respiratory Complications)',
      sideEffects: 'Arm ache, mild body fatigue, transient temperature',
      totalDoses: 2,
      doseInterval: 'Dose 1: Day 0 | Dose 2: 84 Days',
      price: 'FREE',
      numericPrice: 0,
      badge: 'Campus Drive (Free)',
      recommendedFor: 'Universal Campus Community',
      imageUrl: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?auto=format&fit=crop&q=80&w=400',
      description: 'Fully subsidized booster drive organized at CU Health Center for safe campus interactions.'
    },
    {
      id: 'vax-4',
      name: 'Typhoid Conjugate Vaccine (TCV)',
      brand: 'Typbar-TCV',
      disease: 'Salmonella Typhi (Typhoid Fever)',
      sideEffects: 'Redness at injection site, mild headache',
      totalDoses: 1,
      doseInterval: 'Single dose protects up to 5 years',
      price: '\u20b9550 / dose',
      numericPrice: 550,
      badge: 'Hosteller Recommended',
      recommendedFor: 'Hostellers, Mess Staff & Food Handlers',
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400',
      description: 'High-efficacy conjugate vaccine conferring long-lasting protection against food & water-borne typhoid.'
    },
    {
      id: 'vax-5',
      name: 'Tetanus Toxoid (TT) / DTP Booster',
      brand: 'Td-Vac',
      disease: 'Clostridium Tetani (Tetanus Infection & Lockjaw)',
      sideEffects: 'Localized arm stiffness, transient fever',
      totalDoses: 1,
      doseInterval: 'Booster recommended every 5-10 years',
      price: '\u20b9150 / dose',
      numericPrice: 150,
      badge: 'Essential Safety',
      recommendedFor: 'Athletes, Mechanical & Workshop Students',
      imageUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=400',
      description: 'Protective immunization against bacterial spores encountered during outdoor activities & machinery work.'
    },
    {
      id: 'vax-6',
      name: 'HPV Gardasil-9 Vaccine',
      brand: 'Gardasil-9 (MSD)',
      disease: 'Human Papillomavirus (Cervical & Oncogenic Strains)',
      sideEffects: 'Mild soreness, brief lightheadedness',
      totalDoses: 2,
      doseInterval: 'Dose 1: Day 0 | Dose 2: 6 Months',
      price: '\u20b93,200 / dose',
      numericPrice: 3200,
      badge: 'Specialized Care',
      recommendedFor: 'Young Adults (Ages 18 - 26)',
      imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400',
      description: '9-valent recombinant vaccine protecting against 9 high-risk HPV types responsible for cervical and mucosal cancers.'
    },
    {
      id: 'vax-7',
      name: 'MMR Vaccine',
      brand: 'Tresivac',
      disease: 'Measles, Mumps & Rubella (German Measles)',
      sideEffects: 'Low fever, mild temporary rash after 5-7 days',
      totalDoses: 2,
      doseInterval: 'Dose 1: Primary | Dose 2: Booster at 1 Month',
      price: '\u20b9600 / dose',
      numericPrice: 600,
      badge: 'General Immunization',
      recommendedFor: 'Students & Overseas Exchange Travelers',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400',
      description: 'Combined live-attenuated vaccine offering lifelong defense against contagious viral respiratory illnesses.'
    },
    {
      id: 'vax-8',
      name: 'Chickenpox (Varicella) Vaccine',
      brand: 'Varilrix / Variped',
      disease: 'Varicella Zoster Virus (Chickenpox)',
      sideEffects: 'Mild pain at injection site, slight rash',
      totalDoses: 2,
      doseInterval: 'Dose 1: Day 0 | Dose 2: 4 to 8 Weeks',
      price: '\u20b91,450 / dose',
      numericPrice: 1450,
      badge: 'Adult Protection',
      recommendedFor: 'Non-immune Adult Students',
      imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=400',
      description: 'Prevents severe chickenpox infections and secondary dermatological complications in young adults.'
    }
  ],
  patientVaccinations: [
    {
      id: 'pv-101',
      patientId: 'student-10013',
      patientName: 'Naina Kumari',
      vaccineId: 'vax-3',
      vaccineName: 'COVID-19 Precautionary Booster',
      brand: 'Covishield',
      doseNumber: 1,
      totalDoses: 2,
      hospitalId: 1,
      hospitalName: 'CU Health Center',
      hospitalAddress: 'Chandigarh University Campus, Gharuan',
      date: '2026-01-15',
      timeSlot: '10:00 AM',
      doctorName: 'Dr. Aditya Sharma',
      status: 'COMPLETED',
      certificateNo: 'CU-VAX-2026-001',
      pricePaid: 'FREE'
    },
    {
      id: 'pv-102',
      patientId: 'student-10013',
      patientName: 'Naina Kumari',
      vaccineId: 'vax-3',
      vaccineName: 'COVID-19 Precautionary Booster',
      brand: 'Covishield',
      doseNumber: 2,
      totalDoses: 2,
      hospitalId: 1,
      hospitalName: 'CU Health Center',
      hospitalAddress: 'Chandigarh University Campus, Gharuan',
      date: '2026-04-10',
      timeSlot: '11:30 AM',
      doctorName: 'Dr. Aditya Sharma',
      status: 'COMPLETED',
      certificateNo: 'CU-VAX-2026-002',
      pricePaid: 'FREE'
    }
  ]
};

function getDb() {
  const data = localStorage.getItem(MOCK_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(defaultDb));
    return defaultDb;
  }
  try {
    const db = JSON.parse(data);
    let modified = false;
    if (!db.users) {
      db.users = [];
      modified = true;
    }
    defaultDb.users.forEach(defaultUser => {
      const existing = db.users.find(u => u.id === defaultUser.id || u.email.toLowerCase() === defaultUser.email.toLowerCase());
      if (!existing) {
        db.users.push(defaultUser);
        modified = true;
      } else if (defaultUser.avatarUrl && existing.avatarUrl !== defaultUser.avatarUrl) {
        existing.avatarUrl = defaultUser.avatarUrl;
        modified = true;
      }
    });
    defaultDb.hospitals.forEach(h => {
      if (!db.hospitals) db.hospitals = [];
      const existing = db.hospitals.find(item => item.id === h.id);
      if (!existing) {
        db.hospitals.push(h);
        modified = true;
      } else if (h.imageUrl && existing.imageUrl !== h.imageUrl) {
        existing.imageUrl = h.imageUrl;
        modified = true;
      }
    });
    defaultDb.doctors.forEach(doc => {
      if (!db.doctors) db.doctors = [];
      const existing = db.doctors.find(item => item.id === doc.id);
      if (!existing) {
        db.doctors.push(doc);
        modified = true;
      }
    });
    if (!db.vaccines || db.vaccines.length === 0) {
      db.vaccines = defaultDb.vaccines;
      modified = true;
    }
    if (!db.patientVaccinations) {
      db.patientVaccinations = defaultDb.patientVaccinations;
      modified = true;
    }
    if (db.notifications && !db.notifications.some(n => n.id === 'n-checkup')) {
      db.notifications.push(defaultDb.notifications.find(n => n.id === 'n-checkup'));
      db.notifications.push(defaultDb.notifications.find(n => n.id === 'n-vax'));
      modified = true;
    }
    if (modified) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
    }
    return db;
  } catch (e) {
    console.error('Failed to parse mock database', e);
    return defaultDb;
  }
}

function saveDb(db) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
}

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDb = {
  auth: {
    login: async ({ email, password }) => {
      await delay(500);
      const db = getDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user || user.password !== password) {
        throw { response: { data: { message: 'Invalid credentials. User check failed.' } } };
      }
      return {
        token: `mock-jwt-token-for-${user.id}`,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl || ''
      };
    },

    googleLogin: async (email, googleName, avatarUrl) => {
      await delay(600);
      const db = getDb();
      let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        const newId = 'google-' + Math.random().toString(36).substr(2, 9);
        user = {
          id: newId,
          name: googleName || email.split('@')[0],
          email: email,
          password: 'googleAuthPassword',
          role: 'PATIENT',
          phone: '',
          avatarUrl: avatarUrl || ''
        };
        db.users.push(user);
        saveDb(db);
      } else if (avatarUrl && !user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        saveDb(db);
      }
      return {
        token: `mock-jwt-token-for-${user.id}`,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl || ''
      };
    },

    signup: async (data) => {
      await delay(700);
      const db = getDb();
      const exists = db.users.some(u => u.email.toLowerCase() === data.email.toLowerCase());
      if (exists) {
        throw { response: { data: { message: 'User with this email already exists' } } };
      }
      const newId = 'user-' + Math.random().toString(36).substr(2, 9);
      const newUser = {
        id: newId,
        ...data,
        expPoints: 100,
        healthBadge: 'Healthy Rookie',
        medsChecked: false,
        dietChecked: false,
        exerciseChecked: false
      };
      db.users.push(newUser);
      saveDb(db);
      return {
        token: `mock-jwt-token-for-${newId}`,
        id: newId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatarUrl: ''
      };
    },
    getAllUsers: async () => {
      await delay(300);
      return getDb().users;
    },

    getProfile: async () => {
      await delay(200);
      const db = getDb();
      const token = localStorage.getItem('MedAstraX_token') || localStorage.getItem('MedAstraX_token');
      const userId = token ? token.split('mock-jwt-token-for-')[1] : 'patient-123';
      const user = db.users.find(u => u.id === userId) || db.users[0];
      return user;
    },

    updateProfile: async (data) => {
      await delay(300);
      const db = getDb();
      const token = localStorage.getItem('MedAstraX_token') || localStorage.getItem('MedAstraX_token');
      const userId = token ? token.split('mock-jwt-token-for-')[1] : 'patient-123';
      const userIdx = db.users.findIndex(u => u.id === userId);
      if (userIdx !== -1) {
        db.users[userIdx] = { ...db.users[userIdx], ...data };
        saveDb(db);
        return db.users[userIdx];
      }
      return data;
    },

    updateAvatar: async (avatarUrl) => {
      await delay(200);
      const db = getDb();
      const token = localStorage.getItem('MedAstraX_token') || localStorage.getItem('MedAstraX_token');
      const userId = token ? token.split('mock-jwt-token-for-')[1] : 'patient-123';
      const userIdx = db.users.findIndex(u => u.id === userId);
      if (userIdx !== -1) {
        db.users[userIdx].avatarUrl = avatarUrl;
        saveDb(db);
        return { message: avatarUrl };
      }
      return { message: avatarUrl };
    },

    getPatientProfileForDoctor: async (patientId) => {
      await delay(300);
      const db = getDb();
      const user = db.users.find(u => u.id === patientId || u.id === 'patient-123');
      return user;
    },

    getDoctors: async () => {
      await delay(300);
      const db = getDb();
      return db.doctors;
    },

    getPatients: async () => {
      await delay(300);
      const db = getDb();
      return db.users.filter(u => u.role === 'PATIENT');
    },

    getBookings: async () => {
      await delay(350);
      const db = getDb();
      return db.bookings;
    },

    getOrders: async () => {
      await delay(300);
      const db = getDb();
      return db.orders;
    },

    getLabBookings: async () => {
      await delay(300);
      const db = getDb();
      return db.labBookings;
    },

    getReferralStats: async () => {
      await delay(200);
      const db = getDb();
      const token = localStorage.getItem('MedAstraX_token') || localStorage.getItem('MedAstraX_token');
      const userId = token ? token.split('mock-jwt-token-for-')[1] : 'patient-123';
      const currentUser = db.users.find(u => u.id === userId) || db.users[0];
      const referralCode = currentUser.referralCode || ('REF-' + (currentUser.collegeUid ? currentUser.collegeUid.toUpperCase() : currentUser.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()));

      const userReferrals = (db.referrals || []).filter(r => r.referrerId === currentUser.id);
      const totalPointsEarned = userReferrals.reduce((sum, r) => sum + (r.pointsEarned || 100), 0);

      return {
        referralCode,
        referralLink: `${window.location.origin}/signup?ref=${referralCode}`,
        totalReferrals: userReferrals.length,
        totalPointsEarned,
        referralHistory: userReferrals.length > 0 ? userReferrals : [
          { id: 'ref-1', studentName: 'Aarav Sharma', collegeUid: '24BCF10088', dateJoined: '2026-07-28', status: 'COMPLETED', pointsEarned: 100 },
          { id: 'ref-2', studentName: 'Priya Verma', collegeUid: '24BCF10099', dateJoined: '2026-08-01', status: 'COMPLETED', pointsEarned: 100 }
        ]
      };
    }
  },

  otp: {
    sendOtp: async (identifier, type) => {
      await delay(300);
      console.log(`[MOCK OTP] Sent 2FA code 123412 to ${identifier} via ${type}`);
      return { message: 'Verification OTP sent! (Use 123412)' };
    },
    verifyOtp: async (identifier, type, otp) => {
      await delay(300);
      if (otp === '123412') {
        return { message: 'OTP verified successfully' };
      }
      throw { response: { data: { message: 'Invalid OTP code' } } };
    },
    checkStatus: async (identifier, type) => {
      await delay(100);
      return { status: 'VERIFIED' };
    }
  },

  hospital: {
    getAll: async () => {
      await delay(300);
      return getDb().hospitals;
    },
    getById: async (id) => {
      await delay(200);
      const hospitals = getDb().hospitals;
      return hospitals.find(h => h.id === parseInt(id)) || hospitals[0];
    },
    search: async (query) => {
      await delay(300);
      const db = getDb();
      return db.hospitals.filter(h => h.name.toLowerCase().includes(query.toLowerCase()));
    },
    getByDoctor: async (doctorId) => {
      await delay(200);
      const db = getDb();
      const doc = db.doctors.find(d => d.id === parseInt(doctorId)) || db.doctors[0];
      const h = db.hospitals.find(h => h.id === doc.hospitalId) || db.hospitals[0];
      return h ? [h] : [];
    },
    create: async (data) => {
      await delay(400);
      const db = getDb();
      const newH = {
        id: db.hospitals.length + 1,
        rating: 4.0,
        distance: '5.0 km',
        verified: false,
        ...data
      };
      db.hospitals.push(newH);
      saveDb(db);
      return newH;
    },
    update: async (id, data) => {
      await delay(300);
      const db = getDb();
      const idx = db.hospitals.findIndex(h => h.id === parseInt(id));
      if (idx !== -1) {
        db.hospitals[idx] = { ...db.hospitals[idx], ...data };
        saveDb(db);
        return db.hospitals[idx];
      }
      return data;
    },
    updateBeds: async (id, beds) => {
      await delay(200);
      const db = getDb();
      const idx = db.hospitals.findIndex(h => h.id === parseInt(id));
      if (idx !== -1) {
        db.hospitals[idx].availableBeds = parseInt(beds);
        saveDb(db);
        return db.hospitals[idx];
      }
      return { message: 'Beds updated' };
    },
    getDoctors: async (id) => {
      await delay(250);
      const db = getDb();
      return db.doctors.filter(d => d.hospitalId === parseInt(id));
    },
    verify: async (id, verified) => {
      await delay(200);
      const db = getDb();
      const idx = db.hospitals.findIndex(h => h.id === parseInt(id));
      if (idx !== -1) {
        db.hospitals[idx].verified = verified === 'true' || verified === true;
        saveDb(db);
        return db.hospitals[idx];
      }
      return { message: 'Verification status updated' };
    }
  },

  booking: {
    create: async (data) => {
      await delay(300);
      const db = getDb();
      const userRaw = localStorage.getItem('MedAstraX_user') || localStorage.getItem('MedAstraX_user');
      let currentUserId = 'student-10024';
      let currentUserName = 'Rashika';
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw);
          if (u?.id) currentUserId = u.id;
          if (u?.name) currentUserName = u.name;
        } catch (e) {}
      }

      const doctor = db.doctors.find(d => d.id === parseInt(data.doctorId)) || db.doctors[0];
      const hospital = db.hospitals.find(h => h.id === (data.hospitalId || doctor.hospitalId)) || db.hospitals[0];
      const newBooking = {
        id: Date.now(),
        patientId: data.patientId || currentUserId,
        patientName: data.patientName || currentUserName,
        doctorId: doctor.id,
        doctorName: doctor.name,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        date: data.bookingDate || data.date,
        bookingDate: data.bookingDate || data.date,
        timeSlot: data.timeSlot,
        type: data.type || 'IN_PERSON',
        status: 'CONFIRMED',
        paymentMethod: data.paymentMethod || 'CASH',
        paymentStatus: data.paymentMethod === 'UPI' ? 'PAID' : 'PENDING',
        meetingLink: data.type === 'ONLINE' ? 'https://meet.google.com/xyz-mock-meet' : '',
        age: data.age || 20,
        gender: data.gender || 'Female',
        symptoms: data.symptoms || 'General consultation',
        notes: data.notes || '',
        aiReport: ''
      };
      db.bookings.unshift(newBooking);
      saveDb(db);
      console.log(`[POSTGRESQL INSERT] INSERT INTO bookings (id, patient_id, doctor_id, date, time_slot, status) VALUES (${newBooking.id}, '${newBooking.patientId}', ${newBooking.doctorId}, '${newBooking.bookingDate}', '${newBooking.timeSlot}', '${newBooking.status}')`);
      return newBooking;
    },
    getPatientBookings: async (familyMemberId) => {
      await delay(200);
      const db = getDb();
      const userRaw = localStorage.getItem('MedAstraX_user') || localStorage.getItem('MedAstraX_user');
      let currentUserId = 'student-10024';
      let currentUserName = 'Rashika';
      if (userRaw) {
        try {
          const u = JSON.parse(userRaw);
          if (u?.id) currentUserId = u.id;
          if (u?.name) currentUserName = u.name;
        } catch (e) {}
      }
      return db.bookings.filter(b => 
        b.patientId === currentUserId || 
        b.patientId === 'student-10024' || 
        b.patientId === 'student-10013' || 
        b.patientId === 'patient-123' ||
        (b.patientName && currentUserName && b.patientName.toLowerCase().includes(currentUserName.toLowerCase()))
      );
    },
    getDoctorBookings: async () => {
      await delay(300);
      const db = getDb();
      return db.bookings;
    },
    getById: async (id) => {
      await delay(200);
      const db = getDb();
      return db.bookings.find(b => b.id === parseInt(id)) || db.bookings[0];
    },
    updateStatus: async (id, status) => {
      await delay(300);
      const db = getDb();
      const idx = db.bookings.findIndex(b => b.id === parseInt(id));
      if (idx !== -1) {
        db.bookings[idx].status = status;
        if (status === 'CANCELLED') {
          db.bookings[idx].paymentStatus = 'REFUNDED';
        }
        saveDb(db);
        return db.bookings[idx];
      }
      return { message: 'Booking status updated' };
    },
    getAvailableSlots: async (doctorId, date) => {
      await delay(200);
      return [
        '09:00 AM',
        '10:00 AM',
        '11:00 AM',
        '12:00 PM',
        '02:00 PM',
        '03:00 PM',
        '04:00 PM'
      ];
    },
    updateMeetingLink: async (id, link) => {
      await delay(200);
      const db = getDb();
      const idx = db.bookings.findIndex(b => b.id === parseInt(id));
      if (idx !== -1) {
        db.bookings[idx].meetingLink = link;
        saveDb(db);
        return db.bookings[idx];
      }
      return { message: 'Meeting link updated' };
    },
    updateAiReport: async (id, report) => {
      await delay(200);
      const db = getDb();
      const idx = db.bookings.findIndex(b => b.id === parseInt(id));
      if (idx !== -1) {
        db.bookings[idx].aiReport = report;
        saveDb(db);
        return db.bookings[idx];
      }
      return { message: 'AI report updated' };
    },
    reschedule: async (id, date, timeSlot) => {
      await delay(300);
      const db = getDb();
      const idx = db.bookings.findIndex(b => b.id === parseInt(id));
      if (idx !== -1) {
        db.bookings[idx].date = date;
        db.bookings[idx].timeSlot = timeSlot;
        saveDb(db);
        return db.bookings[idx];
      }
      return { message: 'Rescheduled successfully' };
    },
    rateBooking: async (id, rating, reviewText) => {
      await delay(300);
      const db = getDb();
      const idx = db.bookings.findIndex(b => b.id === parseInt(id));
      if (idx !== -1) {
        db.bookings[idx].userRating = rating;
        db.bookings[idx].userReview = reviewText || '';
        db.bookings[idx].ratedAt = new Date().toISOString();

        const docId = db.bookings[idx].doctorId;
        if (docId) {
          const docIdx = (db.doctors || []).findIndex(d => d.id === parseInt(docId));
          if (docIdx !== -1) {
            const currentDoc = db.doctors[docIdx];
            const currentRating = currentDoc.rating || 4.5;
            const currentCount = currentDoc.reviewCount || 12;
            const newRating = Number(((currentRating * currentCount + rating) / (currentCount + 1)).toFixed(1));
            db.doctors[docIdx].rating = newRating;
            db.doctors[docIdx].reviewCount = currentCount + 1;
          }
        }
        saveDb(db);
        return db.bookings[idx];
      }
      return { message: 'Rating updated' };
    }
  },

  prescription: {
    getAll: async () => {
      await delay(300);
      return getDb().prescriptions;
    },
    create: async (data) => {
      await delay(400);
      const db = getDb();
      const newP = {
        id: db.prescriptions.length + 201,
        date: new Date().toISOString().split('T')[0],
        patientId: data.patientId || 'patient-123',
        patientName: data.patientName || 'Jane Doe',
        doctorId: 1,
        doctorName: data.doctorName || 'Dr. Aditya Sharma',
        ...data
      };
      db.prescriptions.push(newP);

      if (data.bookingId) {
        const bIdx = db.bookings.findIndex(b => b.id === parseInt(data.bookingId));
        if (bIdx !== -1) {
          db.bookings[bIdx].status = 'COMPLETED';
        }
      }
      saveDb(db);
      return newP;
    },
    getPatientPrescriptions: async (familyMemberId) => {
      await delay(300);
      const db = getDb();
      return db.prescriptions.filter(p => p.patientId === 'patient-123');
    },
    getDoctorPrescriptions: async () => {
      await delay(300);
      const db = getDb();
      return db.prescriptions;
    },
    getById: async (id) => {
      await delay(200);
      const db = getDb();
      return db.prescriptions.find(p => p.id === parseInt(id)) || db.prescriptions[0];
    },
    analyze: async (id) => {
      await delay(500);
      const db = getDb();
      const p = db.prescriptions.find(item => item.id === parseInt(id)) || db.prescriptions[0];
      return {
        data: {
          diagnosis: p ? p.diagnosis : 'Allergic Pharyngitis',
          recommendation: 'Antihistamine (Cetirizine) to manage allergies. Safe with normal usage. Rest voice, keep hydrated and take meds after meals.',
          nextStep: 'PHARMACY'
        }
      };
    },
    analyzeRaw: async (data) => {
      await delay(600);
      return {
        reply: '### Symptom Diagnostic Helper\nBased on symptoms provided, you might have common seasonal rhinovirus. Recommend hydration and 1 Cetirizine daily at bedtime.'
      };
    },
    analyzeReportDocument: async (data) => {
      await delay(800);
      return {
        reply: '### Clinical Document Overview\n- Hemoglobin: 14.2 g/dL (Normal)\n- WBC Count: 6,800 /uL (Normal)\n- Conclusion: Overall diagnostic parameters are within physiological range.'
      };
    },
    getPharmacyQueue: async () => {
      await delay(200);
      const db = getDb();
      return db.prescriptions;
    },
    uploadReport: async (id, reportUrl) => {
      await delay(300);
      const db = getDb();
      const idx = db.prescriptions.findIndex(p => p.id === parseInt(id));
      if (idx !== -1) {
        db.prescriptions[idx].reportUrl = reportUrl;
        saveDb(db);
        return db.prescriptions[idx];
      }
      return { message: 'Report uploaded' };
    }
  },

  familyMember: {
    add: async (data) => {
      await delay(400);
      const db = getDb();
      const newMember = {
        id: 'fm-' + Math.random().toString(36).substr(2, 9),
        ...data
      };
      db.familyMembers.push(newMember);
      saveDb(db);
      return newMember;
    },
    getAll: async () => {
      await delay(250);
      return getDb().familyMembers;
    },
    delete: async (id) => {
      await delay(300);
      const db = getDb();
      db.familyMembers = db.familyMembers.filter(fm => fm.id !== id);
      saveDb(db);
      return { message: 'Family member removed successfully' };
    }
  },

  pharmacy: {
    setPrices: async (data) => {
      await delay(300);
      return { message: 'Prices updated successfully' };
    },
    getMedicines: async () => {
      await delay(200);
      return getDb().medicines;
    },
    getForPrescription: async (prescriptionId) => {
      await delay(200);
      const db = getDb();
      const rx = db.prescriptions.find(p => p.id === parseInt(prescriptionId)) || db.prescriptions[0];
      return rx.medicines.map(m => {
        const found = db.medicines.find(med => med.name.toLowerCase() === m.name.toLowerCase());
        return {
          name: m.name,
          category: found ? found.category : 'General',
          price: found ? found.price : 50,
          qty: 1
        };
      });
    },
    getAll: async () => {
      await delay(250);
      return [
        { id: 1, name: 'Astra Pharmacy Gharuan', location: 'CU Campus', rating: 4.8 },
        { id: 2, name: 'Apollo Pharmacy Mohali', location: 'Mohali Phase 5', rating: 4.5 }
      ];
    },
    updateProfile: async (data) => {
      await delay(300);
      return { message: 'Profile updated' };
    },
    createOrder: async (data) => {
      await delay(400);
      const db = getDb();
      const newOrder = {
        id: db.orders.length + 301,
        patientId: data.patientId || 'patient-123',
        patientName: data.patientName || 'Jane Doe',
        pharmacyName: data.pharmacyName || 'Astra Pharmacy Gharuan',
        medicines: data.medicines || [],
        totalAmount: data.totalAmount || 150,
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0],
        address: data.address || 'CU Campus Hostel'
      };
      db.orders.push(newOrder);
      saveDb(db);
      return newOrder;
    },
    getOrdersForPharmacy: async (pharmacyName) => {
      await delay(250);
      const db = getDb();
      return db.orders;
    },
    updateOrderStatus: async (orderId, { status }) => {
      await delay(300);
      const db = getDb();
      const idx = db.orders.findIndex(o => o.id === parseInt(orderId));
      if (idx !== -1) {
        db.orders[idx].status = status;
        saveDb(db);
        return db.orders[idx];
      }
      return { message: 'Order status updated' };
    }
  },

  lab: {
    getAll: async () => {
      await delay(200);
      return [
        { id: 1, name: 'Comprehensive Health Screening', tests: 'Hemoglobin, Glucose, Lipids, Kidney Function', price: 999 },
        { id: 2, name: 'Complete Blood Count (CBC)', tests: 'WBC, RBC, Platelets, Hemoglobin', price: 299 },
        { id: 3, name: 'Lipid Profile', tests: 'Cholesterol, HDL, LDL, Triglycerides', price: 450 }
      ];
    },
    createBooking: async (data) => {
      await delay(400);
      const db = getDb();
      const newBooking = {
        id: db.labBookings.length + 401,
        patientId: 'patient-123',
        patientName: 'Jane Doe',
        labName: 'CU Labs Gharuan',
        packageName: data.packageName || 'Comprehensive Health Screening',
        date: data.date,
        timeSlot: data.timeSlot,
        status: 'CONFIRMED'
      };
      db.labBookings.push(newBooking);
      saveDb(db);
      return newBooking;
    },
    getPatientBookings: async () => {
      await delay(250);
      const db = getDb();
      return db.labBookings;
    },
    updateBookingStatus: async (id, { status }) => {
      await delay(300);
      const db = getDb();
      const idx = db.labBookings.findIndex(b => b.id === parseInt(id));
      if (idx !== -1) {
        db.labBookings[idx].status = status;
        saveDb(db);
        return db.labBookings[idx];
      }
      return { message: 'Lab booking updated' };
    },
    getLabBookings: async () => {
      await delay(250);
      const db = getDb();
      return db.labBookings;
    }
  },

  payment: {
    createOrder: async (data) => {
      await delay(200);
      return { orderId: 'pay_mock_' + Math.random().toString(36).substr(2, 9), amount: data.amount };
    },
    verifyPayment: async (data) => {
      await delay(200);
      return { success: true };
    }
  },

  notification: {
    getNotifications: async () => {
      await delay(150);
      const db = getDb();
      return db.notifications;
    }
  },

  file: {
    upload: async (file) => {
      await delay(400);
      return { data: { message: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150' } };
    }
  },

  ai: {
    chat: async (message, sessionId) => {
      await delay(800);
      const msg = message.toLowerCase();
      
      const db = getDb();
      const token = localStorage.getItem('MedAstraX_token') || localStorage.getItem('MedAstraX_token');
      const userId = token ? token.split('mock-jwt-token-for-')[1] : 'patient-123';
      const user = db.users.find(u => u.id === userId) || db.users.find(u => u.role === 'PATIENT') || db.users[0];

      const userName = user.name || "Rashika";
      const userGender = user.gender || "Female";
      const userBlood = user.bloodGroup || "O+";
      const userCondition = user.existingMedicalCondition || "None";
      const userAllergies = user.allergies || "None";

      const cleanMsg = msg.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,""); // remove punctuation
      if (cleanMsg === "ok" || cleanMsg === "okay" || cleanMsg === "got it" || cleanMsg === "sure" || cleanMsg === "ok thanks" || cleanMsg === "ok thank you" || cleanMsg === "ok thankyou" || cleanMsg === "done") {
        return {
          reply: `### 🤖 Astra AI Assistant\n\nGreat, **${userName}**! Let me know if you have any other symptoms you would like to check, or if you need help booking an appointment with one of our doctors at the CU Health Center.`,
          sessionId: sessionId || 'mock-session-abc'
        };
      }
      if (cleanMsg.includes("thank") || cleanMsg.includes("thx") || cleanMsg.includes("tanks")) {
        return {
          reply: `### 🤖 Astra AI Assistant\n\nYou're very welcome, **${userName}**! ❤️ I'm glad I could assist you with your health query. Remember to stay hydrated and get plenty of rest. If you need any more symptom checks or help, feel free to ask anytime!`,
          sessionId: sessionId || 'mock-session-abc'
        };
      }
      if (cleanMsg.includes("bye") || cleanMsg.includes("see you") || cleanMsg.includes("goodnight") || cleanMsg.includes("good night")) {
        return {
          reply: `### 🤖 Astra AI Assistant\n\nGoodbye, **${userName}**! Take care of your health, and have a wonderful day ahead. Don't hesitate to reach out if you feel unwell later!`,
          sessionId: sessionId || 'mock-session-abc'
        };
      }
      if (cleanMsg.startsWith("hello") || cleanMsg.startsWith("hi") || cleanMsg.startsWith("hey") || cleanMsg.startsWith("greetings") || cleanMsg.startsWith("good morning") || cleanMsg.startsWith("good afternoon") || cleanMsg.startsWith("good evening")) {
        return {
          reply: `### 🤖 Astra AI Assistant\n\nHello **${userName}**! 👋 I am Astra, your AI Symptom Checker. How can I help you today?\n\nPlease tell me what symptoms you are experiencing (e.g., *fever*, *cough*, *stomach pain*, *headache*) so I can guide you!`,
          sessionId: sessionId || 'mock-session-abc'
        };
      }
      
      const isAskingHospitalOrDoctor = msg.includes("hospital") || msg.includes("clinic") || msg.includes("doctor") || msg.includes("physician") || msg.includes("specialist") || msg.includes("book") || msg.includes("appointment") || msg.includes("where") || msg.includes("suggest") || msg.includes("recommend");

      if (isAskingHospitalOrDoctor) {
        let recommendationText = "";
        
        if (msg.includes("headache") || msg.includes("migraine")) {
          recommendationText = `For your **headache/migraine**, we recommend starting with **Dr. Aditya Sharma** (General Physician) at the **CU Health Center** (On-Campus, 0.2 km away) for a primary clinical evaluation. 

If your condition requires advanced neurological consultation or specialized diagnostic screening, **Max Super Speciality Hospital** (Mohali, 12.4 km away) has excellent facilities and specialized neurologists. You can book an appointment with them directly through the *Hospitals & Clinics* tab on your dashboard!`;
        } else if (msg.includes("fever") || msg.includes("cold") || msg.includes("cough") || msg.includes("throat")) {
          recommendationText = `For symptoms like **fever, cold, or cough**, you should consult **Dr. Aditya Sharma** (General Physician) or **Dr. Neha Verma** (Dermatologist & Skin Specialist) at the **CU Health Center** (On-Campus, 0.2 km away). 

For more severe or persistent symptoms, **Fortis Hospital Mohali** (Sector 62, Mohali, 15.1 km away) provides excellent general medicine and emergency care services. You can select and book slots directly in the *Hospitals & Clinics* tab!`;
        } else if (msg.includes("stomach") || msg.includes("pain") || msg.includes("belly") || msg.includes("vomit") || msg.includes("diarrhea")) {
          recommendationText = `For **stomach pain or gastrointestinal distress**, we recommend consulting **Dr. Aditya Sharma** (General Physician) at the **CU Health Center** (On-Campus, 0.2 km away). 

If the pain is severe, localized, or accompanied by constant vomiting, **Max Super Speciality Hospital** (Mohali, 12.4 km away) offers comprehensive gastroenterology support. You can book an in-person visit via the *Hospitals & Clinics* section!`;
        } else {
          recommendationText = `Here are the top recommended healthcare facilities on our campus network:

1. 🏫 **CU Health Center** (On-Campus, 0.2 km away) - Rating: **4.8 ⭐** (Highly recommended for students & faculty, verified). General Physician: **Dr. Aditya Sharma**.
2. 🏥 **Max Super Speciality Hospital** (Mohali, 12.4 km away) - Rating: **4.5 ⭐** (Verified). Specializes in advanced diagnostics, cardiology, and emergency care.
3. 🏥 **Fortis Hospital Mohali** (Mohali, 15.1 km away) - Rating: **4.6 ⭐**. Specializes in multispeciality care.

You can book appointments or online consultations with doctors at these hospitals directly in the **Hospitals & Clinics** section on the left sidebar!`;
        }

        return {
          reply: `### 🏥 Astra AI Hospital & Doctor Recommendations\n\nHello **${userName}**! Based on your query, here is the best clinical match on our network:\n\n${recommendationText}\n\n*Note: In case of a medical emergency, please trigger the emergency SOS immediately in your sidebar for instant ambulance dispatch.*`,
          sessionId: sessionId || 'mock-session-abc'
        };
      }

      let symptom = "";
      let dos = [];
      let donts = [];
      let whenToSeeDoctor = "";
      let possibleCauses = "";
      
      if (msg.includes("fever") || msg.includes("temp") || msg.includes("body heat")) {
        symptom = "Fever (High Temperature)";
        possibleCauses = `Viral infection, bacterial infection, dehydration, or physical exhaustion. ${userCondition !== 'None' ? `Considering your history of **${userCondition}**, you should monitor this fever closely.` : ''}`;
        dos = [
          "Stay well hydrated (drink water, herbal teas, or electrolyte solutions).",
          "Get plenty of bed rest to help your body fight the infection.",
          "Use a damp washcloth on your forehead to cool down.",
          "Keep the room temperature comfortable and wear light clothing."
        ];
        donts = [
          "Avoid cold baths or ice rubs, as they can cause shivering and raise your core temperature.",
          "Do not wear heavy woolens or wrap yourself in thick blankets.",
          "Do not ignore a high fever that persists for more than 3 days.",
          "Avoid heavy physical exertion or exercise."
        ];
        whenToSeeDoctor = `Seek immediate medical attention if your temperature exceeds 103°F (39.4°C), if it lasts more than 3 days, or if it is accompanied by a severe headache, stiff neck, shortness of breath, or confusion.${userCondition !== 'None' ? ` Since you have **${userCondition}**, consult a doctor early.` : ''}`;
      } else if (msg.includes("cough") || msg.includes("cold") || msg.includes("throat") || msg.includes("congestion")) {
        symptom = "Cough, Cold & Throat Congestion";
        possibleCauses = `Common cold virus, flu, acute bronchitis, allergies, or environmental irritants. ${userAllergies !== 'None' && userAllergies !== '' && userAllergies !== 'None ' ? `Your allergy to **${userAllergies}** could also be a major trigger for these respiratory symptoms.` : ''}`;
        dos = [
          "Gargle with warm salt water 3-4 times a day to relieve throat itchiness.",
          "Drink warm fluids like tea with honey, warm broths, or lemon water.",
          "Use a humidifier or steam inhalation to loosen mucus.",
          "Keep your throat moisturized with throat lozenges."
        ];
        donts = [
          "Avoid drinking very cold water or eating iced foods.",
          "Avoid smoking or exposure to secondhand smoke.",
          "Do not take antibiotics without a physician's prescription (most colds are viral).",
          "Avoid talking excessively if you have hoarseness or laryngitis."
        ];
        whenToSeeDoctor = `Consult a doctor if your cough lasts more than 2-3 weeks, is accompanied by high fever, wheezing, shortness of breath, or if you cough up blood or thick yellow/green mucus.`;
      } else if (msg.includes("headache") || msg.includes("migraine") || msg.includes("head pain")) {
        symptom = "Headache / Migraine";
        possibleCauses = "Tension, stress, lack of sleep, dehydration, sinus pressure, or migraine triggers.";
        dos = [
          "Rest in a quiet, dark room with your eyes closed.",
          "Apply a cold compress or ice pack wrapped in a cloth to your forehead or temples.",
          "Drink plenty of water to rule out dehydration.",
          "Practice deep breathing or gentle neck stretches."
        ];
        donts = [
          "Avoid staring at screens (mobiles, laptops, TV) as blue light worsens headaches.",
          "Do not skip meals, as low blood sugar can trigger headaches.",
          "Avoid high caffeine intake or alcohol.",
          "Do not abuse over-the-counter painkillers, which can lead to medication-overuse headaches."
        ];
        whenToSeeDoctor = "See a doctor if the headache is sudden and extremely severe (like a 'thunderclap'), is accompanied by fever, stiff neck, confusion, double vision, numbness, or difficulty speaking.";
      } else if (msg.includes("stomach") || msg.includes("pain") || msg.includes("belly") || msg.includes("cramp") || msg.includes("diarrhea") || msg.includes("vomit")) {
        symptom = "Stomach Pain / Gastrointestinal Distress";
        possibleCauses = "Indigestion, food poisoning, acidity, gas, viral gastroenteritis (stomach flu), or muscle strain.";
        dos = [
          "Eat light, bland foods (like rice, bananas, applesauce, toast - BRAT diet).",
          "Sip clear liquids (water, ORS, coconut water) frequently to prevent dehydration.",
          "Apply a warm heating pad to your abdomen to relieve cramps.",
          "Rest in a comfortable position."
        ];
        donts = [
          "Avoid dairy products, spicy, greasy, or highly fried foods.",
          "Do not drink carbonated beverages, caffeine, or alcohol.",
          "Do not take self-prescribed stomach painkillers, as they can irritate the stomach lining.",
          "Do not eat heavy meals until the stomach symptoms subside."
        ];
        whenToSeeDoctor = "Go to the hospital if the pain is severe and localized (especially bottom right side of abdomen), if you cannot keep liquids down, if there is blood in your stool or vomit, or if you run a high fever.";
      } else {
        symptom = "General Wellness Consultation";
        possibleCauses = "Lifestyle fatigue, mild immune response, seasonal shifts, or stress factors.";
        dos = [
          "Maintain a regular sleep schedule (7-8 hours of sound sleep).",
          "Stay hydrated by drinking at least 8-10 glasses of water daily.",
          "Eat a balanced diet rich in vitamins, proteins, and fibers.",
          "Practice daily light exercises or mindfulness to manage stress."
        ];
        donts = [
          "Do not self-diagnose or self-medicate with strong drugs.",
          "Avoid excessive consumption of processed foods, sugars, and stimulants.",
          "Do not ignore persistent mild symptoms that continue for over a week.",
          "Avoid high stress levels and make sure to take regular rest breaks."
        ];
        whenToSeeDoctor = "You should schedule a consultation with one of our physicians if you feel your symptoms are worsening, if home care does not bring relief within 3-4 days, or if you experience any sudden severe changes in your health.";
      }

      const replyMarkdown = `### 🩺 Astra AI Symptom Triage: ${symptom}

Hello **${userName}**, based on your registered patient profile (**${userGender}**, Blood Group **${userBlood}**), here is your personalized clinical triage care plan:

${userCondition !== 'None' && userCondition !== '' ? `> ⚠️ **Profile Alert:** Your existing medical condition of **${userCondition}** and allergies to **${userAllergies}** have been factored into these recommendations.` : ''}

#### 🔍 Possible Causes
- ${possibleCauses}

#### ✅ Do's (Dos)
${dos.map(item => `- ${item}`).join('\n')}

#### ❌ Don'ts (Don'ts)
${donts.map(item => `- ${item}`).join('\n')}

#### 🚨 When to See a Doctor
- ${whenToSeeDoctor}

*Note: This is an automated symptom triage guidance. If you feel unwell or require immediate assistance, please book an appointment with our specialist doctors or contact the CU Health Center.*`;

      return {
        reply: replyMarkdown,
        sessionId: sessionId || 'mock-session-abc'
      };
    },
    resetChat: async (sessionId) => {
      await delay(200);
      return { sessionId: 'mock-session-new' };
    },
    queryChat: async (message, sessionId) => {
      await delay(500);
      return {
        reply: `Here is a structured overview of your query regarding "${message}". Seek immediate medical attention if you experience severe symptoms like shortness of breath or high fever.`
      };
    },
    resetQueryChat: async (sessionId) => {
      await delay(100);
      return { sessionId: 'mock-session-query-new' };
    },
    analyzeConsultation: async ({ transcript }) => {
      await delay(800);
      return {
        reply: `### Astra AI Diagnostic Scribe\n- **Symptoms noted:** Mild congestion, throat itchiness.\n- **Suggested therapy:** Warm water gargles and oral antihistamine.\n- **Next Steps:** Follow up if fever develops.`
      };
    },
    getCarePlan: async () => {
      await delay(200);
      return {
        data: '### Personal Care Directive\n1. **Hydration**: Drink 3L warm fluids daily.\n2. **Monitoring**: Record daily body temperature.\n3. **Activity**: 15 minutes of light morning breathing exercises.'
      };
    },
    compareReports: async () => {
      await delay(400);
      return {
        data: {
          comparison: 'No significant deviation found from the previous report. General parameters remain excellent.'
        }
      };
    },
    analyzePatientReports: async () => {
      await delay(800);
      const db = getDb();
      const token = localStorage.getItem('MedAstraX_token') || localStorage.getItem('MedAstraX_token');
      const userId = token ? token.split('mock-jwt-token-for-')[1] : 'patient-123';
      const idx = db.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        db.users[idx].expPoints = (db.users[idx].expPoints || 0) + 150;
        db.users[idx].healthBadge = 'Distinguished Guardian';
        db.users[idx].lastAnalysis = 'AI analysis confirms excellent progress in recovery. 150 MedCoins rewarded!';
        saveDb(db);
        return {
          expPoints: db.users[idx].expPoints,
          healthBadge: db.users[idx].healthBadge,
          comparison: db.users[idx].lastAnalysis,
          carePlan: '### Updated AI Care Directives\n- 1. Maintain balanced hydration.\n- 2. Perform 15-minute walks daily.'
        };
      }
      return {};
    },
    analyzeBodySymptoms: async (payload) => {
      await delay(600);
      const db = getDb();
      const token = localStorage.getItem('MedAstraX_token') || localStorage.getItem('MedAstraX_token');
      const userId = token ? token.split('mock-jwt-token-for-')[1] : 'patient-123';
      const user = db.users.find(u => u.id === userId) || db.users[0] || {};

      const symptoms = payload?.symptoms || [];
      const bodyPartsList = symptoms.map(s => s.bodyPart).filter(Boolean).join(', ') || 'General Body Area';
      
      const detailedSection = symptoms.length > 0 
        ? symptoms.map(s => `- **Region:** ${s.bodyPart}\n  - **Severity:** ${s.severity}/10 | **Duration:** ${s.duration}${s.description ? `\n  - **Notes:** "${s.description}"` : ''}`).join('\n\n')
        : '- General discomfort reported.';

      const medicationInfo = payload?.onMedication 
        ? `\n\n> 💊 **Active Medication Noted:** ${payload.prescriptionDetails || 'Current medication in progress.'}` 
        : '';

      const maxSeverity = symptoms.reduce((max, s) => Math.max(max, s.severity || 0), 0);
      const riskBadge = maxSeverity >= 8 
        ? '🔴 High Severity (Doctor Consultation Recommended)' 
        : maxSeverity >= 5 
          ? '🟡 Moderate Risk' 
          : '🟢 Low Risk (Home Care Advisable)';

      const analysisText = `### 🩺 Astra AI 2D Body Symptom Assessment & Triage

**Patient:** ${user.name || 'Naina Kumari'} (${user.gender || 'Female'}, Age ${user.age || 19}, Blood Group ${user.bloodGroup || 'B+'})
**Assessed Body Regions:** ${bodyPartsList}
**Triage Risk Level:** ${riskBadge}${medicationInfo}

#### 🔍 Region-by-Region Breakdown
${detailedSection}

#### 📋 Clinical Recommendations & Care Directives
1. **Targeted Relief:** Apply local warm/cold compresses to affected areas depending on whether you experience muscle tension or swelling.
2. **Hydration & Rest:** Drink at least 8-10 glasses of water daily and avoid heavy physical strain for the next 2-3 days.
3. **Symptom Monitoring:** Track your body temperature and pain levels. If pain increases, consult a specialist.
4. **Physician Consultation:** We recommend booking an appointment with **Dr. Aditya Sharma** (General Physician) at **CU Health Center** (0.2 km away) for a thorough in-person evaluation.

---
*Note: This report is generated by Astra AI for preliminary triage purposes. For acute emergencies, please trigger Emergency SOS.*`;

      return {
        success: true,
        analysis: analysisText,
        model: 'AstraMedX 2D Triage Engine v4.2'
      };
    },
    assessSkinCare: async (data) => {
      await delay(600);
      return {
        data: {
          reply: '### Astra Derm Triage\n- Aspect: Dry skin scaling detected.\n- Directives: Apply mild moisturizer twice daily, drink sufficient fluids, and avoid hot showers.'
        }
      };
    }
  },

  rewards: {
    updateChecklist: async (data) => {
      await delay(300);
      const db = getDb();
      const token = localStorage.getItem('MedAstraX_token') || localStorage.getItem('MedAstraX_token');
      const userId = token ? token.split('mock-jwt-token-for-')[1] : 'patient-123';
      const idx = db.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        db.users[idx].medsChecked = data.medsChecked;
        db.users[idx].dietChecked = data.dietChecked;
        db.users[idx].exerciseChecked = data.exerciseChecked;
        let points = 0;
        if (data.medsChecked) points += 20;
        if (data.dietChecked) points += 20;
        if (data.exerciseChecked) points += 20;
        db.users[idx].expPoints = (db.users[idx].expPoints || 850) + points;
        saveDb(db);
        return {
          message: `Checklist updated! Earned MedCoins!`,
          data: db.users[idx]
        };
      }
      return { message: 'Checklist updated', data: {} };
    },
    getLeaderboard: async () => {
      await delay(300);
      const db = getDb();
      return { data: db.leaderboard };
    }
  },

  emergency: {
    triggerSOS: async (data) => {
      await delay(400);
      const studentName = data.studentName || data.name || 'Rashika';
      const studentUid = data.studentUid || data.uid || '24BCF10024';
      const phone = data.emergencyPhone || data.phone || '7988766566';
      const hospitalName = data.hospitalName || 'CU Health Center';
      const trackingLink = data.trackingLink || 'http://localhost:5173/track-ambulance';

      const smsText = `🚨 MEDASTRAX EMERGENCY SOS ALERT! Student ${studentName} (${studentUid}) triggered an SOS at CU Campus (${data.userLatitude || 30.7686}, ${data.userLongitude || 76.5754}). Selected Facility: ${hospitalName}. Campus Ambulance Unit AMB-CU-108 dispatched. Track Live: ${trackingLink}`;
      
      console.log(`[TWILIO SMS DISPATCHED] To: ${phone} | Body: ${smsText}`);
      console.log(`[TWILIO VOICE CALL DISPATCHED] Calling Emergency Contact: ${phone} | Voice Script: "Emergency SOS Alert! Student ${studentName} has triggered an SOS inside Chandigarh University Campus. Campus Ambulance AMB-CU-108 has been dispatched to ${hospitalName}. Please press 1 to connect with Campus Medical Officer."`);

      return {
        success: true,
        message: 'SOS Alarm triggered! Twilio SMS & Voice Call dispatched to Emergency Contact.',
        ambulanceId: 'AMB-CU-108',
        driverName: 'Harpreet Singh (CU Campus Response)',
        driverPhone: '+91 98722 44108',
        data: {
          twilioSmsStatus: 'DELIVERED',
          twilioCallStatus: 'CONNECTED & CALLING',
          sentTo: phone,
          messageBody: smsText
        }
      };
    }
  },
  vaccination: {
    getVaccines: async () => {
      await delay(200);
      const db = getDb();
      return db.vaccines || defaultDb.vaccines;
    },
    getPatientVaccinations: async (patientId) => {
      await delay(250);
      const db = getDb();
      const records = (db.patientVaccinations || defaultDb.patientVaccinations).filter(
        r => !patientId || String(r.patientId) === String(patientId)
      );
      return records;
    },
    bookVaccination: async (data) => {
      await delay(500);
      const db = getDb();
      const newVaxRecord = {
        id: `pv-${Date.now()}`,
        patientId: data.patientId || 'student-10013',
        patientName: data.patientName || 'Naina Kumari',
        vaccineId: data.vaccineId,
        vaccineName: data.vaccineName,
        brand: data.brand || data.vaccineName,
        doseNumber: data.doseNumber || 1,
        totalDoses: data.totalDoses || 1,
        hospitalId: data.hospitalId,
        hospitalName: data.hospitalName,
        hospitalAddress: data.hospitalAddress || 'Chandigarh University Campus, Gharuan',
        date: data.date,
        timeSlot: data.timeSlot,
        doctorName: data.doctorName || 'Dr. Aditya Sharma',
        status: 'SCHEDULED',
        certificateNo: `CU-VAX-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        pricePaid: data.pricePaid || 'Paid'
      };

      if (!db.patientVaccinations) db.patientVaccinations = [];
      db.patientVaccinations.push(newVaxRecord);

      const newBooking = {
        id: Date.now(),
        patientId: data.patientId || 'student-10013',
        patientName: data.patientName || 'Naina Kumari',
        doctorId: 1,
        doctorName: data.doctorName || 'Dr. Aditya Sharma',
        hospitalId: data.hospitalId,
        hospitalName: data.hospitalName,
        date: data.date,
        bookingDate: data.date,
        timeSlot: data.timeSlot,
        type: 'VACCINATION',
        status: 'CONFIRMED',
        paymentMethod: data.paymentMethod || 'UPI',
        paymentStatus: 'PAID',
        vaccineName: data.vaccineName,
        doseNumber: data.doseNumber || 1,
        totalDoses: data.totalDoses || 1,
        symptoms: `Vaccination: ${data.vaccineName} (Dose ${data.doseNumber || 1}/${data.totalDoses || 1})`,
        notes: `Vaccination Appointment scheduled at ${data.hospitalName}.`,
        aiReport: `### Astra Vaccination Appointment\n- Vaccine: ${data.vaccineName}\n- Dose: ${data.doseNumber || 1} of ${data.totalDoses || 1}\n- Location: ${data.hospitalName}\n- Status: Confirmed`
      };

      if (!db.bookings) db.bookings = [];
      db.bookings.push(newBooking);

      const newNotification = {
        id: `n-vax-book-${Date.now()}`,
        title: 'Vaccination Scheduled \ud83d\udc89',
        message: `Your appointment for ${data.vaccineName} (Dose ${data.doseNumber || 1}) is confirmed at ${data.hospitalName} on ${data.date} at ${data.timeSlot}.`,
        date: new Date().toISOString(),
        read: false
      };
      if (!db.notifications) db.notifications = [];
      db.notifications.push(newNotification);

      saveDb(db);
      return { message: 'Vaccination appointment booked successfully!', data: newVaxRecord };
    }
  },

  camp: {
    getAll: async () => {
      await delay(200);
      const db = getDb();
      return db.camps || [
        {
          id: 'camp-1',
          title: 'Campus Free Eye & Dental Checkup Camp',
          date: '2026-08-10',
          timeSlot: '10:00 AM - 04:00 PM',
          venue: 'CU Auditorium Hall 2',
          targetAudience: 'All Students & Faculty',
          description: 'Comprehensive vision testing, oral screening, and free consultations by Max Hospital specialists.',
          status: 'SCHEDULED',
          createdAt: new Date().toISOString()
        }
      ];
    },
    create: async (data) => {
      await delay(300);
      const db = getDb();
      if (!db.camps) db.camps = [];
      const newCamp = {
        id: 'camp-' + Date.now(),
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
        ...data
      };
      db.camps.unshift(newCamp);

      const noticeTitle = `📢 Health Camp: ${newCamp.title}`;
      const noticeMsg = `Scheduled for ${newCamp.date} (${newCamp.timeSlot}) at ${newCamp.venue}. Target: ${newCamp.targetAudience}. Details: ${newCamp.description}`;
      
      const newNotice = {
        id: 'n-camp-' + Date.now(),
        title: noticeTitle,
        message: noticeMsg,
        date: new Date().toISOString(),
        read: false
      };

      if (!db.notifications) db.notifications = [];
      db.notifications.unshift(newNotice);

      const userKeys = ['patient-123', 'student-10013', 'doctor-123', 'pharmacy-123', 'hospital-123'];
      userKeys.forEach(uid => {
        const key = `medastrax_notifications_${uid}`;
        try {
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          existing.unshift(newNotice);
          localStorage.setItem(key, JSON.stringify(existing));
        } catch (e) {
          console.warn('Failed to update local notifications for user', uid);
        }
      });

      localStorage.setItem('MedAstraX_latest_camp', JSON.stringify(newCamp));
      saveDb(db);
      return newCamp;
    },
    delete: async (id) => {
      await delay(200);
      const db = getDb();
      if (db.camps) {
        db.camps = db.camps.filter(c => c.id !== id);
        saveDb(db);
      }
      return { message: 'Camp deleted successfully' };
    }
  }
};
