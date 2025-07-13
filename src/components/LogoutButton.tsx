import React from 'react';
import { useAuth } from '../context/AuthContext';

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await logout();
      } catch (err: any) {
        alert(`Logout failed: ${err.message}`);
      }
    }
  };

  return (
    <button onClick={handleLogout} style={{ marginLeft: '10px', padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
      Logout
    </button>
  );
};

export default LogoutButton;