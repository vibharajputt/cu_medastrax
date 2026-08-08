


CREATE TYPE user_role AS ENUM ('PATIENT', 'DOCTOR', 'PHARMACY', 'LAB', 'HOSPITAL', 'ADMIN', 'FACULTY');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'PATIENT',
    phone VARCHAR(15),
    dob DATE,
    age INT,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    emergency_number VARCHAR(15),
    college_uid VARCHAR(50),
    is_hosteller BOOLEAN DEFAULT FALSE,
    hostel_name VARCHAR(100),
    room_number VARCHAR(20),
    exp_points INT DEFAULT 0,
    referral_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50), -- Government, Private, CU On-C
    rating NUMERIC(2,1) DEFAULT 4.5,
    distance_km NUMERIC(4,1),
    address TEXT NOT NULL,
    city VARCHAR(50) DEFAULT 'Mohali',
    phone VARCHAR(20),
    available_beds INT DEFAULT 10,
    total_beds INT DEFAULT 50,
    emergency_services BOOLEAN DEFAULT TRUE,
    icu_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    hospital_id INT REFERENCES hospitals(id) ON DELETE SET NULL,
    experience_years INT DEFAULT 5,
    rating NUMERIC(2,1) DEFAULT 4.8,
    review_count INT DEFAULT 0,
    consultation_fee NUMERIC(8,2) DEFAULT 0.00,
    availability_status VARCHAR(50) DEFAULT 'AVAILABLE',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    hospital_id INT REFERENCES hospitals(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status booking_status DEFAULT 'CONFIRMED',
    symptoms TEXT,
    meeting_link TEXT,
    user_rating INT,
    user_review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id INT REFERENCES users(id) ON DELETE CASCADE,
    diagnosis TEXT NOT NULL,
    medicines JSONB NOT NULL, -- Array of {name, dosage, frequency, duration}
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS pharmacy_orders (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES users(id) ON DELETE CASCADE,
    prescription_id INT REFERENCES prescriptions(id) ON DELETE SET NULL,
    items JSONB NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'UPI',
    status order_status DEFAULT 'PENDING',
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS health_camps (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    camp_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    venue VARCHAR(150) NOT NULL,
    target_audience VARCHAR(100) DEFAULT 'All Students & Faculty',
    description TEXT,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INT REFERENCES users(id) ON DELETE CASCADE,
    referred_student_name VARCHAR(100) NOT NULL,
    referred_college_uid VARCHAR(50) NOT NULL,
    points_earned INT DEFAULT 100,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Demo Admin & Student Users
INSERT INTO users (uid, name, email, password_hash, role, phone, dob, gender, blood_group, emergency_number, college_uid, is_hosteller, hostel_name, room_number, exp_points, referral_code)
VALUES 
('student-10024', 'Rashika', '24bcf10024@cuchd.in', 'Rashika123', 'PATIENT', '7988766566', '2006-09-21', 'Female', 'A-', '7988766566', '24BCF10024', TRUE, 'Sukhna Girls Hostel', '503', 900, 'REF-24BCF10024'),
('student-10002', 'Tanveer', '24BCF10002@cuchd.in', 'Tanveer123', 'PATIENT', '9041990211', '2007-01-13', 'Female', 'A-', '9041990211', '24BCF10002', FALSE, 'Day Scholar', 'N/A', 850, 'REF-24BCF10002'),
('student-10088', 'Aarav Sharma', '24bcf10088@cuchd.in', 'Aarav123', 'PATIENT', '9876543210', '2006-03-15', 'Male', 'O+', '9876543210', '24BCF10088', TRUE, 'Nek Chand Hostel', '204', 950, 'REF-24BCF10088'),
('student-10099', 'Priya Verma', '24bcf10099@cuchd.in', 'Priya123', 'PATIENT', '9812345678', '2006-11-04', 'Female', 'B+', '9812345678', '24BCF10099', TRUE, 'Rock Garden Hostel', '112', 780, 'REF-24BCF10099'),
('student-10105', 'Rohan Gupta', '24bcf10105@cuchd.in', 'Rohan123', 'PATIENT', '9765432109', '2006-07-28', 'Male', 'AB+', '9765432109', '24BCF10105', FALSE, 'Day Scholar', 'N/A', 820, 'REF-24BCF10105'),
('student-10013', 'Naina Kumari', 'naina24bcf10013@cuchd.in', 'student123', 'PATIENT', '9876543210', '2006-09-21', 'Female', 'B+', '9988776655', '24BCF10013', TRUE, 'PG-3 Hostel', '301', 950, 'REF-24BCF10013'),
('admin-123', 'CU System Admin', 'admin@cuchd.in', 'admin123', 'ADMIN', '9800000000', '1990-01-01', 'Male', 'O+', '9800000000', 'CU-ADMIN-01', FALSE, 'N/A', 'N/A', 1000, 'REF-ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Seed Initial Demo Hospitals
INSERT INTO hospitals (name, type, rating, distance_km, address, city, phone, available_beds, total_beds, emergency_services, icu_available)
VALUES
('CU Health Center', 'On-Campus Clinic', 4.8, 0.2, 'Chandigarh University Campus, Gharuan', 'Gharuan', '+91 172 233 4455', 15, 50, TRUE, TRUE),
('Max Super Speciality Hospital', 'Private Multispecialty', 4.5, 12.4, 'Phase 6, Near Civil Hospital, Mohali', 'Mohali', '+91 172 554 8888', 42, 200, TRUE, TRUE),
('Fortis Hospital Mohali', 'Private Multispecialty', 4.6, 15.1, 'Sector 62, Phase VIII, Mohali', 'Mohali', '+91 172 469 2222', 30, 180, TRUE, TRUE),
('Alpha Chandigarh Multispecialty Hospital', 'Private Multispecialty', 4.8, 1.2, 'Chandigarh-Ludhiana Highway, Gharuan', 'Kharar', '+91 160 500 1200', 28, 80, TRUE, TRUE)
ON CONFLICT DO NOTHING;
