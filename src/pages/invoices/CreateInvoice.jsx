import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, FileText } from 'lucide-react';
import api from '../../services/api';
import { calculateTaxes, numberToWords } from '../../utils/calculations';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [sellerSettings, setSellerSettings] = useState(null);
  
  const [formData, setFormData] = useState({
    order_id: `ORD-${Date.now()}`,
    invoice_date: new Date().toISOString().split('T')[0],
    payment_mode: 'Online',
    fulfillment_type: 'Courier',
    status: 'Paid',
    customer_id: ''
  });

  const [items, setItems] = useState([
    { description: '', supplier_name: '', quantity: 1, unit_price: 0, gst_rate: 18, total: 0 }
  ]);

  const [totals, setTotals] = useState({
    net_subtotal: 0,
    cgst_amount: 0,
    sgst_amount: 0,
    igst_amount: 0,
    total_amount: 0,
    amount_in_words: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, setRes] = await Promise.all([
          api.get('/customers'),
          api.get('/settings')
        ]);
        setCustomers(custRes.data || []);
        setSellerSettings(setRes.data || null);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [items, formData.customer_id, sellerSettings]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto calculate item total (excluding GST)
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unit_price);
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', supplier_name: '', quantity: 1, unit_price: 0, gst_rate: 18, total: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    if (!sellerSettings) return;

    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const selectedCustomer = customers.find(c => c.id.toString() === formData.customer_id.toString());
    const buyerStateCode = selectedCustomer ? selectedCustomer.state_code : '';
    const sellerStateCode = sellerSettings.state_code;

    items.forEach(item => {
      subtotal += Number(item.total);
      const taxes = calculateTaxes(Number(item.total), Number(item.gst_rate), sellerStateCode, buyerStateCode);
      
      totalCgst += taxes.cgst;
      totalSgst += taxes.sgst;
      totalIgst += taxes.igst;
    });

    const grandTotal = subtotal + totalCgst + totalSgst + totalIgst;
    
    setTotals({
      net_subtotal: subtotal.toFixed(2),
      cgst_amount: totalCgst.toFixed(2),
      sgst_amount: totalSgst.toFixed(2),
      igst_amount: totalIgst.toFixed(2),
      total_amount: grandTotal.toFixed(2),
      amount_in_words: numberToWords(Math.round(grandTotal))
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) {
      alert("Please select a customer");
      return;
    }

    try {
      const payload = {
        ...formData,
        ...totals,
        items
      };
      
      const res = await api.post('/invoices', payload);
      alert("Invoice created successfully!");
      navigate('/invoices'); // Or redirect to print preview
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice.");
    }
  };

  if (!sellerSettings) return <div style={{ padding: '2rem' }}>Please setup Company Settings first before creating an invoice.</div>;

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: '2rem' }}>Create Invoice</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--primary)' }}>Basic Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="input-label">Order ID</label>
              <input type="text" name="order_id" value={formData.order_id} onChange={handleFormChange} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Date</label>
              <input type="date" name="invoice_date" value={formData.invoice_date} onChange={handleFormChange} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Customer</label>
              <select name="customer_id" value={formData.customer_id} onChange={handleFormChange} className="input-field" required>
                <option value="">-- Select Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.gstin || 'No GST'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Payment Mode</label>
              <select name="payment_mode" value={formData.payment_mode} onChange={handleFormChange} className="input-field">
                <option value="Online">Online</option>
                <option value="COD">COD</option>
                <option value="Prepaid">Prepaid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Line Items</h2>
            <button type="button" onClick={addItem} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
              <Plus size={16} /> Add Item
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>Description</th>
                  <th style={{ width: '15%' }}>Supplier</th>
                  <th style={{ width: '10%' }}>Qty</th>
                  <th style={{ width: '15%' }}>Unit Price</th>
                  <th style={{ width: '10%' }}>GST %</th>
                  <th style={{ width: '10%' }}>Total</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="input-field" placeholder="Item name" required />
                    </td>
                    <td>
                      <input type="text" value={item.supplier_name} onChange={(e) => handleItemChange(index, 'supplier_name', e.target.value)} className="input-field" placeholder="Optional" />
                    </td>
                    <td>
                      <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="input-field" required />
                    </td>
                    <td>
                      <input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="input-field" required />
                    </td>
                    <td>
                      <select value={item.gst_rate} onChange={(e) => handleItemChange(index, 'gst_rate', e.target.value)} className="input-field">
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td>₹{Number(item.total).toFixed(2)}</td>
                    <td>
                      <button type="button" onClick={() => removeItem(index)} className="btn btn-danger" style={{ padding: '0.5rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', alignSelf: 'flex-end', minWidth: '350px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--primary)' }}>Totals</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Subtotal:</span>
            <span>₹ {totals.net_subtotal}</span>
          </div>
          
          {Number(totals.cgst_amount) > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                <span>CGST:</span>
                <span>₹ {totals.cgst_amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                <span>SGST:</span>
                <span>₹ {totals.sgst_amount}</span>
              </div>
            </>
          )}
          
          {Number(totals.igst_amount) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
              <span>IGST:</span>
              <span>₹ {totals.igst_amount}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>
            <span>Grand Total:</span>
            <span style={{ color: 'var(--success)' }}>₹ {totals.total_amount}</span>
          </div>
          
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Amount in words: {totals.amount_in_words}
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
            <Save size={18} /> Save & Generate Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
