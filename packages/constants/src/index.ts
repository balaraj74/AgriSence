/**
 * @agrisence/constants
 *
 * Shared constants used across all AgriSence applications.
 * Pure data — no framework dependencies.
 */

import type { ExpenseCategory, CropStatus, HarvestUnit } from '@agrisence/types';

// ---------------------------------------------------------------------------
// App Info
// ---------------------------------------------------------------------------

export const APP_NAME = 'AgriSence' as const;
export const APP_VERSION = '1.0.0' as const;
export const APP_TAGLINE = 'AI-Powered Smart Farming Platform' as const;

// ---------------------------------------------------------------------------
// Supported Languages
// ---------------------------------------------------------------------------

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', voiceCode: 'en-IN' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', voiceCode: 'kn-IN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', voiceCode: 'hi-IN' },
] as const;

export type SupportedLanguageCode = 'en' | 'kn' | 'hi';

// ---------------------------------------------------------------------------
// Expense Categories
// ---------------------------------------------------------------------------

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Seeds',
  'Fertilizer',
  'Labor',
  'Equipment',
  'Other',
];

export const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Seeds: '🌱',
  Fertilizer: '🧪',
  Labor: '👷',
  Equipment: '🚜',
  Other: '📦',
};

// ---------------------------------------------------------------------------
// Crop Statuses
// ---------------------------------------------------------------------------

export const CROP_STATUSES: CropStatus[] = ['Planned', 'Growing', 'Harvested'];

export const CROP_STATUS_COLORS: Record<CropStatus, string> = {
  Planned: '#6366f1',   // indigo
  Growing: '#22c55e',   // green
  Harvested: '#f59e0b', // amber
};

// ---------------------------------------------------------------------------
// Harvest Units
// ---------------------------------------------------------------------------

export const HARVEST_UNITS: HarvestUnit[] = ['kg', 'quintal', 'tonne'];

export const HARVEST_UNIT_CONVERSIONS: Record<HarvestUnit, number> = {
  kg: 1,
  quintal: 100,
  tonne: 1000,
};

// ---------------------------------------------------------------------------
// Indian States (for land records + regional filters)
// ---------------------------------------------------------------------------

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

// ---------------------------------------------------------------------------
// Firestore Collection Names
// ---------------------------------------------------------------------------

export const COLLECTIONS = {
  USERS: 'users',
  CROPS: 'crops',
  EXPENSES: 'expenses',
  HARVESTS: 'harvests',
  FIELDS: 'fields',
  DIAGNOSES: 'diagnoses',
} as const;

// ---------------------------------------------------------------------------
// API Route Paths (web app)
// ---------------------------------------------------------------------------

export const API_ROUTES = {
  CHATBOT: '/chatbot',
  DIAGNOSE: '/diagnose',
  MARKET_PRICES: '/api/market-prices',
  MARKET_PREDICT: '/api/market-predict',
  SATELLITE_HEALTH: '/api/satellite-health',
  FERTILIZER_ADVISOR: '/api/fertilizer-advisor',
  SOIL_ADVISOR: '/api/soil-advisor',
  LOAN_ASSISTANT: '/api/loan-assistant',
  SCHEMES: '/api/schemes',
} as const;

// ---------------------------------------------------------------------------
// Pagination Defaults
// ---------------------------------------------------------------------------

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
