
'use server';

/**
 * @fileOverview An AI agent that provides a 7-day market price forecast for a given crop and market.
 *
 * - predictMarketPrice - A function that handles the market price forecast query.
 * - PredictMarketPriceInput - The input type for the predictMarketPrice function.
 * - PredictMarketPriceOutput - The return type for the predictMarketPrice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const PredictMarketPriceInputSchema = z.object({
  cropName: z.string().describe("The name of the crop, e.g., 'Wheat'."),
  marketName: z.string().describe("The market or region for the price, e.g., 'Nagpur Mandi'."),
});
export type PredictMarketPriceInput = z.infer<typeof PredictMarketPriceInputSchema>;

const DailyForecastSchema = z.object({
    date: z.string().describe("The forecasted date in 'YYYY-MM-DD' format."),
    predictedPrice: z.number().describe("The predicted price for that day."),
});
export type DailyForecast = z.infer<typeof DailyForecastSchema>;

const PredictMarketPriceOutputSchema = z.object({
    forecast: z.array(DailyForecastSchema).describe("A list of 7 daily price forecasts."),
    summary: z.string().describe("A brief, friendly summary of the price forecast and trend."),
});
export type PredictMarketPriceOutput = z.infer<typeof PredictMarketPriceOutputSchema>;

export async function predictMarketPrice(input: PredictMarketPriceInput): Promise<PredictMarketPriceOutput> {
  return predictMarketPriceFlow(input);
}

const predictMarketPriceFlow = ai.defineFlow(
  {
    name: 'predictMarketPriceFlow',
    inputSchema: PredictMarketPriceInputSchema,
    outputSchema: PredictMarketPriceOutputSchema,
  },
  async ({ cropName, marketName }) => {
    const { output } = await ai.generate({
      model: googleAI.model('gemini-1.5-flash-latest'),
      prompt: `
        You are an expert agricultural market analyst. Your task is to generate a plausible and realistic 7-day price forecast for a specific crop in a given Indian market.
        
        Generate a forecast for the next 7 days, starting from tomorrow.
        - The dates should be in 'YYYY-MM-DD' format.
        - The prices should be realistic for the Indian market, per quintal.
        - The price fluctuations should be logical and reflect some daily market volatility. Avoid creating a perfectly straight line; introduce minor, realistic ups and downs.
        - Provide a short, conversational summary of the predicted trend (e.g., "Prices for ${cropName} are expected to remain stable with a slight upward trend, though some minor daily fluctuations are likely.").

        Crop: ${cropName}
        Market: ${marketName}
      `,
      output: {
        schema: PredictMarketPriceOutputSchema,
      },
    });

    if (!output) {
      throw new Error("The AI model failed to generate a price forecast.");
    }
    return output;
  }
);
