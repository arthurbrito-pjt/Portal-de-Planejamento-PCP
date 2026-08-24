import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBTQkECdYZAfeztZn0I35xNxTOXfwmOWqM",
  authDomain: "slitterpcp.firebaseapp.com",
  projectId: "slitterpcp",
  storageBucket: "slitterpcp.firebasestorage.app",
  messagingSenderId: "1041964906397",
  appId: "1:1041964906397:web:74c0cd0954ae4da6f02174",
  measurementId: "G-5T6Q0WPZ9L"
};

// Initialize Firebase (guard against multiple initializations in dev/hot reload)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
