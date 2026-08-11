import React, { useState, useEffect } from 'react';
import { FileText, Users, CreditCard, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    // In a real app, you would have a dashboard specific endpoint
    const fetchData = async () => {
      try {
        const [invoicesRes, customersRes] = await Promise.all([
          api.get('/invoices'),
          api.get('/customers')
        ]);
        
        const invoices = invoicesRes.data || [];
        const customers = customersRes.data || [];
        
        const revenue = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
        
        setStats({
          totalInvoices: invoices.length,
          totalCustomers: customers.length,
          totalRevenue: revenue
        });
        
        setRecentInvoices(invoices.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(79, 70, 229, 0.2)', color: 'var(--primary)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Invoices</h3>
            <h2>{stats.totalInvoices}</h2>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Customers</h3>
            <h2>{stats.totalCustomers}</h2>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
            <CreditCard size={24} />
          </div>
          <div className="stat-info">
            <h3>Revenue</h3>
            <h2>₹ {stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
          </div>
        </div>
      </div>
      
      <div className="recent-section glass-panel">
        <h2>Recent Invoices</h2>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.length > 0 ? (
                recentInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.order_id}</td>
                    <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                    <td>{inv.customer_name}</td>
                    <td>₹ {Number(inv.total_amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No recent invoices found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
