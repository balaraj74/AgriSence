import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
  Alert,
  Linking,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useLocationStore } from '../../src/store/location.store';
import { useTheme } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { Badge } from '../../src/components/ui/Badge';
import { Skeleton } from '../../src/components/ui/Skeleton';
import {
  findBestBuyers,
  findBestSellers,
  FindBestBuyersOutput,
  FindBestSellersOutput,
  BuyerMatch,
  SellerMatch,
} from '../../src/services/ai';
import {
  Handshake,
  Bot,
  Star,
  MapPin,
  Truck,
  IndianRupee,
  Tractor,
  Phone,
  Mail,
  LocateFixed,
  AlertCircle,
  X,
  Share2,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

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

type MatchType = BuyerMatch | SellerMatch;

export default function MarketMatchmakingScreen() {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const mapRef = useRef<MapView | null>(null);

  // Active Tab: 'sell' (Find Buyers) vs 'buy' (Find Sellers)
  const [activeTab, setActiveTab] = useState<'sell' | 'buy'>('sell');

  // Input states
  const [cropType, setCropType] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState<'kg' | 'quintal' | 'tonne'>('quintal');
  const [locationName, setLocationName] = useState('');
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? ''
  );

  // Map & Location states
  const { location: globalLocation, fetchLocation: getGlobalLocation } = useLocationStore();
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 20.5937,
    longitude: 78.9629, // Default to India centroid
  });
  const [isLocating, setIsLocating] = useState(false);

  // API Call states
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FindBestBuyersOutput | FindBestSellersOutput | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dialog state
  const [selectedMatch, setSelectedMatch] = useState<MatchType | null>(null);

  // Initialize: Get current location
  useEffect(() => {
    if (globalLocation) {
      setUserCoords(globalLocation);
      mapRef.current?.animateToRegion({
        ...globalLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [globalLocation]);

  const handleGetLocation = async () => {
    setIsLocating(true);
    setErrorMsg(null);
    try {
      let coords = globalLocation;
      if (!coords) {
        await getGlobalLocation();
        coords = useLocationStore.getState().location;
      }
      
      if (!coords) {
        Alert.alert('Permission Denied', 'Please grant location permissions in Settings.');
        setIsLocating(false);
        return;
      }

      setUserCoords(coords);

      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      // Reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
      );
      if (!response.ok) throw new Error('Failed to fetch address.');
      const data = await response.json();
      const { city, town, village, state_district, state } = data.address || {};
      const locationString = `${city || town || village || state_district || ''}, ${state || ''}`.trim().replace(/^,\s*/, '');
      setLocationName(locationString || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Location Error', 'Could not get address coordinates.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!cropType.trim()) {
      setErrorMsg('Crop type is required.');
      return;
    }
    const qVal = parseFloat(quantity);
    if (isNaN(qVal) || qVal <= 0) {
      setErrorMsg('Quantity must be a positive number.');
      return;
    }
    if (!locationName.trim()) {
      setErrorMsg('Your location is required.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setErrorMsg(null);

    try {
      if (activeTab === 'sell') {
        const response = await findBestBuyers({
          cropType: cropType.trim(),
          quantity: qVal,
          unit,
          location: locationName.trim(),
          sellByDate: targetDate,
        });
        setResult(response);
        fitMapMarkers(response.matches);
      } else {
        const response = await findBestSellers({
          cropType: cropType.trim(),
          quantity: qVal,
          unit,
          location: locationName.trim(),
          purchaseByDate: targetDate,
        });
        setResult(response);
        fitMapMarkers(response.matches);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'AI matchmaking failed. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fitMapMarkers = (matches: MatchType[]) => {
    if (!mapRef.current || matches.length === 0) return;

    const coordsList = matches
      .filter((m) => m.coordinates)
      .map((m) => ({
        latitude: m.coordinates.lat,
        longitude: m.coordinates.lng,
      }));

    coordsList.push(userCoords);

    mapRef.current.fitToCoordinates(coordsList, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  };

  const handleContact = (match: MatchType) => {
    setSelectedMatch(match);
  };

  const makePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to initiate call.');
    });
  };

  const sendEmail = (emailAddress: string, name: string) => {
    const subject = encodeURIComponent(`AgriSence Matchmaking query`);
    Linking.openURL(`mailto:${emailAddress}?subject=${subject}`).catch(() => {
      Alert.alert('Error', 'Unable to open mail client.');
    });
  };

  const isBuyer = (match: MatchType): match is BuyerMatch => {
    return 'buyerName' in match;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Market Matchmaking" subtitle="Find the best local buyers & sellers" />

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.secondary }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'sell' && [styles.activeTab, { backgroundColor: colors.primary }],
          ]}
          onPress={() => {
            setActiveTab('sell');
            setResult(null);
            setErrorMsg(null);
          }}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'sell' ? colors.primaryForeground : colors.mutedForeground },
              { fontFamily: typography.fontFamily.sansSemiBold },
            ]}
          >
            Sell Crops (Find Buyers)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'buy' && [styles.activeTab, { backgroundColor: colors.primary }],
          ]}
          onPress={() => {
            setActiveTab('buy');
            setResult(null);
            setErrorMsg(null);
          }}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'buy' ? colors.primaryForeground : colors.mutedForeground },
              { fontFamily: typography.fontFamily.sansSemiBold },
            ]}
          >
            Buy Crops (Find Sellers)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Map Preview */}
        <View style={[styles.mapCard, { borderColor: colors.border, borderRadius: borderRadius.lg }]}>
          <MapView
            ref={mapRef}
            style={styles.map}
            customMapStyle={colors.background === '#0f1117' ? darkMapStyle : []}
            initialRegion={{
              ...userCoords,
              latitudeDelta: 10,
              longitudeDelta: 10,
            }}
          >
            {/* User marker */}
            <Marker coordinate={userCoords} title="Your Location" pinColor="#3b82f6" />

            {/* Matches markers */}
            {result?.matches?.map((match) => {
              if (!match.coordinates) return null;
              const name = isBuyer(match) ? match.buyerName : match.sellerName;
              const type = isBuyer(match) ? match.buyerType : match.sellerType;
              const price = isBuyer(match)
                ? `₹${match.offerPrice}/${match.offerUnit}`
                : `₹${match.price}/${match.unit}`;
              return (
                <Marker
                  key={isBuyer(match) ? match.buyerId : match.sellerId}
                  coordinate={{
                    latitude: match.coordinates.lat,
                    longitude: match.coordinates.lng,
                  }}
                  title={name}
                  description={`${type} • ${price}`}
                  pinColor={activeTab === 'sell' ? '#4ade80' : '#fbbf24'}
                >
                  <Callout onPress={() => handleContact(match)}>
                    <View style={styles.callout}>
                      <Text style={styles.calloutName}>{name}</Text>
                      <Text style={styles.calloutPrice}>{price}</Text>
                      <Text style={styles.calloutClick}>Click to Contact</Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>
        </View>

        {/* Search Input Details */}
        <Card style={{ borderColor: colors.border, backgroundColor: colors.card }}>
          <CardHeader>
            <CardTitle>{activeTab === 'sell' ? 'Your Crop Details' : 'What do you need?'}</CardTitle>
            <CardDescription>
              {activeTab === 'sell'
                ? 'Enter crop specifications to find match offers from local buyers.'
                : 'Enter target quantities to identify local sellers in your area.'}
            </CardDescription>
          </CardHeader>
          <CardContent style={styles.form}>
            {/* Crop Type */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                Crop Type
              </Text>
              <Input
                placeholder="e.g. Tomatoes, Wheat, Onion"
                value={cropType}
                onChangeText={setCropType}
              />
            </View>

            {/* Quantity and Unit */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={[styles.label, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                  Quantity
                </Text>
                <Input
                  keyboardType="numeric"
                  placeholder="e.g. 100"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing[3] }]}>
                <Text style={[styles.label, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                  Unit
                </Text>
                <View style={styles.unitSelector}>
                  {(['kg', 'quintal', 'tonne'] as const).map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[
                        styles.unitBtn,
                        { borderColor: colors.border },
                        unit === u && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setUnit(u)}
                    >
                      <Text
                        style={[
                          styles.unitBtnText,
                          { color: unit === u ? colors.primaryForeground : colors.mutedForeground },
                          { fontFamily: typography.fontFamily.sansBold },
                        ]}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Location with fetch */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                Location
              </Text>
              <View style={styles.locationRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder="e.g. Nashik, Maharashtra"
                    value={locationName}
                    onChangeText={setLocationName}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.locationBtn, { backgroundColor: colors.secondary }]}
                  onPress={handleGetLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <LocateFixed size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Preferred Date */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                {activeTab === 'sell' ? 'Sell By Date' : 'Purchase By Date'}
              </Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={targetDate}
                onChangeText={setTargetDate}
              />
            </View>

            {/* Error Message */}
            {errorMsg && (
              <View style={[styles.errorBox, { backgroundColor: `${colors.destructive}10` }]}>
                <AlertCircle size={18} color={colors.destructive} />
                <Text
                  style={[
                    styles.errorText,
                    { color: colors.destructive, fontFamily: typography.fontFamily.sans },
                  ]}
                >
                  {errorMsg}
                </Text>
              </View>
            )}

            {/* Submit */}
            <Button
              label={activeTab === 'sell' ? 'Find Best Buyers' : 'Find Best Sellers'}
              onPress={handleSearch}
              isLoading={isLoading}
              disabled={isLoading}
              icon={<Handshake size={18} color={colors.primaryForeground} />}
            />
          </CardContent>
        </Card>

        {/* Loading Skeletons */}
        {isLoading && (
          <View style={styles.resultContainer}>
            <Skeleton width="100%" height={80} style={{ borderRadius: borderRadius.md }} />
            <Skeleton width="100%" height={160} style={{ borderRadius: borderRadius.md }} />
            <Skeleton width="100%" height={160} style={{ borderRadius: borderRadius.md }} />
          </View>
        )}

        {/* AI Results */}
        {result && !isLoading && (
          <View style={styles.resultContainer}>
            {/* Overall AI Summary */}
            <Card style={[styles.summaryCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <CardContent style={styles.summaryContent}>
                <Bot size={24} color={colors.primary} style={{ marginRight: spacing[3], marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.summaryTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                    AI Matchmaker Recommendation
                  </Text>
                  <Text
                    style={[
                      styles.summaryText,
                      { color: colors.foreground, fontFamily: typography.fontFamily.sans },
                    ]}
                  >
                    {result.overallSummary}
                  </Text>
                </View>
              </CardContent>
            </Card>

            <Text style={[styles.resultsLabel, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
              Matching Candidates ({result.matches.length})
            </Text>

            {/* Matches list */}
            {result.matches.length > 0 ? (
              result.matches.map((match) => {
                const name = isBuyer(match) ? match.buyerName : match.sellerName;
                const type = isBuyer(match) ? match.buyerType : match.sellerType;
                const price = isBuyer(match) ? match.offerPrice : match.price;
                const matchUnit = isBuyer(match) ? match.offerUnit : match.unit;
                const rating = Math.round(match.rating * 2) / 2;

                return (
                  <Card key={isBuyer(match) ? match.buyerId : match.sellerId} style={{ borderColor: colors.border }}>
                    <CardHeader style={styles.matchHeader}>
                      <View>
                        <Text
                          style={[
                            styles.matchName,
                            { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                          ]}
                        >
                          {name}
                        </Text>
                        <Text
                          style={[
                            styles.matchType,
                            { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans },
                          ]}
                        >
                          {type} • {match.location}
                        </Text>
                      </View>
                      <View style={[styles.ratingBadge, { backgroundColor: `${colors.warning}15` }]}>
                        <Star size={12} color={colors.warning} style={{ marginRight: 3 }} />
                        <Text
                          style={[
                            styles.ratingText,
                            { color: colors.warning, fontFamily: typography.fontFamily.sansSemiBold },
                          ]}
                        >
                          {rating.toFixed(1)}
                        </Text>
                      </View>
                    </CardHeader>
                    <CardContent style={styles.matchContent}>
                      {/* Price & Quantity Grid */}
                      <View style={[styles.pricingBox, { backgroundColor: colors.secondary }]}>
                        <View style={styles.priceItem}>
                          <Text
                            style={[
                              styles.pricingLabel,
                              { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium },
                            ]}
                          >
                            {isBuyer(match) ? 'Offer Price' : 'Asking Price'}
                          </Text>
                          <Text
                            style={[
                              styles.priceVal,
                              { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                            ]}
                          >
                            ₹{price} / {matchUnit}
                          </Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.priceItem}>
                          <Text
                            style={[
                              styles.pricingLabel,
                              { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium },
                            ]}
                          >
                            {isBuyer(match) ? 'Logistics' : 'Available'}
                          </Text>
                          <View style={styles.logisticsRow}>
                            {isBuyer(match) ? (
                              match.pickupOrDelivery === 'Pickup' ? (
                                <Truck size={16} color={colors.primary} />
                              ) : (
                                <MapPin size={16} color={colors.primary} />
                              )
                            ) : (
                              <Tractor size={16} color={colors.primary} />
                            )}
                            <Text
                              style={[
                                styles.logisticsText,
                                { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                              ]}
                            >
                              {isBuyer(match) ? match.pickupOrDelivery : `${match.availableQuantity} ${matchUnit}`}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Brief advice */}
                      <View style={styles.aiBrief}>
                        <Bot size={16} color={colors.primary} style={{ marginRight: spacing[2], marginTop: 1 }} />
                        <Text
                          style={[
                            styles.aiBriefText,
                            { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans },
                          ]}
                        >
                          {match.summary}
                        </Text>
                      </View>

                      {/* Contact button */}
                      <Button label="Contact Partner" size="sm" onPress={() => handleContact(match)} />
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <View style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                  ]}
                >
                  No matches found
                </Text>
                <Text
                  style={[
                    styles.emptyDesc,
                    { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans },
                  ]}
                >
                  Adjust your search parameters, crop details, or check back later.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Details Contact Modal */}
      <Modal visible={!!selectedMatch} transparent animationType="slide" onRequestClose={() => setSelectedMatch(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: borderRadius.lg }]}>
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                ]}
              >
                Contact Details
              </Text>
              <TouchableOpacity onPress={() => setSelectedMatch(null)}>
                <X size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {selectedMatch && (
              <View style={styles.modalBody}>
                <Text
                  style={[
                    styles.modalDesc,
                    { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans },
                  ]}
                >
                  Simulated contact information for{' '}
                  <Text style={{ color: colors.foreground, fontWeight: 'bold' }}>
                    {isBuyer(selectedMatch) ? selectedMatch.buyerName : selectedMatch.sellerName}
                  </Text>
                  .
                </Text>

                <View style={[styles.modalDetailBox, { backgroundColor: colors.secondary }]}>
                  <TouchableOpacity
                    style={styles.modalRow}
                    onPress={() => makePhoneCall(selectedMatch.contactPhone)}
                  >
                    <Phone size={18} color={colors.primary} />
                    <View style={styles.modalTextCol}>
                      <Text
                        style={[
                          styles.modalLabel,
                          { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium },
                        ]}
                      >
                        Phone Number
                      </Text>
                      <Text
                        style={[
                          styles.modalVal,
                          { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                        ]}
                      >
                        {selectedMatch.contactPhone}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

                  <TouchableOpacity
                    style={styles.modalRow}
                    onPress={() =>
                      sendEmail(
                        selectedMatch.contactEmail,
                        isBuyer(selectedMatch) ? selectedMatch.buyerName : selectedMatch.sellerName
                      )
                    }
                  >
                    <Mail size={18} color={colors.primary} />
                    <View style={styles.modalTextCol}>
                      <Text
                        style={[
                          styles.modalLabel,
                          { color: colors.mutedForeground, fontFamily: typography.fontFamily.sansMedium },
                        ]}
                      >
                        Email Address
                      </Text>
                      <Text
                        style={[
                          styles.modalVal,
                          { color: colors.foreground, fontFamily: typography.fontFamily.sansBold },
                        ]}
                      >
                        {selectedMatch.contactEmail}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <Button label="Close" onPress={() => setSelectedMatch(null)} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  mapCard: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    borderWidth: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  unitSelector: {
    flexDirection: 'row',
    height: 44,
  },
  unitBtn: {
    flex: 1,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitBtnText: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  locationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  locationBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  resultContainer: {
    gap: 16,
  },
  summaryCard: {
    borderWidth: 1,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  summaryTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 18,
  },
  resultsLabel: {
    fontSize: 16,
    marginTop: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 8,
  },
  matchName: {
    fontSize: 15,
  },
  matchType: {
    fontSize: 12,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
  },
  matchContent: {
    gap: 12,
  },
  pricingBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  priceItem: {
    flex: 1,
    gap: 4,
  },
  pricingLabel: {
    fontSize: 11,
  },
  priceVal: {
    fontSize: 14,
  },
  logisticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logisticsText: {
    fontSize: 13,
  },
  divider: {
    width: 1,
    height: '100%',
    marginHorizontal: 12,
  },
  aiBrief: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  aiBriefText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
  },
  modalBody: {
    gap: 16,
  },
  modalDesc: {
    fontSize: 13.5,
    lineHeight: 18,
  },
  modalDetailBox: {
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalTextCol: {
    gap: 2,
  },
  modalLabel: {
    fontSize: 11,
  },
  modalVal: {
    fontSize: 14,
  },
  modalDivider: {
    height: 1,
    width: '100%',
  },
  callout: {
    padding: 6,
    alignItems: 'center',
    minWidth: 120,
  },
  calloutName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  calloutPrice: {
    fontSize: 11,
    marginTop: 2,
  },
  calloutClick: {
    fontSize: 9,
    color: '#3b82f6',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});
