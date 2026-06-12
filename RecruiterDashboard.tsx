import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  FilePlus, 
  Users, 
  Target, 
  LayoutDashboard,
  Filter,
  Download,
  CheckCircle2,
  Sparkles,
  Loader2,
  BarChart3,
  MessageSquare,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Trash2
} from 'lucide-react';
import { JDUploadComponent } from './JDUploadComponent';
import { JDAnalysisCard } from './JDAnalysisCard';
import { CandidateList } from './CandidateList';
import { BackButton } from '../BackButton';
import { ConfirmationModal } from '../ConfirmationModal';
import { JDData, JDAnalysis, CandidateMatch } from '../../types';
import { exportToCsv, exportToTxt } from '../../lib/export';
import { matchCandidates } from '../../lib/recruiterGemini';
import { extractTextFromFile } from '../../lib/parser';
import { User as SupabaseUser } from '@supabase/supabase-js';

import { UserPlan, deductTokens, TOKEN_COSTS, getUserPlan } from '../../lib/tokenService';

interface RecruiterDashboardProps {
  user: SupabaseUser;
  userPlan: UserPlan | null;
  onRefreshPlan: () => void;
  onViewPricing: () => void;
}

export function RecruiterDashboard({ user, userPlan, onRefreshPlan, onViewPricing }: RecruiterDashboardProps) {
  const [jds, setJds] = useState<JDData[]>([]);
  const [selectedJd, setSelectedJd] = useState<JDData | null>(null);
  const [isAddingJD, setIsAddingJD] = useState(false);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchingStep, setMatchingStep] = useState<{ current: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recruitment' | 'insights'>('recruitment');
  const [search, setSearch] = useState('');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [analytics, setAnalytics] = useState<{
    feedback: { page_url: string; feedback_type: string; count: number }[];
    shares: { page_url: string; platform: string; count: number }[];
  } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const filteredJDs = jds
    .filter(jd => {
      const matchesSearch = jd.title.toLowerCase().includes(search.toLowerCase()) ||
        jd.analysis_json.requiredSkills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
        jd.analysis_json.experienceLevel.toLowerCase().includes(search.toLowerCase());
      
      const matchesExperience = experienceFilter === 'all' || 
        jd.analysis_json.experienceLevel.toLowerCase().includes(experienceFilter.toLowerCase());
      
      let matchesTime = true;
      if (timeFilter !== 'all') {
        const jdDate = new Date(jd.created_at);
        const now = new Date();
        const diffDays = (now.getTime() - jdDate.getTime()) / (1000 * 3600 * 24);
        if (timeFilter === '7d') matchesTime = diffDays <= 7;
        else if (timeFilter === '30d') matchesTime = diffDays <= 30;
      }

      return matchesSearch && matchesExperience && matchesTime;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  useEffect(() => {
    fetchJDs();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/docs');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    }
  };

  const handleExportJD = () => {
    if (!selectedJd) return;
    
    // Create a temporary ScorecardData-like structure for the JD and its matches
    const exportData: any[] = matches.map(match => ({
      candidateName: match.name,
      email: 'Registered Candidate',
      score: match.score,
      timestamp: new Date().toISOString(),
      evaluation: {
        skills: {
          technical: match.skillsMatch,
          soft: []
        }
      }
    }));

    if (exportData.length === 0) {
      // If no matches, export just the JD info
      const content = `Job Title: ${selectedJd.title}\nExperience Level: ${selectedJd.analysis_json.experienceLevel}\nRequired Skills: ${selectedJd.analysis_json.requiredSkills.join('; ')}`;
      exportToTxt(content, `${selectedJd.title.replace(/\s+/g, '_')}_JD`);
    } else {
      exportToCsv(exportData, `${selectedJd.title.replace(/\s+/g, '_')}_Matches`);
    }
  };

  const fetchJDs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/jds');
      if (response.ok) {
        const data = await response.json();
        setJds(data);
      }
    } catch (err) {
      console.error("Failed to fetch JDs", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJDComplete = async (analysis: JDAnalysis, content: string) => {
    const newJD: JDData = {
      id: Math.random().toString(36).substring(2, 9),
      title: analysis.title,
      content: content,
      analysis_json: analysis,
      created_at: new Date().toISOString(),
      user_id: user.id
    };

    try {
      const response = await fetch('/api/jds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJD)
      });
      
      if (response.ok) {
        setJds(prev => [newJD, ...prev]);
        setSelectedJd(newJD);
        setIsAddingJD(false);
      }
    } catch (err) {
      console.error("Persistence failed", err);
    }
  };

  const handleDeleteJD = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Job Description',
      message: 'Are you sure you want to delete this Job Description? This action cannot be undone and will remove all associated matches.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/jds/${id}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            setJds(prev => prev.filter(jd => jd.id !== id));
            if (selectedJd?.id === id) {
              setSelectedJd(null);
              setMatches([]);
            }
          } else {
            alert('Failed to delete JD. Please try again.');
          }
        } catch (err) {
          console.error("Delete failed", err);
          alert('An error occurred while deleting the JD.');
        }
      }
    });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedJd) return;

    setIsMatching(true);
    setMatchingStep({ current: 0, total: files.length });
    try {
      const texts: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setMatchingStep({ current: i + 1, total: files.length });
        const text = await extractTextFromFile(files[i]);
        if (text) texts.push(text);
      }
      
      const totalCost = TOKEN_COSTS.JD_MATCHING * texts.length;
      if (!userPlan || userPlan.tokens < totalCost) {
        alert(`Insufficient tokens. This match requires ${totalCost} tokens. You have ${userPlan?.tokens || 0}.`);
        onViewPricing();
        setIsMatching(false);
        setMatchingStep(null);
        return;
      }

      setMatchingStep({ current: files.length, total: files.length }); // Final processing step
      const newMatches = await matchCandidates(selectedJd.analysis_json, texts);
      await deductTokens(user.id, totalCost);
      onRefreshPlan();
      
      setMatches(prev => [...newMatches, ...prev]);
    } catch (err) {
      console.error("Batch match failed", err);
    } finally {
      setIsMatching(false);
      setMatchingStep(null);
    }
  };

  const handleDeleteMatch = (candidate: CandidateMatch) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Candidate',
      message: `Are you sure you want to remove ${candidate.name} from the matches?`,
      type: 'danger',
      onConfirm: () => {
        setMatches(prev => prev.filter(m => m.name !== candidate.name));
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Dashboard Top Header */}
      <div className="space-y-6">
        <BackButton />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <LayoutDashboard className="w-6 h-6 text-blue-600" />
               <div className="flex items-center gap-3">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight">Recruiter Dashboard</h2>
                 {userPlan && (
                   <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{userPlan.plan_name} Plan</span>
                     <div className="w-1 h-1 bg-blue-200 rounded-full" />
                     <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{userPlan.tokens} Tokens</span>
                   </div>
                 )}
               </div>
            </div>
            
            <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab('recruitment')}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'recruitment' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Recruitment
              </button>
              <button
                onClick={() => {
                  setActiveTab('insights');
                  fetchAnalytics();
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'insights' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Content Insights
              </button>
            </div>
          </div>
          
          {activeTab === 'recruitment' && !selectedJd && !isAddingJD && (
            <div className="w-full space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative group flex-1 min-w-[300px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600" />
                  <input 
                    type="text"
                    placeholder="Search JDs, skills, levels..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all shadow-sm"
                  />
                </div>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-4 border rounded-2xl transition-all flex items-center gap-2 font-bold text-sm ${
                    showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  {(experienceFilter !== 'all' || timeFilter !== 'all') && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>
                <button 
                  onClick={() => setIsAddingJD(true)}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Create New JD
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Experience Level</label>
                        <select 
                          value={experienceFilter}
                          onChange={(e) => setExperienceFilter(e.target.value)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option value="all">All Experience</option>
                          <option value="Entry">Entry Level</option>
                          <option value="Mid">Mid Level</option>
                          <option value="Senior">Senior Level</option>
                          <option value="Lead">Lead / Management</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Time Period</label>
                        <select 
                          value={timeFilter}
                          onChange={(e) => setTimeFilter(e.target.value)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option value="all">Any Time</option>
                          <option value="7d">Last 7 Days</option>
                          <option value="30d">Last 30 Days</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Sort By</label>
                        <select 
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="title">Job Title (A-Z)</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'insights' ? (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Positive Feedback', value: analytics?.feedback.filter(f => f.feedback_type === 'yes').reduce((acc, f) => acc + f.count, 0) || 0, icon: ThumbsUp, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Negative Feedback', value: analytics?.feedback.filter(f => f.feedback_type === 'no').reduce((acc, f) => acc + f.count, 0) || 0, icon: ThumbsDown, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Total Shares', value: analytics?.shares.reduce((acc, s) => acc + s.count, 0) || 0, icon: Share2, color: 'text-blue-600', bg: 'bg-blue-50' }
              ].map((stat, i) => (
                <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Feedback by Page */}
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-slate-400" />
                    <h3 className="font-black text-slate-900 uppercase tracking-tight">Recent Feedback</h3>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {analytics?.feedback && analytics.feedback.length > 0 ? analytics.feedback.map((item, i) => (
                    <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Globe className="w-4 h-4 text-slate-300" />
                        <span className="text-sm font-bold text-slate-600 truncate max-w-[200px]">{item.page_url}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          item.feedback_type === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.feedback_type}
                        </span>
                        <span className="text-xs font-black text-slate-900">{item.count}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="p-12 text-center text-slate-400 text-sm font-medium">No feedback yet.</div>
                  )}
                </div>
              </div>

              {/* Shares by Platform */}
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-slate-400" />
                    <h3 className="font-black text-slate-900 uppercase tracking-tight">Sharing Activity</h3>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {analytics?.shares && analytics.shares.length > 0 ? analytics.shares.map((item, i) => (
                    <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-slate-600 truncate max-w-[200px]">{item.page_url}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {item.platform}
                        </span>
                        <span className="text-xs font-black text-slate-900">{item.count}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="p-12 text-center text-slate-400 text-sm font-medium">No shares yet.</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : isAddingJD ? (
          <motion.div
            key="add-jd"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto"
          >
            <div className="mb-6">
              <BackButton onClick={() => setIsAddingJD(false)} />
            </div>
            <JDUploadComponent onAnalysisComplete={handleJDComplete} />
          </motion.div>
        ) : selectedJd ? (
          <motion.div
            key="jd-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div className="flex items-center justify-between">
              <BackButton onClick={() => { setSelectedJd(null); setMatches([]); }} />
              
              <div className="flex items-center gap-4">
                 <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" />
                  AI Matching Active
                </div>
                 <button 
                  onClick={handleExportJD}
                  className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all"
                  title="Export Data"
                 >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => handleDeleteJD(e, selectedJd.id)}
                  className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-100 transition-all"
                  title="Delete Job Description"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <JDAnalysisCard analysis={selectedJd.analysis_json} />

            {/* Candidate Matching Section */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900">Qualified Candidates</h3>
                  <p className="text-sm text-slate-500">Compare resumes against this JD using semantic AI analysis.</p>
                </div>

                <div className="flex items-center gap-4">
                  {isMatching && matchingStep && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-xs font-black text-blue-700 uppercase tracking-widest">
                        {matchingStep.current < matchingStep.total 
                          ? `Extracting ${matchingStep.current}/${matchingStep.total}`
                          : `AI Analysis...`}
                      </span>
                    </div>
                  )}
                  <label className="cursor-pointer px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                    {isMatching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <FilePlus className="w-5 h-5" />
                    )}
                    {isMatching ? "AI Matching..." : "Upload Resumes"}
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      onChange={handleResumeUpload}
                      disabled={isMatching}
                    />
                  </label>
                </div>
              </div>

              <CandidateList 
                candidates={matches} 
                onViewProfile={(c) => console.log("Viewing profile", c)} 
                onDownload={(candidate) => {
                  exportToCsv([{
                    id: 'current',
                    candidateName: candidate.name,
                    email: `Candidate matched for ${selectedJd.title}`,
                    score: candidate.score,
                    timestamp: new Date().toISOString(),
                    evaluation: {
                      skills: {
                        technical: candidate.skillsMatch,
                        soft: []
                      }
                    }
                  } as any], `Candidate_${candidate.name.replace(/\s+/g, '_')}`);
                }}
                onDelete={handleDeleteMatch}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="jd-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {jds.length === 0 ? (
              <div className="col-span-full py-24 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
                  <Plus className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900">No Job Descriptions yet</h3>
                  <p className="text-slate-500">Create your first JD to start matching top candidates.</p>
                </div>
                <button 
                  onClick={() => setIsAddingJD(true)}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold inline-flex items-center gap-2 hover:bg-blue-500 shadow-xl shadow-blue-600/20"
                >
                  Get Started
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ) : filteredJDs.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-lg">No JDs found for "{search}"</p>
                  <p className="text-slate-500 text-sm">Try using different keywords or skill names.</p>
                </div>
                <button 
                  onClick={() => setSearch('')}
                  className="text-blue-600 font-bold text-sm hover:underline"
                >
                  Clear Search
                </button>
              </div>
            ) : filteredJDs.map((jd, idx) => (
              <motion.div
                key={jd.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedJd(jd)}
                className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-blue-200 hover:shadow-blue-900/5 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                
                <div className="space-y-6 relative">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Target className="w-6 h-6" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-xl font-black text-slate-900 leading-tight truncate flex-1">{jd.title}</h4>
                      <button 
                        onClick={(e) => handleDeleteJD(e, jd.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl opacity-20 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                        title="Delete JD"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{jd.analysis_json.experienceLevel} • Post Date: {new Date(jd.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {jd.analysis_json.requiredSkills.slice(0, 3).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-bold border border-slate-100">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Users className="w-4 h-4 text-slate-400" />
                       <span className="text-xs font-bold text-slate-900">0 Matches</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 text-xs font-bold">
                       Details
                       <ArrowLeft className="w-3 h-3 rotate-180" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  );
}
