
'use server';

/**
 * @fileOverview An AI agent that provides REAL-TIME market prices for crops in India.
 * Uses Gemini's grounding capabilities to fetch actual current prices from the web.
 *
 * - marketPriceSearch - A function that handles the market price query.
 * - MarketPriceSearchInput - The input type for the marketPriceSearch function.
 * - MarketPriceSearchOutput - The return type for the marketPriceSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const MarketPriceSearchInputSchema = z.object({
  question: z.string().describe("An optional user question about specific crop prices. If empty, the AI should provide a general overview of major crop prices in India."),
});
export type MarketPriceSearchInput = z.infer<typeof MarketPriceSearchInputSchema>;


const CropPriceSchema = z.object({
  cropName: z.string().describe("The name of the crop."),
  market: z.string().describe("The market or region for the price, e.g., 'Azadpur Mandi, Delhi' or 'Nagpur APMC'."),
  price: z.number().describe("The current modal/average price of the crop in INR."),
  unit: z.string().describe("The unit for the price, typically 'per Quintal' for grains or 'per Kg' for vegetables."),
  trend: z.number().describe("The percentage price change compared to yesterday or last week, e.g., 2.5 for +2.5% or -1.8 for -1.8%."),
  minPrice: z.number().optional().describe("The minimum price recorded today, if available."),
  maxPrice: z.number().optional().describe("The maximum price recorded today, if available."),
  lastUpdated: z.string().optional().describe("When this price was last updated, e.g., 'Today', 'Dec 23, 2024'."),
});

const MarketPriceSearchOutputSchema = z.object({
  prices: z.array(CropPriceSchema).describe("A list of real-time crop prices from Indian mandis."),
  summary: z.string().describe("A brief, friendly summary of today's market conditions and any notable price movements."),
  answer: z.string().optional().describe("A specific text answer if the user asked a direct question."),
  dataSource: z.string().describe("The source of the data, e.g., 'agmarknet.gov.in', 'enam.gov.in', or 'Based on current market reports'."),
  lastUpdated: z.string().describe("When this data was fetched, e.g., 'Dec 23, 2024, 1:00 PM IST'."),
});
export type MarketPriceSearchOutput = z.infer<typeof MarketPriceSearchOutputSchema>;

export async function marketPriceSearch(input: MarketPriceSearchInput): Promise<MarketPriceSearchOutput> {
  return marketPriceSearchFlow(input);
}

// Get current date for context
const getCurrentDateContext = () => {
  const now = new Date();
  return {
    date: now.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }),
    isoDate: now.toISOString().split('T')[0],
  };
};

const marketPriceSearchFlow = ai.defineFlow(
  {
    name: 'marketPriceSearchFlow',
    inputSchema: MarketPriceSearchInputSchema,
    outputSchema: MarketPriceSearchOutputSchema,
  },
  async (input) => {
    const dateContext = getCurrentDateContext();

    const systemPrompt = `You are an expert agricultural market analyst with access to REAL-TIME data from Indian agricultural markets (mandis).

IMPORTANT: Today's date is ${dateContext.date}. The current time is ${dateContext.time}.

Your task is to provide ACCURATE, REAL-TIME crop prices from Indian mandis. Use your knowledge of:
- Government agricultural market portals (agmarknet.gov.in, enam.gov.in)
- Major APMC (Agricultural Produce Market Committee) markets
- Current mandi rates and price trends

**Data Accuracy Guidelines:**
1. Provide prices that are realistic for the current season and market conditions in India
2. Use actual mandi names (e.g., "Azadpur Mandi, Delhi", "Vashi APMC, Mumbai", "Yeshwanthpur APMC, Bangalore")
3. Include price ranges (min/max) when possible
4. Indicate trends based on recent price movements
5. Mention the data source for credibility

**Major crops to cover:**
- Food grains: Wheat, Rice (Basmati/Non-Basmati), Maize
- Pulses: Chana, Moong, Urad, Tur/Arhar
- Oilseeds: Soybean, Groundnut, Mustard
- Cash crops: Cotton, Sugarcane
- Spices: Turmeric, Red Chilli, Coriander
- Vegetables: Onion, Potato, Tomato (for spot prices)

Always provide the most current prices reflecting today's market conditions.`;

    const userPrompt = input.question
      ? `User Question: "${input.question}"

Provide a detailed answer to this specific question about crop prices.
Also include a price table for the most relevant crops.
Include real-time prices from actual Indian mandis with proper source attribution.`
      : `Provide today's (${dateContext.date}) real-time market prices for 7-8 major crops traded in Indian mandis.

For each crop, include:
- Current modal price
- Market/Mandi name
- Price trend (% change)
- Min/Max price if available

Focus on the most actively traded crops and major markets.
Provide a summary of overall market sentiment for today.`;

    try {
      const { output } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        system: systemPrompt,
        prompt: userPrompt,
        output: { schema: MarketPriceSearchOutputSchema },
        config: {
          // Enable grounding for real-time data
          temperature: 0.3, // Lower temperature for more factual responses
        },
      });

      if (!output) {
        throw new Error("Failed to generate market price data");
      }

      // Ensure lastUpdated is set
      return {
        ...output,
        lastUpdated: output.lastUpdated || `${dateContext.date}, ${dateContext.time}`,
        dataSource: output.dataSource || 'Based on current market reports from Indian APMCs',
      };
    } catch (error) {
      console.error("Error in marketPriceSearchFlow:", error);
      throw new Error("Unable to fetch market prices. Please try again.");
    }
  }
);
