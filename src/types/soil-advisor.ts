
import { z } from 'zod';

// Schema for parsing soil reports
export const ParseSoilReportInputSchema = z.object({
  reportDataUri: z.string().describe("A soil report file (image or PDF) as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ParseSoilReportInput = z.infer<typeof ParseSoilReportInputSchema>;

export const ParseSoilReportOutputSchema = z.object({
  soilPh: z.number().describe("The pH level of the soil, e.g., 6.5."),
  nitrogen: z.number().describe("Nitrogen (N) level, converted to kg/ha if necessary, e.g., 45."),
  phosphorus: z.number().describe("Phosphorus (P) level, converted to kg/ha if necessary, e.g., 20."),
  potassium: z.number().describe("Potassium (K) level, converted to kg/ha if necessary, e.g., 30."),
  organicCarbon: z.number().optional().describe("Organic Carbon percentage (%), if available."),
  electricalConductivity: z.number().optional().describe("Electrical Conductivity (EC) in dS/m, if available."),
});
export type ParseSoilReportOutput = z.infer<typeof ParseSoilReportOutputSchema>;


// Schema for getting soil advice
export const GetSoilAdviceInputSchema = z.object({
  soilPh: z.coerce.number().describe("The pH level of the soil, e.g., 6.5."),
  nitrogen: z.coerce.number().describe("Nitrogen (N) level in kg/ha, e.g., 45."),
  phosphorus: z.coerce.number().describe("Phosphorus (P) level in kg/ha, e.g., 20."),
  potassium: z.coerce.number().describe("Potassium (K) level in kg/ha, e.g., 30."),
  location: z.string().describe("The farmer's location for regional crop recommendations, e.g., 'Kolar, Karnataka'."),
  language: z.string().describe("The language for the response, e.g., 'English', 'Kannada'."),
});
export type GetSoilAdviceInput = z.infer<typeof GetSoilAdviceInputSchema>;

const NutrientStatusSchema = z.object({
    nutrient: z.enum(["pH", "Nitrogen", "Phosphorus", "Potassium"]),
    status: z.enum(["Very Low", "Low", "Sufficient", "High", "Very High", "Optimal", "Slightly Acidic", "Slightly Alkaline"]),
    comment: z.string().describe("A brief, one-sentence comment on the nutrient's status."),
});

const FertilizerRecommendationSchema = z.object({
    fertilizerName: z.string().describe("The common name of the chemical fertilizer, e.g., 'Urea', 'DAP'."),
    dosage: z.string().describe("The recommended dosage per acre, including units, e.g., '45 kg/acre'."),
    applicationTime: z.string().describe("When to apply the fertilizer, e.g., 'Basal dose' or '30 days after sowing'."),
});

const OrganicAlternativeSchema = z.object({
    name: z.string().describe("The name of the organic alternative, e.g., 'Farm Yard Manure', 'Neem Cake'."),
    applicationRate: z.string().describe("The recommended application rate, e.g., '10 tonnes/acre'."),
    benefits: z.string().describe("A brief description of the benefits."),
});

export const GetSoilAdviceOutputSchema = z.object({
  recommendedCrops: z.string().describe("A detailed, new-line separated list of suitable crops for the given soil data and location, with brief reasoning for each."),
  nutrientAnalysis: z.array(NutrientStatusSchema).describe("An analysis of each key nutrient's status."),
  chemicalRecommendations: z.array(FertilizerRecommendationSchema).describe("A list of recommended chemical fertilizers and their dosages."),
  organicAlternatives: z.array(OrganicAlternativeSchema).describe("A list of organic alternatives to improve soil health."),
  soilManagementTips: z.string().describe("A bulleted list of general soil management practices to improve fertility and health."),
});
export type GetSoilAdviceOutput = z.infer<typeof GetSoilAdviceOutputSchema>;
