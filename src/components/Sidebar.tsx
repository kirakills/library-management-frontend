import React from 'react';
import { useAuth } from '../context/AuthContext';
import LogoutButton from './LogoutButton';
import { NavItem } from '../interfaces'; // Import NavItem interface

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPage }) => {
  const { user } = useAuth();

  // Define navigation items with their labels, icons, and roles required
  const navItems: NavItem[] = [ // Explicitly type navItems array
    { id: 'home', label: 'Dashboard Home', icon: 'fas fa-home' },
    { id: 'loans_reservations', label: 'Loan/Return', icon: 'fas fa-exchange-alt' }, // No roles property - visible to all authenticated
    { id: 'books', label: 'Manage Books', icon: 'fas fa-book' }, // No roles property - visible to all authenticated
    { id: 'members', label: 'Manage Members', icon: 'fas fa-users' }, // No roles property - visible to all authenticated
    { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' }, // Accessible to all authenticated
    // You can add 'User Management' for Admin only, e.g.:
    // { id: 'users', label: 'Manage Users', icon: 'fas fa-user-cog', roles: ['Administrator'] },
  ];

  // Helper function to check if the current user has access to a navigation item
  const hasAccess = (itemRoles?: string[]) => {
    // If no specific roles are defined for an item, it's accessible to all authenticated users.
    if (!itemRoles || itemRoles.length === 0) return true;
    // If user or user.roles is not defined (not authenticated or malformed user object), no access.
    if (!user || !user.roles) return false;
    // Check if the user has any of the required roles.
    return itemRoles.some(role => user.roles.includes(role));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Hello {user?.full_name || user?.username}!</h3>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {navItems.map(item => (
            // FIX IS HERE: hasAccess(item.roles || []) ensures item.roles is always an array
            hasAccess(item.roles || []) && (
              <li key={item.id} className={currentPage === item.id ? 'active' : ''}>
                <a href="#" onClick={() => onNavigate(item.id)}>
                  <i className={item.icon}></i> {item.label}
                </a>
              </li>
            )
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        {user && ( // Logout button always visible if authenticated
          <>
            <LogoutButton />
          </>
        )}
        <a href="#" onClick={() => onNavigate('settings')}>
          <i className="fas fa-cog"></i> Settings
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;