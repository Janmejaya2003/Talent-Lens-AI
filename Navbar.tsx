import React from 'react';
import { Search, LogOut, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { motion } from 'motion/react';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
  onViewDashboard: () => void;
  onViewHome: () => void;
  onViewRecruiter: () => void;
  onViewPricing: () => void;
  onViewDocs: () => void;
  role?: 'candidate' | 'recruiter';
}

export function Navbar({ 
  user, 
  onLogin, 
  onSignup, 
  onLogout, 
  onViewDashboard, 
  onViewHome, 
  onViewRecruiter,
  onViewPricing,
  onViewDocs,
  role = 'candidate'
}: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        <button 
          onClick={onViewHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="bg-accent p-1.5 rounded-lg">
            <Search className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            TalentLens <span className="text-accent">AI</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={onViewHome}
            className="text-sm font-bold text-slate-900 underline underline-offset-8 decoration-2 decoration-accent/30"
          >
            For Candidates
          </button>
          <button 
            onClick={onViewRecruiter}
            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2"
          >
            For Recruiters
            <div className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] uppercase">Pro</div>
          </button>
          
          {role === 'recruiter' && (
            <button 
              onClick={onViewPricing}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Pricing
            </button>
          )}

          <button 
            onClick={onViewDocs}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Docs
          </button>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={onViewDashboard}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <div className="h-4 w-px bg-slate-200" />
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={onLogin}
                className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2"
              >
                Log in
              </button>
              <button 
                onClick={onSignup}
                className="px-5 py-2.5 bg-accent text-white rounded-full text-sm font-bold hover:shadow-lg hover:shadow-accent/20 transition-all active:scale-95 flex items-center gap-2"
              >
                Get Started
                <UserPlus className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
