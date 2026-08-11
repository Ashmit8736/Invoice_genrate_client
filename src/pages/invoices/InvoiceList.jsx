import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Upload, Eye, Download } from 'lucide-react';
import api from '../../services/api';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data || []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsImporting(true);
      const res = await api.post('/invoices/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message);
      // Refresh list
      await fetchInvoices();
    } catch (error) {
      console.error("Failed to import invoices:", error);
      alert("Error importing invoices.");
    } finally {
      setIsImporting(false);
      // Reset input
      e.target.value = null;
    }
  };

  const downloadTemplate = () => {
    import('xlsx').then(xlsx => {
      const data = [{
        "Order ID": "ORD-001",
        "Invoice Date": "2026-08-11",
        "Customer Name": "John Doe",
        "Phone": "9876543210",
        "Shipping Address": "123 Main St, City",
        "State Code": "27",
        "GSTIN": "",
        "Payment Mode": "Online",
        "Fulfillment Type": "Courier",
        "Item Description": "Sample Product",
        "Quantity": 1,
        "Unit Price": 500,
        "GST Rate (%)": 18
      }];
      const worksheet = xlsx.utils.json_to_sheet(data);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Template");
      xlsx.writeFile(workbook, 'Invoice_Import_Format.xlsx');
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Invoices</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={downloadTemplate} className="btn btn-secondary">
            <Download size={18} />
            Blank Format
          </button>
          
          <label className="btn btn-secondary" style={{ cursor: isImporting ? 'not-allowed' : 'pointer', opacity: isImporting ? 0.7 : 1 }}>
            <Upload size={18} />
            {isImporting ? 'Importing...' : 'Import Excel'}
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
              disabled={isImporting}
            />
          </label>
          <Link to="/invoices/create" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            <PlusCircle size={18} />
            New Invoice
          </Link>
        </div>
      </div>
      
      <div className="glass-panel" style={{ padding: '1rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading invoices...</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.order_id}</td>
                      <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                      <td>{inv.customer_name}</td>
                      <td>
                        <span className={`badge ${inv.status.toLowerCase()}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>₹ {Number(inv.total_amount).toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/invoices/${inv.id}`} className="btn btn-secondary" style={{ padding: '0.4rem' }} title="View/Print">
                            <Eye size={16} />
                          </Link>
                          <Link to={`/invoices/${inv.id}`} className="btn btn-primary" style={{ padding: '0.4rem' }} title="Download PDF">
                            <Download size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">No invoices found. Create your first invoice!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
