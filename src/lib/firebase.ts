import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

// Firebase configuration for the dutu project
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with actual API key
  authDomain: "dutu-a3d9e.firebaseapp.com",
  projectId: "dutu-a3d9e",
  storageBucket: "dutu-a3d9e.appspot.com",
  messagingSenderId: "XXXXXXXXXX",
  appId: "1:XXXXXXXXXX:web:XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Firestore REST API base URL
export const FIRESTORE_BASE_URL = 'https://firestore.googleapis.com/v1/projects/dutu-a3d9e/databases/(default)/documents';

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

export const getCurrentDoctor = (): { doctorId: string | null; email: string | null } => {
  return {
    doctorId: localStorage.getItem('doctorId'),
    email: localStorage.getItem('doctorEmail')
  };
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
