import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

interface HeroProps {
  onStartClick: () => void;
  mockAtsScore?: number;
}

export function Hero({ onStartClick, mockAtsScore = 92 }: HeroProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      {/* Hero Left */}
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent/5 border border-accent/20 rounded-full"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold text-accent uppercase tracking-wider">AI-Powered Career Intelligence</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight"
        >
          AI Resume Analysis & <span className="text-accent">Job Match</span>
        </motion.h1>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold text-slate-700"
        >
          Improve your chances before you apply.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-slate-500 max-w-xl leading-relaxed"
        >
          Unlock your true profile potential. Upload your resume to check ATS compatibility, skill gaps, and job alignment in seconds.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button 
            onClick={onStartClick}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Upload Resume & Start
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-6 pt-4"
        >
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Joined by <span className="text-slate-900 font-bold">12,000+</span> candidates worldwide
          </p>
        </motion.div>
      </div>

      {/* Hero Right - Preview Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute -inset-4 bg-accent/10 blur-3xl rounded-full opacity-50" />
        
        <div className="relative space-y-6">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-accent/10 border border-slate-100 p-8">
            <div className="text-center space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Analysis Preview</p>
              <div className="inline-flex flex-col items-center">
                <span className="text-8xl font-black text-slate-900 leading-none">{mockAtsScore}</span>
                <span className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-wider">ATS Score</span>
              </div>
            </div>

            <div className="mt-10 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-900">Job Match</span>
                  <span className="text-sm font-black text-accent">88%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "88%" }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="h-full bg-accent rounded-full"
                  />
                </div>
              </div>

              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
                <div className="flex items-center gap-2 text-amber-700">
                  <Zap className="w-4 h-4 fill-amber-700" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Critical Gap Identified</span>
                </div>
                <p className="text-sm text-amber-900 leading-snug">
                  Your resume is missing 3 key technical keywords found in the target job description.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
