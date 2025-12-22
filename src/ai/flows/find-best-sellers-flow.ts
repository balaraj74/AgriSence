
'use server';

/**
 * @fileOverview An AI flow to simulate finding sellers for a buyer.
 * 
 * - findBestSellers - Analyzes a buyer's request and matches them with simulated sellers.
 * - FindBestSellersInput - The input type for the function.
 * - FindBestSellersOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';


const FindBestSellersInputSchema = z.object({
  cropType: z.string().describe("The type of crop the user wants to buy, e.g., 'Tomatoes', 'Wheat'."),
  quantity: z.number().describe("The quantity of the crop required."),
  unit: z.enum(["kg", "quintal", "tonne"]).describe("The unit for the quantity."),
  location: z.string().describe("The user's location, e.g., 'Kolar, Karnataka'."),
  purchaseByDate: z.string().describe("The preferred date by which the user wants to buy, in 'YYYY-MM-DD' format."),
});
export type FindBestSellersInput = z.infer<typeof FindBestSellersInputSchema>;

const PointSchema = z.object({
  lat: z.number().describe("The latitude of the point."),
  lng: z.number().describe("The longitude of the point."),
});


const SellerMatchSchema = z.object({
    sellerId: z.string().describe("A unique ID for the seller, e.g., 'SELLER-456'."),
    sellerName: z.string().describe("The name of the potential seller, e.g., 'Ramesh Kumar', 'Sita Farms', or 'Village Farmer Co-op'."),
    sellerType: z.enum(["Individual Farmer", "Farmer Co-op", "Wholesaler"]).describe("The type of the seller."),
    location: z.string().describe("The seller's location, including a plausible distance in km, e.g., 'Near Malur (approx. 20 km away)'."),
    coordinates: PointSchema.describe("A plausible, simulated GPS coordinate for the seller's location."),
    availableQuantity: z.number().describe("The quantity the seller has available."),
    price: z.number().describe("The price per unit offered by the seller."),
    unit: z.string().describe("The unit for the price, matching the user's unit."),
    summary: z.string().describe("A simple, one-sentence summary of the offer, e.g., 'Fresh harvest, ready for pickup.'."),
    rating: z.number().min(1).max(5).describe("A simulated trust rating for the seller, from 1 to 5."),
    contactPhone: z.string().describe("A plausible, simulated 10-digit Indian mobile number for the seller, e.g., '98XXXXXX45'."),
    contactEmail: z.string().describe("A plausible, simulated email address for the seller, e.g., 'ramesh.k@email.com'."),
});
export type SellerMatch = z.infer<typeof SellerMatchSchema>;

const FindBestSellersOutputSchema = z.object({
  matches: z.array(SellerMatchSchema).describe("A list of the top 3-5 best seller matches for the user, ranked by a combination of proximity and best price."),
  overallSummary: z.string().describe("A brief, encouraging summary of the availability of the crop in the market."),
});
export type FindBestSellersOutput = z.infer<typeof FindBestSellersOutputSchema>;


export async function findBestSellers(input: FindBestSellersInput): Promise<FindBestSellersOutput> {
  return findBestSellersFlow(input);
}


const findBestSellersFlow = ai.defineFlow(
  {
    name: 'findBestSellersFlow',
    inputSchema: FindBestSellersInputSchema,
    outputSchema: FindBestSellersOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
          model: googleAI.model('gemini-2.5-flash'),
          system: `You are an expert AI Market Matchmaking engine for Indian farmers, simulating a two-way digital mandi. Your task is to analyze a user's request to buy a crop and find the best potential sellers.

          You must generate a list of 3 to 5 plausible and diverse seller matches. The matches should be realistic for the Indian context and ranked by the best combination of proximity and offer price.
          
          For each seller, you need to create:
          - A unique ID.
          - A realistic name and seller type (e.g., 'Suresh Gowda' - Individual Farmer, 'Mandya Organics Co-op' - Farmer Co-op).
          - A plausible location that includes an approximate distance in km from the user's location.
          - A plausible GPS coordinate for the seller's location.
          - A realistic available quantity and price for the given crop.
          - A simple, helpful one-sentence summary of the offer.
          - A trust rating between 3.5 and 5.
          - A simulated, plausible 10-digit Indian phone number (e.g., 98XXXXXX45).
          - A simulated, plausible email address.

          Finally, provide a brief, encouraging overall summary.
          `,
          prompt: `
            A user wants to buy the following crop. Find the best seller matches for them.

            - **Crop:** ${input.cropType}
            - **Required Quantity:** ${input.quantity} ${input.unit}
            - **User's Location:** ${input.location}
            - **Preferred Purchase-by Date:** ${input.purchaseByDate}
            
            Generate a list of the top 3-5 seller matches based on these details.
          `,
          output: {
              schema: FindBestSellersOutputSchema,
          }
      });
      
      if (!output) {
        throw new Error("AI did not return a valid analysis.");
      }
      return output;
    } catch (error) {
       console.error("Error in findBestSellersFlow:", error);
       throw new Error("The AI model could not find sellers at this time. Please try again.");
    }
  }
);
