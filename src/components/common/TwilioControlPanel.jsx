import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiSend, FiPhoneCall, FiCheckCircle, FiLoader, FiShield } from 'react-icons/fi';
import { sendTwilioSmsApi, makeTwilioCallApi } from '../../services/twilioApiService';

const TwilioControlPanel = () => {
  const [phoneNumber, setPhoneNumber] = useState('+917988766566');
  const [message, setMessage] = useState('Hello Rashika! This is a test SMS from MedAstraX.');
  const [callerNumber] = useState('+18167506748');
  
  const [sendingSms, setSendingSms] = useState(false);
  const [makingCall, setMakingCall] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  const handleSendSms = async () => {
    setSendingSms(true);
    toast.loading(`Sending SMS via Twilio to ${phoneNumber}...`, { id: 'twilio-status' });
    try {
      const res = await sendTwilioSmsApi(phoneNumber, message);
      setLastResponse({
        type: 'SMS',
        timestamp: new Date().toLocaleTimeString(),
        data: res
      });
      toast.success(`✅ SMS Sent Successfully to ${phoneNumber}!`, { id: 'twilio-status' });
    } catch (err) {
      console.error('Twilio SMS Error:', err);
      toast.error(`❌ Failed to send SMS: ${err.message}`, { id: 'twilio-status' });
    } finally {
      setSendingSms(false);
    }
  };

  const handleMakeCall = async () => {
    setMakingCall(true);
    toast.loading(`Initiating Twilio Voice Call to ${phoneNumber}...`, { id: 'twilio-status' });
    try {
      const res = await makeTwilioCallApi(phoneNumber);
      setLastResponse({
        type: 'CALL',
        timestamp: new Date().toLocaleTimeString(),
        data: res
      });
      toast.success(`📞 Voice Call Initiated to ${phoneNumber}! Speaking: "Hello! This is a test call from MedAstraX."`, { id: 'twilio-status', duration: 5000 });
    } catch (err) {
      console.error('Twilio Voice Call Error:', err);
      toast.error(`❌ Failed to make call: ${err.message}`, { id: 'twilio-status' });
    } finally {
      setMakingCall(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.03), rgba(37, 99, 235, 0.05))',
      border: '1px solid rgba(37, 99, 235, 0.2)',
      borderRadius: '20px',
      padding: '28px',
      margin: '20px 0',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
              T
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              MedAstraQ Twilio Integration Engine
            </h3>
          </div>
          <p style={{ margin: '4px 0 0 46px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Spring Boot REST Backend + React Axios Twilio SMS & Voice Call Controller
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#dbeafe', color: '#1e40af', padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
          <FiShield /> Caller ID: <span style={{ fontFamily: 'monospace' }}>{callerNumber}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Target Phone Number:
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '600',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
            SMS Body Message:
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: '500'
            }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <button
          onClick={handleSendSms}
          disabled={sendingSms}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: 'white',
            fontWeight: '800',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            transition: 'transform 0.2s'
          }}
        >
          {sendingSms ? <FiLoader className="spinner" /> : <FiSend />} Send SMS ({phoneNumber})
        </button>

        <button
          onClick={handleMakeCall}
          disabled={makingCall}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00b4b6, #009091)',
            color: 'white',
            fontWeight: '800',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 180, 182, 0.3)',
            transition: 'transform 0.2s'
          }}
        >
          {makingCall ? <FiLoader className="spinner" /> : <FiPhoneCall />} Make Call ({phoneNumber})
        </button>
      </div>

      {/* Response Display Box */}
      {lastResponse && (
        <div style={{ marginTop: '20px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiCheckCircle color="#00b4b6" /> Twilio {lastResponse.type} Response [{lastResponse.timestamp}]
            </span>
            <span style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
              HTTP 200 OK
            </span>
          </div>

          <pre style={{
            margin: 0,
            background: '#0f172a',
            color: '#38bdf8',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            overflowX: 'auto',
            fontFamily: 'monospace'
          }}>
            {JSON.stringify(lastResponse.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TwilioControlPanel;

