import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AccountSettings.css';

export default function AccountSettings() {
  const { currentUser, updateUserEmail, reauthenticate } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newEmail || !password) {
      setError('Please fill all fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      await reauthenticate(password);
      await updateUserEmail(newEmail);
      
      setMessage('Email updated successfully! Please verify your new email.');
      setNewEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h2>Account Settings</h2>
      
      <div className="settings-section">
        <h3>Update Email</h3>
        <p>Current email: {currentUser.email}</p>
        
        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </div>
    </div>
  );
}