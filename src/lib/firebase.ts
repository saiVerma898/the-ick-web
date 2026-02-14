import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8rqjuJxxViwq2LsC4sftt3sXCz6D3tKc",
  authDomain: "theickkapp.firebaseapp.com",
  projectId: "theickkapp",
  storageBucket: "theickkapp.firebasestorage.app",
  messagingSenderId: "461460616482",
  appId: "1:461460616482:web:9b8e00044eefb3acd0217b",
  measurementId: "G-7H0KCTCS8W",
};

// Initialize Firebase (singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

let analytics;
// Initialize Analytics only on the client side
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, auth, analytics };
