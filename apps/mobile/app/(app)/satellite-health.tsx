import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Polygon, Overlay } from 'react-native-maps';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { getFields } from '../../src/services/firestore';
import { getSatelliteHealth, SatelliteOutput, GrowthStage } from '../../src/services/ai';
import { useAuth } from '../../src/hooks/useAuth';
import { format, parseISO } from 'date-fns';
import {
  Satellite,
  Map as MapIcon,
  Bot,
  BarChart2,
  AlertCircle,
  Clock,
  ChevronDown,
  Check,
  RefreshCw,
  Sprout,
  Leaf,
  Flower2,
  Wheat,
  Radar,
  CloudOff,
  Droplets,
  Activity,
  Layers,
  Info,
  Gauge,
} from 'lucide-react-native';

// Stage-criticality weight table (Sowing 0.6, Vegetative 0.8, Flowering 1.0, Maturity 0.4).
const STAGE_META: Record<GrowthStage, { icon: any; color: string; order: number }> = {
  Sowing: { icon: Sprout, color: '#a3a3a3', order: 0 },
  Vegetative: { icon: Leaf, color: '#22c55e', order: 1 },
  Flowering: { icon: Flower2, color: '#ec4899', order: 2 },
  Maturity: { icon: Wheat, color: '#f59e0b', order: 3 },
};
const STAGE_ORDER: GrowthStage[] = ['Sowing', 'Vegetative', 'Flowering', 'Maturity'];

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f59e0b',
  Medium: '#eab308',
  Low: '#22c55e',
};

const { width } = Dimensions.get('window');

// Dark map style to match design aesthetics
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0f1117' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8899aa' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f0f4f8' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4ade80' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#161d2a' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8899aa' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a2030' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e2533' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8899aa' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2a3545' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e2533' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f0f4f8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#090d16' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8899aa' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#090d16' }],
  },
];

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface FirestoreField {
  id: string;
  fieldName: string;
  surveyNumber: string;
  village: string;
  area: number;
  perimeter: number;
  coordinates: Coordinate[];
  centroid: Coordinate;
  cropId?: string | null;
  cropName?: string | null;
}

