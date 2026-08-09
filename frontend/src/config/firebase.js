// Official Firebase Client Initialization for ProjectXia
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';

// Standard Firebase App Configuration for ProjectXia (projectxia-8f7bd)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA_ProjectXia_Firebase_Public_Auth_Key_2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'projectxia-8f7bd.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'projectxia-8f7bd',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'projectxia-8f7bd.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '987654321000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:987654321000:web:abcdef1234567890',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  app,
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
};
