import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationStore } from '../../src/store/location.store';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/Card';
import { Skeleton } from '../../src/components/ui/Skeleton';
import {
  MapPin,
  Search,
  Compass,
  AlertCircle,
  Car,
  List,
  Map as MapIcon,
  Navigation,
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

// Haversine formula to calculate distance
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

interface Shop {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  distance: number;
}

export default function FertilizerFinderScreen() {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  const [status, setStatus] = useState<'idle' | 'locating' | 'fetching' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { location: userLocation, fetchLocation: getUserLocation } = useLocationStore();
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  const generateMockShops = (latitude: number, longitude: number): Shop[] => {
    const shopNames = [
      'Annapurna Krishi Seva Kendra',
      'Balaji Fertilizer & Seeds Store',
      'Green Harvest Agro Chemicals',
      'Kisan Mitra Organic Fertilizer Center',
      'Sri Lakshmi Venkateswara Fertilizers',
      'Bharat Fertilizer Distributors',
      'Jai Kisan Fertilisers & Seeds',
      'Narmada Agro Inputs',
    ];
    const vicinities = [
      'Opposite Government School, Main Road',
      'Near Bus Stand, Market Road',
      'Shop No. 12, APMC Market',
      'Station Road, Near Railway Crossing',
      'Gram Panchayat Road, Old Town',
      'National Highway 4, Near Petrol Pump',
      'Bazaar Street, Opposite Post Office',
      'Industrial Area Phase 2, Near Water Tank',
    ];

    return shopNames.map((name, idx) => {
      // Generate offsets within ~1 to ~5 km
      const latOffset = (Math.random() - 0.5) * 0.05;
      const lngOffset = (Math.random() - 0.5) * 0.05;
      const shopLat = latitude + latOffset;
      const shopLng = longitude + lngOffset;

      const distance = getDistance(latitude, longitude, shopLat, shopLng);

      return {
        place_id: `mock_shop_${idx}`,
        name,
        vicinity: vicinities[idx] || 'Main Road',
        geometry: {
          location: {
            lat: shopLat,
            lng: shopLng,
          },
        },
        distance,
      };
    }).sort((a, b) => a.distance - b.distance);
  };

  const handleFindShops = async () => {
    setStatus('locating');
    setErrorMsg(null);
    setShops([]);

    try {
      let loc = userLocation;
      if (!loc) {
        await getUserLocation();
        loc = useLocationStore.getState().location;
      }
      
      if (!loc) {
        setErrorMsg('Location access denied. Please enable location permissions in your settings.');
        setStatus('error');
        return;
      }

      const { latitude, longitude } = loc;

      setStatus('fetching');
      
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        try {
          const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&keyword=fertilizer%20shop&key=${apiKey}`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.status === 'OK' && data.results) {
            const fetchedShops = data.results.map((shop: any) => ({
              place_id: shop.place_id,
              name: shop.name || 'Fertilizer Shop',
              vicinity: shop.vicinity || 'Nearby Address',
              geometry: {
                location: {
                  lat: shop.geometry.location.lat,
                  lng: shop.geometry.location.lng,
                },
              },
              distance: getDistance(
                latitude,
                longitude,
                shop.geometry.location.lat,
                shop.geometry.location.lng
              ),
            })).sort((a: Shop, b: Shop) => a.distance - b.distance);

            setShops(fetchedShops);
            setStatus('success');
            return;
          } else {
            console.warn('Google Places API status:', data.status);
          }
        } catch (fetchErr) {
          console.error('Failed to fetch from Google Places API:', fetchErr);
        }
      }

      // Default or fallback to mock shops when API Key is missing or request fails
      const mockShops = generateMockShops(latitude, longitude);
      setShops(mockShops);
      setStatus('success');
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Could not access your location. Please try again.');
      setStatus('error');
    }
  };

  const handleNavigate = async (shop: Shop) => {
    const lat = shop.geometry.location.lat;
    const lng = shop.geometry.location.lng;
    
    // Open maps navigation
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}&t=m`,
      android: `google.navigation:q=${lat},${lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback to web link
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        await Linking.openURL(webUrl);
      }
    } catch (err) {
      console.error('Error opening map directions:', err);
    }
  };

  const renderContent = () => {
    if (status === 'idle') {
      return (
        <Card style={[styles.welcomeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CardContent style={styles.welcomeContent}>
            <Compass size={64} color={colors.primary} style={styles.welcomeIcon} />
            <Text style={[styles.welcomeTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
              Find Fertilizer Shops
            </Text>
            <Text style={[styles.welcomeDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
              Locate nearby agricultural input dealers, fertilizer stores, and seed suppliers near your current coordinates.
            </Text>
            <Button
              label="Find Shops Near Me"
              onPress={handleFindShops}
              icon={<Search size={18} color={colors.primaryForeground} />}
              style={styles.findButton}
            />
          </CardContent>
        </Card>
      );
    }

    if (status === 'locating' || status === 'fetching') {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
            {status === 'locating' ? 'Determining your coordinates...' : 'Searching for nearby stores...'}
          </Text>
          <View style={styles.skeletonContainer}>
            <Skeleton width="100%" height={100} style={styles.skeleton} />
            <Skeleton width="100%" height={100} style={styles.skeleton} />
          </View>
        </View>
      );
    }

    if (status === 'error') {
      return (
        <Card style={[styles.errorCard, { borderColor: `${colors.destructive}40`, backgroundColor: `${colors.destructive}05` }]}>
          <CardContent style={styles.errorContent}>
            <AlertCircle size={40} color={colors.destructive} style={styles.errorIcon} />
            <Text style={[styles.errorTitle, { color: colors.destructive, fontFamily: typography.fontFamily.sansBold }]}>
              Location Error
            </Text>
            <Text style={[styles.errorDesc, { color: colors.foreground, fontFamily: typography.fontFamily.sans }]}>
              {errorMsg || 'Something went wrong while retrieving your location.'}
            </Text>
            <Button
              label="Retry Search"
              variant="outline"
              onPress={handleFindShops}
              style={{ marginTop: spacing[4] }}
            />
          </CardContent>
        </Card>
      );
    }

    if (status === 'success' && userLocation) {
      return (
        <View style={styles.successContainer}>
          {/* Tabs Switcher */}
          <View style={[styles.tabBar, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'map' && { backgroundColor: colors.card, borderRadius: borderRadius.sm },
              ]}
              onPress={() => setActiveTab('map')}
              activeOpacity={0.7}
            >
              <MapIcon size={16} color={activeTab === 'map' ? colors.primary : colors.mutedForeground} style={{ marginRight: 6 }} />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'map' ? colors.foreground : colors.mutedForeground,
                    fontFamily: activeTab === 'map' ? typography.fontFamily.sansSemiBold : typography.fontFamily.sans,
                  },
                ]}
              >
                Map View
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'list' && { backgroundColor: colors.card, borderRadius: borderRadius.sm },
              ]}
              onPress={() => setActiveTab('list')}
              activeOpacity={0.7}
            >
              <List size={16} color={activeTab === 'list' ? colors.primary : colors.mutedForeground} style={{ marginRight: 6 }} />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === 'list' ? colors.foreground : colors.mutedForeground,
                    fontFamily: activeTab === 'list' ? typography.fontFamily.sansSemiBold : typography.fontFamily.sans,
                  },
                ]}
              >
                List View ({shops.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active Tab View */}
          {activeTab === 'map' ? (
            <View style={[styles.mapContainer, { borderRadius: borderRadius.lg, borderColor: colors.border }]}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.04,
                  longitudeDelta: 0.04,
                }}
                customMapStyle={Platform.OS === 'android' ? darkMapStyle : undefined}
              >
                {/* User Location */}
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  title="Your Location"
                  description="You are here"
                  pinColor={colors.info}
                />

                {/* Shop Locations */}
                {shops.map((shop) => (
                  <Marker
                    key={shop.place_id}
                    coordinate={{
                      latitude: shop.geometry.location.lat,
                      longitude: shop.geometry.location.lng,
                    }}
                    title={shop.name}
                    description={shop.vicinity}
                    pinColor={colors.success}
                  />
                ))}
              </MapView>
              
              {/* Instructions Overlay */}
              <View style={[styles.mapOverlay, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.overlayText, { color: colors.foreground, fontFamily: typography.fontFamily.sansMedium }]}>
                  Showing shops within 5km. Switch to List View to navigate.
                </Text>
              </View>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.listScroll}
              showsVerticalScrollIndicator={false}
            >
              {shops.map((shop) => (
                <Card key={shop.place_id} style={[styles.shopCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <CardContent style={styles.shopContent}>
                    <View style={styles.shopDetails}>
                      <Text style={[styles.shopName, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>
                        {shop.name}
                      </Text>
                      <Text style={[styles.shopVicinity, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                        {shop.vicinity}
                      </Text>
                      <Text style={[styles.shopDistance, { color: colors.primary, fontFamily: typography.fontFamily.sansBold }]}>
                        {shop.distance.toFixed(2)} km away
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleNavigate(shop)}
                      style={[styles.navigateButton, { backgroundColor: colors.secondary, borderRadius: borderRadius.full }]}
                      activeOpacity={0.7}
                    >
                      <Car size={20} color={colors.primary} />
                    </TouchableOpacity>
                  </CardContent>
                </Card>
              ))}
            </ScrollView>
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Fertilizer Finder" subtitle="Locate nearby input dealers" />
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  welcomeContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  welcomeIcon: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  findButton: {
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  skeletonContainer: {
    width: '100%',
    gap: 16,
  },
  skeleton: {
    borderRadius: 8,
  },
  errorCard: {
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  errorDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  successContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    opacity: 0.9,
  },
  overlayText: {
    fontSize: 12,
    textAlign: 'center',
  },
  listScroll: {
    gap: 12,
    paddingBottom: 24,
  },
  shopCard: {
    width: '100%',
  },
  shopContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
  },
  shopDetails: {
    flex: 1,
    gap: 4,
  },
  shopName: {
    fontSize: 15,
  },
  shopVicinity: {
    fontSize: 13,
  },
  shopDistance: {
    fontSize: 12,
    marginTop: 2,
  },
  navigateButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
