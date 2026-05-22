/**
 * @agrisence/types
 *
 * Shared TypeScript types used across all AgriSence applications
 * (web, mobile, admin, backend). Single source of truth.
 *
 * Platform-specific types (e.g. google.maps.LatLngLiteral) are replaced
 * with portable equivalents.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/** A portable lat/lng coordinate usable on web and mobile. */
export interface LatLng {
  latitude: number;
  longitude: number;
}

// ---------------------------------------------------------------------------
// Crops
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Harvests
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

export interface Field {
  id: string;
  fieldName: string;
  surveyNumber: string;
  village: string;
  /** Area in acres */
  area: number;
  /** Perimeter in meters */
  perimeter: number;
  coordinates: LatLng[];
  centroid: LatLng;
  cropId?: string | null;
  cropName?: string | null;
}

// ---------------------------------------------------------------------------
// Disease Diagnosis
// ---------------------------------------------------------------------------

export type DiagnosisSeverity = 'Low' | 'Medium' | 'High' | 'Unknown';

export interface DiagnosisRecord {
  id: string;
  plantName: string;
  diseaseName: string;
  severity: DiagnosisSeverity;
  confidenceScore: number;
  imageUrl: string;
  timestamp: Date;
  geolocation: LatLng;
}

// ---------------------------------------------------------------------------
// Market Prices
// ---------------------------------------------------------------------------

export interface MarketPrice {
  crop: string;
  region: string;
  price: number;
  change: number;
}

// ---------------------------------------------------------------------------
// Government Schemes
// ---------------------------------------------------------------------------

export interface Scheme {
  name: string;
  crop: string;
  state: string;
  description: string;
  link: string;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardStats {
  activeCrops: number;
  healthScore: number;
  yieldForecast: string;
  totalFields: number;
  totalAreaAcres: number;
  monthlyExpenses: number;
  recentDiagnoses: number;
}

// ---------------------------------------------------------------------------
// Farmer Context (used in AI prompts)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Satellite Health Analysis
// ---------------------------------------------------------------------------

export type OverallHealthStatus = 'Healthy' | 'Moderate' | 'Stressed';

export interface SatelliteHealthInput {
  field: {
    fieldName: string;
    area: number;
    cropName: string | null;
    coordinates: Array<{ lat: number; lng: number }>;
  };
  language: string;
}

export interface TrendDataPoint {
  date: string; // ISO 8601 'YYYY-MM-DD'
  ndvi: number; // 0–1
}

export interface SatelliteHealthOutput {
  healthMapBase64: string;
  healthTrend: TrendDataPoint[];
  farmerAdvice: string;
  overallHealth: OverallHealthStatus;
  lastUpdated: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// API Response Shape (shared contract)
// ---------------------------------------------------------------------------

export type ApiResponse<T> =
  | { success: true; data: T; meta?: PaginationMeta }
  | { success: false; error: string; code: string; details?: unknown };

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}
