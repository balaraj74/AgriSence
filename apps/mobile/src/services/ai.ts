/**
 * AI Service — Calls the deployed Next.js Genkit API endpoint.
 * Production: https://agrisence--agrisence-1dc30.us-central1.hosted.app
 * Local dev:  http://10.0.2.2:3000 (Android emulator → host machine)
 */

const BASE_URL = __DEV__
  ? 'http://10.0.2.2:3000'
  : 'https://agrisence--agrisence-1dc30.us-central1.hosted.app';

const GENKIT_ENDPOINT = `${BASE_URL}/api/genkit`;

interface GenkitRequest {
  flow: string;
  data: unknown;
}

async function callGenkitFlow<TOutput>(
  flow: string,
  input: unknown
): Promise<TOutput> {
  const response = await fetch(GENKIT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ flow, data: input } as GenkitRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed (${response.status}): ${errorText}`);
  }

  const json = await response.json() as { success: boolean; result: TOutput; error?: string };
  if (!json.success) {
    throw new Error(json.error || 'AI request failed');
  }

  return json.result;
}

// ----- Farming Chatbot -----
export interface ChatbotInput {
  question: string;
  language: string;
  farmerContext?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}
export interface ChatbotOutput {
  answer: string;
  suggestedFollowups?: string[];
  relatedFeatures?: Array<{ name: string; href: string; reason: string }>;
  confidence?: number;
}
export const farmingChatbot = (input: ChatbotInput) =>
  callGenkitFlow<ChatbotOutput>('farmingAdviceChatbot', input);

// ----- Disease Detection -----
export interface DiseaseInput {
  imageUris: string[];
  geolocation: {
    latitude: number;
    longitude: number;
  };
  userId: string;
  language: string;
}
export interface DiseaseOutput {
  plantIdentification: {
    isPlant: boolean;
    plantName: string;
    confidence: number;
  };
  diseaseDiagnosis: {
    diseaseName: string;
    severity: 'Low' | 'Medium' | 'High' | 'Unknown';
    affectedParts: string[];
    confidenceScore: number;
  };
  remedies: {
    chemicalRemedy: string;
    organicRemedy: string;
    preventiveMeasures: string;
  };
  historicalInsight: string;
  farmingRecommendations: {
    alternativeCrops: string;
    preservationTips: string;
  };
  nextDiseaseRisk: string;
}
export const detectDisease = (input: DiseaseInput) =>
  callGenkitFlow<DiseaseOutput>('diagnoseCropDisease', input);

// ----- Weather Search -----
export interface WeatherInput {
  lat: number;
  lon: number;
}
export interface WeatherOutput {
  location: { name: string };
  current: {
    temperature: number;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
    isDay: number;
  };
  daily: Array<{
    date: string;
    weatherCode: number;
    maxTemp: number;
    minTemp: number;
  }>;
}
export const getWeather = (input: WeatherInput) =>
  callGenkitFlow<WeatherOutput>('getWeatherInfo', input);

// ----- Market Price Search -----
export interface MarketPriceSearchInput {
  question: string;
}
export interface CropPrice {
  cropName: string;
  market: string;
  price: number;
  unit: string;
  trend: number;
  minPrice?: number;
  maxPrice?: number;
  lastUpdated?: string;
}
export interface MarketPriceSearchOutput {
  prices: CropPrice[];
  summary: string;
  answer?: string;
  dataSource: string;
  lastUpdated: string;
}
export const marketPriceSearch = (input: MarketPriceSearchInput) =>
  callGenkitFlow<MarketPriceSearchOutput>('marketPriceSearch', input);

// ----- Schemes Search -----
export interface SchemesInput {
  query: string;
}
export interface SchemesOutput {
  schemes: Array<{
    name: string;
    description: string;
    eligibility: string;
    link: string;
  }>;
  message: string;
}
export const searchSchemes = (input: SchemesInput) =>
  callGenkitFlow<SchemesOutput>('searchSchemes', input);

// ----- Soil Advisor -----
export interface ParseSoilReportInput {
  reportDataUri: string;
}
export interface ParseSoilReportOutput {
  soilPh: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicCarbon?: number;
  electricalConductivity?: number;
}
export const parseSoilReport = (input: ParseSoilReportInput) =>
  callGenkitFlow<ParseSoilReportOutput>('parseSoilReport', input);

export interface GetSoilAdviceInput {
  soilPh: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  location: string;
  language: string;
}

export interface NutrientStatus {
  nutrient: 'pH' | 'Nitrogen' | 'Phosphorus' | 'Potassium';
  status: 'Very Low' | 'Low' | 'Sufficient' | 'High' | 'Very High' | 'Optimal' | 'Slightly Acidic' | 'Slightly Alkaline';
  comment: string;
}

export interface FertilizerRecommendation {
  fertilizerName: string;
  dosage: string;
  applicationTime: string;
}

export interface OrganicAlternative {
  name: string;
  applicationRate: string;
  benefits: string;
}

export interface GetSoilAdviceOutput {
  recommendedCrops: string;
  nutrientAnalysis: NutrientStatus[];
  chemicalRecommendations: FertilizerRecommendation[];
  organicAlternatives: OrganicAlternative[];
  soilManagementTips: string;
}

export const getSoilAdvice = (input: GetSoilAdviceInput) =>
  callGenkitFlow<GetSoilAdviceOutput>('getSoilAdvice', input);

// ----- Medicinal Plant Identifier -----
export interface IdentifyMedicinalPlantInput {
  imageUris: string[];
}
export interface IdentifyMedicinalPlantOutput {
  isMedicinal: boolean;
  commonName: string;
  botanicalName: string;
  medicinalUses: string;
  partsUsed: string;
  preparationMethods: string;
  precautions: string;
  regionalNames: string;
}
export const identifyMedicinalPlant = (input: IdentifyMedicinalPlantInput) =>
  callGenkitFlow<IdentifyMedicinalPlantOutput>('identifyMedicinalPlant', input);

// ----- Crop Calendar -----
export interface CropCalendarInput {
  cropName: string;
  region: string;
  plantingDate?: string;
  language?: string;
}
export interface CropCalendarOutput {
  tasks: Array<{
    taskName: string;
    dateRange: string;
  }>;
}
export const generateCropCalendar = (input: CropCalendarInput) =>
  callGenkitFlow<CropCalendarOutput>('generateCropCalendar', input);

// ----- Price Prediction -----
export interface PredictMarketPriceInput {
  cropName: string;
  marketName: string;
}
export interface DailyForecast {
  date: string;
  predictedPrice: number;
  confidence?: string;
}
export interface PriceFactor {
  factor: string;
  impact: string;
  description: string;
}
export interface PredictMarketPriceOutput {
  currentPrice: number;
  forecast: DailyForecast[];
  summary: string;
  trendDirection?: string;
  expectedChange?: number;
  factors?: PriceFactor[];
  recommendation?: string;
}
export const predictMarketPrice = (input: PredictMarketPriceInput) =>
  callGenkitFlow<PredictMarketPriceOutput>('predictMarketPrice', input);

// ----- Loan & Insurance Assistant -----
export interface EligibleScheme {
  schemeName: string;
  schemeType: 'Loan' | 'Insurance';
  eligibilitySummary: string;
  benefits: string;
  nextSteps: string;
  requiredDocuments: string;
}
export interface LoanInput {
  landSizeAcres: number;
  primaryCrop: string;
  location: string;
  hasKisanCreditCard: boolean;
}
export interface LoanOutput {
  eligibleSchemes: EligibleScheme[];
  overallSummary: string;
}
export const getLoanAdvice = (input: LoanInput) =>
  callGenkitFlow<LoanOutput>('checkLoanInsuranceEligibility', input);

// ----- Satellite Health -----
export interface SatelliteInput {
  field: {
    fieldName: string;
    area: number;
    cropName: string | null;
    coordinates: Array<{ lat: number; lng: number }>;
  };
  language: string;
}
export type GrowthStage = 'Sowing' | 'Vegetative' | 'Flowering' | 'Maturity';

export interface SatelliteTrendPoint {
  date: string;
  ndvi: number;
  ndwi?: number;
  evi?: number;
  vh?: number;
  vhVvRatio?: number;
  cloudObscured?: boolean;
}

export interface CropClassification {
  cropLabel: string;
  confidence: number;
  topFeatures: Array<{ feature: string; value: string; contribution: number }>;
}

export interface Phenology {
  currentStage: GrowthStage;
  startOfSeason: string;
  peakNdviDate: string;
  lengthOfGrowingPeriodDays: number;
  stageProgressPercent: number;
}

export interface StressModel {
  stressScore: number;
  verdict: 'Healthy' | 'Moderate' | 'Stressed';
  contributingIndices: Array<{ index: string; weight: number; detail: string }>;
  explanation: string;
}

export interface WaterBalance {
  etcMm: number;
  effectiveRainfallMm: number;
  deficitMm: number;
  kc: number;
}

export interface IrrigationAdvisory {
  priorityScore: number;
  priorityRank: 'Critical' | 'High' | 'Medium' | 'Low';
  stageCriticalityWeight: number;
  recommendedDate: string;
  recommendedVolumeMm: number;
  rationale: string;
}

export interface SatelliteOutput {
  healthMapBase64: string;
  healthTrend: SatelliteTrendPoint[];
  farmerAdvice: string;
  overallHealth: 'Healthy' | 'Moderate' | 'Stressed';
  lastUpdated: string;
  cropClassification?: CropClassification;
  phenology?: Phenology;
  stressModel?: StressModel;
  waterBalance?: WaterBalance;
  irrigationAdvisory?: IrrigationAdvisory;
}
export const getSatelliteHealth = (input: SatelliteInput) =>
  callGenkitFlow<SatelliteOutput>('getSatelliteHealthAnalysis', input);

// ----- Live Farm Advisor -----
export interface LiveAdvisorInput {
  videoFrameUri: string;
  farmerQuery: string;
  language: string;
}
export interface LiveAdvisorOutput {
  visualAnalysis: string;
  responseToQuery: string;
  proactiveAlert: string;
}
export const liveFarmAdvisor = (input: LiveAdvisorInput) =>
  callGenkitFlow<LiveAdvisorOutput>('liveFarmAdvisor', input);

// ----- Market Matchmaking -----
export interface BuyerMatch {
  buyerId: string;
  buyerName: string;
  buyerType: 'Wholesaler' | 'Retailer' | 'Exporter' | 'Food Processor' | 'Farmer Co-op' | 'Individual Farmer';
  location: string;
  coordinates: { lat: number; lng: number };
  offerPrice: number;
  offerUnit: string;
  pickupOrDelivery: 'Pickup' | 'Delivery';
  summary: string;
  rating: number;
  contactPhone: string;
  contactEmail: string;
}
export interface FindBestBuyersInput {
  cropType: string;
  quantity: number;
  unit: 'kg' | 'quintal' | 'tonne';
  location: string;
  sellByDate: string;
}
export interface FindBestBuyersOutput {
  matches: BuyerMatch[];
  overallSummary: string;
}
export const findBestBuyers = (input: FindBestBuyersInput) =>
  callGenkitFlow<FindBestBuyersOutput>('findBestBuyers', input);

export interface SellerMatch {
  sellerId: string;
  sellerName: string;
  sellerType: 'Individual Farmer' | 'Farmer Co-op' | 'Wholesaler';
  location: string;
  coordinates: { lat: number; lng: number };
  availableQuantity: number;
  price: number;
  unit: string;
  summary: string;
  rating: number;
  contactPhone: string;
  contactEmail: string;
}
export interface FindBestSellersInput {
  cropType: string;
  quantity: number;
  unit: 'kg' | 'quintal' | 'tonne';
  location: string;
  purchaseByDate: string;
}
export interface FindBestSellersOutput {
  matches: SellerMatch[];
  overallSummary: string;
}
export const findBestSellers = (input: FindBestSellersInput) =>
  callGenkitFlow<FindBestSellersOutput>('findBestSellers', input);


