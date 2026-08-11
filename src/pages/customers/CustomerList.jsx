import React, { useState, useEffect } from 'react';
import { UserPlus, Save } from 'lucide-react';
import api from '../../services/api';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', shipping_address: '', phone: '', gstin: '', state_code: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', formData);
      setShowAddForm(false);
      setFormData({ name: '', shipping_address: '', phone: '', gstin: '', state_code: '' });
      fetchCustomers();
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Customers</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <UserPlus size={18} /> {showAddForm ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="input-label">Customer/Store Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} className="input-field" required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Shipping Address</label>
              <textarea name="shipping_address" value={formData.shipping_address} onChange={handleFormChange} className="input-field" rows="2" required />
            </div>
            <div>
              <label className="input-label">Buyer GSTIN (if any)</label>
              <input type="text" name="gstin" value={formData.gstin} onChange={handleFormChange} className="input-field" />
            </div>
            <div>
              <label className="input-label">State Code (First 2 digits of GSTIN)</label>
              <input type="text" name="state_code" value={formData.state_code} onChange={handleFormChange} className="input-field" maxLength="2" required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={18} /> Save Customer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>State Code</th>
                <th>GSTIN</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.state_code}</td>
                  <td>{c.gstin || 'N/A'}</td>
                  <td>{c.shipping_address}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan="5" className="text-center">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
