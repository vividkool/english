import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_Hjx1xD0Xv0TSF9fQggesAtHzcDtRiC8",
  authDomain: "english-c8526.firebaseapp.com",
  projectId: "english-c8526",
  storageBucket: "english-c8526.firebasestorage.app",
  messagingSenderId: "864585811141",
  appId: "1:864585811141:web:7ddf03540b4e53e7f5dcac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
