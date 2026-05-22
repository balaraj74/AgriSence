
import type { MarketPrice, Scheme, Expense, Harvest, Crop } from "@/types";

// This file contains mock data. 
// In a real application, this would be fetched from a database or live APIs.

export const marketPrices: MarketPrice[] = [
  { crop: "Rice", region: "Punjab", price: 1940, change: 1.5 },
  { crop: "Wheat", region: "Uttar Pradesh", price: 2015, change: -0.8 },
  { crop: "Maize", region: "Karnataka", price: 1870, change: 2.1 },
];

export const states = ["All", "Karnataka", "Maharashtra", "Punjab", "Uttar Pradesh", "Gujarat", "Madhya Pradesh", "Central"];
export const crops = ["All", "Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Soybean", "Pomegranate"];

export const schemes: Scheme[] = [
  {
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    crop: "All",
    state: "Central",
    description: "An insurance service for farmers for their yields.",
    link: "https://pmfby.gov.in/",
  },
   {
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    crop: "All",
    state: "Central",
    description: "Income support of ₹6,000 per year for all landholding farmer families.",
    link: "https://pmkisan.gov.in/",
  },
];
