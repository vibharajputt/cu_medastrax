-- PostgreSQL Schema Setup for MedAstraX Faculty Portal

-- 1. Table for Faculty Members
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255) DEFAULT 'Computer Science',
    phone VARCHAR(20),
    dob DATE,
    age INT,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    emergency_number VARCHAR(20),
    is_faculty BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table for Occupational Checkup Bookings
CREATE TABLE IF NOT EXISTS faculty_checkup_bookings (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    checkup_frequency VARCHAR(50) NOT NULL, -- 'monthly' or '2-monthly'
    center_name VARCHAR(255) NOT NULL, -- 'CU Health Center' or 'Max Hospital'
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'CONFIRMED', -- 'CONFIRMED', 'CANCELLED', 'COMPLETED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table for Faculty Health Benefits
CREATE TABLE IF NOT EXISTS faculty_health_benefits (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(100) REFERENCES faculty_profiles(id) ON DELETE CASCADE,
    benefit_name VARCHAR(255) NOT NULL,
    voucher_code VARCHAR(100) UNIQUE NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_faculty_checkups_patient ON faculty_checkup_bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_faculty_benefits_patient ON faculty_health_benefits(patient_id);

-- Insert dummy Faculty Profile data for Naina Kumari (if tested)
INSERT INTO faculty_profiles (id, name, email, department, phone, dob, age, gender, blood_group, emergency_number, is_faculty)
VALUES (
    'student-10013', 
    'Naina Kumari', 
    'naina24bcf10013@cuchd.in', 
    'Computer Science & Engineering', 
    '9876543210', 
    '2006-09-21', 
    19, 
    'Female', 
    'B+', 
    '9988776655', 
    TRUE
) ON CONFLICT (id) DO UPDATE SET is_faculty = TRUE;

-- 4. Table for Medgamma Generic Alternatives
CREATE TABLE IF NOT EXISTS generic_alternatives (
    id SERIAL PRIMARY KEY,
    chemical_formula VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) UNIQUE NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    price_brand DECIMAL(10,2) NOT NULL,
    price_generic DECIMAL(10,2) NOT NULL,
    bioequivalence VARCHAR(50) DEFAULT '99.5%',
    fda_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generic_brand ON generic_alternatives(brand_name);

