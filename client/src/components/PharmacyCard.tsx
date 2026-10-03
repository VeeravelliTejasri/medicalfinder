import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  BellRing, 
  Check, 
  Star,
  ExternalLink
} from 'lucide-react';
import { Pharmacy, Medicine } from '../types/index.js';
import { notificationApi } from '../services/api.js';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  selectedMedicine?: Medicine | null;
  onReserve?: (pharmacy: Pharmacy) => void;
  onSelectOnMap?: (pharmacy: Pharmacy) => void;
  isFocused?: boolean;
}

export const PharmacyCard: React.FC<PharmacyCardProps> = ({
  pharmacy,
  selectedMedicine,
  onReserve,
  onSelectOnMap,
  isFocused = false
}) => {
  const [alertSubscribed, setAlertSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const inventory = pharmacy.inventory;
  const status = inventory?.availability_status || 'OUT_OF_STOCK';
  const quantity = inventory?.quantity || 0;
  const price = inventory?.price || 0;
  const lastUpdated = inventory?.last_updated || 'Recently';

  const handleSubscribeAlert = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedMedicine) return;
    setSubscribing(true);
    try {
      await notificationApi.subscribeStockAlert(selectedMedicine.id, pharmacy.id);
      setAlertSubscribed(true);
    } catch (err: any) {
      alert(err.message || 'Please log in to set availability alerts.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div
      onClick={() => onSelectOnMap && onSelectOnMap(pharmacy)}
      className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer relative overflow-hidden ${
        isFocused
          ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-xl bg-teal-50/20'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top Banner: Pharmacy Info & Verification */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl shrink-0 mt-0.5 border border-teal-100">
            <Building2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition">
                {pharmacy.name}
              </h3>
              {pharmacy.is_verified === 1 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{pharmacy.address}</span>
            </p>
          </div>
        </div>

        {/* Distance Badge & Rating */}
        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold">
            <Navigation className="w-3 h-3 text-teal-600" />
            <span>{pharmacy.distance_km} km away</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-[11px] text-amber-500 font-semibold mt-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{pharmacy.rating}</span>
          </div>
        </div>
      </div>

      {/* Stock Availability & Pricing Section (if searching for a medicine) */}
      {selectedMedicine && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {status === 'IN_STOCK' ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>In Stock • {quantity} units available</span>
              </div>
            ) : status === 'LOW_STOCK' ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Low Stock • Only {quantity} units left</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100/70 px-2.5 py-1 rounded-lg">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Currently Out of Stock</span>
              </div>
            )}
          </div>

          {/* Price Tag */}
          <div className="text-right">
            {status !== 'OUT_OF_STOCK' ? (
              <div>
                <span className="text-xs text-slate-400 font-medium mr-1">Price:</span>
                <span className="text-lg font-black text-slate-900">₹{price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Price unavailable</span>
            )}
          </div>
        </div>
      )}

      {/* Meta details & Operating Hours */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className={`font-medium ${pharmacy.is_24_7 ? 'text-emerald-700 font-bold' : ''}`}>
              {pharmacy.open_status_label || (pharmacy.is_24_7 ? 'Open 24/7' : 'Open Today')}
            </span>
          </span>
          <span className="text-slate-300">•</span>
          <span>Stock updated {lastUpdated}</span>
        </div>

        <span className="text-slate-600 font-medium">
          Tel: <a href={`tel:${pharmacy.phone}`} onClick={(e) => e.stopPropagation()} className="hover:text-teal-600 underline">{pharmacy.phone}</a>
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleDirections}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1 transition"
          >
            <Navigation className="w-3.5 h-3.5 text-teal-600" />
            Directions
          </button>
          <a
            href={`tel:${pharmacy.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1 transition"
          >
            <Phone className="w-3.5 h-3.5 text-teal-600" />
            Call
          </a>
        </div>

        <div>
          {status !== 'OUT_OF_STOCK' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onReserve) onReserve(pharmacy);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow flex items-center gap-1.5"
            >
              <span>Reserve Medicine</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubscribeAlert}
              disabled={alertSubscribed || subscribing}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                alertSubscribed
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {alertSubscribed ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Alert Set! We'll Notify You</span>
                </>
              ) : (
                <>
                  <BellRing className="w-3.5 h-3.5 text-amber-600" />
                  <span>{subscribing ? 'Setting Alert...' : 'Notify Me When Available'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
