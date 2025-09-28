
'use server';

/**
 * @fileOverview An AI flow to parse soil test reports.
 * 
 * - parseSoilReport - A function that extracts structured data from a soil report file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import { ParseSoilReportInputSchema, ParseSoilReportOutputSchema } from '@/types/soil-advisor';
import type { ParseSoilReportInput, ParseSoilReportOutput } from '@/types/soil-advisor';


export async function parseSoilReport(input: ParseSoilReportInput): Promise<ParseSoilReportOutput> {
  return parseSoilReportFlow(input);
}


const parseSoilReportFlow = ai.defineFlow(
  {
    name: 'parseSoilReportFlow',
    inputSchema: ParseSoilReportInputSchema,
    outputSchema: ParseSoilReportOutputSchema,
  },
  async (input) => {
    try {
      const promptText = `You are an expert AI assistant with OCR capabilities, specialized in analyzing agricultural soil test reports from India. Your task is to extract key soil health parameters from the provided document.

      Analyze the document provided as a data URI and extract the following values. If a value is not present, omit it from the output. Pay close attention to units and convert them to the required format if necessary (e.g., convert nutrient values to kg/ha).
      
      Required Parameters:
      - soilPh: The pH level.
      - nitrogen: The Nitrogen (N) level. If given in a range, take the average. Convert to kg/ha.
      - phosphorus: The Phosphorus (P) level. If given in a range, take the average. Convert to kg/ha.
      - potassium: The Potassium (K) level. If given in a range, take the average. Convert to kg/ha.
      - organicCarbon: The Organic Carbon (OC) percentage (%).
      - electricalConductivity: The Electrical Conductivity (EC) in dS/m.

      Return the extracted data in a structured JSON format.
      `;
      
      const promptPayload = [
        { media: { url: input.reportDataUri } },
        { text: promptText },
      ];

      const { output } = await ai.generate({
          prompt: promptPayload, 
          model: googleAI.model('gemini-1.5-flash-latest'),
          output: { schema: ParseSoilReportOutputSchema }
      });
      
      if (!output) {
        throw new Error("The AI model could not extract any data from the report. Please ensure the document is clear and contains soil test results.");
      }
      return output;
    } catch (error) {
       console.error("Error in parseSoilReportFlow:", error);
       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during report analysis.";
       throw new Error(`Failed to parse the soil report. Details: ${errorMessage}`);
    }
  }
);
