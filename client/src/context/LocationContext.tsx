import React, { createContext, useContext, useState } from 'react';

export interface LocationPreset {
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export const PRESET_LOCATIONS: LocationPreset[] = [
  { name: 'Indiranagar Metro', lat: 12.9784, lng: 77.6408, description: 'Central East Hub (near Apollo Pharmacy)' },
  { name: 'Koramangala 4th Block', lat: 12.9352, lng: 77.6245, description: 'South Hub (near MedPlus)' },
  { name: 'MG Road Junction', lat: 12.9738, lng: 77.6094, description: 'Downtown Core (near Wellness Forever)' },
  { name: 'HSR Layout Sector 3', lat: 12.9121, lng: 77.6446, description: 'Residential (near Guardian)' },
  { name: 'Whitefield ITPL', lat: 12.9866, lng: 77.7314, description: 'Tech Corridor (near Care & Cure)' }
];

interface LocationContextType {
  lat: number;
  lng: number;
  locationName: string;
  isLocating: boolean;
  error: string | null;
  requestGeolocation: () => void;
  selectPreset: (preset: LocationPreset) => void;
  setCoords: (lat: number, lng: number, name?: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Indiranagar (close to Apollo Pharmacy demo)
  const [lat, setLat] = useState<number>(12.9784);
  const [lng, setLng] = useState<number>(77.6408);
  const [locationName, setLocationName] = useState<string>('Indiranagar, Bengaluru');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Using current preset.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocationName('Current GPS Location');
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied/unavailable:', err.message);
        setError('Location permission denied or unavailable. Fallback to Metro Central.');
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const selectPreset = (preset: LocationPreset) => {
    setLat(preset.lat);
    setLng(preset.lng);
    setLocationName(preset.name);
    setError(null);
  };

  const setCoords = (newLat: number, newLng: number, name?: string) => {
    setLat(newLat);
    setLng(newLng);
    if (name) setLocationName(name);
  };

  return (
    <LocationContext.Provider
      value={{
        lat,
        lng,
        locationName,
        isLocating,
        error,
        requestGeolocation,
        selectPreset,
        setCoords
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
