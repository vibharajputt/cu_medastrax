import { createContext, useContext, useState, useEffect } from 'react';
import { familyMemberAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('MedAstraX_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('MedAstraX_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState(() => {
    const saved = localStorage.getItem('MedAstraX_active_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [familyMembers, setFamilyMembers] = useState([]);

  const refreshFamilyMembers = async () => {
    const savedToken = localStorage.getItem('MedAstraX_token') || token;
    const savedUserString = localStorage.getItem('MedAstraX_user');
    const savedUser = savedUserString ? JSON.parse(savedUserString) : user;
    if (savedToken && savedUser?.role === 'PATIENT') {
      try {
        const res = await familyMemberAPI.getAll();
        setFamilyMembers(res.data);
      } catch (err) {
        console.error('Failed to load family members', err);
      }
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token && user?.role === 'PATIENT') {
      refreshFamilyMembers();
    } else {
      setFamilyMembers([]);
      setActiveProfile(null);
      localStorage.removeItem('MedAstraX_active_profile');
    }
  }, [token, user]);

  const login = (authResponse) => {
    const { token: jwt, id, name, email, role, phone, avatarUrl } = authResponse;
    const userData = { id, name, email, role, phone, avatarUrl };

    setToken(jwt);
    setUser(userData);
    localStorage.setItem('MedAstraX_token', jwt);
    localStorage.setItem('MedAstraX_user', JSON.stringify(userData));


  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setFamilyMembers([]);
    setActiveProfile(null);
    localStorage.removeItem('MedAstraX_token');
    localStorage.removeItem('MedAstraX_user');
    localStorage.removeItem('MedAstraX_active_profile');
    localStorage.removeItem('user_type');
    sessionStorage.removeItem('MedAstraX_camp_shown_session');
  };

  const switchProfile = (profile) => {
    setActiveProfile(profile);
    if (profile) {
      localStorage.setItem('MedAstraX_active_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('MedAstraX_active_profile');
    }
  };

  const updateUserAvatar = (avatarUrl) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, avatarUrl };
      localStorage.setItem('MedAstraX_user', JSON.stringify(updated));
      return updated;
    });
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('MedAstraX_user', JSON.stringify(updated));
      return updated;
    });
  };

  const isAuthenticated = !!token;
  const isPatient = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR';
  const isPharmacy = user?.role === 'PHARMACY';
  const isHospital = user?.role === 'HOSPITAL';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
      isPatient,
      isDoctor,
      isPharmacy,
      isAdmin,
      activeProfile,
      familyMembers,
      switchProfile,
      refreshFamilyMembers,
      updateUserAvatar,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
