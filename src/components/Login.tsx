import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, user, loadingAuth } = useAuth(); // Get isAuthenticated and user from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      // Login alert is handled in AuthContext
    } catch (err: any) {
      alert(`Login failed: ${err.message}`);
    }
  };

  if (loadingAuth) {
    return <div className="auth-container">Loading authentication...</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div className="auth-container">
        <p>Logged in as: <strong>{user.full_name || user.username}</strong> ({user.roles.join(', ')})</p>
        {/* Render a logout button here, or elsewhere in your App */}
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;