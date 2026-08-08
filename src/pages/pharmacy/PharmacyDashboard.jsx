import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pharmacyAPI, prescriptionAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiList, FiCheckCircle, FiDollarSign, FiCpu, FiTrendingUp, FiActivity, FiMapPin, FiBell, FiPrinter, FiX, FiPackage, FiMenu, FiLogOut, FiSettings, FiTruck, FiClock, FiHome, FiNavigation } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/MedAstraCU-logo.png';
import '../patient/CuimsDashboard.css';

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue'); // queue, analytics, tracking
  const [orders, setOrders] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [billOrder, setBillOrder] = useState(null); // order for which to show bill modal
  const [priceSearchQuery, setPriceSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPharmacyFilter, setSelectedPharmacyFilter] = useState('ALL');
  const billRef = useRef(null);

  const [activeTrackingStage, setActiveTrackingStage] = useState(0); // 0: Order Placed, 1: Order Verified, 2: Out for Delivery, 3: Delivered
  const [trackingSlotSeconds, setTrackingSlotSeconds] = useState(30);
  const [pharmacyNotifications, setPharmacyNotifications] = useState([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: '📋 Order Placed: New medicine order received for Le Corbusier Hostel (Block B), Room 304.' }
  ]);

  const PHARMACY_TRACKING_SLOTS = [
    { stepNum: 1, id: 'PLACED', title: 'Order Placed', desc: 'Order received from student', icon: <FiPackage color="#042a59" size={20} /> },
    { stepNum: 2, id: 'VERIFIED', title: 'Order Verified', desc: 'Prescription verified & packed by pharmacist', icon: <FiCheckCircle color="#00b4b6" size={20} /> },
    { stepNum: 3, id: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', desc: 'Courier agent en-route to hostel', icon: <FiTruck color="#ea580c" size={20} /> },
    { stepNum: 4, id: 'DELIVERED', title: 'Delivered', desc: 'Handed over at hostel room', icon: <FiHome color="#16a34a" size={20} /> }
  ];

  useEffect(() => {
    if (activeTrackingStage >= 3) return;

    const timer = setInterval(() => {
      setTrackingSlotSeconds(prev => {
        if (prev <= 1) {
          const nextStage = activeTrackingStage + 1;
          setActiveTrackingStage(nextStage);

          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          if (nextStage === 1) {
            const msg = '✅ Order Verified: Pharmacist verified prescription & packed medicines into kit.';
            toast.success(msg, { duration: 4000 });
            setPharmacyNotifications(prevLogs => {
              if (prevLogs[0]?.text === msg) return prevLogs;
              return [{ time: timeStr, text: msg }, ...prevLogs];
            });
          } else if (nextStage === 2) {
            const msg = '🛵 Out for Delivery: Courier agent dispatched to Le Corbusier Hostel (Block B), Room 304.';
            toast.success(msg, { duration: 4000 });
            setPharmacyNotifications(prevLogs => {
              if (prevLogs[0]?.text === msg) return prevLogs;
              return [{ time: timeStr, text: msg }, ...prevLogs];
            });
          } else if (nextStage === 3) {
            const msg = '🎉 Delivered: Medicine package delivered to Hostel Room 304.';
            toast.success(msg, { duration: 6000 });
            setPharmacyNotifications(prevLogs => {
              if (prevLogs[0]?.text === msg) return prevLogs;
              return [{ time: timeStr, text: msg }, ...prevLogs];
            });
          }

          return 30; // reset slot timer to 30s
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTrackingStage]);

  const dummyPriceComparison = [
    {
      id: 'med-1',
      name: 'Paracetamol 650mg (Dolo-650)',
      category: 'Analgesics & Antipyretics',
      packSize: '15 Tablets Strip',
      pharmacies: [
        { name: 'Apollo Pharmacy', distance: '0.8 km', price: 35.00, stock: 'In Stock' },
        { name: 'MedPlus Pharmacy', distance: '1.4 km', price: 29.50, stock: 'In Stock' },
        { name: 'Frank Ross Pharmacy', distance: '2.1 km', price: 34.00, stock: 'Low Stock' },
        { name: 'Wellness Forever', distance: '3.2 km', price: 36.50, stock: 'In Stock' },
        { name: 'Netmeds Local Store', distance: '3.8 km', price: 31.00, stock: 'In Stock' }
      ]
    },
    {
      id: 'med-2',
      name: 'Amoxicillin 500mg (Novamox)',
      category: 'Antibiotics',
      packSize: '10 Capsules Strip',
      pharmacies: [
        { name: 'Apollo Pharmacy', distance: '0.8 km', price: 92.00, stock: 'In Stock' },
        { name: 'MedPlus Pharmacy', distance: '1.4 km', price: 78.00, stock: 'In Stock' },
        { name: 'Frank Ross Pharmacy', distance: '2.1 km', price: 89.00, stock: 'In Stock' },
        { name: 'Wellness Forever', distance: '3.2 km', price: 95.00, stock: 'Out of Stock' },
        { name: 'Netmeds Local Store', distance: '3.8 km', price: 85.00, stock: 'In Stock' }
      ]
    },
    {
      id: 'med-3',
      name: 'Metformin 500mg (Glycomet)',
      category: 'Antidiabetics',
      packSize: '10 Tablets Strip',
      pharmacies: [
        { name: 'Apollo Pharmacy', distance: '0.8 km', price: 22.00, stock: 'In Stock' },
        { name: 'MedPlus Pharmacy', distance: '1.4 km', price: 26.00, stock: 'In Stock' },
        { name: 'Frank Ross Pharmacy', distance: '2.1 km', price: 25.00, stock: 'In Stock' },
        { name: 'Wellness Forever', distance: '3.2 km', price: 28.00, stock: 'Low Stock' },
        { name: 'Netmeds Local Store', distance: '3.8 km', price: 24.50, stock: 'In Stock' }
      ]
    },
    {
      id: 'med-4',
      name: 'Atorvastatin 10mg (Atorva)',
      category: 'Cardiac & Cholesterol',
      packSize: '15 Tablets Strip',
      pharmacies: [
        { name: 'Apollo Pharmacy', distance: '0.8 km', price: 125.00, stock: 'In Stock' },
        { name: 'MedPlus Pharmacy', distance: '1.4 km', price: 102.00, stock: 'In Stock' },
        { name: 'Frank Ross Pharmacy', distance: '2.1 km', price: 118.00, stock: 'In Stock' },
        { name: 'Wellness Forever', distance: '3.2 km', price: 129.00, stock: 'In Stock' },
        { name: 'Netmeds Local Store', distance: '3.8 km', price: 110.00, stock: 'In Stock' }
      ]
    },
    {
      id: 'med-5',
      name: 'Pantoprazole 40mg (Pan-40)',
      category: 'Antacids & Gastro',
      packSize: '15 Tablets Strip',
      pharmacies: [
        { name: 'Apollo Pharmacy', distance: '0.8 km', price: 68.00, stock: 'In Stock' },
        { name: 'MedPlus Pharmacy', distance: '1.4 km', price: 58.00, stock: 'In Stock' },
        { name: 'Frank Ross Pharmacy', distance: '2.1 km', price: 65.00, stock: 'Low Stock' },
        { name: 'Wellness Forever', distance: '3.2 km', price: 70.00, stock: 'In Stock' },
        { name: 'Netmeds Local Store', distance: '3.8 km', price: 62.00, stock: 'In Stock' }
      ]
    },
    {
      id: 'med-6',
      name: 'Azithromycin 500mg (Azee-500)',
      category: 'Antibiotics',
      packSize: '5 Tablets Strip',
      pharmacies: [
        { name: 'Apollo Pharmacy', distance: '0.8 km', price: 130.00, stock: 'In Stock' },
        { name: 'MedPlus Pharmacy', distance: '1.4 km', price: 112.00, stock: 'In Stock' },
        { name: 'Frank Ross Pharmacy', distance: '2.1 km', price: 124.00, stock: 'In Stock' },
        { name: 'Wellness Forever', distance: '3.2 km', price: 135.00, stock: 'Low Stock' },
        { name: 'Netmeds Local Store', distance: '3.8 km', price: 118.50, stock: 'In Stock' }
      ]
    }
  ];

  const salesChartRef = useRef(null);
  const medsChartRef = useRef(null);
  const regionChartRef = useRef(null);
  const priceComparisonChartRef = useRef(null);
  const salesChartInstance = useRef(null);
  const medsChartInstance = useRef(null);
  const regionChartInstance = useRef(null);
  const priceComparisonChartInstance = useRef(null);

  useEffect(() => {
    if (user?.name) {
      fetchQueue();
      fetchOrders();

      const interval = setInterval(() => {
        fetchOrders();
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [user?.name]);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('medastrax_reopen_camp_popup'));
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const fetchOrders = async () => {
    if (!user?.name) return;
    try {
      const res = await pharmacyAPI.getOrdersForPharmacy(user.name);
      const formatted = res.data.map(o => {
        let medicineList = 'Routine Medication';
        let parsedMeds = [];
        try {
          if (Array.isArray(o.medicines)) {
            parsedMeds = o.medicines;
          } else if (typeof o.medicines === 'string') {
            if (o.medicines.startsWith('[')) {
              parsedMeds = JSON.parse(o.medicines);
            } else {
              parsedMeds = [{ name: o.medicines }];
            }
          } else if (o.medicines && typeof o.medicines === 'object') {
            parsedMeds = [o.medicines];
          }
          
          if (Array.isArray(parsedMeds)) {
            medicineList = parsedMeds.map(m => typeof m === 'object' ? (m.name || m) : String(m)).join(', ');
          } else {
            medicineList = typeof o.medicines === 'string' ? o.medicines : 'Prescribed Meds';
          }
        } catch (e) {
          if (Array.isArray(o.medicines)) {
            medicineList = o.medicines.map(m => typeof m === 'object' ? (m.name || m) : String(m)).join(', ');
          } else {
            medicineList = 'Prescribed Meds';
          }
        }
        return {
          id: o.id,
          patientName: o.patientName,
          medicine: medicineList,
          parsedMeds,
          medicineAmount: o.medicineAmount || 0,
          deliveryCharges: o.deliveryCharges || 0,
          amount: o.totalAmount || o.medicineAmount || 0,
          status: o.status,
          time: o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : 'Just Now',
          address: o.deliveryAddress || 'Default Address',
          region: o.deliveryAddress ? o.deliveryAddress.split(',')[0].trim() : 'Unknown Region',
          pharmacyName: o.pharmacyName,
          rawCreatedAt: o.createdAt
        };
      });

      const newPending = formatted.filter(o => o.status === 'PENDING').length;
      setNotificationCount(prev => {
        if (newPending > prev) return newPending;
        return prev;
      });

      setOrders(formatted);
    } catch (e) {
      console.error('Failed to load pharmacy orders', e);
    }
  };

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await prescriptionAPI.getPharmacyQueue();
      setQueue(res.data);
    } catch (error) {
      toast.error('Failed to load prescription queue');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await pharmacyAPI.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order #${orderId} status updated to ${newStatus}`);
    } catch (e) {
      toast.error('Failed to update status on database');
    }
  };

  const handlePrintBill = () => {
    const printContent = billRef.current?.innerHTML;
    if (!printContent) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>MedAstraX Bill - Order #${billOrder?.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
            h1 { color: #0d9488; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #f0fdf4; padding: 10px; text-align: left; border: 1px solid #d1fae5; }
            td { padding: 10px; border: 1px solid #e5e7eb; }
            .total-row td { font-weight: bold; background: #f0fdf4; }
            .footer { margin-top: 32px; font-size: 0.85rem; color: #6b7280; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const statusColor = (status) => {
    if (status === 'PENDING') return 'var(--warning)';
    if (status === 'PREPARING') return 'var(--primary)';
    if (status === 'DELIVERING') return 'var(--secondary)';
    if (status === 'COMPLETED') return 'var(--success)';
    return 'var(--text-muted)';
  };

  const formatMedicines = (meds) => {
    if (!meds) return 'Routine Check';
    if (Array.isArray(meds)) {
      return meds.map(m => m.name || m).join(', ');
    }
    if (typeof meds === 'string') {
      if (meds.startsWith('[')) {
        try {
          const parsed = JSON.parse(meds);
          if (Array.isArray(parsed)) {
            return parsed.map(m => m.name || m).join(', ');
          }
        } catch (e) {
        }
      }
      return meds;
    }
    return String(meds);
  };

  const completedOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED');
  
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);

  const medsCounts = {};
  completedOrders.forEach(o => {
    if (o.parsedMeds && Array.isArray(o.parsedMeds)) {
      o.parsedMeds.forEach(m => {
        const name = m.name || 'Unknown';
        const qty = m.quantity || 1;
        medsCounts[name] = (medsCounts[name] || 0) + qty;
      });
    } else {
      const name = o.medicine || 'Prescribed Meds';
      medsCounts[name] = (medsCounts[name] || 0) + 1;
    }
  });
  let topMedicine = 'None';
  let topMedicineCount = 0;
  Object.entries(medsCounts).forEach(([name, count]) => {
    if (count > topMedicineCount) {
      topMedicine = name;
      topMedicineCount = count;
    }
  });

  const regionStats = {};
  completedOrders.forEach(o => {
    const r = o.region || 'Unknown';
    regionStats[r] = (regionStats[r] || 0) + 1;
  });
  let topRegion = 'None';
  let topRegionPercentage = 0;
  let topRegionCount = 0;
  if (completedOrders.length > 0) {
    Object.entries(regionStats).forEach(([r, count]) => {
      if (count > topRegionCount) {
        topRegion = r;
        topRegionCount = count;
      }
    });
    topRegionPercentage = Math.round((topRegionCount / completedOrders.length) * 100);
  }

  useEffect(() => {
    if (activeTab !== 'analytics' || orders.length === 0) return;

    const Chart = window.Chart;
    if (!Chart) {
      console.warn('Chart.js is not loaded yet');
      return;
    }

    if (completedOrders.length === 0) return;

    const salesByDate = {};
    const sortedCompleted = [...completedOrders].sort((a, b) => {
      return new Date(a.rawCreatedAt || 0) - new Date(b.rawCreatedAt || 0);
    });

    sortedCompleted.forEach(o => {
      let dateKey = 'Just Now';
      if (o.rawCreatedAt) {
        dateKey = new Date(o.rawCreatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      }
      salesByDate[dateKey] = (salesByDate[dateKey] || 0) + o.amount;
    });
    const salesLabels = Object.keys(salesByDate);
    const salesData = Object.values(salesByDate);

    const sortedMeds = Object.entries(medsCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const medsLabels = sortedMeds.map(e => e[0]);
    const medsData = sortedMeds.map(e => e[1]);

    const regionLabels = Object.keys(regionStats);
    const regionData = Object.values(regionStats);

    if (salesChartInstance.current) salesChartInstance.current.destroy();
    if (medsChartInstance.current) medsChartInstance.current.destroy();
    if (regionChartInstance.current) regionChartInstance.current.destroy();

    if (salesChartRef.current) {
      salesChartInstance.current = new Chart(salesChartRef.current, {
        type: 'line',
        data: {
          labels: salesLabels,
          datasets: [{
            label: 'Revenue (₹)',
            data: salesData,
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.08)',
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#0d9488'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: 'var(--text-secondary)' }
            },
            x: {
              grid: { display: false },
              ticks: { color: 'var(--text-secondary)' }
            }
          }
        }
      });
    }

    if (medsChartRef.current) {
      medsChartInstance.current = new Chart(medsChartRef.current, {
        type: 'bar',
        data: {
          labels: medsLabels,
          datasets: [{
            label: 'Quantity Sold',
            data: medsData,
            backgroundColor: 'rgba(0, 217, 166, 0.65)',
            borderColor: 'var(--primary)',
            borderWidth: 1,
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: 'var(--text-secondary)' }
            },
            y: {
              grid: { display: false },
              ticks: { color: 'var(--text-secondary)' }
            }
          }
        }
      });
    }

    if (regionChartRef.current) {
      regionChartInstance.current = new Chart(regionChartRef.current, {
        type: 'doughnut',
        data: {
          labels: regionLabels,
          datasets: [{
            data: regionData,
            backgroundColor: [
              'rgba(13, 148, 136, 0.7)',
              'rgba(0, 217, 166, 0.7)',
              'rgba(4, 42, 89, 0.7)',
              'rgba(249, 115, 22, 0.7)',
              'rgba(168, 85, 247, 0.7)'
            ],
            borderColor: 'var(--surface)',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: 'var(--text-secondary)',
                boxWidth: 12,
                padding: 15
              }
            }
          }
        }
      });
    }

    return () => {
      if (salesChartInstance.current) salesChartInstance.current.destroy();
      if (medsChartInstance.current) medsChartInstance.current.destroy();
      if (regionChartInstance.current) regionChartInstance.current.destroy();
    };
  }, [activeTab, orders]);

  useEffect(() => {
    if (activeTab !== 'price-comparison') return;

    const Chart = window.Chart;
    if (!Chart) {
      console.warn('Chart.js is not loaded yet');
      return;
    }

    const labels = dummyPriceComparison.map(m => m.name);
    const pharmacyNames = dummyPriceComparison[0]?.pharmacies.map(p => p.name) || [];
    const colors = ['#0f766e', '#042a59', '#f97316', '#33c3c5', '#ef4444'];

    const datasets = pharmacyNames.map((name, index) => ({
      label: name,
      data: dummyPriceComparison.map(med => med.pharmacies.find(p => p.name === name)?.price ?? null),
      borderColor: colors[index % colors.length],
      backgroundColor: `${colors[index % colors.length]}33`,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.25,
      fill: false
    }));

    if (priceComparisonChartInstance.current) {
      priceComparisonChartInstance.current.destroy();
    }

    if (priceComparisonChartRef.current) {
      priceComparisonChartInstance.current = new Chart(priceComparisonChartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: 'var(--text-secondary)',
                boxWidth: 12,
                padding: 12
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: 'var(--text-secondary)' }
            },
            y: {
              grid: { color: 'rgba(15, 118, 110, 0.08)' },
              ticks: { color: 'var(--text-secondary)' },
              title: {
                display: true,
                text: 'Price (₹)',
                color: 'var(--text-secondary)',
                font: { size: 11 }
              }
            }
          }
        }
      });
    }

    return () => {
      if (priceComparisonChartInstance.current) {
        priceComparisonChartInstance.current.destroy();
      }
    };
  }, [activeTab, dummyPriceComparison]);

  if (!user) {
    return (
      <div className="page-container flex-center" style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="cuims-layout animate-fade-in">
      
      {/* Top Header Navbar */}
      <header className="cuims-header">
        <div className="cuims-header-left">
          <button type="button" className="cuims-menu-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Toggle Sidebar">
            <FiMenu />
          </button>
          <div className="cuims-logo-container" onClick={() => setActiveTab('queue')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="MedAstraX" style={{ height: '52px', objectFit: 'contain' }} />
          </div>
        </div>

        <div className="cuims-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Health Camp Notification Button */}
          <button 
            type="button" 
            className="cuims-icon-btn" 
            title="Active Health Camp Announcement - Click to view details"
            onClick={() => window.dispatchEvent(new Event('medastrax_reopen_camp_popup'))}
            style={{ 
              fontSize: '1.15rem', 
              position: 'relative',
              background: 'rgba(13, 148, 136, 0.12)',
              border: '1px solid rgba(13, 148, 136, 0.3)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🏥
            <span 
              style={{
                position: 'absolute',
                top: '1px',
                right: '1px',
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid #ffffff',
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.7)'
              }} 
            />
          </button>

          <button type="button" className="cuims-icon-btn" onClick={() => toast.info('Pharmacy settings active')}>
            <FiSettings />
          </button>
          
          <div className="cuims-user-chip" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px', borderLeft: '1px solid #e2e8f0', cursor: 'pointer' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#33c3c5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
              P
            </div>
            <div className="cuims-user-info" style={{ textAlign: 'right', lineHeight: '1.2' }}>
              <div className="cuims-user-name" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a', textTransform: 'uppercase' }}>{user.name}</div>
              <div className="cuims-user-id" style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>PHARMACY</div>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => {
              toast.success('Logged out successfully');
              window.location.href = '/login';
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', background: 'white', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Main CUIMS Pharmacy Layout */}
      <div className="cuims-body-wrapper" style={{ display: 'flex', flex: 1 }}>
        
        {/* Left Sidebar */}
        <aside className={`cuims-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ width: sidebarCollapsed ? '60px' : '260px', background: '#303e67', color: '#ffffff', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', flexShrink: 0, minHeight: 'calc(100vh - 64px)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 800, fontSize: '0.92rem', letterSpacing: '0.5px' }}>
            {!sidebarCollapsed ? 'Pharmacy Portal' : '💊'}
          </div>
          
          <ul className="cuims-sidebar-nav" style={{ listStyle: 'none', padding: '12px 0', margin: 0 }}>
            {[
              { id: 'queue', label: 'Orders & Queue', icon: <FiList color="#00d9a6" />, badge: queue.length, badgeColor: '#00b4b6', action: () => setActiveTab('queue') },
              { id: 'tracking', label: 'Live Delivery Tracker', icon: <FiTruck color="#042a59" />, badge: 1, badgeColor: '#042a59', action: () => setActiveTab('tracking') },
              { id: 'history', label: 'Order History', icon: <FiCheckCircle color="#042a59" />, badge: completedOrders.length, badgeColor: '#64748b', action: () => setActiveTab('history') },
              { id: 'price-comparison', label: 'Nearby Price Compare', icon: <FiTrendingUp color="#ea580c" />, action: () => setActiveTab('price-comparison') },
              { id: 'analytics', label: 'AI Analytics & Forecast', icon: <FiCpu color="#33c3c5" />, action: () => setActiveTab('analytics') }
            ].map(item => (
              <li 
                key={item.id}
                className={`cuims-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  if (item.action) item.action();
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.icon}
                  {!sidebarCollapsed && <span style={{ fontSize: '0.85rem' }}>{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge > 0 && (
                  <span style={{ background: item.badgeColor, color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {item.badge}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="cuims-main-content">
          
          {/* Welcome Banner */}
          <div className="glass-card pharmacy-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', marginBottom: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
            <div>
              <h1 className="heading-lg" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>Pharmacy <span className="text-gradient" style={{ background: 'linear-gradient(135deg, #0f766e, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Portal</span></h1>
              <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>Manage prescriptions, price lists, and real-time orders.</p>
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setNotificationCount(0)}>
              <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '50%' }}>
                <FiBell size={20} color={notificationCount > 0 ? '#0f766e' : '#64748b'} />
              </div>
              {notificationCount > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '1px 5px', borderRadius: '10px' }}>
                  {notificationCount}
                </span>
              )}
            </div>
          </div>

          {activeTab === 'queue' && (
        <div className="pharmacy-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '32px' }}>

          {/* Left: Active prescriptions queue */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 className="heading-sm" style={{ marginBottom: '20px' }}>Active Prescription Pricing Queue</h2>
            {loading ? (
              <div className="spinner"></div>
            ) : queue.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No active prescriptions in routing.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px' }}>ID</th>
                      <th style={{ padding: '12px' }}>Patient Name</th>
                      <th style={{ padding: '12px' }}>Doctor Name</th>
                      <th style={{ padding: '12px' }}>Medicines</th>
                      <th style={{ padding: '12px', whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td data-label="ID" style={{ padding: '16px 12px' }}>#{p.id}</td>
                        <td data-label="Patient Name" style={{ padding: '16px 12px', fontWeight: 600 }}>{p.patientName}</td>
                        <td data-label="Doctor Name" style={{ padding: '16px 12px' }}>{p.doctorName}</td>
                        <td data-label="Medicines" style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>
                          {formatMedicines(p.medicines)}
                        </td>
                        <td data-label="Actions" style={{ padding: '16px 12px', whiteSpace: 'nowrap', minWidth: '140px' }}>
                          <button className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>Submit Prices</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Placed Delivery orders with Swiggy/Zomato style Live Tracking */}
          <div className="glass-card" style={{ padding: '24px', alignSelf: 'start', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="heading-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <FiTruck color="var(--primary)" /> Live Hostel Delivery Orders
              </h3>
              <button onClick={() => setActiveTab('tracking')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                Track Live ➔
              </button>
            </div>

            {/* Swiggy / Zomato Live Order Tracker Card */}
            <div style={{ padding: '18px', background: 'linear-gradient(135deg, rgba(0, 217, 166, 0.05), rgba(4, 42, 89, 0.05))', border: '1px solid rgba(0, 217, 166, 0.25)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Order #ORD-9042</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>Rahul Sharma</div>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#0f766e', color: '#ffffff', padding: '3px 10px', borderRadius: '14px', fontWeight: 700 }}>
                  {PHARMACY_TRACKING_SLOTS[activeTrackingStage].title}
                </span>
              </div>

              {/* Swiggy Valet Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '12px' }}>
                <div style={{ fontSize: '1.4rem' }}>🛵</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Vikram Singh <span style={{ color: '#eab308', fontSize: '0.75rem' }}>★ 4.9</span></div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>MedAstraX EV Valet • On the way</div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>ETA 2 mins</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <div>💊 Paracetamol 650mg, Azithromycin 500mg</div>
                <div style={{ marginTop: '4px', color: 'var(--primary)', fontWeight: 700 }}>🏢 Le Corbusier Hostel (Block B), Room 304</div>
                <div style={{ marginTop: '2px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>📝 Call on arrival at hostel gate</div>
              </div>

              {/* Swiggy Style Animated Progress Bar */}
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>Live Status:</span>
                  <strong style={{ color: 'var(--primary)' }}>{PHARMACY_TRACKING_SLOTS[activeTrackingStage].title}</strong>
                </div>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${((activeTrackingStage + 1) / 4) * 100}%`, background: 'linear-gradient(90deg, #00d9a6, #042a59)', height: '100%', transition: 'width 0.8s ease' }}></div>
                </div>
              </div>

              {/* 4-Step Mini Timeline */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center' }}>
                {PHARMACY_TRACKING_SLOTS.map((slot, idx) => {
                  const isPassed = idx < activeTrackingStage;
                  const isCurrent = idx === activeTrackingStage;
                  return (
                    <div key={slot.id} style={{
                      padding: '4px 2px',
                      borderRadius: '6px',
                      background: isCurrent ? 'rgba(0, 217, 166, 0.2)' : isPassed ? 'rgba(0, 180, 182, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: isCurrent ? '1px solid var(--primary)' : 'none',
                      fontSize: '0.68rem',
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? 'var(--primary)' : isPassed ? '#00b4b6' : 'var(--text-muted)'
                    }}>
                      {slot.title} {isPassed ? '✓' : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'DELIVERED').length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No active orders in fulfillment queue.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'DELIVERED').map(order => (
                  <div key={order.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${statusColor(order.status)}33`, borderRadius: '12px', borderLeft: `4px solid ${statusColor(order.status)}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.95rem' }}>Order #{order.id}</strong>
                      <span style={{ fontSize: '0.72rem', background: `${statusColor(order.status)}22`, color: statusColor(order.status), padding: '2px 10px', borderRadius: '20px', fontWeight: 700, letterSpacing: '0.5px' }}>
                        {order.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      <div>👤 <strong style={{ color: 'var(--text-primary)' }}>{order.patientName}</strong></div>
                      <div style={{ marginTop: '4px' }}>💊 {order.medicine}</div>
                      <div style={{ marginTop: '4px' }}>📍 {order.address}</div>
                      <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>🕐 {order.time}</div>
                    </div>

                    {/* Billing summary */}
                    <div style={{ background: 'rgba(0,217,166,0.04)', border: '1px solid rgba(0,217,166,0.15)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Medicines</span>
                        <span>₹{order.medicineAmount.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
                        <span>₹{order.deliveryCharges.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.95rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                        <span>Total</span>
                        <span className="text-gradient">₹{order.amount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {order.status === 'PENDING' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')} className="btn btn-primary btn-sm">Start Preparing</button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERING')} className="btn btn-primary btn-sm">Mark Delivering</button>
                      )}
                      {order.status === 'DELIVERING' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')} className="btn btn-outline btn-sm">Mark Complete</button>
                      )}
                      {order.status === 'COMPLETED' && (
                        <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 'bold' }}>✓ Delivered</span>
                      )}
                      {/* Generate Bill always available */}
                      <button
                        onClick={() => setBillOrder(order)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}
                      >
                        <FiDollarSign size={14} /> Generate Bill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Swiggy / Zomato Style Live Delivery Tracker Tab */}
      {activeTab === 'tracking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
          
          {/* Main Swiggy/Zomato Status Header Card */}
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '50%', border: '2px solid #bbf7d0', boxShadow: '0 0 20px rgba(0, 217, 166, 0.2)' }}>
                {PHARMACY_TRACKING_SLOTS[activeTrackingStage].icon}
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#166534', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '12px' }}>
              <FiClock size={14} /> MedAstraX Express Campus Delivery
            </div>

            <h2 className="heading-md" style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 }}>
              {PHARMACY_TRACKING_SLOTS[activeTrackingStage].title}
            </h2>

            <p style={{ color: '#64748b', fontSize: '0.98rem', margin: '0 auto', maxWidth: '600px' }}>
              {PHARMACY_TRACKING_SLOTS[activeTrackingStage].desc}
            </p>

            {/* Swiggy / Zomato Valet Card */}
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', maxWidth: '560px', margin: '24px auto 0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: '#0f766e', color: 'white', width: '46px', height: '46px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                  🛵
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Vikram Singh <span style={{ color: '#ca8a04', fontSize: '0.8rem', marginLeft: '6px' }}>★ 4.9</span></div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>MedAstraX Verified Valet Partner • EV Scooter</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Estimated Arrival</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f766e' }}>
                  {activeTrackingStage === 3 ? 'Delivered 🎉' : 'In 2 mins'}
                </div>
              </div>
            </div>

            {/* Live Progress Bar */}
            {activeTrackingStage < 3 && (
              <div style={{ marginTop: '20px', maxWidth: '560px', margin: '20px auto 0 auto' }}>
                <div style={{ width: '100%', background: '#e2e8f0', height: '8px', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${((activeTrackingStage + 1) / 4) * 100}%`, background: 'linear-gradient(90deg, #0f766e, #042a59)', height: '100%', transition: 'width 0.8s ease' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* 4-Step Swiggy/Zomato Timeline Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {PHARMACY_TRACKING_SLOTS.map((slot, index) => {
              const isPassed = index < activeTrackingStage;
              const isCurrent = index === activeTrackingStage;
              return (
                <div 
                  key={slot.id} 
                  className="glass-card" 
                  style={{ 
                    padding: '20px', 
                    borderRadius: '14px',
                    border: isCurrent ? '2px solid #0f766e' : isPassed ? '1px solid #00b4b6' : '1px solid #e2e8f0',
                    background: isCurrent ? 'rgba(15, 118, 110, 0.04)' : isPassed ? 'rgba(0, 180, 182, 0.02)' : '#ffffff',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.78rem', color: isCurrent ? '#0f766e' : isPassed ? '#00b4b6' : '#94a3b8' }}>
                      STEP 0{slot.stepNum}
                    </div>
                    <div>
                      {isPassed ? (
                        <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>Passed ✅</span>
                      ) : isCurrent ? (
                        <span style={{ fontSize: '0.7rem', background: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>In Progress 🛵</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', background: '#f1f5f9', color: '#94a3b8', padding: '2px 8px', borderRadius: '10px' }}>Upcoming ⏳</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {slot.icon}
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{slot.title}</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                    {slot.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Hostel Address & Order Details Box */}
          <div className="glass-card" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiHome color="#0f766e" /> Hostel Delivery Destination
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                Le Corbusier Hostel (Block B)
              </div>
              <div style={{ fontSize: '0.95rem', color: '#0f766e', fontWeight: 700, marginTop: '2px' }}>
                Room 304 • CU Campus
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
                📝 Delivery Note: Call on arrival at hostel gate
              </div>
            </div>

            <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiPackage color="#042a59" /> Patient & Order Summary
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                Rahul Sharma (UID: 21BCS4092)
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                💊 Paracetamol 650mg (Dolo-650), Azithromycin 500mg
              </div>
              <div style={{ fontSize: '0.9rem', color: '#0f766e', fontWeight: 800, marginTop: '6px' }}>
                Total Billed: ₹310.00 (Meds ₹280 + Delivery ₹30)
              </div>
            </div>
          </div>

          {/* Real-time Notifications Feed */}
          <div className="glass-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBell color="#0f766e" /> Pharmacy Real-Time Delivery Notifications
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pharmacyNotifications.map((item, idx) => (
                <div key={idx} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', borderLeft: '4px solid #0f766e', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>[{item.time}]</span>
                  <span style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive SVG Campus Map */}
          <div className="glass-card" style={{ padding: '24px', background: '#0a0d14', height: '360px', position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
            {/* GPS HUD */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, background: 'rgba(0,0,0,0.85)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'white' }}>
                <FiNavigation color="#00d9a6" />
                <strong>Live Campus GPS Navigation</strong>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '4px' }}>
                Destination: Room 304, Le Corbusier Hostel (Block B)
              </div>
            </div>

            {/* SVG Map */}
            <svg width="100%" height="100%" viewBox="0 0 800 360" style={{ display: 'block' }}>
              <path d="M 50 80 Q 200 60 400 100 T 750 80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <path d="M 100 40 Q 250 180 400 320" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <path d="M 50 260 H 750" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              
              {/* Delivery Path Route */}
              <path 
                d="M 180 90 L 340 180 L 520 270" 
                fill="none" 
                stroke="rgba(0, 217, 166, 0.3)" 
                strokeWidth="8" 
                strokeDasharray="10 6"
              />

              {/* Pharmacy Location Node */}
              <circle cx="180" cy="90" r="16" fill="#1e293b" stroke="#00d9a6" strokeWidth="3" />
              <text x="180" y="65" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">Pharmacy Store</text>

              {/* Customer Hostel Node */}
              <circle cx="520" cy="270" r="16" fill="#1e293b" stroke="#042a59" strokeWidth="3" />
              <text x="520" y="305" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">🏢 Le Corbusier Hostel (Room 304)</text>

              {/* GPS Live Mover (Moves based on activeTrackingStage) */}
              <g style={{
                transform: `translate(${180 + (activeTrackingStage * 113.3)}px, ${90 + (activeTrackingStage * 60)}px)`,
                transition: 'transform 1.5s ease-in-out'
              }}>
                <circle cx="0" cy="0" r="12" fill="#00d9a6" className="animate-ping" style={{ opacity: 0.4 }} />
                <circle cx="0" cy="0" r="9" fill="#00d9a6" />
                <path d="M -4 -4 L 6 0 L -4 4 Z" fill="#fff" />
              </g>
            </svg>
          </div>

        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <h2 className="heading-sm" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCheckCircle color="var(--success)" /> Completed Order History
          </h2>
          {completedOrders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No completed orders in history.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Order ID</th>
                    <th style={{ padding: '12px' }}>Date &amp; Time</th>
                    <th style={{ padding: '12px' }}>Patient Name</th>
                    <th style={{ padding: '12px' }}>Medicines</th>
                    <th style={{ padding: '12px' }}>Region</th>
                    <th style={{ padding: '12px' }}>Grand Total</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td data-label="Order ID" style={{ padding: '16px 12px', fontWeight: 'bold' }}>#{order.id}</td>
                      <td data-label="Date & Time" style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{order.time}</td>
                      <td data-label="Patient Name" style={{ padding: '16px 12px', fontWeight: 600 }}>{order.patientName}</td>
                      <td data-label="Medicines" style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{order.medicine}</td>
                      <td data-label="Region" style={{ padding: '16px 12px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><FiMapPin size={12} color="var(--secondary)" /> {order.region}</span></td>
                      <td data-label="Grand Total" style={{ padding: '16px 12px', fontWeight: 'bold', color: 'var(--primary)' }}>₹{order.amount.toFixed(2)}</td>
                      <td data-label="Status" style={{ padding: '16px 12px' }}>
                        <span style={{ fontSize: '0.72rem', background: 'rgba(0,217,166,0.1)', color: 'var(--success)', padding: '2px 10px', borderRadius: '20px', fontWeight: 700 }}>
                          DELIVERED
                        </span>
                      </td>
                      <td data-label="Actions" style={{ padding: '16px 12px' }}>
                        <button
                          onClick={() => setBillOrder(order)}
                          className="btn btn-outline btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FiDollarSign size={14} /> View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Price Comparison Tab */}
      {activeTab === 'price-comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="animate-fade-in">
          
          {/* Top Overview Cards */}
          <div className="grid grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="glass-card stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                <FiMapPin color="#042a59" size={18} /> Monitored Nearby Stores
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
                5 Pharmacies
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                Within 5.0 km radius
              </div>
            </div>

            <div className="glass-card stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                <FiTrendingUp color="#16a34a" size={18} /> Avg. Price Spread
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a', marginTop: '8px' }}>
                23.6%
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                Local market price variation range
              </div>
            </div>

            <div className="glass-card stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                <FiDollarSign color="#ea580c" size={18} /> Lowest Price Leader
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ea580c', marginTop: '8px' }}>
                MedPlus Pharmacy
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                On avg 9.8% below local market price
              </div>
            </div>

            <div className="glass-card stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                <FiActivity color="#33c3c5" size={18} /> Tracked Medicines
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#33c3c5', marginTop: '8px' }}>
                {dummyPriceComparison.length} Items
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                Essential medicines comparison
              </div>
            </div>
          </div>

          {/* Search & Filter Header */}
          <div className="glass-card" style={{ padding: '20px 24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
              <input 
                type="text" 
                placeholder="🔍 Search medicine name, formula or category..."
                value={priceSearchQuery}
                onChange={(e) => setPriceSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}
              >
                <option value="ALL">All Categories</option>
                <option value="Analgesics & Antipyretics">Analgesics &amp; Antipyretics</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Antidiabetics">Antidiabetics</option>
                <option value="Cardiac & Cholesterol">Cardiac &amp; Cholesterol</option>
                <option value="Antacids & Gastro">Antacids &amp; Gastro</option>
              </select>

              <select
                value={selectedPharmacyFilter}
                onChange={(e) => setSelectedPharmacyFilter(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#334155', background: 'white' }}
              >
                <option value="ALL">All Nearby Pharmacies</option>
                <option value="Apollo Pharmacy">Apollo Pharmacy (0.8 km)</option>
                <option value="MedPlus Pharmacy">MedPlus Pharmacy (1.4 km)</option>
                <option value="Frank Ross Pharmacy">Frank Ross Pharmacy (2.1 km)</option>
                <option value="Wellness Forever">Wellness Forever (3.2 km)</option>
                <option value="Netmeds Local Store">Netmeds Local Store (3.8 km)</option>
              </select>
            </div>
          </div>

          {/* Medicine Price Comparison Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {dummyPriceComparison
              .filter(m => {
                const matchesSearch = m.name.toLowerCase().includes(priceSearchQuery.toLowerCase()) || m.category.toLowerCase().includes(priceSearchQuery.toLowerCase());
                const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
                return matchesSearch && matchesCat;
              })
              .map(med => {
                const prices = med.pharmacies.map(p => p.price);
                const avgPrice = prices.reduce((sum, val) => sum + val, 0) / prices.length;
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);

                return (
                  <div key={med.id} className="glass-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                    
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          💊 {med.name}
                          <span style={{ fontSize: '0.74rem', background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 }}>
                            {med.packSize}
                          </span>
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                          Category: <strong style={{ color: '#0f766e' }}>{med.category}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Market Average</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>₹{avgPrice.toFixed(2)}</div>
                        </div>
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 600 }}>Lowest Local Price</div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#16a34a' }}>₹{minPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Percentage Comparison Table */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc', textAlign: 'left', color: '#475569' }}>
                            <th style={{ padding: '10px 12px' }}>Pharmacy Name</th>
                            <th style={{ padding: '10px 12px' }}>Distance</th>
                            <th style={{ padding: '10px 12px' }}>Selling Price</th>
                            <th style={{ padding: '10px 12px' }}>Price Comparison vs Market Average</th>
                            <th style={{ padding: '10px 12px', textAlign: 'center' }}>Stock Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {med.pharmacies
                            .filter(p => selectedPharmacyFilter === 'ALL' || p.name.includes(selectedPharmacyFilter))
                            .map((pharm, idx) => {
                              const diffPct = ((pharm.price - avgPrice) / avgPrice) * 100;
                              const isLowest = pharm.price === minPrice;
                              const isHighest = pharm.price === maxPrice;
                              const isCheaper = diffPct < 0;

                              return (
                                <tr 
                                  key={idx} 
                                  style={{ 
                                    borderBottom: '1px solid #f1f5f9', 
                                    background: isLowest ? 'rgba(22, 163, 74, 0.03)' : 'transparent',
                                    fontWeight: isLowest ? 700 : 500
                                  }}
                                >
                                  <td style={{ padding: '12px', color: isLowest ? '#15803d' : '#1e293b' }}>
                                    {pharm.name}
                                  </td>
                                  <td style={{ padding: '12px', color: '#64748b' }}>📍 {pharm.distance}</td>
                                  <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>₹{pharm.price.toFixed(2)}</td>
                                  <td style={{ padding: '12px' }}>
                                    {isLowest ? (
                                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        🟢 {diffPct.toFixed(1)}% Below Avg — BEST PRICE 🔥
                                      </span>
                                    ) : isHighest ? (
                                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        🔴 +{diffPct.toFixed(1)}% Above Avg — HIGHEST
                                      </span>
                                    ) : isCheaper ? (
                                      <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        🟢 {diffPct.toFixed(1)}% Below Avg
                                      </span>
                                    ) : (
                                      <span style={{ background: '#fff7ed', color: '#c2410c', padding: '4px 10px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        🔴 +{diffPct.toFixed(1)}% Above Avg
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <span style={{
                                      padding: '3px 10px',
                                      borderRadius: '12px',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      background: pharm.stock === 'In Stock' ? '#f0fdf4' : pharm.stock === 'Low Stock' ? '#fefce8' : '#fef2f2',
                                      color: pharm.stock === 'In Stock' ? '#16a34a' : pharm.stock === 'Low Stock' ? '#ca8a04' : '#dc2626'
                                    }}>
                                      {pharm.stock}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Pricing Intelligence Banner */}
          <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #0f766e10, #042a5910)', border: '1px solid #0f766e33', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ background: '#0f766e', color: 'white', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                <FiCpu size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Nearby Market Price Intelligence Summary
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
              💡 <strong>Market Trend:</strong> <strong>MedPlus Pharmacy</strong> offers the lowest average prices across 5 out of 6 monitored essential medicines in the local 5km area, with savings up to 12.7% compared to local market averages.
            </p>
          </div>

        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">

          {/* Core Analytics Cards */}
          <div className="grid grid-3">
            <div className="glass-card stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiDollarSign color="var(--primary)" /> Sales Revenue</div>
              <div className="stat-value text-gradient">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <div className="stat-label">Total Completed Revenue</div>
            </div>
            <div className="glass-card stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiActivity color="var(--success)" /> Most Ordered Medication</div>
              <div className="stat-value text-gradient" style={{ fontSize: '1.5rem' }}>{topMedicine}</div>
              <div className="stat-label">{topMedicineCount} Units Sold</div>
            </div>
            <div className="glass-card stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiMapPin color="var(--secondary)" /> Highest Demand Region</div>
              <div className="stat-value text-gradient" style={{ fontSize: '1.5rem' }}>{topRegion}</div>
              <div className="stat-label">{topRegionPercentage}% of total orders</div>
            </div>
          </div>

          {/* Charts Container */}
          <div className="pharmacy-analytics-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 className="heading-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <FiTrendingUp color="var(--primary)" /> Sales Revenue Trends
              </h3>
              <div style={{ flex: 1, minHeight: '260px', position: 'relative' }}>
                <canvas ref={salesChartRef}></canvas>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 className="heading-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <FiMapPin color="var(--secondary)" /> Regional Distribution
              </h3>
              <div style={{ flex: 1, minHeight: '260px', position: 'relative' }}>
                <canvas ref={regionChartRef}></canvas>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h3 className="heading-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FiPackage color="var(--success)" /> Popular Medications Sold
            </h3>
            <div style={{ flex: 1, minHeight: '260px', position: 'relative' }}>
              <canvas ref={medsChartRef}></canvas>
            </div>
          </div>

          {/* AI regional outbreak forecasts */}
          <div className="glass-card" style={{ padding: '32px', border: '1px solid var(--primary)', background: 'rgba(0,217,166,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(0,217,166,0.1)', color: 'var(--primary)', padding: '10px', borderRadius: '50%' }}>
                <FiCpu size={24} />
              </div>
              <div>
                <h3 className="heading-sm" style={{ margin: 0 }}>AI Public Health Trend Forecaster</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Predicting community disease outbreaks using regional purchase data.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', borderLeft: '4px solid var(--warning)' }}>
                <strong style={{ color: 'var(--warning)', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>⚠️ Seasonal Influenza Outbreak Detected</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  A 45% surge in Paracetamol and antihistamine orders in the <strong>Bandra (West)</strong> region suggests a seasonal flu outbreak.
                  We predict a <strong>30% increase</strong> in fever and cold medication demand in the next 10 days.
                  <strong> Action:</strong> Stock up on Paracetamol, Ebastine, and Cough Syrup formulations.
                </p>
              </div>

              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', borderLeft: '4px solid var(--primary)' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>📈 Asthma &amp; Bronchial Irritation Forecast</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Due to the elevated AQI indexes in <strong>Andheri West</strong>, inhalers and Levocetirizine demands have risen by 18% in the past week.
                  Predicting future demand for inhalers to remain high for the next 14 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bill Modal ── */}
      <AnimatePresence>
        {billOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: '24px'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setBillOrder(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border-color)',
                borderRadius: '16px', width: '100%', maxWidth: '560px',
                overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
              }}
            >
              {/* Modal header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiDollarSign color="var(--primary)" /> Invoice — Order #{billOrder.id}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handlePrintBill} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiPrinter size={14} /> Print / Save PDF
                  </button>
                  <button onClick={() => setBillOrder(null)} className="btn btn-ghost btn-icon"><FiX /></button>
                </div>
              </div>

              {/* Bill content (also used for printing) */}
              <div style={{ padding: '28px 24px' }} ref={billRef}>
                {/* Pharmacy header */}
                <div style={{ marginBottom: '20px', borderBottom: '2px solid var(--primary)', paddingBottom: '16px' }}>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                    <span style={{ color: 'var(--primary)' }}>MedAstraX</span> — Tax Invoice
                  </h1>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {billOrder.pharmacyName} &nbsp;|&nbsp; GST Reg. No: 27AABCU9603R1ZX
                  </p>
                </div>

                {/* Patient info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Bill To</span>
                    <strong>{billOrder.patientName}</strong>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{billOrder.address}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Invoice Date</span>
                    <strong>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Invoice #{billOrder.id}-{new Date().getFullYear()}</div>
                  </div>
                </div>

                {/* Medicines table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '16px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: 600 }}>Medicine</th>
                      <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>Dosage</th>
                      <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(billOrder.parsedMeds || []).map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td data-label="Medicine" style={{ padding: '10px 0', fontWeight: 500 }}>{m.name || '—'}</td>
                        <td data-label="Dosage" style={{ padding: '10px', textAlign: 'center', color: 'var(--text-secondary)' }}>{m.dosage || '—'}</td>
                        <td data-label="Duration" style={{ padding: '10px', textAlign: 'center', color: 'var(--text-secondary)' }}>{m.duration || '—'}</td>
                      </tr>
                    ))}
                    {(!billOrder.parsedMeds || billOrder.parsedMeds.length === 0) && (
                      <tr>
                        <td data-label="Message" colSpan={3} style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Prescribed medications</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{ background: 'rgba(0,217,166,0.04)', border: '1px solid rgba(0,217,166,0.2)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Medicines Subtotal</span>
                    <span>₹{billOrder.medicineAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Delivery Charges</span>
                    <span>₹{billOrder.deliveryCharges.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>GST (5%)</span>
                    <span>₹{(billOrder.medicineAmount * 0.05).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '1px solid rgba(0,217,166,0.3)', paddingTop: '12px' }}>
                    <span>Grand Total</span>
                    <span style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>
                      ₹{(billOrder.amount + billOrder.medicineAmount * 0.05).toFixed(2)}
                    </span>
                  </div>
                </div>

                <p style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Thank you for using MedAstraX. This is a computer-generated invoice and does not require a signature.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
