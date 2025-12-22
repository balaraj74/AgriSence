
'use server';

/**
 * @fileOverview An enhanced AI chatbot that provides personalized farming advice.
 * Uses farmer context for personalized responses based on their crops, diagnosis history, and fields.
 *
 * - farmingAdviceChatbot - A function that handles the chatbot interaction.
 * - FarmingAdviceChatbotInput - The input type for the farmingAdviceChatbot function.
 * - FarmingAdviceChatbotOutput - The return type for the farmingAdviceChatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const FarmingAdviceChatbotInputSchema = z.object({
  question: z.string().describe('The question asked by the farmer.'),
  language: z.string().optional().describe('The preferred language for the response, e.g., "English", "Hindi", "Kannada".'),
  farmerContext: z.string().optional().describe('Optional farmer context including their crops, recent diagnoses, fields, etc.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Previous conversation history for context.'),
});
export type FarmingAdviceChatbotInput = z.infer<typeof FarmingAdviceChatbotInputSchema>;

const FarmingAdviceChatbotOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the farmer question.'),
  suggestedFollowups: z.array(z.string()).max(3).describe('Up to 3 suggested follow-up questions the farmer might want to ask.'),
  relatedFeatures: z.array(z.object({
    name: z.string().describe('Name of the app feature.'),
    href: z.string().describe('URL path to the feature.'),
    reason: z.string().describe('Why this feature might help.'),
  })).max(2).describe('Up to 2 app features that might help the farmer.'),
  confidence: z.number().min(0).max(1).describe('Confidence level in the answer, from 0.0 to 1.0.'),
});
export type FarmingAdviceChatbotOutput = z.infer<typeof FarmingAdviceChatbotOutputSchema>;

export async function farmingAdviceChatbot(input: FarmingAdviceChatbotInput): Promise<FarmingAdviceChatbotOutput> {
  return farmingAdviceChatbotFlow(input);
}

const farmingAdviceChatbotFlow = ai.defineFlow(
  {
    name: 'farmingAdviceChatbotFlow',
    inputSchema: FarmingAdviceChatbotInputSchema,
    outputSchema: FarmingAdviceChatbotOutputSchema,
  },
  async (input) => {
    try {
      const language = input.language || 'English';

      // Build conversation history context
      let historyContext = '';
      if (input.conversationHistory && input.conversationHistory.length > 0) {
        historyContext = '\n\n**Previous Conversation:**\n' +
          input.conversationHistory.slice(-6).map(msg =>
            `${msg.role === 'user' ? 'Farmer' : 'AI'}: ${msg.content}`
          ).join('\n');
      }

      const systemPrompt = `You are an expert AI agronomist assistant for **AgriSence**, an agriculture app for Indian farmers. 

Your role is to provide:
1. **Accurate, actionable farming advice** tailored to Indian agriculture
2. **Personalized recommendations** based on the farmer's specific crops and situation
3. **Practical solutions** that consider local conditions, seasons, and resources

**Response Guidelines:**
- Be warm, empathetic, and supportive - farmers work hard
- Use simple language that's easy to understand
- Give specific, actionable advice with quantities, timings, and methods
- Consider the Indian agricultural context (monsoons, local crops, market cycles)
- If you're not sure, say so and suggest consulting a local KVK (Krishi Vigyan Kendra)
- Respond in ${language}

**Available App Features** (for relatedFeatures):
- Disease Check (/disease-check): AI-powered plant disease diagnosis
- Market Prices (/market): Current mandi prices for crops
- Weather (/weather): Weather forecast for farming
- Satellite Health (/satellite-health): Crop health monitoring
- Govt Schemes (/schemes): Government subsidy and scheme information
- Soil Advisor (/soil-advisor): Soil health recommendations
- Crop Calendar (/crop-calendar): Task scheduling for crops
- Analytics (/analytics): Farm expense and harvest analytics

${input.farmerContext ? `\n**Farmer's Context:**\n${input.farmerContext}` : ''}${historyContext}`;

      const { output } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        system: systemPrompt,
        prompt: `Farmer's Question: "${input.question}"

Please provide a helpful, detailed answer and suggest relevant follow-up questions they might have.`,
        output: { schema: FarmingAdviceChatbotOutputSchema },
      });

      if (!output) {
        throw new Error('No response generated');
      }

      return output;
    } catch (error) {
      console.error('Error in farmingAdviceChatbotFlow:', error);
      // Return a graceful fallback response
      return {
        answer: `I apologize, but I'm having trouble processing your question right now. Please try again in a moment, or try rephrasing your question. If the issue persists, you can also visit your local KVK (Krishi Vigyan Kendra) for assistance.`,
        suggestedFollowups: [
          'What are common issues with my crops?',
          'How can I improve soil health?',
          'What government schemes are available for farmers?',
        ],
        relatedFeatures: [
          { name: 'Disease Check', href: '/disease-check', reason: 'Get AI diagnosis for plant issues' },
        ],
        confidence: 0.3,
      };
    }
  }
);
