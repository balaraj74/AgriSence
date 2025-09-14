
'use server';

/**
 * @fileOverview An AI flow to simulate satellite-based crop health monitoring.
 * 
 * - getSatelliteHealthAnalysis - Analyzes a given field polygon to generate a simulated health map and advice.
 * - GetSatelliteHealthInput - The input type for the function.
 * - GetSatelliteHealthOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import { Field } from '@/types';

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
});
export type GetSatelliteHealthOutput = z.infer<typeof GetSatelliteHealthOutputSchema>;


export async function getSatelliteHealthAnalysis(input: GetSatelliteHealthInput): Promise<GetSatelliteHealthOutput> {
  return getSatelliteHealthFlow(input);
}


const getSatelliteHealthFlow = ai.defineFlow(
  {
    name: 'getSatelliteHealthFlow',
    inputSchema: GetSatelliteHealthInputSchema,
    outputSchema: GetSatelliteHealthOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
          model: googleAI.model('gemini-1.5-flash'),
          system: `You are an expert agricultural AI specializing in satellite imagery analysis. Your task is to simulate a crop health report based on a farmer's field data. The entire response must be in ${input.language}.

          You will generate:
          1.  **Simulated NDVI Health Map**: A base64 encoded PNG image representing the crop health. The map should be a simple heatmap with green (healthy, NDVI > 0.6), yellow (moderate, NDVI 0.3-0.6), and red (stressed, NDVI < 0.3) zones. CRITICAL: The image background MUST be transparent, and the colored zones should roughly match the shape of the provided field coordinates to look like an overlay. Do not include any text or labels on the image itself.
          2.  **30-Day Health Trend**: A list of 30 daily data points for an NDVI trend chart. The values should be plausible, showing some fluctuation over the month. The most recent date should be today.
          3.  **Farmer-Friendly Advice**: Based on the simulated data, generate simple, actionable advice. If you simulate stressed areas, suggest potential causes (e.g., "The north-west corner of your field shows signs of stress. This could be due to uneven irrigation or a pest issue. A ground inspection is recommended.").
          4.  **Overall Health Status**: A single word summarizing the current state: "Healthy", "Moderate", or "Stressed".
          `,
          prompt: `
            Analyze the following farm field and generate a simulated satellite health report in ${input.language}.

            - **Field Name:** ${input.field.fieldName}
            - **Crop:** ${input.field.cropName || 'Not specified'}
            - **Area:** ${input.field.area.toFixed(2)} acres
            - **Field Shape Coordinates (for map generation):** ${JSON.stringify(input.field.coordinates)}

            Generate the health map, 30-day trend, overall status, and farmer advice.
          `,
          output: {
              schema: GetSatelliteHealthOutputSchema,
          }
      });
      
      if (!output) {
        throw new Error("AI did not return a valid analysis.");
      }
      return output;
    } catch (error) {
       console.error("Error in getSatelliteHealthFlow:", error);
       throw new Error("The AI model could not generate a satellite health report. Please try again.");
    }
  }
);
