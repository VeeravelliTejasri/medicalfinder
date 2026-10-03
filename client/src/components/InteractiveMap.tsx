import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Pharmacy, Medicine } from '../types/index.js';
import { Building2, Navigation, CheckCircle2, AlertCircle, XCircle, ExternalLink } from 'lucide-react';

interface InteractiveMapProps {
  pharmacies: Pharmacy[];
  userLocation: { latitude: number; longitude: number };
  selectedMedicine?: Medicine | null;
  selectedPharmacy?: Pharmacy | null;
  onSelectPharmacy?: (pharmacy: Pharmacy) => void;
  onReserve?: (pharmacy: Pharmacy) => void;
}

// Custom Leaflet DivIcon builders
function createPharmacyIcon(status: string) {
  let colorClass = 'pin-instock';
  let label = '✓';

  if (status === 'LOW_STOCK') {
    colorClass = 'pin-lowstock';
    label = '!';
  } else if (status === 'OUT_OF_STOCK') {
    colorClass = 'pin-outofstock';
    label = '✕';
  }

  return L.divIcon({
    className: 'custom-map-icon',
    html: `<div class="custom-pin ${colorClass} w-8 h-8 font-bold text-xs flex items-center justify-center">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

const userLocationIcon = L.divIcon({
  className: 'custom-map-icon',
  html: `<div class="custom-pin pin-user w-5 h-5 rounded-full"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

// Component to dynamically re-center map when user moves or pharmacy is selected
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  pharmacies,
  userLocation,
  selectedMedicine,
  selectedPharmacy,
  onSelectPharmacy,
  onReserve
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([userLocation.latitude, userLocation.longitude]);
  const [mapZoom, setMapZoom] = useState<number>(13);

  // When selected pharmacy changes, center map on it
  useEffect(() => {
    if (selectedPharmacy) {
      setMapCenter([selectedPharmacy.latitude, selectedPharmacy.longitude]);
      setMapZoom(15);
    } else {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setMapZoom(13);
    }
  }, [selectedPharmacy, userLocation]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-card border border-slate-200">
      {/* Map Legend Floating Pill */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200 text-xs font-semibold flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs" />
          <span className="text-slate-700">In Stock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-xs" />
          <span className="text-slate-700">Low Stock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-xs" />
          <span className="text-slate-700">Out of Stock</span>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[400px]"
      >
        <MapRecenter center={mapCenter} zoom={mapZoom} />

        {/* Clean OpenStreetMap Carto tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userLocationIcon}>
          <Popup>
            <div className="p-1 text-center">
              <p className="font-bold text-xs text-blue-700">📍 You Are Here</p>
              <p className="text-[11px] text-slate-500">Searching nearby pharmacies</p>
            </div>
          </Popup>
        </Marker>

        {/* Pharmacy Markers */}
        {pharmacies.map((pharmacy) => {
          const status = pharmacy.inventory?.availability_status || 'OUT_OF_STOCK';
          const icon = createPharmacyIcon(status);

          return (
            <Marker
              key={pharmacy.id}
              position={[pharmacy.latitude, pharmacy.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectPharmacy && onSelectPharmacy(pharmacy)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[220px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <h4 className="font-bold text-sm text-slate-900 leading-tight">
                      {pharmacy.name}
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-2">{pharmacy.address}</p>

                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-teal-600" />
                      {pharmacy.distance_km} km away
                    </span>
                    <span className="font-bold text-emerald-700">
                      {pharmacy.is_24_7 ? '24/7' : 'Open'}
                    </span>
                  </div>

                  {selectedMedicine && pharmacy.inventory && (
                    <div className="bg-slate-50 p-2 rounded-xl mb-2 border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700 truncate max-w-[130px]">
                          {selectedMedicine.name}
                        </span>
                        {status !== 'OUT_OF_STOCK' && (
                          <span className="font-black text-slate-900">
                            ₹{pharmacy.inventory.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-bold">
                        {status === 'IN_STOCK' ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            In Stock ({pharmacy.inventory.quantity} units)
                          </span>
                        ) : status === 'LOW_STOCK' ? (
                          <span className="text-amber-700 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Low Stock ({pharmacy.inventory.quantity} left)
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mt-2">
                    {status !== 'OUT_OF_STOCK' && onReserve && (
                      <button
                        onClick={() => onReserve(pharmacy)}
                        className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                      >
                        <span>Reserve</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      title="Open Google Maps"
                    >
                      Maps
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
