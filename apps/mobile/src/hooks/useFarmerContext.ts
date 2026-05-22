import { useQuery } from '@tanstack/react-query';
import {
  getCrops,
  getExpenses,
  getHarvests,
  getFields,
  getDiagnosisHistory,
} from '../services/firestore';
import type { DashboardStats, FarmerContext } from '../types';

function calculateHealthScore(
  diagnoses: Array<{ severity: string }>
): number {
  if (diagnoses.length === 0) return 100;
  const weights: Record<string, number> = {
    Low: 0.1,
    Medium: 0.3,
    High: 0.6,
    Unknown: 0.2,
  };
  const recent = diagnoses.slice(0, 10);
  const totalWeight = recent.reduce(
    (sum, d) => sum + (weights[d.severity] ?? 0.2),
    0
  );
  return Math.max(0, Math.round(100 - (totalWeight / recent.length) * 100));
}

function calculateYieldForecast(
  healthScore: number,
  activeCrops: number
): string {
  if (activeCrops === 0) return 'N/A';
  if (healthScore >= 90) return `↑ ${Math.round(15 + Math.random() * 10)}%`;
  if (healthScore >= 75) return `↑ ${Math.round(5 + Math.random() * 10)}%`;
  if (healthScore >= 60) return `→ ${Math.round(-5 + Math.random() * 10)}%`;
  return `↓ ${Math.round(Math.random() * 10)}%`;
}

export function useFarmerContext(userId: string | undefined) {
  return useQuery({
    queryKey: ['farmer-context', userId],
    queryFn: async (): Promise<FarmerContext | null> => {
      if (!userId) return null;
      const [crops, diagnoses, fields, expenses, harvests] = await Promise.all([
        getCrops(userId),
        getDiagnosisHistory(userId),
        getFields(userId),
        getExpenses(userId),
        getHarvests(userId),
      ]);
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyExpenses = expenses
        .filter((e) => e.date >= thisMonth)
        .reduce((sum, e) => sum + e.amount, 0);
      const byCategory: Record<string, number> = {};
      expenses.forEach((e) => {
        byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
      });
      return {
        crops: {
          total: crops.length,
          active: crops.filter((c) => c.status === 'Growing').length,
          planned: crops.filter((c) => c.status === 'Planned').length,
          harvested: crops.filter((c) => c.status === 'Harvested').length,
          names: [...new Set(crops.map((c) => c.name))],
          regions: [
            ...new Set(crops.map((c) => c.region).filter(Boolean)),
          ] as string[],
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
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useDashboardStats(userId: string | undefined) {
  const { data: context, ...rest } = useFarmerContext(userId);

  const stats: DashboardStats | null = context
    ? {
        activeCrops: context.crops.active,
        healthScore: context.diagnoses.healthScore,
        yieldForecast: calculateYieldForecast(
          context.diagnoses.healthScore,
          context.crops.active
        ),
        totalFields: context.fields.total,
        totalAreaAcres: Math.round(context.fields.totalArea * 10) / 10,
        monthlyExpenses: context.expenses.thisMonth,
        recentDiagnoses: context.diagnoses.recentIssues.length,
      }
    : null;

  return { stats, context, ...rest };
}

export function contextToPromptString(context: FarmerContext): string {
  const parts: string[] = [];
  if (context.crops.total > 0) {
    parts.push(
      `Active Crops (${context.crops.active}): ${context.crops.names.join(', ') || 'None'}`
    );
    parts.push(
      `Farming Regions: ${context.crops.regions.join(', ') || 'Not specified'}`
    );
  }
  if (context.fields.total > 0) {
    parts.push(
      `Total Farm Area: ${context.fields.totalArea.toFixed(2)} acres across ${context.fields.total} field(s)`
    );
  }
  if (context.diagnoses.recentIssues.length > 0) {
    parts.push(`Recent Health Issues:`);
    context.diagnoses.recentIssues.forEach((issue) => {
      parts.push(
        `  - ${issue.plantName}: ${issue.diseaseName} (${issue.severity})`
      );
    });
    parts.push(`Overall Health Score: ${context.diagnoses.healthScore}%`);
  }
  if (context.harvests.recentHarvests.length > 0) {
    parts.push(`Recent Harvests:`);
    context.harvests.recentHarvests.forEach((h) => {
      parts.push(`  - ${h.cropName}: ${h.quantity} ${h.unit}`);
    });
  }
  if (context.expenses.thisMonth > 0) {
    parts.push(
      `Monthly Expenses: ₹${context.expenses.thisMonth.toLocaleString('en-IN')}`
    );
  }
  return parts.length > 0 ? parts.join('\n') : 'No farming data available yet.';
}
