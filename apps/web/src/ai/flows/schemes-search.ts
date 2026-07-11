
'use server';
import { z } from 'zod';
import { callGemini, getPrimaryModel } from "@/ai/model-config";

const SearchSchemesInputSchema = z.object({
  query: z.string().describe("The user's query about government schemes, which could include crop, state, or other keywords. If empty, provide a general list of major national schemes."),
});
export type SearchSchemesInput = z.infer<typeof SearchSchemesInputSchema>;

const SchemeSchema = z.object({
  name: z.string().describe("The official name of the scheme."),
  description: z.string().describe("A brief summary of the scheme's purpose and benefits."),
  eligibility: z.string().describe("Who is eligible for this scheme."),
  link: z.string().describe("An official URL for more information, if available. Should be a valid URL, or '#' if not found."),
});

const SearchSchemesOutputSchema = z.object({
  schemes: z.array(SchemeSchema).describe("A list of relevant government schemes found."),
  message: z.string().describe("A friendly introductory message to present to the user before listing the schemes."),
});
export type SearchSchemesOutput = z.infer<typeof SearchSchemesOutputSchema>;
export async function searchSchemes(input: SearchSchemesInput): Promise<SearchSchemesOutput> {
  const promptText = `You are an expert on agricultural policies and government schemes for farmers in India.
  
  Your task is to find and summarize relevant government schemes based on the user's query.

  ${input.query ? `
  Analyze the user's query: "${input.query}"
  Find the most relevant central or state-level schemes. For each scheme, provide its name, a brief description, key eligibility criteria, and a link if you can find one. If a link is not available, return '#' as the link value.
  Start with a friendly message to the user summarizing what you found for their specific query.
  ` : `
  The user has not provided a specific query. Find 3-5 of the most important and widely available national-level agricultural schemes in India (e.g., PM-KISAN, PMFBY, Soil Health Card). For each scheme, provide its name, a brief description, key eligibility criteria, and a link.
  Start with a friendly introductory message like "Here are some of the major agricultural schemes currently available in India."
  `}`;

  const responseText = await callGemini(promptText, {
    preferredModel: getPrimaryModel(),
    responseSchema: SearchSchemesOutputSchema
  });
  
  return JSON.parse(responseText);
}