export default function SatelliteHealthScreen() {
  const { user } = useAuth();
  const { colors, typography, spacing, borderRadius } = useTheme();

  const [fields, setFields] = useState<FirestoreField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SatelliteOutput | null>(null);
  const [isLoadingFields, setIsLoadingFields] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  const fetchFields = useCallback(async () => {
    if (!user) return;
    setIsLoadingFields(true);
    setErrorMessage(null);
    try {
      const fetched = await getFields(user.uid);
      const normalized = fetched.map(f => {
        const coords = (f.coordinates || []).map((c: any) => {
          let latitude = 0;
          let longitude = 0;
          if (c) {
            if (typeof c.latitude === 'number') latitude = c.latitude;
            else if (typeof c.lat === 'number') latitude = c.lat;
            
            if (typeof c.longitude === 'number') longitude = c.longitude;
            else if (typeof c.lng === 'number') longitude = c.lng;
          }
          return { latitude, longitude };
        }).filter(c => c.latitude !== 0 || c.longitude !== 0);

        let centroid = { latitude: 20.5937, longitude: 78.9629 };
        if (f.centroid) {
          const centroidVal = f.centroid as any;
          const lat = typeof centroidVal.latitude === 'number' ? centroidVal.latitude : typeof centroidVal.lat === 'number' ? centroidVal.lat : null;
          const lng = typeof centroidVal.longitude === 'number' ? centroidVal.longitude : typeof centroidVal.lng === 'number' ? centroidVal.lng : null;
          if (lat !== null && lng !== null) {
            centroid = { latitude: lat, longitude: lng };
          }
        }
        return {
          ...f,
          coordinates: coords,
          centroid,
        };
      });
      setFields(normalized as FirestoreField[]);
      if (normalized.length > 0) {
        setSelectedFieldId(normalized[0]!.id);
      }
    } catch (err: any) {
      console.error('Error fetching fields:', err);
      setErrorMessage('Failed to load your fields.');
    } finally {
      setIsLoadingFields(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const handleAnalysis = useCallback(async () => {
    if (!selectedField) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      // Map coordinates to { lat, lng } as required by the flow endpoint API
      const flowFieldInput = {
        fieldName: selectedField.fieldName,
        area: selectedField.area,
        cropName: selectedField.cropName || null,
        coordinates: selectedField.coordinates.map((c) => ({
          lat: c.latitude,
          lng: c.longitude,
        })),
      };

      const result = await getSatelliteHealth({
        field: flowFieldInput,
        language: 'English',
      });
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMessage(err.message || 'Satellite analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedField]);

  // Trigger analysis when a new field is selected
  useEffect(() => {
    if (selectedFieldId) {
      handleAnalysis();
    } else {
      setAnalysisResult(null);
    }
  }, [selectedFieldId]);

  // Calculate coordinates bounds for overlay image scaling
  const getFieldBounds = (coords: Coordinate[]) => {
    if (!coords || coords.length === 0) return null;
    let minLat = coords[0].latitude;
    let maxLat = coords[0].latitude;
    let minLng = coords[0].longitude;
    let maxLng = coords[0].longitude;

    coords.forEach((c) => {
      if (c.latitude < minLat) minLat = c.latitude;
      if (c.latitude > maxLat) maxLat = c.latitude;
      if (c.longitude < minLng) minLng = c.longitude;
      if (c.longitude > maxLng) maxLng = c.longitude;
    });

    return [
      [minLat, minLng],
      [maxLat, maxLng],
    ] as [[number, number], [number, number]];
  };

  const getStatusBadgeVariant = (status?: 'Healthy' | 'Moderate' | 'Stressed') => {
    if (status === 'Healthy') return 'success';
    if (status === 'Moderate') return 'warning';
    if (status === 'Stressed') return 'error';
    return 'default';
  };

  // Format line chart data
  const getChartData = () => {
    if (!analysisResult?.healthTrend) return [];
    return analysisResult.healthTrend.map((d) => {
      let label = '';
      try {
        label = format(parseISO(d.date), 'd MMM');
      } catch {
        label = d.date;
      }
      return {
        value: d.ndvi,
        label,
        dataPointText: d.ndvi.toFixed(2),
      };
    });
  };

  const renderHeader = () => {
    return (
      <View style={styles.introHeader}>
        <View style={[styles.introIconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <Satellite size={32} color={colors.primary} />
        </View>
        <View style={styles.introTextContainer}>
          <Text style={[styles.introTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
            Satellite Health Monitor
          </Text>
          <Text style={[styles.introSubtitle, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
            Feature-level optical + SAR fusion, conditioned on crop growth stage.
          </Text>
        </View>
      </View>
    );
  };

  // Novel-claim banner shown once analysis is ready.
  const renderClaimBanner = () => (
    <View style={[styles.claimBanner, { backgroundColor: `${colors.primary}0d`, borderColor: `${colors.primary}30` }]}>
      <View style={styles.claimRow}>
        <Layers size={16} color={colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
        <Text style={[styles.claimText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
          We fuse optical and SAR at the feature level per growth stage, so what counts as stress
          changes with the crop stage, and every verdict is explainable down to the contributing indices.
        </Text>
      </View>
    </View>
  );

  const getVerdictColor = (v?: 'Healthy' | 'Moderate' | 'Stressed') =>
    v === 'Healthy' ? '#22c55e' : v === 'Moderate' ? '#eab308' : '#ef4444';

  // Stage 1: Crop classification with SHAP-style feature bars.
  const renderCropClassification = () => {
    const cc = analysisResult?.cropClassification;
    if (!cc) return null;
    const maxContribution = Math.max(...cc.topFeatures.map((f) => Math.abs(f.contribution)), 0.0001);
    return (
      <Card style={[styles.resultsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <CardHeader>
          <CardTitle>
            <View style={styles.chartTitleRow}>
              <Radar size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, color: colors.foreground, fontFamily: typography.fontFamily.sansBold }}>
                Crop Classification
              </Text>
            </View>
          </CardTitle>
          <CardDescription>Multi-temporal optical + SAR signature</CardDescription>
        </CardHeader>
        <CardContent style={{ paddingTop: 8 }}>
          <View style={styles.classifyRow}>
            <Text style={[styles.classifyLabel, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
              {cc.cropLabel}
            </Text>
            <Badge variant={cc.confidence >= 0.75 ? 'success' : 'warning'}>
              {(cc.confidence * 100).toFixed(0)}% confidence
            </Badge>
          </View>
          <Text style={[styles.sectionCaption, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansSemiBold }]}>
            TOP CONTRIBUTING FEATURES (SHAP)
          </Text>
          {cc.topFeatures.map((f, i) => (
            <View key={i} style={styles.shapRow}>
              <View style={styles.shapLabelCol}>
                <Text style={[styles.shapFeature, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]} numberOfLines={1}>
                  {f.feature}
                </Text>
                <Text style={[styles.shapValue, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  {f.value}
                </Text>
              </View>
              <View style={styles.shapBarTrack}>
                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    width: `${(Math.abs(f.contribution) / maxContribution) * 100}%`,
                    backgroundColor: f.contribution >= 0 ? colors.primary : colors.mutedForeground,
                  }}
                />
              </View>
            </View>
          ))}
        </CardContent>
      </Card>
    );
  };

  // Stage 2: Phenology growth-stage timeline.
  const renderPhenology = () => {
    const ph = analysisResult?.phenology;
    if (!ph) return null;
    return (
      <Card style={[styles.resultsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <CardHeader>
          <CardTitle>
            <View style={styles.chartTitleRow}>
              <Activity size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, color: colors.foreground, fontFamily: typography.fontFamily.sansBold }}>
                Growth Stage
              </Text>
            </View>
          </CardTitle>
          <CardDescription>Phenology engine: SOS, peak NDVI and growing period</CardDescription>
        </CardHeader>
        <CardContent style={{ paddingTop: 8 }}>
          <View style={styles.stageTimeline}>
            {STAGE_ORDER.map((stage, i) => {
              const meta = STAGE_META[stage];
              const StageIcon = meta.icon;
              const isCurrent = ph.currentStage === stage;
              const isPast = STAGE_META[ph.currentStage].order > meta.order;
              const active = isCurrent || isPast;
              return (
                <React.Fragment key={stage}>
                  <View style={styles.stageNode}>
                    <View
                      style={[
                        styles.stageDot,
                        {
                          backgroundColor: active ? `${meta.color}20` : `${colors.mutedForeground}12`,
                          borderColor: isCurrent ? meta.color : 'transparent',
                          borderWidth: isCurrent ? 2 : 0,
                        },
                      ]}
                    >
                      <StageIcon size={16} color={active ? meta.color : colors.mutedForeground} />
                    </View>
                    <Text
                      style={[
                        styles.stageName,
                        {
                          color: isCurrent ? meta.color : colors.mutedForeground,
                          fontFamily: isCurrent ? typography.fontFamily.sansBold : typography.fontFamily.sans,
                        },
                      ]}
                    >
                      {stage}
                    </Text>
                  </View>
                  {i < STAGE_ORDER.length - 1 && (
                    <View style={[styles.stageConnector, { backgroundColor: isPast ? STAGE_META[ph.currentStage].color : `${colors.mutedForeground}25` }]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
          <View style={styles.phenologyGrid}>
            <View style={styles.phenologyCell}>
              <Text style={[styles.phenologyVal, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                {ph.stageProgressPercent.toFixed(0)}%
              </Text>
              <Text style={[styles.phenologyKey, { color: colors.mutedForeground }]}>Stage progress</Text>
            </View>
            <View style={styles.phenologyCell}>
              <Text style={[styles.phenologyVal, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                {ph.lengthOfGrowingPeriodDays}d
              </Text>
              <Text style={[styles.phenologyKey, { color: colors.mutedForeground }]}>Growing period</Text>
            </View>
            <View style={styles.phenologyCell}>
              <Text style={[styles.phenologyVal, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                {(() => { try { return format(parseISO(ph.peakNdviDate), 'd MMM'); } catch { return ph.peakNdviDate; } })()}
              </Text>
              <Text style={[styles.phenologyKey, { color: colors.mutedForeground }]}>Peak NDVI</Text>
            </View>
          </View>
        </CardContent>
      </Card>
    );
  };

  // Stage 3: Phenology-conditioned stress model + Why flagged explainability.
  const renderStressModel = () => {
    const sm = analysisResult?.stressModel;
    if (!sm) return null;
    const vColor = getVerdictColor(sm.verdict);
    return (
      <Card style={[styles.resultsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <CardHeader style={styles.cardHeaderFlex}>
          <View style={{ flex: 1 }}>
            <CardTitle>
              <View style={styles.chartTitleRow}>
                <Gauge size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, color: colors.foreground, fontFamily: typography.fontFamily.sansBold }}>
                  Stress Verdict
                </Text>
              </View>
            </CardTitle>
            <CardDescription>Stage-conditioned fusion of optical + SAR</CardDescription>
          </View>
          <Badge variant={sm.verdict === 'Healthy' ? 'success' : sm.verdict === 'Moderate' ? 'warning' : 'error'}>
            {sm.verdict}
          </Badge>
        </CardHeader>
        <CardContent style={{ paddingTop: 8 }}>
          <View style={styles.stressScoreRow}>
            <Text style={[styles.stressScoreLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansSemiBold }]}>
              STRESS SCORE
            </Text>
            <Text style={[styles.stressScoreVal, { color: vColor, fontFamily: typography.fontFamily.sansBold }]}>
              {sm.stressScore.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.stressScoreTrack, { backgroundColor: `${colors.mutedForeground}15` }]}>
            <View style={{ height: 8, borderRadius: 4, width: `${sm.stressScore * 100}%`, backgroundColor: vColor }} />
          </View>

          <View style={[styles.whyBox, { backgroundColor: `${vColor}0d`, borderColor: `${vColor}30` }]}>
            <View style={styles.whyHeaderRow}>
              <Info size={14} color={vColor} style={{ marginRight: 6 }} />
              <Text style={[styles.whyTitle, { color: vColor, fontFamily: typography.fontFamily.sansBold }]}>Why flagged?</Text>
            </View>
            <Text style={[styles.whyText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
              {sm.explanation}
            </Text>
          </View>

          <Text style={[styles.sectionCaption, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansSemiBold }]}>
            CONTRIBUTING INDICES (ATTENTION)
          </Text>
          {sm.contributingIndices.map((ci, i) => (
            <View key={i} style={styles.attnRow}>
              <View style={styles.attnLabelCol}>
                <Text style={[styles.attnIndex, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                  {ci.index}
                </Text>
                <Text style={[styles.attnDetail, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  {ci.detail}
                </Text>
              </View>
              <View style={styles.attnBarCol}>
                <View style={[styles.attnBarTrack, { backgroundColor: `${colors.mutedForeground}15` }]}>
                  <View style={{ height: 6, borderRadius: 3, width: `${Math.min(ci.weight * 100, 100)}%`, backgroundColor: colors.primary }} />
                </View>
                <Text style={[styles.attnWeight, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                  {(ci.weight * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          ))}
        </CardContent>
      </Card>
    );
  };

  // Stage 4: Water balance & deficit.
  const renderWaterBalance = () => {
    const wb = analysisResult?.waterBalance;
    if (!wb) return null;
    const hasDeficit = wb.deficitMm > 0;
    return (
      <Card style={[styles.resultsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <CardHeader>
          <CardTitle>
            <View style={styles.chartTitleRow}>
              <Droplets size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, color: colors.foreground, fontFamily: typography.fontFamily.sansBold }}>
                Water Balance
              </Text>
            </View>
          </CardTitle>
          <CardDescription>ETc vs rainfall (FAO-56, stage Kc = {wb.kc.toFixed(2)})</CardDescription>
        </CardHeader>
        <CardContent style={{ paddingTop: 8 }}>
          <View style={styles.waterGrid}>
            <View style={styles.waterCell}>
              <Text style={[styles.waterVal, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>{wb.etcMm.toFixed(0)}mm</Text>
              <Text style={[styles.waterKey, { color: colors.mutedForeground }]}>Crop demand (ETc)</Text>
            </View>
            <View style={styles.waterCell}>
              <Text style={[styles.waterVal, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>{wb.effectiveRainfallMm.toFixed(0)}mm</Text>
              <Text style={[styles.waterKey, { color: colors.mutedForeground }]}>Effective rainfall</Text>
            </View>
            <View style={styles.waterCell}>
              <Text style={[styles.waterVal, { color: hasDeficit ? '#ef4444' : '#22c55e', fontFamily: typography.fontFamily.sansBold }]}>
                {hasDeficit ? '-' : '+'}{Math.abs(wb.deficitMm).toFixed(0)}mm
              </Text>
              <Text style={[styles.waterKey, { color: colors.mutedForeground }]}>{hasDeficit ? 'Deficit' : 'Surplus'}</Text>
            </View>
          </View>
        </CardContent>
      </Card>
    );
  };

  // Stage 5: Priority-scored irrigation advisory.
  const renderIrrigationAdvisory = () => {
    const ia = analysisResult?.irrigationAdvisory;
    if (!ia) return null;
    const pColor = PRIORITY_COLORS[ia.priorityRank] || colors.primary;
    let recDate = ia.recommendedDate;
    try { recDate = format(parseISO(ia.recommendedDate), 'd MMM yyyy'); } catch {}
    return (
      <Card style={[styles.resultsCard, { backgroundColor: colors.card, borderColor: `${pColor}40` }]}>
        <CardHeader style={styles.cardHeaderFlex}>
          <View style={{ flex: 1 }}>
            <CardTitle>
              <View style={styles.chartTitleRow}>
                <Droplets size={20} color={pColor} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, color: colors.foreground, fontFamily: typography.fontFamily.sansBold }}>
                  Irrigation Advisory
                </Text>
              </View>
            </CardTitle>
            <CardDescription>Priority = stress x stage-criticality + deficit + area</CardDescription>
          </View>
          <Badge variant={ia.priorityRank === 'Low' ? 'success' : ia.priorityRank === 'Critical' ? 'error' : 'warning'}>
            {ia.priorityRank}
          </Badge>
        </CardHeader>
        <CardContent style={{ paddingTop: 8 }}>
          <View style={styles.priorityRow}>
            <Text style={[styles.priorityScore, { color: pColor, fontFamily: typography.fontFamily.sansBold }]}>
              {(ia.priorityScore * 100).toFixed(0)}
            </Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={[styles.priorityTrack, { backgroundColor: `${colors.mutedForeground}15` }]}>
                <View style={{ height: 8, borderRadius: 4, width: `${ia.priorityScore * 100}%`, backgroundColor: pColor }} />
              </View>
              <Text style={[styles.priorityCaption, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                Stage criticality weight: {ia.stageCriticalityWeight.toFixed(1)}
              </Text>
            </View>
          </View>
          <View style={styles.recRow}>
            <View style={styles.recCell}>
              <Text style={[styles.recVal, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>{recDate}</Text>
              <Text style={[styles.recKey, { color: colors.mutedForeground }]}>Recommended date</Text>
            </View>
            <View style={styles.recCell}>
              <Text style={[styles.recVal, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>{ia.recommendedVolumeMm.toFixed(0)}mm</Text>
              <Text style={[styles.recKey, { color: colors.mutedForeground }]}>Recommended volume</Text>
            </View>
          </View>
          <Text style={[styles.recRationale, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
            {ia.rationale}
          </Text>
        </CardContent>
      </Card>
    );
  };

  const renderFieldPicker = () => {
    if (isLoadingFields) {
      return <Skeleton width="100%" height={64} style={styles.fieldPickerSkeleton} />;
    }

    if (fields.length === 0) {
      return (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CardContent style={styles.emptyCardContent}>
            <MapIcon size={48} color={colors.mutedForeground} style={styles.emptyIcon} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
              No Fields Mapped
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
              You need to map your fields first. Please draw field boundaries on the map to run NDVI scans.
            </Text>
          </CardContent>
        </Card>
      );
    }

    return (
      <View style={styles.pickerSection}>
        <Text style={[styles.pickerLabel, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansSemiBold }]}>
          SELECT FIELD FOR DIAGNOSTIC
        </Text>
        <TouchableOpacity
          style={[styles.pickerButton, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: borderRadius.md }]}
          onPress={() => setIsPickerVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.pickerButtonLeft}>
            <MapIcon size={20} color={colors.primary} style={{ marginRight: 10 }} />
            <Text style={[styles.pickerButtonText, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
              {selectedField ? selectedField.fieldName : 'Select field...'}
            </Text>
            {selectedField && (
              <Text style={[styles.pickerButtonArea, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                ({selectedField.area.toFixed(2)} acres)
              </Text>
            )}
          </View>
          <ChevronDown size={20} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Custom Bottom Selection Modal */}
        <Modal
          visible={isPickerVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsPickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsPickerVisible(false)}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                  Select Your Field
                </Text>
                <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                  <Text style={{ color: colors.primary, fontFamily: typography.fontFamily.sansMedium }}>Done</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={fields}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedFieldId;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.fieldItem,
                        { borderBottomColor: colors.border },
                        isSelected && { backgroundColor: `${colors.primary}10` },
                      ]}
                      onPress={() => {
                        setSelectedFieldId(item.id);
                        setIsPickerVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View>
                        <Text style={[styles.fieldItemName, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                          {item.fieldName}
                        </Text>
                        <Text style={[styles.fieldItemDetails, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                          Village: {item.village} • Survey No: {item.surveyNumber} • {item.area.toFixed(2)} acres
                        </Text>
                      </View>
                      {isSelected && <Check size={20} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={{ paddingBottom: 32 }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  const renderAnalysis = () => {
    if (isAnalyzing) {
      return (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.analyzingText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
            AI analyzing satellite imagery & calculating NDVI indices...
          </Text>
          <Skeleton width="100%" height={240} style={styles.skeletonMap} />
          <Skeleton width="100%" height={160} style={styles.skeletonChart} />
        </View>
      );
    }

    if (errorMessage && !isAnalyzing) {
      return (
        <Card style={[styles.errorCard, { borderColor: `${colors.destructive}40`, backgroundColor: `${colors.destructive}05` }]}>
          <CardContent style={styles.errorContent}>
            <AlertCircle size={40} color={colors.destructive} style={styles.errorIcon} />
            <Text style={[styles.errorTitle, { color: colors.destructive, fontFamily: typography.fontFamily.sansBold }]}>
              Scans Failed
            </Text>
            <Text style={[styles.errorDesc, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
              {errorMessage}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.secondary, borderRadius: borderRadius.sm }]}
              onPress={handleAnalysis}
            >
              <RefreshCw size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.primary, fontFamily: typography.fontFamily.sansSemiBold }}>Retry Scans</Text>
            </TouchableOpacity>
          </CardContent>
        </Card>
      );
    }

    if (!analysisResult || !selectedField) return null;

    const bounds = getFieldBounds(selectedField.coordinates);
    const chartData = getChartData();

    return (
      <View style={styles.analysisResults}>
        {/* Map NDVI overlay */}
        <Card style={[styles.resultsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CardHeader style={styles.cardHeaderFlex}>
            <View>
              <CardTitle>Field Health Map</CardTitle>
              <CardDescription>NDVI overlay mapping vegetation health status</CardDescription>
              {analysisResult.lastUpdated && (
                <View style={styles.timeRow}>
                  <Clock size={12} color={colors.mutedForeground} style={{ marginRight: 4 }} />
                  <Text style={[styles.timeText, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                    Scanned: {format(parseISO(analysisResult.lastUpdated), 'd MMM yyyy, h:mm a')}
                  </Text>
                </View>
              )}
            </View>
            <Badge variant={getStatusBadgeVariant(analysisResult.overallHealth)}>
              {analysisResult.overallHealth}
            </Badge>
          </CardHeader>
          <CardContent style={styles.mapCardContent}>
            {selectedField.coordinates.length > 0 ? (
              <View style={styles.mapFrame}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: selectedField.centroid.latitude,
                    longitude: selectedField.centroid.longitude,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                  }}
                  mapType="hybrid"
                  customMapStyle={Platform.OS === 'android' ? darkMapStyle : undefined}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  <Polygon
                    coordinates={selectedField.coordinates}
                    strokeColor="#FFC107"
                    strokeWidth={2}
                    fillColor="rgba(255, 193, 7, 0.15)"
                  />
                  {analysisResult.healthMapBase64 && bounds && (
                    <Overlay
                      image={{ uri: analysisResult.healthMapBase64 }}
                      bounds={bounds}
                      opacity={0.75}
                    />
                  )}
                </MapView>
                <View style={[styles.legendBox, { backgroundColor: `${colors.background}90` }]}>
                  <Text style={[styles.legendTitle, { color: colors.foreground }]}>NDVI Vigor Legend</Text>
                  <View style={styles.legendGradientRow}>
                    <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
                    <View style={[styles.legendColor, { backgroundColor: '#eab308' }]} />
                    <View style={[styles.legendColor, { backgroundColor: '#22c55e' }]} />
                  </View>
                  <View style={styles.legendLabelRow}>
                    <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>0.0 (Low)</Text>
                    <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>1.0 (High)</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.noCoordsContainer}>
                <AlertCircle size={32} color={colors.warning} />
                <Text style={[styles.noCoordsText, { color: colors.foreground }]}>No valid boundaries configured.</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Charts Trend */}
        <Card style={[styles.resultsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CardHeader>
            <CardTitle>
              <View style={styles.chartTitleRow}>
                <BarChart2 size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, color: colors.foreground, fontFamily: typography.fontFamily.sansBold }}>
                  30-Day NDVI Trend
                </Text>
              </View>
            </CardTitle>
            <CardDescription>Vegetation index updates for {selectedField.fieldName}</CardDescription>
          </CardHeader>
          <CardContent style={styles.chartCardContent}>
            {chartData.length > 0 ? (
              <View style={styles.chartWrapper}>
                <LineChart
                  data={chartData}
                  width={width - 72}
                  height={180}
                  curved
                  color={colors.primary}
                  thickness={3}
                  startFillColor={colors.primary}
                  endFillColor="transparent"
                  startOpacity={0.25}
                  endOpacity={0.01}
                  areaChart
                  noOfSections={4}
                  yAxisColor={colors.border}
                  xAxisColor={colors.border}
                  yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
                  yAxisLabelWidth={35}
                  maxValue={1.0}
                  yAxisOffset={0}
                  rulesType="dashed"
                  rulesColor={`${colors.border}40`}
                  pointerConfig={{
                    pointerColor: colors.primary,
                    pointerLabelComponent: (items: any) => {
                      if (!items || items.length === 0) return null;
                      return (
                        <View style={[styles.tooltip, { backgroundColor: colors.background, borderColor: colors.border }]}>
                          <Text style={[styles.tooltipText, { color: colors.foreground }]}>NDVI: {items[0].value.toFixed(3)}</Text>
                        </View>
                      );
                    },
                  }}
                />
              </View>
            ) : (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card style={[styles.resultsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CardHeader>
            <CardTitle>
              <View style={styles.chartTitleRow}>
                <Bot size={20} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, color: colors.foreground, fontFamily: typography.fontFamily.sansBold }}>
                  AI Crop Health Insight
                </Text>
              </View>
            </CardTitle>
            <CardDescription>Recommendations and warning analyses based on crop vigor</CardDescription>
          </CardHeader>
          <CardContent style={styles.adviceContent}>
            <View style={[styles.adviceBox, { backgroundColor: `${colors.primary}05`, borderColor: `${colors.primary}20` }]}>
              <Text style={[styles.adviceText, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
                {analysisResult.farmerAdvice}
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Satellite Health" subtitle="Vegetation Health Scans" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderFieldPicker()}
        {renderAnalysis()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  introIconContainer: {
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  introTextContainer: {
    flex: 1,
  },
  introTitle: {
    fontSize: 20,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  introSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  fieldPickerSkeleton: {
    borderRadius: 10,
    marginBottom: 20,
  },
  pickerSection: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  pickerButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pickerButtonText: {
    fontSize: 15,
  },
  pickerButtonArea: {
    fontSize: 13,
    marginLeft: 6,
  },
  emptyCard: {
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  emptyCardContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
  },
  fieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  fieldItemName: {
    fontSize: 15,
    marginBottom: 4,
  },
  fieldItemDetails: {
    fontSize: 12,
  },
  analyzingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
  },
  analyzingText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  skeletonMap: {
    borderRadius: 12,
    marginBottom: 16,
  },
  skeletonChart: {
    borderRadius: 12,
  },
  errorCard: {
    borderWidth: 1,
    padding: 20,
    marginTop: 10,
  },
  errorContent: {
    alignItems: 'center',
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  errorDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  analysisResults: {
    gap: 16,
  },
  resultsCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timeText: {
    fontSize: 11,
  },
  mapCardContent: {
    padding: 0,
    height: 250,
  },
  mapFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  legendBox: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    padding: 10,
    borderRadius: 8,
    width: 140,
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  legendGradientRow: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  legendColor: {
    flex: 1,
  },
  legendLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendLabel: {
    fontSize: 9,
  },
  noCoordsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noCoordsText: {
    fontSize: 14,
    marginTop: 10,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartCardContent: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  chartWrapper: {
    paddingRight: 10,
  },
  tooltip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 4,
    position: 'absolute',
    top: -30,
    left: -40,
  },
  tooltipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  adviceContent: {
    paddingTop: 10,
  },
  adviceBox: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
