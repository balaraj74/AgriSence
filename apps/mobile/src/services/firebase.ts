// Firebase configuration for AgriSence mobile app
// Uses the same Firebase project as the web app: agrisence-1dc30
import { initializeApp, getApps, getApp } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyAd8T2SnKYd0lC464LCU8SPloORnCtf2f8',
  authDomain: 'agrisence-1dc30.firebaseapp.com',
  databaseURL: 'https://agrisence-1dc30-default-rtdb.firebaseio.com',
  projectId: 'agrisence-1dc30',
  storageBucket: 'agrisence-1dc30.firebasestorage.app',
  messagingSenderId: '948776556057',
  appId: '1:948776556057:web:59c34ba4ceffdd5901bc88',
  measurementId: 'G-NZ199RVD5G',
};

// Initialize Firebase — react-native-firebase auto-reads google-services.json
// but we keep the config here for reference and web-compat usage.
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

export const firebaseApp = getApp();
export { firebaseConfig };
