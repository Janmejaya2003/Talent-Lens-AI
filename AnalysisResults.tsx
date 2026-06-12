import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Zap, Briefcase, GraduationCap, Award, MapPin, Mail, Phone, Download, Loader2, PlayCircle, HelpCircle, Sparkles } from 'lucide-react';
import { EvaluationResult } from '../types';
import { cn } from '../lib/utils';
import { generateInterviewQuestions } from '../lib/gemini';

interface AnalysisResultsProps {
  evaluation: EvaluationResult;
  onExport: () => void;
  onExportCsv?: () => void;
}

export function AnalysisResults({ evaluation, onExport, onExportCsv }: AnalysisResultsProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<{question: string, category: string, lookFor: string}[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const handlePdfExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const questions = await generateInterviewQuestions(evaluation);
      setInterviewQuestions(questions);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return (
    <div className="space-y-8">
      <div id="analysis-report" className="space-y-8 pb-20 bg-white p-8 rounded-[3rem]" style={{ color: '#0f172a' }}>
        {/* Compatibility overrides for html2canvas which doesn't support oklch */}
      <style>
        {`
          #analysis-report .report-bg-white { background-color: #ffffff !important; }
          #analysis-report .report-text-slate-900 { color: #0f172a !important; }
          #analysis-report .report-text-slate-500 { color: #64748b !important; }
          #analysis-report .report-text-slate-400 { color: #94a3b8 !important; }
          #analysis-report .report-text-slate-600 { color: #475569 !important; }
          #analysis-report .report-bg-slate-50 { background-color: #f8fafc !important; }
          #analysis-report .report-bg-slate-100 { background-color: #f1f5f9 !important; }
          #analysis-report .report-bg-slate-900 { background-color: #0f172a !important; }
          #analysis-report .report-text-accent { color: #3b82f6 !important; }
          #analysis-report .report-bg-accent { background-color: #3b82f6 !important; }
          #analysis-report .report-border-slate-100 { border-color: #f1f5f9 !important; }
          #analysis-report .report-bg-emerald-50 { background-color: #ecfdf5 !important; }
          #analysis-report .report-text-emerald-600 { color: #059669 !important; }
          #analysis-report .report-bg-red-50 { background-color: #fef2f2 !important; }
          #analysis-report .report-text-red-600 { color: #dc2626 !important; }
          #analysis-report .report-bg-accent-alpha { background-color: rgba(59, 130, 246, 0.2) !important; }
        `}
      </style>
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white report-bg-white p-8 rounded-[2rem] border border-slate-100 report-border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center"
        >
          <span className="text-6xl font-black text-slate-900 report-text-slate-900 leading-none">{evaluation.atsScore}</span>
          <span className="text-xs font-bold text-slate-500 report-text-slate-500 mt-4 uppercase tracking-widest">ATS Compatibility Score</span>
          <div className="mt-4 w-full h-1.5 bg-slate-100 report-bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                evaluation.atsScore > 80 ? "bg-emerald-500" : evaluation.atsScore > 60 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${evaluation.atsScore}%` }}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-accent report-bg-accent p-8 rounded-[2rem] text-white shadow-xl shadow-accent/20 flex flex-col items-center text-center overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="w-24 h-24" />
          </div>
          <span className="text-6xl font-black leading-none">{evaluation.jobMatch.score}%</span>
          <span className="text-xs font-bold text-white/70 mt-4 uppercase tracking-widest">Job Description Match</span>
          <div className="mt-4 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${evaluation.jobMatch.score}%` }}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900 report-bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl shadow-slate-900/20 flex flex-col items-center justify-center text-center gap-6"
        >
          <button 
            onClick={handlePdfExport}
            disabled={isExporting}
            className="group flex flex-col items-center gap-3 hover:opacity-80 transition-opacity disabled:opacity-50"
            data-html2canvas-ignore="true"
            title="Download PDF Report"
          >
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all">
              {isExporting ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Download className="w-8 h-8 text-white" />}
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
              {isExporting ? 'Generating...' : 'PDF Report'}
            </span>
          </button>

          {onExportCsv && (
            <button 
              onClick={onExportCsv}
              className="group flex flex-col items-center gap-3 hover:opacity-80 transition-opacity"
              data-html2canvas-ignore="true"
              title="Download CSV Data"
            >
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all">
                <Download className="w-8 h-8 text-accent" />
              </div>
              <span className="text-[10px] font-black text-accent uppercase tracking-widest group-hover:opacity-80 transition-colors">CSV Data</span>
            </button>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Candidate Info */}
          <div className="bg-white report-bg-white p-8 rounded-[2rem] border border-slate-100 report-border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 report-text-slate-900">{evaluation.candidateInfo.name}</h3>
                <p className="text-slate-500 report-text-slate-500 font-medium">Extracted Profile Data</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 report-bg-slate-50 rounded-xl">
                <Mail className="w-4 h-4 text-accent report-text-accent" />
                <span className="text-sm font-medium text-slate-600 report-text-slate-600 truncate">{evaluation.candidateInfo.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 report-bg-slate-50 rounded-xl">
                <Phone className="w-4 h-4 text-accent report-text-accent" />
                <span className="text-sm font-medium text-slate-600 report-text-slate-600">{evaluation.candidateInfo.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 report-bg-slate-50 rounded-xl">
                <MapPin className="w-4 h-4 text-accent report-text-accent" />
                <span className="text-sm font-medium text-slate-600 report-text-slate-600">{evaluation.candidateInfo.location || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Job Match Analysis */}
          <div className="bg-white report-bg-white p-8 rounded-[2rem] border border-slate-100 report-border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Award className="w-5 h-5 text-accent report-text-accent" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 report-text-slate-900">Match Deep-Dive</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 report-text-slate-400 uppercase tracking-widest">Missing Key Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {evaluation.jobMatch.missingSkills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-red-50 report-bg-red-50 text-red-600 report-text-red-600 rounded-full text-xs font-bold border border-red-100">
                      {skill}
                    </span>
                  ))}
                  {evaluation.jobMatch.missingSkills.length === 0 && (
                    <span className="text-sm text-slate-400 report-text-slate-400 italic">No major skill gaps identified.</span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 report-text-slate-400 uppercase tracking-widest">Aligned Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {evaluation.jobMatch.alignedSkills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-emerald-50 report-bg-emerald-50 text-emerald-600 report-text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 report-border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 report-text-slate-400 uppercase tracking-widest">Match Recommendations</h4>
              <ul className="space-y-3">
                {evaluation.jobMatch.recommendations.map((rec, index) => (
                  <li key={index} className="flex gap-3 text-sm text-slate-600 report-text-slate-600 leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 report-text-emerald-600 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white report-bg-white p-8 rounded-[2rem] border border-slate-100 report-border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 report-bg-slate-100 rounded-lg">
                <Briefcase className="w-5 h-5 text-slate-600 report-text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 report-text-slate-900">Career Timeline</h3>
            </div>
            
            <div className="space-y-8">
              {evaluation.experience.map((exp, index) => (
                <div key={index} className="relative pl-8 before:content-[''] before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 report-bg-slate-100">
                  <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-accent report-bg-accent" />
                  <div className="space-y-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-900 report-text-slate-900">{exp.role}</h4>
                      <span className="text-xs font-bold text-slate-400 report-text-slate-400 uppercase tracking-widest">{exp.duration}</span>
                    </div>
                    <p className="text-sm font-bold text-accent report-text-accent">{exp.company}</p>
                    <p className="text-sm text-slate-500 report-text-slate-500 leading-relaxed mt-2">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Skill Radar */}
          <div className="bg-white report-bg-white p-8 rounded-[2rem] border border-slate-100 report-border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-400 report-text-slate-400 uppercase tracking-widest">Extracted Skills</h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-sm font-bold text-slate-900 report-text-slate-900">Technical</span>
                <div className="flex flex-wrap gap-2">
                  {evaluation.skills.technical.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 report-bg-slate-50 text-slate-600 report-text-slate-600 rounded text-[11px] font-medium border border-slate-100 report-border-slate-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <span className="text-sm font-bold text-slate-900 report-text-slate-900">Soft Skills</span>
                <div className="flex flex-wrap gap-2">
                  {evaluation.skills.soft.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 report-bg-slate-50 text-slate-600 report-text-slate-600 rounded text-[11px] font-medium border border-slate-100 report-border-slate-100">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resume Improvements */}
          <div className="bg-slate-900 report-bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white space-y-6">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-accent report-text-accent" />
              <h3 className="text-lg font-bold">Resume Boosters</h3>
            </div>
            <div className="space-y-4">
              {evaluation.resumeImprovements.map((tip, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 report-bg-accent-alpha flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-accent report-text-accent">{index + 1}</span>
                  </div>
                  <p className="text-xs text-slate-400 report-text-slate-400 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* AI Interview Prep Section (Not part of the PDF export for now, but part of the main UI) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-accent/5 rounded-[3rem] p-8 md:p-12 border border-accent/10 space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-accent animate-pulse" />
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Interview Prep</h2>
            </div>
            <p className="text-slate-500 font-medium">Practice with personalized questions designed for your background.</p>
          </div>
          
          {interviewQuestions.length === 0 && (
            <button
              onClick={handleGenerateQuestions}
              disabled={isGeneratingQuestions}
              className="px-8 py-4 bg-accent text-white rounded-2xl font-bold hover:bg-accent/90 transition-all flex items-center gap-3 shadow-xl shadow-accent/20 disabled:opacity-50"
            >
              {isGeneratingQuestions ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <PlayCircle className="w-5 h-5" />
              )}
              {isGeneratingQuestions ? "Analyzing Profile..." : "Generate Interview Questions"}
            </button>
          )}
        </div>

        {interviewQuestions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interviewQuestions.map((q, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-accent/10 shadow-sm space-y-4 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-wider">{q.category}</span>
                  <div className="w-px h-3 bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400">Question {i + 1}</span>
                </div>
                <p className="text-slate-900 font-bold leading-relaxed group-hover:text-accent transition-colors">"{q.question}"</p>
                <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 items-start">
                  <HelpCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recruiter's Tip</span>
                    <p className="text-xs text-slate-500 leading-relaxed italic">{q.lookFor}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {interviewQuestions.length > 0 && !isGeneratingQuestions && (
          <div className="flex justify-center pt-4">
            <button 
              onClick={handleGenerateQuestions}
              className="text-accent text-sm font-bold hover:underline underline-offset-4"
            >
              Regenerate Questions
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
