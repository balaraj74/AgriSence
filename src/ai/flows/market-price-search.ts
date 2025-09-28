
'use server';

/**
 * @fileOverview An AI agent that provides market prices for major crops.
 *
 * - marketPriceSearch - A function that handles the market price query.
 * - MarketPriceSearchInput - The input type for the marketPriceSearch function.
 * - MarketPriceSearchOutput - The return type for the marketPriceSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const MarketPriceSearchInputSchema = z.object({
  question: z.string().describe("An optional user question about specific crop prices. If empty, the AI should provide a general overview of major crop prices in India."),
});
export type MarketPriceSearchInput = z.infer<typeof MarketPriceSearchInputSchema>;


const CropPriceSchema = z.object({
    cropName: z.string().describe("The name of the crop."),
    market: z.string().describe("The market or region for the price, e.g., 'Nagpur Mandi'."),
    price: z.number().describe("The price of the crop."),
    unit: z.string().describe("The unit for the price, e.g., 'per Quintal'."),
    trend: z.number().describe("The percentage price change, e.g., 1.5 for +1.5% or -0.8 for -0.8%."),
});

const MarketPriceSearchOutputSchema = z.object({
    prices: z.array(CropPriceSchema).describe("A list of crop prices."),
    summary: z.string().describe("A brief, friendly summary of the overall market conditions."),
    answer: z.string().optional().describe("A specific text answer if the user asked a direct question."),
});
export type MarketPriceSearchOutput = z.infer<typeof MarketPriceSearchOutputSchema>;

export async function marketPriceSearch(input: MarketPriceSearchInput): Promise<MarketPriceSearchOutput> {
  return marketPriceSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketPriceSearchPrompt',
  model: googleAI.model('gemini-2.5-flash-preview-09-2025'),
  input: {schema: MarketPriceSearchInputSchema},
  output: {schema: MarketPriceSearchOutputSchema},
  prompt: `You are an expert agricultural market analyst. Your task is to provide an overview of major crop prices in India.

  {{#if question}}
  First, provide a detailed text answer to the user's specific question: "{{{question}}}". Populate the 'answer' field with this text.
  Then, also provide a general price table for major crops as a fallback.
  {{else}}
  Generate a table of current market prices for at least 5-7 major, commonly traded crops in India (e.g., Wheat, Rice, Cotton, Soybean, Maize, Turmeric, Chana). 
  For each crop, provide a price from a major corresponding market (mandi) in India.
  Include the crop name, the market name, a realistic price per quintal, and a plausible recent price trend percentage (positive or negative).
  Also, provide a short, friendly summary of the overall market conditions.
  {{/if}}`,
});

const marketPriceSearchFlow = ai.defineFlow(
  {
    name: 'marketPriceSearchFlow',
    inputSchema: MarketPriceSearchInputSchema,
    outputSchema: MarketPriceSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
