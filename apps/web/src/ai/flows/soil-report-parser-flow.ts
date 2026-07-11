
'use server';
import { z } from 'zod';
import { ParseSoilReportInputSchema, ParseSoilReportOutputSchema } from '@/types/soil-advisor';
import type { ParseSoilReportInput, ParseSoilReportOutput } from '@/types/soil-advisor';
import { callGemini, getPrimaryModel } from "@/ai/model-config";
export async function parseSoilReport(input: ParseSoilReportInput): Promise<ParseSoilReportOutput> {
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
  
  let inlineData;
  const match = input.reportDataUri.match(/^data:(.+);base64,(.+)$/);
  if (match) {
    inlineData = { mimeType: match[1], data: match[2] };
  } else {
    inlineData = { mimeType: 'image/jpeg', data: input.reportDataUri.split(',')[1] || input.reportDataUri };
  }

  const promptPayload = [
    { inlineData },
    promptText,
  ];

  const output = await callGemini(promptPayload, {
        preferredModel: getPrimaryModel(),
        responseSchema: ParseSoilReportOutputSchema,
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
