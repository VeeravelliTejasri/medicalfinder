import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { 
  HeartHandshake, 
  Search, 
  FileText, 
  AlertOctagon, 
  MapPin, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Building2, 
  Shield, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLocation } from '../context/LocationContext.js';
import { useNotifications } from '../context/NotificationContext.js';
import { NotificationDropdown } from './NotificationDropdown.js';
import { LocationSelectorModal } from './LocationSelectorModal.js';

export const Navbar: React.FC = () => {
  const { user, logout, quickSwitchRole } = useAuth();
  const { locationName } = useLocation();
  const { unreadCount, isOpen: notifOpen, setIsOpen: setNotifOpen } = useNotifications();
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const isEmergencyActive = routerLocation.pathname === '/emergency';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900">Medi<span className="text-teal-600">Find</span></span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">Live</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">Medicine Availability Finder</p>
              </div>
            </Link>

            {/* Middle Nav Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link
                to="/search"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  routerLocation.pathname.startsWith('/search')
                    ? 'bg-teal-50 text-teal-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Search className="w-4 h-4 text-teal-600" />
                <span>Search Stock</span>
              </Link>

              <Link
                to="/prescription"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  routerLocation.pathname === '/prescription'
                    ? 'bg-teal-50 text-teal-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Prescription OCR</span>
              </Link>

              <Link
                to="/emergency"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs ${
                  isEmergencyActive
                    ? 'bg-rose-600 text-white shadow-rose-500/30'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 hover:text-rose-800'
                }`}
              >
                <AlertOctagon className={`w-4 h-4 ${isEmergencyActive ? 'animate-bounce' : 'text-rose-600'}`} />
                <span>Emergency Mode</span>
              </Link>

              {/* Dynamic portal link based on user role */}
              {user?.role === 'pharmacy' && (
                <Link
                  to="/pharmacy-dashboard"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1.5 transition"
                >
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Pharmacy Portal</span>
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link
                  to="/admin-dashboard"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-800 hover:bg-indigo-100 flex items-center gap-1.5 transition"
                >
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Admin Portal</span>
                </Link>
              )}

              {user?.role === 'user' && (
                <Link
                  to="/dashboard"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition"
                >
                  <span>My Reservations</span>
                </Link>
              )}
            </nav>

            {/* Right Action Icons & Profile */}
            <div className="flex items-center gap-2">
              {/* Location Picker Chip */}
              <button
                onClick={() => setLocationModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-slate-100/80 hover:bg-slate-200/70 transition border border-slate-200/60"
                title="Change location"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span className="truncate max-w-[130px] font-semibold">{locationName.split(',')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Notification Bell with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown />
              </div>

              {/* User Account / Role Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">{user.name.split(' ')[0]}</p>
                      <span className="text-[10px] uppercase font-semibold text-teal-700 tracking-wider">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {roleMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                          {user.role} mode
                        </span>
                      </div>

                      {/* Role Switching */}
                      <div className="px-2 py-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                          Switch Portal View
                        </p>
                        <button
                          onClick={() => {
                            quickSwitchRole('user');
                            setRoleMenuOpen(false);
                            navigate('/dashboard');
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                            user.role === 'user' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                          Citizen / Patient
                        </button>
                        <button
                          onClick={() => {
                            quickSwitchRole('pharmacy');
                            setRoleMenuOpen(false);
                            navigate('/pharmacy-dashboard');
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                            user.role === 'pharmacy' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          Pharmacy Manager
                        </button>
                        <button
                          onClick={() => {
                            quickSwitchRole('admin');
                            setRoleMenuOpen(false);
                            navigate('/admin-dashboard');
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 ${
                            user.role === 'admin' ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Platform Admin
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setRoleMenuOpen(false);
                            navigate('/login');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl transition shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
            <Link
              to="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-teal-50"
            >
              Search Medicines
            </Link>
            <Link
              to="/prescription"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-teal-50"
            >
              Prescription OCR
            </Link>
            <Link
              to="/emergency"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50"
            >
              🚨 Emergency Mode
            </Link>
            {user?.role === 'user' && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-teal-50"
              >
                My Reservations
              </Link>
            )}
            {user?.role === 'pharmacy' && (
              <Link
                to="/pharmacy-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Pharmacy Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={() => {
                setLocationModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 flex items-center justify-between"
            >
              <span>Location: {locationName}</span>
              <MapPin className="w-4 h-4 text-teal-600" />
            </button>
          </div>
        )}
      </header>

      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </>
  );
};
