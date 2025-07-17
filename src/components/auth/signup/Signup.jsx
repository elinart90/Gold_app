import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getFirebaseErrorMessage } from '../../../utils/firebaseErrors';
import { auth, db } from '../../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { 
  validateForm, 
  passwordRequirements,
  validatePassword 
} from '../../../utils/validation';
import './Signup.css';

export default function Signup() {
  const fullNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const addressRef = useRef();
  const agentNameRef = useRef();
  const phoneNumberRef = useRef();
  
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);
  const navigate = useNavigate();

  // Real-time password validation
  useEffect(() => {
    if (touchedFields.password && passwordRef.current?.value) {
      const validation = validatePassword(passwordRef.current.value);
      setPasswordStrength(validation);
    }
  }, [touchedFields.password]);

  const handleBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field) => {
    const formData = {
      fullName: fullNameRef.current?.value,
      email: emailRef.current?.value,
      password: passwordRef.current?.value,
      passwordConfirm: passwordConfirmRef.current?.value,
      address: addressRef.current?.value,
      agentName: agentNameRef.current?.value,
      phoneNumber: phoneNumberRef.current?.value
    };

    const { errors } = validateForm(formData);
    setFormErrors(prev => ({ ...prev, [field]: errors[field] }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    const formData = {
      fullName: fullNameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      passwordConfirm: passwordConfirmRef.current.value,
      address: addressRef.current.value,
      agentName: agentNameRef.current.value,
      phoneNumber: phoneNumberRef.current.value
    };

    const { isValid, errors } = validateForm(formData);
    setFormErrors(errors);

    if (!isValid) {
      // Highlight all fields with errors
      setTouchedFields({
        fullName: true,
        email: true,
        password: true,
        passwordConfirm: true,
        address: true,
        phoneNumber: true
      });
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: formData.fullName
      });

      // Create user document in Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        email: formData.email,
        fullName: formData.fullName,
        address: formData.address,
        agentName: formData.agentName || '',
        phoneNumber: formData.phoneNumber,
        createdAt: new Date(),
        lastLogin: new Date(),
        role: 'agent',
        active: true
      });

      // If agent name provided, create agent document
      if (formData.agentName) {
        const agentDocRef = doc(db, "agents", userCredential.user.uid);
        await setDoc(agentDocRef, {
          agentName: formData.agentName,
          userId: userCredential.user.uid,
          createdAt: new Date(),
          performance: {
            totalSales: 0,
            totalCommission: 0
          }
        });
      }

      // Show success message and redirect
      toast.success('Account created successfully! Redirecting...', {
        autoClose: 2000,
        onClose: () => navigate('/login')
      });

    } catch (error) {
      console.error("Signup error:", error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use. Please use another email or login.');
      } else {
        const errorMessage = getFirebaseErrorMessage(error) || 'An error occurred. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      toast.error('Google signup is currently unavailable');
    } catch (err) {
      console.error("Google signin error:", err);
      toast.error(getFirebaseErrorMessage(err) || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <div className="auth-header">
        <h2>Create Your Account</h2>
        <p>Join our platform to start managing gold transactions</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name*</label>
            <input 
              type="text" 
              ref={fullNameRef} 
              required 
              placeholder="John Doe"
              onBlur={() => handleBlur('fullName')}
              className={touchedFields.fullName && formErrors.fullName ? 'error' : ''}
            />
            {touchedFields.fullName && formErrors.fullName && (
              <div className="error-message">{formErrors.fullName}</div>
            )}
          </div>
          
          <div className="form-group">
            <label>Email*</label>
            <input 
              type="email" 
              ref={emailRef} 
              required 
              placeholder="example@domain.com"
              onBlur={() => handleBlur('email')}
              className={touchedFields.email && formErrors.email ? 'error' : ''}
            />
            {touchedFields.email && formErrors.email && (
              <div className="error-message">{formErrors.email}</div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Password*</label>
            <input 
              type="password" 
              ref={passwordRef} 
              required 
              minLength={passwordRequirements.minLength}
              placeholder={`At least ${passwordRequirements.minLength} characters`}
              onBlur={() => handleBlur('password')}
              onChange={() => validateField('password')}
              className={touchedFields.password && formErrors.password ? 'error' : ''}
            />
            {touchedFields.password && formErrors.password && (
              <div className="error-message">
                {Array.isArray(formErrors.password) ? (
                  <ul>
                    {formErrors.password.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                ) : formErrors.password}
              </div>
            )}
            {passwordStrength && (
              <div className="password-strength">
                <div className={`strength-meter ${passwordStrength.isValid ? 'strong' : 'weak'}`}>
                  <div style={{ width: passwordStrength.isValid ? '100%' : '50%' }}></div>
                </div>
                <span>{passwordStrength.isValid ? 'Strong password' : 'Weak password'}</span>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Confirm Password*</label>
            <input 
              type="password" 
              ref={passwordConfirmRef} 
              required 
              placeholder="Re-enter your password"
              onBlur={() => handleBlur('passwordConfirm')}
              className={touchedFields.passwordConfirm && formErrors.passwordConfirm ? 'error' : ''}
            />
            {touchedFields.passwordConfirm && formErrors.passwordConfirm && (
              <div className="error-message">{formErrors.passwordConfirm}</div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>Address*</label>
          <input 
            type="text" 
            ref={addressRef} 
            required 
            placeholder="123 Main St, City"
            onBlur={() => handleBlur('address')}
            className={touchedFields.address && formErrors.address ? 'error' : ''}
          />
          {touchedFields.address && formErrors.address && (
            <div className="error-message">{formErrors.address}</div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Agent Name</label>
            <input 
              type="text" 
              ref={agentNameRef} 
              placeholder="Your professional name"
              onBlur={() => handleBlur('agentName')}
              className={touchedFields.agentName && formErrors.agentName ? 'error' : ''}
            />
            <small>This will be displayed on your dashboard</small>
            {touchedFields.agentName && formErrors.agentName && (
              <div className="error-message">{formErrors.agentName}</div>
            )}
          </div>
          
          <div className="form-group">
            <label>Phone Number*</label>
            <input 
              type="tel" 
              ref={phoneNumberRef} 
              required 
              placeholder="+1234567890"
              onBlur={() => handleBlur('phoneNumber')}
              className={touchedFields.phoneNumber && formErrors.phoneNumber ? 'error' : ''}
            />
            {touchedFields.phoneNumber && formErrors.phoneNumber && (
              <div className="error-message">{formErrors.phoneNumber}</div>
            )}
          </div>
        </div>
        
        <div className="form-group checkbox-group">
          <input 
            type="checkbox" 
            id="terms" 
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <label htmlFor="terms">
            I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
          </label>
        </div>
        
        <button 
          disabled={loading} 
          type="submit"
          className="primary-button"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
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
        {loading ? 'Signing In...' : 'Continue with Google'}
      </button>
      
      <div className="auth-footer">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </div>
  );
}