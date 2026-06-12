import React from 'react';
import { motion } from 'motion/react';
import { User, ExternalLink, Download, Star, Briefcase, Zap, Trash2 } from 'lucide-react';
import { CandidateMatch } from '../../types';
import { cn } from '../../lib/utils';

interface CandidateListProps {
  candidates: CandidateMatch[];
  onViewProfile: (candidate: CandidateMatch) => void;
  onDownload?: (candidate: CandidateMatch) => void;
  onDelete?: (candidate: CandidateMatch) => void;
}

export function CandidateList({ candidates, onViewProfile, onDownload, onDelete }: CandidateListProps) {
  if (candidates.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900">No candidates matched yet</h4>
          <p className="text-sm text-slate-400">Upload resumes to see AI-powered matching results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match Score</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Key Skills Match</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.sort((a,b) => b.score - a.score).map((candidate, idx) => (
              <motion.tr 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group hover:bg-blue-50/30 transition-colors"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{candidate.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verified Applicant</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="flex-grow w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${candidate.score}%` }}
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          candidate.score > 85 ? "bg-emerald-500" : candidate.score > 70 ? "bg-amber-500" : "bg-red-500"
                        )}
                      />
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      candidate.score > 85 ? "text-emerald-600" : candidate.score > 70 ? "text-amber-600" : "text-red-600"
                    )}>{candidate.score}%</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {candidate.skillsMatch.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100">
                        {skill}
                      </span>
                    ))}
                    {candidate.skillsMatch.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-medium">+{candidate.skillsMatch.length - 3} more</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Briefcase className="w-3 h-3" />
                    <span className="text-xs truncate max-w-[150px]">{candidate.experienceRaw}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onViewProfile(candidate)}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                      title="View AI Profile"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDownload?.(candidate)}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                      title="Download Analysis"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete?.(candidate)}
                      className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                      title="Remove Candidate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
