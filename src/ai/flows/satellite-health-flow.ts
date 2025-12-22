
'use server';

/**
 * @fileOverview An AI flow to simulate satellite-based crop health monitoring.
 * 
 * - getSatelliteHealthAnalysis - Analyzes a given field polygon to generate a simulated health map and advice.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { GetSatelliteHealthInputSchema, GetSatelliteHealthOutputSchema } from '@/types';
import type { GetSatelliteHealthInput, GetSatelliteHealthOutput } from '@/types';


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
          model: googleAI.model('gemini-2.0-flash'),
          system: `You are an expert agricultural AI specializing in satellite imagery analysis. Your task is to simulate a crop health report based on a farmer's field data for the last 30 days. The entire response must be in ${input.language}.

          CRITICAL: The data you generate must be for a rolling 30-day window, ending on today's date.

          You will generate:
          1.  **Last Updated Timestamp**: A timestamp for when the analysis was run, in ISO 8601 format (e.g., "2025-09-15T10:30:00Z").
          2.  **Simulated NDVI Health Map**: A base64 encoded PNG image representing the crop health. The map should be a simple heatmap with green (healthy, NDVI > 0.6), yellow (moderate, NDVI 0.3-0.6), and red (stressed, NDVI < 0.3) zones. The image background MUST be transparent, and the colored zones should roughly match the shape of the provided field coordinates to look like an overlay. Do not include any text or labels on the image itself.
          3.  **30-Day Health Trend**: A list of 30 daily data points for an NDVI trend chart. The values should be plausible, showing some fluctuation. The most recent date must be today, and the dates should go back 30 days from today.
          4.  **Farmer-Friendly Advice**: Based on the simulated heatmap and NDVI trend, generate simple, actionable advice. Use bullet points for readability. Your advice MUST reference insights from the heatmap.
                - If the heatmap shows specific stressed (red/yellow) zones, your advice must mention them (e.g., "The north-west corner of your field shows signs of stress.").
                - If NDVI is falling sharply, recommend checking for pest/disease or water stress in the highlighted areas.
                - If NDVI is stable but low (<0.5), suggest soil fertility improvement or nitrogen supplementation.
                - If NDVI is increasing, encourage the farmer to continue current practices and suggest preventive measures for the next 2 weeks.
          5.  **Overall Health Status**: A single word summarizing the current state based on the most recent data: "Healthy", "Moderate", or "Stressed".
          `,
          prompt: `
            Analyze the following farm field and generate a simulated satellite health report in ${input.language}. The analysis must cover the last 30 days.

            - **Field Name:** ${input.field.fieldName}
            - **Crop:** ${input.field.cropName || 'Not specified'}
            - **Area:** ${input.field.area.toFixed(2)} acres
            - **Field Shape Coordinates (for map generation):** ${JSON.stringify(input.field.coordinates)}

            Generate the health map, 30-day trend, overall status, "last updated" timestamp, and detailed farmer advice with bullet points that references the heatmap.
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
