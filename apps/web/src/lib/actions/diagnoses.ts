
'use client';

import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { DiagnosisRecord } from '@/types';

// This is the data shape for client-to-server communication, ensuring dates are strings.
export type DiagnosisFormInput = Omit<DiagnosisRecord, 'id' | 'timestamp'>;

const docToDiagnosis = (doc: any): DiagnosisRecord => {
    const data = doc.data();
    return {
        id: doc.id,
        plantName: data.plantName,
        diseaseName: data.diseaseName,
        severity: data.severity,
        confidenceScore: data.confidenceScore,
        imageUrl: data.imageUrl,
        geolocation: data.geolocation,
        timestamp: (data.timestamp as Timestamp).toDate(),
    };
};

const getDiagnosesCollection = (userId: string) => {
    return collection(db, 'users', userId, 'diagnoses');
}

export async function getDiagnosisHistory(userId: string): Promise<DiagnosisRecord[]> {
    if (!userId) return [];
    try {
        const diagnosesCollection = getDiagnosesCollection(userId);
        const q = query(diagnosesCollection, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docToDiagnosis);
    } catch (error) {
        console.error("Error fetching diagnosis history: ", error);
        return [];
    }
}

export async function addDiagnosisRecord(userId: string, data: DiagnosisFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const dataToSave = {
            ...data,
            timestamp: Timestamp.now(),
        };
        const diagnosesCollection = getDiagnosesCollection(userId);
        await addDoc(diagnosesCollection, dataToSave);
        return { success: true };
    } catch (error) {
        console.error("Error adding diagnosis record: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to add record. Details: ${errorMessage}` };
    }
}
