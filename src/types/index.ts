
import { z } from 'zod';

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

export type CropStatus = "Planned" | "Growing" | "Harvested";

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

export type ExpenseCategory = "Seeds" | "Fertilizer" | "Labor" | "Equipment" | "Other";

export interface Expense {
  id:string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  notes?: string;
}

export type HarvestUnit = "kg" | "quintal" | "tonne";

export interface Harvest {
  id: string;
  cropId: string;
  cropName: string;
  quantity: number;
  unit: HarvestUnit;
  harvestDate: Date;
  notes?: string;
}

// Type for storing field boundary data
export interface Field {
    id: string;
    fieldName: string;
    surveyNumber: string;
    village: string;
    area: number; // in acres
    perimeter: number; // in meters
    coordinates: google.maps.LatLngLiteral[];
    centroid: google.maps.LatLngLiteral;
    cropId?: string | null;
    cropName?: string | null;
}

export interface DiagnosisRecord {
    id: string;
    plantName: string;
    diseaseName: string;
    severity: "Low" | "Medium" | "High" | "Unknown";
    confidenceScore: number;
    imageUrl: string;
    timestamp: Date;
    geolocation: {
        latitude: number;
        longitude: number;
    };
}

// Schemas for Satellite Health Analysis
export const GetSatelliteHealthInputSchema = z.object({
  field: z.object({
    fieldName: z.string(),
    area: z.number(),
    cropName: z.string().nullable(),
    coordinates: z.array(z.object({ lat: z.number(), lng: z.number() })),
  }).describe("The field object containing details for analysis."),
  language: z.string().describe("The language for the response, e.g., 'English', 'Kannada'."),
});
export type GetSatelliteHealthInput = z.infer<typeof GetSatelliteHealthInputSchema>;

const TrendDataPointSchema = z.object({
    date: z.string().describe("The date for the data point in 'YYYY-MM-DD' format."),
    ndvi: z.number().min(0).max(1).describe("The average NDVI value for that date."),
});

export const GetSatelliteHealthOutputSchema = z.object({
  healthMapBase64: z.string().describe("A base64 encoded PNG image of the simulated NDVI health map overlay. The image should have a transparent background and be distorted to roughly match the shape of the farm polygon."),
  healthTrend: z.array(TrendDataPointSchema).describe("An array of the last 30 days of NDVI data points for a trend chart."),
  farmerAdvice: z.string().describe("Simple, actionable advice for the farmer based on the analysis, translated into the requested language."),
  overallHealth: z.enum(["Healthy", "Moderate", "Stressed"]).describe("The overall health status of the crop."),
  lastUpdated: z.string().describe("The ISO 8601 timestamp for when the analysis was performed."),
});
export type GetSatelliteHealthOutput = z.infer<typeof GetSatelliteHealthOutputSchema>;
