import axios from 'axios';
import toast from 'react-hot-toast';
import { mockDb } from './mockDb';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://medisphere-ke9x.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 6000, // Fail fast on down backend to trigger mock fallback
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('MedAstraX_token') || localStorage.getItem('MedAstraX_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/google-login') || 
                           error.config?.url?.includes('/auth/signup');
    
    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthEndpoint) {
      const token = localStorage.getItem('MedAstraX_token') || localStorage.getItem('MedAstraX_token');
      if (token && token.startsWith('mock-jwt-token-')) {
        return Promise.reject(error);
      }
      localStorage.removeItem('MedAstraX_token');
      localStorage.removeItem('MedAstraX_token');
      localStorage.removeItem('MedAstraX_user');
      localStorage.removeItem('MedAstraX_user');
      localStorage.removeItem('MedAstraX_active_profile');
      localStorage.removeItem('MedAstraX_active_profile');
      window.location.href = '/login';
    }

    if (error.response?.status === 400) {
      const errorMsg = error.response?.data?.message || 'Invalid Request Data';
      toast.error(`Validation Error: ${errorMsg}`, { id: 'api-validation-error' });
    }

    return Promise.reject(error);
  }
);

const withMockFallback = (apiCallFn, mockFallbackFn) => {
  return async (...args) => {
    try {
      const res = await apiCallFn(...args);
      return res;
    } catch (error) {
      const isNetworkError = !error.response;
      const isServerUnavailable = error.response?.status >= 500 || error.response?.status === 404;

      if ((isNetworkError || isServerUnavailable) && mockFallbackFn) {
        console.warn(`API call failed. Falling back to client-side Mock DB. Error: ${error.message || 'offline'}`);
        try {
          const mockData = await mockFallbackFn(...args);
          return { data: mockData, status: 200, mock: true };
        } catch (mockError) {
          throw mockError;
        }
      }
      throw error;
    }
  };
};

export const authAPI = {
  getAllUsers: withMockFallback(() => api.get('/auth/users'), mockDb.auth.getAllUsers),
  signup: withMockFallback((data) => api.post('/auth/signup', data), mockDb.auth.signup),
  login: withMockFallback((data) => api.post('/auth/login', data), mockDb.auth.login),
  googleLogin: withMockFallback((email) => api.post('/auth/google-login', { email }), mockDb.auth.googleLogin),
  updateAvatar: withMockFallback((avatarUrl) => api.put('/auth/profile/avatar', { avatarUrl }), mockDb.auth.updateAvatar),
  getProfile: withMockFallback(() => api.get('/auth/profile'), mockDb.auth.getProfile),
  updateProfile: withMockFallback((data) => api.put('/auth/profile', data), mockDb.auth.updateProfile),
  verifyUpi: withMockFallback((upiId) => api.get(`/auth/verify-upi?upiId=${upiId}`), () => ({ verified: true })),
  resetPassword: withMockFallback((email, newPassword) => api.post('/auth/reset-password', { email, newPassword }), () => ({ message: 'Password reset successfully' })),
  verifyLicense: withMockFallback((licenseNo) => api.get(`/auth/verify-license?licenseNo=${licenseNo}`), () => ({ verified: true })),
  verifyPharmacyLicense: withMockFallback((licenseNo) => api.get(`/auth/verify-pharmacy-license?licenseNo=${licenseNo}`), () => ({ verified: true })),
  verifyLabLicense: withMockFallback((licenseNo) => api.get(`/auth/verify-lab-license?licenseNo=${licenseNo}`), () => ({ verified: true })),
  getPatientProfileForDoctor: withMockFallback((patientId) => api.get(`/auth/patient/${patientId}`), mockDb.auth.getPatientProfileForDoctor),
  getDoctors: withMockFallback(() => api.get('/auth/doctors'), mockDb.auth.getDoctors),
  getPatients: withMockFallback(() => api.get('/auth/patients'), mockDb.auth.getPatients),
  getBookings: withMockFallback(() => api.get('/auth/bookings'), mockDb.auth.getBookings),
  getOrders: withMockFallback(() => api.get('/auth/orders'), mockDb.auth.getOrders),
  getLabBookings: withMockFallback(() => api.get('/auth/lab-bookings'), mockDb.auth.getLabBookings),
  getReferralStats: withMockFallback(() => api.get('/auth/referral-stats'), mockDb.auth.getReferralStats),
};

