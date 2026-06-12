import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Mail, 
  FileText, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Zap,
  LayoutDashboard
} from 'lucide-react';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { UploadZone } from './components/UploadZone';
import { AnalysisResults } from './components/AnalysisResults';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { BackButton } from './components/BackButton';
import { AIChat } from './components/AIChat';

// Recruiter Components
import { RecruiterNavbar } from './components/recruiter/RecruiterNavbar';
import { LandingRecruiter } from './components/recruiter/LandingRecruiter';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { PricingSection } from './components/recruiter/PricingSection';
import { DocsSection } from './components/recruiter/DocsSection';
import { DocsPage } from './components/DocsPage';
import { CommunityPage } from './components/CommunityPage';

import { supabase } from './lib/supabase';
import { extractTextFromFile } from './lib/parser';
import { analyzeResume } from './lib/gemini';
import { exportToPdf, exportToCsv } from './lib/export';
import { getUserPlan, deductTokens, TOKEN_COSTS } from './lib/tokenService';
import type { EvaluationResult, ScorecardData } from './types';
import type { User as SupabaseUserType, Session } from '@supabase/supabase-js';
import type { UserPlan } from './lib/tokenService';

type AppRole = 'candidate' | 'recruiter';

function getAppRole(value: unknown): AppRole | null {
  return value === 'candidate' || value === 'recruiter' ? value : null;
}

