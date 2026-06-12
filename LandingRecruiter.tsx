import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, FileUp, Mail, TrendingUp, Users, Target } from 'lucide-react';
import { analyzeJD } from '../../lib/recruiterGemini';
import { BackButton } from '../BackButton';

interface LandingRecruiterProps {
  onGetMatch: (email: string, jdContent: string) => void;
  onStartHiring: () => void;
  onViewPricing: () => void;
  onBack?: () => void;
}

export function LandingRecruiter({ onGetMatch, onStartHiring, onViewPricing, onBack }: LandingRecruiterProps) {
  const [email, setEmail] = useState('');
  const [jdText, setJdText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !jdText) return;
    setIsProcessing(true);
    // In a real app, we might analyze here or just pass to parent
    onGetMatch(email, jdText);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button for Recruiter Landing */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <BackButton onClick={onBack} />
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest"
          >
            <TrendingUp className="w-3 h-3" />
            Recruiter Edition
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight"
          >
            Higher-Quality Hires, <br/>
            <span className="text-blue-600">Lower Screening Effort</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 leading-relaxed max-w-xl"
          >
            AI-driven candidate matching to reduce hiring time by 80% and identify the top 1% talent instantly.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <button 
              onClick={onStartHiring}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
            >
              Start Hiring Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={onViewPricing}
              className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              View Pricing
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-100"
          >
            <div className="space-y-1">
              <p className="text-2xl font-black text-slate-900">80%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Screening reduction</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-slate-900">24h</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Average time to hire</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-black text-slate-900">10k+</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Candidates matched</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Live Analytics Card & Upload */}
        <div className="relative">
          {/* Decorative Background */}
          <div className="absolute -inset-4 bg-blue-600/5 rounded-[3rem] blur-3xl -z-10" />
          
          <div className="space-y-6">
            {/* Analytics Preview Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-slate-100 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">Precision Matcher</h3>
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">LIVE</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">JD Score</p>
                  <p className="text-2xl font-black text-slate-900">92/100</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Candidate Fit</p>
                  <p className="text-2xl font-black text-blue-600">98.4%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Market Availability</span>
                  <span className="text-slate-900 font-bold">High Demand</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Upload Box */}
            <motion.form 
              id="recruiter-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl text-white space-y-6"
            >
              <h3 className="text-xl font-bold flex items-center gap-3">
                <FileUp className="w-5 h-5 text-blue-400" />
                Upload Your First JD
              </h3>

              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400" />
                  <input 
                    required
                    type="email"
                    placeholder="Work Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500 transition-all"
                  />
                </div>
                
                <textarea 
                  required
                  placeholder="Paste Job Description..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500 min-h-[160px] resize-none text-sm leading-relaxed"
                />

                <button 
                  disabled={isProcessing}
                  type="submit"
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? "Analyzing..." : "Get Immediate Match"}
                  {!isProcessing && <ArrowRight className="w-6 h-6" />}
                </button>
              </div>
            </motion.form>
          </div>
        </div>
      </div>

      {/* Decision Panel Section */}
      <div className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto text-blue-600">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">For HR Teams</h4>
            <p className="text-slate-500">Reduce manual screening volume by 80% and focus on high-impact interactions.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto text-blue-600">
              <Target className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">For Recruiters</h4>
            <p className="text-slate-500">Identify top 1% candidates instantly with deep semantic skill mapping.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto text-blue-600">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">For Leads</h4>
            <p className="text-slate-500">Make data-driven hiring decisions with objective AI-powered intelligence.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
