import React, { useState, useEffect } from 'react';
import { FiRefreshCcw, FiCheckCircle, FiXCircle, FiPlay, FiServer } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function BackgroundJobsDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.data || []);
      }
    } catch (e) {
      console.warn("Backend jobs not reachable");
    } finally {
      setLoading(false);
    }
  };

  const simulateNewJob = async () => {
    const jobNames = ["Process 10K Medical Records", "Generate Global AI Report", "Sync Twilio Logs", "Run Weekly Analytics"];
    const randomName = jobNames[Math.floor(Math.random() * jobNames.length)];
    try {
      await fetch(`http://localhost:5000/api/jobs/submit?name=${encodeURIComponent(randomName)}`, { method: 'POST' });
      toast.success(`Job '${randomName}' submitted to background queue.`);
      fetchJobs();
    } catch (e) {
      toast.error('Failed to submit job.');
    }
  };

  const retryJob = async (jobId) => {
    try {
      await fetch(`http://localhost:5000/api/jobs/${jobId}/retry`, { method: 'POST' });
      toast.success(`Retry initiated for Job ${jobId}`);
      fetchJobs();
    } catch (e) {
      toast.error('Failed to retry job.');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a' }}>
            <FiServer color="#6366f1" /> Background Task Runner
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Asynchronous Job Queue with Auto-Retries and Non-Blocking UI</p>
        </div>
        <button 
          onClick={simulateNewJob}
          style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
        >
          <FiPlay /> Trigger Test Job
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Job Name</th>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Result/Error</th>
              <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && jobs.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>Loading queue...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No background jobs running.</td></tr>
            ) : (
              jobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>{job.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {job.status === 'PENDING' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d97706', background: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                        <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px', borderColor: '#d97706', borderRightColor: 'transparent' }}></div> PROCESSING
                      </span>
                    ) : job.status === 'COMPLETED' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', background: '#dcfce7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                        <FiCheckCircle /> COMPLETED
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ef4444', background: '#fee2e2', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                        <FiXCircle /> FAILED
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.9rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {job.result || job.errorReason || '-'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {job.status === 'FAILED' && (
                      <button 
                        onClick={() => retryJob(job.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        <FiRefreshCcw /> Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
