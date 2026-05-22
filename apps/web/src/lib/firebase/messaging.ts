
'use client';

import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app } from './config';

// THIS IS THE VAPID KEY FROM YOUR FIREBASE PROJECT SETTINGS
const VAPID_KEY = "BGnBKRRM_xePdhlIt2OlEj8kdEmQI8y_EQ7UwfyigIJb0xnuHwI_RTWP-UVGBX8aEnd5M5YehQUNQnf6Y01BL94";

export const getFcmToken = async () => {
  const isFcmSupported = await isSupported();
  if (!isFcmSupported) {
    console.log("Firebase Messaging is not supported in this browser.");
    return null;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted.');
      return null;
    }
    
    const messaging = getMessaging(app);

    // 1. Register the service worker explicitly.
    const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    
    // 2. Wait for the service worker to be ready. This is crucial.
    await navigator.serviceWorker.ready;

    console.log('Requesting FCM token...');
    // 3. Get the token, passing in the now-active service worker registration.
    const fcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration,
    });
    
    if (fcmToken) {
        console.log('FCM Token received:', fcmToken);
    } else {
        console.log('Could not get FCM token.');
    }
    return fcmToken;

  } catch (error) {
    console.error('An error occurred while retrieving FCM token:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    isSupported().then(supported => {
      if (supported) {
        const messaging = getMessaging(app);
        onMessage(messaging, (payload) => {
          resolve(payload);
        });
      }
    });
  });
