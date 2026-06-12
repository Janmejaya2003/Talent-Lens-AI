import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { DOCS_CONTENT } from '../constants/docsContent';
import { BackButton } from './BackButton';
import { ShareModal } from './ShareModal';
import { 
  ChevronRight, 
  Search, 
  BookOpen, 
  Clock, 
  Share2, 
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export function DocsPage() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const content = sectionId ? DOCS_CONTENT[sectionId] : null;

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFeedback = async (type: 'yes' | 'no') => {
    if (feedbackSubmitted || isSubmittingFeedback) return;
    
    setIsSubmittingFeedback(true);
    try {
      const payload = {
        id: Math.random().toString(36).substring(2, 9),
        page_url: window.location.pathname,
        feedback_type: type,
        created_at: new Date().toISOString()
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
        showToast("Thanks for your feedback!");
      }
    } catch (err) {
      console.error("Feedback submission failed:", err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleShareSuccess = async (platform: string) => {
    try {
      const payload = {
        id: Math.random().toString(36).substring(2, 9),
        page_url: window.location.pathname,
        platform,
        created_at: new Date().toISOString()
      };

      await fetch('/api/share-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (platform === 'copy_link') {
        showToast("Link copied successfully!");
      } else {
        showToast("Link ready to share!");
      }
      setIsShareModalOpen(false);
    } catch (err) {
      console.error("Share tracking failed:", err);
    }
  };

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Documentation not available</h2>
            <p className="text-slate-500">The section you are looking for might have been moved or doesn't exist.</p>
          </div>
          <button 
            onClick={() => navigate('/docs')}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            Return to Docs Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-12 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/20 ring-1 ring-white/10"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="font-bold text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)}
        pageTitle={content.title}
        pageUrl={window.location.href}
        onShareSuccess={handleShareSuccess}
      />

      {/* Sidebar for navigation */}
      <div className="flex">
        <aside className="hidden lg:block w-80 border-r border-slate-100 h-screen sticky top-0 bg-slate-50/50 p-8 overflow-y-auto">
          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Documentation</h3>
              {Object.values(DOCS_CONTENT).map((item) => (
                <Link
                  key={item.id}
                  to={`/docs/${item.id}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    sectionId === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${sectionId === item.id ? 'text-white' : 'text-slate-400'}`} />
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-12 lg:px-12 lg:py-16 space-y-12">
            <div className="flex justify-start">
              <BackButton fallbackPath="/docs" />
            </div>

            {/* Header & Breadcrumbs */}
            <div className="space-y-8">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Link to="/docs" className="hover:text-blue-600 transition-colors">Docs</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-slate-900">{content.title}</span>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                   <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                     <content.icon className="w-8 h-8" />
                   </div>
                   <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">{content.title}</h1>
                   <p className="text-xl text-slate-500 leading-relaxed font-medium">{content.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <Clock className="w-4 h-4" />
                  READ TIME: 5 MIN
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <BookOpen className="w-4 h-4" />
                  LEVEL: INTERMEDIATE
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-900 prose-pre:rounded-3xl prose-pre:shadow-2xl">
              <ReactMarkdown>{content.content}</ReactMarkdown>
            </div>

            {/* Feedback Footer */}
            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-1 text-center md:text-left">
                 <p className="font-bold text-slate-900">Was this page helpful?</p>
                 <p className="text-sm text-slate-500">Your feedback helps us improve our guides.</p>
              </div>
              <div className="flex items-center gap-3">
                 {feedbackSubmitted ? (
                   <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-600 rounded-xl font-bold text-sm border border-green-100"
                   >
                     <CheckCircle2 className="w-4 h-4" />
                     Thanks for your feedback!
                   </motion.div>
                 ) : (
                   <>
                     <button 
                      disabled={isSubmittingFeedback}
                      onClick={() => handleFeedback('yes')}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all border border-slate-100 disabled:opacity-50 group active:scale-95"
                     >
                       <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                       Yes
                     </button>
                     <button 
                      disabled={isSubmittingFeedback}
                      onClick={() => handleFeedback('no')}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all border border-slate-100 disabled:opacity-50 group active:scale-95"
                     >
                       <ThumbsDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                       No
                     </button>
                   </>
                 )}
                 <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all border border-slate-200 shadow-sm ml-2 active:scale-95"
                 >
                   <Share2 className="w-4 h-4" />
                   Share
                 </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
