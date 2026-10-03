import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pill, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Zap
} from 'lucide-react';
import { MedicineSearchBar } from '../components/MedicineSearchBar.js';
import { useLocation } from '../context/LocationContext.js';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { locationName } = useLocation();

  const categories = [
    { name: 'Fever & Pain', icon: Pill, color: 'bg-blue-50 text-blue-700 border-blue-200', query: 'Paracetamol' },
    { name: 'Antibiotics', icon: ShieldCheck, color: 'bg-teal-50 text-teal-700 border-teal-200', query: 'Amoxicillin' },
    { name: 'Asthma & Allergy', icon: Zap, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', query: 'Salbutamol' },
    { name: 'Heart & BP', icon: Clock, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', query: 'Amlodipine' },
    { name: 'Diabetes Care', icon: Pill, color: 'bg-amber-50 text-amber-700 border-amber-200', query: 'Metformin' },
    { name: 'Critical Emergency', icon: AlertTriangle, color: 'bg-rose-50 text-rose-700 border-rose-200', isEmergency: true }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-teal-50/70 via-slate-50 to-white">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-teal-300/20 to-cyan-300/20 blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-200 shadow-xs mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-slate-800">
              Live Pharmacy Inventory Network • 10 Verified Pharmacies Online
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Never Waste Time Searching for <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700">Out-of-Stock Medicines</span> Again.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Locate essential medicines at nearby pharmacies in real-time. Compare prices, check live availability, and reserve medications before you leave home.
          </p>

          {/* Search Box Card */}
          <div className="mt-8 max-w-2xl mx-auto bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-xl border border-slate-200/90">
            <MedicineSearchBar size="large" autoFocus={false} />

            {/* Location indicator inside search card */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-2">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>Searching near: <strong className="text-slate-800">{locationName}</strong></span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Popular:</span>
                <button
                  onClick={() => navigate('/search?q=Paracetamol%20650')}
                  className="font-bold text-teal-700 hover:underline"
                >
                  Dolo 650
                </button>
                <button
                  onClick={() => navigate('/search?q=Amoxicillin')}
                  className="font-bold text-teal-700 hover:underline"
                >
                  Amoxicillin
                </button>
                <button
                  onClick={() => navigate('/emergency')}
                  className="font-bold text-rose-600 hover:underline"
                >
                  Emergency SOS
                </button>
              </div>
            </div>
          </div>

          {/* Quick Categories Bar */}
          <div className="mt-10 max-w-4xl mx-auto">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Explore Common Therapeutic Categories
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      if (cat.isEmergency) {
                        navigate('/emergency');
                      } else {
                        navigate(`/search?q=${encodeURIComponent(cat.query || '')}`);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition text-left flex flex-col justify-between hover:shadow-md hover:scale-[1.02] ${cat.color}`}
                  >
                    <Icon className="w-5 h-5 mb-2" />
                    <span className="text-xs font-bold leading-tight">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* How MediFind Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Simple 4-Step Patient Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              How MediFind Solves Medicine Scarcity
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From prescription or search to confirmed pickup in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative group hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-teal-600/20">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Search or Scan</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Type medicine name, active generic compound, or upload a photo of your doctor's prescription for instant OCR extraction.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative group hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-teal-600/20">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Check Live Stock</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                See nearby pharmacies color-coded on the map with real-time stock levels (In Stock, Low Stock, or Out of Stock) and prices.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative group hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-teal-600/20">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Reserve at Counter</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reserve your medicine for free. The pharmacy confirms in real-time, holding your batch for up to 4 hours. No pre-payment needed.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative group hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md shadow-teal-600/20">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Pickup & Notify</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive an in-app notification when ready. If a medicine was out of stock, receive auto-alerts the second it's restocked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight: Prescription OCR & Emergency */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Prescription OCR Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Prescription OCR Scanner
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Upload a handwritten or printed prescription. Our AI OCR extracts medicine names, dosages, and strengths, matching them against local pharmacy inventories automatically.
                </p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1 mb-6">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Supports JPG, PNG, and PDF files</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Mandatory user review confirmation before search</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/prescription')}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Try Prescription Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Emergency Mode Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl border border-rose-900/40 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-600/30 text-rose-400 border border-rose-500/40 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">Emergency Pharmacy Locator</h3>
                  <span className="text-[10px] uppercase font-black bg-rose-600 text-white px-2 py-0.5 rounded">24/7 SOS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Urgently need life-saving critical drugs like Asthalin inhalers, Nitroglycerin sublingual tablets, Insulin, or Epinephrine? Instantly locate open 24/7 pharmacies with confirmed stock.
                </p>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1 mb-6">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-rose-400" />
                    <span>1-click Direct Emergency Call & Navigation</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-rose-400" />
                    <span>Strictly sorted by shortest proximity</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/emergency')}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
              >
                <span>Launch Emergency Mode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
