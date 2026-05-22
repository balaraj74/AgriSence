
'use client';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth, storage, db } from '@/lib/firebase/config';
import { doc, updateDoc, arrayUnion, serverTimestamp, setDoc } from 'firebase/firestore';

export async function updateUserProfile(formData: FormData) {
    const user = auth.currentUser;
    if (!user) {
        return { success: false, error: 'User not authenticated.' };
    }

    const displayName = formData.get('displayName') as string;
    const photoFile = formData.get('photo') as File | null;
    let photoURL: string | undefined = undefined;

    try {
        if (photoFile && photoFile.size > 0) {
            const storageRef = ref(storage, `profile-pictures/${user.uid}/${photoFile.name}`);
            const snapshot = await uploadBytes(storageRef, photoFile);
            photoURL = await getDownloadURL(snapshot.ref);
        }

        const updatePayload: { displayName?: string; photoURL?: string } = {};
        
        if (displayName && displayName !== user.displayName) {
            updatePayload.displayName = displayName;
        }
        if (photoURL) {
            updatePayload.photoURL = photoURL;
        }

        if (Object.keys(updatePayload).length > 0) {
            await updateProfile(user, updatePayload);
        }

        return { success: true, photoURL: photoURL || user.photoURL };

    } catch (error: any) {
        console.error("Error updating profile: ", error);
        return { success: false, error: error.message || 'Failed to update profile.' };
    }
}

/**
 * Stores the user's FCM token in their Firestore document.
 * @param userId The UID of the user.
 * @param token The FCM registration token.
 */
export async function addFcmTokenToUser(userId: string, token: string) {
    if (!userId || !token) return;
    try {
        const userDocRef = doc(db, 'users', userId);
        // Using setDoc with merge:true will create the document if it doesn't exist,
        // or update it if it does. This prevents the "No document to update" error.
        await setDoc(userDocRef, {
            fcmTokens: arrayUnion(token),
            lastUpdated: serverTimestamp()
        }, { merge: true });
        console.log(`FCM token saved for user ${userId}`);
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
}
