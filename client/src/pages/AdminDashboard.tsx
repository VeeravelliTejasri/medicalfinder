import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Building2, 
  Pill, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Search, 
  Plus, 
  BarChart3, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { adminApi } from '../services/api.js';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'pharmacies' | 'add_medicine'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);

  // New master medicine form state
  const [medName, setMedName] = useState('');
  const [medGeneric, setMedGeneric] = useState('');
  const [medBrand, setMedBrand] = useState('');
  const [medCategory, setMedCategory] = useState('Analgesics');
  const [medStrength, setMedStrength] = useState('500 mg');
  const [medForm, setMedForm] = useState('Tablet');
  const [medPrice, setMedPrice] = useState('45');
  const [isEmergency, setIsEmergency] = useState(false);
  const [requiresRx, setRequiresRx] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, analyticsRes, pharmRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAnalytics(),
        adminApi.getPharmacies()
      ]);
      setStats(statsRes.stats);
      setAnalytics(analyticsRes);
      setPharmacies(pharmRes.pharmacies || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVerification = async (pharmacyId: string, currentStatus: number) => {
    try {
      await adminApi.toggleVerification(pharmacyId, currentStatus !== 1);
      setMessage(`Pharmacy verification updated.`);
      setTimeout(() => setMessage(null), 3000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update verification');
    }
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createMedicine({
        name: medName,
        generic_name: medGeneric,
        brand_name: medBrand || medName,
        category: medCategory,
        strength: medStrength,
        dosage_form: medForm,
        average_price: parseFloat(medPrice),
        is_emergency: isEmergency ? 1 : 0,
        requires_prescription: requiresRx ? 1 : 0
      });
      setMessage(`"${medName}" added to master database!`);
      setTimeout(() => setMessage(null), 4000);
      setMedName('');
      setMedGeneric('');
      setMedBrand('');
      setActiveTab('overview');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add medicine');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-700/20">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">MediFind System Administration</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Root Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time stock health metrics, outage monitoring, and pharmacy partner verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('add_medicine')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Master Medicine</span>
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Key Platform Overview Metrics */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Total Users</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_users}</p>
              <span className="text-[11px] text-teal-600 font-medium mt-1 inline-block">Registered Citizens</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Partner Pharmacies</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_pharmacies}</p>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">100% Active Network</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Master Catalog</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_medicines}</p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">Verified Drugs</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Active Reservations</span>
              <p className="text-2xl font-black text-indigo-700 mt-1">{stats.active_reservations}</p>
              <span className="text-[11px] text-indigo-600 font-medium mt-1 inline-block">In Fulfillment Pipeline</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Stock Availability Health</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{stats.stock_health_percent}%</p>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">Fulfillment Index</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Platform Analytics & Outage Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('pharmacies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'pharmacies'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Manage Pharmacies ({pharmacies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add_medicine')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'add_medicine'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Master Medicine</span>
          </button>
        </div>

        {/* Tab 1: Overview Analytics */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Frequently Out-of-Stock Hotspots */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Frequently Unavailable Medicines</h3>
                      <p className="text-xs text-slate-500">Critical items requiring wholesale restock alerts</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    Outage Alert
                  </span>
                </div>

                <div className="space-y-3">
                  {analytics.topOutages?.map((item: any) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                        <span className="text-[10px] text-slate-500">{item.category} • {item.strength}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">
                          {item.outage_rate}% Outage Rate
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {item.out_of_stock_count} of {item.total_pharmacies_stocking} pharmacies depleted
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* High Demand Search Trends */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Most Searched Medicines</h3>
                      <p className="text-xs text-slate-500">Citizen queries over the past 24 hours</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    High Demand
                  </span>
                </div>

                <div className="space-y-3">
                  {analytics.demandTrend?.map((trend: any) => (
                    <div key={trend.name} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-900">{trend.name}</span>
                        <span className="font-semibold text-slate-600">{trend.searches} searches</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-indigo-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (trend.searches / 350) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Pharmacy Fulfillment Leaderboard */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-1">Pharmacy Fulfillment & Stock Reliability</h3>
              <p className="text-xs text-slate-500 mb-4">Partner performance rankings based on catalog depth and reservation fulfillment</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Pharmacy</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4">Catalog Depth</th>
                      <th className="py-3 px-4">In Stock Items</th>
                      <th className="py-3 px-4">Fulfilled Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics.pharmacyPerformance?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-4">
                          {p.is_verified === 1 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              Verified
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{p.catalog_size} medicines</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">{p.in_stock_count} units</td>
                        <td className="py-3 px-4 font-bold text-indigo-700">{p.fulfilled_orders} pickups</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manage Pharmacies */}
        {activeTab === 'pharmacies' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Pharmacy Network Partners</h3>
            <p className="text-xs text-slate-500 mb-6">Authorize or flag pharmacies operating on the platform</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Pharmacy Name</th>
                    <th className="py-3.5 px-4">License</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Stocked Items</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pharmacies.map((pharm) => (
                    <tr key={pharm.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{pharm.name}</div>
                        <div className="text-slate-400">{pharm.address}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{pharm.license_number}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{pharm.phone}</div>
                        <div className="text-slate-400 text-[10px]">{pharm.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{pharm.inventory_count} items</td>
                      <td className="py-3.5 px-4">
                        {pharm.is_verified === 1 ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Flagged
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleVerification(pharm.id, pharm.is_verified)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition text-[11px] ${
                            pharm.is_verified === 1
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {pharm.is_verified === 1 ? 'Unverify / Flag' : 'Verify Partner'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Add Master Medicine */}
        {activeTab === 'add_medicine' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Medicine to Master Catalog</h3>
            <p className="text-xs text-slate-500 mb-6">New medicines will become available for all pharmacies to stock and citizens to search.</p>

            <form onSubmit={handleCreateMedicine} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Medicine Name (Brand / Common)</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Paracetamol 650 mg Tablet"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Generic Active Ingredient</label>
                  <input
                    type="text"
                    required
                    value={medGeneric}
                    onChange={(e) => setMedGeneric(e.target.value)}
                    placeholder="e.g. Paracetamol"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={medBrand}
                    onChange={(e) => setMedBrand(e.target.value)}
                    placeholder="e.g. Dolo 650"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={medCategory}
                    onChange={(e) => setMedCategory(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-semibold"
                  >
                    <option value="Analgesics">Analgesics</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Antihistamines">Antihistamines</option>
                    <option value="Gastrointestinal">Gastrointestinal</option>
                    <option value="Emergency Care">Emergency Care</option>
                    <option value="Vitamins & Supplements">Vitamins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Strength</label>
                  <input
                    type="text"
                    value={medStrength}
                    onChange={(e) => setMedStrength(e.target.value)}
                    placeholder="e.g. 650 mg"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dosage Form</label>
                  <select
                    value={medForm}
                    onChange={(e) => setMedForm(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Injection">Injection</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Auto-Injector">Auto-Injector</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>Mark as Critical Emergency Medicine</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresRx}
                    onChange={(e) => setRequiresRx(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <span>Requires Doctor Prescription (Rx)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Add Medicine to Master Catalog
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
