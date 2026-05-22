
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getFcmToken, onMessageListener } from '@/lib/firebase/messaging';
import { useToast } from '@/hooks/use-toast';
import { addFcmTokenToUser } from '@/lib/actions/user';

export function FcmInitializer() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && user) {
      const handleFcmSetup = async () => {
        try {
          // 1. Request permission and get token
          const currentToken = await getFcmToken();

          if (currentToken) {
            console.log('FCM Token:', currentToken);
            // 2. Save the token to the user's document in Firestore
            await addFcmTokenToUser(user.uid, currentToken);
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }

          // 3. Listen for foreground messages
          onMessageListener()
            .then((payload) => {
              console.log('Received foreground message: ', payload);
              toast({
                title: payload.notification?.title,
                description: payload.notification?.body,
              });
              // Here you could also update a global state for notifications
              // to update the notification bell in real-time.
            })
            .catch((err) => console.log('failed: ', err));

        } catch (error) {
          console.error('An error occurred while setting up FCM.', error);
        }
      };

      handleFcmSetup();
    }
  }, [user, toast]);

  // This is a client component that doesn't render anything
  return null;
}
