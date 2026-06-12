import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  LayoutDashboard, 
  LogOut, 
  User, 
  Briefcase,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface RecruiterNavbarProps {
  user: SupabaseUser | null;
  onLogout: () => void;
  onViewDashboard: () => void;
  onViewHome: () => void;
  onViewPricing: () => void;
  onViewDocs: () => void;
}

export function RecruiterNavbar({ 
  user, 
  onLogout, 
  onViewDashboard, 
  onViewHome,
  onViewPricing,
  onViewDocs
}: RecruiterNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        <div 
          onClick={onViewHome}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white rotate-3 group-hover:rotate-6 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-lg flex items-center justify-center border-2 border-white">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 leading-tight">TalentLens</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-tight">Recruiter Pro</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={onViewHome}
            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Product
          </button>
          <button 
            onClick={onViewPricing}
            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Pricing
          </button>
          <button 
            onClick={onViewDocs}
            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors font-mono"
          >
            Docs
          </button>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button 
                onClick={onViewDashboard}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all border border-blue-100"
              >
                <LayoutDashboard className="w-4 h-4" />
                Console
              </button>
              
              <div className="w-px h-6 bg-slate-100 mx-2" />
              
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                   <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-bold text-slate-400 leading-none mb-0.5">RECRUITER</p>
                  <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[100px]">{user.email?.split('@')[0]}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={onViewDashboard} // Redirect to dashboard which should show auth if not logged in
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              Start Hiring
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
