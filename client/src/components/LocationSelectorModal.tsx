import React from 'react';
import { MapPin, Navigation, Check, X } from 'lucide-react';
import { useLocation, PRESET_LOCATIONS } from '../context/LocationContext.js';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({ isOpen, onClose }) => {
  const { locationName, requestGeolocation, selectPreset, isLocating, error } = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="p-5 bg-gradient-to-r from-teal-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <MapPin className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h3 className="font-bold text-base">Select Your Location</h3>
              <p className="text-xs text-teal-100">Calculates accurate pharmacy distance and travel time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Geolocation Button */}
          <button
            onClick={() => {
              requestGeolocation();
              onClose();
            }}
            disabled={isLocating}
            className="w-full py-3 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-2xl font-semibold flex items-center justify-center gap-2 border border-teal-200 transition shadow-sm"
          >
            <Navigation className={`w-4 h-4 text-teal-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting GPS...' : 'Use Current Device Location'}</span>
          </button>

          {error && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              {error}
            </p>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Popular Bengaluru Metro Hubs
            </p>
            <div className="space-y-1.5">
              {PRESET_LOCATIONS.map((preset) => {
                const isSelected = locationName === preset.name;
                return (
                  <button
                    key={preset.name}
                    onClick={() => {
                      selectPreset(preset);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-500 shadow-sm text-teal-950 font-medium'
                        : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{preset.name}</p>
                      <p className="text-xs text-slate-500">{preset.description}</p>
                    </div>
                    {isSelected && (
                      <div className="p-1 bg-teal-600 text-white rounded-full">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
