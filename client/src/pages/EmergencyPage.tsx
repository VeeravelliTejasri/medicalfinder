import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  Navigation, 
  ShieldAlert, 
  Clock, 
  Activity, 
  Search, 
  Building2, 
  CheckCircle2, 
  Flame, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { pharmacyApi, medicineApi } from '../services/api.js';
import { Pharmacy, Medicine } from '../types/index.js';
import { useLocation } from '../context/LocationContext.js';

export const EmergencyPage: React.FC = () => {
  const { lat, lng, locationName } = useLocation();
  const [criticalMedicines, setCriticalMedicines] = useState<Medicine[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch emergency tagged medicines
  useEffect(() => {
    async function loadEmergencyMeds() {
      try {
        const data = await medicineApi.search('', undefined, true);
        setCriticalMedicines(data.medicines || []);
        if (data.medicines.length > 0) {
          setSelectedMed(data.medicines[0]); // Default to Salbutamol Inhaler
        }
      } catch (err) {
        console.error('Failed to load critical medicines:', err);
      }
    }
    loadEmergencyMeds();
  }, []);

  // Fetch nearby pharmacies carrying selected emergency medicine with confirmed stock
  useEffect(() => {
    async function loadEmergencyPharmacies() {
      if (!selectedMed) return;
      setIsLoading(true);
      try {
        const data = await pharmacyApi.getNearby({
          lat,
          lng,
          medicineId: selectedMed.id,
          emergency: true, // Filters strictly to confirmed stock > 0
          sortBy: 'distance'
        });
        setPharmacies(data.pharmacies || []);
      } catch (err) {
        console.error('Failed to load emergency stock:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEmergencyPharmacies();
  }, [selectedMed, lat, lng]);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-rose-600 selection:text-white pb-20">
      
      {/* Emergency Alert Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 text-white text-xs font-bold py-2.5 px-4 text-center border-b border-rose-500/50 flex items-center justify-center gap-2">
        <Flame className="w-4 h-4 animate-bounce shrink-0" />
        <span>URGENT MEDICINE FINDER • SHOWING PHARMACIES WITH CONFIRMED LIVE STOCK</span>
        <Flame className="w-4 h-4 animate-bounce shrink-0" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Title with Safety Disclaimer */}
        <div className="max-w-3xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-extrabold mb-3">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>Emergency Mode Activated</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Fast Critical Medicine Locator
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Instant proximity search for life-saving pharmaceuticals. Sorted strictly by closest travel distance with verified physical stock.
          </p>

          {/* Life-threatening emergency disclaimer */}
          <div className="mt-4 p-3 bg-rose-950/80 border border-rose-800/80 rounded-2xl flex items-center justify-center gap-3 text-xs text-rose-200">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              <strong>EMERGENCY NOTICE:</strong> MediFind is a pharmacy locator, not an emergency ambulance service. If a patient is unresponsive or experiencing cardiac arrest, immediately dial <strong>112 / 911</strong>.
            </span>
          </div>
        </div>

        {/* Quick Critical Drug Buttons */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center sm:text-left">
            Select Urgent Critical Medicine:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {criticalMedicines.map((med) => {
              const isSelected = selectedMed?.id === med.id;
              return (
                <button
                  key={med.id}
                  onClick={() => setSelectedMed(med)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Activity className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-rose-400'}`} />
                    <span className="text-[10px] font-bold uppercase">{med.category}</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-tight mb-0.5">{med.name}</h3>
                    <p className={`text-[10px] ${isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                      {med.brand_name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Emergency Medicine Status */}
        {selectedMed && (
          <div className="bg-slate-900/90 rounded-3xl p-5 border border-rose-900/40 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-600/30 text-rose-400 rounded-2xl border border-rose-500/30">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Locating In-Stock Units</span>
                <h2 className="text-lg font-black text-white">{selectedMed.name}</h2>
                <p className="text-xs text-slate-400">{selectedMed.description}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {pharmacies.length} Pharmacies with Confirmed Stock
              </span>
            </div>
          </div>
        )}

        {/* Emergency Pharmacy Cards List */}
        {isLoading ? (
          <div className="bg-slate-900 rounded-3xl p-16 text-center border border-slate-800">
            <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-300">Searching closest 24/7 pharmacies with confirmed stock...</p>
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="bg-slate-900 rounded-3xl p-16 text-center border border-slate-800">
            <AlertOctagon className="w-12 h-12 text-rose-500/50 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Nearby Stock Found for this Medicine</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try selecting a related generic or broadening your location settings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pharmacies.map((pharmacy, index) => (
              <div
                key={pharmacy.id}
                className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 hover:border-rose-500/50 transition relative overflow-hidden group shadow-lg"
              >
                {/* Distance Flag */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-sm shrink-0">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition">
                        {pharmacy.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{pharmacy.address}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-white bg-rose-600 px-3 py-1 rounded-xl shadow-md">
                      <Navigation className="w-3.5 h-3.5" />
                      {pharmacy.distance_km} km
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {pharmacy.is_24_7 ? '🟢 24/7 OPEN' : 'Open Now'}
                    </p>
                  </div>
                </div>

                {/* Stock Info Bar */}
                <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 flex items-center justify-between mb-5 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-emerald-400">
                      Confirmed Stock: {pharmacy.inventory?.quantity} units available
                    </span>
                  </div>
                  <span className="font-bold text-white">
                    ₹{pharmacy.inventory?.price.toFixed(2)}
                  </span>
                </div>

                {/* Fast Action Buttons: Direct Emergency Call & Navigation */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                  
                  
  onClick={() => {
    navigator.clipboard.writeText(pharmacy.phone);
    alert(`Pharmacy phone number copied: ${pharmacy.phone}`);
  }}
  className="py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 text-center"
>
  <PhoneCall className="w-4 h-4 animate-pulse" />
  <span>Copy Pharmacy Number</span>
</button>
                  
                  

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700 text-center"
                  >
                    <Navigation className="w-4 h-4 text-teal-400" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
