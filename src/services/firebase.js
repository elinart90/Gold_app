import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDuB4j-LJNQPTCbfhWxvj7eishP4tYaxDQ",
  authDomain: "gold-1c3b8.firebaseapp.com",
  projectId: "gold-1c3b8",
  storageBucket: "gold-1c3b8.firebasestorage.app",
  messagingSenderId: "128824058791",
  appId: "1:128824058791:web:5ff9ed2356e1332a3e0c82",
  measurementId: "G-0H7DNGSM7V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable persistence
setPersistence(auth, browserLocalPersistence)
  .catch((err) => console.error("Auth persistence error:", err));

enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Offline persistence already enabled in another tab");
    } else if (err.code === 'unimplemented') {
      console.warn("Current browser doesn't support offline persistence");
    }
  });

export { auth, db };