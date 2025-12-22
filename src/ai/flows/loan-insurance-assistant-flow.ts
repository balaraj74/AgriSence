
'use server';

/**
 * @fileOverview An AI assistant to check eligibility for farmer loans and insurance schemes.
 * 
 * - checkLoanInsuranceEligibility - Analyzes a farmer's profile to find suitable financial products.
 * - CheckLoanInsuranceEligibilityInput - The input type for the function.
 * - CheckLoanInsuranceEligibilityOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const CheckLoanInsuranceEligibilityInputSchema = z.object({
  landSizeAcres: z.number().describe("The farmer's total land holding in acres."),
  primaryCrop: z.string().describe("The main crop cultivated by the farmer, e.g., 'Rice', 'Cotton'."),
  location: z.string().describe("The farmer's location, e.g., 'Mandya, Karnataka'."),
  hasKisanCreditCard: z.boolean().describe("Whether the farmer already has a Kisan Credit Card."),
});
export type CheckLoanInsuranceEligibilityInput = z.infer<typeof CheckLoanInsuranceEligibilityInputSchema>;

const EligibleSchemeSchema = z.object({
    schemeName: z.string().describe("The name of the recommended loan or insurance scheme, e.g., 'Kisan Credit Card (KCC)'."),
    schemeType: z.enum(["Loan", "Insurance"]).describe("The type of the scheme."),
    eligibilitySummary: z.string().describe("A simple, one-sentence summary explaining why the farmer is eligible."),
    benefits: z.string().describe("A brief, bulleted list of the key benefits of this scheme."),
    nextSteps: z.string().describe("A simple, step-by-step guide on how the farmer should proceed to apply."),
    requiredDocuments: z.string().describe("A comma-separated list of the essential documents required for the application."),
});

const CheckLoanInsuranceEligibilityOutputSchema = z.object({
  eligibleSchemes: z.array(EligibleSchemeSchema).describe("A list of loan and insurance schemes the farmer is likely eligible for."),
  overallSummary: z.string().describe("A brief, encouraging summary of the findings for the farmer."),
});
export type CheckLoanInsuranceEligibilityOutput = z.infer<typeof CheckLoanInsuranceEligibilityOutputSchema>;


export async function checkLoanInsuranceEligibility(input: CheckLoanInsuranceEligibilityInput): Promise<CheckLoanInsuranceEligibilityOutput> {
  return loanInsuranceAssistantFlow(input);
}


const loanInsuranceAssistantFlow = ai.defineFlow(
  {
    name: 'loanInsuranceAssistantFlow',
    inputSchema: CheckLoanInsuranceEligibilityInputSchema,
    outputSchema: CheckLoanInsuranceEligibilityOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
          model: googleAI.model('gemini-2.0-flash'),
          system: `You are an expert AI assistant for Indian farmers, specializing in government loans and insurance schemes. Your task is to analyze a farmer's profile and determine their eligibility for key financial products.

          Available Schemes to consider:
          1.  **Kisan Credit Card (KCC):** A short-term formal credit loan. Eligibility: Any farmer who owns cultivable land. Benefit: Low-interest credit for farming needs.
          2.  **Pradhan Mantri Fasal Bima Yojana (PMFBY):** A crop insurance scheme. Eligibility: All farmers growing notified crops in notified areas. Benefit: Insurance coverage against crop failure due to natural calamities.
          3.  **Modified Interest Subvention Scheme (MISS):** Provides interest subvention on short-term crop loans. Eligibility: Farmers taking loans up to ₹3 lakh via KCC.

          Based on the user's input, identify all schemes they are likely eligible for. For each scheme, provide the required information in the output schema. Keep all explanations simple, clear, and encouraging.
          `,
          prompt: `
            Analyze the following farmer's profile:

            - **Total Land:** ${input.landSizeAcres} acres
            - **Primary Crop:** ${input.primaryCrop}
            - **Location:** ${input.location}
            - **Already has KCC:** ${input.hasKisanCreditCard ? 'Yes' : 'No'}

            Generate a list of eligible schemes with all the required details. If the farmer already has a KCC, do not recommend it again but do recommend related schemes like MISS.
          `,
          output: {
              schema: CheckLoanInsuranceEligibilityOutputSchema,
          }
      });
      
      if (!output) {
        throw new Error("AI did not return a valid analysis.");
      }
      return output;
    } catch (error) {
       console.error("Error in loanInsuranceAssistantFlow:", error);
       throw new Error("The AI model could not process your eligibility check. Please try again.");
    }
  }
);
