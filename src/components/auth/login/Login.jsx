import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getFirebaseErrorMessage } from '../../../utils/firebaseErrors';
import { validateEmail } from '../../../utils/validation';
import './login.css';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, googleSignIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  // Validate form on input changes
  useEffect(() => {
    if (touched.email || touched.password) {
      validateForm();
    }
  }, [touched.email, touched.password]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!emailRef.current?.value) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(emailRef.current.value)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!passwordRef.current?.value) {
      newErrors.password = 'Password is required';
    } else if (passwordRef.current.value.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!validateForm()) {
      toast.error('Please fix the errors in the form', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    try {
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      
      toast.success('🎉 Login successful! Redirecting...', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        theme: "colored",
        onClose: () => navigate('/gold/dashboard')
      });
      
    } catch (err) {
      let errorMessage = getFirebaseErrorMessage(err);
      
      // Enhance specific error messages
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again or reset your password.';
      }
      
      toast.error(`❌ ${errorMessage}`, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      await googleSignIn();
      
      toast.success('🎉 Google login successful! Redirecting...', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        theme: "colored",
        onClose: () => navigate('/gold/dashboard')
      });
      
    } catch (err) {
      toast.error(`❌ Google login failed: ${getFirebaseErrorMessage(err)}`, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <ToastContainer />
      <div className="auth-header">
        <h2>Welcome Back</h2>
        <p>Log in to access your gold trading dashboard</p>
      </div>
      
      <form onSubmit={handleSubmit} noValidate>
        <div className={`form-group ${touched.email && errors.email ? 'error' : ''}`}>
          <label>Email Address</label>
          <input 
            type="email" 
            ref={emailRef} 
            required
            onBlur={() => handleBlur('email')}
            onChange={() => validateForm()}
            className={touched.email && errors.email ? 'error' : ''}
          />
          {touched.email && errors.email && (
            <div className="error-message">{errors.email}</div>
          )}
        </div>
        
        <div className={`form-group ${touched.password && errors.password ? 'error' : ''}`}>
          <label>Password</label>
          <input 
            type="password" 
            ref={passwordRef} 
            required
            minLength="6"
            onBlur={() => handleBlur('password')}
            onChange={() => validateForm()}
            className={touched.password && errors.password ? 'error' : ''}
          />
          {touched.password && errors.password && (
            <div className="error-message">{errors.password}</div>
          )}
        </div>
        
        <div className="form-options">
          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <Link to="/forgot-password" className="forgot-password">
            Forgot Password?
          </Link>
        </div>
        
        <button 
          disabled={loading || Object.keys(errors).length > 0} 
          type="submit"
          className="primary-button"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Logging In...
            </>
          ) : 'Log In'}
        </button>
      </form>
      
      <div className="divider">
        <span>OR</span>
      </div>
      
      <button 
        onClick={handleGoogleSignIn} 
        disabled={loading}
        className="google-button"
      >
        <img src="/images/google-icon.webp" alt="Google" />
        {loading ? 'Logging In...' : 'Continue with Google'}
      </button>
      
      <div className="auth-footer">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
}