import React, { useState } from 'react';
import { Pharmacy, Medicine } from '../types/index.js';
import { reservationApi } from '../services/api.js';
import { 
  Building2, 
  Pill, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Minus, 
  X, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pharmacy: Pharmacy | null;
  medicine: Medicine | null;
  onSuccess?: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  pharmacy,
  medicine,
  onSuccess
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<any | null>(null);

  if (!isOpen || !pharmacy || !medicine) return null;

  const unitPrice = pharmacy.inventory?.price || medicine.average_price || 0;
  const maxAvailable = pharmacy.inventory?.quantity || 10;
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

  const handleConfirm = async () => {
    if (!user) {
      setError('Please log in with a user account to reserve medicine.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const data = await reservationApi.create({
        pharmacy_id: pharmacy.id,
        medicine_id: medicine.id,
        quantity,
        notes
      });

      setConfirmedReservation(data.reservation);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedReservation(null);
    setQuantity(1);
    setNotes('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Success Confirmation Screen */}
        {confirmedReservation ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">
              Reservation Confirmed!
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Your medicine has been reserved and held at the pharmacy counter.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-3 mb-6">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-xs text-slate-500 font-medium">Reservation Code</span>
                <span className="text-base font-black text-teal-700 tracking-wider font-mono">
                  {confirmedReservation.reservation_code}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Pharmacy</span>
                <span className="font-bold text-slate-800">{pharmacy.name}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Medicine</span>
                <span className="font-bold text-slate-800">{medicine.name} (x{quantity})</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Amount to Pay at Pickup</span>
                <span className="font-black text-slate-900 text-sm">₹{totalPrice.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Reserved for 4 hours. Show this code to the pharmacist upon arrival.</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleClose();
                  navigate('/dashboard');
                }}
                className="w-1/2 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5"
              >
                <span>View Reservations</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Reservation Form Screen */
          <div>
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-teal-600 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Pill className="w-5 h-5 text-teal-100" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Reserve Medicine</h3>
                  <p className="text-xs text-teal-100">Hold at counter • Pay at pickup</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Medicine & Pharmacy Info Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{medicine.name}</h4>
                    <p className="text-xs text-slate-500">{medicine.generic_name} • {medicine.strength}</p>
                  </div>
                  <span className="text-base font-black text-slate-900">₹{unitPrice.toFixed(2)}/unit</span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 text-xs text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{pharmacy.name}</span>
                  <span className="text-slate-400">({pharmacy.distance_km} km away)</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-800">Select Quantity</p>
                  <p className="text-[11px] text-slate-500">Max available: {maxAvailable} packs</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-8 text-center font-black text-base text-slate-900">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
                    disabled={quantity >= maxAvailable}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-teal-900">Estimated Total</span>
                  <p className="text-[10px] text-teal-700">₹{unitPrice.toFixed(2)} × {quantity} unit{quantity > 1 ? 's' : ''}</p>
                </div>
                <span className="text-xl font-black text-teal-950">₹{totalPrice.toFixed(2)}</span>
              </div>

              {/* Special Instructions / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pharmacist Notes / Pickup Message (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Will pick up by 5 PM, please keep ready..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 focus:bg-white outline-none"
                />
              </div>

              {/* Safety & Pickup Disclaimer */}
              <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  No online payment is collected today. Please pay directly at the pharmacy counter. If prescribed, bring physical or digital prescription.
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Reserving...</span>
                ) : (
                  <>
                    <span>Confirm Free Reservation</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
