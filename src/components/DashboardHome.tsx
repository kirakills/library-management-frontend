import React from 'react';

const DashboardHome: React.FC = () => {
  return (
    <div className="dashboard-home-container">
      <h2>Welcome to Your Library Management Dashboard</h2>
      <p>Select an option from the sidebar to get started.</p>
      {/* You can add an illustration or more dynamic content here */}
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        {/* Placeholder for an image like in your example */}
        {/* <img src="/path/to/your/illustration.png" alt="Welcome" style={{ maxWidth: '300px', opacity: 0.8 }} /> */}
        <p style={{ fontStyle: 'italic', color: '#666', marginTop: '20px' }}>
          "The book is always written by two: the one who writes it, and the one who reads it."
        </p>
        <p style={{ fontStyle: 'italic', color: '#666' }}>
          - Dezső Kosztolányi
        </p>
      </div>
    </div>
  );
};

export default DashboardHome;