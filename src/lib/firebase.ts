import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';

// Firebase configuration for the dutu project
const firebaseConfig = {
  apiKey: "AIzaSyCr9e8ZBFNYn1_UhEJJ1nlHQ9K8VcwdrPo",
  authDomain: "dutu-a3d9e.firebaseapp.com",
  projectId: "dutu-a3d9e",
  storageBucket: "dutu-a3d9e.firebasestorage.app",
  messagingSenderId: "1080106403900",
  appId: "1:1080106403900:web:60d39175b45011e3809b39",
  measurementId: "G-YPSZ1FZL8G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication functions
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store doctor info in localStorage
    localStorage.setItem('doctorId', user.uid);
    localStorage.setItem('doctorEmail', user.email || '');
    localStorage.setItem('isLoggedIn', 'true');
    
    return { success: true, user };
  } catch (error: any) {
    let errorMessage = 'An error occurred during login';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password';
        break;
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('doctorId');
    localStorage.removeItem('doctorEmail');
    localStorage.removeItem('isLoggedIn');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCurrentDoctor = (): { doctorId: string; email: string; name: string } => {
  return {
    doctorId: localStorage.getItem('doctorId') || '',
    email: localStorage.getItem('doctorEmail') || '',
    name: localStorage.getItem('doctorName') || 'Doctor'
  };
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