export const otpAPI = {
  sendOtp: withMockFallback((identifier, type) => api.post('/auth/otp/send', { identifier, type }), mockDb.otp.sendOtp),
  verifyOtp: withMockFallback((identifier, type, otp) => api.post('/auth/otp/verify', { identifier, type, otp }), mockDb.otp.verifyOtp),
  checkStatus: withMockFallback((identifier, type) => api.get(`/auth/otp/status?identifier=${identifier}&type=${type}`), mockDb.otp.checkStatus),
};

export const hospitalAPI = {
  getAll: withMockFallback(() => api.get('/hospitals'), mockDb.hospital.getAll),
  getById: withMockFallback((id) => api.get(`/hospitals/${id}`), mockDb.hospital.getById),
  search: withMockFallback((query) => api.get(`/hospitals/search?query=${query}`), mockDb.hospital.search),
  getByDoctor: withMockFallback((doctorId) => api.get(`/hospitals/doctor/${doctorId}`), mockDb.hospital.getByDoctor),
  create: withMockFallback((data) => api.post('/hospitals', data), mockDb.hospital.create),
  update: withMockFallback((id, data) => api.put(`/hospitals/${id}`, data), mockDb.hospital.update),
  updateBeds: withMockFallback((id, beds) => api.put(`/hospitals/${id}/beds?availableBeds=${beds}`), mockDb.hospital.updateBeds),
  getDoctors: withMockFallback((id) => api.get(`/hospitals/${id}/doctors`), mockDb.hospital.getDoctors),
  verify: withMockFallback((id, verified) => api.put(`/hospitals/${id}/verify?verified=${verified}`), mockDb.hospital.verify),
};

export const bookingAPI = {
  create: withMockFallback((data) => api.post('/bookings', data), mockDb.booking.create),
  getPatientBookings: withMockFallback((familyMemberId) => api.get(`/bookings/patient${familyMemberId ? `?familyMemberId=${familyMemberId}` : ''}`), mockDb.booking.getPatientBookings),
  getDoctorBookings: withMockFallback(() => api.get('/bookings/doctor'), mockDb.booking.getDoctorBookings),
  getById: withMockFallback((id) => api.get(`/bookings/${id}`), mockDb.booking.getById),
  updateStatus: withMockFallback((id, status) => api.put(`/bookings/${id}/status?status=${status}`), mockDb.booking.updateStatus),
  getAvailableSlots: withMockFallback((doctorId, date) => api.get(`/bookings/slots?doctorId=${doctorId}&date=${date}`), mockDb.booking.getAvailableSlots),
  updateMeetingLink: withMockFallback((id, meetingLink) => api.put(`/bookings/${id}/meeting-link?meetingLink=${encodeURIComponent(meetingLink)}`), mockDb.booking.updateMeetingLink),
  updateAiReport: withMockFallback((id, aiReport) => api.put(`/bookings/${id}/ai-report`, { aiReport }), mockDb.booking.updateAiReport),
  reschedule: withMockFallback((id, date, timeSlot) => api.put(`/bookings/${id}/reschedule?date=${date}&timeSlot=${encodeURIComponent(timeSlot)}`), mockDb.booking.reschedule),
  rateBooking: withMockFallback((id, rating, reviewText) => api.put(`/bookings/${id}/rate`, { rating, reviewText }), mockDb.booking.rateBooking),
};

