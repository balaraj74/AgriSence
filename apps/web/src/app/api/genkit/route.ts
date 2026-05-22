import { NextRequest, NextResponse } from 'next/server';

// Import all AI flows
import { diagnoseCropDisease } from '@/ai/flows/crop-disease-detection';
import { farmingAdviceChatbot } from '@/ai/flows/farming-advice-chatbot';
import { marketPriceSearch } from '@/ai/flows/market-price-search';
import { searchSchemes } from '@/ai/flows/schemes-search';
import { getWeatherInfo } from '@/ai/flows/weather-search';
import { identifyMedicinalPlant } from '@/ai/flows/medicinal-plant-identifier';
import { generateCropCalendar } from '@/ai/flows/generate-crop-calendar';
import { getSoilAdvice } from '@/ai/flows/soil-advisor-flow';
import { parseSoilReport } from '@/ai/flows/soil-report-parser-flow';
import { getSatelliteHealthAnalysis } from '@/ai/flows/satellite-health-flow';
import { predictMarketPrice } from '@/ai/flows/price-prediction-flow';
import { liveFarmAdvisor } from '@/ai/flows/live-advisor-flow';
import { checkLoanInsuranceEligibility } from '@/ai/flows/loan-insurance-assistant-flow';
import { findBestBuyers } from '@/ai/flows/market-matchmaking-flow';
import { findBestSellers } from '@/ai/flows/find-best-sellers-flow';

// Map flow names to their implementations
const flowMap = {
  diagnoseCropDisease,
  farmingAdviceChatbot,
  marketPriceSearch,
  searchSchemes,
  getWeatherInfo,
  identifyMedicinalPlant,
  generateCropCalendar,
  getSoilAdvice,
  parseSoilReport,
  getSatelliteHealthAnalysis,
  predictMarketPrice,
  liveFarmAdvisor,
  checkLoanInsuranceEligibility,
  findBestBuyers,
  findBestSellers,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flow, data } = body;

    if (!flow) {
      return NextResponse.json(
        { error: 'Flow name is required' },
        { status: 400 }
      );
    }

    const flowFunction = flowMap[flow as keyof typeof flowMap];

    if (!flowFunction) {
      return NextResponse.json(
        { error: `Flow '${flow}' not found` },
        { status: 404 }
      );
    }

    const result = await flowFunction(data);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error executing flow:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Genkit AI Flows API',
    availableFlows: Object.keys(flowMap),
    usage: 'POST with { flow: "flowName", data: {...} }',
  });
}
