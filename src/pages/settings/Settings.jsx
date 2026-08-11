import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import api from '../../services/api';

const Settings = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    address: '',
    gstin: '',
    pan: '',
    state_code: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data) {
          setFormData(res.data);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/settings', formData);
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Failed to update settings:", error);
      setMessage('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: '2rem' }}>Company Settings</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="input-label">Company Name</label>
            <input 
              type="text" 
              name="company_name" 
              value={formData.company_name} 
              onChange={handleChange} 
              className="input-field" 
              required 
            />
          </div>
          
          <div>
            <label className="input-label">Registered Office Address</label>
            <textarea 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              className="input-field" 
              rows="3" 
              required 
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="input-label">GSTIN</label>
              <input 
                type="text" 
                name="gstin" 
                value={formData.gstin} 
                onChange={handleChange} 
                className="input-field" 
                required 
              />
            </div>
            
            <div>
              <label className="input-label">PAN</label>
              <input 
                type="text" 
                name="pan" 
                value={formData.pan} 
                onChange={handleChange} 
                className="input-field" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="input-label">State Code (First 2 digits of GSTIN)</label>
            <input 
              type="text" 
              name="state_code" 
              value={formData.state_code} 
              onChange={handleChange} 
              className="input-field" 
              maxLength="2" 
              required 
            />
          </div>
          
          {message && <div style={{ color: message.includes('success') ? 'var(--success)' : 'var(--danger)' }}>{message}</div>}
          
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
