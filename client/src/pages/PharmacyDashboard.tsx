import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Package, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Check, 
  X, 
  Search, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Sparkles, 
  BellRing,
  Edit2
} from 'lucide-react';
import { inventoryApi, reservationApi, medicineApi } from '../services/api.js';
import { InventoryItem, Reservation, Medicine } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

export const PharmacyDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'requests' | 'inventory' | 'add'>('requests');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [counts, setCounts] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Add medicine state
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogResults, setCatalogResults] = useState<Medicine[]>([]);
  const [selectedCatalogMed, setSelectedCatalogMed] = useState<Medicine | null>(null);
  const [newStockQty, setNewStockQty] = useState<number>(25);
  const [newStockPrice, setNewStockPrice] = useState<number>(35);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invRes, reqRes] = await Promise.all([
        inventoryApi.getMyInventory(),
        reservationApi.getPharmacyReservations()
      ]);
      setInventory(invRes.inventory || []);
      setSummary(invRes.summary);
      setReservations(reqRes.reservations || []);
      setCounts(reqRes.counts);
    } catch (err) {
      console.error('Failed to load pharmacy dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdateQuantity = async (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    try {
      const res = await inventoryApi.updateItem(item.id, { quantity: newQty });
      if (res.item.alerts_triggered > 0) {
        setFeedbackMessage(`🎉 Restocked! Alert sent to ${res.item.alerts_triggered} waiting patients.`);
        setTimeout(() => setFeedbackMessage(null), 5000);
      }
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    }
  };

  const handleUpdatePrice = async (item: InventoryItem, newPrice: number) => {
    try {
      await inventoryApi.updateItem(item.id, { price: newPrice });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update price');
    }
  };

  const handleReservationAction = async (id: string, status: string, reason?: string) => {
    try {
      await reservationApi.updateStatus(id, status, reason);
      setFeedbackMessage(`Reservation status updated to ${status}. Patient notified!`);
      setTimeout(() => setFeedbackMessage(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update reservation');
    }
  };

  // Search master catalog for adding new items
  useEffect(() => {
    if (!catalogSearch.trim()) {
      setCatalogResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await medicineApi.search(catalogSearch);
        setCatalogResults(res.medicines || []);
      } catch (err) {
        console.error(err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [catalogSearch]);

  const handleAddMedicineSubmit = async () => {
    if (!selectedCatalogMed) return;
    try {
      await inventoryApi.addItem(selectedCatalogMed.id, newStockQty, newStockPrice);
      setFeedbackMessage(`${selectedCatalogMed.name} added to your inventory!`);
      setTimeout(() => setFeedbackMessage(null), 4000);
      setSelectedCatalogMed(null);
      setCatalogSearch('');
      setActiveTab('inventory');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add medicine');
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.medicine_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.generic_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Pharmacy Portal Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-700/20">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">
                  {user?.pharmacy_name || 'Apollo Pharmacy Indiranagar'}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Verified Partner
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff Manager: <strong>{user?.name}</strong> • Real-Time Inventory & Reservation Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('add')}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine to Stock</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedbackMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Key Operational Overview Metrics */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Total Medicines</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{summary.total}</p>
              <span className="text-[11px] text-teal-600 font-medium mt-1 inline-block">Active Stocked Items</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600">In-Stock</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{summary.in_stock}</p>
              <span className="text-[11px] text-slate-400 mt-1 inline-block">&gt;10 units available</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-amber-600">Low-Stock Warnings</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{summary.low_stock}</p>
              <span className="text-[11px] text-amber-600 mt-1 inline-block">Needs Restock Soon</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-blue-600">Pending Patient Requests</span>
              <p className="text-2xl font-black text-blue-700 mt-1">{counts?.pending || 0}</p>
              <span className="text-[11px] text-blue-600 font-medium mt-1 inline-block">Require Confirmation</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Patient Requests Queue ({reservations.filter(r => r.status === 'PENDING').length} Pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Manage Inventory Stock</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Catalog Medicine</span>
          </button>
        </div>

        {/* Tab 1: Requests Queue */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {reservations.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Patient Requests Yet</h3>
                <p className="text-xs text-slate-500">Incoming reservations from citizens will appear here in real time.</p>
              </div>
            ) : (
              reservations.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white rounded-3xl p-6 border transition shadow-xs ${
                    req.status === 'PENDING' ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                        {req.reservation_code}
                      </span>
                      <span className="text-xs text-slate-500">
                        Requested by <strong className="text-slate-900">{req.user_name}</strong> ({req.user_phone})
                      </span>
                    </div>

                    <div>
                      {req.status === 'PENDING' ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-100 text-amber-800 animate-pulse">
                          Pending Approval
                        </span>
                      ) : req.status === 'READY_FOR_PICKUP' ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800">
                          Ready for Pickup
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-black text-slate-900">{req.medicine_name}</h4>
                      <p className="text-xs text-slate-500">
                        Quantity: <strong>{req.quantity} pack{req.quantity > 1 ? 's' : ''}</strong> • Total Value: <strong>₹{req.total_price.toFixed(2)}</strong>
                      </p>
                      {req.notes && (
                        <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2">
                          Patient Note: "{req.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action Buttons for Pending Request */}
                    {req.status === 'PENDING' ? (
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleReservationAction(req.id, 'READY_FOR_PICKUP')}
                          className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept & Ready for Pickup</span>
                        </button>

                        <button
                          onClick={() => {
                            const reason = prompt('Please enter rejection reason:', 'Prescription required / Out of stock');
                            if (reason !== null) {
                              handleReservationAction(req.id, 'REJECTED', reason);
                            }
                          }}
                          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-rose-200"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    ) : req.status === 'READY_FOR_PICKUP' ? (
                      <button
                        onClick={() => handleReservationAction(req.id, 'COMPLETED')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Mark as Handed Over / Completed
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Inventory Management */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Inventory Stock Controller</h3>
                <p className="text-xs text-slate-500">
                  Update quantities in real-time. Restocking from 0 automatically notifies waiting patients!
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your inventory..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Medicine</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Stock Adjuster</th>
                    <th className="py-3.5 px-4">Unit Price</th>
                    <th className="py-3.5 px-4">Last Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{item.medicine_name}</div>
                        <div className="text-slate-500">{item.generic_name} • {item.strength}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {item.availability_status === 'IN_STOCK' ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                            In Stock
                          </span>
                        ) : item.availability_status === 'LOW_STOCK' ? (
                          <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                            Low Stock
                          </span>
                        ) : (
                          <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      {/* Inline Stock Adjuster */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item, -1)}
                            disabled={item.quantity <= 0}
                            className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-700 disabled:opacity-30"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="font-black text-sm w-10 text-center text-slate-900">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => handleUpdateQuantity(item, 5)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[11px] border border-emerald-200 flex items-center gap-0.5"
                            title="Quick Restock +5"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+5</span>
                          </button>
                        </div>
                      </td>

                      {/* Price editor */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{item.price.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {item.last_updated}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Add Medicine to Catalog */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Medicine to Pharmacy Inventory</h3>
            <p className="text-xs text-slate-500 mb-6">Select from verified global medicine catalog and set initial inventory.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Search Master Catalog</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search medicine name, generic..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 outline-none"
                  />
                </div>

                {catalogResults.length > 0 && !selectedCatalogMed && (
                  <div className="mt-2 bg-white border border-slate-200 rounded-2xl max-h-48 overflow-y-auto divide-y divide-slate-100 shadow-md">
                    {catalogResults.map(med => (
                      <div
                        key={med.id}
                        onClick={() => {
                          setSelectedCatalogMed(med);
                          setNewStockPrice(med.average_price);
                        }}
                        className="p-3 text-xs hover:bg-teal-50 cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{med.name}</span>
                          <span className="text-slate-400 ml-2">({med.strength})</span>
                        </div>
                        <span className="text-teal-700 font-bold">₹{med.average_price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedCatalogMed && (
                <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-teal-950">{selectedCatalogMed.name}</h4>
                      <p className="text-xs text-teal-700">{selectedCatalogMed.generic_name} • {selectedCatalogMed.category}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCatalogMed(null)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(parseInt(e.target.value, 10) || 0)}
                    min="1"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={newStockPrice}
                    onChange={(e) => setNewStockPrice(parseFloat(e.target.value) || 0)}
                    step="0.5"
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-bold"
                  />
                </div>
              </div>

              <button
                onClick={handleAddMedicineSubmit}
                disabled={!selectedCatalogMed}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-40"
              >
                Confirm & Add to Live Inventory
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
