
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
    ndvi: z.number().min(0).max(1).describe("The average NDVI (optical) value for that date."),
    ndwi: z.number().min(-1).max(1).optional().describe("Normalized Difference Water Index (optical) for that date."),
    evi: z.number().min(-1).max(1).optional().describe("Enhanced Vegetation Index (optical) for that date."),
    vh: z.number().optional().describe("Sentinel-1 SAR VH backscatter (dB) for that date. Populated even when optical is cloud-obscured."),
    vhVvRatio: z.number().optional().describe("Sentinel-1 SAR VH/VV ratio for that date."),
    cloudObscured: z.boolean().optional().describe("True when optical was cloud-masked and NDVI was gap-filled from SAR."),
});

// Growth stages used by the phenology engine (Stage 2).
export const GrowthStageEnum = z.enum([
  "Sowing",
  "Vegetative",
  "Flowering",
  "Maturity",
]);
export type GrowthStage = z.infer<typeof GrowthStageEnum>;

// Stage 1: Crop type classification with SHAP-style explainability.
const CropClassificationSchema = z.object({
  cropLabel: z.string().describe("Predicted crop type from the multi-temporal feature stack."),
  confidence: z.number().min(0).max(1).describe("Classifier confidence (0-1)."),
  topFeatures: z.array(z.object({
    feature: z.string().describe("Feature name, e.g. 'VH/VV ratio', 'NDVI seasonal peak timing'."),
    value: z.string().describe("Human-readable feature value, e.g. '0.42' or 'day 145'."),
    contribution: z.number().describe("SHAP-style signed contribution to the prediction."),
  })).describe("Top contributing features (SHAP) for the crop classification."),
});

// Stage 2: Phenology engine output.
const PhenologySchema = z.object({
  currentStage: GrowthStageEnum.describe("Current phenological stage of the crop."),
  startOfSeason: z.string().describe("Derived start-of-season (SOS) date, 'YYYY-MM-DD'."),
  peakNdviDate: z.string().describe("Date of peak NDVI, 'YYYY-MM-DD'."),
  lengthOfGrowingPeriodDays: z.number().describe("Estimated length of growing period (LGP) in days."),
  stageProgressPercent: z.number().min(0).max(100).describe("Progress through the current stage (0-100)."),
});

// Stage 3: Phenology-conditioned stress model output with attention/explainability.
const StressModelSchema = z.object({
  stressScore: z.number().min(0).max(1).describe("Fused stress score (0 = healthy, 1 = severe stress)."),
  verdict: z.enum(["Healthy", "Moderate", "Stressed"]).describe("Stage-aware stress verdict."),
  contributingIndices: z.array(z.object({
    index: z.string().describe("Index name, e.g. 'NDVI anomaly', 'VH trend', 'NDWI'."),
    weight: z.number().min(0).max(1).describe("Attention weight / relative contribution to the verdict."),
    detail: z.string().describe("Plain-language detail, e.g. 'NDVI 18% below expected for flowering'."),
  })).describe("Attention weights per index that drove the stress verdict."),
  explanation: z.string().describe("One plain-language sentence explaining WHY the field was flagged, referencing indices and growth stage."),
});

// Stage 4: Water balance and deficit.
const WaterBalanceSchema = z.object({
  etcMm: z.number().describe("Crop evapotranspiration requirement (ETc) in mm over the window."),
  effectiveRainfallMm: z.number().describe("Effective rainfall in mm over the window."),
  deficitMm: z.number().describe("Water deficit in mm (ETc minus effective rainfall and soil contribution)."),
  kc: z.number().describe("Stage-dependent crop coefficient (Kc) from FAO-56."),
});

// Stage 5: Priority-scored irrigation advisory.
const IrrigationAdvisorySchema = z.object({
  priorityScore: z.number().min(0).max(1).describe("Composite priority (stress x criticality x0.5 + deficit x0.3 + area x0.2)."),
  priorityRank: z.enum(["Critical", "High", "Medium", "Low"]).describe("Priority band for action ordering."),
  stageCriticalityWeight: z.number().min(0).max(1).describe("Growth-stage criticality weight (Sowing 0.6, Vegetative 0.8, Flowering 1.0, Maturity 0.4)."),
  recommendedDate: z.string().describe("Recommended irrigation date, 'YYYY-MM-DD'."),
  recommendedVolumeMm: z.number().describe("Recommended irrigation volume in mm."),
  rationale: z.string().describe("Short rationale for the recommendation."),
});

export const GetSatelliteHealthOutputSchema = z.object({
  healthMapBase64: z.string().describe("A base64 encoded PNG image of the simulated NDVI health map overlay. The image should have a transparent background and be distorted to roughly match the shape of the farm polygon."),
  healthTrend: z.array(TrendDataPointSchema).describe("An array of the last 30 days of fused optical + SAR data points for a trend chart."),
  farmerAdvice: z.string().describe("Simple, actionable advice for the farmer based on the analysis (referencing the heatmap), translated into the requested language."),
  overallHealth: z.enum(["Healthy", "Moderate", "Stressed"]).describe("The overall health status of the crop."),
  lastUpdated: z.string().describe("The ISO 8601 timestamp for when the analysis was performed."),
  cropClassification: CropClassificationSchema.optional().describe("Stage 1 crop type classification with SHAP explainability."),
  phenology: PhenologySchema.optional().describe("Stage 2 phenology engine output (SOS, peak NDVI, LGP, current stage)."),
  stressModel: StressModelSchema.optional().describe("Stage 3 phenology-conditioned stress model with attention-based explainability."),
  waterBalance: WaterBalanceSchema.optional().describe("Stage 4 water balance and deficit."),
  irrigationAdvisory: IrrigationAdvisorySchema.optional().describe("Stage 5 priority-scored irrigation advisory."),
});
export type GetSatelliteHealthOutput = z.infer<typeof GetSatelliteHealthOutputSchema>;
