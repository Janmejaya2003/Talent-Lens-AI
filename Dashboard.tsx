import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  BarChart3, 
  PieChart, 
  Trash2, 
  Download, 
  ArrowRight,
  TrendingUp,
  History,
  Trash,
  Zap
} from 'lucide-react';
import { ScorecardData } from '../types';
import { cn } from '../lib/utils';
import { UserPlan } from '../lib/tokenService';

interface DashboardProps {
  history: ScorecardData[];
  userPlan: UserPlan | null;
  onSelectItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onDownloadItem?: (record: ScorecardData) => void;
  onClearAll: () => void;
  onExportAll: () => void;
  onViewPricing: () => void;
}

export function Dashboard({ 
  history, 
  userPlan, 
  onSelectItem, 
  onDeleteItem, 
  onDownloadItem,
  onClearAll, 
  onExportAll, 
  onViewPricing 
}: DashboardProps) {
  const [search, setSearch] = React.useState('');
  
  const filteredHistory = history.filter(item => 
    item.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase())
  );

  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length) 
    : 0;

  const topPerformerCount = history.filter(h => h.score >= 80).length;

  return (
    <div className="space-y-12">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl font-black text-slate-900">{history.length}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Analyzed</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl font-black text-slate-900">{avgScore}%</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Match Score</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
            <PieChart className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl font-black text-slate-900">{topPerformerCount}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top Profile Matches</p>
          </div>
        </div>

        {/* Plan card removed for candidates to keep it free and frictionless */}

        {!userPlan && (
          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
          </div>
          <button 
            onClick={onExportAll}
            className="text-left group"
          >
            <h4 className="text-lg font-bold text-white group-hover:text-accent transition-colors">Export All Reports</h4>
            <p className="text-xs text-slate-400 mt-1">Download CSV of all history</p>
          </button>
        </div>
        )}
      </div>

      {/* History List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <History className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Analysis History</h3>
          </div>
          
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative group flex-1">
               <History className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent" />
               <input 
                type="text"
                placeholder="Search history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
               />
            </div>
            {history.length > 0 && (
              <button 
                onClick={onClearAll}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest whitespace-nowrap"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((record) => (
              <div 
                key={record.id}
                className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                    {record.candidateName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{record.candidateName}</h4>
                    <p className="text-xs text-slate-400">{record.email} • {new Date(record.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">{record.score}%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onSelectItem(record.id)}
                      className="px-4 py-2 bg-accent/10 text-accent rounded-lg text-xs font-bold hover:bg-accent hover:text-white transition-all shadow-sm"
                    >
                      View Report
                    </button>
                    {onDownloadItem && (
                      <button 
                        onClick={() => onDownloadItem(record)}
                        className="p-2 bg-slate-50 text-slate-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                        title="Download CSV"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => onDeleteItem(record.id)}
                      className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete Record"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : history.length > 0 ? (
            <div className="py-20 flex flex-col items-center text-center px-6 grayscale">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-slate-200" />
              </div>
              <h4 className="font-bold text-slate-900">No results found for "{search}"</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">Try searching by candidate name or email address.</p>
              <button 
                onClick={() => setSearch('')}
                className="mt-4 text-accent font-bold text-sm hover:underline"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center text-center px-6">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-slate-200" />
              </div>
              <h4 className="font-bold text-slate-900">No History Found</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">Your resume deconstructions will appear here once they are processed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
