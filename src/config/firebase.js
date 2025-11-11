import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmBTVlO7QZEZCVZNVFtft8tsdvxLQXfbc",
  authDomain: "travelapp-security.firebaseapp.com",
  projectId: "travelapp-security",
  storageBucket: "travelapp-security.firebasestorage.app",
  messagingSenderId: "287074076883",
  appId: "1:287074076883:web:1374756600c2b107942c26",
  measurementId: "G-ZL5EHSNQ9T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

