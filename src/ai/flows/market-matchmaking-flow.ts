
'use server';

/**
 * @fileOverview An AI flow to simulate market matchmaking for farmers.
 * 
 * - findBestBuyers - Analyzes a farmer's crop details and matches them with simulated buyers.
 * - FindBestBuyersInput - The input type for the function.
 * - FindBestBuyersOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const FindBestBuyersInputSchema = z.object({
  cropType: z.string().describe("The type of crop the farmer wants to sell, e.g., 'Tomatoes', 'Wheat'."),
  quantity: z.number().describe("The quantity of the crop available for sale."),
  unit: z.enum(["kg", "quintal", "tonne"]).describe("The unit for the quantity."),
  location: z.string().describe("The farmer's location, e.g., 'Kolar, Karnataka'."),
  sellByDate: z.string().describe("The preferred date by which the farmer wants to sell, in 'YYYY-MM-DD' format."),
});
export type FindBestBuyersInput = z.infer<typeof FindBestBuyersInputSchema>;

const PointSchema = z.object({
  lat: z.number().describe("The latitude of the point."),
  lng: z.number().describe("The longitude of the point."),
});

const BuyerMatchSchema = z.object({
    buyerId: z.string().describe("A unique ID for the buyer, e.g., 'BUYER-123'."),
    buyerName: z.string().describe("The name of the potential buyer, e.g., 'City Agro Traders', 'Local Mandi Wholesaler', or 'Rampur Farmer Co-op'."),
    buyerType: z.enum(["Wholesaler", "Retailer", "Exporter", "Food Processor", "Farmer Co-op", "Individual Farmer"]).describe("The type of the buyer."),
    location: z.string().describe("The buyer's location, including a plausible distance in km, e.g., 'Nashik (approx. 15 km away)'."),
    coordinates: PointSchema.describe("A plausible, simulated GPS coordinate for the buyer's location."),
    offerPrice: z.number().describe("The price per unit offered by the buyer."),
    offerUnit: z.string().describe("The unit for the offered price, matching the farmer's unit."),
    pickupOrDelivery: z.enum(["Pickup", "Delivery"]).describe("Whether the buyer will pick up from the farm or if the farmer needs to deliver."),
    summary: z.string().describe("A simple, one-sentence summary of the offer, e.g., 'Good local price, pickup tomorrow.'."),
    rating: z.number().min(1).max(5).describe("A simulated trust rating for the buyer, from 1 to 5."),
    contactPhone: z.string().describe("A plausible, simulated 10-digit Indian mobile number for the buyer, e.g., '98XXXXXX45'."),
    contactEmail: z.string().describe("A plausible, simulated email address for the buyer, e.g., 'contact@cityagro.com'."),
});
export type BuyerMatch = z.infer<typeof BuyerMatchSchema>;


const FindBestBuyersOutputSchema = z.object({
  matches: z.array(BuyerMatchSchema).describe("A list of the top 3-5 best buyer matches for the farmer, ranked by a combination of proximity and best offer."),
  overallSummary: z.string().describe("A brief, encouraging summary of the market situation for the farmer's crop."),
});
export type FindBestBuyersOutput = z.infer<typeof FindBestBuyersOutputSchema>;


export async function findBestBuyers(input: FindBestBuyersInput): Promise<FindBestBuyersOutput> {
  return marketMatchmakingFlow(input);
}


const marketMatchmakingFlow = ai.defineFlow(
  {
    name: 'marketMatchmakingFlow',
    inputSchema: FindBestBuyersInputSchema,
    outputSchema: FindBestBuyersOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
          model: googleAI.model('gemini-2.0-flash'),
          system: `You are an expert AI Market Matchmaking engine for Indian farmers, simulating a two-way digital mandi. Your task is to analyze a farmer's crop supply and find the best potential buyers from a simulated market of wholesalers, retailers, and other farmers.

          You must generate a list of 3 to 5 plausible and diverse buyer matches. The matches should be realistic for the Indian context and ranked by the best combination of proximity and offer price.
          
          For each buyer, you need to create:
          - A unique ID.
          - A realistic name and buyer type (e.g., 'Kolar Super Foods' - Food Processor, 'Village Co-op' - Farmer Co-op).
          - A plausible location that includes an approximate distance in km from the farmer's location.
          - A plausible GPS coordinate for the buyer's location.
          - An offer price that is realistic for the given crop and market conditions. Vary the prices slightly between buyers.
          - Specify if it's pickup or delivery.
          - A simple, helpful one-sentence summary of the offer.
          - A trust rating between 3.5 and 5.
          - A simulated, plausible 10-digit Indian phone number (e.g., 98XXXXXX45).
          - A simulated, plausible email address.

          Finally, provide a brief, encouraging overall summary.
          `,
          prompt: `
            A farmer has the following crop to sell. Find the best buyer matches for them, ranked by proximity and offer quality.

            - **Crop:** ${input.cropType}
            - **Quantity:** ${input.quantity} ${input.unit}
            - **Location:** ${input.location}
            - **Preferred Sell-by Date:** ${input.sellByDate}
            
            Generate a list of the top 3-5 buyer matches based on these details.
          `,
          output: {
              schema: FindBestBuyersOutputSchema,
          }
      });
      
      if (!output) {
        throw new Error("AI did not return a valid analysis.");
      }
      return output;
    } catch (error) {
       console.error("Error in marketMatchmakingFlow:", error);
       throw new Error("The AI model could not find buyer matches at this time. Please try again.");
    }
  }
);
