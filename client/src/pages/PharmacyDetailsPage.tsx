import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Navigation, 
  Search, 
  Pill, 
  ArrowLeft,
  ExternalLink 
} from 'lucide-react';
import { pharmacyApi } from '../services/api.js';
import { Pharmacy, InventoryItem, Medicine } from '../types/index.js';
import { ReservationModal } from '../components/ReservationModal.js';

export const PharmacyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [selectedMedicineForReservation, setSelectedMedicineForReservation] = useState<Medicine | null>(null);

  useEffect(() => {
    async function loadPharmacy() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await pharmacyApi.getById(id);
        setPharmacy(data.pharmacy);
        setInventory(data.inventory || []);
        setStats(data.stats);
      } catch (err) {
        console.error('Failed to load pharmacy details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPharmacy();
  }, [id]);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = 
      item.medicine_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.generic_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.brand_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.availability_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700">Loading pharmacy profile & inventory...</p>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Pharmacy Not Found</h2>
        <button
          onClick={() => navigate('/search')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Pharmacy Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-teal-100 text-teal-800 rounded-2xl shrink-0 mt-1">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black text-slate-900">{pharmacy.name}</h1>
                  {pharmacy.is_verified === 1 && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                  {pharmacy.is_24_7 === 1 && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Open 24/7
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{pharmacy.address}, {pharmacy.city}</span>
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  License: <span className="font-mono text-slate-600">{pharmacy.license_number}</span> • Tel: <a href={`tel:${pharmacy.phone}`} className="text-teal-600 font-semibold underline">{pharmacy.phone}</a>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Navigation className="w-4 h-4 text-teal-600" />
                <span>Directions</span>
              </a>

              <a
                href={`tel:${pharmacy.phone}`}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call Pharmacy</span>
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400">Total Catalog</span>
                <p className="text-xl font-black text-slate-900">{stats.total_medicines}</p>
              </div>
              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-700">In Stock Now</span>
                <p className="text-xl font-black text-emerald-900">{stats.in_stock}</p>
              </div>
              <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-100">
                <span className="text-[11px] font-semibold text-amber-700">Low Stock</span>
                <p className="text-xl font-black text-amber-900">{stats.low_stock}</p>
              </div>
              <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100">
                <span className="text-[11px] font-semibold text-rose-700">Out of Stock</span>
                <p className="text-xl font-black text-rose-900">{stats.out_of_stock}</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Inventory Catalog Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Current Medicine Inventory</h2>
              <p className="text-xs text-slate-500">Live verified stock counts updated automatically</p>
            </div>

            {/* Filter Pills and Search */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter inventory..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Medicine Name</th>
                  <th className="py-3 px-4">Strength & Form</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.medicine_name}</div>
                      <div className="text-slate-500">{item.generic_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700">{item.strength}</span>
                      <span className="text-slate-400 ml-1">({item.dosage_form})</span>
                    </td>
                    <td className="py-3 px-4">
                      {item.availability_status === 'IN_STOCK' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          In Stock ({item.quantity})
                        </span>
                      ) : item.availability_status === 'LOW_STOCK' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Low Stock ({item.quantity})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.availability_status !== 'OUT_OF_STOCK' ? (
                        <button
                          onClick={() => {
                            setSelectedMedicineForReservation({
                              id: item.medicine_id,
                              name: item.medicine_name || '',
                              generic_name: item.generic_name || '',
                              brand_name: item.brand_name || '',
                              category: item.category || 'General',
                              strength: item.strength || '',
                              dosage_form: item.dosage_form || '',
                              manufacturer: '',
                              description: '',
                              requires_prescription: item.requires_prescription || 0,
                              is_emergency: item.is_emergency || 0,
                              average_price: item.price
                            });
                            setReservationModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition shadow-xs"
                        >
                          Reserve
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <ReservationModal
        isOpen={reservationModalOpen}
        onClose={() => setReservationModalOpen(false)}
        pharmacy={pharmacy}
        medicine={selectedMedicineForReservation}
      />
    </div>
  );
};
