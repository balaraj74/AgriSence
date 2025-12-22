
'use server';

/**
 * @fileOverview An AI chatbot that provides farming advice.
 *
 * - farmingAdviceChatbot - A function that handles the chatbot interaction.
 * - FarmingAdviceChatbotInput - The input type for the farmingAdviceChatbot function.
 * - FarmingAdviceChatbotOutput - The return type for the farmingAdviceChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const FarmingAdviceChatbotInputSchema = z.object({
  question: z.string().describe('The question asked by the farmer.'),
});
export type FarmingAdviceChatbotInput = z.infer<typeof FarmingAdviceChatbotInputSchema>;

const FarmingAdviceChatbotOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the farmer question.'),
});
export type FarmingAdviceChatbotOutput = z.infer<typeof FarmingAdviceChatbotOutputSchema>;

export async function farmingAdviceChatbot(input: FarmingAdviceChatbotInput): Promise<FarmingAdviceChatbotOutput> {
  return farmingAdviceChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'farmingAdviceChatbotPrompt',
  model: googleAI.model('gemini-2.0-flash'),
  input: {schema: FarmingAdviceChatbotInputSchema},
  output: {schema: FarmingAdviceChatbotOutputSchema},
  prompt: `You are an AI assistant providing farming advice to farmers in India.

  Answer the following question to the best of your ability, tailoring your answer to the Indian context.

  Question: {{{question}}}`,
});

const farmingAdviceChatbotFlow = ai.defineFlow(
  {
    name: 'farmingAdviceChatbotFlow',
    inputSchema: FarmingAdviceChatbotInputSchema,
    outputSchema: FarmingAdviceChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