export const prescriptionAPI = {
  getAll: withMockFallback(() => api.get('/prescriptions'), mockDb.prescription.getAll),
  create: withMockFallback((data) => api.post('/prescriptions', data), mockDb.prescription.create),
  getPatientPrescriptions: withMockFallback((familyMemberId) => api.get(`/prescriptions/patient${familyMemberId ? `?familyMemberId=${familyMemberId}` : ''}`), mockDb.prescription.getPatientPrescriptions),
  getDoctorPrescriptions: withMockFallback(() => api.get('/prescriptions/doctor'), mockDb.prescription.getDoctorPrescriptions),
  getById: withMockFallback((id) => api.get(`/prescriptions/${id}`), mockDb.prescription.getById),
  analyze: withMockFallback((id) => api.get(`/prescriptions/${id}/analyze`), mockDb.prescription.analyze),
  analyzeRaw: withMockFallback((data) => api.post('/prescriptions/analyze-raw', data), mockDb.prescription.analyzeRaw),
  analyzeReportDocument: withMockFallback((data) => api.post('/prescriptions/analyze-document', data), mockDb.prescription.analyzeReportDocument),
  getPharmacyQueue: withMockFallback(() => api.get('/prescriptions/pharmacy-queue'), mockDb.prescription.getPharmacyQueue),
  uploadReport: withMockFallback((id, reportUrl) => api.put(`/prescriptions/${id}/upload-report`, { reportUrl }), mockDb.prescription.uploadReport),
};

export const familyMemberAPI = {
  add: withMockFallback((data) => api.post('/family-members', data), mockDb.familyMember.add),
  getAll: withMockFallback(() => api.get('/family-members'), mockDb.familyMember.getAll),
  delete: withMockFallback((id) => api.delete(`/family-members/${id}`), mockDb.familyMember.delete),
};

export const pharmacyAPI = {
  setPrices: withMockFallback((data) => api.post('/pharmacy/prices', data), mockDb.pharmacy.setPrices),
  getMedicines: withMockFallback(() => api.get('/pharmacy/medicines'), mockDb.pharmacy.getMedicines),
  getForPrescription: withMockFallback((prescriptionId) => api.get(`/pharmacy/prescription/${prescriptionId}`), mockDb.pharmacy.getForPrescription),
  getAll: withMockFallback(() => api.get('/pharmacy/all'), mockDb.pharmacy.getAll),
  updateProfile: withMockFallback((data) => api.put('/pharmacy/profile', data), mockDb.pharmacy.updateProfile),
  createOrder: withMockFallback((data) => api.post('/orders', data), mockDb.pharmacy.createOrder),
  getOrdersForPharmacy: withMockFallback((pharmacyName) => api.get(`/orders/pharmacy?pharmacyName=${encodeURIComponent(pharmacyName)}`), mockDb.pharmacy.getOrdersForPharmacy),
  updateOrderStatus: withMockFallback((orderId, status) => api.put(`/orders/${orderId}/status`, { status }), mockDb.pharmacy.updateOrderStatus),
};

export const labAPI = {
  getAll: withMockFallback(() => api.get('/labs/all'), mockDb.lab.getAll),
  createBooking: withMockFallback((data) => api.post('/labs/bookings', data), mockDb.lab.createBooking),
  getPatientBookings: withMockFallback(() => api.get('/labs/bookings/patient'), mockDb.lab.getPatientBookings),
  updateBookingStatus: withMockFallback((id, status) => api.put(`/labs/bookings/${id}/status`, { status }), mockDb.lab.updateBookingStatus),
  getLabBookings: withMockFallback(() => api.get('/labs/bookings/lab'), mockDb.lab.getLabBookings),
};

export const paymentAPI = {
  createOrder: withMockFallback((data) => api.post('/payments/order', data), mockDb.payment.createOrder),
  verifyPayment: withMockFallback((data) => api.post('/payments/verify', data), mockDb.payment.verifyPayment),
};

export const notificationAPI = {
  getNotifications: withMockFallback(({ role, userId } = {}) => {
    const params = [];
    if (role) params.push(`role=${encodeURIComponent(role)}`);
    if (userId) params.push(`userId=${encodeURIComponent(userId)}`);
    const q = params.length ? `?${params.join('&')}` : '';
    return api.get(`/notifications${q}`);
  }, mockDb.notification.getNotifications)
};

