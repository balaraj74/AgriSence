/**
 * AI Model Configuration — Vertex AI via @genkit-ai/google-genai
 *
 * All AI calls route through Google Cloud Vertex AI (project: agrisence-1dc30).
 * Credits are consumed from your GCP billing account — NOT the Gemini Developer API.
 *
 * Authentication: Application Default Credentials (ADC)
 *   - Local:       `gcloud auth application-default login` (already done)
 *   - Production:  Firebase App Hosting auto-detects the project service account
 *
 * Available Vertex AI models (stable as of July 2026):
 *   - gemini-2.5-flash : Fast, multimodal, best cost/performance → primary model
 *   - gemini-2.5-pro   : Highest capability for complex reasoning
 */

import { vertexAI } from '@genkit-ai/google-genai';

// Model identifiers — Vertex AI format
const MODELS = {
  FLASH: 'gemini-2.5-flash',   // Primary — fast, multimodal, great for most flows
  PRO:   'gemini-2.5-pro',     // Complex reasoning — soil reports, predictions
} as const;

/**
 * Primary model for general AI flows (chatbot, disease detection, schemes, etc.)
 */
export function getPrimaryModel() {
  return vertexAI.model(MODELS.FLASH);
}

/**
 * Vision model for image analysis (disease detection, medicinal plants, soil)
 */
export function getVisionModel() {
  return vertexAI.model(MODELS.FLASH);
}

/**
 * High-capability model for complex analytical reports
 */
export function getReportModel() {
  return vertexAI.model(MODELS.FLASH); // Switch to MODELS.PRO for max capability
}

/**
 * Get the model name string for inline model references in flows
 */
export function getModelName(): string {
  return MODELS.FLASH;
}

// Export model constants for reference
export { MODELS };
