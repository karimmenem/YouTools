import React from 'react';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <div className="admin-content-wrapper">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
