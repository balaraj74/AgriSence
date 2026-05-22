'use client';

import { collection, addDoc, getDocs, doc, setDoc, getDoc, deleteDoc, query, orderBy, limit, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

/**
 * Store AI Results in Firestore for persistence and cross-feature integration
 */

// Types for stored AI results
export interface StoredWeatherData {
    id?: string;
    location: {
        name: string;
        latitude: number;
        longitude: number;
    };
    current: {
        temperature: number;
        humidity: number;
        windSpeed: number;
        weatherCode: number;
        description: string;
    };
    daily: Array<{
        date: string;
        maxTemp: number;
        minTemp: number;
        weatherCode: number;
    }>;
    timestamp: Date;
}

export interface StoredMarketPrice {
    id?: string;
    cropName: string;
    market: string;
    price: number;
    unit: string;
    trend: number;
    timestamp: Date;
}

export interface StoredSatelliteAnalysis {
    id?: string;
    fieldId: string;
    fieldName: string;
    overallHealth: 'Healthy' | 'Moderate' | 'Stressed';
    healthScore: number;
    advice: string;
    timestamp: Date;
}

export interface StoredChatMessage {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    suggestedFollowups?: string[];
    confidence?: number;
    timestamp: Date;
}

// Weather Data Storage
export async function saveWeatherData(userId: string, data: Omit<StoredWeatherData, 'id' | 'timestamp'>) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        // Store in user's weather collection with a single doc (latest)
        const weatherRef = doc(db, 'users', userId, 'aiResults', 'latestWeather');
        await setDoc(weatherRef, {
            ...data,
            timestamp: Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving weather data:', error);
        return { success: false, error: 'Failed to save weather data.' };
    }
}

export async function getLatestWeatherData(userId: string): Promise<StoredWeatherData | null> {
    if (!userId) return null;
    try {
        const weatherRef = doc(db, 'users', userId, 'aiResults', 'latestWeather');
        const docSnap = await getDoc(weatherRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                ...data,
                timestamp: (data.timestamp as Timestamp).toDate(),
            } as StoredWeatherData;
        }
        return null;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Market Price Storage
export async function saveMarketPrices(userId: string, prices: Omit<StoredMarketPrice, 'id' | 'timestamp'>[]) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const pricesRef = doc(db, 'users', userId, 'aiResults', 'latestMarketPrices');
        await setDoc(pricesRef, {
            prices: prices,
            timestamp: Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving market prices:', error);
        return { success: false, error: 'Failed to save market prices.' };
    }
}

export async function getLatestMarketPrices(userId: string): Promise<{ prices: StoredMarketPrice[], timestamp: Date } | null> {
    if (!userId) return null;
    try {
        const pricesRef = doc(db, 'users', userId, 'aiResults', 'latestMarketPrices');
        const docSnap = await getDoc(pricesRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                prices: data.prices,
                timestamp: (data.timestamp as Timestamp).toDate(),
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching market prices:', error);
        return null;
    }
}

// Satellite Analysis Storage
export async function saveSatelliteAnalysis(userId: string, analysis: Omit<StoredSatelliteAnalysis, 'id' | 'timestamp'>) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const analysisCollection = collection(db, 'users', userId, 'satelliteAnalyses');
        await addDoc(analysisCollection, {
            ...analysis,
            timestamp: Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving satellite analysis:', error);
        return { success: false, error: 'Failed to save analysis.' };
    }
}

export async function getLatestSatelliteAnalysis(userId: string, fieldId: string): Promise<StoredSatelliteAnalysis | null> {
    if (!userId) return null;
    try {
        const analysisCollection = collection(db, 'users', userId, 'satelliteAnalyses');
        const q = query(
            analysisCollection,
            where('fieldId', '==', fieldId),
            orderBy('timestamp', 'desc'),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: (data.timestamp as Timestamp).toDate(),
            } as StoredSatelliteAnalysis;
        }
        return null;
    } catch (error) {
        console.error('Error fetching satellite analysis:', error);
        return null;
    }
}

// Chat History Storage
export async function saveChatMessage(userId: string, message: Omit<StoredChatMessage, 'id' | 'timestamp'>) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const chatCollection = collection(db, 'users', userId, 'chatHistory');
        await addDoc(chatCollection, {
            ...message,
            timestamp: Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving chat message:', error);
        return { success: false, error: 'Failed to save message.' };
    }
}

export async function getChatHistory(userId: string, messageLimit = 50): Promise<StoredChatMessage[]> {
    if (!userId) return [];
    try {
        const chatCollection = collection(db, 'users', userId, 'chatHistory');
        const q = query(chatCollection, orderBy('timestamp', 'desc'), limit(messageLimit));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                role: data.role,
                content: data.content,
                suggestedFollowups: data.suggestedFollowups,
                confidence: data.confidence,
                timestamp: (data.timestamp as Timestamp).toDate(),
            };
        }).reverse(); // Reverse to get chronological order
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
}

// Clear chat history
export async function clearChatHistory(userId: string) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const chatCollection = collection(db, 'users', userId, 'chatHistory');
        const querySnapshot = await getDocs(chatCollection);
        const deletePromises = querySnapshot.docs.map(docSnapshot => deleteDoc(doc(db, 'users', userId, 'chatHistory', docSnapshot.id)));
        await Promise.all(deletePromises);
        return { success: true };
    } catch (error) {
        console.error('Error clearing chat history:', error);
        return { success: false, error: 'Failed to clear history.' };
    }
}

// Get summary for AI context
export async function getAIContextSummary(userId: string): Promise<string> {
    if (!userId) return '';

    const parts: string[] = [];

    try {
        // Get latest weather
        const weather = await getLatestWeatherData(userId);
        if (weather) {
            const ageHours = (Date.now() - weather.timestamp.getTime()) / (1000 * 60 * 60);
            if (ageHours < 6) { // Weather less than 6 hours old
                parts.push(`**Current Weather (${weather.location.name}):** ${weather.current.temperature}°C, ${weather.current.description}, Humidity: ${weather.current.humidity}%`);
            }
        }

        // Get latest market prices
        const marketData = await getLatestMarketPrices(userId);
        if (marketData && marketData.prices.length > 0) {
            const ageHours = (Date.now() - marketData.timestamp.getTime()) / (1000 * 60 * 60);
            if (ageHours < 24) { // Prices less than 24 hours old
                const topPrices = marketData.prices.slice(0, 3).map(p =>
                    `${p.cropName}: ₹${p.price}/${p.unit} (${p.trend >= 0 ? '+' : ''}${p.trend.toFixed(1)}%)`
                );
                parts.push(`**Recent Market Prices:** ${topPrices.join(', ')}`);
            }
        }
    } catch (error) {
        console.error('Error building AI context summary:', error);
    }

    return parts.join('\n');
}
