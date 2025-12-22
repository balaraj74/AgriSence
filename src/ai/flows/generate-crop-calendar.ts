
'use server';

/**
 * @fileOverview An AI flow to generate a seasonal crop calendar.
 * 
 * - generateCropCalendar - A function that creates a task schedule for a given crop and region.
 * - GenerateCropCalendarInput - The input type for the function.
 * - GenerateCropCalendarOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';


const GenerateCropCalendarInputSchema = z.object({
  cropName: z.string().describe("The name of the crop, e.g., 'Paddy' or 'Ragi'."),
  region: z.string().describe("The region (state or district) where the crop is grown, e.g., 'Karnataka'."),
});
export type GenerateCropCalendarInput = z.infer<typeof GenerateCropCalendarInputSchema>;


const TaskSchema = z.object({
    taskName: z.string().describe("The name of the agricultural task, e.g., 'Sowing', 'Fertilizer Application', 'Irrigation', 'Harvesting'."),
    dateRange: z.string().describe("The typical date range for this task in a 'Month Day - Month Day' format, e.g., 'July 1 - July 10' or 'October 15' for a single day."),
});

export type AIGeneratedTask = z.infer<typeof TaskSchema>;

const GenerateCropCalendarOutputSchema = z.object({
  tasks: z.array(TaskSchema).describe("An array of key agricultural tasks and their schedules for the given crop and region."),
});
export type GenerateCropCalendarOutput = z.infer<typeof GenerateCropCalendarOutputSchema>;


export async function generateCropCalendar(input: GenerateCropCalendarInput): Promise<GenerateCropCalendarOutput> {
  return generateCropCalendarFlow(input);
}


const generateCropCalendarFlow = ai.defineFlow(
  {
    name: 'generateCropCalendarFlow',
    inputSchema: GenerateCropCalendarInputSchema,
    outputSchema: GenerateCropCalendarOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
          model: googleAI.model('gemini-2.5-flash'),
          system: `You are an expert agriculturalist specializing in Indian farming practices. Your task is to generate a typical, simplified seasonal calendar for a specific crop in a given Indian region.`,
          prompt: `
            The calendar should include the most critical tasks: Sowing, at least one Fertilizing event, Irrigation period, and Harvesting.
            
            For each task, provide a concise name and a typical date range. The date range should be in a "Month Day - Month Day" format. If it's a single day, just state the "Month Day". Do not include the year.
            
            Example for 'Paddy' in 'Karnataka':
            - Sowing: July 1 - July 10
            - Fertilizer (NPK): July 20
            - Irrigation: July 15 - September 15
            - Harvest: October 10
            
            Now, generate this calendar for:
            - Crop: ${input.cropName}
            - Region: ${input.region}
          `,
          output: {
              schema: GenerateCropCalendarOutputSchema,
          }
      });
      
      if (!output || !output.tasks) {
        throw new Error("AI did not return a valid task list.");
      }
      return output;
    } catch (error) {
       console.error("Error in generateCropCalendarFlow:", error);
       throw new Error("The AI model could not generate a calendar. Please try again.");
    }
  }
);
