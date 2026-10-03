import React, { useState, useEffect } from 'react';
import { Medicine, GenericAlternative } from '../types/index.js';
import { medicineApi } from '../services/api.js';
import { Sparkles, AlertTriangle, ShieldCheck, ArrowRight, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GenericAlternativesCardProps {
  medicine: Medicine;
}

export const GenericAlternativesCard: React.FC<GenericAlternativesCardProps> = ({ medicine }) => {
  const [alternatives, setAlternatives] = useState<GenericAlternative[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAlternatives() {
      if (!medicine?.id) return;
      setIsLoading(true);
      try {
        const data = await medicineApi.getAlternatives(medicine.id);
        setAlternatives(data.alternatives || []);
        setDisclaimer(data.disclaimer);
      } catch (err) {
        console.error('Failed to load alternatives:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAlternatives();
  }, [medicine]);

  if (isLoading || alternatives.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 rounded-3xl p-6 border border-emerald-200/80 shadow-soft my-6">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-sm shadow-emerald-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-emerald-950">
              Lower-Cost Generic Equivalents Available
            </h3>
            <p className="text-xs text-emerald-800">
              Save on bioequivalent medicines with the same active pharmaceutical ingredient ({medicine.generic_name})
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
          <Tag className="w-3.5 h-3.5" />
          Generic Savings
        </span>
      </div>

      {/* Mandatory Medical Safety Disclaimer */}
      <div className="mb-5 p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed shadow-2xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span className="font-medium">
          {disclaimer || 'IMPORTANT MEDICAL NOTICE: Medicines with similar ingredients or therapeutic categories are not automatically interchangeable. Please confirm with a qualified doctor or pharmacist before substituting any prescribed medication.'}
        </span>
      </div>

      {/* Alternatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {alternatives.map((alt) => (
          <div
            key={alt.id}
            onClick={() => navigate(`/search?q=${encodeURIComponent(alt.name)}&medicineId=${alt.id}`)}
            className="bg-white rounded-2xl p-4 border border-emerald-100 hover:border-emerald-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                  {alt.name}
                </h4>
                {alt.savings_percent > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                    Save {alt.savings_percent}%
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mb-2">
                {alt.brand_name} • {alt.strength} • {alt.dosage_form}
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Active: {alt.generic_name}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">From</span>
                <p className="text-base font-black text-emerald-700">
                  ₹{alt.lowest_available_price.toFixed(2)}
                </p>
              </div>

              <button className="text-xs font-bold text-emerald-700 group-hover:text-emerald-800 flex items-center gap-1">
                <span>View stock</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