export function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [role, setRole] = useState<AppRole>(() => {
    // Check localStorage for persisted role (useful for guest users)
    return getAppRole(localStorage.getItem('userRole')) ?? 'candidate';
  });

  // Persist role changes
  useEffect(() => {
    localStorage.setItem('userRole', role);
  }, [role]);

  // Global path tracking for Back Button
  const prevPathRef = useRef(location.pathname);
  const prevRoleRef = useRef(role);

  useEffect(() => {
    // Save current path to localStorage on every change
    localStorage.setItem('currentPage', location.pathname);
    
    // Track previous state (path + role)
    const hasPathChanged = prevPathRef.current !== location.pathname;
    const hasRoleChanged = prevRoleRef.current !== role;

    if (hasPathChanged || hasRoleChanged) {
      // If we are on the landing page and role changes, we should track that as a "lastPage" 
      // even if the path is the same, so "Back" can toggle roles
      localStorage.setItem('lastPage', prevPathRef.current);
      localStorage.setItem('lastRole', prevRoleRef.current);
      
      prevPathRef.current = location.pathname;
      prevRoleRef.current = role;
    }
  }, [location.pathname, role]);

  const [user, setUser] = useState<SupabaseUserType | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  
  const [emailInput, setEmailInput] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationResult | null>(null);
  const [history, setHistory] = useState<ScorecardData[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  // Auth State Management
  useEffect(() => {
    const syncSessionState = (session: Session | null) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      const sessionRole = getAppRole(sessionUser?.user_metadata?.role);
      if (sessionRole) {
        setRole(sessionRole);
      }
    };

    const refreshPlan = async (userId: string) => {
      const plan = await getUserPlan(userId);
      setUserPlan(plan);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncSessionState(session);
      if (session?.user) {
        refreshPlan(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      syncSessionState(session);
      if (session?.user) {
        refreshPlan(session.user.id);
      } else {
        setUserPlan(null);
      }
      if (event === 'SIGNED_IN' && session) {
        setIsAuthOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Backend Integration (History)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/evaluations');
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    fetchHistory();
  }, []);

  const saveToHistory = async (evaluation: EvaluationResult) => {
    const newData: ScorecardData = {
      id: Math.random().toString(36).substring(2, 9),
      candidateName: evaluation.candidateInfo.name,
      email: evaluation.candidateInfo.email,
      score: evaluation.jobMatch.score,
      evaluation,
      timestamp: new Date().toISOString()
    };
    
    setHistory(prev => [newData, ...prev]);

    try {
      await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
    } catch (err) {
      console.error("Failed to persist analysis:", err);
    }
  };

  const handleFileAnalysis = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    
    if (!agreeTerms) {
      setError("Please agree to the terms and privacy policy.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Provide a job description to calculate your match score.");
      document.getElementById('jd-textarea')?.focus();
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      // Only check tokens for recruiters
      if (user && role === 'recruiter') {
        if (!userPlan || userPlan.tokens < TOKEN_COSTS.RESUME_ANALYSIS) {
          setError(`Insufficient tokens. This action costs ${TOKEN_COSTS.RESUME_ANALYSIS} tokens.`);
          navigate('/pricing');
          setIsLoading(false);
          return;
        }
      }

      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 50) {
        throw new Error("Resume content too small. Check your file.");
      }

      const result = await analyzeResume(text, jobDescription);
      
      // Only deduct tokens for recruiters
      if (user && role === 'recruiter') {
        await deductTokens(user.id, TOKEN_COSTS.RESUME_ANALYSIS);
        getUserPlan(user.id).then(setUserPlan);
      }

      setCurrentEvaluation(result);
      void saveToHistory(result);
      navigate('/results');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg font-sans selection:bg-accent/20">
      {role === 'recruiter' ? (
        <RecruiterNavbar 
          user={user}
          onLogout={async () => {
            await supabase.auth.signOut();
            navigate('/');
          }}
          onViewDashboard={() => navigate('/dashboard')}
          onViewHome={() => navigate('/')}
          onViewPricing={() => navigate('/pricing')}
          onViewDocs={() => navigate('/docs')}
        />
      ) : (
        <Navbar 
          user={user}
          role={role}
          onLogin={() => { setAuthType('login'); setIsAuthOpen(true); }}
          onSignup={() => { setAuthType('signup'); setIsAuthOpen(true); }}
          onLogout={async () => {
            await supabase.auth.signOut();
            navigate('/');
          }}
          onViewDashboard={() => navigate('/dashboard')}
          onViewHome={() => { setRole('candidate'); navigate('/'); }}
          onViewRecruiter={() => { setRole('recruiter'); navigate('/'); }}
          onViewPricing={() => navigate('/pricing')}
          onViewDocs={() => navigate('/docs')}
        />
      )}

      <main className="pt-18">
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
          <Routes location={location}>
            {/* Shared Routes */}
            <Route path="/docs" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DocsSection />
              </motion.div>
            } />
            
            <Route path="/docs/:sectionId" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DocsPage />
              </motion.div>
            } />

            <Route path="/community" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CommunityPage />
              </motion.div>
            } />

            <Route path="/pricing" element={
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PricingSection 
                  user={user} 
                  onPlanSelected={() => {
                    if (user) {
                      getUserPlan(user.id).then(setUserPlan);
                      navigate('/dashboard');
                    }
                  }}
                  onLoginRequest={() => { setAuthType('login'); setIsAuthOpen(true); }}
                />
              </motion.div>
            } />

            {/* Role-Specific Routes */}
            <Route path="/" element={
              role === 'recruiter' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LandingRecruiter 
                    onGetMatch={() => navigate('/dashboard')} 
                    onStartHiring={() => {
                      if (user) {
                        navigate('/dashboard');
                      } else {
                        document.getElementById('recruiter-form')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    onViewPricing={() => navigate('/pricing')}
                    onBack={() => setRole('candidate')}
                  />
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-6 py-12 md:py-24 space-y-32">
                  <Hero onStartClick={() => document.getElementById('upload-area')?.scrollIntoView({ behavior: 'smooth' })} />
                  <div id="upload-area" className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-accent/5 border border-slate-100 grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
                      <div className="md:col-span-2 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <Sparkles className="w-3 h-3" />
                          Free Report
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 leading-tight">Fast-track your <span className="text-accent underline underline-offset-8 decoration-4">application</span></h3>
                        <p className="text-sm text-slate-500 leading-relaxed">Simply paste the job description from the listing and upload your resume. We handle the rest.</p>
                      </div>

                      <div className="md:col-span-3 space-y-6">
                        <div className="space-y-4">
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                            <input 
                              type="email"
                              placeholder="Professional email address"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent text-slate-900 placeholder:text-slate-400 transition-all"
                            />
                          </div>

                          <div className="relative group">
                            <FileText className="absolute left-4 top-5 w-5 h-5 text-slate-400 group-focus-within:text-accent transition-colors" />
                            <textarea 
                              id="jd-textarea"
                              placeholder="Paste Job Description here..."
                              value={jobDescription}
                              onChange={(e) => setJobDescription(e.target.value)}
                              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent text-slate-900 placeholder:text-slate-400 min-h-[160px] resize-none text-sm leading-relaxed"
                            />
                          </div>

                          <UploadZone 
                            isLoading={isLoading} 
                            onFileSelect={handleFileAnalysis} 
                            selectedFile={selectedFile}
                          />

                          <div className="flex items-start gap-4">
                            <div className="relative flex items-center">
                              <input 
                                type="checkbox" 
                                id="terms" 
                                checked={agreeTerms}
                                onChange={(e) => {
                                  setAgreeTerms(e.target.checked);
                                  if (e.target.checked && selectedFile && jobDescription.trim()) {
                                    handleFileAnalysis(selectedFile);
                                  }
                                }}
                                className="w-5 h-5 rounded border-slate-300 bg-white text-accent focus:ring-accent cursor-pointer transition-colors"
                              />
                            </div>
                            <label htmlFor="terms" className="text-[11px] text-slate-400 leading-relaxed select-none">
                              I consent to the AI analysis of my personal data according to the <a href="#" className="text-accent hover:underline">Terms of Service</a> and <a href="#" className="text-accent hover:underline">Privacy Policy</a>.
                            </label>
                          </div>

                          <button 
                            disabled={isLoading}
                            onClick={() => {
                              if (!selectedFile) {
                                document.querySelector('input[type="file"]')?.parentElement?.click();
                                return;
                              }
                              handleFileAnalysis(selectedFile);
                            }}
                            className="w-full py-5 bg-accent text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-accent/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Processing Analysis...
                              </>
                            ) : (
                              <>
                                Generate Full Report
                                <ArrowRight className="w-6 h-6" />
                              </>
                            )}
                          </button>

                          {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
                              <AlertCircle className="w-5 h-5 shrink-0" />
                              {error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            } />

            <Route path="/results" element={
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12 flex items-center justify-between">
                  <div>
                    <BackButton className="mb-4" />
                    <h2 className="text-4xl font-black text-slate-900">Analysis Report</h2>
                  </div>
                  {user ? (
                     <button 
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 hover:bg-slate-50 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsAuthOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-accent/20 hover:scale-105 transition-all"
                    >
                      <Zap className="w-4 h-4" />
                      Save Results for Free
                    </button>
                  )}
                </div>

                {currentEvaluation && (
                  <AnalysisResults 
                    evaluation={currentEvaluation} 
                    onExport={async () => {
                      setError(null);
                      try {
                        await exportToPdf('analysis-report', `Report_${currentEvaluation?.candidateInfo?.name?.replace(/\s+/g, '_') || 'Analysis'}`);
                      } catch (err: unknown) {
                        setError(err instanceof Error ? err.message : "Export failed.");
                      }
                    }} 
                    onExportCsv={() => {
                      exportToCsv([{
                        id: 'current',
                        candidateName: currentEvaluation.candidateInfo.name,
                        email: currentEvaluation.candidateInfo.email,
                        score: currentEvaluation.jobMatch.score,
                        timestamp: new Date().toISOString(),
                        evaluation: currentEvaluation
                      }], `Data_${currentEvaluation.candidateInfo.name.replace(/\s+/g, '_')}`);
                    }}
                  />
                )}
              </motion.div>
            } />

            <Route path="/dashboard" element={
              role === 'recruiter' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-6 py-12 space-y-8">
                   {user ? (
                     <RecruiterDashboard 
                       user={user} 
                       userPlan={userPlan} 
                       onRefreshPlan={() => getUserPlan(user.id).then(setUserPlan)}
                       onViewPricing={() => navigate('/pricing')}
                     />
                   ) : (
                     <div className="py-24 text-center space-y-8 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative">
                        <div className="absolute top-12 left-12">
                          <BackButton />
                        </div>
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                          <LayoutDashboard className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-3xl font-black text-slate-900">Partner with Intelligence</h2>
                          <p className="text-slate-500 max-w-sm mx-auto">Sign in to access your recruitment console and start matching top-tier talent.</p>
                        </div>
                        <button 
                          onClick={() => setIsAuthOpen(true)}
                          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold inline-flex items-center gap-2 hover:bg-blue-500 shadow-xl shadow-blue-600/20"
                        >
                          Login to Dashboard
                          <ArrowRight className="w-5 h-5" />
                        </button>
                     </div>
                   )}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-7xl mx-auto px-6 py-12">
                  <div className="mb-12">
                     <BackButton className="mb-4" />
                     <h2 className="text-4xl font-black text-slate-900 tracking-tight">Candidate Dashboard</h2>
                  </div>
                  
                  <Dashboard 
                    history={history}
                    userPlan={userPlan}
                    onSelectItem={(id) => {
                      const item = history.find(h => h.id === id);
                      if (item) {
                         setCurrentEvaluation(item.evaluation);
                         navigate('/results');
                      }
                    }}
                    onDeleteItem={async (id) => {
                      setConfirmDialog({
                        isOpen: true,
                        title: 'Delete Analysis',
                        message: "This will permanently remove this analysis record from your history.",
                        type: 'danger',
                        onConfirm: async () => {
                          try {
                            await fetch(`/api/evaluations/${id}`, { method: 'DELETE' });
                            setHistory(prev => prev.filter(h => h.id !== id));
                          } catch (err) {
                            console.error("Delete failed:", err);
                          }
                        }
                      });
                    }}
                    onClearAll={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: 'Clear History',
                        message: "Are you absolutely sure? This will delete ALL your saved resume analyses.",
                        type: 'danger',
                        onConfirm: async () => {
                           await fetch('/api/evaluations', { method: 'DELETE' });
                           setHistory([]);
                        }
                      });
                    }}
                    onDownloadItem={(record) => {
                      exportToCsv([record], `TalentLens_Data_${record.candidateName.replace(/\s+/g, '_')}`);
                    }}
                    onExportAll={() => exportToCsv(history, 'TalentLens_FullHistory')}
                    onViewPricing={() => navigate('/pricing')}
                  />
                </motion.div>
              )
            } />
          </Routes>
          </div>
        </AnimatePresence>
      </main>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        type={authType} 
      />

      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />

      {role === 'candidate' && currentEvaluation && (
        <AIChat context={currentEvaluation} />
      )}
    </div>
  );
}
