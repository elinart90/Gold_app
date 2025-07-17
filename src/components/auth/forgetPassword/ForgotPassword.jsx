import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { validateEmail } from '../../../utils/validation';
import './forgetPassword.css';

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) {
      validateEmailField();
    }
  }, [touched]);

  const validateEmailField = () => {
    if (!emailRef.current.value) {
      setEmailError('Email is required');
      return false;
    }
    if (!validateEmail(emailRef.current.value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);

    if (!validateEmailField()) {
      return;
    }

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage('Check your inbox for further instructions');
    } catch (err) {
      let errorMessage = 'Failed to reset password';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later';
      } else {
        errorMessage += `: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2>Password Reset</h2>
        <p>Enter your email to receive a password reset link</p>
      </div>
      
      {error && (
        <div className="alert error-alert">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {message && (
        <div className="alert success-alert">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>{message}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} noValidate>
        <div className={`form-group ${emailError ? 'error' : ''}`}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            ref={emailRef}
            required
            onChange={() => setTouched(true)}
            onBlur={() => setTouched(true)}
            className={emailError ? 'error' : ''}
            placeholder="your@email.com"
          />
          {emailError && <div className="error-message">{emailError}</div>}
        </div>
        
        <button
          disabled={loading || !!emailError}
          type="submit"
          className="primary-button"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Sending...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
      
      <div className="auth-footer">
        Remember your password? <Link to="/login">Log In</Link>
      </div>
    </div>
  );
}