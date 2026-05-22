
'use client';

import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Crop, CropTask } from '@/types';
import { generateCropCalendar, AIGeneratedTask } from '@/ai/flows/generate-crop-calendar';
import { parse, isValid, getYear } from 'date-fns';

// This is the data shape for client-to-server communication, ensuring dates are strings.
export type CropFormInput = Omit<Crop, 'id' | 'plantedDate' | 'harvestDate' | 'calendar'> & {
    plantedDate: string | null;
    harvestDate: string | null;
};

// Helper function to parse AI-generated date ranges into concrete dates
const parseDateRange = (range: string, year: number): { startDate: Date, endDate: Date } => {
    const parts = range.split(' - ').map(p => p.trim());
    const parseWithYear = (dateStr: string) => {
        const fullDateStr = `${dateStr} ${year}`;
        let dt = parse(fullDateStr, 'MMMM d yyyy', new Date());
        if (!isValid(dt)) {
            dt = parse(fullDateStr, 'MMM d yyyy', new Date());
        }
        return dt;
    };
    const startDate = parseWithYear(parts[0]);
    const endDate = parts.length > 1 ? parseWithYear(parts[1]) : startDate;

    if (!isValid(startDate) || !isValid(endDate)) {
        console.warn(`Could not parse date range: "${range}". Using current date.`);
        const now = new Date();
        return { startDate: now, endDate: now };
    }
    return { startDate, endDate };
}

const docToCrop = (doc: any): Crop => {
    const data = doc.data();
    const calendarTasks = (data.calendar || []).map((task: any) => ({
        ...task,
        startDate: task.startDate ? (task.startDate as Timestamp).toDate() : new Date(),
        endDate: task.endDate ? (task.endDate as Timestamp).toDate() : new Date(),
    }));
    return {
        id: doc.id,
        name: data.name,
        status: data.status,
        notes: data.notes || null,
        plantedDate: data.plantedDate ? (data.plantedDate as Timestamp).toDate() : null,
        harvestDate: data.harvestDate ? (data.harvestDate as Timestamp).toDate() : null,
        calendar: calendarTasks,
        region: data.region || null,
    };
};

const getCropsCollection = (userId: string) => {
    return collection(db, 'users', userId, 'crops');
}

export async function getCrops(userId: string): Promise<Crop[]> {
    if (!userId) return [];
    try {
        const cropsCollection = getCropsCollection(userId);
        const q = query(cropsCollection, orderBy("plantedDate", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docToCrop);
    } catch (error) {
        console.error("Error fetching crops: ", error);
        return [];
    }
}

export async function addCrop(userId: string, data: CropFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const cropsCollection = getCropsCollection(userId);
        let calendar: CropTask[] = [];

        if (data.region && data.name) {
            try {
                const { tasks } = await generateCropCalendar({ cropName: data.name, region: data.region });
                const referenceDate = data.plantedDate ? new Date(data.plantedDate) : new Date();
                const calendarYear = getYear(referenceDate);
                calendar = tasks.map((task: AIGeneratedTask) => {
                    const { startDate, endDate } = parseDateRange(task.dateRange, calendarYear);
                    return { taskName: task.taskName, startDate, endDate, isCompleted: false };
                });
            } catch (aiError) {
                console.error("AI Calendar generation failed:", aiError);
            }
        }
        
        const dataToSave = {
            ...data,
            plantedDate: data.plantedDate ? Timestamp.fromDate(new Date(data.plantedDate)) : null,
            harvestDate: data.harvestDate ? Timestamp.fromDate(new Date(data.harvestDate)) : null,
            calendar: calendar.map(task => ({
                ...task,
                startDate: Timestamp.fromDate(task.startDate),
                endDate: Timestamp.fromDate(task.endDate),
            })),
        };
        
        await addDoc(cropsCollection, dataToSave);
        return { success: true };
    } catch (error) {
        console.error("Error adding crop: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to add crop. Details: ${errorMessage}` };
    }
}

export async function updateCrop(userId: string, id: string, data: Partial<CropFormInput & { calendar?: CropTask[] }>) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const cropRef = doc(db, 'users', userId, 'crops', id);
        const dataToUpdate: { [key: string]: any } = {};

        Object.keys(data).forEach(key => {
            const value = data[key as keyof typeof data];
            if (key === 'plantedDate' || key === 'harvestDate') {
                if(value) dataToUpdate[key] = Timestamp.fromDate(new Date(value as string));
            } else if (key === 'calendar' && Array.isArray(value)) {
                 dataToUpdate[key] = value.map(task => ({
                    ...task,
                    startDate: Timestamp.fromDate(new Date(task.startDate)),
                    endDate: Timestamp.fromDate(new Date(task.endDate)),
                }));
            } else {
                dataToUpdate[key] = value;
            }
        });

        if (Object.keys(dataToUpdate).length === 0) {
            return { success: true, message: "No changes to update." };
        }

        await updateDoc(cropRef, dataToUpdate);
        return { success: true };
    } catch (error) {
        console.error("Error updating crop: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to update crop. Details: ${errorMessage}` };
    }
}

export async function deleteCrop(userId: string, id: string) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const cropRef = doc(db, 'users', userId, 'crops', id);
        await deleteDoc(cropRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting crop: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to delete crop. Details: ${errorMessage}` };
    }
}
