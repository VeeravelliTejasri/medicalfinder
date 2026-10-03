import React from 'react';
import { HeartHandshake, ShieldCheck, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-white flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white">Medi<span className="text-teal-400">Find</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Live medicine stock locator connecting patients in need with nearby pharmacies. Check live inventory, reserve medications, and eliminate wasted trips.
            </p>
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified & Real-Time Healthcare Network</span>
            </div>
          </div>

          {/* Core Features */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Key Solutions</h4>
            <ul className="space-y-2">
              <li><Link to="/search" className="hover:text-teal-400 transition">Real-time Stock Search</Link></li>
              <li><Link to="/prescription" className="hover:text-teal-400 transition">Prescription OCR Scanner</Link></li>
              <li><Link to="/emergency" className="hover:text-teal-400 transition text-rose-400 font-semibold">🚨 Emergency Medicine Finder</Link></li>
              <li><Link to="/search?q=Paracetamol%20650" className="hover:text-teal-400 transition">Generic Price Comparison</Link></li>
              <li><Link to="/dashboard" className="hover:text-teal-400 transition">Medicine Reservation Queue</Link></li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Platform Portals</h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="hover:text-teal-400 transition">Patient Portal</Link></li>
              <li><Link to="/pharmacy-dashboard" className="hover:text-teal-400 transition">Pharmacy Stock Manager</Link></li>
              <li><Link to="/admin-dashboard" className="hover:text-teal-400 transition">Platform Administrator</Link></li>
              <li><Link to="/login" className="hover:text-teal-400 transition">User & Pharmacy Login</Link></li>
            </ul>
          </div>

          {/* Medical Safety Disclaimer */}
          <div className="space-y-2.5">
            <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Healthcare Safety</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              MediFind is an inventory locator and information platform. We do not provide medical diagnosis or prescribe treatments. Always consult licensed medical professionals for health advice.
            </p>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <PhoneCall className="w-3 h-3 text-rose-400" />
              <span>National Emergency Helpline: <strong>112</strong></span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[11px]">
          <p>© 2026 MediFind Health Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Built with React + TypeScript + Node.js + Leaflet</span>
            <span>•</span>
            <span className="text-teal-400 font-semibold">Real-Time Medicine Stock Locator</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
