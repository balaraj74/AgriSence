import { create } from 'zustand';
import * as Location from 'expo-location';

interface LocationState {
  location: { latitude: number; longitude: number } | null;
  errorMsg: string | null;
  isLoading: boolean;
  statusText: string;
  fetchLocation: () => Promise<void>;
  setLocation: (loc: { latitude: number; longitude: number } | null) => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  location: null,
  errorMsg: null,
  isLoading: false,
  statusText: '',
  setLocation: (loc) => set({ location: loc }),
  fetchLocation: async () => {
    // Prevent refetching if we already have it
    if (get().location) return;
    
    set({ isLoading: true, errorMsg: null, statusText: 'Requesting permission...' });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({
          errorMsg: 'Location permission denied. Enable location to use location-based features.',
          isLoading: false,
          statusText: '',
        });
        return;
      }

      set({ statusText: 'Locating...' });
      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      set({ 
        location: { 
          latitude: currentLoc.coords.latitude, 
          longitude: currentLoc.coords.longitude 
        }, 
        isLoading: false, 
        statusText: '' 
      });
    } catch (e: any) {
      console.error('Location fetch error:', e);
      set({ errorMsg: e.message || 'Unable to retrieve location.', isLoading: false, statusText: '' });
    }
  },
}));
