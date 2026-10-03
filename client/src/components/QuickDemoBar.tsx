import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, AlertTriangle, Shield, User, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const QuickDemoBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, quickSwitchRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs border-b border-indigo-800/40 relative z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Title Tag */}
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3" />
            Hackathon Demo Guide
          </span>
          <span className="hidden sm:inline text-slate-300 font-medium">
            Test key presentation scenarios instantly:
          </span>
        </div>

        {!collapsed && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Scenario 1: Paracetamol 650 */}
            <button
              onClick={() => navigate('/search?q=Paracetamol%20650')}
              className="bg-indigo-600/60 hover:bg-indigo-600 text-white px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 border border-indigo-400/30 shadow-sm"
              title="Demonstrates proximity search with In-Stock, Low-Stock, and Out-of-Stock pharmacies"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>1-Click: Paracetamol 650mg</span>
            </button>

            {/* Scenario 2: Prescription OCR */}
            <button
              onClick={() => navigate('/prescription')}
              className="bg-teal-700/60 hover:bg-teal-600 text-white px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 border border-teal-400/30 shadow-sm"
              title="Upload prescription and run medical OCR"
            >
              <FileText className="w-3.5 h-3.5 text-teal-200" />
              <span>1-Click: Prescription OCR</span>
            </button>

            {/* Scenario 3: Emergency Mode */}
            <button
              onClick={() => navigate('/emergency')}
              className="bg-rose-700/70 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 border border-rose-400/30 shadow-sm"
              title="Find urgent life-saving medications at 24/7 pharmacies"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-200" />
              <span>1-Click: Emergency Mode</span>
            </button>

            {/* Role Switcher Pill */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
              <span className="text-[10px] text-slate-400 font-semibold">ROLE:</span>
              <button
                onClick={() => quickSwitchRole('user')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition flex items-center gap-1 ${
                  user?.role === 'user' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
                title="Login as user@demo.com"
              >
                <User className="w-3 h-3" />
                User
              </button>
              <button
                onClick={() => quickSwitchRole('pharmacy')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition flex items-center gap-1 ${
                  user?.role === 'pharmacy' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
                title="Login as pharmacy@demo.com (Apollo Pharmacy)"
              >
                <Building2 className="w-3 h-3" />
                Pharmacy
              </button>
              <button
                onClick={() => quickSwitchRole('admin')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition flex items-center gap-1 ${
                  user?.role === 'admin' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
                title="Login as admin@demo.com"
              >
                <Shield className="w-3 h-3" />
                Admin
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1 rounded transition"
          title={collapsed ? 'Expand demo toolbar' : 'Collapse demo toolbar'}
        >
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
