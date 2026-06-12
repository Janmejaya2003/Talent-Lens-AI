import React from 'react';
import { motion } from 'motion/react';
import { Target, Award, Brain, TrendingUp, BadgeCheck } from 'lucide-react';
import { JDAnalysis } from '../../types';

interface JDAnalysisCardProps {
  analysis: JDAnalysis;
}

export function JDAnalysisCard({ analysis }: JDAnalysisCardProps) {
  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
            <Target className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-3xl font-black text-slate-900 leading-none">{analysis.title}</h3>
              <BadgeCheck className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{analysis.experienceLevel} Level Role</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">JD Quality</p>
            <p className="text-4xl font-black text-blue-600 leading-none">{analysis.qualityScore}<span className="text-sm opacity-40">/100</span></p>
          </div>
          <div className="w-px h-12 bg-slate-100" />
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Keywords</p>
            <p className="text-4xl font-black text-slate-900 leading-none">{analysis.keywords.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Requirements */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Extracted Requirements</h4>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {analysis.requiredSkills.map((skill, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200">
                {skill}
              </span>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry Keywords</h5>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.map((kw, idx) => (
                <span key={idx} className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-blue-400" />
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Market Insights */}
        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl text-white space-y-8 overflow-hidden relative">
          <Brain className="absolute top-0 right-0 w-48 h-48 text-white/5 -mr-12 -mt-12" />
          
          <div className="flex items-center gap-3 relative">
            <div className="p-2 bg-white/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-xl font-bold">Market Intelligence</h4>
          </div>

          <div className="grid grid-cols-1 gap-6 relative">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2 group hover:border-blue-500/30 transition-all">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skill Demand</p>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">{analysis.marketInsights.skillDemand}</p>
            </div>
            
            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2 group hover:border-blue-500/30 transition-all">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Salary Trend</p>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">{analysis.marketInsights.salaryTrend}</p>
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2 group hover:border-blue-500/30 transition-all">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hiring Competitiveness</p>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">{analysis.marketInsights.hiringCompetitiveness}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
