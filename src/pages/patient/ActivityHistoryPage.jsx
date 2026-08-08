import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiSearch, FiCheckCircle, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ActivityHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.data || []);
      } else {
        setHistory(getMockHistory());
      }
    } catch (e) {
      console.warn("Backend not reachable, using mock history");
      setHistory(getMockHistory());
    } finally {
      setLoading(false);
    }
  };

  const getMockHistory = () => [
    { id: '1', actionType: 'SEND_SMS', description: 'Sent SMS to +1234567890', timestamp: Date.now() - 120000, status: 'SUCCESS' },
    { id: '2', actionType: 'MAKE_CALL', description: 'Initiated voice call to +1234567890', timestamp: Date.now() - 110000, status: 'SUCCESS' },
    { id: '3', actionType: 'AI_DIAGNOSIS', description: 'Generated skin care assessment report', timestamp: Date.now() - 3600000, status: 'SUCCESS' }
  ];

  const filteredHistory = history.filter(h => 
    h.actionType.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a' }}>
            <FiClock color="#3b82f6" /> Persistent Activity History
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Searchable record of all system actions, uploads, and AI runs.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search history..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px 12px 10px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '250px' }}
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Action Type</th>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Description</th>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Time</th>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>Loading history...</td></tr>
            ) : paginatedHistory.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No records found.</td></tr>
            ) : (
              paginatedHistory.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#3b82f6' }}>{log.actionType}</td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{log.description}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.9rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: log.status === 'SUCCESS' ? '#16a34a' : '#ef4444', background: log.status === 'SUCCESS' ? '#dcfce7' : '#fee2e2', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {log.status === 'SUCCESS' ? <FiCheckCircle /> : <FiInfo />} {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
        <button 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f1f5f9' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >
          Previous
        </button>
        <span style={{ padding: '8px 16px', fontWeight: 600 }}>Page {currentPage} of {totalPages || 1}</span>
        <button 
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(p => p + 1)}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === totalPages || totalPages === 0 ? '#f1f5f9' : 'white', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
