import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Building2, 
  MapPin, 
  Phone, 
  Navigation, 
  BellRing, 
  ExternalLink,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { reservationApi, notificationApi } from '../services/api.js';
import { Reservation, NotificationItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'reservations' | 'alerts' | 'notifications'>('reservations');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [resData, notifData] = await Promise.all([
        reservationApi.getMyReservations(),
        notificationApi.getMyNotifications()
      ]);
      setReservations((resData.reservations || []).filter((res) => res.status !== 'CANCELLED'));
      setNotifications(notifData.notifications || []);
    } catch (err) {
      console.error('Failed to load user dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleCancelReservation = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The held stock will be released.')) {
      return;
    }
    try {
      await reservationApi.updateStatus(id, 'CANCELLED');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Ready for Pickup!
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-xl bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Confirmed by Pharmacy
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Awaiting Pharmacy Confirmation
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
            Order Picked Up
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-xl bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Declined by Pharmacy
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-xl bg-slate-100 text-slate-500">
            Cancelled
          </span>
        );
      default:
        return <span className="text-xs">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* User Profile Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-800 text-white flex items-center justify-center font-black text-xl shadow-md shadow-teal-600/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{user?.name || 'Citizen Portal'}</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  {user?.role || 'user'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/search')}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Search New Medicine
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'reservations'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            My Reservations ({reservations.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'notifications'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            Stock Alerts & Notifications ({notifications.length})
          </button>
        </div>

        {/* Tab 1: Reservations List */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading your reservations...</p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Reservations Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Find nearby pharmacies with available medicine and reserve your pack for counter pickup.
                </p>
                <button
                  onClick={() => navigate('/search')}
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
                >
                  Find Medicine Now
                </button>
              </div>
            ) : (
              reservations.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-mono font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                        {res.reservation_code}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        Placed on {new Date(res.created_at).toLocaleDateString()} at {new Date(res.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div>{getStatusBadge(res.status)}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    {/* Medicine Details */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reserved Medicine</span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{res.medicine_name}</h4>
                      <p className="text-xs text-slate-500">{res.medicine_strength} • {res.medicine_form}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-1">Quantity: {res.quantity} pack{res.quantity > 1 ? 's' : ''}</p>
                    </div>

                    {/* Pharmacy Info */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Pharmacy</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{res.pharmacy_name}</h4>
                      <p className="text-xs text-slate-500">{res.pharmacy_address}</p>
                      <p className="text-xs text-slate-700 mt-1">Tel: <a href={`tel:${res.pharmacy_phone}`} className="underline text-teal-600 font-medium">{res.pharmacy_phone}</a></p>
                    </div>

                    {/* Price and Deadline */}
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount Due at Counter</span>
                      <p className="text-2xl font-black text-slate-900">₹{res.total_price.toFixed(2)}</p>
                      {res.pickup_deadline && (
                        <p className="text-[11px] text-amber-600 font-semibold mt-1">
                          Hold deadline: {new Date(res.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notes and Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    {res.notes && (
                      <p className="text-xs text-slate-500 italic">
                        Note: "{res.notes}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      {res.pharmacy_lat && res.pharmacy_lng && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${res.pharmacy_lat},${res.pharmacy_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <Navigation className="w-3.5 h-3.5 text-teal-600" />
                          <span>Get Directions</span>
                        </a>
                      )}

                      {res.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancelReservation(res.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-rose-200"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">Your Activity & Stock Alerts</h3>
              <button
                onClick={async () => {
                  await notificationApi.markAsRead('all');
                  loadDashboardData();
                }}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                Mark all read
              </button>
            </div>

            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition flex items-start gap-3 ${
                  notif.is_read === 0 ? 'bg-teal-50/40 border-teal-200' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div className="p-2 bg-white rounded-xl shadow-2xs mt-0.5">
                  <BellRing className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 inline-block">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
