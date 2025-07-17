import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Fetch additional user data from Firestore
  const fetchUserData = async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Email/password signup
  const signup = async (email, password, additionalData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save additional user data to Firestore
      await saveAdditionalUserData(userCredential.user.uid, {
        email,
        ...additionalData
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      return userCredential;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  // Save additional user data to Firestore
  const saveAdditionalUserData = async (userId, userData) => {
    try {
      await setDoc(doc(db, "users", userId), {
        ...userData,
        uid: userId,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        emailVerified: false
      });
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    }
  };

  // Email/password login
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      if (userCredential.user) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          lastLogin: new Date().toISOString()
        }, { merge: true });
      }
      
      return userCredential;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Password reset
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  // Update email with reauthentication
  const updateUserEmail = async (newEmail, password) => {
    try {
      // Reauthenticate user first
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update email
      await updateEmail(currentUser, newEmail);
      
      // Update email in Firestore
      await setDoc(doc(db, "users", currentUser.uid), {
        email: newEmail,
        emailVerified: false
      }, { merge: true });
      
      // Send new verification email
      await sendEmailVerification(currentUser);
    } catch (error) {
      console.error("Email update error:", error);
      throw error;
    }
  };

  // Update password with reauthentication
  const updateUserPassword = async (newPassword, currentPassword) => {
    try {
      // Reauthenticate user first
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, newPassword);
    } catch (error) {
      console.error("Password update error:", error);
      throw error;
    }
  };

  // Google sign-in
  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (!userDoc.exists()) {
        // Save new user data
        await saveAdditionalUserData(userCredential.user.uid, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          provider: 'google',
          emailVerified: true
        });
      } else {
        // Update last login time
        await setDoc(doc(db, "users", userCredential.user.uid), {
          lastLogin: new Date().toISOString()
        }, { merge: true });
      }
      
      return userCredential;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  // Send email verification
  const sendVerificationEmail = async () => {
    try {
      await sendEmailVerification(currentUser);
    } catch (error) {
      console.error("Email verification error:", error);
      throw error;
    }
  };

  // Reauthenticate user (for sensitive operations)
  const reauthenticate = async (password) => {
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );
      await reauthenticateWithCredential(currentUser, credential);
      return true;
    } catch (error) {
      console.error("Reauthentication error:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserEmail,
    updateUserPassword,
    googleSignIn,
    sendVerificationEmail,
    reauthenticate,
    saveAdditionalUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}