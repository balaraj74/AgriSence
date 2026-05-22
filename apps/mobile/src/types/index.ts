// Shared TypeScript types — mirrored from the web app's src/types/index.ts

export type CropStatus = 'Planned' | 'Growing' | 'Harvested';

export interface CropTask {
  taskName: string;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
}

export interface Crop {
  id: string;
  name: string;
  status: CropStatus;
  plantedDate: Date | null;
  harvestDate: Date | null;
  notes: string | null;
  calendar: CropTask[];
  region: string | null;
}

export type ExpenseCategory =
  | 'Seeds'
  | 'Fertilizer'
  | 'Labor'
  | 'Equipment'
  | 'Other';

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  notes?: string;
}

export type HarvestUnit = 'kg' | 'quintal' | 'tonne';

export interface Harvest {
  id: string;
  cropId: string;
  cropName: string;
  quantity: number;
  unit: HarvestUnit;
  harvestDate: Date;
  notes?: string;
}

export interface Field {
  id: string;
  fieldName: string;
  surveyNumber: string;
  village: string;
  area: number; // in acres
  perimeter: number; // in meters
  coordinates: Array<{ latitude: number; longitude: number }>;
  centroid: { latitude: number; longitude: number };
  cropId?: string | null;
  cropName?: string | null;
}

export interface DiagnosisRecord {
  id: string;
  plantName: string;
  diseaseName: string;
  severity: 'Low' | 'Medium' | 'High' | 'Unknown';
  confidenceScore: number;
  imageUrl: string;
  timestamp: Date;
  geolocation: {
    latitude: number;
    longitude: number;
  };
}

export interface MarketPrice {
  crop: string;
  region: string;
  price: number;
  change: number;
}

export interface Scheme {
  name: string;
  crop: string;
  state: string;
  description: string;
  link: string;
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
    healthScore: number;
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