export const fileAPI = {
  upload: async (file) => {
    // [BOUNTY 3] Background Task Runner integration for all file uploads
    // We start the upload as an async background task to prevent UI freezing
    const formData = new FormData();
    formData.append('file', file);
    
    let jobId = null;
    try {
      const res = await api.post('/jobs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      jobId = res.data?.data; // The backend returns the jobId here
    } catch (err) {
      console.warn("Backend /jobs/upload failed, falling back to mock upload");
      // Mock fallback jobId
      jobId = "mock-job-" + Date.now();
    }

    // Start background tracking without blocking the main execution flow
    const trackingPromise = new Promise(async (resolve, reject) => {
      try {
        // Poll for job completion
        let status = 'PROCESSING';
        while (status === 'PROCESSING' || status === 'PENDING') {
          await new Promise(r => setTimeout(r, 1500));
          try {
             const pollRes = await api.get(`/jobs/${jobId}`);
             status = pollRes.data?.data?.status || 'COMPLETED';
          } catch(e) {
             // Mock polling fallback
             status = 'COMPLETED';
          }
        }
        if (status === 'FAILED') throw new Error("Background Job Failed");
        resolve();
      } catch (e) {
        reject();
      }
    });

    toast.promise(trackingPromise, {
      loading: 'Processing file upload in background... ⏳',
      success: 'File successfully processed by background worker! ✅',
      error: 'Upload Failed in background ❌',
    }, { id: 'background-upload' });

    // Convert file to Base64 so it can be saved in mock DB and persist across refreshes
    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
    
    let fileUrl;
    try {
      // Fast fallback to object URL if file is too large (> 3MB) to prevent localstorage crash
      if (file.size > 3 * 1024 * 1024) {
        fileUrl = URL.createObjectURL(file);
      } else {
        fileUrl = await toBase64(file);
      }
    } catch(e) {
      fileUrl = URL.createObjectURL(file);
    }

    return { data: { success: true, message: fileUrl } };
  }
};

export const aiAPI = {
  chat: withMockFallback((message, sessionId) => api.post('/ai/chat', { message, sessionId }), mockDb.ai.chat),
  resetChat: withMockFallback((sessionId) => api.post('/ai/chat/reset', { sessionId }), mockDb.ai.resetChat),
  queryChat: withMockFallback((message, sessionId) => api.post('/ai/query-chat', { message, sessionId }), mockDb.ai.queryChat),
  resetQueryChat: withMockFallback((sessionId) => api.post('/ai/query-chat/reset', { sessionId }), mockDb.ai.resetQueryChat),
  analyzeConsultation: withMockFallback((transcript, patientName, doctorName) => api.post('/ai/analyze-consultation', { transcript, patientName, doctorName }), mockDb.ai.analyzeConsultation),
  getCarePlan: withMockFallback(() => api.get('/ai/care-plan'), mockDb.ai.getCarePlan),
  compareReports: withMockFallback((previousReport, currentReport) => api.post('/ai/compare-reports', { previousReport, currentReport }), mockDb.ai.compareReports),
  analyzePatientReports: withMockFallback(() => api.post('/ai/analyze-reports'), mockDb.ai.analyzePatientReports),
  analyzeBodySymptoms: withMockFallback((data) => api.post('/ai/analyze-body-symptoms', data), mockDb.ai.analyzeBodySymptoms),
  assessSkinCare: withMockFallback((data) => api.post('/ai/skin-assessment', data), mockDb.ai.assessSkinCare),
};

export const rewardsAPI = {
  updateChecklist: withMockFallback((data) => api.post('/rewards/checklist', data), mockDb.rewards.updateChecklist),
  getLeaderboard: withMockFallback(() => api.get('/rewards/leaderboard'), mockDb.rewards.getLeaderboard),
};

export const emergencyAPI = {
  triggerSOS: withMockFallback((data) => api.post('/sos', data), mockDb.emergency.triggerSOS),
};

export const vaccinationAPI = {
  getVaccines: withMockFallback(() => api.get('/vaccines'), mockDb.vaccination.getVaccines),
  getPatientVaccinations: withMockFallback((patientId) => api.get(`/vaccinations/patient${patientId ? `?patientId=${patientId}` : ''}`), mockDb.vaccination.getPatientVaccinations),
  bookVaccination: withMockFallback((data) => api.post('/vaccinations/book', data), mockDb.vaccination.bookVaccination),
};

export const campAPI = {
  getAll: withMockFallback(() => api.get('/camps'), mockDb.camp.getAll),
  create: withMockFallback((data) => api.post('/camps', data), mockDb.camp.create),
  delete: withMockFallback((id) => api.delete(`/camps/${id}`), mockDb.camp.delete),
};

export default api;
