
'use server';
import { GetSatelliteHealthInputSchema, GetSatelliteHealthOutputSchema } from '@/types';
import type { GetSatelliteHealthInput, GetSatelliteHealthOutput } from '@/types';
import { callGemini, getPrimaryModel } from "@/ai/model-config";
export async function getSatelliteHealthAnalysis(input: GetSatelliteHealthInput): Promise<GetSatelliteHealthOutput> {
try {
  const output = await callGemini(`
            Run the full satellite pipeline on the following field and return every stage's output in ${input.language}. Cover the last 30 days ending today.

            - **Field Name:** ${input.field.fieldName}
            - **Crop:** ${input.field.cropName || 'Not specified (infer from signature)'}
            - **Area:** ${input.field.area.toFixed(2)} acres
            - **Field Shape Coordinates (for map generation):** ${JSON.stringify(input.field.coordinates)}

            Populate: healthTrend (fused optical+SAR with a cloud-gap-filled stretch), cropClassification (with SHAP features), phenology (SOS/peak/LGP/currentStage), stressModel (stage-conditioned, with attention weights and a one-sentence explanation), waterBalance, irrigationAdvisory (priority-scored using the criticality table and formula), the health map, overallHealth, lastUpdated timestamp, and farmer advice.
          `, {
        preferredModel: getPrimaryModel(),
        systemInstruction: `You are an expert agricultural AI that emulates a comprehensive satellite crop-monitoring pipeline. You fuse OPTICAL (Sentinel-2) and SAR (Sentinel-1) data at the FEATURE level, conditioned on the crop's phenological growth stage, and you make every verdict explainable down to the contributing indices. The entire response must be in ${input.language}.

          CRITICAL: All time-series data must cover a rolling 30-day window ending on today's date.

          Emulate this staged pipeline and populate every output field:

          STAGE 0 - PREPROCESSING & FUSION
          - Produce 30 daily data points fusing optical and SAR features. For each point provide: ndvi (0-1), ndwi (-1..1), evi (-1..1), vh (SAR backscatter dB, typically -25..-8), vhVvRatio (0..1).
          - Simulate a realistic monsoon cloud gap: for a contiguous stretch of ~3-6 days, set cloudObscured=true. On those days OPTICAL indices must be gap-filled from the clean SAR VH trend (so ndvi still trends sensibly). This demonstrates SAR filling optical cloud gaps.

          STAGE 1 - CROP CLASSIFICATION (cropClassification)
          - Predict cropLabel (use the provided crop name if given, else infer from the feature signature) with a confidence (0-1).
          - Provide 3 topFeatures with SHAP-style signed contributions, e.g. {feature:'VH/VV ratio', value:'0.42', contribution:0.31}.

          STAGE 2 - PHENOLOGY ENGINE (phenology)
          - Derive startOfSeason (SOS), peakNdviDate, lengthOfGrowingPeriodDays (LGP) and classify currentStage into one of: Sowing, Vegetative, Flowering, Maturity. Provide stageProgressPercent (0-100).

          STAGE 3 - PHENOLOGY-CONDITIONED STRESS MODEL (stressModel) - CORE NOVELTY
          - Output stressScore (0-1) and a stage-aware verdict (Healthy/Moderate/Stressed). Thresholds are STAGE-DEPENDENT: NDVI-dip tolerance is WIDE at Sowing and Maturity, TIGHT at Flowering (yield-critical).
          - contributingIndices: attention weights (summing ~1.0) per index (e.g. 'NDVI anomaly', 'VH trend', 'NDWI', 'VCI') with a plain-language detail each.
          - explanation: ONE plain-language sentence stating WHY it was flagged, referencing indices and the growth stage, e.g. 'Flagged Stressed: NDVI 18% below expected for flowering stage; VH backscatter declining over last 2 composites; rainfall 4mm vs ETc 32mm.'

          STAGE 4 - WATER BALANCE (waterBalance)
          - Compute etcMm = ETo x Kc where Kc is stage-dependent (FAO-56). Provide effectiveRainfallMm, deficitMm (ETc minus effective rainfall and soil contribution), and the kc used.

          STAGE 5 - PRIORITY-SCORED IRRIGATION ADVISORY (irrigationAdvisory)
          - Use stageCriticalityWeight from this table: Sowing=0.6, Vegetative=0.8, Flowering=1.0, Maturity=0.4.
          - priorityScore = (stressScore x stageCriticalityWeight x 0.5) + (normalizedWaterDeficit x 0.3) + (fieldAreaWeight x 0.2). Normalize deficit and area to 0-1.
          - Map priorityScore to priorityRank: >=0.75 Critical, >=0.5 High, >=0.25 Medium, else Low.
          - Provide recommendedDate, recommendedVolumeMm, and a short rationale.

          OTHER OUTPUTS
          - lastUpdated: ISO 8601 timestamp for now.
          - healthMapBase64: transparent-background PNG heatmap (green NDVI>0.6, yellow 0.3-0.6, red <0.3) roughly matching the field polygon shape. No text/labels on the image.
          - overallHealth: single word (Healthy/Moderate/Stressed) consistent with the stress verdict.
          - farmerAdvice: simple actionable bullet points that reference the heatmap zones, the growth stage, the stress drivers, and the irrigation priority.
          `,
        responseSchema: GetSatelliteHealthOutputSchema,
      });
  
  if (!output) {
    throw new Error("AI did not return a valid analysis.");
  }
  return output;
} catch (error) {
   console.error("Error in getSatelliteHealthFlow:", error);
   throw new Error("The AI model could not generate a satellite health report. Please try again.");
}
}
