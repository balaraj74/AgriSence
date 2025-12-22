
'use server';

/**
 * @fileOverview An AI-powered assistant for soil health and fertilizer recommendations.
 * 
 * - getSoilAdvice - Analyzes soil data to provide fertilizer and management advice.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { GetSoilAdviceInputSchema, GetSoilAdviceOutputSchema } from '@/types/soil-advisor';
import type { GetSoilAdviceInput, GetSoilAdviceOutput } from '@/types/soil-advisor';


export async function getSoilAdvice(input: GetSoilAdviceInput): Promise<GetSoilAdviceOutput> {
  return getSoilAdviceFlow(input);
}


const getSoilAdviceFlow = ai.defineFlow(
  {
    name: 'getSoilAdviceFlow',
    inputSchema: GetSoilAdviceInputSchema,
    outputSchema: GetSoilAdviceOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
          model: googleAI.model('gemini-2.0-flash'),
          system: `You are an expert agronomist AI specializing in Indian soil conditions. Your task is to provide a detailed and farmer-friendly soil health report.
          
          You will analyze the provided soil data and generate recommendations. The entire response, including all names and descriptions, must be in the requested language: ${input.language}.
          
          Instructions:
          1.  **Crop Recommendation**: Based on the soil nutrient data and the provided farm location, suggest 2-3 crops that are well-suited for these conditions. Provide a brief, one-sentence reason for each suggestion.
          2.  **Nutrient Analysis**: For each nutrient (pH, Nitrogen, Phosphorus, Potassium), determine its status (e.g., Low, Sufficient, High) and provide a simple one-sentence comment.
          3.  **Chemical Recommendations**: Recommend a set of common chemical fertilizers (like Urea, DAP, MOP). For each, specify the dosage in 'kg per acre' and the best time to apply it. These recommendations should be generally applicable to the suggested crops.
          4.  **Organic Alternatives**: Suggest at least two organic options (like FYM, Vermicompost, Neem Cake). Provide a practical application rate (e.g., 'tonnes/acre') and briefly explain the benefits.
          5.  **Soil Management Tips**: Provide a simple, bulleted list of 3-4 practical tips for long-term soil health improvement.
          6.  **Chart Generation**: Generate multiple charts as base64 encoded PNG images. The charts should have clear labels and a simple, clean design.
                - **Pie Chart**: Show the relative percentage balance of N, P, and K.
                - **Bar Graph**: Show the current levels of N, P, and K compared to a typical 'Recommended' level for crops suitable to the region.
                - **pH Gauge**: Create a simple gauge indicating if the pH is acidic, neutral, or alkaline.
                - **Organic Matter Progress**: Create a simple progress bar showing the organic matter status.
                - **Micronutrient Radar**: If micronutrient data is available (assume typical values if not), create a simple radar chart.
          `,
          prompt: `
            A farmer has provided the following soil data for their field. Please generate a comprehensive soil health report, including crop recommendations and all requested base64 PNG charts.

            - **Farm Location:** ${input.location}
            - **Soil pH:** ${input.soilPh}
            - **Nitrogen (N):** ${input.nitrogen} kg/ha
            - **Phosphorus (P):** ${input.phosphorus} kg/ha
            - **Potassium (K):** ${input.potassium} kg/ha
            - **Response Language:** ${input.language}
            
            Generate the structured report based on these details.
          `,
          output: {
              schema: GetSoilAdviceOutputSchema,
          }
      });
      
      if (!output) {
        throw new Error("AI did not return a valid analysis.");
      }
      return output;
    } catch (error) {
       console.error("Error in getSoilAdviceFlow:", error);
       throw new Error("The AI model could not generate soil advice. Please try again.");
    }
  }
);
