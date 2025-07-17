import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getFirebaseErrorMessage } from '../../../utils/firebaseErrors';
import './UpdateEmail.css';

export default function UpdateEmail() {
  const { currentUser, updateEmail: updateUserEmail } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate inputs
    if (!newEmail || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (newEmail === currentUser.email) {
      setError('This is already your current email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      // First reauthenticate, then update email
      await updateUserEmail(newEmail, password);
      
      setMessage('Email updated successfully!');
      setNewEmail('');
      setPassword('');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h2>Update Email Address</h2>
      
      {error && <div className="alert error-alert">{error}</div>}
      {message && <div className="alert success-alert">{message}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Current Email</label>
          <input 
            type="email" 
            value={currentUser.email || ''} 
            disabled 
          />
        </div>
        
        <div className="form-group">
          <label>New Email Address</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            placeholder="Enter new email"
          />
        </div>
        
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password for verification"
          />
        </div>
        
        <button 
          disabled={loading} 
          type="submit"
          className="primary-button"
        >
          {loading ? 'Updating...' : 'Update Email'}
        </button>
      </form>
    </div>
  );
}