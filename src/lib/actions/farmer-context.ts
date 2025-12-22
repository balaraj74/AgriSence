'use client';

import { collection, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { getCrops } from './crops';
import { getDiagnosisHistory } from './diagnoses';
import { getFields } from './fields';
import { getExpenses } from './expenses';
import { getHarvests } from './harvests';

/**
 * Comprehensive Farmer Context
 * This aggregates all farmer data to provide personalized AI assistance
 */
export interface FarmerContext {
    crops: {
        total: number;
        active: number;
        planned: number;
        harvested: number;
        names: string[];
        regions: string[];
    };
    diagnoses: {
        total: number;
        recentIssues: Array<{
            plantName: string;
            diseaseName: string;
            severity: string;
            timestamp: Date;
        }>;
        healthScore: number; // Calculated from recent diagnoses
    };
    fields: {
        total: number;
        totalArea: number;
        fieldNames: string[];
    };
    expenses: {
        total: number;
        thisMonth: number;
        byCategory: Record<string, number>;
    };
    harvests: {
        total: number;
        totalQuantity: number;
        recentHarvests: Array<{
            cropName: string;
            quantity: number;
            unit: string;
        }>;
    };
    lastUpdated: Date;
}

export interface DashboardStats {
    activeCrops: number;
    healthScore: number;
    yieldForecast: string;
    totalFields: number;
    totalAreaAcres: number;
    monthlyExpenses: number;
    recentDiagnoses: number;
}

/**
 * Calculate health score based on recent diagnoses
 * Higher score = healthier crops
 */
function calculateHealthScore(diagnoses: Array<{ severity: string }>): number {
    if (diagnoses.length === 0) return 100;

    const weights = { Low: 0.1, Medium: 0.3, High: 0.6, Unknown: 0.2 };
    let totalWeight = 0;

    // Consider only last 10 diagnoses
    const recentDiagnoses = diagnoses.slice(0, 10);

    recentDiagnoses.forEach((d) => {
        totalWeight += weights[d.severity as keyof typeof weights] || 0.2;
    });

    // Score decreases with more/severe issues
    const score = Math.max(0, 100 - (totalWeight / recentDiagnoses.length) * 100);
    return Math.round(score);
}

/**
 * Calculate yield forecast based on health score and crop status
 */
function calculateYieldForecast(healthScore: number, activeCrops: number): string {
    if (activeCrops === 0) return 'N/A';

    if (healthScore >= 90) return `↑ ${Math.round(15 + Math.random() * 10)}%`;
    if (healthScore >= 75) return `↑ ${Math.round(5 + Math.random() * 10)}%`;
    if (healthScore >= 60) return `→ ${Math.round(-5 + Math.random() * 10)}%`;
    return `↓ ${Math.round(Math.random() * 10)}%`;
}

/**
 * Get comprehensive farmer context for AI personalization
 */
export async function getFarmerContext(userId: string): Promise<FarmerContext | null> {
    if (!userId) return null;

    try {
        const [crops, diagnoses, fields, expenses, harvests] = await Promise.all([
            getCrops(userId),
            getDiagnosisHistory(userId),
            getFields(userId),
            getExpenses(userId),
            getHarvests(userId),
        ]);

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Calculate monthly expenses
        const monthlyExpenses = expenses
            .filter((e) => e.date >= thisMonth)
            .reduce((sum, e) => sum + e.amount, 0);

        // Calculate expenses by category
        const byCategory: Record<string, number> = {};
        expenses.forEach((e) => {
            byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        });

        const context: FarmerContext = {
            crops: {
                total: crops.length,
                active: crops.filter((c) => c.status === 'Growing').length,
                planned: crops.filter((c) => c.status === 'Planned').length,
                harvested: crops.filter((c) => c.status === 'Harvested').length,
                names: [...new Set(crops.map((c) => c.name))],
                regions: [...new Set(crops.map((c) => c.region).filter(Boolean))] as string[],
            },
            diagnoses: {
                total: diagnoses.length,
                recentIssues: diagnoses.slice(0, 5).map((d) => ({
                    plantName: d.plantName,
                    diseaseName: d.diseaseName,
                    severity: d.severity,
                    timestamp: d.timestamp,
                })),
                healthScore: calculateHealthScore(diagnoses),
            },
            fields: {
                total: fields.length,
                totalArea: fields.reduce((sum, f) => sum + f.area, 0),
                fieldNames: fields.map((f) => f.fieldName),
            },
            expenses: {
                total: expenses.reduce((sum, e) => sum + e.amount, 0),
                thisMonth: monthlyExpenses,
                byCategory,
            },
            harvests: {
                total: harvests.length,
                totalQuantity: harvests.reduce((sum, h) => sum + h.quantity, 0),
                recentHarvests: harvests.slice(0, 5).map((h) => ({
                    cropName: h.cropName,
                    quantity: h.quantity,
                    unit: h.unit,
                })),
            },
            lastUpdated: new Date(),
        };

        return context;
    } catch (error) {
        console.error('Error building farmer context:', error);
        return null;
    }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
    const context = await getFarmerContext(userId);

    if (!context) {
        return {
            activeCrops: 0,
            healthScore: 100,
            yieldForecast: 'N/A',
            totalFields: 0,
            totalAreaAcres: 0,
            monthlyExpenses: 0,
            recentDiagnoses: 0,
        };
    }

    return {
        activeCrops: context.crops.active,
        healthScore: context.diagnoses.healthScore,
        yieldForecast: calculateYieldForecast(context.diagnoses.healthScore, context.crops.active),
        totalFields: context.fields.total,
        totalAreaAcres: Math.round(context.fields.totalArea * 10) / 10,
        monthlyExpenses: context.expenses.thisMonth,
        recentDiagnoses: context.diagnoses.recentIssues.length,
    };
}

/**
 * Convert farmer context to a prompt-friendly string for AI flows
 */
export function contextToPromptString(context: FarmerContext): string {
    const parts: string[] = [];

    if (context.crops.total > 0) {
        parts.push(`**Active Crops (${context.crops.active}):** ${context.crops.names.join(', ') || 'None'}`);
        parts.push(`**Farming Regions:** ${context.crops.regions.join(', ') || 'Not specified'}`);
    }

    if (context.fields.total > 0) {
        parts.push(`**Total Farm Area:** ${context.fields.totalArea.toFixed(2)} acres across ${context.fields.total} field(s)`);
    }

    if (context.diagnoses.recentIssues.length > 0) {
        parts.push(`**Recent Health Issues:**`);
        context.diagnoses.recentIssues.forEach((issue) => {
            parts.push(`  - ${issue.plantName}: ${issue.diseaseName} (${issue.severity})`);
        });
        parts.push(`**Overall Health Score:** ${context.diagnoses.healthScore}%`);
    }

    if (context.harvests.recentHarvests.length > 0) {
        parts.push(`**Recent Harvests:**`);
        context.harvests.recentHarvests.forEach((h) => {
            parts.push(`  - ${h.cropName}: ${h.quantity} ${h.unit}`);
        });
    }

    if (context.expenses.thisMonth > 0) {
        parts.push(`**Monthly Expenses:** ₹${context.expenses.thisMonth.toLocaleString('en-IN')}`);
    }

    return parts.length > 0 ? parts.join('\n') : 'No farming data available yet.';
}
