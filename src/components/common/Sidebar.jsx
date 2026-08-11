import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Settings, Users } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar no-print glass-panel">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">❖</span>
          <h2>Invoicify</h2>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <div className="nav-section">MANAGEMENT</div>
        
        <NavLink to="/invoices" end className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <FileText size={20} />
          <span>All Invoices</span>
        </NavLink>
        
        <NavLink to="/invoices/create" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <PlusCircle size={20} />
          <span>Create Invoice</span>
        </NavLink>

        <NavLink to="/customers" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Users size={20} />
          <span>Customers</span>
        </NavLink>

        <div className="nav-section">CONFIGURATION</div>
        
        <NavLink to="/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
