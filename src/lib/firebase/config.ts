
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";
import { getPerformance } from "firebase/performance";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getDatabase, type Database } from "firebase/database";

// Your web app's Firebase configuration for agrisence-1dc30
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAd8T2SnKYd0lC464LCU8SPloORnCtf2f8",
    authDomain: "agrisence-1dc30.firebaseapp.com",
    databaseURL: "https://agrisence-1dc30-default-rtdb.firebaseio.com",
    projectId: "agrisence-1dc30",
    storageBucket: "agrisence-1dc30.firebasestorage.app",
    messagingSenderId: "948776556057",
    appId: "1:948776556057:web:59c34ba4ceffdd5901bc88",
    measurementId: "G-NZ199RVD5G"
};

// Initialize Firebase for client-side usage
let app: FirebaseApp;
let analytics: Analytics | null = null;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

// Initialize Performance Monitoring and Analytics (client-side only)
if (typeof window !== 'undefined') {
    getPerformance(app);
    analytics = getAnalytics(app);
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const realtimeDb: Database = getDatabase(app);

export { app, db, storage, auth, analytics, realtimeDb, firebaseConfig };

