/**
 * AI Model Configuration
 * Centralized configuration for Gemini model selection
 * 
 * Available models as of December 2025:
 * - gemini-2.0-flash: Stable, production-ready
 * - gemini-3-flash-preview: Latest preview with enhanced capabilities
 * - gemini-2.5-pro: Balanced performance and capability
 */

import { googleAI } from '@genkit-ai/googleai';

// Model selection - Use preview for cutting-edge features, stable for production
const USE_PREVIEW_MODEL = true;

// Model identifiers
const MODELS = {
    // Latest Gemini 3 Flash - frontier intelligence built for speed
    GEMINI_3_FLASH: 'gemini-2.0-flash', // Use stable version for now until 3-flash is fully released
    // Stable production model
    GEMINI_2_FLASH: 'gemini-2.0-flash',
    // Pro model for complex reasoning
    GEMINI_PRO: 'gemini-2.0-flash',
} as const;

/**
 * Get the primary AI model for general use
 * Uses the latest stable model for reliable results
 */
export function getPrimaryModel() {
    return googleAI.model(USE_PREVIEW_MODEL ? MODELS.GEMINI_3_FLASH : MODELS.GEMINI_2_FLASH);
}

/**
 * Get the vision model for image analysis
 * Flash model has excellent multimodal capabilities
 */
export function getVisionModel() {
    return googleAI.model(MODELS.GEMINI_3_FLASH);
}

/**
 * Get the model name string for prompts
 */
export function getModelName() {
    return USE_PREVIEW_MODEL ? MODELS.GEMINI_3_FLASH : MODELS.GEMINI_2_FLASH;
}

// Export model constants for reference
export { MODELS };
