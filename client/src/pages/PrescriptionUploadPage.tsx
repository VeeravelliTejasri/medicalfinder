import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Plus, 
  ArrowRight, 
  Building2, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  RefreshCw,
  Edit3
} from 'lucide-react';
import { prescriptionApi } from '../services/api.js';
import { ExtractedMedicine } from '../types/index.js';
import { useLocation } from '../context/LocationContext.js';
import { useNavigate } from 'react-router-dom';

export const PrescriptionUploadPage: React.FC = () => {
  const { lat, lng } = useLocation();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [medicines, setMedicines] = useState<ExtractedMedicine[]>([]);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const samplePresets = [
    {
      id: 'fever_infection',
      title: 'Sample 1: Acute Fever & Infection',
      doctor: 'Dr. Rajesh Sharma, MD (Internal Medicine)',
      previewMeds: ['Paracetamol 650 mg', 'Amoxicillin 500 mg', 'Cetirizine 10 mg', 'Pantoprazole 40 mg'],
      color: 'border-teal-200 hover:border-teal-500 bg-teal-50/40'
    },
    {
      id: 'chronic_care',
      title: 'Sample 2: Chronic Diabetes & Heart Care',
      doctor: 'Dr. Priya Nair, DM (Cardiology / Diabetology)',
      previewMeds: ['Metformin 500 mg', 'Amlodipine 5 mg', 'Atorvastatin 20 mg', 'Aspirin 75 mg'],
      color: 'border-blue-200 hover:border-blue-500 bg-blue-50/40'
    },
    {
      id: 'emergency_respiratory',
      title: 'Sample 3: Acute Asthma Emergency',
      doctor: 'Dr. Arun Mehta, MD (Pulmonology)',
      previewMeds: ['Salbutamol Inhaler 100 mcg', 'Montelukast 10 mg', 'Budesonide Inhaler 200 mcg'],
      color: 'border-rose-200 hover:border-rose-500 bg-rose-50/40'
    }
  ];

  const handleProcessPreset = async (presetId: string) => {
    setSelectedPreset(presetId);
    setIsProcessing(true);
    setSearchResults(null);

    try {
      const formData = new FormData();
      formData.append('preset', presetId);
      const res = await prescriptionApi.upload(formData);
      setFileName(res.file_name);
      setRawText(res.raw_text);
      setMedicines(res.detected_medicines || []);
    } catch (err: any) {
      alert('Failed to process prescription: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setSearchResults(null);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('prescription', file);
      const res = await prescriptionApi.upload(formData);
      setRawText(res.raw_text);
      setMedicines(res.detected_medicines || []);
    } catch (err: any) {
      alert('Failed to upload & parse prescription: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateMedicine = (index: number, field: string, value: any) => {
    setMedicines(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddMedicine = () => {
    setMedicines(prev => [
      ...prev,
      { detected_name: 'New Medicine', dosage: '1 tab OD', confidence: 1.0 }
    ]);
  };

  const handleSearchAvailability = async () => {
    const medicineIds = medicines
      .map(m => m.matched_medicine_id)
      .filter(Boolean) as string[];

    if (medicineIds.length === 0) {
      alert('Please ensure at least one recognized medicine is selected.');
      return;
    }

    setIsSearching(true);
    try {
      const res = await prescriptionApi.searchAvailability(medicineIds, lat, lng);
      setSearchResults(res.pharmacies || []);
    } catch (err: any) {
      alert('Failed to search prescription availability: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Optical Character Recognition (OCR)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Prescription Scanner & Multi-Stock Finder
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Upload your doctor's prescription. MediFind detects the medicines and finds pharmacies that carry all of them in a single stop.
          </p>
        </div>

        {/* Quick Sample Prescriptions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Quick Sample Prescriptions</span>
              </h2>
              <p className="text-xs text-slate-500">
                Click any sample to test OCR extraction and multi-medicine inventory search:
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-teal-100 text-teal-800 shrink-0">
              Sample Prescriptions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {samplePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleProcessPreset(preset.id)}
                disabled={isProcessing}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between hover:shadow-md hover:scale-[1.01] ${preset.color} ${
                  selectedPreset === preset.id ? 'ring-2 ring-teal-500 font-medium' : ''
                }`}
              >
                <div>
                  <h3 className="font-bold text-xs text-slate-900 mb-1">{preset.title}</h3>
                  <p className="text-[10px] text-slate-500 mb-2">{preset.doctor}</p>
                  <div className="flex flex-wrap gap-1">
                    {preset.previewMeds.map((m) => (
                      <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-white/90 text-slate-700 font-semibold border border-slate-200/80">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <span className="text-[11px] font-bold text-teal-700 mt-4 flex items-center gap-1">
                  <span>Run OCR Scan</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-300 text-center hover:border-teal-500 transition mb-8 shadow-xs">
          <UploadCloud className="w-12 h-12 text-teal-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Upload Your Own Prescription Image or PDF
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Supports PNG, JPG, JPEG, and PDF documents. High-contrast, clear camera photos work best.
          </p>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold transition cursor-pointer shadow-md">
            <span>Browse Files</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* OCR Processing State */}
        {isProcessing && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm mb-8 animate-pulse">
            <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-900">Scanning Prescription with OCR...</h3>
            <p className="text-xs text-slate-500 mt-1">
              Extracting handwriting, parsing medical acronyms (Rx, TDS, BD), and matching against medicine catalog.
            </p>
          </div>
        )}

        {/* Step 2: Confirmation Screen (Mandatory Requirement) */}
        {!isProcessing && medicines.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 mb-1 inline-block">
                  Step 2: Patient Confirmation
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Verify Extracted Prescription Items
                </h3>
                <p className="text-xs text-slate-500">
                  Source document: <strong className="text-slate-800">{fileName}</strong>
                </p>
              </div>

              <button
                onClick={handleAddMedicine}
                className="px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>

            {/* Mandatory Safety Notice */}
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 mb-6">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>CRITICAL SAFETY REQUIREMENT:</strong> OCR results are AI-assisted estimates and may misinterpret handwriting. Please review and correct detected names and dosages against your physical prescription before searching.
              </span>
            </div>

            {/* Editable Medicines List */}
            <div className="space-y-3 mb-6">
              {medicines.map((med, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-300 transition"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={med.detected_name}
                        onChange={(e) => handleUpdateMedicine(index, 'detected_name', e.target.value)}
                        className="text-sm font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 focus:border-teal-500 outline-none w-full sm:max-w-xs"
                      />
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 shrink-0">
                        {Math.round(med.confidence * 100)}% Match
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">Dosage:</span>
                      <input
                        type="text"
                        value={med.dosage || ''}
                        onChange={(e) => handleUpdateMedicine(index, 'dosage', e.target.value)}
                        placeholder="e.g. 1 tab TDS x 3 days"
                        className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 focus:border-teal-500 outline-none w-48"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRemoveMedicine(index)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                      title="Remove from search"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Raw Extracted Text View Toggle */}
            {rawText && (
              <details className="mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-600">
                <summary className="font-semibold cursor-pointer text-slate-700">
                  View Raw Text Extracted by OCR
                </summary>
                <pre className="mt-2 p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-wrap">
                  {rawText}
                </pre>
              </details>
            )}

            {/* Confirm & Search Availability Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={handleSearchAvailability}
                disabled={isSearching}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold transition shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching All Pharmacies...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Search Availability for All ({medicines.length}) Medicines</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Multi-Medicine Search Results */}
        {searchResults && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Multi-Medicine Availability Results
                </h3>
                <p className="text-xs text-slate-500">
                  Showing pharmacies ranked by single-stop stock fulfillment and distance:
                </p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                {searchResults.length} Nearby Pharmacies Checked
              </span>
            </div>

            {searchResults.map((result: any) => (
              <div
                key={result.pharmacy_id}
                className={`bg-white rounded-3xl p-6 border transition-all ${
                  result.all_available
                    ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-md'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{result.pharmacy_name}</h4>
                      {result.all_available ? (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Complete Prescription In Stock!
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Partial Stock ({result.available_count}/{result.total_requested} Available)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{result.address}</p>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Navigation className="w-3 h-3 text-teal-600" />
                      {result.distance_km} km away
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">Tel: {result.phone}</p>
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2 mb-4">
                  {result.items.map((item: any) => (
                    <div key={item.medicine_id} className="flex items-center justify-between text-xs py-1 px-2">
                      <span className="font-semibold text-slate-800">{item.medicine_name}</span>
                      <div className="flex items-center gap-3">
                        {item.availability_status === 'IN_STOCK' ? (
                          <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[10px]">
                            In Stock ({item.quantity} left)
                          </span>
                        ) : item.availability_status === 'LOW_STOCK' ? (
                          <span className="font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded text-[10px]">
                            Low Stock ({item.quantity} left)
                          </span>
                        ) : (
                          <span className="font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded text-[10px]">
                            Out of Stock
                          </span>
                        )}
                        <span className="font-bold text-slate-900">₹{item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/search?q=${encodeURIComponent(result.items[0]?.medicine_name || '')}&medicineId=${result.items[0]?.medicine_id || ''}`)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1"
                  >
                    <span>Reserve at this Pharmacy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
