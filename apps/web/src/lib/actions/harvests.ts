
'use client';

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Harvest } from '@/types';

export type HarvestFormInput = Omit<Harvest, 'id' | 'harvestDate'> & {
    harvestDate: string;
};

const docToHarvest = (doc: any): Harvest => {
    const data = doc.data();
    return {
        id: doc.id,
        cropId: data.cropId,
        cropName: data.cropName,
        quantity: data.quantity,
        unit: data.unit,
        notes: data.notes,
        harvestDate: (data.harvestDate as Timestamp).toDate(),
    };
};

const getHarvestsCollection = (userId: string) => {
    return collection(db, 'users', userId, 'harvests');
}

export async function getHarvests(userId: string): Promise<Harvest[]> {
    if (!userId) return [];
    try {
        const harvestsCollection = getHarvestsCollection(userId);
        const q = query(harvestsCollection, orderBy("harvestDate", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docToHarvest);
    } catch (error) {
        console.error("Error fetching harvests: ", error);
        return [];
    }
}

export async function addHarvest(userId: string, data: HarvestFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const dataToSave = {
            ...data,
            harvestDate: Timestamp.fromDate(new Date(data.harvestDate)),
        };
        const harvestsCollection = getHarvestsCollection(userId);
        await addDoc(harvestsCollection, dataToSave);
        return { success: true };
    } catch (error) {
        console.error("Error adding harvest: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to add harvest. Details: ${errorMessage}` };
    }
}

export async function updateHarvest(userId: string, id: string, data: HarvestFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const harvestRef = doc(db, 'users', userId, 'harvests', id);
        const dataToUpdate = {
            ...data,
            harvestDate: Timestamp.fromDate(new Date(data.harvestDate)),
        };
        await updateDoc(harvestRef, dataToUpdate);
        return { success: true };
    } catch (error) {
        console.error("Error updating harvest: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to update harvest. Details: ${errorMessage}` };
    }
}

export async function deleteHarvest(userId: string, id: string) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const harvestRef = doc(db, 'users', userId, 'harvests', id);
        await deleteDoc(harvestRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting harvest: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to delete harvest. Details: ${errorMessage}` };
    }
}
