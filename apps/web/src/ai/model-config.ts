import { GoogleGenAI, Type, Schema } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Models configuration
export const MODELS = {
  FLASH: 'gemini-2.5-flash',
  PRO: 'gemini-2.5-pro',
} as const;

export interface GeminiOptions {
  preferredModel: string;
  temperature?: number;
  thinkingLevel?: 'none' | 'low' | 'medium' | 'high';
  responseSchema?: any; // Zod schema
  systemInstruction?: string;
}

// Client 1: AI Studio (Primary) using Developer API Key
let aiStudioClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiStudioClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Client 2: Vertex AI (Fallback) using Application Default Credentials
let vertexClient: GoogleGenAI | null = null;
if (process.env.GCLOUD_PROJECT && process.env.GCLOUD_LOCATION) {
  vertexClient = new GoogleGenAI({
    vertexai: {
      project: process.env.GCLOUD_PROJECT,
      location: process.env.GCLOUD_LOCATION,
    }
  } as any);
} else {
  // If explicitly not passed, it tries to detect ADC environment variables
  vertexClient = new GoogleGenAI({});
}

/**
 * Executes a prompt against Google Gen AI, attempting to use the primary
 * AI Studio client first, falling back to Vertex AI if it fails.
 */
export async function callGemini(prompt: any, options: GeminiOptions) {
  const modelChain = [options.preferredModel, MODELS.FLASH];
  
  // Try AI Studio first, then Vertex AI
  const clients = [aiStudioClient, vertexClient].filter(Boolean) as GoogleGenAI[];
  
  if (clients.length === 0) {
    throw new Error('No Google Gen AI clients configured.');
  }

  // Convert Zod schema to JSON schema if provided
  let jsonSchema: Schema | undefined = undefined;
  if (options.responseSchema) {
    const rawSchema = zodToJsonSchema(options.responseSchema, { target: 'jsonSchema7' }) as any;
    // Remove unsupported fields for Gemini schema
    delete rawSchema.$schema;
    jsonSchema = rawSchema as Schema;
  }

  for (const client of clients) {
    for (const modelId of modelChain) {
      try {
        const response = await client.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
            temperature: options.temperature ?? 0.2,
            systemInstruction: options.systemInstruction,
            responseMimeType: options.responseSchema ? 'application/json' : 'text/plain',
            responseSchema: jsonSchema,
            // Only add thinking if it's explicitly enabled to medium or high (or handle per model specs)
            // thinkingConfig: options.thinkingLevel && options.thinkingLevel !== 'none' ? { thinkingLevel: options.thinkingLevel } : undefined,
          }
        });
        
        const text = response.text;
        if (!text) {
          throw new Error('Empty response received from model.');
        }
        
        if (options.responseSchema) {
           // Parse and validate with the original Zod schema
           return options.responseSchema.parse(JSON.parse(text));
        }
        
        return text;
      } catch (err) {
        console.warn(`[Gemini] Model ${modelId} with client ${client === aiStudioClient ? 'AI Studio' : 'Vertex'} failed.`, err);
        // Fall back to next model / client combination
      }
    }
  }
  
  throw new Error('All Gemini clients and models failed to generate content.');
}

/**
 * High-capability model for complex analytical reports
 */
export function getReportModel() {
  return MODELS.PRO;
}

/**
 * Primary model for general AI flows (chatbot, disease detection, schemes, etc.)
 */
export function getPrimaryModel() {
  return MODELS.FLASH;
}

/**
 * Vision model for image analysis (disease detection, medicinal plants, soil)
 */
export function getVisionModel() {
  return MODELS.FLASH;
}

/**
 * Get the model name string for inline model references in flows
 */
export function getModelName(): string {
  return MODELS.FLASH;
}
