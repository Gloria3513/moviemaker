import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpffNU8-sEOQjIZSMWzf2YcHEU5nfFE2I",
  authDomain: "moviemaker-207a7.firebaseapp.com",
  projectId: "moviemaker-207a7",
  storageBucket: "moviemaker-207a7.firebasestorage.app",
  messagingSenderId: "498954855261",
  appId: "1:498954855261:web:foa7572bb545f0961afeb4",
  measurementId: "G-D6TPW1MPSM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;