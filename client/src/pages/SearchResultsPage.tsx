import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  MapPin,
  ArrowUpDown,
  Layers,
  Map as MapIcon,
  List,
  Pill,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';

import { pharmacyApi, medicineApi } from '../services/api.js';
import { Pharmacy, Medicine } from '../types/index.js';
import { useLocation } from '../context/LocationContext.js';
import { MedicineSearchBar } from '../components/MedicineSearchBar.js';
import { PharmacyCard } from '../components/PharmacyCard.js';
import { InteractiveMap } from '../components/InteractiveMap.js';
import { ReservationModal } from '../components/ReservationModal.js';
import { GenericAlternativesCard } from '../components/GenericAlternativesCard.js';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const medicineIdParam = searchParams.get('medicineId') || '';

  const { lat, lng, locationName } = useLocation();

  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedMedicine, setSelectedMedicine] =
    useState<Medicine | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] =
    useState<Pharmacy | null>(null);

  const [sortBy, setSortBy] = useState<
    'distance' | 'price' | 'availability'
  >('distance');

  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>(
    'split'
  );

  const [isLoading, setIsLoading] = useState(true);

  const [reservationModalOpen, setReservationModalOpen] =
    useState(false);

  const [targetPharmacyForReservation, setTargetPharmacyForReservation] =
    useState<Pharmacy | null>(null);

  // --------------------------------------------------
  // LOAD MEDICINE
  // --------------------------------------------------

  useEffect(() => {
    async function loadMedicine() {
      setSelectedMedicine(null);

      if (!medicineIdParam && !query) {
        return;
      }

      try {
        if (medicineIdParam) {
          const data = await medicineApi.getById(medicineIdParam);
          setSelectedMedicine(data.medicine);
        } else if (query) {
          const data = await medicineApi.search(query);

          if (data.medicines && data.medicines.length > 0) {
            setSelectedMedicine(data.medicines[0]);
          } else {
            setSelectedMedicine(null);
          }
        }
      } catch (err) {
        console.error('Failed to load medicine:', err);
        setSelectedMedicine(null);
      }
    }

    loadMedicine();
  }, [medicineIdParam, query]);

  // --------------------------------------------------
  // LOAD NEARBY PHARMACIES
  // --------------------------------------------------

  useEffect(() => {
    async function loadPharmacies() {
      setIsLoading(true);
      setPharmacies([]);
      setSelectedPharmacy(null);

      try {
        const data = await pharmacyApi.getNearby({
          lat,
          lng,

          // Use medicine ID when available
          medicineId: selectedMedicine?.id || undefined,

          // Also send search text as fallback
         // q: query || undefined,

          sortBy,

          // Expanded search radius
          maxRadius: 50,
        });

        console.log('Nearby pharmacy response:', data);

        setPharmacies(data.pharmacies || []);

        if (data.pharmacies && data.pharmacies.length > 0) {
          setSelectedPharmacy(data.pharmacies[0]);
        }
      } catch (err) {
        console.error('Failed to fetch pharmacies:', err);
        setPharmacies([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadPharmacies();
  }, [lat, lng, selectedMedicine, query, sortBy]);

  // --------------------------------------------------
  // RESERVATION
  // --------------------------------------------------

  const handleOpenReservation = (pharmacy: Pharmacy) => {
    setTargetPharmacyForReservation(pharmacy);
    setReservationModalOpen(true);
  };

  // --------------------------------------------------
  // STOCK COUNTS
  // --------------------------------------------------

  const inStockCount = pharmacies.filter(
    (p) => p.inventory?.availability_status === 'IN_STOCK'
  ).length;

  const lowStockCount = pharmacies.filter(
    (p) => p.inventory?.availability_status === 'LOW_STOCK'
  ).length;

  const outOfStockCount = pharmacies.filter(
    (p) => p.inventory?.availability_status === 'OUT_OF_STOCK'
  ).length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* SEARCH HEADER */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

            <div className="w-full lg:max-w-xl">
              <MedicineSearchBar
                initialQuery={query}
                onSelectMedicine={(med) => {
                  setSelectedMedicine(med);

                  setSearchParams({
                    q: med.name,
                    medicineId: med.id,
                  });
                }}
              />
            </div>

            {/* VIEW MODE + LOCATION */}
            <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">

                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'split'
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Split</span>
                </button>

                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'list'
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>

                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === 'map'
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Map</span>
                </button>

              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span className="truncate max-w-[120px] font-semibold">
                  {locationName.split(',')[0]}
                </span>
              </div>

            </div>
          </div>

          {/* MEDICINE DETAILS */}
          {selectedMedicine && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-teal-100 text-teal-700 rounded-2xl">
                  <Pill className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">

                    <h2 className="text-base font-black text-slate-900">
                      {selectedMedicine.name}
                    </h2>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {selectedMedicine.category}
                    </span>

                  </div>

                  <p className="text-xs text-slate-500">
                    Generic:{' '}
                    <strong className="text-slate-700">
                      {selectedMedicine.generic_name}
                    </strong>{' '}
                    • Strength:{' '}
                    <strong className="text-slate-700">
                      {selectedMedicine.strength}
                    </strong>{' '}
                    • Form:{' '}
                    <strong className="text-slate-700">
                      {selectedMedicine.dosage_form}
                    </strong>
                  </p>
                </div>

              </div>

              {/* STOCK COUNTERS */}
              <div className="flex items-center gap-2 text-xs font-bold">

                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {inStockCount} In Stock
                </span>

                <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {lowStockCount} Low Stock
                </span>

                <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  {outOfStockCount} Out of Stock
                </span>

              </div>
            </div>
          )}
        </div>

        {/* GENERIC ALTERNATIVES */}
        {selectedMedicine && (
          <GenericAlternativesCard medicine={selectedMedicine} />
        )}

        {/* RESULTS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">

          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
            <span>
              Showing {pharmacies.length} pharmacies nearby
            </span>
          </div>

          <div className="flex items-center gap-2">

            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              Sort By:
            </span>

            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs">

              <button
                onClick={() => setSortBy('distance')}
                className={`px-2.5 py-1 rounded-xl font-bold transition ${
                  sortBy === 'distance'
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Distance
              </button>

              <button
                onClick={() => setSortBy('price')}
                className={`px-2.5 py-1 rounded-xl font-bold transition ${
                  sortBy === 'price'
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lowest Price
              </button>

              <button
                onClick={() => setSortBy('availability')}
                className={`px-2.5 py-1 rounded-xl font-bold transition ${
                  sortBy === 'availability'
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stock Availability
              </button>

            </div>
          </div>
        </div>

        {/* RESULTS */}
        {isLoading ? (

          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">

            <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

            <p className="text-base font-bold text-slate-800">
              Checking live pharmacy inventories...
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Calculating real-time stock levels and travel distances
            </p>

          </div>

        ) : pharmacies.length === 0 ? (

          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">

            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />

            <h3 className="text-lg font-bold text-slate-800 mb-1">
              No Pharmacies Found
            </h3>

            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No pharmacies were found within the current search radius.
              Try another medicine or location.
            </p>

          </div>

        ) : (

          <div
            className={`grid gap-6 ${
              viewMode === 'split'
                ? 'grid-cols-1 lg:grid-cols-12'
                : 'grid-cols-1'
            }`}
          >

            {/* PHARMACY LIST */}
            {(viewMode === 'split' || viewMode === 'list') && (

              <div
                className={`${
                  viewMode === 'split'
                    ? 'lg:col-span-6 xl:col-span-7'
                    : 'w-full'
                } space-y-4`}
              >

                {pharmacies.map((pharmacy) => (

                  <PharmacyCard
                    key={pharmacy.id}
                    pharmacy={pharmacy}
                    selectedMedicine={selectedMedicine}
                    onReserve={handleOpenReservation}
                    onSelectOnMap={(p) =>
                      setSelectedPharmacy(p)
                    }
                    isFocused={
                      selectedPharmacy?.id === pharmacy.id
                    }
                  />

                ))}

              </div>
            )}

            {/* MAP */}
            {(viewMode === 'split' || viewMode === 'map') && (

              <div
                className={`${
                  viewMode === 'split'
                    ? 'lg:col-span-6 xl:col-span-5 h-[650px] lg:sticky lg:top-24'
                    : 'w-full h-[750px]'
                }`}
              >

                <InteractiveMap
                  pharmacies={pharmacies}
                  userLocation={{
                    latitude: lat,
                    longitude: lng,
                  }}
                  selectedMedicine={selectedMedicine}
                  selectedPharmacy={selectedPharmacy}
                  onSelectPharmacy={(p) =>
                    setSelectedPharmacy(p)
                  }
                  onReserve={handleOpenReservation}
                />

              </div>
            )}

          </div>
        )}

      </div>

      {/* RESERVATION MODAL */}
      <ReservationModal
        isOpen={reservationModalOpen}
        onClose={() => setReservationModalOpen(false)}
        pharmacy={targetPharmacyForReservation}
        medicine={selectedMedicine}
        onSuccess={() => {

          pharmacyApi
            .getNearby({
              lat,
              lng,
              medicineId: selectedMedicine?.id,
             // q: query || undefined,
              sortBy,
              maxRadius: 50,
            })
            .then((data) => {
              setPharmacies(data.pharmacies || []);
            })
            .catch((err) => {
              console.error(
                'Failed to refresh pharmacies:',
                err
              );
            });

        }}
      />

    </div>
  );
};